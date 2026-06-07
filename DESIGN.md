# OpenType — Design Language

> This file defines the visual and interaction design system for OpenType. When building any UI component, consult this file first. Do not introduce colors, fonts, spacing, or interaction patterns that are not documented here.

---

## 1. Philosophy

The UI exists to disappear. Every design decision serves one goal: keep the user focused on the words. During an active typing test, nothing should compete for attention. Outside of a test, the interface should feel fast, minimal, and purposeful.

**Guiding principles:**
- Fully themeable — every color is a CSS variable, never hardcoded
- Monospace type for anything test-related; sans-serif for chrome
- No decorative elements — no gradients, no shadows, no illustrations
- Density is earned — only show information when it's relevant

---

## 2. Theming System

### Overview

Every color in the UI is expressed as a CSS variable on `:root`. Themes are plain JS objects that map variable names to hex values — applying a theme means writing those values onto `:root` via JavaScript. There is no separate CSS file per theme.

The active theme is stored in `localStorage` under the key `opentype-theme`. On app boot, `themeStore.ts` reads this key and applies the theme before first render to avoid a flash.

### CSS Variables

These are the only color values components are allowed to use. Never hardcode a hex color in a component.

```css
:root {
  /* Surfaces */
  --bg-base:         /* Page background */
  --bg-surface:      /* Controls, pills, cards */
  --bg-elevated:     /* Active/selected states */
  --bg-border:       /* Default dividers and borders */
  --bg-border-strong:/* Borders on interactive elements */

  /* Text */
  --text-primary:    /* Headings, active content */
  --text-secondary:  /* Body text, labels */
  --text-muted:      /* Nav links, hints */
  --text-faint:      /* Stat labels, kbd hints */
  --text-ghost:      /* Untyped characters */

  /* Typing states */
  --char-correct:    /* Correctly typed character */
  --char-incorrect:  /* Incorrectly typed character */
  --char-untyped:    /* Not yet reached */

  /* Accent */
  --accent:          /* Caret, active tab underline, links */
  --accent-dim:      /* Subtle accent fills */
}
```

### Applying a Theme

```ts
// lib/theme.ts
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([variable, value]) => {
    root.style.setProperty(variable, value);
  });
}
```

Call `applyTheme` on app boot (in `main.tsx`, before rendering) and whenever the user changes theme in settings.

### Theme Type

```ts
// packages/shared/src/types.ts
export interface Theme {
  id: string;          // e.g. "default-dark"
  name: string;        // e.g. "Default Dark"
  dark: boolean;       // used for categorisation in the theme picker
  colors: {
    '--bg-base': string;
    '--bg-surface': string;
    '--bg-elevated': string;
    '--bg-border': string;
    '--bg-border-strong': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--text-muted': string;
    '--text-faint': string;
    '--text-ghost': string;
    '--char-correct': string;
    '--char-incorrect': string;
    '--char-untyped': string;
    '--accent': string;
    '--accent-dim': string;
  };
}
```

### Built-in Preset Themes

These are the themes shipped with OpenType. They live in `apps/web/src/lib/themes.ts` as an exported `THEMES: Theme[]` array. A minimum of 10 must be implemented.

| id | Name | Style |
|---|---|---|
| `default-dark` | Default Dark | Near-black bg, blue accent — the design baseline |
| `serika-dark` | Serika Dark | Dark grey bg, yellow accent (Monkeytype classic) |
| `dracula` | Dracula | Dark purple bg, pink/cyan accents |
| `nord` | Nord | Arctic blue-grey palette, muted tones |
| `gruvbox-dark` | Gruvbox Dark | Warm dark bg, earthy orange/yellow accents |
| `one-dark` | One Dark | Atom-inspired dark, blue-purple accent |
| `rose-pine` | Rosé Pine | Muted dark, dusty rose/gold accents |
| `catppuccin` | Catppuccin Mocha | Deep dark, pastel lavender/peach |
| `light` | Light | White bg, dark text, blue accent |
| `serika` | Serika | Light cream bg, yellow/dark contrast |

