import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTypingEngine } from "../useTypingEngine";
import type { TestResult } from "../useTypingEngine";

function typeChars(
  result: { current: { inputKey: (k: string) => void } },
  chars: string,
): void {
  for (const ch of chars) {
    act(() => {
      result.current.inputKey(ch);
    });
  }
}

describe("useTypingEngine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("starts with empty input on the first word and is inactive", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello", "world"], mode: "words", duration: 2 }),
      );

      expect(result.current.input).toBe("");
      expect(result.current.wordIndex).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.elapsedMs).toBe(0);
      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.accuracy).toBe(100);
      expect(result.current.grossWpm).toBe(0);
      expect(result.current.netWpm).toBe(0);
    });

    it("marks the first word as active and the rest as unreached", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["one", "two", "three"], mode: "words", duration: 1 }),
      );

      expect(result.current.words).toHaveLength(3);
      expect(result.current.words[0]?.status).toBe("active");
      expect(result.current.words[1]?.status).toBe("unreached");
      expect(result.current.words[2]?.status).toBe("unreached");
    });
  });

  describe("character classification", () => {
    it("classifies a correct character as 'correct'", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hi"], mode: "words", duration: 1 }),
      );

      act(() => {
        result.current.inputKey("h");
      });

      expect(result.current.input).toBe("h");
      expect(result.current.words[0]?.chars[0]?.status).toBe("correct");
      expect(result.current.words[0]?.chars[0]?.typed).toBe("h");
    });

    it("classifies an incorrect character as 'incorrect'", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hi"], mode: "words", duration: 1 }),
      );

      act(() => {
        result.current.inputKey("x");
      });

      expect(result.current.words[0]?.chars[0]?.status).toBe("incorrect");
      expect(result.current.words[0]?.chars[0]?.typed).toBe("x");
    });

    it("classifies characters typed past the word length as extra (incorrect)", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hi", "def"], mode: "words", duration: 1 }),
      );

      typeChars(result, "hid");

      expect(result.current.input).toBe("hid");
      expect(result.current.words[0]?.chars).toHaveLength(3);
      expect(result.current.words[0]?.chars[0]?.status).toBe("correct");
      expect(result.current.words[0]?.chars[1]?.status).toBe("correct");
      expect(result.current.words[0]?.chars[2]?.status).toBe("incorrect");
      expect(result.current.words[0]?.chars[2]?.target).toBe("");
      expect(result.current.words[0]?.chars[2]?.typed).toBe("d");
      expect(result.current.extraChars).toBe(1);
    });

    it("leaves unreached characters as 'untyped'", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello"], mode: "words", duration: 1 }),
      );

      act(() => {
        result.current.inputKey("h");
      });

      expect(result.current.words[0]?.chars[0]?.status).toBe("correct");
      expect(result.current.words[0]?.chars[1]?.status).toBe("untyped");
      expect(result.current.words[0]?.chars[1]?.typed).toBeNull();
    });
  });

  describe("word progression", () => {
    it("ignores a leading space", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hi"], mode: "words", duration: 1 }),
      );

      act(() => {
        result.current.inputKey(" ");
      });

      expect(result.current.input).toBe("");
      expect(result.current.wordIndex).toBe(0);
    });

    it("advances to the next word on space when input is non-empty", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hi", "there"], mode: "words", duration: 1 }),
      );

      typeChars(result, "hi");

      act(() => {
        result.current.inputKey(" ");
      });

      expect(result.current.wordIndex).toBe(1);
      expect(result.current.input).toBe("");
      expect(result.current.words[0]?.status).toBe("completed");
      expect(result.current.words[1]?.status).toBe("active");
    });

    it("counts missed characters in completed words", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello", "world"], mode: "words", duration: 1 }),
      );

      typeChars(result, "hel");

      act(() => {
        result.current.inputKey(" ");
      });

      expect(result.current.wordIndex).toBe(1);
      expect(result.current.missedChars).toBe(2);
    });
  });

  describe("backspace", () => {
    it("removes the last character of the current word", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello"], mode: "words", duration: 1 }),
      );

      typeChars(result, "hi");

      act(() => {
        result.current.backspace();
      });

      expect(result.current.input).toBe("h");
    });

    it("is a no-op at the start of a word (does not delete into the previous word)", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hi", "bye"], mode: "words", duration: 1 }),
      );

      typeChars(result, "hi");

      act(() => {
        result.current.inputKey(" ");
      });

      expect(result.current.wordIndex).toBe(1);
      expect(result.current.input).toBe("");

      act(() => {
        result.current.backspace();
      });

      expect(result.current.wordIndex).toBe(1);
      expect(result.current.input).toBe("");
      expect(result.current.words[0]?.status).toBe("completed");
    });
  });

  describe("test completion", () => {
    it("auto-finishes when the last character of the last word is typed (words mode)", () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello"], mode: "words", duration: 1, onComplete }),
      );

      typeChars(result, "hello");

      expect(result.current.isComplete).toBe(true);
      expect(result.current.wordIndex).toBe(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("finishes when the user presses space on the last word (words mode)", () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello"], mode: "words", duration: 1, onComplete }),
      );

      typeChars(result, "hello");
      act(() => {
        result.current.inputKey(" ");
      });

      expect(result.current.isComplete).toBe(true);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("ignores input once the test is complete", () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello", "world"], mode: "words", duration: 1, onComplete }),
      );

      typeChars(result, "hello");
      act(() => {
        result.current.inputKey(" ");
      });
      typeChars(result, "world");
      expect(result.current.isComplete).toBe(true);

      act(() => {
        result.current.inputKey("x");
      });
      act(() => {
        result.current.backspace();
      });

      // Second word remains "world" — rejected input did not mutate it
      const word1Typed = result.current.words[1]?.chars.map((c) => c.typed ?? "").join("");
      expect(word1Typed).toBe("world");
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("finishes when the timer runs out in time mode", () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello"], mode: "time", duration: 2, onComplete }),
      );

      act(() => {
        result.current.inputKey("h");
      });

      expect(result.current.isActive).toBe(true);

      act(() => {
        vi.advanceTimersByTime(2_100);
      });

      expect(result.current.isComplete).toBe(true);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("counts untyped characters in the active word as missed when time runs out", () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello"], mode: "time", duration: 2, onComplete }),
      );

      act(() => {
        result.current.inputKey("h");
      });
      act(() => {
        result.current.inputKey("e");
      });

      act(() => {
        vi.advanceTimersByTime(2_100);
      });

      expect(result.current.isComplete).toBe(true);
      expect(result.current.correctChars).toBe(2);
      expect(result.current.missedChars).toBe(3);
      expect(result.current.words[0]?.status).toBe("completed");
    });

    it("passes a result to onComplete with the expected shape", () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello"], mode: "words", duration: 1, onComplete }),
      );

      typeChars(result, "hello");

      const call = onComplete.mock.calls[0];
      expect(call).toBeDefined();
      const resultArg = call?.[0] as TestResult;
      expect(resultArg).toMatchObject({
        correctChars: 5,
        incorrectChars: 0,
        extraChars: 0,
        missedChars: 0,
        mode: "words",
        duration: 1,
      });
      expect(resultArg.grossWpm).toBeGreaterThanOrEqual(0);
      expect(resultArg.netWpm).toBeGreaterThanOrEqual(0);
      expect(resultArg.accuracy).toBe(100);
    });
  });

  describe("stats", () => {
    it("starts the test on the first keystroke", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello"], mode: "words", duration: 1 }),
      );

      act(() => {
        result.current.inputKey("h");
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.elapsedMs).toBeGreaterThanOrEqual(0);
    });

    it("computes 100% accuracy when every character is correct", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["abc"], mode: "words", duration: 1 }),
      );

      typeChars(result, "abc");

      expect(result.current.accuracy).toBe(100);
      expect(result.current.correctChars).toBe(3);
      expect(result.current.incorrectChars).toBe(0);
    });

    it("computes accuracy as correct / (correct + incorrect + extra) * 100", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["abc"], mode: "words", duration: 1 }),
      );

      typeChars(result, "axc");

      expect(result.current.correctChars).toBe(2);
      expect(result.current.incorrectChars).toBe(1);
      expect(result.current.accuracy).toBeCloseTo((2 / 3) * 100, 5);
    });

    it("computes gross WPM as totalTyped / 5 / minutes", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello"], mode: "words", duration: 1 }),
      );

      typeChars(result, "abc");

      act(() => {
        vi.advanceTimersByTime(1_000);
      });

      // 3 chars over 1 second: 3 / 5 / (1/60) = 36
      expect(result.current.grossWpm).toBeCloseTo(36, 5);
    });

    it("reduces net WPM by error count", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["abc", "def"], mode: "words", duration: 1 }),
      );

      typeChars(result, "axc");

      act(() => {
        vi.advanceTimersByTime(1_000);
      });

      // 3 chars (1 error) over 1 second:
      // gross = 36, net = 36 - 1 / (1/60) = 36 - 60 = -24
      expect(result.current.grossWpm).toBeCloseTo(36, 5);
      expect(result.current.netWpm).toBeCloseTo(-24, 5);
    });

    it("caps elapsedMs to the configured duration in time mode", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["abc"], mode: "time", duration: 1 }),
      );

      act(() => {
        result.current.inputKey("a");
      });

      act(() => {
        vi.advanceTimersByTime(5_000);
      });

      expect(result.current.elapsedMs).toBe(1_000);
      expect(result.current.timeRemaining).toBe(0);
    });
  });

  describe("reset", () => {
    it("returns the engine to its initial state", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["abc", "def"], mode: "words", duration: 1 }),
      );

      typeChars(result, "ab");
      act(() => {
        result.current.inputKey(" ");
      });
      typeChars(result, "d");

      act(() => {
        result.current.reset();
      });

      expect(result.current.input).toBe("");
      expect(result.current.wordIndex).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.elapsedMs).toBe(0);
      expect(result.current.words[0]?.status).toBe("active");
      expect(result.current.words[1]?.status).toBe("unreached");
    });

    it("allows a new test to be started after reset", () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["hello"], mode: "words", duration: 1, onComplete }),
      );

      typeChars(result, "hello");
      expect(result.current.isComplete).toBe(true);
      expect(onComplete).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.reset();
      });

      typeChars(result, "hello");
      expect(result.current.isComplete).toBe(true);
      expect(onComplete).toHaveBeenCalledTimes(2);
    });
  });

  describe("time remaining", () => {
    it("is 0 in non-time modes", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["abc"], mode: "words", duration: 5 }),
      );

      act(() => {
        result.current.inputKey("a");
      });

      expect(result.current.timeRemaining).toBe(0);
    });

    it("counts down in time mode", () => {
      const { result } = renderHook(() =>
        useTypingEngine({ words: ["abc"], mode: "time", duration: 10 }),
      );

      act(() => {
        result.current.inputKey("a");
      });

      act(() => {
        vi.advanceTimersByTime(3_000);
      });

      expect(result.current.timeRemaining).toBe(7);
    });
  });
});
