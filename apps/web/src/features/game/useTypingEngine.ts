import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type TestMode = "time" | "words" | "quote";

export type CharStatus = "untyped" | "correct" | "incorrect";
export type WordStatus = "unreached" | "active" | "completed";

export interface CharState {
  status: CharStatus;
  typed: string | null;
  target: string;
}

export interface WordState {
  target: string;
  status: WordStatus;
  chars: CharState[];
}

export interface TestResult {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  mode: TestMode;
  duration: number;
  elapsedMs: number;
}

export interface UseTypingEngineOptions {
  words: string[];
  mode: TestMode;
  duration: number;
  onComplete?: (result: TestResult) => void;
}

export interface UseTypingEngineReturn {
  words: WordState[];
  input: string;
  wordIndex: number;
  isActive: boolean;
  isComplete: boolean;
  timeRemaining: number;
  elapsedMs: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  inputKey: (key: string) => void;
  backspace: () => void;
  reset: () => void;
}

const TICK_INTERVAL_MS = 100;
const SECONDS_TO_MS = 1000;
const MS_PER_MINUTE = 60_000;

function deriveWordState(
  target: string,
  input: string,
  status: WordStatus,
): WordState {
  const chars: CharState[] = [];
  const maxLen = Math.max(target.length, input.length);
  for (let i = 0; i < maxLen; i += 1) {
    const t = target[i];
    const c = input[i];
    if (c === undefined) {
      chars.push({ status: "untyped", typed: null, target: t ?? "" });
    } else if (t === undefined) {
      chars.push({ status: "incorrect", typed: c, target: "" });
    } else if (c === t) {
      chars.push({ status: "correct", typed: c, target: t });
    } else {
      chars.push({ status: "incorrect", typed: c, target: t });
    }
  }
  return { target, status, chars };
}

function buildWordStates(
  targets: readonly string[],
  inputs: readonly string[],
  activeIndex: number,
  forceCompleteActive: boolean,
): WordState[] {
  return targets.map((target, i) => {
    let status: WordStatus;
    if (i < activeIndex) status = "completed";
    else if (i === activeIndex) status = forceCompleteActive ? "completed" : "active";
    else status = "unreached";
    return deriveWordState(target, inputs[i] ?? "", status);
  });
}

function computeCharStats(wordStates: readonly WordState[]): {
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
} {
  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let missedChars = 0;
  for (const word of wordStates) {
    for (const ch of word.chars) {
      if (ch.typed !== null && ch.target === "") {
        extraChars += 1;
      } else if (ch.status === "correct") {
        correctChars += 1;
      } else if (ch.status === "incorrect") {
        incorrectChars += 1;
      } else if (ch.status === "untyped" && word.status === "completed") {
        missedChars += 1;
      }
    }
  }
  return { correctChars, incorrectChars, extraChars, missedChars };
}

function computeWpm(
  totalTyped: number,
  errors: number,
  elapsedMs: number,
): { grossWpm: number; netWpm: number } {
  const minutes = elapsedMs / MS_PER_MINUTE;
  if (minutes <= 0) {
    return { grossWpm: 0, netWpm: 0 };
  }
  const grossWpm = totalTyped / 5 / minutes;
  const netWpm = grossWpm - errors / minutes;
  return { grossWpm, netWpm };
}

