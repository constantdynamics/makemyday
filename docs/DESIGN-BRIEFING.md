# Make My Day — Design Briefing

**Voor:** Claude Design (of elke designer/AI die schermontwerpen maakt)
**Product:** Make My Day — PWA, versie 2.1.0
**Live:** https://constantdynamics.github.io/makemyday/
**Datum briefing:** augustus 2026
**Status van de app:** volledig werkend, mobile-first, Nederlands-eerst (NL/EN), donker thema als standaard

---

## 0. Hoe je deze briefing gebruikt

Deze briefing beschrijft **alles wat er nu in de app zit** — elk scherm, elke knop, elke
staat, elke tekst en elk design-token. Het is een *inventaris*, geen keurslijf: de
bedoeling is dat je hiermee mooiere, sterkere schermontwerpen maakt.

Werk per scherm. Elk scherm in hoofdstuk 7 heeft dezelfde opbouw:

| Onderdeel | Wat je erin vindt |
| --- | --- |
| **Route & toegang** | URL, wie het scherm ziet, hoe je er komt en weer weg |
| **Doel** | Wat de gebruiker hier komt doen — de enige taak die telt |
| **Layout** | Elk blok van boven naar beneden |
| **Knoppen & acties** | Elke knop: label (NL/EN), type, wat er gebeurt |
| **Staten** | Leeg, laden, fout, gast, premium, offline |
| **Design-opdracht** | Waar je vrij bent, waar je juist scherp moet zijn |

**Harde regels** (breek deze niet):

1. **Mobile-first**, contentkolom max **480px** breed, gecentreerd. Desktop = dezelfde
   kolom op een rustige achtergrond, geen aparte desktoplayout.
2. **Vaste bottom-nav** op alle `/app`-schermen — houd 68px + safe-area vrij onderaan.
3. **Donker is de standaard.** Licht thema moet volwaardig zijn, niet een afgeleide.
4. **Alle teksten tweetalig** (NL + EN). Ontwerp met de langste van de twee.
5. **Eén primaire actie per scherm.** De rest is secundair of ghost.

---

## 1. Het product in het kort

**Make My Day laat het toeval je dag bepalen.** Je draait aan een rad, het rad kiest een
categorie, en de app geeft je één concreet avontuur — het liefst een échte plek bij je in
de buurt (via OpenStreetMap). Je doet het, vinkt het af, verdient XP, bouwt een streak.

**Kernbelofte:** geen keuzestress. Eén tik → één opdracht → doen.

**Doelgroep:** 20–40 jaar, stedelijk, Nederlandstalig, mobiel. Mensen die "wat zullen we
doen?" zat zijn. Speels maar niet kinderachtig; premium maar niet zakelijk.

**Toon:** direct, enthousiast, tweede persoon ("Draai het rad", "Ik doe het!"). Nooit
formeel. Nooit betuttelend.

**De vier pijlers** (zoals ze op het welkomstscherm staan):

1. Échte plekken dichtbij — activiteiten op basis van je locatie
2. Draai & doe — het rad kiest voor jou
3. Verzamel & groei — streaks, XP, levels, uitdagingen
4. Deel & inspireer — community-feed

**Techniek in één zin:** React 18 + Vite PWA, Supabase als backend, OpenStreetMap
(Overpass) voor plekken, Open-Meteo voor weer, Leaflet voor de kaart.

---

## 2. Merk & sfeer — "Midnight Aurora"

De huidige visuele taal heet **Midnight Aurora**: bijna-zwart violet als basis, met
noorderlicht-achtige gradiënten die achter matglazen panelen door drijven.

**De vier ingrediënten:**

1. **Aurora-achtergrond** — twee grote, langzaam driftende gradient-bollen (violet/magenta
   linksboven, cyaan/violet rechtsonder), zwaar geblurd (70px), animatie van 26s en 32s.
   Ze zitten *achter* alles (`z-index: -1`) en bewegen nooit met de scroll mee.
2. **Glassmorphism** — panelen zijn halftransparant wit (5–8%) met `backdrop-filter:
   blur(18px) saturate(150%)`, een dunne lichte rand en een `inset` highlight bovenaan.
3. **Aurora-gradient als accent** — violet → magenta → warm oranje. Alleen voor primaire
   acties, actieve staten en voortgang. Sparzaam gebruiken: het moet knallen.
4. **Speelse "kermis"-details** rond het rad — 16 lampjes in de rand die twinkelen en
   tijdens het draaien rondjagen.

**Wat we níét zijn:** flat material design, corporate blauw, illustratie-zwaar,
skeuomorfisch. Geen stockfoto's van lachende mensen.

**Waar het nu wringt** (kansen voor jou):
- Het donkere thema is sterk uitgewerkt; het lichte thema voelt als een afgeleide.
- Veel schermen zijn "kaart onder kaart onder kaart" — er is weinig hiërarchisch ritme.
- Het rad is de held, maar het dashboard eromheen concurreert ermee om aandacht.

---

## 3. Design tokens (exacte huidige waarden)

Bron: `web/src/styles/tokens.css`. Neem deze als startpunt — je mag ze verbeteren, maar
lever dan een expliciete token-lijst mee zodat we ze 1-op-1 kunnen overnemen.

### 3.1 Merkkleuren

| Token | Hex | Gebruik |
| --- | --- | --- |
| `--brand-50` | `#f3f0ff` | lichtste tint |
| `--brand-100` | `#e5deff` | |
| `--brand-200` | `#cbbdff` | |
| `--brand-300` | `#ad94ff` | primary-strong (donker thema) |
| `--brand-400` | `#9d7bff` | **primary in donker thema** |
| `--brand-500` | `#7c5cff` | kernviolet, start van de gradient |
| `--brand-600` | `#6443e8` | **primary in licht thema** |
| `--brand-700` | `#4f32be` | primary-strong (licht thema) |
| `--accent-400` | `#ff6ad5` | magenta accent |
| `--accent-500` | `#ef4bbd` | magenta in de gradient |
| `--accent-600` | `#d12da1` | |
| `--amber-400` | `#ffc56b` | warme gloed |
| `--amber-glow` | `#ff8a5c` | einde van de gradient, lampjes |
| `--cyan-400` | `#4cc9f0` | tweede aurora-bol |

### 3.2 Functionele kleuren

| Token | Hex | Gebruik |
| --- | --- | --- |
| `--green-500` | `#34d399` | voltooid, succes, "open nu" |
| `--amber-500` | `#fbbf24` | streak, moeilijkheid "gemiddeld" |
| `--red-500` | `#f87171` | fout, uitloggen, moeilijkheid "moeilijk" |
| `--sky-500` | `#38bdf8` | |
| `--pink-500` | `#f472b6` | |

### 3.3 Gradiënten

