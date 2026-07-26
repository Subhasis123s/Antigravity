import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0C",
        surface: {
          DEFAULT: "#151518",
          hover: "#1C1C21",
          subtle: "#111114",
        },
        primary: {
          DEFAULT: "#6E56CF",
          hover: "#7C66DC",
          light: "#9E8CFC",
        },
        secondary: {
          DEFAULT: "#8B5CF6",
          hover: "#9F7AEA",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          bright: "rgba(255, 255, 255, 0.16)",
          accent: "rgba(110, 86, 207, 0.4)",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#9CA3AF",
          muted: "#6B7280",
        },
        success: "#22C55E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
        glow: "0 0 40px -10px rgba(110, 86, 207, 0.4)",
        "glow-lg": "0 0 80px -20px rgba(139, 92, 246, 0.5)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        "glow-spin": "glowSpin 10s linear infinite",
        shimmer: "shimmer 2.5s infinite linear",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        glowSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "primary-gradient": "linear-gradient(135deg, #6E56CF 0%, #8B5CF6 100%)",
        "accent-glow":
          "radial-gradient(circle at center, rgba(110, 86, 207, 0.15) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};
export default config;
