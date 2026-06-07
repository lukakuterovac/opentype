import { useEffect, useState } from "react";
import type { Theme } from "@opentype/shared";
import { ColorInput } from "./ColorInput";
import { ThemePreview } from "./ThemePreview";
import { useSettingsStore } from "../../store/settingsStore";
import { resolveTheme } from "../../lib/theme";
import { applyTheme } from "../../lib/theme";

type ColorKey = keyof Theme["colors"];

const COLOR_KEYS: ColorKey[] = [
  "--bg-base",
  "--bg-surface",
  "--bg-elevated",
  "--bg-border",
  "--bg-border-strong",
  "--text-primary",
  "--text-secondary",
  "--text-muted",
  "--text-faint",
  "--text-ghost",
  "--char-correct",
  "--char-incorrect",
  "--char-untyped",
  "--accent",
  "--accent-dim",
];

const COLOR_LABELS: Record<ColorKey, string> = {
  "--bg-base": "Background",
  "--bg-surface": "Surface",
  "--bg-elevated": "Elevated",
  "--bg-border": "Border",
  "--bg-border-strong": "Border strong",
  "--text-primary": "Text primary",
  "--text-secondary": "Text secondary",
  "--text-muted": "Text muted",
  "--text-faint": "Text faint",
  "--text-ghost": "Text ghost",
  "--char-correct": "Correct char",
  "--char-incorrect": "Incorrect char",
  "--char-untyped": "Untyped char",
  "--accent": "Accent",
  "--accent-dim": "Accent dim",
};

function generateId(): string {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildBlankTheme(name: string): Theme {
  const colors: Theme["colors"] = {
    "--bg-base": "#1a1a1a",
    "--bg-surface": "#222222",
    "--bg-elevated": "#2a2a2a",
    "--bg-border": "#262626",
    "--bg-border-strong": "#333333",
    "--text-primary": "#f1f5f9",
    "--text-secondary": "#cbd5e1",
    "--text-muted": "#94a3b8",
    "--text-faint": "#64748b",
    "--text-ghost": "#475569",
    "--char-correct": "#f1f5f9",
    "--char-incorrect": "#f87171",
    "--char-untyped": "#475569",
    "--accent": "#60a5fa",
    "--accent-dim": "#1e3a5f",
  };
  return {
    id: generateId(),
    name,
    dark: true,
    colors,
  };
}

export interface CustomThemeEditorProps {
  initialTheme: Theme | null;
  onClose: () => void;
}

export function CustomThemeEditor({
  initialTheme,
  onClose,
}: CustomThemeEditorProps): JSX.Element {
  const saveCustomTheme = useSettingsStore((s) => s.saveCustomTheme);
  const deleteCustomTheme = useSettingsStore((s) => s.deleteCustomTheme);
  const customThemes = useSettingsStore((s) => s.customThemes);

  const [draft, setDraft] = useState<Theme>(() =>
    initialTheme ? { ...initialTheme, colors: { ...initialTheme.colors } } : buildBlankTheme("New theme"),
  );

  useEffect(() => {
    applyTheme(draft);
    return () => {
      const settings = useSettingsStore.getState();
      const revert = resolveTheme(settings.activeThemeId, customThemes);
      if (revert) applyTheme(revert);
    };
  }, [draft, customThemes]);

  const setColor = (key: ColorKey, value: string): void => {
    setDraft((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  const setName = (name: string): void => {
    setDraft((prev) => ({ ...prev, name }));
  };

  const handleSave = (): void => {
    saveCustomTheme(draft);
    onClose();
  };

  const handleCancel = (): void => {
    onClose();
  };

  const handleDelete = (): void => {
    deleteCustomTheme(draft.id);
    onClose();
  };

  const isEditing = initialTheme !== null;

  return (
    <div className="custom-theme-editor">
      <div className="custom-theme-editor-header">
        <span className="custom-theme-editor-title">
          {isEditing ? "Edit custom theme" : "Create custom theme"}
        </span>
        <input
          type="text"
          className="custom-theme-editor-name-input"
          value={draft.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Theme name"
          maxLength={40}
        />
      </div>

      <div className="custom-theme-editor-grid">
        {COLOR_KEYS.map((key) => (
          <ColorInput
            key={key}
            label={COLOR_LABELS[key]}
            value={draft.colors[key]}
            onChange={(value) => setColor(key, value)}
          />
        ))}
      </div>

      <div className="custom-theme-editor-preview">
        <div className="custom-theme-editor-preview-label">Preview</div>
        <ThemePreview theme={draft} />
      </div>

      <div className="custom-theme-editor-actions">
        {isEditing && (
          <button
            type="button"
            className="custom-theme-delete-button"
            onClick={handleDelete}
          >
            delete
          </button>
        )}
        <button
          type="button"
          className="custom-theme-cancel-button"
          onClick={handleCancel}
        >
          cancel
        </button>
        <button
          type="button"
          className="custom-theme-save-button primary"
          onClick={handleSave}
        >
          save
        </button>
      </div>
    </div>
  );
}
