# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Root (from `/home/user/makemyday`)

```bash
npm run setup            # Install web dependencies (bash scripts/setup.sh)
npm run dev              # Start the web dev server (proxies to web/)
npm run build            # Build the PWA → web/dist/
npm run format           # Prettier across web/src
```

### Web/PWA (from `web/`)
```bash
npm run dev              # Dev server at http://localhost:3001
npm run build            # TypeScript compile + Vite build → dist/
npm run preview          # Preview the production build
npm run gen:icons        # Regenerate PWA app icons (scripts/gen-icons.mjs)
```

## Architecture

The repository is a single **React 18 + Vite + React Router 6 + TypeScript** PWA in `web/`, backed by **Supabase** (auth + Postgres) and deployed to GitHub Pages via `.github/workflows/deploy.yml` (builds on Node 22).

> History: this used to be an npm-workspaces monorepo with `backend` (Express), `frontend` (React Native), and `shared` packages. Those were removed in v2 — the web PWA is now the entire app, with Supabase as the backend.

Folder layout under `web/src/`:
- `lib/` — framework-agnostic helpers: `supabase.ts` (typed client), `config.ts` (env + public Supabase fallback), `geo.ts` (geolocation + haversine), `overpass.ts` (live OpenStreetMap POI search), `format.ts`.
- `types/db.ts` — hand-written Supabase schema types scoped to the `mmd_` tables. **Row types must be `type` aliases, not `interface`**, or supabase-js falls back to `never`.
- `contexts/` — `AuthContext` (session/profile/guest mode), `ThemeContext` (light/dark/system), `ToastContext`.
- `i18n/` — `I18nProvider` + `useI18n()` exposing `t(key, vars?)` with `{var}` interpolation; dictionaries in `strings.ts` (NL/EN), persisted in `localStorage`. **Defaults to Dutch.**
- `hooks/` — data hooks: `useCatalog`, `useNearby`, `useCompletions`, `useChallenges`.
- `components/ui/` — design-system primitives (`Button`, `Card`, `Sheet`, `Segmented`, `primitives.tsx`). `components/icons/Icon.tsx` is a single name-keyed SVG registry (`<Icon name="dice" />`). `components/layout/AppShell` is the auth/guest gate + bottom nav.
- `features/<name>/` — one folder per screen with co-located `.css`.

- **Backend:** Supabase project shared with other apps; every Make My Day table/function is prefixed `mmd_`. Gamification (XP/streak/level) runs server-side via the `mmd_complete_activity` / `mmd_complete_challenge` RPCs. RLS: catalog tables are world-readable; user data is owner-only.
- **Routing:** `/`, `/auth`, `/premium`, `/settings`, plus a nested `/app` shell with `index` (dashboard), `explore`, `challenges`, `community`, `profile`. Feature screens are `React.lazy`-loaded.
- **Styling:** design tokens in `src/styles/tokens.css` (`--brand-*`, semantic `--bg`/`--text`, dark via `[data-theme="dark"]`), base in `global.css`, shared components in `app.css`, per-feature CSS co-located.

## Key Constraints

- The deployed GitHub Pages URL is built from the `web/` package only.
- When adding a new icon, add its path to the registry in `web/src/components/icons/Icon.tsx` (no new files needed).
- When adding new routes, register them in `web/src/App.tsx` and add navigation links where appropriate (bottom nav in `components/layout/BottomNav.tsx`, dashboard cards).
- The PWA targets mobile-first with a fixed bottom navigation bar on all `/app` screens.
- New user-facing strings must be added to both `nl` and `en` dictionaries in `web/src/i18n/strings.ts`.
