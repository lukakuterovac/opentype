export const TEST_MODES = ["time", "words", "quote"] as const;
export type TestMode = (typeof TEST_MODES)[number];

export const TIME_DURATIONS = [15, 30, 60, 120] as const;
export type TimeDuration = (typeof TIME_DURATIONS)[number];

export const WORD_COUNTS = [10, 25, 50, 100] as const;
export type WordCount = (typeof WORD_COUNTS)[number];

export const DEFAULT_TIME_DURATION: TimeDuration = 30;
export const DEFAULT_WORD_COUNT: WordCount = 25;
