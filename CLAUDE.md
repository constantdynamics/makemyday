# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Root (from `/home/user/makemyday`)

```bash
npm install              # Install all workspace dependencies
npm run dev              # Start backend + frontend concurrently
npm test                 # Run tests across all workspaces
npm run docker:up        # Start Postgres, MongoDB, Redis via Docker
npm run docker:down      # Stop all database containers
```

### Web/PWA (from `web/`)
```bash
npm run dev              # Dev server at http://localhost:3001
npm run build            # TypeScript compile + Vite build → dist/
npm run preview          # Preview the production build
```

### Backend (from `backend/`)
```bash
npm run dev              # Start with nodemon (auto-restart)
npm run build            # TypeScript compile → dist/
npm test                 # Run Jest tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report (70% minimum threshold)
npm run migrate          # Run database migrations
npm run seed             # Seed DB with 150+ challenges + test data
```

### Running a single test
```bash
cd backend && npx jest src/path/to/file.test.ts
cd backend && npx jest --testNamePattern="test name"
```

## Architecture

This is an npm workspaces monorepo with four packages: `backend`, `frontend`, `web`, and `shared`.

### Web PWA (`web/`)

The active PWA is built with **React 18 + Vite + React Router**, deployed to GitHub Pages via the `.github/workflows/deploy.yml` CI/CD pipeline.

- **Language/i18n:** `src/contexts/LanguageContext.tsx` provides a global `useLanguage()` hook with a `t(key)` translation function. All translations (NL/EN) are co-located in this file. Language choice is persisted in `localStorage`.
- **Routing:** Flat route structure in `src/App.tsx`. All routes are defined there: `/`, `/login`, `/register`, `/dashboard`, `/explore`, `/challenges`, `/premium`, `/community`, `/settings`.
- **Icons:** Custom SVG icon components in `src/components/icons/`. Each icon accepts `size`, `color`, and `className` props. Export them via the index file at `src/components/icons/index.ts`.
- **Styling:** Per-screen CSS files (e.g. `DashboardScreen.css`). CSS custom properties (`--primary`, `--text-primary`, etc.) are defined in `src/index.css`.

### Backend (`backend/`)

**Express 4 + TypeScript** server using a three-database architecture:
- **PostgreSQL** — users, sessions, subscriptions (via `pg` connection pool)
- **MongoDB** — activities, challenges, community posts (via Mongoose)
- **Redis** — session cache, rate limiting (via ioredis)

All three connect on startup through `src/database/connection.ts`. Middleware stack: Helmet → CORS → Compression → JSON parsing → Performance monitoring → Routes → Error handler.

Route layout: `/api/v1/{auth,sessions,activities,challenges,user,premium}`. Controllers in `src/controllers/`, business logic in `src/services/`, input validation schemas (Joi) in `src/middleware/validation.ts`.

### Frontend mobile app (`frontend/`)

React Native + Expo managed workflow. State: Redux Toolkit with slices for `auth`, `session`, and `activity`. API calls go through `src/services/api.ts` (Axios with auto JWT refresh on 401).

### Shared (`shared/`)

TypeScript types and utilities shared between backend and frontend packages. No runtime dependencies.

## Key Constraints

- The web PWA is the **actively developed** surface. The React Native frontend and the backend exist but are not the primary focus.
- The deployed GitHub Pages URL is built from the `web/` package only — the CI workflow in `.github/workflows/deploy.yml` runs only `npm run build` inside `web/`.
- When adding new icons to the web app, create the component in `web/src/components/icons/` and export it from `index.ts`.
- When adding new routes to the web app, register them in both `web/src/App.tsx` and add navigation links where appropriate (dashboard quick-action cards, mobile nav bars).
- The PWA targets mobile-first with a fixed bottom navigation bar on all post-auth screens.