**Defining a preset (example — `default-dark`):**
```ts
{
  id: 'default-dark',
  name: 'Default Dark',
  dark: true,
  colors: {
    '--bg-base':          '#0f0f0f',
    '--bg-surface':       '#161616',
    '--bg-elevated':      '#212121',
    '--bg-border':        '#1e1e1e',
    '--bg-border-strong': '#2a2a2a',
    '--text-primary':     '#e2e8f0',
    '--text-secondary':   '#d1d5db',
    '--text-muted':       '#6b7280',
    '--text-faint':       '#4b5563',
    '--text-ghost':       '#374151',
    '--char-correct':     '#e2e8f0',
    '--char-incorrect':   '#ef4444',
    '--char-untyped':     '#374151',
    '--accent':           '#4f8ef7',
    '--accent-dim':       '#1e3a5f',
  }
}
```

### Custom Themes

Users can create a fully custom theme by choosing values for all 15 CSS variables via color pickers. Custom themes are:
- Stored in `localStorage` under `opentype-custom-themes` as a JSON array of `Theme` objects
- Available to logged-in users across devices via the API (stored in the `user_settings` JSON column — see AGENTS.md §5)
- Not shareable between users in Phase 1; sharing is a future feature

### Theme Zustand Store

```ts
// store/themeStore.ts
interface ThemeStore {
  activeThemeId: string;
  customThemes: Theme[];
  setTheme: (themeId: string) => void;
  saveCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (themeId: string) => void;
}
```

`setTheme` must: update `activeThemeId`, call `applyTheme(resolvedTheme)`, and persist the id to `localStorage`.

---

## 3. Typography

Two fonts only. Load both from Google Fonts. The user may override the typing area font (see §3.1).

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

### Font Rules
| Context | Font | Weight | Size |
|---|---|---|---|
| Typing area (words) | user setting (default: `JetBrains Mono`) | 400 | user setting (default: `19px`) |
| WPM / timer numbers | `JetBrains Mono` | 500 | `22px` |
| Mode pills | `JetBrains Mono` | 400 | `12px` |
| Logo | `JetBrains Mono` | 500 | `15px` |
| Nav links / tabs | `Inter` | 400 | `13px` |
| Stat labels | `Inter` | 400 | `11px`, uppercase, `letter-spacing: 0.07em` |
| Body / general UI | `Inter` | 400 | `14px` |
| Keyboard hints | `JetBrains Mono` | 400 | `11px` |

**Never use font sizes below 11px.** Never use font weight 600 or 700.

### 3.1 User Font Settings

The user may customise two aspects of the typing area font:

**Font family** — stored as `settings.fontFamily`. Applies only to the typing area and results screen WPM number. Options to support:

| Value | Google Fonts URL suffix |
|---|---|
| `JetBrains Mono` (default) | `JetBrains+Mono:wght@400;500` |
| `Fira Code` | `Fira+Code:wght@400;500` |
| `Source Code Pro` | `Source+Code+Pro:wght@400;500` |
| `Roboto Mono` | `Roboto+Mono:wght@400;500` |
| `Inconsolata` | `Inconsolata:wght@400;500` |

Dynamically inject a `<link>` tag when a non-default font is first selected. Apply via a CSS variable `--font-typing` on `:root`, used only for the typing area wrapper.

**Font size** — stored as `settings.fontSize`. Applies only to the typing area. Options: `14px`, `16px`, `19px` (default), `22px`, `26px`.

---

## 4. Layout

### Page structure
```
┌─────────────────────────────────┐
│ nav (logo · tabs · user)        │  height: ~57px, border-bottom
├─────────────────────────────────┤
│                                 │
│   [mode controls]               │  centered, pill row
│                                 │
│   [live stats bar]              │  wpm · divider · acc · divider · timer
│                                 │
│   [typing area]                 │  max-width: 680px, centered
│                                 │
│   [keyboard hints]              │  tab · esc
│                                 │
└─────────────────────────────────┘
```

### Typing area
- `max-width: 680px`, centered horizontally
- `font-size: var(--font-size-typing)`, `line-height: 1.85`
- Words are `display: inline` with `margin-right: 10px`
- No visible input box — keystrokes are captured on a hidden element or `window` keydown listener
- Never use a native `<input>` or `<textarea>` for the typing surface

### Nav
- `padding: 18px 32px`
- Three zones: logo left · tabs center · user actions right
- Hide tabs during an active typing test; show only logo and a minimal restart icon

### Spacing scale
Use these values only — don't introduce arbitrary spacing:
`4px · 8px · 12px · 16px · 24px · 28px · 32px · 40px`

