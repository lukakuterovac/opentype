import type { Settings, Theme } from "@opentype/shared";
import {
  DEFAULT_CARET_STYLE,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_RANDOM_THEME,
  DEFAULT_STOP_ON_ERROR,
} from "@opentype/shared";
import { create } from "zustand";
import { useThemeStore } from "./themeStore";
import { THEMES } from "../lib/themes";
import { applyFontFamily, applyFontSize, ensureFontLoaded } from "../lib/fonts";

const SETTINGS_STORAGE_KEY = "opentype-settings";

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

export function defaultSettings(): Settings {
  return {
    activeThemeId: "default-dark",
    customThemes: [],
    randomTheme: DEFAULT_RANDOM_THEME,
    favoriteThemeIds: [],
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: DEFAULT_FONT_SIZE,
    caretStyle: DEFAULT_CARET_STYLE,
    smoothCaret: false,
    quickRestart: false,
    blindMode: false,
    showLiveWpm: true,
    showLiveAccuracy: true,
    stopOnError: DEFAULT_STOP_ON_ERROR,
    showKeyboardHints: true,
  };
}

function isTheme(value: unknown): value is Theme {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj["id"] !== "string") return false;
  if (typeof obj["name"] !== "string") return false;
  if (typeof obj["dark"] !== "boolean") return false;
  if (typeof obj["colors"] !== "object" || obj["colors"] === null) return false;
  return true;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

export function readStoredSettings(): Settings {
  const json = safeGetItem(SETTINGS_STORAGE_KEY);
  const defaults = defaultSettings();
  if (!json) return defaults;
  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return defaults;
    const obj = parsed as Record<string, unknown>;
    const customThemes = Array.isArray(obj["customThemes"])
      ? (obj["customThemes"].filter(isTheme) as Theme[])
      : defaults.customThemes;
    const favoriteThemeIds = isStringArray(obj["favoriteThemeIds"])
      ? obj["favoriteThemeIds"]
      : defaults.favoriteThemeIds;
    return {
      ...defaults,
      ...obj,
      customThemes,
      favoriteThemeIds,
    };
  } catch {
    return defaults;
  }
}

export interface SettingsStore extends Settings {
  setActiveThemeId: (id: string) => void;
  setRandomTheme: (mode: Settings["randomTheme"]) => void;
  toggleFavoriteTheme: (id: string) => void;
  saveCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (id: string) => void;
  setFontFamily: (family: string) => void;
  setFontSize: (size: string) => void;
  setCaretStyle: (style: Settings["caretStyle"]) => void;
  setSmoothCaret: (on: boolean) => void;
  setQuickRestart: (on: boolean) => void;
  setBlindMode: (on: boolean) => void;
  setShowLiveWpm: (on: boolean) => void;
  setShowLiveAccuracy: (on: boolean) => void;
  setStopOnError: (mode: Settings["stopOnError"]) => void;
  setShowKeyboardHints: (on: boolean) => void;
  applyRandomTheme: () => void;
}

function persistSettings(state: Settings): void {
  safeSetItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
}

function getPlainSettings(state: SettingsStore): Settings {
  return {
    activeThemeId: state.activeThemeId,
    customThemes: state.customThemes,
    randomTheme: state.randomTheme,
    favoriteThemeIds: state.favoriteThemeIds,
    fontFamily: state.fontFamily,
    fontSize: state.fontSize,
    caretStyle: state.caretStyle,
    smoothCaret: state.smoothCaret,
    quickRestart: state.quickRestart,
    blindMode: state.blindMode,
    showLiveWpm: state.showLiveWpm,
    showLiveAccuracy: state.showLiveAccuracy,
    stopOnError: state.stopOnError,
    showKeyboardHints: state.showKeyboardHints,
  };
}