```css
--gradient-brand: linear-gradient(135deg, #7c5cff 0%, #c14fe0 46%, #ef4bbd 72%, #ff8a5c 100%);
--gradient-hero:  radial-gradient(125% 125% at 50% 0%, #9d7bff 0%, #7c5cff 42%, #2c1c6e 100%);
--gradient-text:  linear-gradient(100deg, #ad94ff 0%, #ff6ad5 55%, #ff8a5c 100%);
```

`--gradient-brand` is de werkpaard-gradient: primaire knoppen, actieve nav-icoon, actieve
chip/pill/segment, voortgangsbalk, radnaaf, radwijzer.

### 3.4 Semantische kleuren

| Token | Donker (standaard) | Licht |
| --- | --- | --- |
| `--bg` | `#08070f` | `#f5f4fc` |
| `--bg-elevated` | `#15131f` | `#ffffff` |
| `--surface` | `rgba(255,255,255,.05)` | `rgba(255,255,255,.82)` |
| `--surface-2` | `rgba(255,255,255,.08)` | `rgba(124,92,255,.07)` |
| `--surface-3` | `rgba(255,255,255,.13)` | `rgba(124,92,255,.13)` |
| `--border` | `rgba(255,255,255,.09)` | `rgba(34,24,80,.09)` |
| `--border-strong` | `rgba(255,255,255,.18)` | `rgba(34,24,80,.18)` |
| `--text` | `#f2f0fc` | `#17142c` |
| `--text-secondary` | `#aaa6c6` | `#5e5980` |
| `--text-tertiary` | `#716c90` | `#8e89ac` |
| `--primary` | `--brand-400` | `--brand-600` |
| `--ring` (focus) | `rgba(157,123,255,.45)` | `rgba(124,92,255,.32)` |

### 3.5 Glas

| Token | Donker | Licht |
| --- | --- | --- |
| `--glass` | `rgba(255,255,255,.045)` | `rgba(255,255,255,.66)` |
| `--glass-strong` | `rgba(255,255,255,.08)` | `rgba(255,255,255,.82)` |
| `--glass-border` | `rgba(255,255,255,.10)` | `rgba(255,255,255,.85)` |
| `--glass-nav` | `rgba(16,14,28,.66)` | `rgba(255,255,255,.72)` |
| `--glass-sheet` | `rgba(21,19,33,.88)` | `rgba(255,255,255,.92)` |
| `--glass-highlight` | `inset 0 1px 0 rgba(255,255,255,.07)` | `inset 0 1px 0 rgba(255,255,255,.95)` |
| `--blur` | `18px` | `18px` |

### 3.6 Typografie

- **Display** (koppen h1–h4): `Space Grotesk Variable` — `line-height: 1.12`,
  `letter-spacing: -0.02em` (h1: `-0.035em`), `font-weight: 600`, `text-wrap: balance`
- **Sans** (body, UI): `Inter Variable` — `line-height: 1.5`,
  `font-feature-settings: 'cv11','ss01'`
- **Cijfers in statistieken**: `font-variant-numeric: tabular-nums` (anders springen de
  tellers)

| Token | Waarde | Typisch gebruik |
| --- | --- | --- |
| `--fs-xs` | 0.75rem / 12px | badges, labels |
| `--fs-sm` | 0.875rem / 14px | secundaire tekst, chips, knoppen sm |
| `--fs-md` | 1rem / 16px | body |
| `--fs-lg` | 1.125rem / 18px | sectiekoppen, knoppen lg |
| `--fs-xl` | 1.375rem / 22px | statwaarden |
| `--fs-2xl` | 1.75rem / 28px | schermtitels (h1) |
| `--fs-3xl` | 2.25rem / 36px | welkomstscherm-titel |

Gewichten: 400 regular · 500 medium · 600 semibold · 700 bold.

### 3.7 Ruimte, radius, schaduw, motion

