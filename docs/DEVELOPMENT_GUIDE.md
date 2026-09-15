# Development Guide

## Prerequisites

Use a current Node.js LTS-compatible runtime. This repository was bootstrapped and validated with Node `24.13.0` and npm `11.6.2`.

```bash
npm install
npm run dev
```

The dev server serves the portfolio at `http://localhost:3000`. Before handing work over or merging a change:

```bash
npm run typecheck
npm run build
```

`typecheck` is the explicit TypeScript validation. `build` is the production Next.js validation and must also pass.

## Add a portfolio project

1. Verify the repository facts first (`docs/PORTFOLIO_INVENTORY.md`).
2. Create `src/data/projects/<slug>.ts` from an existing record, with a truthful `status` and `priority`.
3. Export a constant that `satisfies PortfolioProject`.
4. Register it in `src/data/projects/index.ts` (flagships first).
5. Run typecheck and open `/projects/<slug>`.
6. If it should appear in the Atlas Hub, add an `exhibit` whose `area` is `atlas-hub`; otherwise leave it absent.
7. If it demonstrates a skill, link it in `src/data/skills.ts` and note it in `docs/SKILL_EVIDENCE.md`.

Never add a project by editing `ProjectExhibit`, `AtlasHub`, a case-study component, or the interaction provider. Those changes make a data record leak into unrelated architecture.

## Add profile or skill content

1. Profile: edit `src/data/profile.ts` (name, title, intros, directions, links). The home page, about page, and footer read it directly — never duplicate the text in pages.
2. Skills: edit `src/data/skills.ts`. Every entry needs a category, a qualitative proficiency label, `relatedProjectIds` (registered project IDs), and an evidence sentence. The `/skills` page and the project detail sections render automatically.
3. Verify evidence against `docs/PORTFOLIO_INVENTORY.md` before claiming a project demonstrates a skill.

## Add a category or status or priority

1. Add the string to `projectCategories` / `projectStatuses` / `projectPriorities` in `src/types/portfolio.ts`.
2. Update display naming (`project-card.tsx`, `project-filter.tsx`, detail hero) when it exists.
3. Add documentation and representative data only if the value is a durable portfolio concept.

The unions intentionally catch stale or misspelled data at compile time.

## Add a category

1. Add the string to `projectCategories` in `src/types/portfolio.ts`.
2. Update any display naming/filter UI when it exists.
3. Add documentation and representative data only if the category is a durable portfolio concept.

The category union intentionally catches stale or misspelled data at compile time.

## Add an exhibit presentation

1. Add a presentation literal to `ExhibitPresentation` in `src/types/portfolio.ts`.
2. Create a focused component in `src/three/exhibits`, receiving generic props/configuration rather than importing a named project.
3. Route that presentation in `ProjectExhibit` or split `ProjectExhibit` into a small selection component once there are multiple materially different visual types.
4. Configure it from project data and validate it from the interactive route.

## Add an interaction type

1. Extend the `InteractionEvent` discriminated union in `src/three/interaction/interaction-types.ts`.
2. Teach `InteractiveExperience` (or a focused domain handler it owns) to resolve the new event.
3. Register the event through an `InteractableDefinition` using `useInteractable`.
4. Keep detection and keyboard activation in the shared interaction system; do not add event listeners to individual meshes.

If the new object needs a different detection strategy, preserve the provider/event contract and replace or add a detector. For example, a raycast detector could determine focus without requiring every exhibit to change.

## Add a demonstration type

1. Extend `DemonstrationConfiguration` in the domain model.
2. Build a dedicated renderer/component for that kind.
3. Select the renderer at a narrow presentation boundary—likely a future `ProjectDemonstration` component used by the information panel.
4. Avoid turning `ProjectInformationPanel` into a giant switch that owns video players, external navigation, scene loading, and every future interaction.

## Add a world area

1. Create a mountable module under `src/three/world/areas/<area-id>/<area-id>.tsx` following the Atlas Hub pattern (`atlas-hub.tsx`): compose `WorldEnvironment` + area architecture + area navigation + `ExhibitRegistry area="<area-id>"` + `ExplorerController bounds={...}` + `InteractionDetector`.
2. Define the area's walkable `bounds` and export them; use the shared environment language (materials, modules, fixtures) for structure.
3. Give it its own loading boundary: mount or dynamically import it from `WorldAreas` (`src/three/world/world-areas.tsx`). When a second area exists, convert `WorldAreas` into a router that dynamically imports only the active area.
4. Add data exhibit configurations using the new stable area ID (extend the `area` union in `src/types/portfolio.ts` when the ID is a first-class area).
5. Define the area's visual identity per `docs/VISUAL_DIRECTION.md` (one architectural idea, semantic colors preserved) and document it.
6. Profile the new area in isolation and with its transition path before expanding it further.

Do not append districts to `AtlasHub` or any existing area; that defeats the intended scene-loading boundary. Areas must stay independently mountable and (eventually) independently unloadable.

## Styling and accessibility

Conventional pages use semantic landmarks, heading order, native links/buttons, keyboard focus styles, and readable no-WebGL content. Keep those characteristics when adding pages.

The 3D hub presently has an optional launch, visible keyboard/drag instructions, click activation, proximity prompts, and an Escape-closeable panel. Future work should add a non-spatial equivalent for every important exhibit action, richer keyboard alternatives, reduced-motion consideration, and explicit screen-reader messaging for major state changes.
