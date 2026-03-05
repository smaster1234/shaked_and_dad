import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        success: "var(--success)",
        card: "var(--card)",
        muted: "var(--muted)",
      },
      fontFamily: {
        sans: ["Rubik", "Segoe UI", "Tahoma", "Arial", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "timer-pulse": "timer-pulse 1s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.7s ease-out",
        "float": "float 8s ease-in-out infinite",
        "float-delay": "float 8s ease-in-out 3s infinite",
        "bounce-gentle": "bounce-gentle 2.5s ease-in-out infinite",
        "scale-in": "scale-in 0.4s ease-out",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "spin-slow": "spin 12s linear infinite",
      },
      keyframes: {
        "timer-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "33%": { transform: "translateY(-15px) rotate(2deg)" },
          "66%": { transform: "translateY(-8px) rotate(-1deg)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(230, 126, 34, 0.2), 0 0 60px rgba(230, 126, 34, 0.05)" },
          "50%": { boxShadow: "0 0 30px rgba(230, 126, 34, 0.35), 0 0 80px rgba(230, 126, 34, 0.1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
