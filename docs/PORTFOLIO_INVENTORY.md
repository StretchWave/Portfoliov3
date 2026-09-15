# Portfolio Inventory — Project Atlas

The authoritative internal catalog of the owner's public work. Every entry is
classified as **Verified** (checked against the repository on the date below),
**Inferred** (reasonable reading but not directly confirmed), or **Needs
verification**. Nothing in this document should be promoted to the public
portfolio without a verified basis.

Inventory verified against `github.com/StretchWave` on **2026-09-06**.

## Owner profile

- GitHub: https://github.com/StretchWave (12 public repositories, no forks)
- Name (from the owner's own 2023 site, `MainMenu`): Mohammed Mishal
- Direction (supplied context): Computer Engineering student; software
  engineering, game development, interactive systems, graphics/creative tech.
- The portfolio repository itself (`Portfoliov3`) is **private** and is not
  part of the public catalog.

## Repositories at a glance

| Repository | Language | Size | Created | Last push | Classification |
| --- | --- | --- | --- | --- | --- |
| Sonara | Dart | 49 MB | 2026-08-16 | 2026-09-06 | **Project — active (fork-based)** |
| Lyrune | Python | 7 MB | 2026-08-06 | 2026-08-30 | **Project — active (flagship)** |
| RecoverAI | TypeScript | 166 KB | 2026-08-23 | 2026-08-23 | **Project — prototype** |
| ScrollBrake | JavaScript | 48 KB | 2026-08-21 | 2026-08-21 | **Project — prototype/experiment** |
| kerala_flood_risk | Python | 840 MB | 2026-07-06 | 2026-07-06 | **Project — in-progress (flagship)** |
| Motor-Track-App-Release | — | 0 KB | 2026-06-11 | 2026-06-11 | Empty release placeholder — not a project |
| wesbite | CSS | 3 KB | 2026-02-20 | 2026-02-20 | Trivial experiment — not a project |
| neerad_store | Dart | 3.4 MB | 2025-08-02 | 2026-07-07 | **Project — in-progress** |
| REPP | — | 0 KB | 2026-02-09 | 2026-03-09 | Empty repository — not a project |
| lucida-sync | Python | 3.2 MB | 2026-01-24 | 2026-02-05 | **Project — completed (derived)** |
| motiv8 | C++* | 262 KB | 2025-11-09 | 2025-11-09 | Empty Flutter scaffold — not a project |
| MainMenu | CSS | 6.5 MB | 2023-04-07 | 2023-04-07 | **Archive — first personal site** |

\* GitHub's language detection reads the Flutter Windows runner C++ boilerplate;
the repository contains only a default Flutter "Hello World" app.

## Project entries

### Sonara — ACTIVE (flagship)

- **Repository:** https://github.com/StretchWave/Sonara — **Verified**
- **Category:** mobile-development (primary), desktop-application (secondary)
- **Status:** active — **Verified** (pushed 2026-09-06, v1.0.0+1, GPL-3.0)
- **Technologies:** Dart, Flutter, YouTube/YouTube Music streaming, Dart
  resolver backend, Qobuz/Tidal resolvers, Last.fm, LRCLIB, MusicBrainz,
  GitHub Actions — **Verified** (README + pubspec + workflows)
- **Skills demonstrated:** cross-platform mobile/desktop development,
  background playback, API integration, localization (50+ languages),
  CI/CD packaging — **Verified**
- **Relationship / ecosystem:** fork of the Harmony Music project with the
  owner's own additions — **Verified** (README license section states fork
  conditions). NOT original work; always attribute.
- **Case study available:** yes (in `src/data/projects/sonara.ts`)
- **3D exhibit:** yes — Atlas Hub, position (0, 0, -4.8), accent #f472d0
- **External links:** GitHub repository only — **Verified**
- **Evidence / source:** README.md, backend/README.md, pubspec.yaml,
  .gitmodules, .github/workflows
- **Notes:** Most recently active project. The `.flutter` submodule vendors
  the Flutter SDK. Windows EXE workflow exists.

### Lyrune — ACTIVE (flagship, reference integration)

- **Repository:** https://github.com/StretchWave/Lyrune — **Verified**
- **Category:** software-engineering (primary), desktop-application,
  interactive-systems (secondary)
- **Status:** active — **Verified** (pushed 2026-08-30, MIT, 1 open issue)
- **Technologies:** Python 3.10+, PyQt6, LRCLIB, Windows GSMTC, MPRIS/D-Bus,
  WASAPI loopback + NumPy FFT visualizer, PyInstaller, Inno Setup, GitHub
  Actions — **Verified** (PROJECT_SUMMARY.md, tree)
