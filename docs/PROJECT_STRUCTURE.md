# Project Structure and Ownership

```text
src/
  app/                 App Router routes, metadata, route-local client shells
  components/
    layout/            Conventional page shell and navigation
    ui/                Small reusable conventional UI primitives
  data/
    profile.ts         Single-source owner profile (name, intro, directions, links)
    skills.ts          Evidence-based skill registry with project references
    projects/          Declarative, version-controlled project records and registration
  features/portfolio/  Project registry and conventional project presentation
  three/
    core/              Canvas and composable 3D runtime setup
    world/
      world-areas.tsx  World composition seam (future dynamic area router)
      environment/     Shared environment language: materials, lighting fixtures, architectural modules, global atmosphere
      areas/           Independently mountable world areas (each with its own folder)
        atlas-hub/     Reference environment: hall architecture, wayfinding, composition root
    player/            Camera and movement controllers
    interaction/       Generic detection, registration, events, and HUD
    exhibits/          Data-driven project-to-scene presentations
    experience/        Lazy 3D composition root and overlay UI
    performance/       Renderer and future asset-loading policy helpers
scripts/               Dev-only validation scripts (e.g. headless E2E smoke test)
  types/               Framework-independent domain contracts
public/
  models/              Future optimized GLB/GLTF assets only
  textures/            Future optimized KTX2/Basis textures only
  images/              Conventional public images if Next Image is unsuitable
docs/                  Current architecture and maintenance documentation
```

## Boundary rules

### `src/app`

Contains routes, route metadata, and page composition. It must not contain reusable 3D implementation code, project records, or large UI components. `app/interactive/interactive-portfolio-shell.tsx` is the deliberate loading boundary for the whole 3D subtree.

### `src/data` and `src/types`

Contain plain, serializable domain data and contracts (`profile.ts`, `skills.ts`, `projects/`, types). They must not import React, Next.js, Three.js, browser APIs, or components. This is what makes a future CMS or API migration tractable.

### `src/features/portfolio`

Contains the registry and conventional portfolio presentation. The registry is allowed to know about data registration; it must not know about Canvas lifecycle, player movement, or scene geometry.

### `src/three`

Contains browser-only interactive functionality, all reached through the lazy entry point. A subdirectory should have one responsibility; do not create a catch-all world component that owns player, UI, interaction, and all district content.

### `src/components`

Contains small web/UI primitives shared by normal pages. Do not put scene-specific overlay components here unless they are genuinely reusable without 3D context.

### `public`

The reference hub uses procedural geometry only, so `public/models` and `public/textures` are empty by design. Add only optimized, production-bound assets via the rules in `docs/ASSET_PIPELINE.md`. Do not add raw source Blender files, uncompressed texture exports, or a miscellaneous download folder to this repository.
