"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: "email" | "google" | "github" | "magic-link";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password?: string, rememberMe?: boolean) => Promise<boolean>;
  sendMagicLink: (email: string) => Promise<boolean>;
  signUp: (name: string, email: string, password?: string) => Promise<boolean>;
  sendForgotPassword: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_COOKIE_NAME = "antigravity_session";
const AUTH_STORAGE_KEY = "antigravity_user_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setCookie(AUTH_COOKIE_NAME, "true", 7);
      }
    } catch (e) {
      console.error("Failed to load user session", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const setCookie = (name: string, value: string, days: number) => {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  };

  const deleteCookie = (name: string) => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  };

  const persistSession = (userData: User, remember: boolean = true) => {
    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    setCookie(AUTH_COOKIE_NAME, "true", remember ? 30 : 1);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    // Simulated Google OAuth login
    await new Promise((res) => setTimeout(res, 800));
    const mockUser: User = {
      id: "usr_google_" + Math.random().toString(36).substring(2, 9),
      name: "Alex Dev",
      email: "alex.dev@gmail.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      provider: "google",
      createdAt: new Date().toISOString(),
    };
    persistSession(mockUser);
    setLoading(false);
    router.push("/dashboard");
  };

  const signInWithGithub = async () => {
    setLoading(true);
    // Simulated GitHub OAuth login
    await new Promise((res) => setTimeout(res, 800));
    const mockUser: User = {
      id: "usr_github_" + Math.random().toString(36).substring(2, 9),
      name: "Alex Developer",
      email: "alex@github.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      provider: "github",
      createdAt: new Date().toISOString(),
    };
    persistSession(mockUser);
    setLoading(false);
    router.push("/dashboard");
  };

  const signInWithEmail = async (email: string, password?: string, rememberMe = true): Promise<boolean> => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 600));
    const nameFromEmail = email.split("@")[0].replace(".", " ");
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    const mockUser: User = {
      id: "usr_email_" + Math.random().toString(36).substring(2, 9),
      name: formattedName || "Workspace Member",
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      provider: "email",
      createdAt: new Date().toISOString(),
    };
    persistSession(mockUser, rememberMe);
    setLoading(false);
    router.push("/dashboard");
    return true;
  };

  const sendMagicLink = async (email: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 700));
    return true;
  };

  const signUp = async (name: string, email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 800));
    const mockUser: User = {
      id: "usr_new_" + Math.random().toString(36).substring(2, 9),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      provider: "email",
      createdAt: new Date().toISOString(),
    };
    persistSession(mockUser, true);
    setLoading(false);
    router.push("/dashboard");
    return true;
  };

  const sendForgotPassword = async (email: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 600));
    return true;
  };

  const signOut = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 300));
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
