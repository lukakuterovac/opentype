import { Select } from "../../components/Select";
import { Toggle } from "../../components/Toggle";
import { useSettingsStore } from "../../store/settingsStore";
import {
  FONT_FAMILIES,
  FONT_SIZES,
} from "@opentype/shared";
import { SettingsRow } from "./SettingsRow";

const FONT_OPTIONS = FONT_FAMILIES.map((f) => ({ value: f, label: f }));
const FONT_SIZE_OPTIONS = FONT_SIZES.map((s) => ({ value: s, label: s }));

const CARET_OPTIONS = [
  { value: "line", label: "line" },
  { value: "block", label: "block" },
  { value: "underline", label: "underline" },
  { value: "off", label: "off" },
];

export function AppearanceSection(): JSX.Element {
  const fontFamily = useSettingsStore((s) => s.fontFamily);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const caretStyle = useSettingsStore((s) => s.caretStyle);
  const smoothCaret = useSettingsStore((s) => s.smoothCaret);
  const setFontFamily = useSettingsStore((s) => s.setFontFamily);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const setCaretStyle = useSettingsStore((s) => s.setCaretStyle);
  const setSmoothCaret = useSettingsStore((s) => s.setSmoothCaret);

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">appearance</h2>
      <p className="settings-section-hint">
        Fonts apply to the typing area. Caret style controls how the cursor is
        rendered.
      </p>
      <div>
        <SettingsRow
          name="font family"
          description="Used in the typing area and WPM number."
          control={
            <Select
              value={fontFamily}
              options={FONT_OPTIONS}
              onChange={setFontFamily}
              ariaLabel="Font family"
            />
          }
        />
        <SettingsRow
          name="font size"
          description="Affects only the typing area."
          control={
            <Select
              value={fontSize}
              options={FONT_SIZE_OPTIONS}
              onChange={setFontSize}
              ariaLabel="Font size"
            />
          }
        />
        <SettingsRow
          name="caret style"
          description="How the cursor appears at the current character."
          control={
            <Select
              value={caretStyle}
              options={CARET_OPTIONS}
              onChange={(v) =>
                setCaretStyle(v as "line" | "block" | "underline" | "off")
              }
              ariaLabel="Caret style"
            />
          }
        />
        <SettingsRow
          name="smooth caret"
          description="Animate the caret position smoothly across characters."
          control={
            <Toggle
              checked={smoothCaret}
              onChange={setSmoothCaret}
              label="Smooth caret"
            />
          }
        />
      </div>
    </div>
  );
}
