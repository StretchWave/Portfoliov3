# AI Handoff — Project Atlas

## Project status

The foundation is complete and builds as a small working vertical slice. The conventional portfolio has home, about, project index, and dynamic project-detail routes. The optional `/interactive` route performs a browser WebGL check and only imports the 3D engine after the visitor presses **Launch 3D hub**.

Inside the loaded prototype hub, visitors can move with WASD/arrow keys, drag the scene to control the camera, approach data-driven project exhibits, receive a prompt, press `E` or click an exhibit, view real sample project information, close it with a button/Escape, and continue exploring.

It uses greybox primitives only. Lyrune is now the first verified reference integration: it has a real GitHub repository link, a data-driven long-form case study, a labeled generic exhibit, and project links in the information panel. No final environment art, external model/texture, or fabricated demo has been added.

## Implemented systems

| System | Location | Notes |
| --- | --- | --- |
| Conventional App Router portfolio | `src/app`, `src/components`, `src/features/portfolio/components` | Server-first pages; usable without WebGL. |
| Typed project records + registry | `src/types/portfolio.ts`, `src/data/projects`, `src/features/portfolio/project-registry.ts` | Single registration point, duplicate guard, stable query API. |
| Generic case-study presentation | `src/features/portfolio/components/project-detail-*.tsx` | Server-rendered composition driven by optional typed `caseStudy` content. |
| Explicit lazy 3D launch | `src/app/interactive/interactive-portfolio-shell.tsx` | Do not replace its event-triggered import with a static import. |
| Canvas + prototype hub | `src/three/core`, `src/three/world` | Small mounted area with baseline renderer policy. |
| Explorer | `src/three/player/explorer-controller.tsx` | Minimal drag-to-look + bounded movement. |
| Interaction framework | `src/three/interaction` | Context, proximity detector, registered targets, keyboard/click activation, HUD. |
| Generic exhibits | `src/three/exhibits` | Reads `exhibit` configuration; does not import named project records. |
| Project panel | `src/three/experience/project-information-panel.tsx` | Overlay visual presentation separate from interaction. |
| Performance defaults | `src/three/performance` | DPR cap and conservative renderer settings. |

## Important files

- Application entry pages: `src/app/page.tsx`, `src/app/projects/page.tsx`, `src/app/interactive/page.tsx`.
- Opt-in 3D boundary: `src/app/interactive/interactive-portfolio-shell.tsx`.
- Project contract: `src/types/portfolio.ts`.
- Project registration: `src/data/projects/index.ts`.
- Project queries: `src/features/portfolio/project-registry.ts`.
- 3D composition root: `src/three/experience/interactive-experience.tsx`.
- 3D world: `src/three/world/prototype-hub.tsx`.
- Player: `src/three/player/explorer-controller.tsx`.
- Interaction contracts/context: `src/three/interaction/interaction-types.ts`, `src/three/interaction/interaction-provider.tsx`.
- Exhibit bridge: `src/three/exhibits/exhibit-registry.tsx`, `src/three/exhibits/project-exhibit.tsx`.
- Full rationale: `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/PERFORMANCE_STRATEGY.md`.

## Architectural rules

1. Do not hardcode project descriptions, technologies, or project-specific behavior inside 3D exhibit components.
2. Do not import Three.js/R3F/Drei anywhere in normal portfolio routes or conventional shared UI.
3. Preserve the explicit user-triggered dynamic import in the interactive launcher unless profiling supports a documented change.
4. Keep data contracts plain and serializable—no React, browser, or Three imports in `src/data` or `src/types`.
5. Do not add per-mesh keyboard listeners or direct modal logic; register `InteractionEvent` values through the shared interaction system.
6. Add world districts as independently mountable/lazy modules, never as an unbounded `PrototypeHub` file.
7. Add only assets with a named route/area, format, budget, and measurement plan.

## Reference Implementation: Lyrune

