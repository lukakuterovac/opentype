import type { Theme } from "@opentype/shared";

export interface ThemePreviewProps {
  theme: Theme;
}

export function ThemePreview({ theme }: ThemePreviewProps): JSX.Element {
  const c = theme.colors;
  return (
    <div
      style={{
        background: c["--bg-base"],
        color: c["--text-primary"],
        padding: 16,
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        border: `0.5px solid ${c["--bg-border"]}`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: c["--bg-surface"],
          border: `0.5px solid ${c["--bg-border"]}`,
          borderRadius: 30,
          padding: "5px 6px",
          alignSelf: "flex-start",
        }}
      >
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12,
            padding: "5px 12px",
            borderRadius: 20,
            color: c["--text-primary"],
            background: c["--bg-elevated"],
          }}
        >
          30
        </span>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12,
            padding: "5px 12px",
            borderRadius: 20,
            color: c["--text-muted"],
          }}
        >
          60
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 18,
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: c["--char-correct"] }}>the </span>
          <span style={{ color: c["--char-incorrect"], textDecoration: "underline" }}>
            quik
          </span>
          <span style={{ color: c["--char-correct"] }}> brown </span>
          <span style={{ color: c["--char-untyped"] }}>fox jumps</span>
        </div>
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 28,
          alignSelf: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 20,
              fontWeight: 500,
              color: c["--text-primary"],
              fontVariantNumeric: "tabular-nums",
            }}
          >
            72
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: c["--text-faint"],
            }}
          >
            wpm
          </span>
        </div>
        <div
          style={{
            width: 0.5,
            height: 28,
            background: c["--bg-border"],
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 20,
              fontWeight: 500,
              color: c["--text-primary"],
              fontVariantNumeric: "tabular-nums",
            }}
          >
            96%
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: c["--text-faint"],
            }}
          >
            acc
          </span>
        </div>
        <div
          style={{
            width: 0.5,
            height: 28,
            background: c["--bg-border"],
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 20,
              fontWeight: 500,
              color: c["--accent"],
              fontVariantNumeric: "tabular-nums",
            }}
          >
            24
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: c["--text-faint"],
            }}
          >
            time
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: c["--bg-surface"],
            border: `0.5px solid ${c["--bg-border-strong"]}`,
            borderRadius: 4,
            padding: "2px 6px",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: c["--text-muted"],
          }}
        >
          tab
        </span>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 10,
            color: c["--text-faint"],
          }}
        >
          — restart test
        </span>
      </div>
    </div>
  );
}
