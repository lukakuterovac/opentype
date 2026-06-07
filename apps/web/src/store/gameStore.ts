import { create } from "zustand";
import {
  DEFAULT_TIME_DURATION,
  DEFAULT_WORD_COUNT,
  type TestMode,
  type TimeDuration,
  type WordCount,
} from "@opentype/shared";

export interface GameStore {
  mode: TestMode;
  timeDuration: TimeDuration;
  wordCount: WordCount;
  setMode: (mode: TestMode) => void;
  setTimeDuration: (duration: TimeDuration) => void;
  setWordCount: (count: WordCount) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  mode: "time",
  timeDuration: DEFAULT_TIME_DURATION,
  wordCount: DEFAULT_WORD_COUNT,
  setMode: (mode) => set({ mode }),
  setTimeDuration: (duration) => set({ mode: "time", timeDuration: duration }),
  setWordCount: (count) => set({ mode: "words", wordCount: count }),
}));
