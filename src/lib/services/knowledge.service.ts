import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { EmbeddingService } from "./embedding.service";
import { AuditService } from "./audit.service";
import {
  KnowledgeDocument,
  UploadKnowledgeInput,
  SemanticQueryInput,
  SemanticSearchResult,
} from "@/types/knowledge";

export class KnowledgeService {
  /**
    Upload a document, chunk text, generate vector embeddings, and store in database.
   */
  static async uploadDocument(userId: string, input: UploadKnowledgeInput): Promise<KnowledgeDocument> {
    const supabase = await createClient();

    // Insert Document Header
    const { data: doc, error: docErr } = await (supabase as any)
      .from("knowledge_documents")
      .insert({
        workspace_id: input.workspace_id,
        project_id: input.project_id || null,
        uploaded_by: userId,
        title: input.title,
        filename: input.filename,
        mime_type: input.mime_type || "text/plain",
        size: input.content.length,
        status: "processing",
      })
      .select()
      .single();

    if (docErr || !doc) {
      logger.error("[KnowledgeService.uploadDocument] Header insert failed", docErr, { userId, input });
      throw new Error(docErr?.message || "Failed to create document record.");
    }

    try {
      // Chunk Text
      const chunks = EmbeddingService.chunkText(input.content);

      // Generate Embeddings & Insert Chunks
      const chunkRecords = chunks.map((content, idx) => {
        const embedding = EmbeddingService.generateEmbedding(content);
        return {
          document_id: doc.id,
          chunk_index: idx,
          content,
          embedding,
          metadata: { char_length: content.length },
        };
      });

      if (chunkRecords.length > 0) {
        const { error: chunkErr } = await (supabase as any)
          .from("knowledge_chunks")
          .insert(chunkRecords);

        if (chunkErr) {
          logger.error("[KnowledgeService.uploadDocument] Chunks insert failed", chunkErr, { docId: doc.id });
        }
      }

      // Update status to indexed
      await (supabase as any)
        .from("knowledge_documents")
        .update({ status: "indexed" })
        .eq("id", doc.id);

      // Log Audit
      await AuditService.logAiAction(
        input.workspace_id,
        userId,
        "KNOWLEDGE_UPLOADED",
        { title: input.title, filename: input.filename, chunksCount: chunks.length },
        undefined,
        doc.id
      );

      await AuditService.logAiAction(
        input.workspace_id,
        userId,
        "DOCUMENT_EMBEDDED",
        { documentId: doc.id, totalChunks: chunks.length },
        undefined,
        doc.id
      );

      return { ...doc, status: "indexed" } as KnowledgeDocument;
    } catch (err: any) {
      await (supabase as any)
        .from("knowledge_documents")
        .update({ status: "error" })
        .eq("id", doc.id);
      throw err;
    }
  }

  /**
    Retrieve all knowledge documents in a workspace.
   */
  static async getDocuments(userId: string, workspaceId: string): Promise<KnowledgeDocument[]> {
    const supabase = await createClient();

    const { data: docs, error } = await (supabase as any)
      .from("knowledge_documents")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("[KnowledgeService.getDocuments] Failed to fetch documents", error, { userId, workspaceId });
      throw new Error("Failed to fetch knowledge base documents.");
    }

    return (docs as KnowledgeDocument[]) || [];
  }

  /**
    Delete a document and its chunks.
   */
  static async deleteDocument(userId: string, documentId: string): Promise<{ success: boolean }> {
    const supabase = await createClient();

    const { data: doc, error: fetchErr } = await (supabase as any)
      .from("knowledge_documents")
      .select("workspace_id, title")
      .eq("id", documentId)
      .single();

    if (fetchErr || !doc) {
      throw new Error("DOCUMENT_NOT_FOUND");
    }

    const { error } = await (supabase as any)
      .from("knowledge_documents")
      .delete()
      .eq("id", documentId);

    if (error) {
      logger.error("[KnowledgeService.deleteDocument] Delete failed", error, { userId, documentId });
      throw new Error("Failed to delete knowledge document.");
    }

    await AuditService.logAiAction(
      doc.workspace_id,
      userId,
      "KNOWLEDGE_DELETED",
      { title: doc.title },
      undefined,
      documentId
    );

    return { success: true };
  }

  /**
    Perform cosine similarity semantic search across vector chunks.
   */
  static async semanticSearch(userId: string, input: SemanticQueryInput): Promise<SemanticSearchResult[]> {
    const supabase = await createClient();
    const queryVec = EmbeddingService.generateEmbedding(input.query);

    // Fetch chunks
    let query = (supabase as any)
      .from("knowledge_chunks")
      .select("id, document_id, content, embedding, document:knowledge_documents(workspace_id, title, filename)");

    const { data: chunks, error } = await query.limit(300);

    if (error || !chunks) {
      logger.error("[KnowledgeService.semanticSearch] Query failed", error, { userId, input });
      return [];
    }

    // Filter by workspace if specified
    const filtered = input.workspace_id
      ? chunks.filter((c: any) => c.document?.workspace_id === input.workspace_id)
      : chunks;

    // Calculate similarity scores
    const scored: SemanticSearchResult[] = filtered.map((c: any) => {
      const sim = c.embedding ? EmbeddingService.cosineSimilarity(queryVec, c.embedding) : 0;
      return {
        chunk_id: c.id,
        document_id: c.document_id,
        title: c.document?.title || "Untitled",
        filename: c.document?.filename || "document.txt",
        content: c.content,
        similarity: Number(sim.toFixed(4)),
      };
    });

    // Sort by highest similarity score
    scored.sort((a, b) => b.similarity - a.similarity);
    const topResults = scored.slice(0, input.top_k || 10);

    if (input.workspace_id) {
      await AuditService.logAiAction(
        input.workspace_id,
        userId,
        "SEMANTIC_SEARCH",
        { query: input.query, resultsFound: topResults.length }
      );
    }

    return topResults;
  }

  /**
    Answer a question using RAG vector search context.
   */
  static async answerQuestion(
    userId: string,
    workspaceId: string,
    queryText: string
  ): Promise<{ answer: string; sources: SemanticSearchResult[] }> {
    const sources = await this.semanticSearch(userId, { workspace_id: workspaceId, query: queryText, top_k: 3 });

    let context = "";
    if (sources.length > 0) {
      context = sources.map((s, i) => `[Source ${i + 1}: ${s.title}]\n${s.content}`).join("\n\n");
    }

    const answer = sources.length > 0
      ? `Based on knowledge base document context:\n\n${sources[0].content}\n\nRelevance Score: ${(sources[0].similarity * 100).toFixed(1)}%`
      : `No relevant documents found in Knowledge Vault for query: "${queryText}".`;

    return { answer, sources };
  }
}