**Spacing** (4px-basis): `--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 16 · `--sp-5` 20
· `--sp-6` 24 · `--sp-8` 32 · `--sp-10` 40 · `--sp-12` 48 · `--sp-16` 64

**Radius:** `--r-sm` 10 · `--r-md` 14 · `--r-lg` 20 (kaarten) · `--r-xl` 28 (sheet, stage)
· `--r-full` 999

**Schaduwen:** `--shadow-xs` t/m `--shadow-lg` (donkere, dubbele schaduwen) plus
`--shadow-nav` en `--shadow-brand` (`0 10px 32px rgba(124,92,255,.42)` — de violette gloed
onder primaire elementen).

**Motion:**
- `--ease: cubic-bezier(.22,1,.36,1)` — standaard
- `--ease-bounce: cubic-bezier(.34,1.56,.64,1)` — pop-ins, actieve nav
- `--t-fast` 140ms · `--t-med` 260ms · `--t-slow` 450ms
- Alles respecteert `prefers-reduced-motion: reduce` (animaties → 0.01ms)

**Layout:** `--app-max: 480px` · `--nav-h: 68px`

---

## 4. Componentbibliotheek

Elk component hieronder bestaat al. Ontwerp ze consistent door alle schermen heen.

### 4.1 Button

Vier varianten × drie maten. `Button` heeft: `variant`, `size`, `block`, `loading`,
`icon` (links), `iconRight`, `disabled`.

| Variant | Vulling | Tekst | Rand |
| --- | --- | --- | --- |
| `primary` | `--gradient-brand` + `--shadow-brand` + inset highlight | wit | geen |
| `secondary` | `--surface-2` + blur | `--text` | `--border` |
| `ghost` | transparant | `--primary` | 1.5px `--border-strong` |
| `danger` | rood 14% | `--red-500` | geen |

| Maat | Padding | Tekstgrootte | Radius | Icoongrootte |
| --- | --- | --- | --- | --- |
| `sm` | 8/14 | 14px | `--r-md` | 18 |
| `md` | 12/18 | 16px | `--r-md` | 18 |
| `lg` | 16/22 | 18px | `--r-lg` | 20 |

Gedrag: `:active` → `scale(.97)` · `:disabled` → `opacity .55` · `loading` → icoon wordt
een draaiende ring, knop is disabled · `primary:hover` → glansveeg loopt diagonaal over de
knop (600ms) + 1px omhoog.

### 4.2 Card

Glaspaneel: `--glass`, 1px `--glass-border`, radius `--r-lg` (20px), padding `--sp-4`,
`--shadow-sm` + glass highlight, blur 18px.
Variant `interactive`: hover → 3px omhoog, `--glass-strong`, sterkere schaduw, sterkere
rand; active → `scale(.99)`.

### 4.3 Sheet (bottom sheet, doet ook dienst als modal)

- Backdrop `rgba(4,3,10,.6)` + blur 4px, sluit bij klik ernaast, Escape sluit ook
- Paneel schuift van onder omhoog (`translateY(100%)` → `0`, 260ms), max-hoogte 88dvh,
  scrollt intern
- Bovenaan een grab-handle van 38×4px, dan een kop met titel (18px) + ronde sluitknop
  (34px, `x`-icoon)
- Achtergrond `--glass-sheet` met blur 34px, radius 28px alleen boven, respecteert
  safe-area onderaan
- Body-scroll wordt vergrendeld zolang de sheet open is

**Er zijn drie sheets in de app:** sessie-instellingen, avontuur-resultaat, profiel
bewerken.

### 4.4 Segmented control

Inline pillenbalk: `--surface-2`, 1px rand, radius 14px, padding 4px, items 14px medium.
Actief item krijgt `--gradient-brand`, witte tekst en `--shadow-brand`. Items mogen een
icoon dragen (16px). Gebruikt op: onboarding (vervoer/gezelschap), dashboard-sheet,
ontdek (lijst/kaart), instellingen (thema/taal), premium (maand/jaar).

### 4.5 Chip & Pill

- **Chip** (`.chip`): 8/14 padding, volledig rond, `--surface` + blur, 14px medium. Actief
  → aurora-gradient + witte tekst. In `.chips` staan ze in een horizontaal scrollende rij
  die tot de schermrand doorloopt (scrollbar verborgen).
- **Pill** (`.pill`): kleiner (6/13), voor de straal-keuze op Ontdek.
- **Uitzondering:** op Ontdek krijgt een actieve categorie-chip de *categoriekleur* als
  achtergrond in plaats van de aurora-gradient.

### 4.6 Badge

Klein rond label, 12px semibold, 3/10 padding. Twee tonen: `soft` (kleur op 16%
transparantie, gekleurde tekst — standaard) en `solid` (volle kleur, witte tekst).

### 4.7 Overige primitives

| Component | Spec |
| --- | --- |
| **Avatar** | Ronde emoji-tegel, `--surface-2` + rand. Maten in gebruik: 40 (composer), 42 (post), 72 (profiel) |
| **ProgressBar** | 8px hoog, `--surface-2` spoor, aurora-gradient vulling met violette gloed, 450ms overgang |
| **Spinner** | Ring van 3px, `--surface-3` met `--primary` als bovenrand, 0.7s rotatie |
| **Skeleton** | Shimmer-gradient (`--surface-2` → `--surface-3` → `--surface-2`), 1.3s loop |
| **EmptyState** | Rond icoonvlak 68px + titel (18px) + optionele body (max 32 tekens breed) + optionele actieknop, gecentreerd, 40px verticale padding |
| **Toast** | Glaspaneel, verschijnt boven de nav (`--nav-h + 24px`), pop-in met bounce, 3.2s zichtbaar, gekleurde rand + gloed per soort (succes groen, fout rood, info violet) |
| **StatGrid** | 4 kolommen, elk een glastegel: gekleurd icoon 18px, waarde (Space Grotesk bold 22px, tabular), label 10.5px |
| **POI-row** | 42px gekleurde icoontegel + naam/subtitel (afgekapt) + afstand rechts; op Ontdek ook een navigatie-icoonknop |
| **Form field** | Label 14px medium erboven, input met `--surface`, 1.5px `--border-strong`, radius 14px, padding 13/14; focus → `--primary` rand + 3px ring |
| **icon-btn** | Ronde knop 40×40, `--text-secondary`, hover `--surface-2` |

---

## 5. Iconenset

Eén SVG-registry (`Icon.tsx`), 53 iconen, alle stroke-based en op de `currentColor` van de
ouder. Bestaande namen:

```
activity   bike       bolt        camera     car        chart      check
check-circle  chevron-down  chevron-left  chevron-right  clock  cloud
cloud-rain compass    crown       dice       edit       fire       globe
heart      home       image       info       landmark   leaf       list
lock       logout     map-pin     message    moon       music      name
navigation palette    plus        refresh    search     settings   share
shopping   sliders    sparkles    star       sun        target     trophy
user       users      utensils    walk       x
```

Ontwerp je nieuwe iconen? Houd dezelfde stijl: 24×24 viewBox, 2px stroke, ronde uiteinden,
geen vulling. Lever ze aan als losse `<path d="…">`-strings — ze gaan in dezelfde registry.

---

## 6. Navigatie & flows

### 6.1 Routekaart

```
/                    Welkom (publiek)         → /auth of gastmodus
/auth?mode=login     Inloggen
/auth?mode=register  Registreren
/onboarding          Onboarding (3 stappen, eenmalig)
/premium             Premium (volledig scherm, sluitbaar)
/settings            Instellingen (volledig scherm, terugknop)

/app                 ── AppShell (auth/gast-poort + bottom-nav) ──
  /app               Dashboard  (Start)
  /app/explore       Ontdek
  /app/challenges    Uitdagingen
  /app/community     Community
  /app/profile       Profiel

*                    → redirect naar /
```

De app draait onder basename `/makemyday`.

### 6.2 De poort van AppShell

Elk `/app`-scherm loopt door deze drie checks:

1. Sessie laadt nog én geen sessie én geen gast → **gecentreerde spinner**
2. Geen sessie én geen gast → **redirect naar `/`**
3. Nog niet ge-onboard (`localStorage`) → **redirect naar `/onboarding`**

### 6.3 De hoofdflow (dit is het hart van het product)

```
Dashboard → tik op rad → 5s draaien → rad landt op categorie
   → sheet "Jouw avontuur" opent
      ├─ "Ik doe het!"  → (optioneel foto + rating) → XP-toast → sheet sluit
      ├─ "Afhaken (n)"  → streak breekt → info-toast → sheet sluit
      └─ "Navigeer"     → opent kaart-app in nieuw tabblad
