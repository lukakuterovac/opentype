# OpenType — Project Specification & Agent Rules

> This file is the single source of truth for this project. Read it fully before writing any code, making any architectural decisions, or suggesting alternatives. Do not deviate from the decisions documented here without explicit instruction.

---

## 1. Project Overview

**OpenType** is a web-based typing speed game inspired by Monkeytype. Users are presented with words or passages and must type them as accurately and quickly as possible. The game tracks WPM, accuracy, and personal bests over time. The primary goal is a polished, fast, and satisfying core typing experience — everything else is secondary.

**Audience:** Developers, students, and competitive typists who want a clean, distraction-free typing practice tool.

---

## 2. Tech Stack (Non-Negotiable)

### Frontend
| Concern | Choice |
|---|---|
| Framework | React 18+ with Vite |
| Language | TypeScript (strict mode) |
| State management | Zustand |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Routing | React Router v6 |
| HTTP client | Axios |
| Testing | Vitest + React Testing Library |

### Backend
| Concern | Choice |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express (with TypeScript via `tsx`) |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache / Leaderboard | Redis (via `ioredis`) |
| Auth | Supabase Auth (JWT-based) |
| Validation | Zod |

### Infrastructure
| Concern | Choice |
|---|---|
| Frontend hosting | Vercel |
| Backend hosting | Railway |
| Database | Railway-managed PostgreSQL |
| Redis | Railway-managed Redis |
| Package manager | pnpm (workspaces monorepo) |

---

## 3. Repository Structure

This is a **pnpm monorepo**. Always respect this structure:

```
/
├── apps/
│   ├── web/                  # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/   # UI components (dumb, presentational)
│   │   │   ├── features/     # Feature modules (game, auth, profile, leaderboard)
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── store/        # Zustand stores
│   │   │   ├── lib/          # Utilities, constants, API client
│   │   │   ├── pages/        # Route-level page components
│   │   │   └── types/        # Shared TypeScript types (frontend)
│   │   ├── public/
│   │   │   └── wordlists/    # JSON wordlist files
│   │   └── vite.config.ts
│   │
│   └── api/                  # Express backend
│       ├── src/
│       │   ├── routes/       # Express route handlers
│       │   ├── services/     # Business logic (stateless)
│       │   ├── middleware/    # Auth, error handling, rate limiting
│       │   ├── lib/          # DB client, Redis client, helpers
│       │   └── types/        # Shared TypeScript types (backend)
│       └── prisma/
│           └── schema.prisma
│
├── packages/
│   └── shared/               # Shared types/utils used by both apps
│       └── src/
│           ├── types.ts      # Shared interfaces (Result, User, etc.)
│           └── constants.ts  # Shared constants (test modes, durations)
│
├── pnpm-workspace.yaml
├── AGENTS.md                 # This file — architecture & requirements
└── DESIGN.md                 # Design language — read before any UI work
```

---

## 4. Core Features & Requirements

### 4.1 Guest Mode (Phase 1 — build first)

- No login required
- Fully functional typing test
- Results shown at end of session only (not persisted)
- Settings stored in `localStorage`

### 4.2 Typing Engine

The typing engine is the most critical piece of the application. It must be implemented as a custom React hook: `useTypingEngine`.

**Responsibilities:**
- Accept a `words: string[]` array as input
- Track the user's current input character by character
- Classify each character as: `correct`, `incorrect`, or `untyped`
- Handle backspace correctly (allow corrections within the current word only; prevent backspacing into previous words)
- Track current word index and current character index
- Calculate **gross WPM**: `(total characters typed / 5) / elapsed minutes`
- Calculate **net WPM**: `gross WPM - (errors / elapsed minutes)`
- Calculate **accuracy**: `(correct characters / total characters typed) * 100`
- Emit test completion when all words are typed or timer expires
- Support both **time-based** (15s, 30s, 60s, 120s) and **word-count** modes (10, 25, 50, 100 words)

**This hook must be unit-tested.** Write tests in `apps/web/src/features/game/__tests__/useTypingEngine.test.ts`.

### 4.3 Word Generation

