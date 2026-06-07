export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> {
  value: T;
  options: ReadonlyArray<SelectOption<T>>;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: SelectProps<T>): JSX.Element {
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
