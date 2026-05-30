# 🚀 Deployment — Make My Day

De app is een statische PWA in `web/` die automatisch naar **GitHub Pages** wordt gepubliceerd.

## Automatisch (aanbevolen)

Elke push naar de deploy-branch triggert `.github/workflows/deploy.yml`:

1. **build** — `npm ci` + `npm run build` in `web/` op Node 22, en uploadt `web/dist/` als Pages-artifact.
2. **deploy** — publiceert het artifact naar GitHub Pages.

Eenmalig instellen: **Settings → Pages → Build and deployment → Source = "GitHub Actions"**.

Live URL: **https://constantdynamics.github.io/makemyday/**

> De `base` in `web/vite.config.ts` staat op `/makemyday/`, passend bij de repo-naam. Wijzigt de repo-naam of host (bijv. custom domein), pas dan ook deze `base` aan.

## Handmatig

```bash
cd web
npm install
npm run deploy        # build + push naar de gh-pages branch via gh-pages
```

## Configuratie

Supabase-URL en publishable key zitten als fallback in `web/src/lib/config.ts` (veilig — beschermd door RLS), dus er zijn **geen CI-secrets nodig**. Overschrijven kan via `web/.env` (zie `web/.env.example`).