- Wordlists are static JSON files in `public/wordlists/`
- Included lists: `top-200.json`, `top-1000.json`, `quotes.json`
- Each list is an array of strings
- The game engine picks N words randomly (no repeats within a single test)
- Do not fetch wordlists from an API — load them at build time or lazily via `fetch('/wordlists/top-200.json')`

### 4.4 Test Modes

| Mode | Options |
|---|---|
| Time | 15s, 30s, 60s, 120s |
| Words | 10, 25, 50, 100 |
| Quote | random quote from `quotes.json` |

### 4.5 Results Screen

Shown immediately after a test completes. Displays:
- Net WPM (large, prominent)
- Gross WPM
- Accuracy (%)
- Characters breakdown: correct / incorrect / extra / missed
- Test mode used (e.g. "60s • top 200")
- "Retry" button (same words) and "Next test" button (new words)
- If user is logged in: whether this is a new personal best

### 4.6 User Accounts (Phase 2)

- Auth via Supabase (email/password + Google OAuth)
- On login, results are saved to PostgreSQL via the API
- Profile page shows:
  - Personal bests per mode
  - Last 10 results
  - WPM history chart (last 30 days, using Recharts)
- JWT is stored in `localStorage` and sent as `Authorization: Bearer <token>` header

### 4.7 Leaderboard (Phase 3)

- Top 100 users by best WPM per mode/duration
- Backed by Redis sorted sets (key format: `leaderboard:{mode}:{duration}`)
- Updated on every result submission via the API
- Refreshed in the UI every 60 seconds (no WebSockets needed)

---

## 5. Database Schema

Use Prisma. The schema lives at `apps/api/prisma/schema.prisma`.

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String   @unique
  createdAt DateTime @default(now())
  results   Result[]
  settings  Json?    // serialized Settings object (themes, font, caret, behaviour)
}

model Result {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  wpm       Float
  accuracy  Float
  mode      String   // "time" | "words" | "quote"
  duration  Int      // seconds for time mode, word count for words mode
  timestamp DateTime @default(now())

  @@index([userId])
  @@index([mode, duration, wpm]) // for leaderboard queries
}
```

---

## 6. API Endpoints

All routes are prefixed with `/api/v1`. All protected routes require `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/results` | Required | Save a completed test result |
| GET | `/results/me` | Required | Get current user's results |
| GET | `/results/me/bests` | Required | Get personal bests per mode |
| GET | `/leaderboard/:mode/:duration` | Optional | Get top 100 for a mode |
| GET | `/settings` | Required | Fetch user settings (themes, appearance, behaviour) |
| PUT | `/settings` | Required | Save user settings (full object, debounced from client) |

---

## 7. UI & Design

> The full design system — including the complete theming architecture — is defined in `DESIGN.md` at the project root. **Read that file before writing any UI code.** What follows is a brief summary only.

### Summary
- Fully themeable. Every color is a CSS variable on `:root`. Never hardcode a hex value in a component.
- 10+ built-in preset themes (dark and light). Users can create fully custom themes via color pickers.
- Default theme: `default-dark` — near-black background, blue accent (`#4f8ef7`).
- Two fonts: `JetBrains Mono` (typing area, stats, logo, pills) and `Inter` (all other UI chrome). User can change the typing area font in settings.
- Typing characters have three states driven by CSS variables: `--char-correct`, `--char-incorrect`, `--char-untyped`.
- Caret is a DOM element colored with `var(--accent)`. Style (line / block / underline / off) and smooth mode are user settings.
- No gradients, no shadows, no animations in the typing area.
- Do not use a native `<input>` or `<textarea>` for the typing surface — capture keystrokes via `keydown` on `window` or a focused hidden element.
- Framer Motion is only used on the results screen (WPM count-up animation).

See `DESIGN.md` for: the full CSS variable spec, how to apply themes, all preset theme definitions, the custom theme editor spec, font/caret/behaviour settings, and the settings page layout.

---

## 8. Coding Conventions

