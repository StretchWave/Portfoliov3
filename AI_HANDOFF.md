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
- **Mobile Touch Controls & Virtual Joystick (Phase 12)**:
  - **Virtual Movement Joystick**: Dual-ring glassmorphic thumbstick positioned on the bottom-left with normalized directional vector calculation and direct mutable state streaming into R3F `useFrame`, eliminating React re-renders for a 60 FPS mobile experience.
  - **Touch-Swipe Camera Look**: Touch drag orbiting on the right side of the screen with pitch constraints.
  - **Floating Touch Action Button (`[ ⬡ INTERACT ]`)**: Dynamic contextual action button appearing on the bottom-right when exhibits or portals are in range, displaying the exhibit title and allowing single-tap inspection without keyboard `E`.
  - **Adaptive Interaction Telemetry**: `InteractionHud` dynamically toggles between keyboard instructions and touch prompts based on input device capability.
- **Dynamic OpenGraph Social Image Generation & Blueprint Visuals (Phase 13)**:
  - Next.js dynamic `ImageResponse` generating 1200×630 cards for the root page and all 9 individual project detail pages with custom branding, tech stacks, and live metrics.
  - Decorative SVG architectural blueprint headers on all conventional project cards with system code badges (`SYS-LYRU`, `SYS-KERA`, etc.).
- **Procedural Generative Ambient Soundscapes (Phase 14)**:
  - 100% code-synthesized ambient audio per district via browser Web Audio API:
    - *Central Hub*: Resonant Lydian chime drone.
    - *Software Systems*: Deep sub-bass server hum and filtered forced-air noise modulation.
    - *Intelligence Observatory*: Atmospheric oceanic/rain sub-bass resonance.
    - *Creative Workshop*: Warm harmonic analog synthesizer pad.
  - Smooth 1.2-second equal-power crossfading on portal travel, master volume persistence, and automatic muting on browser tab blur.
- **Production Hardening, PWA & CI/CD Pipeline (Phase 15)**:
  - Strict HTTP security headers in `next.config.ts` (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy).
  - Progressive Web App (PWA) manifest (`manifest.ts`) for mobile/desktop standalone installation.
  - Automated GitHub Actions CI workflow (`.github/workflows/ci.yml`) validating TypeScript static typing and Turbopack production builds on every push and pull-request.
- **Interactive Skills Matrix, Multi-Dimensional Project Explorer & Holographic Pedestals (Phase 16)**:
  - **Interactive Skills-to-Project Matrix (`/skills`)**: Searchable, mode-filtered (`All`, `With Project Evidence`, `Core & Production`) matrix linking technical competencies directly to verified project case studies with instant telemetry breakdowns and zero Three.js bundle leakage.
  - **Multi-Dimensional Project Explorer (`/projects`)**: Instant keyword search, priority chips (`Flagship`, `Featured`, `Supporting`, `Experiment`), multi-attribute sorting (`Priority`, `Alphabetical`, `Tech Stack Depth`), live result count telemetry, and one-click reset.
  - **In-World Holographic Exhibit Pedestals**: Continuous vertical sine-wave bobbing (`2.62 + sin(t * 1.8) * 0.04`), radiant glowing backdrop aura, and proximity-aware focus states displaying interactive action cues (`[ ⬡ TAP / PRESS E ]`) as the user approaches each exhibit.
- **Deep Scan & Quality Hardening Audit**:
  - **Headless Chrome Multi-Route Audit**: 0 console errors, 0 console warnings, 0 missing image alts, 0 empty buttons, 0 empty links, and 0 horizontal overflows across all desktop routes and mobile viewports (375px).
  - **Directional Proximity Focus (`interaction-provider.tsx`)**: Upgraded proximity detection with camera yaw directional vector scoring and rear-target culling, preventing portals and exhibits behind the player from stealing focus upon spawning into world districts.
  - **Skills Matrix Filter Selection Fallback (`skills-matrix-explorer.tsx`)**: Dynamically falls back to the first match within active filters when a user searches or changes evidence mode, preventing stale unlisted selections.
  - **Project Explorer Filter State (`project-filter.tsx`)**: Extended `hasActiveFilters` to recognize custom sort orders (`sortBy !== "priority"`), ensuring the reset button is always available when user preferences diverge from defaults.
  - **Universal Escape Key Dismissal**: Added `Escape` key listeners to `DiscoveryJournalModal` and `ControlsHelpModal` matching `ProjectInformationPanel`, ensuring consistent keyboard accessibility across all overlay dialogs.
  - **Clean Code Hygiene**: Re-organized root layout imports to adhere to strict ESM conventions.
