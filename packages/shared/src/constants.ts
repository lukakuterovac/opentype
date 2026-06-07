export const TEST_MODES = ["time", "words", "quote"] as const;
export type TestMode = (typeof TEST_MODES)[number];

export const TIME_DURATIONS = [15, 30, 60, 120] as const;
export type TimeDuration = (typeof TIME_DURATIONS)[number];

export const WORD_COUNTS = [10, 25, 50, 100] as const;
export type WordCount = (typeof WORD_COUNTS)[number];

export const DEFAULT_TIME_DURATION: TimeDuration = 30;
export const DEFAULT_WORD_COUNT: WordCount = 25;

export const FONT_FAMILIES = [
  "JetBrains Mono",
  "Fira Code",
  "Source Code Pro",
  "Roboto Mono",
  "Inconsolata",
] as const;
export type FontFamily = (typeof FONT_FAMILIES)[number];
export const DEFAULT_FONT_FAMILY: FontFamily = "JetBrains Mono";

export const FONT_SIZES = ["14px", "16px", "19px", "22px", "26px"] as const;
export type FontSize = (typeof FONT_SIZES)[number];
export const DEFAULT_FONT_SIZE: FontSize = "19px";

export const CARET_STYLES = ["line", "block", "underline", "off"] as const;
export type CaretStyle = (typeof CARET_STYLES)[number];
export const DEFAULT_CARET_STYLE: CaretStyle = "line";

export const STOP_ON_ERROR_OPTIONS = ["off", "word", "letter"] as const;
export type StopOnError = (typeof STOP_ON_ERROR_OPTIONS)[number];
export const DEFAULT_STOP_ON_ERROR: StopOnError = "off";

export const RANDOM_THEME_OPTIONS = ["off", "all", "favorites"] as const;
export type RandomTheme = (typeof RANDOM_THEME_OPTIONS)[number];
export const DEFAULT_RANDOM_THEME: RandomTheme = "off";
