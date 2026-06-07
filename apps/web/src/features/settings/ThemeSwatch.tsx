import type { Theme } from "@opentype/shared";

export interface ThemeSwatchProps {
  theme: Theme;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit?: (theme: Theme) => void;
}

function StarIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5l2.95 6.36 6.55.65-4.95 4.66 1.45 6.83L12 17.6l-6 3.4 1.45-6.83L2.5 9.51l6.55-.65L12 2.5z" />
    </svg>
  );
}

function PencilIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

export function ThemeSwatch({
  theme,
  isActive,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onEdit,
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
      {onEdit && (
        <button
          type="button"
          className="theme-swatch-edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(theme);
          }}
          aria-label={`Edit ${theme.name}`}
          title="Edit"
        >
          <PencilIcon />
        </button>
      )}
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
