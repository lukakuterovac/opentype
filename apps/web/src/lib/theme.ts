import type { Theme } from "@opentype/shared";
import { DEFAULT_THEME_ID, THEMES } from "./themes";

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([variable, value]) => {
    root.style.setProperty(variable, value);
  });
}

export function resolveTheme(
  themeId: string,
  customThemes: Theme[] = [],
): Theme | undefined {
  return (
    THEMES.find((t) => t.id === themeId) ??
    customThemes.find((t) => t.id === themeId) ??
    THEMES.find((t) => t.id === DEFAULT_THEME_ID)
  );
}