```

**Gastmodus:** een gast mag draaien en kijken, maar bij "Ik doe het!", bij het voltooien
van een uitdaging en bij posten in de community volgt: toast "Log in om dit te doen" +
doorsturen naar registreren.

### 6.4 Drie gebruikerstoestanden — ontwerp ze alle drie

| Toestand | Wat werkt | Wat niet |
| --- | --- | --- |
| **Gast** | Draaien, ontdekken, uitdagingen bekijken, feed lezen | Voltooien, uitdaging afvinken, posten, liken, profiel |
| **Ingelogd (gratis)** | Alles | 1× afhaken per sessie, straal beperkt tot vervoerskeuze |
| **Premium** | Alles | 5× afhaken per sessie, verder identiek (voorlopig) |

---

## 7. De schermen

### 7.1 Welkom — `/`

**Route & toegang:** publiek. Eerste scherm. Wie al ingelogd is of gast is, wordt direct
doorgestuurd naar `/app`.

**Doel:** in vijf seconden duidelijk maken wat de app doet, en één van drie deuren kiezen.

**Layout, van boven naar beneden:**

1. **Taalknop** rechtsboven — `globe`-icoon 16px + "NL" / "EN", wisselt direct
2. **Hero** — rond logovlak met `compass`-icoon 40px in wit, titel "Make My Day"
   (36px display), tagline, subtitel
3. **Vier feature-rijen** — elk een gekleurde ronde icoontegel (22px icoon) + kop + regel
4. **CTA-blok** onderaan

**Knoppen:**

| Knop | Label NL / EN | Type | Actie |
| --- | --- | --- | --- |
| Taal | `NL` / `EN` | tekstknop + globe | wisselt taal |
| Start | "Begin je avontuur" / "Start your adventure" | primary, lg, block, `chevron-right` rechts | → `/auth?mode=register` |
| Gast | "Verken als gast" / "Explore as guest" | secondary, lg, block, `compass` links | zet gastvlag → `/app` |
| Inloggen | "Ik heb al een account" / "I already have an account" | platte tekstknop | → `/auth?mode=login` |

**De vier features (kop / regel, met icoon en kleur):**

| Icoon | Kleur | NL kop | NL regel |
| --- | --- | --- | --- |
| `map-pin` | groen | Échte plekken dichtbij | Activiteiten op basis van jouw locatie via OpenStreetMap. |
| `dice` | violet | Draai & doe | Geen keuzestress — het rad kiest voor jou. |
| `trophy` | amber | Verzamel & groei | Streaks, XP, levels en uitdagingen houden je scherp. |
| `users` | roze | Deel & inspireer | Laat je avonturen zien en raak geïnspireerd door anderen. |

**Design-opdracht:** dit is het enige scherm waar je écht mag uitpakken. Het rad mag hier
al zichtbaar zijn als teaser. Zoek naar één beeldelement dat het "toeval"-idee meteen
overbrengt. Let op: de drie CTA's mogen niet met elkaar concurreren — één primaire deur,
twee zachte.

---

### 7.2 Inloggen / Registreren — `/auth?mode=login|register`

**Route & toegang:** publiek. Eén scherm dat via de `mode`-parameter tussen twee standen
schakelt.

**Doel:** zo min mogelijk wrijving tussen "ik wil dit" en "ik ben binnen".

**Layout:**

1. **Terugknop** linksboven (`chevron-left` 22px) → `/`
2. **Kop** — rond logovlak met `compass` 28px, titel, subtitel (verschilt per stand)
3. **Formulier**
4. **Wisseltekst** tussen inloggen/registreren
5. **Scheiding** met tekst "Of ga verder als gast"
6. **Gastknop**

**Twee standen:**

| | Registreren | Inloggen |
| --- | --- | --- |
| Titel | "Maak een account" | "Welkom terug" |
| Subtitel | "Begin met het verzamelen van herinneringen." | "Log in om verder te gaan met je avonturen." |
| Velden | Naam, E-mailadres, Wachtwoord | E-mailadres, Wachtwoord |
| Knop | "Account aanmaken" | "Inloggen" |
| Wisseltekst | "Al een account? **Inloggen**" | "Nog geen account? **Aanmelden**" |

**Velden:** Naam (placeholder `Alex`), E-mailadres (placeholder `jij@email.com`),
Wachtwoord (placeholder `••••••••`, minimaal 6 tekens). Alle drie verplicht.

**Knoppen:**

| Knop | Type | Actie |
| --- | --- | --- |
| Terug | icoonknop | → `/` |
| Verzenden | primary, lg, block, met `loading`-stand | inloggen of registreren → `/app` |
| Wisselen | inline tekstknop | wisselt `mode` |
| Gast | ghost, block, `compass` | gastmodus → `/app` |

**Staten:**
- **Bezig** — verzendknop toont draaiende ring, is disabled
- **E-mailbevestiging nodig** — info-toast "Bijna klaar! Bevestig je e-mail om in te
  loggen." en het scherm springt naar de inlogstand
- **Fout** — rode toast met de foutmelding van de server

**Design-opdracht:** het formulier is nu functioneel maar vlak. Denk aan: hoe voelt de
overgang tussen registreren en inloggen (velden die in-/uitschuiven)? Kan de gastknop
minder een bijzaak zijn zonder de primaire actie te verzwakken?

---

### 7.3 Onboarding — `/onboarding`

**Route & toegang:** eenmalig, automatisch, direct nadat iemand voor het eerst `/app`
probeert te bereiken. De vlag staat in `localStorage`, dus dit scherm komt daarna nooit
terug.

**Doel:** drie dingen uitleggen (het rad, je sessie, je locatie) zonder iemand te
vertragen. Overslaan moet altijd kunnen.

**Vaste chrome:**
- **Bovenaan:** drie voortgangs-dots (actieve dot is breder/feller) + "Overslaan"-knop
  rechts
- **Onderaan:** primary lg block-knop — "Volgende" (met `chevron-right`) op stap 1–2, "Aan
  de slag" op stap 3

**Stap 1 — Draai en laat je verrassen**
- Kunstvlak: ronde gradient-tegel met gloed + `dice`-icoon 52px in wit
- Kop: "Draai en laat je verrassen"
- Tekst: "Eén tik op het rad en je hebt een spontaan avontuur — geen keuzestress, gewoon
  doen."

**Stap 2 — Stel je sessie in** (interactief)
- Kunstvlak met `sliders`-icoon 46px
- Kop: "Stel je sessie in" · Tekst: "Vervoer, tijd en gezelschap — het rad houdt er
  rekening mee. Je kunt dit altijd aanpassen."
- **Vervoer** — segmented: Lopen (`walk`) · Fiets (`bike`) · Auto (`car`) — standaard Fiets
- **Beschikbare tijd** — chips: 30 min · 1 uur · 2 uur · 4 uur — standaard 2 uur
- **Gezelschap** — segmented: Alleen (`user`) · Samen (`heart`) · Groep (`users`) —
  standaard Alleen

**Stap 3 — Échte plekken dichtbij**
- Kunstvlak met `map-pin`-icoon 46px
- Kop: "Échte plekken dichtbij" · Tekst: "Met locatie aan stelt het rad échte plekken bij
  jou in de buurt voor, via OpenStreetMap."
- **Knop:** "Locatie inschakelen" (primary lg, `navigation`-icoon, met laadstand)
- **Na toestemming:** de knop verdwijnt en wordt een groen bevestigingslabel "Locatie
  staat aan" met `check-circle`
- **Extra uitweg:** als locatie nog niet aan staat, verschijnt onder de hoofdknop een
  platte tekstknop "Misschien later"

**Design-opdracht:** dit is de meest ontwerpbare flow in de app — drie stappen, veel
ruimte, weinig tekst. De "kunstvlakken" zijn nu simpele icoon-in-cirkel. Vervang ze door
iets dat het idee toont (een half zichtbaar rad dat draait, een kaartfragment met een
pulserende punt). Let op dat stap 2 zowel uitleg als bediening is — die dubbelrol moet
kloppen.

---

### 7.4 Dashboard — `/app` (nav: "Start")

Het belangrijkste scherm. Als je maar tijd voor één scherm hebt, doe dit scherm.

**Doel:** in twee tikken van "verveel me" naar "ik ga iets doen".

**Layout, van boven naar beneden:**

1. **Begroeting** — links: tijdsafhankelijke groet + naam + 👋; rechts: ronde avatarknop
   met de emoji van de gebruiker → `/app/profile`
   Groeten: Goedenacht (<6u) · Goedemorgen (<12u) · Goedemiddag (<18u) · Goedenavond
2. **StatGrid** — 4 tegels: Voltooid (`check-circle`, groen) · Streak (`fire`, amber) · XP
   (`bolt`, violet) · Level (`trophy`, magenta)
3. **Sessiebalk** — één brede knop met drie pillen (vervoersicoon + label · `clock` + tijd
   · gezelschapsicoon + label) en rechts een `sliders`-icoon → opent de sessie-sheet
4. **Weerchip** *(alleen met locatie)* — weersicoon + korte tekst (bijv. "Regen 8°"), en
   bij slecht weer de toevoeging "· binnen-tips"
5. **Spin-podium** — glaspaneel met een pulserende aurora-gloed erachter: kop "Draai het
   rad", hint "Tik op het rad voor een spontane suggestie", en het **rad**
6. **Locatiekaart** *(alleen als locatie uit staat)* — `map-pin`, "Zet locatie aan voor
   échte plekken dichtbij", "We tonen voorbeeld-ideeën zolang je locatie uit staat.", knop
   sm "Locatie inschakelen"
7. **In de buurt** *(alleen met resultaten)* — sectiekop + link "Bekijk alles" → Ontdek,
   daaronder maximaal **4** POI-rijen; elke rij is klikbaar → Ontdek

**Het rad — exacte specificatie**

| Onderdeel | Spec |
| --- | --- |
| Diameter | 292px |
| Halo | radiale gloed die 22px buiten het rad uitsteekt |
| Rand (bezel) | donkere gradient `#232038 → #0d0b18`, in licht thema `#fff → #dcd7f2` |
| Lampjes | **16** stuks, 7px, `#ffe3b0` met amberen gloed, op straal 138px. Rust: twinkelen (2.6s, versprongen per lampje). Draaien: jagen rond (0.85s) |
| Wijzer | driehoek 26×30px bovenaan, aurora-gradient, met violette drop-shadow; schuift 3px omhoog tijdens het draaien |
| Schijf | conic-gradient met **8** segmenten in de categoriekleuren (45° per segment), 16px binnen de rand |
| Spaken | witte lijntjes van 0.6° op elke segmentgrens |
| Segment-iconen | categorie-icoon 22px wit, op straal 92px, altijd rechtop |
| Glans | radiale witte highlight linksboven — maakt de schijf bol |
| Naaf | 88px, aurora-gradient, `dice`-icoon 30px wit, 6px donkere ring eromheen |
| Draaien | 6 volledige omwentelingen + doelhoek, **5 seconden**, `cubic-bezier(.12,.76,.14,1)` |

