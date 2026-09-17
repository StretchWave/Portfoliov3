# Project Atlas Architecture

This document describes the implemented architecture of Project Atlas. All claims here reflect the actual codebase.

---

## 1. High-Level Topology

```mermaid
flowchart TD
  A[Next.js App Router] --> B[Conventional Static Routes (SSG)]
  A --> C[/interactive Route]
  B --> D[Central Project Registry]
  B --> E[Versioned Client Storage Layer]
  C --> F[Client Launch Shell]
  F -->|explicit user gesture| G[Lazy 3D Experience Chunk]
  G --> H[WorldArea Router & Transition Engine]
  H --> I[Central Hub]
  H --> J[Software District]
  H --> K[Intelligence Observatory]
  H --> L[Creative Workshop]
  G --> M[Procedural Audio Synthesizer]
  G --> N[Interaction System]
  N --> O[Project Information Panel]
  D --> O
```

---

## 2. Next.js Routing & Bundle Isolation

1. **Zero Three.js Leakage on Conventional Routes**:
   - Conventional portfolio routes (`/`, `/about`, `/projects`, `/skills`, `/sandbox`, `/resume`, `/projects/[slug]`) do **not** import Three.js, React Three Fiber, or `@react-three/drei`.
   - The 3D engine is strictly isolated behind dynamic `import("@/three/experience/interactive-experience")` triggered only when the visitor explicitly clicks "Launch" on `/interactive`.
2. **Static Site Generation (SSG)**:
   - All known project pages (`/projects/[slug]`) and OpenGraph card routes implement `generateStaticParams()` to pre-render static HTML at build time.
   - Absent project slugs trigger Next.js `notFound()`.
3. **Canonical Site Source of Truth**:
   - `SITE_CONFIG` (`src/lib/site-config.ts`) defines the single canonical URL (`https://mohammedmishal.dev`), metadataBase, and OpenGraph defaults, eliminating scattered hardcoded domain strings.

---

## 3. Project Registry & Referential Integrity

All project facts are defined in `src/data/projects/` and indexed via `src/features/portfolio/project-registry.ts`.
- **Validation**: `validateProjectRegistry()` runs referential integrity checks verifying unique project IDs, unique slugs, valid related project IDs, and valid exhibit coordinates.
- **Derived Metrics**: Functions such as `getVerifiedProjects()`, `getProjectCount()`, `getVerifiedProjectCount()`, `getVerifiedSkills()`, and `getProjectTechnologies()` derive metrics dynamically. Hardcoded counts across headers, footers, and OG cards have been eliminated.
- **Honest Evidence Categorization**:
  - `verified-source`: Direct extract from an existing, verified public repository.
  - `adapted-example`: Simplified or adapted architecture snippet demonstrating system patterns.
  - `conceptual`: Purely conceptual designs (e.g. Stance Combat PvP).
  - `simulation`: Simulated demonstration environments (e.g. command console).

---

## 4. World District System & Lazy Loading

Atlas features four thematic 3D environments:
1. **Atlas Central Hub** (`atlas-hub`): Central exhibition rotunda and portal transit nexus.
2. **Software Systems District** (`software-district`): Server architecture and native systems laboratory.
3. **Intelligent Systems Observatory** (`intelligence-observatory`): Flood prediction, telemetry, and geospatial decision-support deck.
4. **Creative & Interactive Workshop** (`creative-workshop`): Mechanics arena, audio DSP, and interactive tools space.

### District Lifecycle & Memory Model
- **Lazy Mounting**: District modules are loaded lazily via dynamic imports. Only the currently active district component is mounted in the Three.js scene graph.
- **Runtime Caching**: When transitioning between districts, imported JS chunks remain cached in browser memory by the Webpack/Turbopack runtime; unmounted Three.js geometries and materials are disposed of to manage WebGL context load.
- **Race Condition Prevention**: `travelToArea()` in `area-context.tsx` uses transition cancellation tokens and active timer clearance to guarantee deterministic resolution during rapid portal inputs.

---

## 5. Audio Bus Architecture

The procedural Web Audio API synthesizer (`src/lib/audio-synthesizer.ts`) generates 100% of portfolio sounds procedurally with 0 external audio asset downloads.

