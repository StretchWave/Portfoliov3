# AI Handoff — Project Atlas

## Project status

All core roadmap phases are completed: the **Foundation**, **Portfolio Core**,
**Visual Direction & Environment Foundation**, **Portfolio Content Integration**,
**World Expansion (Multi-District Router)**, **Interactive Demonstrations**,
**Optimization & Diagnostics**, and **Deployment & SEO**.

The portfolio has a verified catalog of 9 projects (3 flagships, 1 featured, 3
supporting/concept, 1 experiment, 1 archived) with an evidence-based skills system,
single-source profile, and complete conventional App Router pages.

The optional `/interactive` 3D experience is dynamically lazy-loaded and features:
- **Atlas Central Hub**: The reference hall with flagship exhibits and spatial portals.
- **Dynamic Area Router (`WorldAreas`)**: Lazy-loaded module streaming for three thematic districts:
  - **Software Systems District** (`software-district`): Server lab architecture exhibiting Lyrune, Lucida-Sync, and RecoverAI.
  - **Intelligent Systems Observatory** (`intelligence-observatory`): Calm observation deck exhibiting Kerala Flood Risk Platform.
  - **Creative & Interactive Workshop** (`creative-workshop`): Open combat & interaction arena exhibiting Sonara, ScrollBrake, Stance Combat PvP, and Neerad Store.
- **Interactive Demonstrations**:
  - Live Web Audio DSP Synthesizer & Spectrum Visualizer (Lyrune) with selectable waveforms, interactive BiquadFilter (cutoff & resonance sweeps), and real-time FFT spectrum analyzer.
  - Interactive Bash CLI & API terminal runner (Lucida-Sync & RecoverAI).
  - River Basin Inundation Map & Crisis Scenario Replay (Kerala Flood Risk Platform) with historical 2018 monsoon presets, topological elevation profiles, and live spill discharge telemetry.
  - Tactical Combat Timing Trainer with procedural audio feedback (Stance Combat PvP).
- **Spatial Radar & Mini-Map HUD (<kbd>M</kbd>)**: Real-time 60fps canvas radar displaying player position, sight cone, exhibit pedestals with category color-coding, and portal beacons.
- **Universal Command Palette (<kbd>Ctrl+K</kbd>)**: Omnipresent fuzzy search across projects, skills, technologies, and spatial districts with instant teleportation.
- **Procedural Web Audio Soundscape**: Pure Web Audio API synthesis generating harmonic portal sweeps, glass chimes, and tactile combat cues with 0 KB asset load overhead and sound toggle.
- **Performance Diagnostics HUD & Quality Tiers**: Real-time FPS, draw calls, triangles, geometry memory, quality presets (`Low`, `Balanced`, `High`), and controls help modal (<kbd>?</kbd>).
- **SEO & Production Readiness**: Dynamic `sitemap.ts`, `robots.ts`, OpenGraph / Twitter tags, and Schema.org JSON-LD structured data.

## Portfolio Content System

### Where profile data lives

`src/data/profile.ts` — one `PortfolioProfile` object (name, title, intro,
career directions, verified links). Used by the home hero, about page, and
footer. Only facts verified from the owner's public repos or supplied by the
owner belong here. LinkedIn/email/resume are absent until supplied.

### Where skills live

`src/data/skills.ts` — `profileSkills`, a typed array of `ProfileSkill`
(name, category, qualitative proficiency label, `relatedProjectIds`,
evidence, displayPriority). Helpers: `getSkillsForProject(projectId)`
(reverse lookup for detail pages) and `getSkillsByCategory()` (skills page).
The rules are documented in `docs/SKILL_EVIDENCE.md`.

### Where projects live

- Records: `src/data/projects/<id>.ts`, each `as const satisfies
  PortfolioProject`.
- Registration + display order: `src/data/projects/index.ts` (flagships
  first). This is the only place that knows which records exist.
