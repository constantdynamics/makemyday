# Make My Day

> Laat het toeval je dag maken — ontdek spontane avonturen bij jou in de buurt.

**Make My Day** is een mobile-first Progressive Web App (PWA) die je met één draai aan het rad een verrassende activiteit voorschotelt: een écht café, museum, park of bezienswaardigheid in je omgeving (via OpenStreetMap), of een curated idee als je geen locatie deelt. Verzamel XP, bouw streaks op, voltooi uitdagingen en deel je avonturen met de community.

🔗 **Live:** https://constantdynamics.github.io/makemyday/

## ✨ Functionaliteit

- **Draairad** — één tik kiest een categorie en stelt een avontuur voor
- **Locatie-gebaseerd ontdekken** — echte plekken dichtbij via OpenStreetMap (Overpass), met straal- en categoriefilters, in lijst- én kaartweergave
- **Gamification** — XP, levels, dagstreaks en voltooide-activiteiten, server-side bijgehouden
- **Uitdagingen** — verdien extra XP met opdrachten van makkelijk tot moeilijk
- **Community** — deel je avonturen en geef likes
- **Profiel** — geschiedenis, avatar en voortgang
- **Accounts** — inloggen of als gast verkennen (Supabase auth)
- **Thema & taal** — licht/donker/systeem, Nederlands/Engels (standaard Nederlands)
- **Installeerbaar** — werkt offline als PWA op je telefoon

## 🏗️ Tech stack

- **Frontend:** React 18 + Vite + React Router 6 + TypeScript
- **Backend:** Supabase (auth + Postgres, RLS, RPC's voor gamification)
- **Kaarten/POI's:** OpenStreetMap + Leaflet + Overpass API
- **Hosting:** GitHub Pages (deploy via GitHub Actions)

## 🚀 Aan de slag

Vereisten: Node.js ≥ 20, npm ≥ 9.

```bash
npm run setup        # installeert de web-dependencies
npm run dev          # start de dev-server op http://localhost:3001
```

Of direct vanuit `web/`:

```bash
cd web
npm install
npm run dev
```

### Configuratie

De Supabase-URL en publishable key zitten als veilige fallback in `web/src/lib/config.ts` (beschermd door Row Level Security), dus de app werkt out-of-the-box. Overschrijven kan via `web/.env` — zie `web/.env.example`:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 📦 Build & deploy

```bash
npm run build        # productie-build → web/dist/
npm run preview      # bekijk de build lokaal
```

Pushen naar de deploy-branch bouwt en publiceert automatisch naar GitHub Pages via `.github/workflows/deploy.yml`.

## 📄 Licentie

MIT — zie [LICENSE](LICENSE).
