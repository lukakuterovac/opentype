# OpenType

A fast, minimal, themeable typing speed test built for the web.

![OpenType screenshot](./docs/screenshot.png)

## Features

- **Typing engine** — character-by-character input tracking with real-time WPM, accuracy, and error classification
- **Test modes** — time-based (15s, 30s, 60s, 120s), word-count (10, 25, 50, 100), and quote mode
- **Guest mode** — no account required; settings and preferences stored in `localStorage`
- **10+ preset themes** — dark and light, with a full CSS variable theming system and a custom theme editor
- **User accounts** — Supabase Auth (email/password + Google OAuth), persisted results, personal bests, and WPM history
- **Leaderboard** — top 100 per mode/duration backed by Redis sorted sets
- **Results screen** — detailed stats with retry and next-test flows
- **Fully configurable** — font family/size, caret style, behaviour toggles (blind mode, stop on error, quick restart, and more)

## Tech Stack

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

## Monorepo Structure

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
│           ├── types.ts
│           └── constants.ts
│
├── pnpm-workspace.yaml
├── AGENTS.md
├── DESIGN.md
└── turbo.json
```

## Getting Started

### Prerequisites

- **Node.js 20+**
- **pnpm** — install via `npm install -g pnpm` or `corepack enable`
- **PostgreSQL** (or a Railway-managed instance for production)

### Setup

```bash
# Install all dependencies
pnpm install

# Copy environment variables for each app
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# Fill in the values in apps/web/.env and apps/api/.env

# Start both apps in dev mode
pnpm dev
```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:3000`.

## Environment Variables

### `apps/web/.env`

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL for the backend API | `http://localhost:3000/api/v1` |

### `apps/api/.env`

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/opentype?schema=public` |
| `PORT` | API server port | `3000` |
| `SUPABASE_URL` | Supabase project URL | — |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | — |

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start both frontend and backend in dev mode |
| `pnpm build` | Build all packages for production |
| `pnpm test` | Run all tests across the monorepo |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Run TypeScript type-checking across all packages |
| `pnpm format` | Format code with Prettier |

## Theming

Every color in the UI is defined as a CSS variable on `:root` — components never use hardcoded hex values. Themes are plain JS objects that map variable names to colors, applied by writing values onto `:root` via JavaScript. OpenType ships with 10+ preset themes (including Default Dark, Dracula, Nord, Gruvbox, Catppuccin, and a light theme), and users can create fully custom themes via color pickers in the settings page. See `DESIGN.md` for the full CSS variable specification and all preset theme definitions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) with one of these scopes: `web`, `api`, `shared`, `game`, `theme`, `auth`, `leaderboard`, `settings`, `db`
4. Open a pull request

## License

[MIT](./LICENSE)
