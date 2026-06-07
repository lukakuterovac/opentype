export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  options: ReadonlyArray<SelectOption>;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export function Select({
  value,
  options,
  onChange,
  ariaLabel,
}: SelectProps): JSX.Element {
  return (
    <div className="pill-select" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={`pill-select-option${isActive ? " active" : ""}`}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
