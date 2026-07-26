export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          language: string;
          timezone: string;
          theme: string;
          notification_preferences: Json;
          provider: string | null;
          role: string | null;
          last_login: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          language?: string;
          timezone?: string;
          theme?: string;
          notification_preferences?: Json;
          provider?: string | null;
          role?: string | null;
          last_login?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          language?: string;
          timezone?: string;
          theme?: string;
          notification_preferences?: Json;
          provider?: string | null;
          role?: string | null;
          last_login?: string;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          plan: string;
          owner_id: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan?: string;
          owner_id: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          plan?: string;
          settings?: Json;
          updated_at?: string;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: WorkspaceRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: WorkspaceRole;
          created_at?: string;
        };
        Update: {
          role?: WorkspaceRole;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          language: string;
          timezone: string;
          email_notifications: boolean;
          push_notifications: boolean;
          marketing_emails: boolean;
          auto_save: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: string;
          language?: string;
          timezone?: string;
          email_notifications?: boolean;
          push_notifications?: boolean;
          marketing_emails?: boolean;
          auto_save?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          theme?: string;
          language?: string;
          timezone?: string;
          email_notifications?: boolean;
          push_notifications?: boolean;
          marketing_emails?: boolean;
          auto_save?: boolean;
          updated_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string;
          ip_address: string | null;
          user_agent: string | null;
          device_type: string;
          is_active: boolean;
          last_active_at: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token: string;
          ip_address?: string | null;
          user_agent?: string | null;
          device_type?: string;
          is_active?: boolean;
          last_active_at?: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          is_active?: boolean;
          last_active_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          workspace_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          workspace_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          action?: string;
          details?: Json;
        };
      };
      projects: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          tech_stack: string | null;
          branch: string;
          status: string;
          assigned_agents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          tech_stack?: string | null;
          branch?: string;
          status?: string;
          assigned_agents?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          tech_stack?: string | null;
          branch?: string;
          status?: string;
          assigned_agents?: number;
          updated_at?: string;
        };
      };
      agents: {
        Row: {
          id: string;
          workspace_id: string;
          role: string;
          model: string;
          status: string;
          tasks_completed: number;
          latency_ms: number;
          memory_used_pct: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          role: string;
          model?: string;
          status?: string;
          tasks_completed?: number;
          latency_ms?: number;
          memory_used_pct?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: string;
          model?: string;
          status?: string;
          tasks_completed?: number;
          latency_ms?: number;
          memory_used_pct?: number;
          updated_at?: string;
        };
      };
      prompts: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          category: string;
          version: string;
          snippet: string;
          benchmark_score: string;
          model_recommendation: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          title: string;
          category?: string;
          version?: string;
          snippet: string;
          benchmark_score?: string;
          model_recommendation?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          category?: string;
          version?: string;
          snippet?: string;
          benchmark_score?: string;
          model_recommendation?: string;
          updated_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          prefix: string;
          key_hash: string;
          last_used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          prefix?: string;
          key_hash: string;
          last_used_at?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          last_used_at?: string | null;
        };
      };
    };
  };
}
