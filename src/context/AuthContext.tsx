"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: "email" | "google" | "github" | "magic-link";
  createdAt: string;
}

export interface AuthErrorDetails {
  message: string;
  code?: string | number;
  status?: number;
  fullResponse?: any;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  errorDetails?: AuthErrorDetails;
  requiresConfirmation?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<AuthResponse>;
  signInWithGithub: () => Promise<AuthResponse>;
  signInWithEmail: (email: string, password?: string, rememberMe?: boolean) => Promise<AuthResponse>;
  sendMagicLink: (email: string) => Promise<AuthResponse>;
  signUp: (name: string, email: string, password?: string) => Promise<AuthResponse>;
  sendForgotPassword: (email: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_COOKIE_NAME = "antigravity_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const setCookie = (name: string, value: string, days: number) => {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  };

  const deleteCookie = (name: string) => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  };

  const formatSupabaseUser = (sbUser: SupabaseUser): User => {
    const meta = sbUser.user_metadata || {};
    const nameFromEmail = sbUser.email ? sbUser.email.split("@")[0] : "User";
    return {
      id: sbUser.id,
      name: meta.full_name || meta.name || nameFromEmail,
      email: sbUser.email || "",
      avatar:
        meta.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sbUser.email || "dev")}`,
      provider: (sbUser.app_metadata?.provider as any) || "email",
      createdAt: sbUser.created_at,
    };
  };

  useEffect(() => {
    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const formatted = formatSupabaseUser(session.user);
          setUser(formatted);
          setCookie(AUTH_COOKIE_NAME, "true", 7);
        } else {
          setUser(null);
          deleteCookie(AUTH_COOKIE_NAME);
        }
      } catch (e) {
        console.error("[Supabase Auth] Init Exception:", e);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const formatted = formatSupabaseUser(session.user);
        setUser(formatted);
        setCookie(AUTH_COOKIE_NAME, "true", 7);
      } else {
        setUser(null);
        deleteCookie(AUTH_COOKIE_NAME);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        console.error("[Supabase Auth] Google OAuth Error:", error);
        setLoading(false);
        return {
          success: false,
          error: error.message,
          errorDetails: {
            message: error.message,
            code: (error as any).code || (error as any).status || "GOOGLE_OAUTH_ERROR",
            status: (error as any).status,
            fullResponse: error,
          },
        };
      }

      return { success: true };
    } catch (err: any) {
      console.error("[Supabase Auth] Google OAuth Exception:", err);
      setLoading(false);
      return {
        success: false,
        error: err?.message || "Failed to initiate Google OAuth",
        errorDetails: {
          message: err?.message || "Failed to initiate Google OAuth",
          fullResponse: err,
        },
      };
    }
  };

  const signInWithGithub = async (): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        console.error("[Supabase Auth] GitHub OAuth Error:", error);
        setLoading(false);
        return {
          success: false,
          error: error.message,
          errorDetails: {
            message: error.message,
            code: (error as any).code || (error as any).status || "GITHUB_OAUTH_ERROR",
            status: (error as any).status,
            fullResponse: error,
          },
        };
      }

      return { success: true };
    } catch (err: any) {
      console.error("[Supabase Auth] GitHub OAuth Exception:", err);
      setLoading(false);
      return {
        success: false,
        error: err?.message || "Failed to initiate GitHub OAuth",
        errorDetails: {
          message: err?.message || "Failed to initiate GitHub OAuth",
          fullResponse: err,
        },
      };
    }
  };

  const signInWithEmail = async (
    email: string,
    password?: string,
    rememberMe = true
  ): Promise<AuthResponse> => {
    setLoading(true);

    if (!password) {
      setLoading(false);
      return {
        success: false,
        error: "Password is required for email login.",
        errorDetails: { message: "Password is required for email login." },
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("[Supabase Auth] SignIn Error:", error);
        setLoading(false);
        return {
          success: false,
          error: error.message,
          errorDetails: {
            message: error.message,
            code: (error as any).code || (error as any).status || "SIGNIN_ERROR",
            status: (error as any).status,
            fullResponse: error,
          },
        };
      }

      if (data.user && data.session) {
        const formatted = formatSupabaseUser(data.user);
        setUser(formatted);
        setCookie(AUTH_COOKIE_NAME, "true", rememberMe ? 30 : 1);
        setLoading(false);
        router.push("/dashboard");
        return { success: true };
      }

      setLoading(false);
      return {
        success: false,
        error: "Unable to establish user session.",
        errorDetails: { message: "Unable to establish user session." },
      };
    } catch (err: any) {
      console.error("[Supabase Auth] SignIn Exception:", err);
      setLoading(false);
      return {
        success: false,
        error: err?.message || "An unexpected error occurred during login.",
        errorDetails: { message: err?.message || "An unexpected error occurred during login.", fullResponse: err },
      };
    }
  };

  const sendMagicLink = async (email: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        console.error("[Supabase Auth] Magic Link Error:", error);
        setLoading(false);
        return {
          success: false,
          error: error.message,
          errorDetails: {
            message: error.message,
            code: (error as any).code || (error as any).status || "MAGIC_LINK_ERROR",
            status: (error as any).status,
            fullResponse: error,
          },
        };
      }

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error("[Supabase Auth] Magic Link Exception:", err);
      setLoading(false);
      return {
        success: false,
        error: err?.message || "Failed to send Magic Link.",
        errorDetails: { message: err?.message || "Failed to send Magic Link.", fullResponse: err },
      };
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password?: string
  ): Promise<AuthResponse> => {
    setLoading(true);

    if (!password) {
      setLoading(false);
      return {
        success: false,
        error: "Password is required for registration.",
        errorDetails: { message: "Password is required for registration." },
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        // Log the complete raw error object to browser console
        console.error("[Supabase Auth] SignUp Error:", error);
        setLoading(false);
        return {
          success: false,
          error: error.message,
          errorDetails: {
            message: error.message,
            code: (error as any).code || (error as any).status || "SIGNUP_ERROR",
            status: (error as any).status,
            fullResponse: error,
          },
        };
      }

      if (data.user) {
        if (!data.session) {
          setLoading(false);
          return {
            success: true,
            requiresConfirmation: true,
          };
        }

        const formatted = formatSupabaseUser(data.user);
        setUser(formatted);
        setCookie(AUTH_COOKIE_NAME, "true", 7);
        setLoading(false);
        router.push("/dashboard");
        return { success: true };
      }

      setLoading(false);
      return {
        success: false,
        error: "Failed to create user account.",
        errorDetails: { message: "Failed to create user account." },
      };
    } catch (err: any) {
      console.error("[Supabase Auth] SignUp Exception:", err);
      setLoading(false);
      return {
        success: false,
        error: err?.message || "An unexpected error occurred during signup.",
        errorDetails: { message: err?.message || "An unexpected error occurred during signup.", fullResponse: err },
      };
    }
  };

  const sendForgotPassword = async (email: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        console.error("[Supabase Auth] Reset Password Error:", error);
        setLoading(false);
        return {
          success: false,
          error: error.message,
          errorDetails: {
            message: error.message,
            code: (error as any).code || (error as any).status || "RESET_ERROR",
            status: (error as any).status,
            fullResponse: error,
          },
        };
      }

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error("[Supabase Auth] Reset Password Exception:", err);
      setLoading(false);
      return {
        success: false,
        error: err?.message || "Failed to dispatch reset email.",
        errorDetails: { message: err?.message || "Failed to dispatch reset email.", fullResponse: err },
      };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[Supabase Auth] SignOut Error:", err);
    }
    setUser(null);
    deleteCookie(AUTH_COOKIE_NAME);
    setLoading(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        sendMagicLink,
        signUp,
        sendForgotPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