- Queries: `src/features/portfolio/project-registry.ts`.

### How project relationships work

`PortfolioProject.relatedProjectIds` — verified relationships only. All
records currently omit it (no verified relationships exist in the public
repos); the detail page renders a "Related projects" section automatically
when set. Never invent relationships; Lucida-Sync ↔ lucida-flow and
Sonara ↔ Harmony Music are attributed inside the records' descriptions
instead.

### How to add a new project

1. Verify the repository facts first (`docs/PORTFOLIO_INVENTORY.md`).
2. Create `src/data/projects/<id>.ts` with id/slug/category/status/priority/
   featured/summary/description/technologies/skills and any verified
   `links`, `architecture`, `caseStudy`, `exhibit`.
3. Register it in `src/data/projects/index.ts`.
4. Run `npm run typecheck`; check `/projects` and the detail route.

### How to add evidence to a skill

Edit `src/data/skills.ts`: add `relatedProjectIds` (registered IDs) and an
evidence sentence to the skill. The `/skills` page and the project detail
"Skills this project demonstrates" section update automatically.

### How to change project priority

Change `priority` in the record (`flagship` | `featured` | `supporting` |
`experiment` | `archived`) and `featured` (home-page presence). Cards, detail
heroes, and the projects-page hierarchy react automatically.

### How to add an exhibit

Add an `exhibit` block to the record: `area: "atlas-hub"` (the only mounted
area), `presentation`, `position`, `accent`, optional `interactionRange`.
The generic `ExhibitRegistry` mounts it with no scene code changes. Do not
crowd the hub: flagship exhibits only.

## Current Project Inventory

The full verified catalog (including excluded/empty repositories) is in
`docs/PORTFOLIO_INVENTORY.md`. Portfolio records:

| Project | ID | Priority | Status | Category | Exhibit |
| --- | --- | --- | --- | --- | --- |
| Sonara | sonara | flagship | active | mobile-development | Atlas Hub (0, 0, -4.8) |
| Lyrune | lyrune | flagship | active | software-engineering | Atlas Hub terminal |
| Kerala Flood Risk Platform | kerala-flood-risk-platform | flagship | in-progress | data-and-intelligence | Atlas Hub display |
| Neerad Store | neerad-store | featured | in-progress | desktop-application | — |
| Lucida-Sync | lucida-sync | supporting | completed | developer-tools | — |
| RecoverAI | recoverai | supporting | prototype | software-engineering | — |
| ScrollBrake | scrollbrake | experiment | prototype | web-development | — |
| Stance Combat PvP (Concept) | stance-combat-pvp | supporting | concept | game-development | — |
| MainMenu — First Personal Site | main-menu | archived | archived | web-development | — |

## Current Featured Projects

Home page (`featured: true`): **Sonara, Lyrune, Kerala Flood Risk Platform,
Neerad Store**. The first three are the flagship pieces (active/verifiable
systems with case studies); Neerad Store is a featured in-progress
application. Supporting projects, the concept, and the archive live on the
projects index with explicit priority badges.

## Implemented systems