```text
AudioContext
     │
Master Gain (volume clamp: 0.0 - 1.0)
     ├── Ambient Gain Bus
     │        └── Procedural District Soundscapes (sine / triangle sub-basses)
     └── Effects Gain Bus
              ├── Spatial Audio Panner (StereoPannerNode + inverse-distance attenuation)
              └── UI / Gameplay Sound Effects (clicks, chimes, combat cues, shutters)
                       │
                  Destination (hardware audio output)
```

- **Audio Safety**: All sounds route through `this.getEffectsDestination()`, strictly honoring master and effects volume levels. No node connects directly to `ctx.destination`.
- **Visibility Safety**: Browser `visibilitychange` events smoothly fade ambient gains without resetting user preferences or blasting audio on tab restore.

---

## 6. Fault-Tolerant Client Persistence Layer

Client settings and discovery journal state are managed by versioned storage schemas (`src/lib/storage.ts`):
- `atlas-settings-v1`: Sound enabled, master/ambient/effects volume, sound profile, spatial toggle, haptics toggle.
- `atlas-discovery-v1`: Discovered milestone IDs and timestamps.
- **Fault Tolerance**: Parsing functions (`parseSettings`, `parseDiscovery`) validate types, clamp numbers, and discard corrupted entries without throwing. Legacy unversioned keys are migrated automatically.
- **Hydration Safety**: React 19 `useSyncExternalStore` synchronizes client-side discovery progress across browser tabs and avoids SSR hydration mismatches.

---

## 7. Accessibility & Dialog Mechanics

- **Modal Primitives**: `useModalFocusTrap` (`src/lib/modal-accessibility.ts`) enforces focus trapping, background click handling, Escape key dismissal, and returns focus to the triggering element upon close.
- **Systems Topology Graph**: `SystemsTopologyGraph` features valid accessible names, SVG descriptions, keyboard navigation (`Enter` / `Space`), and screen-reader alternatives.
- **Command Palette**: Follows the accessible combobox/listbox pattern with ARIA roles, active item indicators, and global keyboard shortcuts.
- **Centralized Shortcuts**: `src/lib/keyboard-shortcuts.ts` centralizes all portfolio shortcuts and prevents hotkeys from firing while the user is typing in forms or search inputs.
- **Reduced Motion**: All animations and particle systems respect CSS `@media (prefers-reduced-motion: reduce)`.

---

## 8. Atlas Studio Visual Authoring Architecture

Atlas Studio (`/studio`) provides a desktop visual authoring environment for spatial world scenes, decoupling 3D layout, lighting, and environmental properties from React JSX components.

```
                    Canonical Atlas Data
               (TypeScript files in src/data/)
                          |
           +--------------+--------------+
           |                             |
           v                             v
     Atlas Studio                   Web Runtime
   /studio route                 /interactive route
   edit / preview               render / interact
           |                             |
           +------------+----------------+
                         |
                  Conventional Site
                /, /about, /projects...
```

### Key Architectural Invariants

1. **Single Source of Truth**:
   - Scene configurations live in `src/data/scenes/` (`as const satisfies AreaSceneDefinition`).
   - `WorldEnvironment`, `AtlasHub`, `SoftwareDistrict`, `IntelligenceObservatory`, and `CreativeWorkshop` consume canonical data definitions via the universal `DataDrivenArea` component.
   - Area metadata (`WORLD_AREAS`) is derived directly from scene definitions.
2. **Strict Bundle Isolation**:
   - `/studio` is an independent client route with SSR disabled (`dynamic(() => import("./studio-app"), { ssr: false })`).
   - Studio components, editor state, and TransformControls are never imported by conventional routes or the `/interactive` runtime.
3. **Pure-Logic Scene Validation**:
   - `src/lib/scene-validation.ts` validates ID uniqueness, bounds sanity, spawn coordinates, portal targets, and light count budgets without any React or Three.js dependencies.
4. **Snapshot-Based Undo/Redo Engine**:
   - `src/app/studio/state/history.ts` manages an immutable stack of scene snapshots.
   - Gizmo drag events defer history commits until mouse-up to prevent per-frame snapshot bloat.
5. **Bi-Directional Scene Pipeline**:
   - Authors can visually position objects, modify lighting, export scene JSON, and synchronize changes back to version-controlled TypeScript definitions using `scripts/scene-to-ts.ts`.
