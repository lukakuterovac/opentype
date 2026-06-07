import type { TestMode, TimeDuration, WordCount } from "@opentype/shared";
import { TIME_DURATIONS, WORD_COUNTS } from "@opentype/shared";
import { useGameStore } from "../../store/gameStore";

interface GroupSpec {
  separator: boolean;
  pills: PillSpec[];
}

interface PillSpec {
  key: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function buildGroups(
  mode: TestMode,
  timeDuration: TimeDuration,
  wordCount: WordCount,
  setMode: (mode: TestMode) => void,
  setTimeDuration: (duration: TimeDuration) => void,
  setWordCount: (count: WordCount) => void,
): GroupSpec[] {
  const timePills: PillSpec[] = [
    {
      key: "mode-time",
      label: "time",
      isActive: mode === "time",
      onClick: () => setMode("time"),
    },
    ...TIME_DURATIONS.map<PillSpec>((duration) => ({
      key: `time-${duration}`,
      label: `${duration}`,
      isActive: mode === "time" && timeDuration === duration,
      onClick: () => setTimeDuration(duration),
    })),
  ];

  const wordsPills: PillSpec[] = [
    {
      key: "mode-words",
      label: "words",
      isActive: mode === "words",
      onClick: () => setMode("words"),
    },
    ...WORD_COUNTS.map<PillSpec>((count) => ({
      key: `words-${count}`,
      label: `${count}`,
      isActive: mode === "words" && wordCount === count,
      onClick: () => setWordCount(count),
    })),
  ];

  const quotePills: PillSpec[] = [
    {
      key: "mode-quote",
      label: "quote",
      isActive: mode === "quote",
      onClick: () => setMode("quote"),
    },
  ];

  return [
    { separator: false, pills: timePills },
    { separator: true, pills: wordsPills },
    { separator: true, pills: quotePills },
  ];
}

export function ModeSelector(): JSX.Element {
  const mode = useGameStore((s) => s.mode);
  const timeDuration = useGameStore((s) => s.timeDuration);
  const wordCount = useGameStore((s) => s.wordCount);
  const setMode = useGameStore((s) => s.setMode);
  const setTimeDuration = useGameStore((s) => s.setTimeDuration);
  const setWordCount = useGameStore((s) => s.setWordCount);

  const groups = buildGroups(
    mode,
    timeDuration,
    wordCount,
    setMode,
    setTimeDuration,
    setWordCount,
  );

  return (
    <div className="mode-selector" role="group" aria-label="Test mode">
      {groups.map((group, gi) => (
        <div key={gi} className="mode-selector-group">
          {group.separator && <span className="mode-selector-separator" aria-hidden="true" />}
          {group.pills.map((pill) => (
            <button
              key={pill.key}
              type="button"
              className={`mode-pill${pill.isActive ? " active" : ""}`}
              onClick={pill.onClick}
              aria-pressed={pill.isActive}
            >
              {pill.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
