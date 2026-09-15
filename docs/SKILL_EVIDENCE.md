# Skill Evidence — Project Atlas

This document maps portfolio skills to the projects that demonstrate them,
so future content stays factual. The mapping is implemented in
`src/data/skills.ts` (the single source of truth) and rendered on the
`/skills` page. Project IDs below refer to records in `src/data/projects`.

Rules:

1. A skill may only reference a project that actually demonstrates it.
2. Skills without public evidence use honest labels (Learning / Familiarity /
   Interest) and no project links.
3. Derived projects (Lucida-Sync) count as evidence with attribution.
4. This portfolio itself is legitimate evidence for TypeScript/Next.js/Three.js
   skills even though its repository is private — the evidence text says so.

## Languages

| Skill | Proficiency label | Evidence projects | Notes |
| --- | --- | --- | --- |
| Python | Core language | lyrune, lucida-sync, kerala-flood-risk-platform | Desktop app, CLI/API tool, data pipelines and serving |
| TypeScript | Used in full-stack work | recoverai | RecoverAI frontend; this portfolio |
| JavaScript | Used in web work | scrollbrake, main-menu | Extension + early site |
| Dart | Used in Flutter apps | sonara, neerad-store | App + backend code |
| HTML & CSS | Used in web work | main-menu, scrollbrake | Hand-written pages and extension UI |
| C | Learning | — | No public project yet |
| C++ | Learning | — | No public project yet; targeted at game dev |
| C# | Familiarity | — | No public project yet |
| Java | Familiarity | — | No public project yet |
| PHP | Familiarity | — | No public project yet |

## Frameworks & libraries

| Skill | Evidence projects | Notes |
| --- | --- | --- |
| PyQt6 | lyrune | Overlay, animation, settings, tray |
| Flutter | sonara, neerad-store | Mobile + desktop targets |
| FastAPI | lucida-sync, recoverai, kerala-flood-risk-platform | Three independent uses |
| React | recoverai | Mission-control UI; also this portfolio's interactive layer |
| Next.js | (this portfolio) | App Router, server-first pages |
| Three.js / R3F | (this portfolio) | Lazy-loaded WebGL hub |
| Tailwind CSS | recoverai | Frontend styling |

## Game development

| Skill | Evidence projects | Notes |
| --- | --- | --- |
| Game & combat design | stance-combat-pvp | Concept only — no implemented mechanics |
| Unreal Engine | — | Interest; no public project |
| UI / UX design | lyrune, sonara, main-menu | Overlay presets, theming, early site |

## Web

| Skill | Evidence projects | Notes |
| --- | --- | --- |
| Browser extensions | scrollbrake | Manifest V3, content scripts, service worker |
| Web scraping & automation | lucida-sync | Playwright + session-managed HTTP |

## AI / ML

| Skill | Evidence projects | Notes |
| --- | --- | --- |
| Machine learning | kerala-flood-risk-platform | XGBoost training/evaluation; BQ ML forecasting |
| LLM / generative AI integration | scrollbrake | Gemini classification with free-tier models |

Note: RecoverAI is **not** listed as ML evidence — its verified implementation
is a deterministic policy/simulation system.

## Data

| Skill | Evidence projects | Notes |
| --- | --- | --- |
| Data engineering | kerala-flood-risk-platform | pandas/cuDF/PySpark pipelines + benchmark report |
| GPU acceleration | kerala-flood-risk-platform | RAPIDS variants (environment-dependent) |
| Forecasting | kerala-flood-risk-platform | ARIMA_PLUS / TimesFM in the architecture |

## Cloud

| Skill | Evidence projects | Notes |
| --- | --- | --- |
| Cloud architecture | kerala-flood-risk-platform | Google Cloud blueprint (documented design) |

## Tools & practice

| Skill | Evidence projects | Notes |
| --- | --- | --- |
| Desktop packaging & release automation | lyrune | PyInstaller, Inno Setup, GitHub Actions |
| Playwright | lucida-sync | Chromium automation |
| Automated testing | recoverai, lucida-sync | Backend suites + download tests |

## Design & interactive

| Skill | Evidence projects | Notes |
| --- | --- | --- |
| 3D / interactive experiences | (this portfolio) | WebGL hub with shared material system |
| Desktop application development | lyrune, neerad-store | Windows/Linux overlay; Flutter store app |

## Adding or changing evidence

1. Edit `src/data/skills.ts`; every skill requires `relatedProjectIds`
   (matching registered project IDs) and an evidence sentence.
2. Prefer linking a project to a skill only when the repository shows it —
   check `docs/PORTFOLIO_INVENTORY.md` first.
3. Run `npm run typecheck`; the `/skills` page and project detail
   "Skills this project demonstrates" sections update automatically.