| System | Location | Notes |
| --- | --- | --- |
| Conventional App Router portfolio | `src/app`, `src/components`, `src/features/portfolio/components` | Server-first pages; usable without WebGL. |
| Profile source of truth | `src/data/profile.ts` | One object for identity, directions, and links. |
| Evidence-based skills | `src/data/skills.ts` | Qualitative labels + project evidence; rendered on `/skills`. |
| Typed project records + registry | `src/types/portfolio.ts`, `src/data/projects`, `src/features/portfolio/project-registry.ts` | Single registration point, duplicate guard, priority/category/related queries. |
| Generic case-study presentation | `src/features/portfolio/components/project-detail-*.tsx` | Server-rendered composition driven by optional typed `caseStudy` content. |
| Project index filters | `src/features/portfolio/components/project-filter.tsx` | Client-side category groups; priority-aware cards. |
| Explicit lazy 3D launch | `src/app/interactive/interactive-portfolio-shell.tsx` | Do not replace its event-triggered import with a static import. |
| Canvas + world seam | `src/three/core/portfolio-canvas.tsx`, `src/three/world/world-areas.tsx` | Canvas config + Suspense boundary; seam for future areas. |
| Environment language | `src/three/world/environment/` | Shared materials, architectural modules, lighting fixtures, global atmosphere. |
| Reference area | `src/three/world/areas/atlas-hub/` | Atlas Hub: hall architecture, wayfinding, area composition + bounds. |
| Explorer | `src/three/player/explorer-controller.tsx` | Drag-to-look + bounded movement; bounds passed by the area. |
| Interaction framework | `src/three/interaction` | Context, proximity detector, registered targets, keyboard/click activation, HUD. |
| Generic exhibits | `src/three/exhibits` | Reads `exhibit` configuration; renders display plinths; no named project imports. |
| Project panel | `src/three/experience/project-information-panel.tsx` | Overlay presentation separate from interaction. |
| Performance defaults | `src/three/performance` | DPR cap, conservative renderer settings, explicit PCF shadow map. |

## Reference Environment: Atlas Hub

### 1. What the area represents

The Atlas Hub is the first polished slice of the interactive portfolio: a
**technical exhibition hall** that gives physical form to the portfolio's
"systems on display" idea. It is the quality benchmark every future area
should match, and the reference implementation of `docs/VISUAL_DIRECTION.md`.

### 2. Architectural boundaries

- One bounded hall, footprint **x ∈ [-9, 9], z ∈ [-9, 7.5]**, wall height
  **4.4**, visitor eye height **1.7**.
- Walkable bounds: `HUB_BOUNDS` exported from `atlas-hub.tsx`
  (`minX/maxX = ∓8.4`, `minZ/maxZ = -8.4/7`) and passed to
  `ExplorerController`. Movement is bounded, not collision-based.
- Spatial composition: entrance opening at z = 7.3, circulation spine along
  x = 0, three exhibit plinths (Lyrune at (-4.2, -2.6), Kerala at (4.2, -2.6),
  Sonara at (0, -4.8)), light gantry over the spine, status wall on the back
  wall.

### 3. Where its code lives

```text
src/three/world/areas/atlas-hub/
  atlas-hub.tsx           # composition root + HUB_BOUNDS + area fill lights
  hub-architecture.tsx    # walls, ribs, columns, gantry, entrance, status wall
  hub-navigation.tsx      # spine, threshold, exhibit chevrons
```

The area composes the shared `WorldEnvironment` from
`src/three/world/environment/world-environment.tsx` and registers exhibits
via `<ExhibitRegistry area="atlas-hub" />`.

### 4. How it loads

- The whole 3D chunk (engine + world + UI) is a single dynamic import from
  the launch button — unchanged boundary, do not regress it.
- `PortfolioCanvas` mounts `WorldAreas` (the seam) inside a Suspense
  boundary; `WorldAreas` currently mounts `<AtlasHub />` eagerly.
- **Future areas:** when a second area exists, convert `WorldAreas` into a
  router that dynamically imports only the active area by its stable ID.

### 5. Where its assets belong

None today — the hub is 100% procedural geometry. Future assets belong under
`public/models/atlas-hub/` and `public/textures/atlas-hub/`, following
`docs/ASSET_PIPELINE.md`.

### 6. Reusable environment components it uses

From `src/three/world/environment/`: `getEnvironmentMaterials()` /
`environmentSemanticColors` (shared material palette), `WallSegment`,
`Column`, `FrameRib` (architectural modules), `CeilingPanelLight`,
`LightRibbon` (emissive fixtures), `WorldEnvironment` (atmosphere, sun,
ground, grid).

### 7. How future areas should follow its pattern