- **Spatial 3D Audio Sonification, Audio & Haptics Control Center & Interactive Pipeline Diagrams (Phase 18)**:
  - **Spatial 3D Audio Sonification (`spatial-audio-listener.tsx`, `audio-synthesizer.ts`)**:
    - Real-time 3D stereo audio panner tracking player/camera position $(X, Z)$ and yaw rotation relative to in-world exhibit coordinates.
    - Inverse distance attenuation with soft acoustic horizons (skip beyond 24 units), dynamic stereo panning based on listener orientation angle, and profile-specific wave synthesis (`cybernetic` sawtooth, `harmonic` triangle, `crisp` sine).
  - **Audio & Haptics Control Center Modal (`audio-haptics-modal.tsx`)**:
    - Full-featured accessibility and audio control center accessible via top bar button or <kbd>U</kbd> hotkey.
    - Master, Ambient, and Effects volume sliders with real-time Web Audio gain node binding and `localStorage` persistence.
    - Spatial 3D Audio toggle, sound profile selector (*Cybernetic Core*, *Ambient Harmonic*, *Crisp Studio*), and interactive tactile test bench for mobile haptics and procedural audio preview.
  - **Interactive Architectural Pipeline Diagram (`architectural-pipeline-diagram.tsx`)**:
    - Replaces static lists on all project detail case studies (`/projects/[slug]`) with an interactive sequential pipeline architecture visualizer.
    - Features stage categorization heuristics (*Ingestion / Source*, *Core Processing*, *Governance & Safety*, *State & Persistence*, *Egress / Interface*), directional SVG vector connectors with animated data pulse flow, active stage inspection with upstream/downstream dependency mapping, and dynamic sequential payload simulation mode with synchronized melodic audio feedback (`soundManager.playBlip()`).
- **Systems Diff Engine: Cross-Project Architectural Trade-Off Matrix (Phase 19)**:
  - **Systems Diff Engine Modal & Comparison Toolbar (`project-comparison-modal.tsx`, `project-filter.tsx`)**:
    - Interactive comparison drawer mounted on `/projects` allowing visitors to compare 2 to 3 systems side-by-side.
    - Quick comparison presets: *Desktop Performance & IPC* (Sonara vs Lyrune), *Governance & Bounded Execution* (RecoverAI vs Lucida-Sync), *Big Data vs Local-First Autonomy* (Kerala Flood Risk vs Neerad Store), and *The Flagship Triad* (Sonara, Lyrune, Kerala Flood Risk).
    - Detailed breakdown comparing architecture paradigms, latency & frame budgets, state management strategies, failure modes, concurrency models, and key architectural trade-offs (what was chosen vs rejected and why).
- **Drone Flight Free-Cam Mode, FOV Controls & Viewport Screenshot Capture (Phase 20)**:
  - **Drone Flight Free-Cam Mode (`explorer-controller.tsx`, `camera-settings.ts`)**:
    - Unconstrained 3D camera flight toggled via <kbd>F</kbd> key or topbar trigger (`🛸 Flight (F)`).
    - 3D pitch-aware flight kinematics with ascending (<kbd>Space</kbd>) and descending (<kbd>C</kbd> / <kbd>Shift</kbd>) vertical controls, $2.5\times$ expanded horizontal exploration horizon, and altitude bounds ($0.4\text{m} - 25.0\text{m}$).
    - Floating Flight HUD telemetry banner displaying real-time altitude ($Y$ meters) and flight key instructions.
    - Procedural audio swoops in `AudioSynthesizer` upon engaging/disengaging flight mode.
  - **Camera Field of View (FOV) Adjustments (`camera-controller.tsx`)**:
    - Real-time viewport optics customization ($50^\circ - 105^\circ$) via <kbd>[</kbd> and <kbd>]</kbd> keyboard shortcuts with instant projection matrix updates and `localStorage` persistence.
  - **High-Resolution Viewport Screenshot Capture Tool (`viewport-capture.ts`)**:
    - One-click / <kbd>X</kbd> screenshot capture utility composite-rendering an offscreen canvas with a cyberpunk watermark (`◆ PROJECT ATLAS // [DISTRICT] // [TIMESTAMP]`).
    - Mechanical dual-click shutter sound synthesis and automatic PNG download (`atlas-[district]-[timestamp].png`).
