import { Select } from "../../components/Select";
import { Toggle } from "../../components/Toggle";
import { useSettingsStore } from "../../store/settingsStore";
import { SettingsRow } from "./SettingsRow";

const STOP_OPTIONS = [
  { value: "off", label: "off" },
  { value: "word", label: "word" },
  { value: "letter", label: "letter" },
];

export function BehaviourSection(): JSX.Element {
  const quickRestart = useSettingsStore((s) => s.quickRestart);
  const blindMode = useSettingsStore((s) => s.blindMode);
  const showLiveWpm = useSettingsStore((s) => s.showLiveWpm);
  const showLiveAccuracy = useSettingsStore((s) => s.showLiveAccuracy);
  const stopOnError = useSettingsStore((s) => s.stopOnError);
  const showKeyboardHints = useSettingsStore((s) => s.showKeyboardHints);

  const setQuickRestart = useSettingsStore((s) => s.setQuickRestart);
  const setBlindMode = useSettingsStore((s) => s.setBlindMode);
  const setShowLiveWpm = useSettingsStore((s) => s.setShowLiveWpm);
  const setShowLiveAccuracy = useSettingsStore((s) => s.setShowLiveAccuracy);
  const setStopOnError = useSettingsStore((s) => s.setStopOnError);
  const setShowKeyboardHints = useSettingsStore((s) => s.setShowKeyboardHints);

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">behaviour</h2>
      <p className="settings-section-hint">
        These change how the test behaves and what is shown on screen.
      </p>
      <div>
        <SettingsRow
          name="quick restart"
          description="Press Tab to restart the test immediately."
          control={
            <Toggle
              checked={quickRestart}
              onChange={setQuickRestart}
              label="Quick restart"
            />
          }
        />
        <SettingsRow
          name="blind mode"
          description="Hide character error highlighting during the test."
          control={
            <Toggle
              checked={blindMode}
              onChange={setBlindMode}
              label="Blind mode"
            />
          }
        />
        <SettingsRow
          name="live WPM"
          description="Show the live WPM in the stats bar during the test."
          control={
            <Toggle
              checked={showLiveWpm}
              onChange={setShowLiveWpm}
              label="Live WPM"
            />
          }
        />
        <SettingsRow
          name="live accuracy"
          description="Show the live accuracy in the stats bar during the test."
          control={
            <Toggle
              checked={showLiveAccuracy}
              onChange={setShowLiveAccuracy}
              label="Live accuracy"
            />
          }
        />
        <SettingsRow
          name="stop on error"
          description="Stop accepting input when the first error is made."
          control={
            <Select
              value={stopOnError}
              options={STOP_OPTIONS}
              onChange={(v) => setStopOnError(v as "off" | "word" | "letter")}
              ariaLabel="Stop on error"
            />
          }
        />
        <SettingsRow
          name="keyboard hints"
          description="Show the Tab / Esc hints below the typing area."
          control={
            <Toggle
              checked={showKeyboardHints}
              onChange={setShowKeyboardHints}
              label="Keyboard hints"
            />
          }
        />
      </div>
    </div>
  );
}
