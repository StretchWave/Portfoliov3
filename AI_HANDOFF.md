# AI Handoff — Project Atlas

## Project status

The foundation, the **Visual Direction and Environment Foundation** phase, and
the **Complete Portfolio Content Integration** phase are done. The portfolio
now has a verified catalog of 9 projects (3 flagships, 1 featured, 3
supporting/concept, 1 experiment, 1 archived) plus an evidence-based skills
system and a single-source profile. The conventional site covers home, about,
projects (with category filters and priority hierarchy), skills, and dynamic
project-detail routes. The optional `/interactive` route still performs a
browser WebGL check and only imports the 3D engine after the visitor presses
**Launch 3D hub**; the Atlas Hub now holds three data-driven exhibits
(Lyrune, Kerala Flood Risk Platform, Sonara).

Lyrune remains the reference project integration (verified GitHub link,
long-form case study, labeled generic exhibit). Sonara is the newest flagship
(a fork of Harmony Music — always attribute). No fabricated metrics, media,
or links were added anywhere.

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

Final environment art, heavy GLB/KTX2 assets, third-person character systems,
advanced graphics settings, full district streaming/transitions, database/CMS,
authentication, multiplayer, final project exhibits, complete game
demonstrations, deployment, analytics, and real-device profiling.

## Validation record (this phase)

Executed: `npm run typecheck` (pass), `npm run build` (pass), and a headless
Chrome E2E run (`node scripts/atlas-e2e.mjs <dev-server-url>`):

- Conventional routes (/, /about, /projects, /skills, /projects/<slug> for
  every record) render; no Three.js content on conventional pages.
- Launching the 3D hub mounts the experience; the Atlas Hub renders with
  three exhibits labeled (Lyrune, Kerala Flood Risk Platform, Sonara); WebGL
  context healthy.
- Movement works; the proximity HUD shows "Inspect exhibit"; pressing E opens
  the project panel with verified links; Escape closes it.
- All project links point at verified GitHub URLs.

No frame-rate/GPU measurements were taken on real hardware; do not claim
performance numbers.

## Next recommended tasks

1. **Profile the Atlas Hub on target hardware** (`docs/PERFORMANCE_BUDGETS.md`).
2. Convert the PvP concept into a real project record once a repository exists.
3. Add verified media to flagship records (license-safe screenshots/video).
4. Build the first district (e.g. Software Systems) as a new area module and
   convert `WorldAreas` to a dynamic area router.
5. Collect owner-supplied links (LinkedIn/resume) into `src/data/profile.ts`.

## Validation commands

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Then manually test the conventional routes and the interactive launch. For an
automated smoke pass with a running dev server:

```bash
node scripts/atlas-e2e.mjs http://localhost:3000
```