1. Create `src/three/world/areas/<area-id>/<area-id>.tsx` exporting the area
   composition root and its bounds.
2. Compose: `WorldEnvironment` → area architecture → area navigation →
   `<ExhibitRegistry area="<area-id>" />` → `ExplorerController bounds={...}`
   → `InteractionDetector`.
3. Use the environment language for all structure; define one architectural
   idea per area (see `docs/VISUAL_DIRECTION.md` "Future district identity").
4. Register the area ID in `WorldAreas` (dynamic import once multiple areas
   exist) and use it in project `exhibit.area` configuration.
5. Keep the light budget (~6 lights: 1 hemisphere, 1 shadow directional,
   a few bounded points, one accent light per exhibit) and the semantic color
   rules (cyan = interactivity, amber = navigation).

### 8. Important performance constraints

- No new shadow-casting lights without a documented decision; the only one is
  in `WorldEnvironment`.
- Emissive fixtures are MeshBasic (unlit) — keep them that way.
- DPR capped at 1.5, antialiasing off, single 1024 shadow map; PCF shadow
  type set explicitly in `PortfolioCanvas`.
- Budgets and the measurement process: `docs/PERFORMANCE_BUDGETS.md`.
- Do not statically import Three/R3F/Drei outside the lazy chunk.

### 9. Dangerous files or systems

- **`interactive-portfolio-shell.tsx`:** a seemingly convenient static import
  here breaks the principal bundle guarantee.
- **`project-registry.ts`:** maintains ID/slug uniqueness and API contracts;
  it is the data seam for all presentation paths and a future CMS adapter.
- **`interaction-provider.tsx`:** target registration/focus state is a shared
  runtime contract. Changing events/detection without tracing
  `useInteractable`, `InteractionDetector`, and `InteractiveExperience` can
  silently break all exhibits.
- **`types/portfolio.ts`:** the domain vocabulary; the `area` union includes
  `atlas-hub`; `priority`, `secondaryCategories`, and `relatedProjectIds`
  drive the catalog hierarchy. Weak changes propagate everywhere.
- **`data/skills.ts` and `data/profile.ts`:** single sources of truth for
  evidence and identity — do not duplicate content from them in pages.
- **`environment-materials.ts`:** shared singletons — do not mutate them from
  area code, and do not add one-off materials for trivial variation.
- **`world-areas.tsx` / `areas/`:** do not append new areas to `AtlasHub`;
  keep areas independently mountable modules.
- **E2E script `scripts/atlas-e2e.mjs`:** dev-only; drives headless Chrome
  against a running dev server. Not part of the build.

### 10. What remains intentionally deferred

Final environment art and external assets, third-person character systems,
collision physics, world streaming/transitions, graphics settings UI, mobile
support for the full experience, real-device profiling (first priority), and
everything listed in `docs/ROADMAP.md` as deferred.

## Architectural rules

1. Do not hardcode project descriptions, technologies, or project-specific behavior inside 3D exhibit components.
2. Do not import Three.js/R3F/Drei anywhere in normal portfolio routes or conventional shared UI.
3. Preserve the explicit user-triggered dynamic import in the interactive launcher unless profiling supports a documented change.
4. Keep data contracts plain and serializable — no React, browser, or Three imports in `src/data` or `src/types`.
5. Do not add per-mesh keyboard listeners or direct modal logic; register `InteractionEvent` values through the shared interaction system.
6. Add world areas as independently mountable modules under `world/areas/`, mounted through `WorldAreas`; never grow `AtlasHub` into the whole world.
7. Reuse the environment language (materials, modules, fixtures); do not create uncontrolled per-area material sets.
8. Add only assets with a named route/area, format, budget, and measurement plan (`docs/ASSET_PIPELINE.md`).
9. Portfolio content is evidence-based: no unsupported technologies, no fabricated metrics, no invented links, and derived projects always carry attribution.

## Reference Implementation: Lyrune

