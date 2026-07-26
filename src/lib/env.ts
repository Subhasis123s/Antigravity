/**
 * Environment Variables Validation & Configuration Helper
 * Ensures Supabase credentials and application URLs are validated cleanly.
 */

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes("placeholder-project")) {
    return "https://placeholder-project.supabase.co";
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key || key.includes("placeholder-anon-key")) {
    return "placeholder-anon-key";
  }
  return key;
}

export function getSupabaseServiceKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key.includes("your-supabase-service-role-key")) {
    return null;
  }
  return key;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return !!(
    url &&
    key &&
    !url.includes("placeholder-project") &&
    !key.includes("placeholder-anon-key")
  );
}