Zowel de schijf als de naaf zijn klikbaar; beide starten de draai.

**De 8 categorieën (dit zijn de radsegmenten):**

| # | ID | NL | EN | Icoon | Kleur |
| --- | --- | --- | --- | --- | --- |
| 1 | `food` | Eten & Drinken | Food & Drink | `utensils` | `#f59e0b` |
| 2 | `culture` | Cultuur | Culture | `palette` | `#8b5cf6` |
| 3 | `nature` | Natuur | Nature | `leaf` | `#22c55e` |
| 4 | `active` | Actief | Active | `activity` | `#ef4444` |
| 5 | `shopping` | Shoppen | Shopping | `shopping` | `#ec4899` |
| 6 | `nightlife` | Uitgaan | Nightlife | `music` | `#6366f1` |
| 7 | `landmark` | Bezienswaardig | Sights | `landmark` | `#14b8a6` |
| 8 | `relax` | Ontspannen | Relax | `sparkles` | `#0ea5e9` |

> **Let op:** deze acht kleuren komen uit de database en staan los van het merkpalet. Ze
> botsen nu deels met de aurora-gradient. Als je ze wilt harmoniseren, lever dan een
> volledige nieuwe set van 8 aan — met de eis dat ze naast elkaar op één rad onderscheidbaar
> blijven, óók voor kleurenblinde gebruikers.

**Sheet A — "Jouw sessie"**

Subtitel: "Stem het rad af op je vervoer, tijd en gezelschap". Bevat dezelfde drie
keuzes als onboarding-stap 2, en sluit met een primary lg block-knop "Klaar" (die meteen
je afhaak-beurten reset).

Vervoer bepaalt de zoekstraal: Lopen 1,5 km · Fiets 6 km · Auto 25 km.

**Sheet B — "Jouw avontuur"** (verschijnt als het rad stopt)

Dit is het beslissende moment van de app. Van boven naar beneden:

1. Grote emoji-tegel, achtergrond in de categoriekleur op 18%
2. Categorie-badge in de categoriekleur
3. **Titel** — óf "Bezoek \<naam van de plek\>" (echte plek), óf een activiteit uit de
   catalogus
4. Beschrijving
5. Afstandsregel (`map-pin` + "1,2 km") — alleen bij echte plekken
6. Open/dicht-regel (`clock` + "Open nu" groen / "Nu gesloten" rood + openingstijden)
7. **Beoordeling** — 5 sterren, aantikbaar, opnieuw tikken zet terug op 0; hint "Hoe was
   het? (optioneel)"
