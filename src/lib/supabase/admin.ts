import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { getSupabaseUrl, getSupabaseServiceKey } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * Supabase Admin Client
 * Uses SUPABASE_SERVICE_ROLE_KEY to perform elevated admin tasks on the server.
 * CAUTION: Only use in server-only routes / backend actions. Never expose to client!
 */
export function createAdminClient() {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  if (!serviceKey) {
    logger.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Admin client operating in restricted mode.");
  }

  return createClient<Database>(
    supabaseUrl,
    serviceKey || "placeholder-service-key",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