Lyrune (`src/data/projects/lyrune.ts`) is the template for a complete project
integration: standard metadata, repository link, architecture layers, a full
`caseStudy` content block, and an exhibit configuration. `ProjectDetails`
renders the conventional page; `ExhibitRegistry` turns the exhibit config into
a labeled generic plinth; the shared interaction system emits the project ID;
and `ProjectInformationPanel` resolves the record again.

For another project, copy the structure — not Lyrune's wording:

1. Verify project facts from its repository (`docs/PORTFOLIO_INVENTORY.md`).
2. Create/register a `PortfolioProject` record with required metadata and any verified `links`.
3. Add `caseStudy` only with supported problem, solution, features, and decisions.
4. Add ordered `architecture.layers` when a concise verified flow is useful.
5. Add an `exhibit` configuration for an existing area (`atlas-hub`); do not write project-named code in `src/three`.
6. Run typecheck and test both the conventional route and the interactive panel links.

## Safe extension recipes

### Add a project
Create a typed record under `src/data/projects`, register it in `index.ts`,
then run typecheck. Add `exhibit` config only when it belongs in a mounted
area. See `docs/DATA_MODEL.md`.

### Add a category
Extend `projectCategories` in `src/types/portfolio.ts`; update
`ProjectFilter` groups and display naming when it exists. Do not use
arbitrary strings in records.

### Add a skill or evidence
Edit `src/data/skills.ts`; verify the project link against
`docs/SKILL_EVIDENCE.md` and `docs/PORTFOLIO_INVENTORY.md`.

### Add an exhibit
Extend `ExhibitPresentation` and create a focused generic component in
`src/three/exhibits`. It should receive configuration/props, register an
event, and never import a named record.

### Add an interaction type
Extend `InteractionEvent`; handle the new variant at the interactive
experience composition root or a focused handler it owns. Keep the provider
API stable.

### Add a demonstration type
Extend `DemonstrationConfiguration`, then create a dedicated renderer
selected at a presentation boundary. Avoid allowing
`ProjectInformationPanel` to accumulate unrelated rendering machinery.

### Add a world area
Follow the Atlas Hub pattern (section "Reference Environment" above and
`docs/DEVELOPMENT_GUIDE.md`).

## Known limitations

- Proximity focus only; no line-of-sight check or raycast reticle.
- Movement is a bounded camera controller, not collision/physics.
- `relatedProjectIds` exists but no record uses it yet (no verified
  relationships in the public repos).
- `thumbnail` and `imagePaths` are typed but unused — no media is verified
  yet; do not scrape screenshots from repos without license review.
- `information` is the only demonstration configuration rendered.
- WebGL detection is basic.
- The 3D hub's accessibility is foundational; use conventional pages for full
  content access.
- No real-device performance measurements exist yet — budgets are targets.
- The PvP concept and languages without public evidence (C, C++, C#, Java,
  PHP) are honestly labeled and must stay that way.
- The owner's name comes from the 2023 personal site; other personal details
  (education specifics, contact info) are intentionally not used.

## Future Content Work (needs owner verification)

1. **Links:** LinkedIn, email, resume, and any deployed apps are unknown —
   add them to `src/data/profile.ts` and project `links` only when supplied.
2. **Media:** screenshots/video for Sonara, Lyrune, and others once verified
   and license-safe; the typed media fields are ready.
3. **RecoverAI / ScrollBrake:** deepen case studies when the owner confirms
   further work or deployment.
4. **Kerala:** decide the honest status (prototype vs in-progress) once the
   owner confirms the project's future; the benchmark environment failures
   are documented in the repo.
5. **Game concept:** convert the PvP concept into a real project when a
   repository or prototype exists.
6. **Motor Track app:** behind an empty release repo; needs owner input to
   decide whether it becomes a portfolio project.

## Intentionally deferred features

