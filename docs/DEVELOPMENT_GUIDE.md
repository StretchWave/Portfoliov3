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

1. Create `src/data/projects/<slug>.ts` from an existing record.
2. Export a constant that `satisfies PortfolioProject`.
3. Register it in `src/data/projects/index.ts`.
4. Run typecheck and open `/projects/<slug>`.
5. If it should appear in the prototype hub, add an `exhibit` whose `area` is `prototype-hub`; otherwise leave it absent.

Never add a project by editing `ProjectExhibit`, `PrototypeHub`, a case-study component, or the interaction provider. Those changes make a data record leak into unrelated architecture.

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

1. Create a mountable module such as `src/three/world/intelligent-systems-district.tsx`.
2. Give it its own environment, exhibit registry area, and loading boundary.
3. Dynamically import it from a small world-area router when there is a real navigation/loading need.
4. Add data exhibit configurations using the new stable area ID.
5. Profile the new district in isolation and with its transition path before expanding it further.

Do not append all districts to `PrototypeHub`; that defeats the intended scene-loading boundary.

## Styling and accessibility

Conventional pages use semantic landmarks, heading order, native links/buttons, keyboard focus styles, and readable no-WebGL content. Keep those characteristics when adding pages.

The 3D hub presently has an optional launch, visible keyboard/drag instructions, click activation, proximity prompts, and an Escape-closeable panel. Future work should add a non-spatial equivalent for every important exhibit action, richer keyboard alternatives, reduced-motion consideration, and explicit screen-reader messaging for major state changes.