- **Skills demonstrated:** cross-platform desktop integration, async UI,
  timestamped lookup, audio DSP, packaging, release automation — **Verified**
- **Relationship / ecosystem:** standalone original project
- **Case study available:** yes (full)
- **3D exhibit:** yes — Atlas Hub terminal at (-4.2, 0, -2.6)
- **External links:** GitHub repository — **Verified**
- **Evidence / source:** README.md, PROJECT_SUMMARY.md, AUDIT.md,
  CHANGELOG.md, .github/workflows/build-releases.yml, installer.iss
- **Notes:** The portfolio's reference integration. Do not break it.

### Kerala Flood Risk Platform — IN PROGRESS (flagship)

- **Repository:** https://github.com/StretchWave/kerala_flood_risk — **Verified**
- **Category:** data-and-intelligence (primary), software-engineering (secondary)
- **Status:** in-progress — **Inferred** (single push 2026-07-06; README
  frames it as a platform design; some components fail in the benchmark env)
- **Technologies:** Python, pandas, cuDF/RAPIDS, PySpark, XGBoost, BigQuery,
  Parquet, FastAPI, Google Cloud blueprint, synthetic data generation —
  **Verified** (README, tree, serving/api.py, model/train.py)
- **Skills demonstrated:** data pipelines, GPU-accelerated ETL (explored),
  ML training, decision-support design, cloud architecture — **Verified**
- **Relationship / ecosystem:** standalone; positions itself as the last-mile
  layer on top of Google Flood Hub — **Verified** (README)
- **Case study available:** yes
- **3D exhibit:** yes — Atlas Hub information display at (4.2, 0, -2.6)
- **External links:** GitHub repository — **Verified**
- **Evidence / source:** README.md, benchmark_report.md (pandas pipeline
  measured over 55,104,960 rows; cuDF/PySpark variants recorded as failing
  in that environment), etl/, model/, serving/, dashboard/, data_gen/
- **Notes:** 840 MB repository (data files). Claims must stay at the
  "architecture demonstration with simulated data" level; no live-deployment
  claims.

### Neerad Store — IN PROGRESS (featured)

- **Repository:** https://github.com/StretchWave/neerad_store — **Verified**
- **Category:** desktop-application (primary), mobile-development (secondary)
- **Status:** in-progress — **Inferred** (multiple pushes 2025-08 → 2026-07;
  no README description beyond the Flutter template)
- **Technologies:** Dart, Flutter, local database service, Python migration
  tooling — **Verified** (lib/ tree)
- **Skills demonstrated:** desktop app development, data modeling, CRUD app
  design, state management — **Verified**
- **Relationship / ecosystem:** standalone
- **Case study available:** concise (no deep narrative — insufficient
  verified detail)
- **3D exhibit:** no
- **External links:** GitHub repository — **Verified**
- **Evidence / source:** lib/Models, lib/Screens (Billing, Inventory,
  Product, Sales, Settings), lib/Services/DatabaseService.dart,
  Migration/migrate_products.py, windows/README_INSTALL.md
- **Notes:** Store-management application; what it manages (products, sales)
  is verified from the screens/models. The store name comes from the repo
  name.

### Lucida-Sync — COMPLETED (supporting)

- **Repository:** https://github.com/StretchWave/lucida-sync — **Verified**
- **Category:** developer-tools (primary), automation (secondary)
- **Status:** completed — **Inferred** (last push 2026-02-05; README and
  PROJECT_SUMMARY describe a finished CLI + API)
- **Technologies:** Python, FastAPI, Playwright, Rich, web scraping, rate
  limiting — **Verified**
- **Skills demonstrated:** CLI tooling, REST API design, browser automation,
  web scraping, session management — **Verified**
- **Relationship / ecosystem:** **derived from the MIT-licensed lucida-flow
  project** (ryanlong1004) — **Verified** (PUBLISH_SUCCESS.md documents
  publishing lucida-flow's files; README badge links lucida-flow). Always
  attribute; the owner's additions (setup tooling, rate-limit docs, download
  test) are verified but the core code is not claimed as original.
- **Case study available:** concise, with attribution
- **3D exhibit:** no
- **External links:** GitHub repository — **Verified**
- **Evidence / source:** README.md, PROJECT_SUMMARY.md, PUBLISH_SUCCESS.md,
  RATE_LIMITING.md, cli.py, api_server.py, lucida_client.py, test files

