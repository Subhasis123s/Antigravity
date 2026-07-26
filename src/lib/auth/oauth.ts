import { Provider } from "@supabase/supabase-js";

export type SupportedOAuthProvider = "google" | "github" | "azure" | "apple" | "discord";

export interface OAuthProviderConfig {
  id: SupportedOAuthProvider;
  name: string;
  supabaseProvider: Provider;
  icon: string;
  enabled: boolean;
}

export const OAUTH_PROVIDERS: Record<SupportedOAuthProvider, OAuthProviderConfig> = {
  google: {
    id: "google",
    name: "Google",
    supabaseProvider: "google",
    icon: "google",
    enabled: true,
  },
  github: {
    id: "github",
    name: "GitHub",
    supabaseProvider: "github",
    icon: "github",
    enabled: true,
  },
  azure: {
    id: "azure",
    name: "Microsoft",
    supabaseProvider: "azure",
    icon: "microsoft",
    enabled: true,
  },
  apple: {
    id: "apple",
    name: "Apple",
    supabaseProvider: "apple",
    icon: "apple",
    enabled: true,
  },
  discord: {
    id: "discord",
    name: "Discord",
    supabaseProvider: "discord",
    icon: "discord",
    enabled: true,
  },
};

export function getOAuthRedirectUrl(provider: SupportedOAuthProvider, origin: string): string {
  return `${origin}/api/auth/callback?provider=${provider}`;
}
