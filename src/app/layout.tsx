import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Antigravity AI OS — Your Complete AI Workspace",
  description:
    "Create, organize, and automate your work with intelligent AI agents in one beautiful, Apple-quality dark workspace.",
  keywords: [
    "AI workspace",
    "Antigravity",
    "AI agents",
    "developer tools",
    "code sandbox",
    "prompt engineering",
    "multi-agent swarm",
    "Next.js",
  ],
  authors: [{ name: "Antigravity AI Team" }],
  openGraph: {
    title: "Antigravity AI OS — Your Complete AI Workspace",
    description:
      "Create, organize, and automate your work with intelligent AI agents in one beautiful workspace.",
    url: "https://antigravity.ai",
    siteName: "Antigravity AI Workspace",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Antigravity AI OS",
    description:
      "Create, organize, and automate your work with intelligent AI agents in one beautiful workspace.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark scroll-smooth`}>
      <body className="bg-background text-white antialiased selection:bg-primary selection:text-white">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