### RecoverAI — PROTOTYPE (supporting)

- **Repository:** https://github.com/StretchWave/RecoverAI — **Verified**
- **Category:** software-engineering (primary), automation (secondary)
- **Status:** prototype — **Verified** (single push 2026-08-23; README frames
  it as a platform concept with tests)
- **Technologies:** Python, FastAPI, React 19, TypeScript, Vite, Tailwind CSS,
  MIT — **Verified** (README, tree, package.json)
- **Skills demonstrated:** full-stack development, policy/rule-engine design,
  test-driven prototyping, simulation — **Verified** (backend/tests)
- **Relationship / ecosystem:** standalone
- **Case study available:** yes (concise)
- **3D exhibit:** no
- **External links:** GitHub repository — **Verified**
- **Evidence / source:** README.md, backend/app, backend/tests (policy engine
  compliance, safety gates, checkout abandonment, receivables, net-recovery
  simulation), frontend/src
- **Notes:** "AI" in the name refers to autonomous/automated behavior; the
  verified implementation is a deterministic policy/simulation system — do
  not describe it as ML-powered.

### ScrollBrake — PROTOTYPE (experiment)

- **Repository:** https://github.com/StretchWave/ScrollBrake — **Verified**
- **Category:** web-development (primary), experimental (secondary)
- **Status:** prototype — **Verified** (single push 2026-08-21)
- **Technologies:** JavaScript, Manifest V3, Chrome Extensions API, Google
  Gemini API — **Verified** (manifest.json, content scripts)
- **Skills demonstrated:** extension development, content-script architecture,
  LLM API integration — **Verified**
- **Relationship / ecosystem:** standalone
- **Case study available:** yes (concise)
- **3D exhibit:** no
- **External links:** GitHub repository — **Verified**
- **Evidence / source:** README.md, manifest.json, background/,
  content/youtube.js, content/instagram.js, tests/verify-extension.js
- **Notes:** Uses free-tier Gemini models with the user's own API key.

### Stance Combat PvP — CONCEPT (supporting)

- **Repository:** none — the concept is not public — **Verified** (no repo
  exists; REPP is empty and unrelated in code)
- **Category:** game-development
- **Status:** concept — supplied by the owner as a design direction
- **Technologies / skills:** combat systems design, stance/progression design
- **Relationship / ecosystem:** the eventual flagship game-development project
- **Case study available:** no (explicitly no implemented mechanics claimed)
- **3D exhibit:** no
- **External links:** none
- **Evidence / source:** owner-supplied concept: turn-based/strategic combat
  with dodge, block, timed parry; strength/agility/endurance stances; separate
  stance skill trees; stats influence progression; potential hybrid stance.
- **Notes:** REPP and motiv8 were **investigated** for a game/fitness link and
  contain no code — no relationship exists publicly.

### MainMenu — ARCHIVED (first personal site)

- **Repository:** https://github.com/StretchWave/MainMenu — **Verified**
- **Category:** web-development
- **Status:** archived — **Verified** (single push 2023-04-07)
- **Technologies:** HTML, CSS, JavaScript, GitHub Pages — **Verified**
- **Skills demonstrated:** hand-rolled web design, static publishing
- **Relationship / ecosystem:** predecessor of this portfolio
- **Case study available:** no
- **3D exhibit:** no
- **External links:** GitHub repository — **Verified**
- **Evidence / source:** Main.html, Designs.css, Javascript.js,
  .github/workflows/static.yml
- **Notes:** Contains the owner's name and old personal sections; only the
  fact that it is the 2023 personal site is used publicly.

## Repositories deliberately NOT in the portfolio

| Repository | Why excluded |
| --- | --- |
| REPP | Empty (README only). No code exists to describe. |
| Motor-Track-App-Release | Empty release placeholder (implies a private Motor Track app; nothing public to verify). |
| motiv8 | Default Flutter "Hello World" scaffold only. |
| wesbite | 3 KB template/sample page experiment ("Sleek Sample Project"). |
| Portfoliov3 | The portfolio's own private repository. |

## Needs verification

- LinkedIn, email, resume, or other social links — **none supplied**; the
  portfolio only links the verified GitHub profile.
- Education details beyond "Computer Engineering student" (the 2023 site has
  an education section; it is stale and unverified — not used).
- Any Motor Track app behind the empty release repo.
- Media (screenshots/videos) for any project — none are used until verified
  and licensed.
- Proficiency levels for languages with no public evidence (C, C++, C#, Java,
  PHP): presented as learning/familiarity, not mastery.