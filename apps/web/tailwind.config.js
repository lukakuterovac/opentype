/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        "bg-base": "var(--bg-base)",
        "bg-surface": "var(--bg-surface)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-border": "var(--bg-border)",
        "bg-border-strong": "var(--bg-border-strong)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-faint": "var(--text-faint)",
        "text-ghost": "var(--text-ghost)",
        "char-correct": "var(--char-correct)",
        "char-incorrect": "var(--char-incorrect)",
        "char-untyped": "var(--char-untyped)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
      },
    },
  },
  plugins: [],
};