Lyrune (`src/data/projects/lyrune.ts`) is the template for a complete project integration. Its verified record supplies standard metadata, a repository link, architecture layers, a `caseStudy` content block, and an exhibit configuration. `ProjectDetails` renders the conventional page from those fields; `ExhibitRegistry` turns the same record’s exhibit configuration into a labeled generic display; the shared interaction system emits the project ID; and `ProjectInformationPanel` resolves the record again to display its case-study/repository paths.

For another project, copy the structure—not Lyrune’s wording or technologies:

1. Verify project facts from its repository or supplied materials.
2. Create/register a `PortfolioProject` record with required metadata and any verified `links`.
3. Add `caseStudy` only with supported problem, solution, features, and decisions.
4. Add ordered `architecture.layers` when a concise verified flow is useful.
5. Add an `exhibit` configuration for an existing area; do not write project-named code in `src/three`.
6. Run typecheck and test both the conventional route and the interactive panel links.

## Safe extension recipes

### Add a project

Create a typed record under `src/data/projects`, register it in `index.ts`, then run typecheck. Add `exhibit` config only when it belongs in a mounted area. See `docs/DATA_MODEL.md`.

### Add a category

Extend `projectCategories` in `src/types/portfolio.ts`; update display/filter UI when it exists. Do not use arbitrary strings in records.

### Add an exhibit

Extend `ExhibitPresentation` and create a focused generic component in `src/three/exhibits`. It should receive configuration/props, register an event, and never import a named record.

### Add an interaction type

Extend `InteractionEvent`; handle the new variant at the interactive experience composition root or a focused handler it owns. Keep the provider API stable.

### Add a demonstration type

Extend `DemonstrationConfiguration`, then create a dedicated renderer selected at a presentation boundary. Avoid allowing `ProjectInformationPanel` to accumulate unrelated rendering machinery.

### Add a world area

Create a new area module under `src/three/world`, put an explicit loading boundary around it, dynamically import it when needed, and use its stable area ID in project exhibit configurations.

## Known limitations

- The prototype has proximity focus only; it does not check line of sight or provide a raycast reticle.
- Movement is a bounded camera controller, not collision/physics or character locomotion.
- Lyrune has a verified repository link; other records may still omit links/media until they are supplied or verified.
- `thumbnail` and `imagePaths` are typed but have no generic media renderer yet.
- `information` is the only demonstration configuration currently rendered.
- The hub has only two generic greybox exhibits and one area.
- WebGL detection is basic; it is not a complete device quality benchmark.
- The 3D hub’s accessibility is foundational, not complete; use conventional pages for full content access.

## Intentionally deferred features

Final environment art, heavy GLB/KTX2 assets, third-person character systems, advanced graphics settings, full district streaming, database/CMS, authentication, multiplayer, final project exhibits, complete game demonstrations, final resume/GitHub integrations, deployment, and analytics are deferred by design.

## Next recommended tasks

1. Use Lyrune as the reference pattern to integrate the next verified project into the generic case-study and exhibit paths.
2. Add a generic verified-media renderer only when a project has suitable images/video and a clear loading strategy.
3. Define target hardware and art direction, then profile before importing a real asset set.
4. Add a richer exhibit presentation only when it can remain generic and data-configured.
5. Add a lazy second world area only when there is enough content to justify it.

## Dangerous areas

- **`interactive-portfolio-shell.tsx`:** a seemingly convenient static import here breaks the principal bundle guarantee.
- **`project-registry.ts`:** maintain ID/slug uniqueness and API contracts; it is the data seam for all presentation paths and a future CMS adapter.
- **`interaction-provider.tsx`:** target registration/focus state is a shared runtime contract. Changing events/detection without tracing `useInteractable`, `InteractionDetector`, and `InteractiveExperience` can silently break all exhibits.
- **`types/portfolio.ts`:** this is the domain vocabulary. A weak or untyped change propagates to content, conventional UI, and 3D configuration.
- **`PrototypeHub`:** do not turn it into the permanent full world; retain area-level boundaries.

## Validation commands

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Then manually test the sequence stated in **Project status**, plus browse every conventional route without ever launching the 3D hub.