export function useTypingEngine(options: UseTypingEngineOptions): UseTypingEngineReturn {
  const { words: targetWords, mode, duration, onComplete } = options;

  const [inputs, setInputs] = useState<string[]>(() => targetWords.map(() => ""));
  const [wordIndex, setWordIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const isCompleteRef = useRef(false);
  const resultFiredRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  const finishTest = useCallback(() => {
    if (isCompleteRef.current) return;
    isCompleteRef.current = true;
    const start = startTimeRef.current;
    const finalElapsed = start !== null ? performance.now() - start : 0;
    setElapsedMs(finalElapsed);
    setIsComplete(true);
  }, []);

  useEffect(() => {
    setInputs(targetWords.map(() => ""));
    setWordIndex(0);
    setIsActive(false);
    setIsComplete(false);
    setElapsedMs(0);
    startTimeRef.current = null;
    isCompleteRef.current = false;
    resultFiredRef.current = false;
  }, [targetWords]);

  useEffect(() => {
    if (!isActive || isComplete) return;

    const interval = setInterval(() => {
      const start = startTimeRef.current;
      if (start === null) return;
      const now = performance.now();
      const elapsed = now - start;
      setElapsedMs(elapsed);

      if (mode === "time" && elapsed >= duration * SECONDS_TO_MS) {
        finishTest();
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isActive, isComplete, mode, duration, finishTest]);

  const startIfNeeded = useCallback(() => {
    if (startTimeRef.current === null && !isCompleteRef.current) {
      startTimeRef.current = performance.now();
      setIsActive(true);
    }
  }, []);

  const inputKey = useCallback(
    (key: string) => {
      if (isCompleteRef.current) return;
      const wi = wordIndex;
      if (wi >= targetWords.length) return;

      startIfNeeded();

      if (key === " ") {
        const currentInput = inputs[wi] ?? "";
        if (currentInput.length === 0) return;

        const nextIndex = wi + 1;
        setWordIndex(nextIndex);

        if (nextIndex >= targetWords.length) {
          finishTest();
        }
        return;
      }

      const target = targetWords[wi] ?? "";
      const currentInput = inputs[wi] ?? "";
      const newInput = currentInput + key;

      setInputs((prev) => {
        const next = prev.slice();
        next[wi] = (next[wi] ?? "") + key;
        return next;
      });

      if (wi === targetWords.length - 1 && newInput.length >= target.length) {
        setWordIndex(targetWords.length);
        finishTest();
      }
    },
    [wordIndex, inputs, targetWords, startIfNeeded, finishTest],
  );

  const backspace = useCallback(() => {
    if (isCompleteRef.current) return;
    const wi = wordIndex;
    if (wi >= targetWords.length) return;

    const currentInput = inputs[wi] ?? "";
    if (currentInput.length === 0) return;

    setInputs((prev) => {
      const next = prev.slice();
      next[wi] = currentInput.slice(0, -1);
      return next;
    });
  }, [wordIndex, inputs, targetWords]);

  const reset = useCallback(() => {
    setInputs(targetWords.map(() => ""));
    setWordIndex(0);
    setIsActive(false);
    setIsComplete(false);
    setElapsedMs(0);
    startTimeRef.current = null;
    isCompleteRef.current = false;
    resultFiredRef.current = false;
  }, [targetWords]);

  const forceCompleteActive = isComplete && mode === "time";
  const wordStates = useMemo(
    () => buildWordStates(targetWords, inputs, wordIndex, forceCompleteActive),
    [targetWords, inputs, wordIndex, forceCompleteActive],
  );

  const stats = useMemo(() => computeCharStats(wordStates), [wordStates]);

  const totalTyped = stats.correctChars + stats.incorrectChars + stats.extraChars;
  const errors = stats.incorrectChars + stats.extraChars + stats.missedChars;

  const cappedElapsedMs =
    mode === "time" ? Math.min(elapsedMs, duration * SECONDS_TO_MS) : elapsedMs;

  const wpm = useMemo(
    () => computeWpm(totalTyped, errors, cappedElapsedMs),
    [totalTyped, errors, cappedElapsedMs],
  );

  const accuracy = totalTyped === 0 ? 100 : (stats.correctChars / totalTyped) * 100;

  const timeRemaining =
    mode === "time"
      ? Math.max(0, duration * SECONDS_TO_MS - elapsedMs) / SECONDS_TO_MS
      : 0;

  useEffect(() => {
    if (!isComplete) return;
    if (resultFiredRef.current) return;
    resultFiredRef.current = true;

    onCompleteRef.current?.({
      grossWpm: wpm.grossWpm,
      netWpm: wpm.netWpm,
      accuracy,
      correctChars: stats.correctChars,
      incorrectChars: stats.incorrectChars,
      extraChars: stats.extraChars,
      missedChars: stats.missedChars,
      mode,
      duration,
      elapsedMs: cappedElapsedMs,
    });
  }, [
    isComplete,
    wpm.grossWpm,
    wpm.netWpm,
    accuracy,
    stats,
    mode,
    duration,
    cappedElapsedMs,
  ]);

  return {
    words: wordStates,
    input: inputs[wordIndex] ?? "",
    wordIndex,
    isActive,
    isComplete,
    timeRemaining,
    elapsedMs: cappedElapsedMs,
    correctChars: stats.correctChars,
    incorrectChars: stats.incorrectChars,
    extraChars: stats.extraChars,
    missedChars: stats.missedChars,
    grossWpm: wpm.grossWpm,
    netWpm: wpm.netWpm,
    accuracy,
    inputKey,
    backspace,
    reset,
  };
}
