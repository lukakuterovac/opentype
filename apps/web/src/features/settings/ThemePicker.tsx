import { useState } from "react";
import type { Theme } from "@opentype/shared";
import { useSettingsStore } from "../../store/settingsStore";
import { THEMES } from "../../lib/themes";
import { ThemeSwatch } from "./ThemeSwatch";
import { CustomThemeEditor } from "./CustomThemeEditor";

interface ThemeGroup {
  key: "favorites" | "dark" | "light" | "custom";
  label: string;
  themes: Theme[];
}

export function ThemePicker(): JSX.Element {
  const activeThemeId = useSettingsStore((s) => s.activeThemeId);
  const customThemes = useSettingsStore((s) => s.customThemes);
  const favoriteThemeIds = useSettingsStore((s) => s.favoriteThemeIds);
  const setActiveThemeId = useSettingsStore((s) => s.setActiveThemeId);
  const toggleFavoriteTheme = useSettingsStore((s) => s.toggleFavoriteTheme);

  const [editing, setEditing] = useState<Theme | null>(null);
  const [creating, setCreating] = useState(false);

  const allThemes: Theme[] = [...THEMES, ...customThemes];

  const favoriteThemes = allThemes.filter((t) =>
    favoriteThemeIds.includes(t.id),
  );
  const darkThemes = THEMES.filter((t) => t.dark);
  const lightThemes = THEMES.filter((t) => !t.dark);
  const customOnly = customThemes;

  const groups: ThemeGroup[] = [];
  if (favoriteThemes.length > 0) {
    groups.push({ key: "favorites", label: "Favorites", themes: favoriteThemes });
  }
  groups.push({ key: "dark", label: "Dark", themes: darkThemes });
  groups.push({ key: "light", label: "Light", themes: lightThemes });
  if (customOnly.length > 0) {
    groups.push({ key: "custom", label: "Custom", themes: customOnly });
  }

  const handleEdit = (theme: Theme): void => {
    setEditing(theme);
    setCreating(false);
  };

  const handleClose = (): void => {
    setEditing(null);
    setCreating(false);
  };

  const showEditor = editing !== null || creating;

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">theme</h2>
      <p className="settings-section-hint">
        Click a swatch to apply. Click the star to favorite. Right-click a custom theme to edit.
      </p>
      <div className="settings-section-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {groups.map((group) => (
          <div key={group.key} className="theme-group">
            <div className="theme-group-label">{group.label}</div>
            <div className="theme-grid">
              {group.themes.map((theme) => (
                <ThemeSwatch
                  key={theme.id}
                  theme={theme}
                  isActive={activeThemeId === theme.id}
                  isFavorite={favoriteThemeIds.includes(theme.id)}
                  onSelect={setActiveThemeId}
                  onToggleFavorite={toggleFavoriteTheme}
                  onEdit={
                    group.key === "custom" ? () => handleEdit(theme) : undefined
                  }
                />
              ))}
            </div>
          </div>
        ))}

        <div>
          <button
            type="button"
            className="custom-theme-toggle-button"
            onClick={() => {
              setEditing(null);
              setCreating(true);
            }}
          >
            + create custom theme
          </button>
        </div>

        {showEditor && (
          <CustomThemeEditor
            initialTheme={editing}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}
