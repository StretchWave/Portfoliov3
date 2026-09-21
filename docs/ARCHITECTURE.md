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
   - Site profile and metadata derive directly from `src/data/app-content.ts`.
2. **Strict Bundle Isolation**:
   - `/studio` is an independent client route with SSR disabled (`dynamic(() => import("./studio-app"), { ssr: false })`).
   - Studio components, editor state, and TransformControls are never imported by conventional routes or the `/interactive` runtime.
3. **Pure-Logic Scene Validation**:
   - `src/lib/scene-validation.ts` validates ID uniqueness, bounds sanity, spawn coordinates, portal targets, colliders, rooms, and app content without any React or Three.js dependencies.
4. **Snapshot-Based Undo/Redo Engine**:
   - `src/app/studio/state/history.ts` manages an immutable stack of scene snapshots.
   - Gizmo drag events defer history commits until mouse-up to prevent per-frame snapshot bloat.
5. **Bi-Directional Scene Pipeline**:
   - Authors visually position objects, modify lighting, configure colliders/rooms/content, and persist changes directly to version-controlled TypeScript definitions via `/api/studio/save`.

---

## 9. World, Area, and Room Spatial Architecture

Project Atlas uses a multi-tier spatial model to allow arbitrary scene expansion without hardcoding React components:

```text
WORLD (WorldManifest)
  ├── AREA / DISTRICT (e.g. Atlas Central Hub, Creative Workshop)
  │     ├── Configuration & District-Wide Environment
  │     └── ROOMS (RoomDefinition)
  │           ├── Bounds (editable with auto-fitting)
  │           ├── Spawn Points (SpawnPoint[] with default tag)
  │           ├── Objects (SceneObject[])
  │           │     ├── Visual Mesh
  │           │     ├── Colliders (Physical / Trigger)
  │           │     └── Interactions
  │           └── Room-Specific Environment Overrides
```

- **World Manifest** (`src/data/scenes/manifest.ts`): Canonical registry of all world areas, default room mappings, navigation display ordering, and room manifests.
- **Room Definition** (`src/types/scene.ts`): Encapsulates room bounds, multiple spawn points (`SpawnPoint`), objects, and environment overrides.
- **Templates**: Instant room creation in Studio using preconfigured spatial templates: Empty, Gallery, Exhibition Hall, Workshop, Corridor, Office, and Open Area.
- **Fitted Bounds**: `calculateFittedBounds(objects, padding)` dynamically computes AABB extents surrounding room objects with configurable safety margins.
- **Referential Integrity**: Room deletion checks all scene objects across the area to prevent deleting rooms referenced by active portals.

---

## 10. First-Class Colliders & Lightweight CollisionWorld

Atlas decouples physical collision from visual meshes using explicit collider definitions:

- **Canonical Collider Schema** (`ColliderDefinition`):
  - Types: `box`, `sphere`, `capsule`, `cylinder`.
  - Properties: `enabled`, `center` (local offset), `size` / `radius` / `height`, `rotation`, `isTrigger`.
  - Multiple colliders per object: `colliders?: ColliderDefinition[]` on `SceneObjectBase`.
- **System Separation**:
  - `visible`: Controlled by mesh visibility.
  - `selectable`: Controlled by editor raycasting.
  - `collisionEnabled`: Flags physical obstacle blocking player movement.
  - `isTrigger`: Non-blocking overlap volume participating in interaction triggers.
  - `locked`: Prevents accidental editor modification.
- **Lightweight Collision Engine** (`src/lib/collision-world.ts`):
  - Pure mathematical AABB / sphere / cylinder collision routines without heavy external physics engines.
  - `queryMovement(start, desiredMovement, playerRadius, playerHeight)` provides axis-separated sliding resolution against physical obstacles.
  - `queryOverlap(position, radius, height)` discovers active trigger volumes and dispatches `atlas:trigger-enter` / `atlas:trigger-exit` events.
  - Centralized singleton `globalCollisionWorld` registered automatically by `DataDrivenArea`.

---

## 11. Trigger & Interaction Integration

Triggers integrate seamlessly with the existing `InteractionDefinition` system:
- **Event Flow**: Player enters trigger volume -> `ExplorerController` queries `queryOverlap` -> dispatches DOM/Three.js interaction events -> activates assigned action (`show-project`, `teleport`, `trigger-dialog`).
- **Unified Navigation Targets**: Portals and teleporters support target kind `area`, `room`, or `spawn-point` through a unified target descriptor.
- **Project Exhibits**: 3D exhibits reference canonical `projectId` from `src/features/portfolio/project-registry.ts` rather than duplicating metadata.

---

## 12. Application Content Authoring

To ensure the portfolio website is authored from Studio without scattered text constants:
- **Canonical App Content** (`src/data/app-content.ts` & `src/types/content.ts`):
  - Single source of truth for `identity`, `hero`, `about` paragraphs, `careerDirections`, `interactiveExperience`, `seo`, and `social` links.
  - `src/data/profile.ts` and `src/lib/site-config.ts` import from `defaultAppContent`.
- **Studio App Content Editor**:
  - Modal editor accessible from the Studio top bar (`📝 App Content`).
  - Supports tabbed navigation, list add/delete/reorder, URL validation, and a live side-by-side preview mode matching site typography and styling.
  - Saving in Studio persists directly to `src/data/app-content.ts`.

---

## 13. Server-Side Persistence & Dynamic Storage

Persistence is managed by `/api/studio/save` backed by `src/lib/scene-storage-server.ts`:
- **Direct Source Persistence**: Edits in Studio write deterministic TypeScript source files using AST-free code generators (`serializeSceneDefinition`, `serializeAppContent`, `serializeWorldManifest`).
- **Dynamic Sandboxed Storage**: `getSafeSceneFilePath` validates relative paths, resolves within `src/data/scenes/`, and strictly prevents directory traversal attacks.
- **Atomic Writes & Backups**: Writes create a temporary file (`.tmp`) before atomic renaming, and preserve timestamped backups (`.bak.<timestamp>`) alongside revision tracking (`.revision.json`).

---

## 14. System Boundaries & Lifecycle Isolation

| Dimension | Canonical Source | Generated / Transient | Editor-Only (`/studio`) | Runtime-Only (`/interactive`) |
| :--- | :--- | :--- | :--- | :--- |
| **World & Scenes** | `src/data/scenes/*.ts`, `manifest.ts` | `.revision.json`, `.bak.*` backups | `RoomManagementDialog`, `RoomBoundsVisualizer` | `DataDrivenArea`, `PortalGateway` |
| **Colliders** | `ColliderDefinition` on `SceneObject` | None | `ColliderVisualizer` wireframes, `CollisionSection` inspector | `globalCollisionWorld` sliding math |
| **Content** | `src/data/app-content.ts` | None | `AppContentEditor` modal & live preview | Layout SEO tags, `/about`, `/` |
| **Controls** | Camera and tool settings | Local storage UI preferences | `TransformControls`, Blender shortcuts, 3D cursor | `ExplorerController`, PointerLock |

