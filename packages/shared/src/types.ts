export interface Result {
  id: string;
  wpm: number;
  accuracy: number;
  mode: "time" | "words" | "quote";
  duration: number;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface Theme {
  id: string;
  name: string;
  dark: boolean;
  colors: {
    "--bg-base": string;
    "--bg-surface": string;
    "--bg-elevated": string;
    "--bg-border": string;
    "--bg-border-strong": string;
    "--text-primary": string;
    "--text-secondary": string;
    "--text-muted": string;
    "--text-faint": string;
    "--text-ghost": string;
    "--char-correct": string;
    "--char-incorrect": string;
    "--char-untyped": string;
    "--accent": string;
    "--accent-dim": string;
  };
}