---

## 5. Components

All color values in components must reference CSS variables — never hardcoded hex.

### Mode selector (pill row)
```
background: var(--bg-surface)
border: 0.5px solid var(--bg-border)
border-radius: 30px
padding: 5px 6px
```

Each pill:
```
font-family: JetBrains Mono
font-size: 12px
padding: 5px 12px
border-radius: 20px
color (default):  var(--text-muted)
color (hover):    var(--text-secondary)
color (active):   var(--text-primary)
background (active): var(--bg-elevated)
```

Separators between groups:
```
width: 0.5px
height: 14px
background: var(--bg-border-strong)
margin: 0 2px
```

### Stats bar
```
value:
  font-family: JetBrains Mono
  font-size: 22px
  font-weight: 500
  color: var(--text-primary)   (timer uses var(--accent))

label:
  font-family: Inter
  font-size: 11px
  color: var(--text-faint)
  text-transform: uppercase
  letter-spacing: 0.07em
```

Dividers: `width: 0.5px; height: 32px; background: var(--bg-border)`

### Caret

The caret style is user-configurable. The active style is stored in `settings.caretStyle`.

**Caret styles:**

| Value | Description | CSS |
|---|---|---|
| `line` (default) | Thin vertical bar, 2px wide | `width: 2px; height: 1.1em; background: var(--accent)` |
| `block` | Filled block behind current char | `width: 1ch; height: 1.1em; background: var(--accent); opacity: 0.7` |
| `underline` | Horizontal bar below current char | `width: 1ch; height: 2px; background: var(--accent); position: absolute; bottom: 0` |
| `off` | No caret | No element rendered |

All caret styles blink using the same animation:
```css
animation: blink 1.1s step-end infinite;

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
```

The caret is a DOM element inserted at the current character position. It must not be a CSS pseudo-element.

**Smooth caret** — when `settings.smoothCaret` is `true`, replace `step-end` with a CSS transition on `transform: translateX()` that tracks character position. Do not use the blink animation in smooth mode; instead animate position only. Implement smooth caret using absolute positioning of a single persistent caret element over the typing area, updated on each keypress.

### Character states
```css
.char.correct   { color: var(--char-correct); }
.char.incorrect {
  color: var(--char-incorrect);
  text-decoration: underline;
  text-decoration-color: var(--char-incorrect);
  text-underline-offset: 3px;
}
.char.untyped   { color: var(--char-untyped); }
```

### Tabs (nav)
```
font-size: 13px
padding: 10px 16px
border-bottom: 2px solid transparent          (inactive)
border-bottom: 2px solid var(--accent)        (active)
color inactive: var(--text-faint)
color active:   var(--text-primary)
transition: all 0.15s
```

### Keyboard hint badges
```
font-family: JetBrains Mono
font-size: 11px
background: var(--bg-surface)
border: 0.5px solid var(--bg-border-strong)
border-radius: 4px
padding: 2px 6px
color: var(--text-muted)
```

### Logo
```
font-family: JetBrains Mono
font-size: 15px
font-weight: 500
color: var(--text-primary)
letter-spacing: -0.02em

The "type" suffix is colored: var(--accent)
Rendered as: open<span style="color:var(--accent)">type</span>
```

---

## 6. Settings Page

The settings page lives at `/settings`. It is divided into sections. All settings are persisted in the `settingsStore` (Zustand) and written to `localStorage`. Logged-in users have settings synced to the API.

### Theme Section