Heavy binary GLB/KTX2 downloads (to maintain instant web load times under performance budgets), third-person character rigging (first-person inspection optimized), external CMS/backend database (statically verified data-first architecture), and external personal tracking cookies/analytics.

## Validation record (full project verification)

Executed: `npm run typecheck` (pass, code 0), `npm run build` (pass, code 0), and headless E2E verification test suite (`node scripts/atlas-e2e.mjs <dev-server-url>`):

- **Conventional routes**: (`/`, `/about`, `/projects`, `/skills`, `/projects/[slug]` for all 9 records) render statically with zero Three.js code in their initial page bundle.
- **Universal Command Palette**: Accessible via <kbd>Ctrl+K</kbd> / <kbd>Cmd+K</kbd> or header pill across conventional pages and 3D hub for instant search, project filtering, and spatial teleportation.
- **Procedural Web Audio Synthesizer**: Pure Web Audio API synthesis generating harmonic portal sweeps, glass chimes, tactile clicks, and combat audio cues with 0 KB asset load overhead and persistent sound toggle.
- **Multi-District Spatial World**:
  - `atlas-hub`: Reference exhibition hall with flagship pedestals and district portals.
  - `software-district`: Server lab architecture exhibiting Lyrune, Lucida-Sync, and RecoverAI.
  - `intelligence-observatory`: Calibrated observation deck exhibiting Kerala Flood Risk Platform.
  - `creative-workshop`: Dynamic arena exhibiting Sonara, ScrollBrake, Stance Combat PvP, and Neerad Store.
- **Interactive Demonstrations**:
  - Live Audio Spectrum FFT Visualizer (Lyrune).
  - Interactive Bash & API Terminal Console (Lucida-Sync & RecoverAI).
  - Flood Inundation & Alert Simulator (Kerala Flood Risk Platform).
  - Playable Combat Timing & Stance Trainer with tactical audio cues (Stance Combat PvP).
- **Diagnostics & Quality Control**:
  - Real-time FPS, draw calls, triangles, and geometry counter HUD (<kbd>P</kbd>).
  - Multi-tier dynamic quality presets (`low`, `balanced`, `high`).
  - Keyboard & navigation help guide modal (<kbd>?</kbd>).
- **Guided Director Tour & Discovery Journal (Phase 11)**:
  - **Hands-free Director Tour (<kbd>T</kbd>)**: Automated cinematic camera sequence visiting curated district waypoints with smooth cubic hermite position/lookAt interpolation and instant manual takeover on any WASD / arrow movement or mouse drag.
  - **Persistent Discovery Journal (<kbd>J</kbd>)**: 12 discrete exploration milestones spanning World Districts, Interactive Demonstrations, and Core Subsystems, persisted across sessions in `localStorage`.
  - **Exploration Ranks & Progress**: Real-time progress bar and title progression (*Curious Explorer* → *Systems Investigator* → *Senior Architecture Auditor* → *Master Systems Architect*).
  - **Micro-Toast Notifications**: Non-intrusive floating cyber alerts (`✦ [CATEGORY] UNLOCKED`) with automated queuing.
  - **Zero-Three.js Bundle Integrity**: Discovery Journal context and UI operate entirely outside Three.js dependencies, preserving lightweight page loads on all conventional routes.
- **Production & SEO**: Dynamic sitemap (`/sitemap.xml`), crawler policy (`/robots.txt`), OpenGraph meta tags, and Schema.org JSON-LD structured data.


## Next recommended tasks for repository owner

1. Collect personal links (LinkedIn, resume PDF, public email) into `src/data/profile.ts` when ready to publish.
2. Add screenshots or demo videos to `src/data/projects/<id>.ts` records as media assets become available.
3. Profile on lower-end mobile devices and fine-tune dynamic resolution scale for budget devices.

## Validation commands

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

For automated smoke pass with running dev server:

```bash
node scripts/atlas-e2e.mjs http://localhost:3001
```