import { create } from "zustand";
import {
  DEFAULT_TIME_DURATION,
  DEFAULT_WORD_COUNT,
  type TestMode,
  type TimeDuration,
  type WordCount,
} from "@opentype/shared";
import {
  DEFAULT_WORDLIST,
  DEFAULT_WORDLIST_FOR_MODE,
  type WordListId,
} from "../lib/wordlists";

export interface GameStore {
  mode: TestMode;
  timeDuration: TimeDuration;
  wordCount: WordCount;
  wordlist: WordListId;
  setMode: (mode: TestMode) => void;
  setTimeDuration: (duration: TimeDuration) => void;
  setWordCount: (count: WordCount) => void;
  setWordlist: (id: WordListId) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  mode: "time",
  timeDuration: DEFAULT_TIME_DURATION,
  wordCount: DEFAULT_WORD_COUNT,
  wordlist: DEFAULT_WORDLIST,
  setMode: (mode) => set({ mode, wordlist: DEFAULT_WORDLIST_FOR_MODE[mode] }),
  setTimeDuration: (duration) =>
    set({
      mode: "time",
      timeDuration: duration,
      wordlist: DEFAULT_WORDLIST_FOR_MODE.time,
    }),
  setWordCount: (count) =>
    set({
      mode: "words",
      wordCount: count,
      wordlist: DEFAULT_WORDLIST_FOR_MODE.words,
    }),
  setWordlist: (id) => set({ wordlist: id }),
}));
