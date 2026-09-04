import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080C14",
        secondary: "#0B111C",
        panel: "#0F1722",
        elevated: "#131C29",
        border: "#1D2938",
        primary: "#E7EDF5",
        mutedText: "#8A97A8",
        mutedBg: "#526071",
        // Severities
        critical: "#EF4444",
        high: "#F97316",
        suspicious: "#FACC15",
        normal: "#10B981",
        info: "#3B82F6",
      },
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        sans: ['var(--font-inter)', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
