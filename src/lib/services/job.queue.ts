import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { BackgroundJob, CreateJobInput, JobLog } from "@/types/job";

export class JobQueueService {
  /**
    Enqueues a new background job in `background_jobs`.
   */
  static async enqueueJob(userId: string, input: CreateJobInput): Promise<BackgroundJob> {
    const supabase = await createClient();

    const { data: job, error } = await (supabase as any)
      .from("background_jobs")
      .insert({
        workspace_id: input.workspace_id,
        job_type: input.job_type,
        payload: input.payload || {},
        status: "queued",
        max_attempts: input.max_attempts || 3,
      })
      .select()
      .single();

    if (error || !job) {
      logger.error("[JobQueueService.enqueueJob] Enqueue failed", error, { userId, input });
      throw new Error("Failed to enqueue background job.");
    }

    // Insert log
    await (supabase as any).from("job_logs").insert({
      job_id: job.id,
      log_level: "info",
      message: `Job ${job.job_type} enqueued successfully`,
    });

    return job as BackgroundJob;
  }

  /**
    List background jobs for a workspace.
   */
  static async getJobs(userId: string, workspaceId: string): Promise<BackgroundJob[]> {
    const supabase = await createClient();

    const { data: jobs, error } = await (supabase as any)
      .from("background_jobs")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("[JobQueueService.getJobs] Fetch failed", error, { userId, workspaceId });
      throw new Error("Failed to fetch background jobs.");
    }

    return (jobs as BackgroundJob[]) || [];
  }

  /**
    Executes a queued job worker processing run.
   */
  static async processJob(jobId: string): Promise<BackgroundJob> {
    const supabase = await createClient();

    const { data: job, error: fetchErr } = await (supabase as any)
      .from("background_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (fetchErr || !job) {
      throw new Error("Job not found.");
    }

    // Mark as processing
    await (supabase as any)
      .from("background_jobs")
      .update({
        status: "processing",
        started_at: new Date().toISOString(),
        attempts: (job.attempts || 0) + 1,
      })
      .eq("id", jobId);

    try {
      // Execute background processing
      logger.info(`[JobQueueWorker] Executing job ${job.job_type} (${job.id})`);

      // Mark completed
      const { data: completedJob } = await (supabase as any)
        .from("background_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId)
        .select()
        .single();

      await (supabase as any).from("job_logs").insert({
        job_id: jobId,
        log_level: "info",
        message: `Job ${job.job_type} completed successfully`,
      });

      return completedJob as BackgroundJob;
    } catch (err: any) {
      const isDLQ = (job.attempts || 0) + 1 >= job.max_attempts;
      const status = isDLQ ? "failed" : "queued";

      const { data: failedJob } = await (supabase as any)
        .from("background_jobs")
        .update({
          status,
          error: err?.message || "Job execution failed",
        })
        .eq("id", jobId)
        .select()
        .single();

      await (supabase as any).from("job_logs").insert({
        job_id: jobId,
        log_level: "error",
        message: `Job ${job.job_type} failed: ${err?.message}`,
      });

      return failedJob as BackgroundJob;
    }
  }
}
