import { AppearanceSection } from "../features/settings/AppearanceSection";
import { BehaviourSection } from "../features/settings/BehaviourSection";
import { RandomThemeSection } from "../features/settings/RandomThemeSection";
import { ThemePicker } from "../features/settings/ThemePicker";

export function SettingsPage(): JSX.Element {
  return (
    <main className="settings-page">
      <header className="settings-header">
        <h1 className="settings-title">settings</h1>
        <p className="settings-subtitle">
          All settings are saved automatically to your browser.
        </p>
      </header>

      <ThemePicker />
      <RandomThemeSection />
      <AppearanceSection />
      <BehaviourSection />
    </main>
  );
}
