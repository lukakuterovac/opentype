import { Select } from "../../components/Select";
import { useSettingsStore } from "../../store/settingsStore";
import { SettingsRow } from "./SettingsRow";

const RANDOM_OPTIONS = [
  { value: "off", label: "off" },
  { value: "all", label: "all" },
  { value: "favorites", label: "favorites" },
];

export function RandomThemeSection(): JSX.Element {
  const randomTheme = useSettingsStore((s) => s.randomTheme);
  const setRandomTheme = useSettingsStore((s) => s.setRandomTheme);

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">random theme</h2>
      <p className="settings-section-hint">
        When enabled, a random theme is applied after each completed test.
      </p>
      <div>
        <SettingsRow
          name="random theme on test complete"
          description="Pick from all themes, only favorites, or disable."
            control={
              <Select
                value={randomTheme}
                options={RANDOM_OPTIONS}
                onChange={(v) =>
                  setRandomTheme(v as "off" | "all" | "favorites")
                }
                ariaLabel="Random theme mode"
              />
            }
        />
      </div>
    </div>
  );
}