export const useSettingsStore = create<SettingsStore>((set, get) => {
  function updateAndPersist(partial: Partial<Settings>): void {
    const next: SettingsStore = { ...get(), ...partial };
    set(partial);
    persistSettings(getPlainSettings(next));
  }

  function pickRandomThemeId(themeIds: string[]): string | null {
    if (themeIds.length === 0) return null;
    const idx = Math.floor(Math.random() * themeIds.length);
    return themeIds[idx] ?? null;
  }

  return {
    ...defaultSettings(),

    setActiveThemeId: (id) => {
      useThemeStore.getState().setTheme(id);
      updateAndPersist({ activeThemeId: id });
    },

    setRandomTheme: (mode) => updateAndPersist({ randomTheme: mode }),

    toggleFavoriteTheme: (id) => {
      const current = get().favoriteThemeIds;
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      updateAndPersist({ favoriteThemeIds: next });
    },

    saveCustomTheme: (theme) => {
      useThemeStore.getState().saveCustomTheme(theme);
      const current = get().customThemes;
      const idx = current.findIndex((t) => t.id === theme.id);
      const next =
        idx >= 0
          ? current.map((t, i) => (i === idx ? theme : t))
          : [...current, theme];
      updateAndPersist({ customThemes: next });
    },

    deleteCustomTheme: (id) => {
      useThemeStore.getState().deleteCustomTheme(id);
      const next = get().customThemes.filter((t) => t.id !== id);
      const favoriteNext = get().favoriteThemeIds.filter((x) => x !== id);
      updateAndPersist({ customThemes: next, favoriteThemeIds: favoriteNext });
    },

    setFontFamily: (family) => {
      ensureFontLoaded(family);
      applyFontFamily(family);
      updateAndPersist({ fontFamily: family });
    },

    setFontSize: (size) => {
      applyFontSize(size);
      updateAndPersist({ fontSize: size });
    },

    setCaretStyle: (style) => updateAndPersist({ caretStyle: style }),
    setSmoothCaret: (on) => updateAndPersist({ smoothCaret: on }),

    setQuickRestart: (on) => updateAndPersist({ quickRestart: on }),
    setBlindMode: (on) => updateAndPersist({ blindMode: on }),
    setShowLiveWpm: (on) => updateAndPersist({ showLiveWpm: on }),
    setShowLiveAccuracy: (on) => updateAndPersist({ showLiveAccuracy: on }),
    setStopOnError: (mode) => updateAndPersist({ stopOnError: mode }),
    setShowKeyboardHints: (on) => updateAndPersist({ showKeyboardHints: on }),

    applyRandomTheme: () => {
      const state = get();
      if (state.randomTheme === "off") return;
      let candidates: string[];
      if (state.randomTheme === "favorites") {
        candidates = state.favoriteThemeIds.length > 0
          ? state.favoriteThemeIds
          : THEMES.map((t) => t.id);
      } else {
        candidates = [
          ...THEMES.map((t) => t.id),
          ...state.customThemes.map((t) => t.id),
        ];
      }
      candidates = candidates.filter((id) => id !== state.activeThemeId);
      if (candidates.length === 0) {
        candidates = [
          ...THEMES.map((t) => t.id),
          ...state.customThemes.map((t) => t.id),
        ];
      }
      const next = pickRandomThemeId(candidates);
      if (next) get().setActiveThemeId(next);
    },
  };
});

export function initializeSettings(): void {
  const storedJson = safeGetItem(SETTINGS_STORAGE_KEY);
  const themeState = useThemeStore.getState();
  let settings: Settings;

  if (storedJson === null) {
    settings = {
      ...defaultSettings(),
      activeThemeId: themeState.activeThemeId,
      customThemes: themeState.customThemes,
    };
    safeSetItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } else {
    settings = readStoredSettings();
    for (const theme of settings.customThemes) {
      if (!themeState.customThemes.some((t) => t.id === theme.id)) {
        themeState.saveCustomTheme(theme);
      }
    }
  }

  useSettingsStore.setState(settings);
  ensureFontLoaded(settings.fontFamily);
  applyFontFamily(settings.fontFamily);
  applyFontSize(settings.fontSize);
}
