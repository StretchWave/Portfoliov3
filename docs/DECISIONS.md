# Architectural Decision Log

## ADR-001 — Progressive enhancement is mandatory

- **Decision:** The conventional Next.js portfolio is complete enough to browse without the 3D hub.
- **Reason:** Recruiters, slow connections, unsupported devices, and assistive workflows must retain access to project information.
- **Alternatives considered:** Make the 3D hub the home page; render a Three.js teaser on every page.
- **Consequences:** Some information appears in both conventional and overlay presentation, but the 3D experience cannot become a single point of failure.
- **Reconsider when:** Never for access to core content; only refine how the two experiences cross-link.

## ADR-002 — Import 3D only after explicit visitor action

- **Decision:** `InteractivePortfolioShell` dynamically imports the full experience from its launch button.
- **Reason:** Route-level loading alone can still fetch heavy interactive code when a visitor merely opens `/interactive`.
- **Alternatives considered:** Static import, `next/dynamic` mounted on initial route render, a 3D home-page hero.
- **Consequences:** The first click has a loading state; conventional pages and the entry screen remain free of engine cost.
- **Reconsider when:** Measured product data shows intentional prefetch on hover/focus substantially improves conversion without harming budgets.

## ADR-003 — Local typed records precede a CMS/database

- **Decision:** Use version-controlled TypeScript records and a small registry.
- **Reason:** The bootstrap needs reviewable structure and type safety, not operational infrastructure.
- **Alternatives considered:** Headless CMS, database, JSON files consumed directly by components.
- **Consequences:** Content changes require a code change, but migrations have one contract boundary.
- **Reconsider when:** Non-developer editing, frequent content publishing, or remote media management becomes a real requirement.

## ADR-004 — Project data never lives in 3D components

- **Decision:** Exhibits receive generic configuration and emit project IDs through interaction events.
- **Reason:** A project must be addable without touching world logic and one project may later have several presentations.
- **Alternatives considered:** Hardcode named project exhibit components; put descriptions in scene JSX.
- **Consequences:** A small indirection through the registry is intentional and should remain.
- **Reconsider when:** Never for data ownership; extend exhibit configuration rather than breaking this rule.

## ADR-005 — React Three Fiber is the scene composition model

- **Decision:** R3F owns the Canvas component tree; direct Three.js is limited to small math/renderer needs.
- **Reason:** It matches React component boundaries and makes independent world/exhibit modules natural.
- **Alternatives considered:** Imperative raw Three.js scene manager; a desktop/Unreal runtime.
- **Consequences:** 3D components remain React-aware, and browser bundle discipline is required.
- **Reconsider when:** A proven R3F limitation needs a contained direct Three.js integration, not a wholesale rewrite.

## ADR-006 — Proximity detection is the prototype interaction strategy

- **Decision:** The camera focuses the nearest registered in-range target; `E` activates it.
- **Reason:** It is reliable with minimal drag-to-look exploration and proves the reusable interaction pipeline.
- **Alternatives considered:** Center-screen raycast, mesh click only, per-object bespoke actions.
- **Consequences:** Line-of-sight is not yet considered; targets must have sensible ranges and placement.
- **Reconsider when:** Occlusion, precise selection, or dense exhibits make raycast/hybrid focus necessary.

## ADR-007 — No global client-state library

- **Decision:** Keep selected-project state local and interaction state inside a focused context.
- **Reason:** The current 3D experience has one mounted composition root and little shared mutable state.
- **Alternatives considered:** Zustand, Redux, a global context for all portfolio data.
- **Consequences:** State has short, easy-to-reason-about lifetimes.
- **Reconsider when:** Multiple independently mounted districts or cross-route persistent interactive state create demonstrated coordination problems.

## ADR-008 — Greybox before art pipeline

- **Decision:** Use primitive geometry and lighting now, while documenting GLB/KTX2 conventions for later.
- **Reason:** Architecture, access, and performance boundaries can be proven without expensive assets.
- **Alternatives considered:** Import final environment assets immediately; design asset streaming first.
- **Consequences:** The visual experience is intentionally prototype-level.
- **Reconsider when:** Art direction, target hardware, and measurable budgets are available.

## ADR-009 — Case-study depth belongs in typed project content

- **Decision:** Add an optional `ProjectCaseStudy` block to `PortfolioProject` and render it through generic server components.
- **Reason:** Lyrune needs verified problem/solution, feature, and engineering-decision context, but named route components would make the first integration an architectural exception.
- **Alternatives considered:** Add Lyrune copy directly to `src/app/projects/[slug]/page.tsx`; store arbitrary rich text/MDX inside each record; leave every project page at the summary-only template.
- **Consequences:** Content remains type-checked and co-located with the project record. The detail template has small focused components, while projects without case-study data remain supported.
- **Reconsider when:** Several projects need substantially different structured media or writing patterns that cannot be expressed through the current small content block.

## ADR-010 — Exhibit identity is derived from generic props

- **Decision:** The generic exhibit renders a readable label from `projectName` and its configured presentation type.
- **Reason:** Lyrune needs to be identifiable in the current hub, but a named Lyrune mesh or conditional inside the exhibit component would violate data-driven ownership.
- **Alternatives considered:** No visual label; hardcode project labels in world JSX; add a new Lyrune-only exhibit system.
- **Consequences:** Every configured project gains the same identification affordance without new project-specific scene logic. The label is low-cost DOM overlay content inside the already lazy 3D chunk.
- **Reconsider when:** A distinct exhibit style needs structured visual configuration beyond name and presentation type.
