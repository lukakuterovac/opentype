import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Theme } from "@opentype/shared";
import {
  defaultSettings,
  readStoredSettings,
  useSettingsStore,
} from "../settingsStore";
import { useThemeStore } from "../themeStore";

const STORAGE_KEY = "opentype-settings";

function makeTheme(overrides: Partial<Theme> = {}): Theme {
  return {
    id: "custom-test",
    name: "Test Theme",
    dark: true,
    colors: {
      "--bg-base": "#111111",
      "--bg-surface": "#222222",
      "--bg-elevated": "#333333",
      "--bg-border": "#1a1a1a",
      "--bg-border-strong": "#444444",
      "--text-primary": "#ffffff",
      "--text-secondary": "#cccccc",
      "--text-muted": "#888888",
      "--text-faint": "#666666",
      "--text-ghost": "#444444",
      "--char-correct": "#ffffff",
      "--char-incorrect": "#ff0000",
      "--char-untyped": "#444444",
      "--accent": "#0066ff",
      "--accent-dim": "#003366",
    },
    ...overrides,
  };
}

function resetStores(): void {
  useSettingsStore.setState(defaultSettings());
  useThemeStore.setState({
    activeThemeId: "default-dark",
    customThemes: [],
    setTheme: useThemeStore.getState().setTheme,
    saveCustomTheme: useThemeStore.getState().saveCustomTheme,
    deleteCustomTheme: useThemeStore.getState().deleteCustomTheme,
  });
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("opentype-theme");
  localStorage.removeItem("opentype-custom-themes");
}

