import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/env";

export function createClient() {
  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  );
}
