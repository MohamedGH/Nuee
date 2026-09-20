import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bone: "#F1EDE4",
        ink: "#1C1A16",
        "ink-soft": "#4A473F",
        brick: "#7A2E1D",
        "brick-dark": "#5C2115",
        muted: "#6B6456",
        line: "#DAD3C4",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-archivo)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        tag: "0.18em",
      },
    },
  },
  plugins: [],
};

export default config;
