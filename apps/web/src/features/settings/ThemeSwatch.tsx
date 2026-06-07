import type { Theme } from "@opentype/shared";

export interface ThemeSwatchProps {
  theme: Theme;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

function StarIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5l2.95 6.36 6.55.65-4.95 4.66 1.45 6.83L12 17.6l-6 3.4 1.45-6.83L2.5 9.51l6.55-.65L12 2.5z" />
    </svg>
  );
}

export function ThemeSwatch({
  theme,
  isActive,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: ThemeSwatchProps): JSX.Element {
  return (
    <div className={`theme-swatch${isActive ? " active" : ""}`}>
      <button
        type="button"
        className="theme-swatch-button"
        onClick={() => onSelect(theme.id)}
        aria-pressed={isActive}
        aria-label={`Apply ${theme.name} theme`}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div className="theme-swatch-preview">
          <div
            className="theme-swatch-preview-base"
            style={{ background: theme.colors["--bg-base"] }}
          />
          <div
            className="theme-swatch-preview-accent"
            style={{ background: theme.colors["--accent"] }}
          />
        </div>
        <div className="theme-swatch-name">{theme.name}</div>
      </button>
      <button
        type="button"
        className={`theme-swatch-favorite${isFavorite ? " active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(theme.id);
        }}
        aria-label={
          isFavorite
            ? `Remove ${theme.name} from favorites`
            : `Add ${theme.name} to favorites`
        }
        aria-pressed={isFavorite}
        title={isFavorite ? "Unfavorite" : "Favorite"}
      >
        <StarIcon />
      </button>
    </div>
  );
}