**Theme picker:**
- Display all preset themes as a grid of clickable swatches
- Each swatch shows: a small colour preview block (the theme's `--bg-base` and `--accent`) + theme name label below
- Active theme has a border using `var(--accent)`
- Dark / light themes are shown in separate sub-groups
- Clicking a swatch applies the theme immediately (live preview)

**Custom theme editor:**
- A button "Create custom theme" opens an editor panel (inline, not a modal)
- Editor shows 15 colour inputs — one per CSS variable — each with a native `<input type="color">` and a hex text field next to it
- Variable labels are human-readable (e.g. "Background", "Accent", "Correct character", not the raw CSS variable name)
- A live preview strip shows the typing area and stats bar re-rendered with the in-progress custom values
- Save button stores the theme; Cancel discards

**Favourite themes:**
- Star icon on each preset swatch to mark as favourite
- Favourites appear at the top of the picker

**Random theme on test complete:**
- Toggle: `settings.randomTheme` — `'off' | 'all' | 'favorites'`
- When enabled, a random theme (from all presets, or only favourites) is applied after each completed test

### Appearance Section

| Setting | Type | Options | Default |
|---|---|---|---|
| `fontFamily` | select | JetBrains Mono, Fira Code, Source Code Pro, Roboto Mono, Inconsolata | JetBrains Mono |
| `fontSize` | select | 14px, 16px, 19px, 22px, 26px | 19px |
| `caretStyle` | select | line, block, underline, off | line |
| `smoothCaret` | toggle | on / off | off |

### Behaviour Section

| Setting | Type | Options | Default |
|---|---|---|---|
| `quickRestart` | toggle | on / off | off — when on, `Tab` restarts without confirmation |
| `blindMode` | toggle | on / off | off — hides character error highlighting during the test |
| `showLiveWpm` | toggle | on / off | on |
| `showLiveAccuracy` | toggle | on / off | on |
| `stopOnError` | select | off / word / letter | off — stops the test on first error |
| `showKeyboardHints` | toggle | on / off | on |

---

## 7. Settings Store & Persistence

```ts
// store/settingsStore.ts
interface Settings {
  // Theme
  activeThemeId: string;
  customThemes: Theme[];
  randomTheme: 'off' | 'all' | 'favorites';
  favoriteThemeIds: string[];

  // Appearance
  fontFamily: string;
  fontSize: string;
  caretStyle: 'line' | 'block' | 'underline' | 'off';
  smoothCaret: boolean;

  // Behaviour
  quickRestart: boolean;
  blindMode: boolean;
  showLiveWpm: boolean;
  showLiveAccuracy: boolean;
  stopOnError: 'off' | 'word' | 'letter';
  showKeyboardHints: boolean;
}
```

- Guest: persisted entirely in `localStorage` under `opentype-settings`
- Logged in: synced to `user_settings` JSONB column in PostgreSQL on every change (debounced 1s)
- On login, remote settings are merged over local settings (remote wins)

---

## 8. Interaction & Animation

- **Transitions:** `0.15s` ease on color/background changes. Nothing longer for state changes.
- **Theme switching:** apply instantly (no transition) — jarring fades feel broken.
- **No entrance animations** on the typing area — words must appear instantly.
- **Caret animation:** `step-end` blink at `1.1s` (not ease, not linear — `step-end` only). Smooth caret uses `transition: transform 80ms ease` instead.
- **Restart:** pressing `Tab` resets the test immediately with no transition delay.
- **No hover effects on characters** — hover states only on nav/controls.
- Framer Motion is available for the results screen reveal only (animate WPM number counting up, accuracy fading in). Do not use it in the typing area.

---

## 9. Results Screen

Shown full-screen (replaces the typing area) after a test ends.

Layout (centered, `max-width: 480px`):
```
[large WPM number]       — var(--font-typing), 72px, weight 500, var(--text-primary)
[wpm label]              — Inter, 13px, var(--text-faint), uppercase

[row: gross wpm · accuracy · characters]   — secondary stats, same stat component as live bar

[test mode tag]          — e.g. "60s · top 200", Inter 12px, var(--text-muted)

[two buttons: retry / next test]
```

Buttons:
```
font-family: Inter
font-size: 13px
padding: 8px 20px
border: 0.5px solid var(--bg-border-strong)
border-radius: 6px
background: transparent
color: var(--text-muted)
cursor: pointer

hover:
  background: var(--bg-surface)
  color: var(--text-secondary)
  transition: 0.15s
```

Animate the main WPM number counting up from 0 using Framer Motion on mount.

---

## 10. What Not to Do

- No hardcoded hex colors in any component — CSS variables only
- No gradients, drop shadows, glows, or blur effects anywhere
- No font other than `JetBrains Mono` and `Inter` in UI chrome (user-selected typing fonts are the only exception)
- No border-radius larger than `30px` (pill controls) — use `4–8px` for everything else
- No animations in the typing area itself (only the caret animates)
- No emoji in the UI
- No placeholder text inside the typing area
- Do not apply themes via CSS class toggling — use CSS variables on `:root` only