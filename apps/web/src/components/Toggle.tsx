export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleProps): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`toggle${checked ? " on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-knob" aria-hidden="true" />
    </button>
  );
}