- **Architectural Core Memory Terminals & In-World Code Snippet Inspector (Phase 21)**:
  - **Typed Production Code Snippet Registry (`code-snippets-data.ts`)**:
    - Statically typed repository of authentic production code excerpts across 8 engineering systems (Sonara, Lyrune, Kerala Flood Risk, RecoverAI, Lucida-Sync, Neerad Store, ScrollBrake, and Stance Combat PvP).
    - Captures algorithmic complexity notations ($O(\log n)$, $O(1)$, $O(V+E)$), authentic filepaths, and technical architectural problem statements.
  - **Zero-Dependency Cyberpunk Code Snippet Inspector (`project-code-inspector.tsx`)**:
    - Pure React and CSS monospace viewer featuring syntax-inspired line numbers, file badges, time/space complexity chips, multi-snippet tabs, and one-click copy with tactile audio feedback.
    - Zero external syntax highlighting bloat (no Prism/Highlight.js bundle penalties), ensuring instant render speed and zero layout shifts.
  - **Case Study Integration (`project-detail-code.tsx`, `project-details.tsx`)**:
    - "Core Abstractions & Code Architecture" section mounted on all conventional project detail pages (`/projects/[slug]`), keeping Three.js bundles strictly quarantined to `/interactive`.
- **Live Engineering Algorithm Sandboxes (Phase 22)**:
  - **Dedicated `/sandbox` Computational Test Bench**:
    - Zero-dependency client-side interactive engineering algorithms running directly in browser TypeScript.
  - **Biquad DSP Audio Filter Visualizer (`dsp-filter-sandbox.tsx`)**:
    - Direct Form II Transposed IIR filter evaluating $H(z)$ transfer function over a $20\text{Hz}-20\text{kHz}$ logarithmic spectrum based on Robert Bristow-Johnson's Audio EQ Cookbook formulas.
    - Dynamic SVG magnitude response curve with cutoff marker, resonance $Q$ factor, and live Web Audio pink noise pass-through audition (`[ 🔊 Audition ]`).
  - **Hydrological DEM Runoff & Flood Simulator (`hydrology-runoff-sandbox.tsx`)**:
    - $24 \times 24$ cellular automaton simulating rainfall precipitation, Horton infiltration, and hydraulic head gradient routing.
    - Real-time shaded relief elevation heatmap with dynamic water depth overlay, elevation relief presets (Western Ghats River Valley, Highland Reservoir, Coastal Estuary, Alluvial Plain), and hydrograph volume metrics.
  - **Deterministic Combat Action Finite State Machine Parser (`combat-fsm-sandbox.tsx`)**:
    - Deterministic 60 FPS combat state machine modeling startup commitment windows, active hitbox generations, whiff recovery periods, invulnerability frames (I-frames), and frame advantage (+/- block advantage).
    - Segmented frame timeline with moving needle, 2D wireframe fighter schematic with hitbox/hurtbox displays, and manual single-frame step scrubbers (`[ ⏯ Step +1f ]`).
  - **Multi-Sandbox Hub Container (`sandbox-hub.tsx`, `app/sandbox/page.tsx`)**:
    - Multi-tab navigation with acoustic clicks (`soundManager.playBlip()`) and system metadata.
- **Machine-Readable Engineering Dossier Export & Print-Optimized Resume Engine (Phase 23)**:
  - **Dedicated `/resume` Engineering Dossier Route (`app/resume/page.tsx`, `resume-view.tsx`)**:
    - High-fidelity dual-page engineering resume layout backed by verified production projects and evidence-based skills.
  - **JSON Resume Schema Exporter (`json-resume-data.ts`)**:
    - Generates and downloads official JSON Resume schema format (`mohammed-mishal-resume.json`) for automated ATS parsing and indexing.
    - Includes one-click ATS plaintext resume copy utility with acoustic confirmation.
  - **Dynamic Focus Re-ranking**:
    - Focus chips ("All Systems", "Desktop & Native", "Intelligent & Data", "Games & Web") dynamically prioritizing relevant project achievements.
  - **Clean 2-Page `@media print` Stylesheet (`globals.css`)**:
    - Strips all web navigation chrome, backgrounds, and glow effects on print dialog.
    - Enforces high-contrast black & white typography and strict `break-inside: avoid;` rules, guaranteeing a clean 2-page printout or PDF export.
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