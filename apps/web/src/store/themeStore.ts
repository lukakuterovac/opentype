import type { Theme } from "@opentype/shared";
import { create } from "zustand";
import { applyTheme, resolveTheme } from "../lib/theme";
import { DEFAULT_THEME_ID } from "../lib/themes";

const THEME_STORAGE_KEY = "opentype-theme";
const CUSTOM_THEMES_STORAGE_KEY = "opentype-custom-themes";

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function readCustomThemes(): Theme[] {
  const json = safeGetItem(CUSTOM_THEMES_STORAGE_KEY);
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed as Theme[];
  } catch {
    return [];
  }
}

export interface ThemeStore {
  activeThemeId: string;
  customThemes: Theme[];
  setTheme: (themeId: string) => void;
  saveCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (themeId: string) => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  activeThemeId: DEFAULT_THEME_ID,
  customThemes: [],
  setTheme: (themeId) => {
    const { customThemes } = get();
    const theme = resolveTheme(themeId, customThemes);
    if (!theme) return;
    applyTheme(theme);
    safeSetItem(THEME_STORAGE_KEY, themeId);
    set({ activeThemeId: themeId });
  },
  saveCustomTheme: (theme) => {
    const { customThemes } = get();
    const existingIndex = customThemes.findIndex((t) => t.id === theme.id);
    const next =
      existingIndex >= 0
        ? customThemes.map((t, i) => (i === existingIndex ? theme : t))
        : [...customThemes, theme];
    safeSetItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(next));
    set({ customThemes: next });
  },
  deleteCustomTheme: (themeId) => {
    const { customThemes, activeThemeId } = get();
    const next = customThemes.filter((t) => t.id !== themeId);
    safeSetItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(next));
    set({ customThemes: next });
    if (activeThemeId === themeId) {
      get().setTheme(DEFAULT_THEME_ID);
    }
  },
}));

export function initializeTheme(): void {
  const customThemes = readCustomThemes();
  const storedId = safeGetItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID;
  const theme = resolveTheme(storedId, customThemes);
  if (!theme) return;
  applyTheme(theme);
  useThemeStore.setState({ activeThemeId: theme.id, customThemes });
}
