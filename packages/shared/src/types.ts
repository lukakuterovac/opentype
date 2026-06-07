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
