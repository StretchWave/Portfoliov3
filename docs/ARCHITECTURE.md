# Architecture

This document describes the implemented architecture, not an aspirational replacement architecture.

## Application topology

```mermaid
flowchart TD
  A[Next.js App Router] --> B[Conventional server-rendered routes]
  A --> C[/interactive server route]
  B --> D[Portfolio registry]
  C --> E[Client launch shell]
  E -->|explicit button click| F[Dynamic 3D experience chunk]
  F --> G[Canvas]
  G --> H[Prototype hub]
  H --> I[Explorer controller]
  H --> J[Interaction detector]
  H --> K[Generic exhibit registry]
  D --> K
  J --> L[Interaction provider]
  K --> L
  L --> M[Project information panel]
  D --> M
```

## Next.js architecture

`src/app` follows the App Router. Conventional pages are Server Components by default and read local, synchronous project records through `features/portfolio/project-registry.ts`. The one client boundary for the entry page is `src/app/interactive/interactive-portfolio-shell.tsx`.

The shell does **not** statically import Three.js, React Three Fiber, or any `src/three` module. In its click handler it uses `import("@/three/experience/interactive-experience")`; that keeps the engine and world out of conventional page bundles and avoids loading them merely for visiting `/interactive`.

Route metadata remains in server `page.tsx` files. The dynamic project route awaits the Next.js 16 `params` promise and uses `notFound()` for an absent project.

## Project data flow

```text
src/data/projects/<record>.ts
  -> src/data/projects/index.ts (single registration point)
    -> project-registry query API
       -> conventional cards/details
       -> exhibit registry
          -> ProjectExhibit registration
             -> InteractionProvider event
                -> InteractiveExperience resolves project ID
                   -> ProjectInformationPanel
```

No 3D component imports a named project record. The one place that knows which records exist is `src/data/projects/index.ts`.

## 3D architecture

`InteractiveExperience` is the composition root for the lazy chunk. It owns only the selected project ID and translates generic `InteractionEvent` values into portfolio UI state. It composes:

- `PortfolioCanvas`: the Canvas configuration and future Suspense loading boundary.
- `PrototypeHub`: the first independently mountable world area.
- `WorldEnvironment` and `HubArchitecture`: reusable environmental/greybox primitives.
- `ExplorerController`: drag-to-look camera control and bounded keyboard movement.
- `InteractionProvider`, `InteractionDetector`, and `InteractionHud`: generic focus and activation infrastructure.
- `ExhibitRegistry` and `ProjectExhibit`: data-configured project displays.
- `ProjectInformationPanel`: overlay presentation of a selected project.

The scene currently uses proximity detection. `InteractionDetector` checks the camera against registered target positions each frame and picks the nearest in-range target. A future raycast or line-of-sight detector should call the provider’s `updateFocusFromPosition` equivalent rather than changing exhibit or panel code.

## State boundaries

No global state library is used. The conventional routes are data-driven server renders. The interactive experience has a narrowly scoped context for target registration/focus and a local selected-project ID. This is sufficient because no current state needs to survive outside the mounted experience.

## Future extension points

| Need | Existing extension point |
| --- | --- |
| New project | Typed record + registration entry |
| Rich conventional case study | Optional `ProjectCaseStudy` content block rendered by generic detail sections |
| New category/status | Union in `src/types/portfolio.ts` |
| New exhibit appearance | New component selected by `ExhibitPresentation` inside `src/three/exhibits` |
| New interaction behavior | New `InteractionEvent` variant and handler in the composition root |
| New demo type | `DemonstrationConfiguration` discriminated union |
| New world district | A mountable `three/world/<area>` module behind a loading boundary |
| CMS/API | An adapter preserving registry query contracts |

Do not collapse those boundaries merely to ship a project-specific feature; add the feature at the narrowest appropriate extension point.
