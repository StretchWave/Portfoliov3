# Project Atlas — Architecture Plan

**Status:** implemented as the foundation described here. This document is the pre-build plan retained for historical context; see `docs/ARCHITECTURE.md` for the current architecture.

## Intent

Atlas is a progressive-enhancement portfolio: server-rendered portfolio content is useful by itself, while a visitor may opt into a browser-native 3D hub. The initial vertical slice proves the full path from project data to a world exhibit and its information UI without pretending to be a finished world.

## Proposed application shape

```text
App Router pages (server-first)
  ├─ Home / about / projects / project detail
  └─ /interactive
       └─ client launch shell
            └─ user-triggered dynamic import
                 └─ 3D experience chunk
                      ├─ Canvas + render configuration
                      ├─ Hub world
                      ├─ explorer controller
                      ├─ interaction provider + detector
                      ├─ data-driven exhibits
                      └─ information panel

Version-controlled typed project records
  └─ registry query functions
       ├─ conventional web presentation
       └─ exhibit configuration consumed by the 3D chunk
```

## Major systems and boundaries

| System | Responsibility | Does not own |
| --- | --- | --- |
| `src/data/projects` | Individual, declarative project records | UI and scene code |
| `src/features/portfolio` | Registry queries and conventional project presentation | World state |
| `src/three/world` | Static prototype environment | Project-specific content |
| `src/three/player` | Keyboard movement and drag-to-look camera | Interaction semantics |
| `src/three/interaction` | Generic target registration, proximity focus, and activation | Project UI |
| `src/three/exhibits` | Render a project record as a generic exhibit | Per-project business logic |
| `src/three/experience` | Compose the opt-in 3D vertical slice | Reusable scene primitives |

## Data flow

1. Project records validate against `PortfolioProject` with `satisfies`.
2. The registry provides stable query methods for all consumers.
3. Projects with an `exhibit` configuration produce generic `ProjectExhibit` instances.
4. Each exhibit registers an interaction event, not a direct UI callback.
5. The interaction provider detects the nearest target in range and dispatches its event.
6. The experience resolves an `open-project` event and gives the selected project to the information panel.

## Dependency decisions

- Next.js App Router is the application shell and stays server-first.
- React Three Fiber is the component model for the 3D tree; Drei is used only for the prototype grid helper.
- No global state library: interaction state is local to the interactive experience and provided through a narrowly scoped React context.
- No database/CMS during the foundation; a registry adapter boundary allows one later.

## Scene architecture

The initial scene is a small greybox hub: architectural primitives and lighting are in `world`; player movement is in `player`; exhibit instances come solely from data. New districts should be independently mountable scene modules, behind `Suspense` and a dynamic import, rather than additions to a monolithic world component.

## Performance strategy

- Do not import 3D modules from normal portfolio routes.
- The interactive page imports the 3D experience only after the visitor presses **Launch 3D hub**.
- The prototype uses primitives, modest DPR, limited shadows, and no external 3D assets.
- Future GLB/KTX2 assets are added behind per-area loading boundaries, only after a measurable need.

## Technical risks and mitigations

| Risk | Mitigation in this foundation |
| --- | --- |
| WebGL unavailable | Capability check and useful conventional fallback on `/interactive` |
| Growing world increases first load | Explicit district/module boundaries and documented asset conventions |
| Project data leaks into scene logic | Exhibit rendering is generic and uses only configured project records |
| Controller complexity grows | Keep camera/controller behind a dedicated component and interaction independent |
| Unclear AI continuation | Documentation, decision log, and handoff map actual files and extension paths |

## Implementation order

1. Establish project configuration and documentation skeleton.
2. Create typed data model, sample records, and registry queries.
3. Implement conventional accessible portfolio pages.
4. Add opt-in interactive route and capability fallback.
5. Implement the greybox hub, explorer, interaction abstraction, and generic exhibits.
6. Add project panel and close/continue-exploring flow.
7. Typecheck, build, manually verify, then complete the handoff documentation.
