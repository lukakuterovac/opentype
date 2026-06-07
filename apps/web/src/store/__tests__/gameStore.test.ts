import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_TIME_DURATION,
  DEFAULT_WORD_COUNT,
} from "@opentype/shared";
import { DEFAULT_WORDLIST } from "../../lib/wordlists";
import { useGameStore } from "../gameStore";

function resetStore(): void {
  useGameStore.setState({
    mode: "time",
    timeDuration: DEFAULT_TIME_DURATION,
    wordCount: DEFAULT_WORD_COUNT,
    wordlist: DEFAULT_WORDLIST,
  });
}

describe("useGameStore", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("initial state", () => {
    it("starts with the default mode, durations, and wordlist", () => {
      const s = useGameStore.getState();
      expect(s.mode).toBe("time");
      expect(s.timeDuration).toBe(DEFAULT_TIME_DURATION);
      expect(s.wordCount).toBe(DEFAULT_WORD_COUNT);
      expect(s.wordlist).toBe(DEFAULT_WORDLIST);
    });
  });

  describe("setMode", () => {
    it("sets the mode and switches the wordlist to the mode default", () => {
      useGameStore.getState().setMode("words");
      const s = useGameStore.getState();
      expect(s.mode).toBe("words");
      expect(s.wordlist).toBe("top-1000");
    });

    it("uses the quote default wordlist when switching to quote", () => {
      useGameStore.getState().setMode("words");
      useGameStore.getState().setMode("quote");
      const s = useGameStore.getState();
      expect(s.mode).toBe("quote");
      expect(s.wordlist).toBe("quotes");
    });

    it("uses the time default wordlist when switching back to time", () => {
      useGameStore.getState().setMode("quote");
      useGameStore.getState().setMode("time");
      const s = useGameStore.getState();
      expect(s.mode).toBe("time");
      expect(s.wordlist).toBe("top-200");
    });
  });

  describe("setTimeDuration", () => {
    it("forces the mode to 'time' and updates the wordlist default", () => {
      useGameStore.getState().setMode("words");
      useGameStore.getState().setTimeDuration(60);
      const s = useGameStore.getState();
      expect(s.mode).toBe("time");
      expect(s.timeDuration).toBe(60);
      expect(s.wordlist).toBe("top-200");
    });
  });

  describe("setWordCount", () => {
    it("forces the mode to 'words' and updates the wordlist default", () => {
      useGameStore.getState().setMode("time");
      useGameStore.getState().setWordCount(50);
      const s = useGameStore.getState();
      expect(s.mode).toBe("words");
      expect(s.wordCount).toBe(50);
      expect(s.wordlist).toBe("top-1000");
    });
  });

  describe("setWordlist", () => {
    it("updates only the wordlist field", () => {
      useGameStore.getState().setMode("time");
      useGameStore.getState().setWordlist("top-1000");
      const s = useGameStore.getState();
      expect(s.wordlist).toBe("top-1000");
      expect(s.mode).toBe("time");
    });

    it("accepts any of the known wordlist ids", () => {
      useGameStore.getState().setWordlist("quotes");
      expect(useGameStore.getState().wordlist).toBe("quotes");
      useGameStore.getState().setWordlist("top-200");
      expect(useGameStore.getState().wordlist).toBe("top-200");
      useGameStore.getState().setWordlist("top-1000");
      expect(useGameStore.getState().wordlist).toBe("top-1000");
    });
  });
});