- **TypeScript strict mode** everywhere. No `any`. No `// @ts-ignore`.
- All React components are functional. No class components.
- Component files are named `PascalCase.tsx`. Hook files are named `useCamelCase.ts`.
- Exports: use named exports. No default exports except for page-level route components.
- All API calls go through a centralized `lib/api.ts` Axios instance.
- Zustand stores are defined in `store/` with one file per domain (e.g., `gameStore.ts`, `authStore.ts`, `settingsStore.ts`).
- Do not put business logic in components. Components call hooks; hooks call services/stores.
- All user-facing strings are hardcoded in English for now. No i18n setup yet.
- Error boundaries should wrap the game area and the leaderboard.

---

## 9. Git Commits

After completing each step or logical unit of work, commit the changes. Do not batch multiple unrelated changes into a single commit.

Use **Conventional Commits** format for all commit messages:

```
<type>(<scope>): <short description>
```

**Types:**
| Type | When to use |
|---|---|
| `feat` | A new feature or capability |
| `fix` | A bug fix |
| `chore` | Tooling, config, dependencies, monorepo setup |
| `style` | CSS, design tokens, theme changes — no logic change |
| `refactor` | Code restructure with no behaviour change |
| `test` | Adding or updating tests |
| `docs` | Changes to `AGENTS.md`, `DESIGN.md`, or other docs |

**Scopes** should match the area of the codebase changed: `web`, `api`, `shared`, `game`, `theme`, `auth`, `leaderboard`, `settings`, `db`.

**Examples:**
```
chore(web): scaffold Vite + React + TypeScript + Tailwind
chore(shared): set up pnpm monorepo with Turborepo
style(web): define CSS variables and implement applyTheme
feat(web): implement useTypingEngine hook
feat(web): add preset themes to lib/themes.ts
feat(web): build typing area UI component
feat(api): add POST /results and GET /results/me endpoints
feat(web): build settings page with theme picker
test(web): add unit tests for useTypingEngine
fix(web): correct caret position on multi-byte characters
```

- Keep the short description under 72 characters, lowercase, no trailing period.
- Do not include a commit body unless the change genuinely needs explanation.
- Do not commit broken code — each commit should leave the project in a working state.

---

## 10. Development Commands

```bash
# Install dependencies
pnpm install

# Start both apps in dev mode
pnpm dev

# Start only frontend
pnpm --filter web dev

# Start only backend
pnpm --filter api dev

# Run all tests
pnpm test

# Type-check all packages
pnpm typecheck

# Lint
pnpm lint
```

---

## 11. Build Order & Phases

Build in this order. Do not skip phases.

### Phase 1 — Core Game (No Backend)
1. Set up monorepo (`pnpm workspaces`, `turbo`)
2. Scaffold `apps/web` with Vite + React + TypeScript + Tailwind
3. Define CSS variables in `index.css`; implement `applyTheme()` and `themeStore`
4. Implement all preset themes in `lib/themes.ts`
5. Create `useTypingEngine` hook with full unit tests
6. Build the typing area UI component (uses CSS variables, respects `fontFamily`/`fontSize` settings)
7. Build the mode selector (time/words/quote)
8. Build the live stats bar (WPM, timer, accuracy)
9. Build the results screen
10. Build the settings page: theme picker, custom theme editor, appearance settings, behaviour toggles
11. Wire up `localStorage` settings persistence via `settingsStore`
12. Add wordlists (`top-200.json`, `top-1000.json`, `quotes.json`)

### Phase 2 — Auth & Persistence
1. Scaffold `apps/api` with Express + TypeScript + Prisma
2. Integrate Supabase Auth (JWT verification middleware)
3. Implement `POST /results` and `GET /results/me` endpoints
4. Build login/signup UI
5. Build profile page with personal bests and history chart

### Phase 3 — Leaderboard
1. Add Redis to the API
2. Implement leaderboard update logic on result submission
3. Implement `GET /leaderboard/:mode/:duration` endpoint
4. Build leaderboard UI page

---

## 12. What NOT to Build (Yet)

Do not implement any of the following unless explicitly instructed:

- Multiplayer / live racing
- Keyboard layout support (Dvorak, Colemak, etc.)
- Sounds / audio feedback
- Mobile / touch support
- Browser extension
- Code typing mode
- Internationalization