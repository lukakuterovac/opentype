export interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const HEX_PATTERN = /^#([0-9a-fA-F]{6})$/;

function normalizeHex(value: string): string | null {
  let trimmed = value.trim();
  if (!trimmed.startsWith("#")) trimmed = `#${trimmed}`;
  if (HEX_PATTERN.test(trimmed)) return trimmed.toUpperCase();
  return null;
}

export function ColorInput({
  label,
  value,
  onChange,
}: ColorInputProps): JSX.Element {
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const next = normalizeHex(e.target.value);
    if (next) onChange(next);
  };

  return (
    <div className="custom-theme-color-row">
      <span className="custom-theme-color-label">{label}</span>
      <label
        className="custom-theme-color-swatch"
        style={{ background: value }}
        aria-label={`${label} color`}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
        />
      </label>
      <input
        type="text"
        className="custom-theme-color-hex"
        value={value}
        onChange={handleHexChange}
        maxLength={7}
        spellCheck={false}
        aria-label={`${label} hex`}
      />
    </div>
  );
}
