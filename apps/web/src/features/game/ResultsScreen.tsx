import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import type { TestResult } from "./useTypingEngine";

export interface ResultsScreenProps {
  result: TestResult;
  onRetry: () => void;
  onNext: () => void;
  wordlist?: string;
  isPersonalBest?: boolean;
  fontFamily?: string;
}

interface SecondaryStat {
  key: string;
  value: string;
  label: string;
}

const COUNT_UP_DURATION_S = 0.8;
const SECONDARY_STATS_DELAY_S = 0.4;
const CHAR_BREAKDOWN_DELAY_S = 0.5;
const MODE_TAG_DELAY_S = 0.6;
const ACTIONS_DELAY_S = 0.8;
const FADE_DURATION_S = 0.3;

const DEFAULT_WORDLIST = "top 200";
const DEFAULT_FONT_FAMILY =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace';

function buildSecondaryStats(result: TestResult): SecondaryStat[] {
  const totalChars =
    result.correctChars + result.incorrectChars + result.extraChars;
  return [
    {
      key: "gross",
      value: `${Math.max(0, Math.round(result.grossWpm))}`,
      label: "gross",
    },
    {
      key: "acc",
      value: `${Math.max(0, Math.round(result.accuracy))}%`,
      label: "acc",
    },
    {
      key: "chars",
      value: `${Math.max(0, totalChars)}`,
      label: "characters",
    },
  ];
}

function buildModeTag(result: TestResult, wordlist: string): string {
  if (result.mode === "time") {
    return `${result.duration}s · ${wordlist}`;
  }
  if (result.mode === "words") {
    return `${result.duration} · ${wordlist}`;
  }
  return `quote · ${wordlist}`;
}

export function ResultsScreen({
  result,
  onRetry,
  onNext,
  wordlist = DEFAULT_WORDLIST,
  isPersonalBest = false,
  fontFamily = DEFAULT_FONT_FAMILY,
}: ResultsScreenProps): JSX.Element {
  const stats = buildSecondaryStats(result);
  const modeTag = buildModeTag(result, wordlist);
  const targetWpm = Math.max(0, result.netWpm);

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, targetWpm, {
      duration: COUNT_UP_DURATION_S,
      ease: "easeOut",
    });
    return () => {
      controls.stop();
    };
  }, [count, targetWpm]);

  return (
    <div className="results-screen" role="dialog" aria-label="Test results">
      {isPersonalBest && (
        <div className="results-personal-best">new personal best</div>
      )}

      <div className="results-wpm-row">
        <motion.span
          className="results-wpm-number"
          style={{ fontFamily }}
          aria-label={`Net WPM ${Math.round(targetWpm)}`}
        >
          {rounded}
        </motion.span>
        <div className="results-wpm-label">wpm</div>
      </div>

      <motion.div
        className="results-secondary-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: SECONDARY_STATS_DELAY_S,
          duration: FADE_DURATION_S,
        }}
      >
        {stats.map((stat, i) => (
          <div key={stat.key} className="stats-bar-item">
            {i > 0 && (
              <span className="stats-bar-divider" aria-hidden="true" />
            )}
            <div className="stat">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="results-char-breakdown"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: CHAR_BREAKDOWN_DELAY_S, duration: FADE_DURATION_S }}
      >
        {result.correctChars} correct · {result.incorrectChars} incorrect ·{" "}
        {result.extraChars} extra · {result.missedChars} missed
      </motion.div>

      <motion.div
        className="results-mode-tag"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: MODE_TAG_DELAY_S, duration: FADE_DURATION_S }}
      >
        {modeTag}
      </motion.div>

      <motion.div
        className="results-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: ACTIONS_DELAY_S, duration: FADE_DURATION_S }}
      >
        <button
          type="button"
          className="results-button"
          onClick={onRetry}
          aria-label="Retry with same words"
        >
          retry
        </button>
        <button
          type="button"
          className="results-button"
          onClick={onNext}
          aria-label="Start next test with new words"
        >
          next test
        </button>
      </motion.div>
    </div>
  );
}