8. **Foto** — knop "Voeg een foto toe" (`camera`, met subregel "Optioneel — leg je
   avontuur vast") die de camera opent; na keuze een voorbeeldafbeelding met ronde
   verwijderknop
9. **Acties:**

| Knop | Label NL | Type | Gedrag |
| --- | --- | --- | --- |
| Accepteren | "Ik doe het!" | primary, lg, block, `check` | uploadt foto → boekt XP → succes-toast "+N XP — avontuur voltooid!" → sluit. Tijdens uploaden verandert het label in "Foto uploaden…" |
| Afhaken | "Afhaken (n)" | secondary, `x` | breekt je streak, verbruikt een beurt, info-toast. Bij 0 beurten: disabled met label "Geen beurten meer" |
| Navigeren | "Navigeer" | secondary, `navigation` | opent kaart-app in nieuw tabblad — alleen bij echte plekken |

10. Kleine notitie eronder: "Afhaken kan beperkt en verbreekt je streak."

**Afhaken:** gratis 1× per sessie, premium 5×.

**Staten van het dashboard:**
- **Catalogus laadt** — het rad is een shimmerende cirkel
- **Locatie uit / geweigerd** — locatiekaart zichtbaar, avonturen komen uit de curated
  catalogus (28 activiteiten), geen "In de buurt"-sectie
- **Slecht weer** — het rad stuurt automatisch naar binnen-activiteiten; de weerchip zegt
  het
- **Gast** — alles werkt tot "Ik doe het!"; dan toast + doorsturen naar registreren

**Design-opdracht:** het rad moet onmiskenbaar de held zijn. Nu staan er vier blokken
bóven het rad (groet, stats, sessiebalk, weer) — dat is veel voordat je bij de hoofdactie
bent. Overweeg het rad hoger te trekken, stats te comprimeren of sessie + weer samen te
voegen tot één regel. En: het moment waarop de sheet opent is de emotionele piek van de
app — die verdient een echte reveal, geen gewone sheet.

---

### 7.5 Ontdek — `/app/explore`

**Doel:** zelf rondkijken in plaats van je laten verrassen. Alle échte plekken binnen je
straal, als lijst of op de kaart.

**Layout:**

1. **Kop** — h1 "Ontdek" + subtitel "Échte plekken bij jou in de buurt", rechts een
   segmented control **Lijst** (`list`) / **Kaart** (`map-pin`)
2. **Categoriechips** — horizontaal scrollend: "Alles" + de 8 categorieën (met icoon). De
   actieve categorie-chip krijgt de categoriekleur als vulling
3. **Straal** — label "Straal" + vier pillen: 1 km · 2.5 km · 5 km · 10 km (standaard 2.5)
4. **Resultaten** — lijst of kaart

**Lijstweergave:** een telregel "N plekken gevonden", daarna POI-rijen:
gekleurde icoontegel · naam · soort plek + open/dicht-status · afstand · navigatie-icoonknop
(opent kaart-app in nieuw tabblad).

**Kaartweergave:** Leaflet met OpenStreetMap-tiles, hercentreert op je positie.
- Jij: witte cirkel met violette vulling, straal 9
- Plekken: cirkels in de categoriekleur, straal 7
- Popup: naam · afstand · open/dicht · link "Navigeer →"

**Staten:**

| Staat | Wat je ziet |
| --- | --- |
| Geen locatie | EmptyState `map-pin`: "Zet locatie aan voor échte plekken dichtbij" + "We tonen voorbeeld-ideeën zolang je locatie uit staat." + knop "Locatie inschakelen" |
| Laden | 5 skeleton-POI-rijen |
| Geen resultaten | EmptyState `search`: "Niks gevonden binnen deze straal. Vergroot de straal of kies een andere categorie." |
| Klaar | Telregel + lijst, of kaart |

**Design-opdracht:** de kaartweergave is nu een kale OSM-kaart met gekleurde stippen —
daar valt veel te winnen (donkere tegels die bij het thema passen, echte markers met
categorie-icoon, een onderliggende kaart-sheet in plaats van popups). En: drie filterrijen
boven elkaar (weergave, categorie, straal) is veel chrome; kan dat compacter?

---

### 7.6 Uitdagingen — `/app/challenges`

**Doel:** een lijst met concrete opdrachten die XP opleveren — voor wie meer structuur wil
dan het rad geeft.

**Layout:**

1. **Kop** — "Uitdagingen" + "Verdien XP door uitdagingen te voltooien"
2. **Voortgangskaart** — "X/Y voltooid" links, percentage-badge rechts, daaronder een
   voortgangsbalk
3. **Lijst met uitdagingskaarten**

**Uitdagingskaart:**
- Links een icoontegel in de moeilijkheidskleur (bij voltooid: `check-circle`)
- Titel + XP-badge ("25 XP") op één regel
- Beschrijving in secundaire tekst
- Voetregel: moeilijkheidsbadge + óf een ghost sm-knop "Markeer als voltooid", óf de
  groene tekst "Voltooid" met vinkje
- Voltooide kaarten krijgen een gedempte staat

**Moeilijkheidsgraden:** Makkelijk (groen) · Gemiddeld (amber) · Moeilijk (rood)

**Staten:** laden → gecentreerde spinner. Gast → toast "Log in om dit te doen" +
doorsturen naar registreren.

**Design-opdracht — belangrijk:** er staan **116 uitdagingen** in de database, en die
worden nu allemaal tegelijk opgehaald en als één ononderbroken lijst getoond, gesorteerd
op XP van laag naar hoog. Dat is de grootste UX-schuld in de app. Bedenk een structuur: groeperen per moeilijkheid of categorie, filterchips, "aanbevolen
voor jou", een dagelijkse selectie van drie, of paginering. Ontwerp ook expliciet hoe
voltooide uitdagingen zich gedragen — naar onderen, apart tabblad, of laten staan met een
duidelijke afgevinkte staat.

---

### 7.7 Community — `/app/community`

**Doel:** zien wat anderen beleven, en je eigen avontuur delen.

**Layout:**

1. **Kop** — "Community" + "Ontdek wat anderen beleven"
2. **Composer** *(ingelogd)* of **gastkaart** *(gast)*
3. **Feed** — maximaal 50 posts, nieuwste eerst

**Composer:** avatar 40px links; rechts een tekstvak (2 regels, max 500 tekens,
placeholder "Wat heb je vandaag beleefd?"), daaronder een teller "0/500" links en een sm
primary-knop "Plaatsen" (`share`-icoon) rechts. De knop is disabled zolang het veld leeg is.

**Gastkaart:** `users`-icoon, tekst "Maak een account om mee te doen met de community.",
sm-knop "Aanmelden" → registreren.

**Post:**
- Kop: avatar 42px · auteursnaam + relatieve tijd ("3 uur geleden") · level-badge rechts
  (alleen als level > 1, magenta, "Lvl 4")
- Berichttekst
- Optionele plaatstag: `map-pin` + activiteit- of plaatsnaam
- Acties: like-knop (`heart` + aantal, gevulde/felle staat als jij geliked hebt) en een
  reactieteller (`message` + aantal)

**Liken** werkt optimistisch: het hartje reageert direct, de server volgt.

**Staten:** laden → spinner · leeg → EmptyState `message` "Nog geen verhalen. Wees de
eerste die iets deelt!" · posten gelukt → succes-toast "Gedeeld met de community".

**Design-opdracht:** posts kunnen een foto dragen (`image_url` bestaat in het datamodel)
maar dat wordt nu nergens getoond — ontwerp de post-met-foto. En let op: de reactieteller
is nu **niet klikbaar**; er is geen reactiescherm. Ontwerp óf een detailweergave met
reacties, óf maak zichtbaar dat de teller alleen informatief is. Nu ziet het eruit als een
knop die niets doet.

---

### 7.8 Profiel — `/app/profile`

**Doel:** je voortgang zien en je identiteit beheren.

**Gast-variant:** kop "Profiel" + EmptyState `user`: "Gast" / "Maak een account om je
voortgang te bewaren." + knop "Aanmelden".

**Ingelogde layout:**

1. **Kop** — h1 "Profiel", rechts een `settings`-icoonknop → `/settings`
2. **Profielkaart** — avatar 72px, weergavenaam (h2), "Lid sinds maart 2026",
   **levelblok** ("Level 4" links, "Nog 120 XP tot level 5" rechts, daaronder een
   voortgangsbalk), en een secondary sm-knop "Profiel bewerken" (`edit`)
3. **StatGrid** — dezelfde vier tegels als op het dashboard
4. **Recente avonturen** — sectiekop + geschiedenislijst

**Levelsysteem:** 250 XP per level. De balk toont `xp % 250`.

**Geschiedenisrij:** links de foto van het avontuur (als die er is) óf een gekleurde
categorie-icoontegel; midden titel + "Cultuur · 2 dagen geleden" + eventuele sterren;
rechts "+15" punten.

**Sheet — "Profiel bewerken":** veld "Weergavenaam" (max 40 tekens), label "Kies een
avatar" met een raster van 12 emoji's (🧭 🦊 🐙 🚀 🌻 🦄 🐳 🍀 ⭐ 🎒 🏔️ 🎨), en een
primary lg block-knop "Opslaan".

**Staten:** geschiedenis laadt → spinner · geen geschiedenis → EmptyState `compass` "Nog
geen voltooide activiteiten. Draai aan het rad!" · opgeslagen → succes-toast.

**Design-opdracht:** dit scherm is nu vooral een lijst. Het bevat de rijkste data van de
app (streaks, XP-curve, categorieverdeling, foto's van je avonturen) en toont daar bijna
niets van. Denk aan: een fotogrid in plaats van rijen, een streak-kalender, een
categorie-radar, badges. Het levelblok mag veel meer een beloning voelen.

---

### 7.9 Instellingen — `/settings`

**Doel:** thema, taal, account. Volledig scherm buiten de nav.

**Layout:**

1. **Kop** — terug-icoonknop (`chevron-left`) + h1 "Instellingen"
2. **Accountkaart** *(alleen als je niet bent ingelogd)* — `user`-icoon, "Maak een
   account", "Maak een account om je voortgang te bewaren.", chevron rechts → registreren
3. **Premiumkaart** — gouden accentkaart met `crown`-icoon, "Word Premium", "Haal alles
   uit elke dag", chevron rechts → `/premium`
4. **Weergave** — twee kaarten: **Thema** (`moon`-icoon) met segmented Licht (`sun`) /
   Donker (`moon`) / Systeem, en **Taal** (`globe`) met segmented Nederlands / Engels
5. **Account** *(alleen ingelogd)* — kaart met `user`-icoon + e-mailadres, en een danger
   block-knop "Uitloggen" (`logout`)
6. **Versielabel** onderaan — `v2.1.0 · 2026-06-12 · a1b2c3d`

**Design-opdracht:** houd dit rustig — instellingen zijn geen etalage. Wel: de
premiumkaart is nu de enige gouden vlek in een violet systeem; laat die opvallen zonder te
schreeuwen. Het versielabel moet leesbaar maar onopvallend zijn (het is er om deploys te
kunnen controleren).

---

### 7.10 Premium — `/premium`

**Doel:** verkopen. Volledig scherm, sluitbaar met een kruis.

**Layout:**

1. **Sluitknop** (`x`) rechtsboven → terug
2. **Hero** — ronde tegel met `crown`-icoon 34px wit, h1 "Make My Day Premium", subtitel
   "Haal alles uit elke dag"
3. **Abonnementskeuze** — segmented: "Per maand" / "Per jaar · Bespaar 33%"
4. **Prijs** — groot bedrag + periode: **€1,50** /mnd of **€12** /jr
5. **Voordelenlijst** — 6 items, elk met een rond vinkje:
   Onbeperkt draaien · Onbeperkte zoekstraal · Thematische avonturen · Geavanceerde
   statistieken · Geen advertenties · Offline modus
6. **CTA** — primary lg block "Start 7 dagen gratis"
7. **Garantie** — "Niet tevreden? 30 dagen geld-terug-garantie."

**Staten:**
- **Al premium** — de CTA wordt een disabled knop met `crown`: "Je bent Premium ✨"
- **Gast** — de CTA stuurt door naar registreren
- **Let op:** er is nog géén betaalprovider aangesloten; de knop zet nu direct de
  premium-vlag. Ontwerp wel alsof er een echte betaalstap komt.

**Design-opdracht:** dit is het enige scherm dat om een ander register vraagt — meer
warmte, meer goud, meer overtuiging. Maak het contrast tussen gratis en premium concreet
(nu is "Onbeperkt draaien" een abstracte belofte). Overweeg een vergelijkingsweergave.

---

### 7.11 Globale onderdelen

**Bottom-nav** (op alle `/app`-schermen)
- Zwevende glazen pil: 68px hoog, 14px + safe-area boven de onderrand, breedte
  `100% - 32px` met een max van 456px, volledig rond, blur 26px + saturate 170%
- 5 items: Start (`home`) · Ontdek (`search`) · Uitdagingen (`target`) · Community
  (`users`) · Profiel (`user`)
- Inactief: alleen `--text-tertiary`, label 10px semibold
- Actief: het icoonvlak (48×32px, rond) krijgt de aurora-gradient met witte icoon en
  violette gloed, en schuift 2px omhoog; het label wordt `--text`
- Tik: icoon krimpt naar 86%

**Toasts** — verschijnen boven de nav, blijven 3,2 seconden, stapelen verticaal, zijn niet
klikbaar. Drie soorten: succes (groene rand + gloed, `check-circle`), fout (rode rand,
`info`), info (violette rand, `info`).

**Laadscherm bij routewissel** — gecentreerde spinner van 34px op volledige hoogte.

---

## 8. Copy-deck (de belangrijkste teksten, NL / EN)

Elke tekst in de app staat in `web/src/i18n/strings.ts` en bestaat in beide talen.
Ontwerp altijd met de langste variant. De belangrijkste:

| Sleutel | NL | EN |
| --- | --- | --- |
| Navigatie | Start · Ontdek · Uitdagingen · Community · Profiel | Home · Explore · Challenges · Community · Profile |
| Tagline | Laat het toeval je dag maken | Let chance make your day |
| Hoofdactie | Draai het rad | Spin the wheel |
| Hint | Tik op het rad voor een spontane suggestie | Tap the wheel for a spontaneous suggestion |
| Accepteren | Ik doe het! | I'm in! |
| Afhaken | Afhaken (1) | Chicken out (1) |
| Afhaak-notitie | Afhaken kan beperkt en verbreekt je streak. | Chickening out is limited and breaks your streak. |
| Navigeren | Navigeer | Navigate |
| Foto | Voeg een foto toe / Optioneel — leg je avontuur vast | Add a photo / Optional — capture your adventure |
| Beoordeling | Hoe was het? (optioneel) | How was it? (optional) |
| XP-toast | +25 XP — avontuur voltooid! | +25 XP — adventure completed! |
| Locatie uit | Zet locatie aan voor échte plekken dichtbij | Enable location for real places nearby |
| Statistieken | Voltooid · Streak · XP · Level | Completed · Streak · XP · Level |
| Sessie | Vervoer · Beschikbare tijd · Gezelschap | Transport · Time available · Company |
| Login vereist | Log in om dit te doen | Log in to do this |
| Fout | Er ging iets mis | Something went wrong |

**Let op deze lengteverschillen bij het ontwerpen:**
"Uitdagingen" (11) vs "Challenges" (10) in de nav · "Markeer als voltooid" (20) vs "Mark
as done" (12) · "Geen beurten meer" vs "No passes left" · "Zet locatie aan voor échte
plekken dichtbij" is de langste microcopy in de app.

---

## 9. Micro-interacties (bestaand)

| Element | Interactie |
| --- | --- |
| Rad | 5s uitrol over 6 omwentelingen; lampjes jagen rond tijdens het draaien; wijzer schuift omhoog |
| Primaire knop | Glansveeg diagonaal over de knop bij hover (600ms), 1px omhoog |
| Kaarten (interactief) | 3px omhoog, sterker glas, sterkere schaduw |
| Bottom-nav | Actieve pil schuift omhoog met bounce-easing |
| Sheet | Schuift 260ms omhoog vanaf de onderrand |
| Toast | Pop-in met bounce (schaal 0.86 → 1) |
| Schermwissel | `fade-up`: 14px omhoog + fade over 260ms |
| Aurora-achtergrond | Twee bollen driften 26s en 32s heen en weer |
| Statistiektegels | 2px omhoog bij hover |
| Voortgangsbalk | Breedte-animatie van 450ms |
| Skeletons | Shimmer van 1.3s |

Alles wordt uitgeschakeld bij `prefers-reduced-motion: reduce`.

---

## 10. Toegankelijkheid — eisen aan je ontwerp

1. **Contrast** — minimaal WCAG AA (4.5:1 voor tekst). Let op `--text-tertiary` op glas:
   dat zit nu op de grens. Ook: de tekst op de aurora-gradient (wit op violet/oranje) moet
   over het hele verloop leesbaar blijven.
2. **Raakvlakken** — minimaal 44×44px. De huidige nav-items en icoonknoppen halen dat net;
   de sterren in de beoordelingsrij mogelijk niet.
3. **Focus** — elke focusbare element krijgt `box-shadow: 0 0 0 3px var(--ring)`. Ontwerp
   deze staat mee, ook op glaspanelen waar hij snel wegvalt.
4. **Kleur is nooit de enige drager** — de acht categorieën verschillen nu vooral in
   kleur. Op het rad zijn er iconen; in de chips en badges ook. Houd dat zo.
5. **Open/dicht-status** — nu groen/rood tekst. Voeg vorm of icoon toe.
6. **Beweging** — respecteer `prefers-reduced-motion`; het rad moet ook zonder animatie
   een bruikbaar resultaat geven.

---

## 11. Technische kaders

**Doe wel:**
- CSS-gradiënten, `backdrop-filter`, `conic-gradient`, `clip-path`, CSS-animaties
- SVG-iconen (24×24, 2px stroke) — die gaan in de bestaande registry
- CSS-variabelen — het hele systeem draait erop

**Doe niet, of overleg eerst:**
- Nieuwe lettertypen (Inter + Space Grotesk worden lokaal geladen; een derde kost
  laadtijd)
- Rasterafbeeldingen als vaste decoratie (de app is een PWA, elke KB telt)
- Externe illustratie- of animatiebibliotheken (Lottie, Rive) zonder afstemming
- Layouts die breder zijn dan 480px als vereiste — dat is de maximale contentbreedte

**Randvoorwaarden:**
- De app is een **PWA** — hij wordt geïnstalleerd op het beginscherm en draait zonder
  browser-chrome. Respecteer `env(safe-area-inset-*)` boven en onder.
- Alle gebruikersdata komt van Supabase; catalogusdata (categorieën, activiteiten,
  uitdagingen) staat in de database, niet in de code. Als je nieuwe velden nodig hebt
  (bijv. een afbeelding per categorie), noem dat expliciet — dat is een databasewijziging.
- Plekken komen live van OpenStreetMap. Namen kunnen lang, raar of ontbrekend zijn.
  Ontwerp voor afkapping.

---

## 12. Prioriteiten

Als je moet kiezen, in deze volgorde:

1. **Dashboard + rad + avontuur-sheet** — dit ís het product
2. **Onboarding** — bepaalt de eerste indruk, en heeft de meeste ontwerpruimte
3. **Uitdagingen** — 116 items in een platte lijst is de grootste UX-schuld
4. **Profiel** — rijke data, arme presentatie
5. **Ontdek** — vooral de kaartweergave
6. **Welkom** — sterk genoeg, maar mag ambitieuzer
7. **Community** — post-met-foto en de reactie-vraag oplossen
8. **Premium** — apart register, eigen aandacht
9. **Instellingen / Auth** — houden zoals ze zijn, alleen meeliften op het systeem

---

## 13. Wat we terug willen

Per scherm:

1. **Ontwerp in donker én licht thema** — beide volwaardig, niet één als afgeleide
2. **Alle staten** die bij dat scherm horen (leeg, laden, fout, gast, premium)
3. **Componenten benoemd** — als je een bestaand component aanpast, zeg welk; als je er een
   toevoegt, geef het een naam en een spec
4. **Tokens expliciet** — elke afwijking van hoofdstuk 3 als concrete waarde, niet als
   plaatje
5. **Interactienotities** — wat beweegt, hoe lang, met welke easing

En overkoepelend: **een tokenblad** met alle wijzigingen ten opzichte van hoofdstuk 3,
zodat we het in één keer in `tokens.css` kunnen zetten.

---

## 14. Referentie: waar alles in de code staat

| Wat | Bestand |
| --- | --- |
| Design tokens | `web/src/styles/tokens.css` |
| Basis + aurora-achtergrond | `web/src/styles/global.css` |
| Gedeelde componenten | `web/src/styles/app.css` |
| Per scherm | `web/src/features/<naam>/<naam>.css` |
| Iconenregistry | `web/src/components/icons/Icon.tsx` |
| Rad | `web/src/components/SpinWheel.tsx` |
| UI-primitives | `web/src/components/ui/` |
| Routes | `web/src/App.tsx` |
| Bottom-nav | `web/src/components/layout/BottomNav.tsx` |
| Alle teksten (NL/EN) | `web/src/i18n/strings.ts` |
| Sessielogica (vervoer/tijd/gezelschap, afhaken) | `web/src/lib/session.ts` |
| Datamodel | `web/src/types/db.ts` |
