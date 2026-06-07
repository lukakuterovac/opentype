import { useCallback, useEffect, useRef, useState } from "react";
import { ModeSelector } from "../features/game/ModeSelector";
import { ResultsScreen } from "../features/game/ResultsScreen";
import { StatsBar } from "../features/game/StatsBar";
import { TypingArea } from "../features/game/TypingArea";
import type { TestResult } from "../features/game/useTypingEngine";
import { useTypingEngine } from "../features/game/useTypingEngine";
import {
  loadWordList,
  pickRandomQuote,
  pickRandomWords,
  quoteToWords,
  WORDLIST_LABELS,
  type WordListId,
} from "../lib/wordlists";
import { useGameStore } from "../store/gameStore";
import { useSettingsStore } from "../store/settingsStore";

function prepareWords(
  wordlist: string[],
  mode: "time" | "words" | "quote",
  wordCount: number,
): { words: string[] } {
  if (mode === "quote") {
    const quote = pickRandomQuote(wordlist);
    return { words: quoteToWords(quote) };
  }
  if (mode === "words") {
    const target = Math.min(wordCount, wordlist.length);
    return { words: pickRandomWords(wordlist, target) };
  }
  return { words: wordlist.slice() };
}

const FONT_FAMILY_FALLBACK = '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace';

export function TestPage(): JSX.Element {
  const mode = useGameStore((s) => s.mode);
  const timeDuration = useGameStore((s) => s.timeDuration);
  const wordCount = useGameStore((s) => s.wordCount);
  const wordlist = useGameStore((s) => s.wordlist);

  const fontFamily = useSettingsStore((s) => s.fontFamily);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const caretStyle = useSettingsStore((s) => s.caretStyle);
  const smoothCaret = useSettingsStore((s) => s.smoothCaret);
  const showLiveWpm = useSettingsStore((s) => s.showLiveWpm);
  const showLiveAccuracy = useSettingsStore((s) => s.showLiveAccuracy);
  const showKeyboardHints = useSettingsStore((s) => s.showKeyboardHints);

  const [seed, setSeed] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<{ isLoading: boolean; error: string | null }>({
    isLoading: true,
    error: null,
  });
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadState({ isLoading: true, error: null });
    loadWordList(wordlist)
      .then((list) => {
        if (cancelled) return;
        const { words: next } = prepareWords(list, mode, wordCount);
        setWords(next);
        setLoadState({ isLoading: false, error: null });
        setResult(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadState({
          isLoading: false,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [wordlist, mode, wordCount, seed]);

  const engineDuration = mode === "time" ? timeDuration : wordCount;
  const engine = useTypingEngine({
    words,
    mode,
    duration: engineDuration,
  });

  const onComplete = useCallback((next: TestResult) => {
    setResult(next);
  }, []);
  const engineOnCompleteRef = useRef(onComplete);
  engineOnCompleteRef.current = onComplete;

  useEffect(() => {
    if (!engine.isComplete) return;
    const lastResult: TestResult = {
      grossWpm: engine.grossWpm,
      netWpm: engine.netWpm,
      accuracy: engine.accuracy,
      correctChars: engine.correctChars,
      incorrectChars: engine.incorrectChars,
      extraChars: engine.extraChars,
      missedChars: engine.missedChars,
      mode,
      duration: engineDuration,
      elapsedMs: engine.elapsedMs,
    };
    engineOnCompleteRef.current(lastResult);
  }, [
    engine.isComplete,
    engine.grossWpm,
    engine.netWpm,
    engine.accuracy,
    engine.correctChars,
    engine.incorrectChars,
    engine.extraChars,
    engine.missedChars,
    engine.elapsedMs,
    mode,
    engineDuration,
  ]);

  const inputKeyRef = useRef(engine.inputKey);
  const backspaceRef = useRef(engine.backspace);
  const resetRef = useRef(engine.reset);
  const isCompleteRef = useRef(engine.isComplete);
  inputKeyRef.current = engine.inputKey;
  backspaceRef.current = engine.backspace;
  resetRef.current = engine.reset;
  isCompleteRef.current = engine.isComplete;

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Tab" || e.key === "Escape") {
        e.preventDefault();
        resetRef.current();
        return;
      }
      if (isCompleteRef.current) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        backspaceRef.current();
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        inputKeyRef.current(e.key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleRetry = useCallback(() => {
    setResult(null);
    engine.reset();
  }, [engine]);

  const handleNext = useCallback(() => {
    setResult(null);
    setSeed((s) => s + 1);
  }, []);

  const wordlistLabel = WORDLIST_LABELS[wordlist as WordListId] ?? "top 200";
  const showTime = mode === "time";

  if (loadState.error) {
    return (
      <main className="test-page" aria-busy="false">
        <ModeSelector />
        <p className="test-status" role="alert">
          Failed to load wordlist: {loadState.error}
        </p>
      </main>
    );
  }

  if (loadState.isLoading || words.length === 0) {
    return (
      <main className="test-page" aria-busy="true">
        <ModeSelector />
        <p className="test-status">Loading wordlist&hellip;</p>
      </main>
    );
  }

  if (result) {
    return (
      <main className="test-page">
        <ResultsScreen
          result={result}
          onRetry={handleRetry}
          onNext={handleNext}
          wordlist={wordlistLabel}
          fontFamily={fontFamily || FONT_FAMILY_FALLBACK}
        />
      </main>
    );
  }

  return (
    <main className="test-page">
      <ModeSelector />
      <StatsBar
        wpm={showLiveWpm ? engine.netWpm : 0}
        accuracy={showLiveAccuracy ? engine.accuracy : 100}
        timeRemaining={showTime ? engine.timeRemaining : undefined}
      />
      <TypingArea
        words={engine.words}
        wordIndex={engine.wordIndex}
        caretStyle={caretStyle}
        smoothCaret={smoothCaret}
        fontFamily={fontFamily || FONT_FAMILY_FALLBACK}
        fontSize={fontSize}
      />
      {showKeyboardHints && (
        <div className="kbd-hints" aria-label="Keyboard hints">
          <span className="kbd-hint">tab</span>
          <span className="kbd-hint">esc</span>
        </div>
      )}
    </main>
  );
}
