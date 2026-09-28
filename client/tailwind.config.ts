import type { Config } from "tailwindcss";

// Avatar/post gradients come from the backend as class strings like
// "from-violet to-pink" — every combination must exist in the CSS,
// so we safelist the full product of gradient endpoints.
const gradientParts = ["violet", "violet-deep", "pink", "mint", "sun"];
const safelist = gradientParts.flatMap((a) =>
  gradientParts
    .filter((b) => b !== a)
    .flatMap((b) => [`from-${a}`, `to-${b}`])
);

export default {
  darkMode: "class",
  safelist,
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg)",
        "base-2": "var(--bg2)",
        card: "var(--card)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        line: "var(--line)",
        violet: "var(--violet)",
        "violet-deep": "var(--violet-deep)",
        pink: "var(--pink)",
        mint: "var(--mint)",
        sun: "var(--sun)",
       "my-color": "var(--my-color)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "pop-in": {
          from: { opacity: "0", transform: "translateY(16px) scale(.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s cubic-bezier(.22,1,.36,1) both",
        "fade-in": "fade-in .25s ease both",
        "pop-in": "pop-in .35s cubic-bezier(.22,1,.36,1) both",
        pop: "pop .35s cubic-bezier(.22,1,.36,1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