describe("settingsStore", () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    resetStores();
  });

  describe("defaults", () => {
    it("returns sane defaults from defaultSettings()", () => {
      const d = defaultSettings();
      expect(d.activeThemeId).toBe("default-dark");
      expect(d.customThemes).toEqual([]);
      expect(d.randomTheme).toBe("off");
      expect(d.favoriteThemeIds).toEqual([]);
      expect(d.fontFamily).toBe("JetBrains Mono");
      expect(d.fontSize).toBe("19px");
      expect(d.caretStyle).toBe("line");
      expect(d.smoothCaret).toBe(false);
      expect(d.quickRestart).toBe(false);
      expect(d.blindMode).toBe(false);
      expect(d.showLiveWpm).toBe(true);
      expect(d.showLiveAccuracy).toBe(true);
      expect(d.stopOnError).toBe("off");
      expect(d.showKeyboardHints).toBe(true);
    });
  });

  describe("theme setters", () => {
    it("setActiveThemeId updates the state and applies via themeStore", () => {
      act(() => {
        useSettingsStore.getState().setActiveThemeId("serika-dark");
      });
      expect(useSettingsStore.getState().activeThemeId).toBe("serika-dark");
      expect(useThemeStore.getState().activeThemeId).toBe("serika-dark");
      expect(localStorage.getItem("opentype-theme")).toBe("serika-dark");
    });

    it("setRandomTheme persists the new random theme mode", () => {
      act(() => {
        useSettingsStore.getState().setRandomTheme("all");
      });
      expect(useSettingsStore.getState().randomTheme).toBe("all");
      const stored = readStoredSettings();
      expect(stored.randomTheme).toBe("all");
    });

    it("toggleFavoriteTheme adds and removes ids", () => {
      act(() => {
        useSettingsStore.getState().toggleFavoriteTheme("default-dark");
      });
      expect(useSettingsStore.getState().favoriteThemeIds).toContain("default-dark");
      act(() => {
        useSettingsStore.getState().toggleFavoriteTheme("default-dark");
      });
      expect(useSettingsStore.getState().favoriteThemeIds).not.toContain("default-dark");
    });

    it("saveCustomTheme inserts and updates themes", () => {
      const theme = makeTheme({ id: "ct-1" });
      act(() => {
        useSettingsStore.getState().saveCustomTheme(theme);
      });
      expect(useSettingsStore.getState().customThemes).toHaveLength(1);
      expect(useSettingsStore.getState().customThemes[0]?.id).toBe("ct-1");
      expect(useThemeStore.getState().customThemes).toHaveLength(1);

      const updated = makeTheme({ id: "ct-1", name: "Updated" });
      act(() => {
        useSettingsStore.getState().saveCustomTheme(updated);
      });
      expect(useSettingsStore.getState().customThemes).toHaveLength(1);
      expect(useSettingsStore.getState().customThemes[0]?.name).toBe("Updated");
    });

    it("deleteCustomTheme removes a custom theme and its favorite id", () => {
      const theme = makeTheme({ id: "ct-1" });
      act(() => {
        useSettingsStore.getState().saveCustomTheme(theme);
        useSettingsStore.getState().toggleFavoriteTheme("ct-1");
      });
      expect(useSettingsStore.getState().customThemes).toHaveLength(1);

      act(() => {
        useSettingsStore.getState().deleteCustomTheme("ct-1");
      });
      expect(useSettingsStore.getState().customThemes).toHaveLength(0);
      expect(useSettingsStore.getState().favoriteThemeIds).not.toContain("ct-1");
    });
  });

  describe("appearance setters", () => {
    it("setFontFamily updates state and persists", () => {
      act(() => {
        useSettingsStore.getState().setFontFamily("Fira Code");
      });
      expect(useSettingsStore.getState().fontFamily).toBe("Fira Code");
      expect(readStoredSettings().fontFamily).toBe("Fira Code");
    });

    it("setFontSize updates state and persists", () => {
      act(() => {
        useSettingsStore.getState().setFontSize("22px");
      });
      expect(useSettingsStore.getState().fontSize).toBe("22px");
      expect(readStoredSettings().fontSize).toBe("22px");
    });

    it("setCaretStyle updates state and persists", () => {
      act(() => {
        useSettingsStore.getState().setCaretStyle("block");
      });
      expect(useSettingsStore.getState().caretStyle).toBe("block");
      expect(readStoredSettings().caretStyle).toBe("block");
    });

    it("setSmoothCaret updates state and persists", () => {
      act(() => {
        useSettingsStore.getState().setSmoothCaret(true);
      });
      expect(useSettingsStore.getState().smoothCaret).toBe(true);
      expect(readStoredSettings().smoothCaret).toBe(true);
    });
  });

  describe("behaviour setters", () => {
    it("setQuickRestart updates state and persists", () => {
      act(() => {
        useSettingsStore.getState().setQuickRestart(true);
      });
      expect(useSettingsStore.getState().quickRestart).toBe(true);
      expect(readStoredSettings().quickRestart).toBe(true);
    });

    it("setBlindMode updates state and persists", () => {
      act(() => {
        useSettingsStore.getState().setBlindMode(true);
      });
      expect(useSettingsStore.getState().blindMode).toBe(true);
      expect(readStoredSettings().blindMode).toBe(true);
    });

    it("setShowLiveWpm updates state and persists", () => {
      act(() => {
        useSettingsStore.getState().setShowLiveWpm(false);
      });
      expect(useSettingsStore.getState().showLiveWpm).toBe(false);
      expect(readStoredSettings().showLiveWpm).toBe(false);
    });

    it("setShowLiveAccuracy updates state and persists", () => {
      act(() => {
        useSettingsStore.getState().setShowLiveAccuracy(false);
      });
      expect(useSettingsStore.getState().showLiveAccuracy).toBe(false);
      expect(readStoredSettings().showLiveAccuracy).toBe(false);
    });

    it("setStopOnError updates state and persists", () => {
      act(() => {
        useSettingsStore.getState().setStopOnError("word");
      });
      expect(useSettingsStore.getState().stopOnError).toBe("word");
      expect(readStoredSettings().stopOnError).toBe("word");
    });

    it("setShowKeyboardHints updates state and persists", () => {
      act(() => {
        useSettingsStore.getState().setShowKeyboardHints(false);
      });
      expect(useSettingsStore.getState().showKeyboardHints).toBe(false);
      expect(readStoredSettings().showKeyboardHints).toBe(false);
    });
  });

  describe("readStoredSettings", () => {
    it("returns defaults when no settings are stored", () => {
      const result = readStoredSettings();
      expect(result).toEqual(defaultSettings());
    });

    it("parses and merges stored JSON", () => {
      const stored = {
        ...defaultSettings(),
        fontFamily: "Fira Code",
        fontSize: "22px",
        caretStyle: "underline",
        quickRestart: true,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      const result = readStoredSettings();
      expect(result.fontFamily).toBe("Fira Code");
      expect(result.caretStyle).toBe("underline");
      expect(result.quickRestart).toBe(true);
    });

    it("filters out malformed custom themes", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...defaultSettings(),
          customThemes: [{ id: "ok", name: "OK", dark: true, colors: {} }, "not-a-theme"],
        }),
      );
      const result = readStoredSettings();
      expect(result.customThemes).toEqual([]);
    });

    it("falls back to defaults for invalid JSON", () => {
      localStorage.setItem(STORAGE_KEY, "not json");
      const result = readStoredSettings();
      expect(result).toEqual(defaultSettings());
    });
  });

  describe("applyRandomTheme", () => {
    it("is a no-op when randomTheme is 'off'", () => {
      act(() => {
        useSettingsStore.getState().setActiveThemeId("default-dark");
      });
      const before = useSettingsStore.getState().activeThemeId;
      act(() => {
        useSettingsStore.getState().applyRandomTheme();
      });
      expect(useSettingsStore.getState().activeThemeId).toBe(before);
    });

    it("picks a random preset when mode is 'all'", () => {
      act(() => {
        useSettingsStore.getState().setRandomTheme("all");
      });
      act(() => {
        useSettingsStore.getState().applyRandomTheme();
      });
      const after = useSettingsStore.getState().activeThemeId;
      expect(after).not.toBe("default-dark");
    });

    it("picks a random favorite when mode is 'favorites' and favorites exist", () => {
      act(() => {
        useSettingsStore.getState().setRandomTheme("favorites");
        useSettingsStore.getState().toggleFavoriteTheme("serika-dark");
      });
      act(() => {
        useSettingsStore.getState().setActiveThemeId("default-dark");
        useSettingsStore.getState().applyRandomTheme();
      });
      expect(useSettingsStore.getState().activeThemeId).toBe("serika-dark");
    });
  });

  describe("persistence", () => {
    it("writes to localStorage on every change", () => {
      act(() => {
        useSettingsStore.getState().setFontFamily("Roboto Mono");
        useSettingsStore.getState().setFontSize("14px");
        useSettingsStore.getState().setSmoothCaret(true);
      });
      const stored = readStoredSettings();
      expect(stored.fontFamily).toBe("Roboto Mono");
      expect(stored.fontSize).toBe("14px");
      expect(stored.smoothCaret).toBe(true);
    });
  });
});
