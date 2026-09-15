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

## ADR-011 — Visual direction is a technical exhibition hall, not a neon room

- **Decision:** The interactive world uses a restrained "technical exhibition hall" language: orthogonal architecture, a shared material palette, semantic colors (cyan = interactivity, amber = navigation), and an emissive-first lighting hierarchy.
- **Reason:** The portfolio belongs to a software/game developer; the space should read as an engineered display of systems, and the conventional site's palette should carry over. "Dark room + blue neon" would be generic and would not communicate the owner's discipline.
- **Alternatives considered:** A literal game-like world; a photorealistic showroom; a neon abstract space.
- **Consequences:** Future areas must follow the documented language (`docs/VISUAL_DIRECTION.md`); deviations require justification. The environment stays stylized, cheap to render, and coherent with the website.
- **Reconsider when:** The owner wants a fundamentally different brand; per-area identity changes are expected but must stay within the shared universe.

## ADR-012 — Shared material palette over per-mesh materials

- **Decision:** Structural surfaces come from one lazy-instantiated material set (`environment-materials.ts`); only project accents and genuinely distinct surfaces create new materials.
- **Reason:** The greybox allocated materials per mesh, which duplicates GPU state and makes areas diverge visually. One palette keeps future areas visually unified and cheaper to render.
- **Alternatives considered:** Per-mesh material literals everywhere; a material registry with dynamic lookup per object.
- **Consequences:** A small indirection (`getEnvironmentMaterials`) is required; area code must not mutate shared materials.
- **Reconsider when:** Profiling shows material count is not a factor and per-object tuning is genuinely needed.

## ADR-013 — Emissive-first lighting with a single shadow light

- **Decision:** Lighting hierarchy is: one hemisphere + one shadow-casting directional globally; emissive fixtures (panels, rails, spines) for area lighting; a small number of bounded point lights; one accent point light per exhibit. The hub totals ~6 lights.
- **Reason:** The greybox's arbitrary point lights and single shadow map can scale badly; emissive surfaces deliver the "lit" look at zero light cost while keeping shadows and dynamic lights bounded and auditable.
- **Alternatives considered:** Many point lights per area; multiple shadow-casting lights; baked lightmaps.
- **Consequences:** Areas have a hard-ish light budget to respect; lights use physical decay with finite distances.
- **Reconsider when:** A measured need (e.g. a specific exhibit look) justifies an extra light or a second shadow map with documented cost.

## ADR-014 — World areas are independent modules behind a composition seam

- **Decision:** The world is split into `world/environment` (shared language) and `world/areas/<area>` (independently mountable areas), composed through `WorldAreas`. Areas own their bounds, architecture, navigation, and area ID; future areas load via dynamic import when the second area exists.
- **Reason:** The prototype hub risked becoming a monolithic world file; the mission requires areas to be independently developed, mounted, and (eventually) unloaded. A named seam makes that the default path instead of an afterthought.
- **Alternatives considered:** Keep one growing world component; introduce a streaming engine now.
- **Consequences:** Area IDs are stable data contracts (`atlas-hub` today). Adding a district is a contained, documented process (`docs/DEVELOPMENT_GUIDE.md`).
- **Reconsider when:** Never for mounting; only the loading strategy (eager vs dynamic import) should change as content grows.

## ADR-015 — The reference area ID is `atlas-hub`

- **Decision:** The area previously registered as `prototype-hub` is renamed to `atlas-hub` (records, type union, docs) as the hub transitions from greybox to reference environment.
- **Reason:** The ID is a stable data contract referenced by exhibit configurations; renaming now, while the world has only one area, is far cheaper than later. "Prototype" also misdescribes what is now the quality benchmark.
- **Alternatives considered:** Keep `prototype-hub` for stability; introduce an alias.
- **Consequences:** Any future content or code that references the old ID must be updated; the registry catches no duplicate aliases, so the rename is a one-time sweep.
- **Reconsider when:** Never; future areas get their own stable IDs (e.g. `software-district`).

## ADR-016 — Evidence-based portfolio content is mandatory

- **Decision:** Every project record, skill relationship, and link in the
  portfolio must be verifiable from the owner's public repositories or
  supplied material; unsupported claims are omitted or labeled.
- **Reason:** The phase goal is a truthful, defensible portfolio. Repositories
  like REPP, motiv8, and Motor-Track-App-Release turned out to be empty or
  scaffolds; including them as projects would fabricate substance. Derived
  work (Sonara, Lucida-Sync) must be attributed rather than presented as
  original.
- **Alternatives considered:** Include every repository with equal weight;
  infer project purposes from names.
- **Consequences:** The portfolio is smaller but defensible. The inventory
  (`docs/PORTFOLIO_INVENTORY.md`) records what was verified and what was
  excluded and why.
- **Reconsider when:** The owner supplies verified facts (deployments, users,
  media) that upgrade an entry.

## ADR-017 — Priority and status vocabulary is part of the data model

- **Decision:** Projects carry `priority` (flagship/featured/supporting/
  experiment/archived) and an extended `status` vocabulary (active,
  in-progress, prototype, completed, concept, archived).
- **Reason:** A five-line experiment must not visually weigh the same as a
  substantial system. Enforcing the vocabulary in the type makes hierarchy a
  data property, not a styling afterthought.
- **Alternatives considered:** Visual-only emphasis; free-text labels.
- **Consequences:** Cards, heroes, and the projects page derive hierarchy from
  the model; `featured` controls home-page presence separately.
- **Reconsider when:** Content grows enough to need a more granular model.

## ADR-018 — Skills are evidence-linked, not percentage-rated

- **Decision:** Skills live in `src/data/skills.ts` as typed entries with
  qualitative proficiency labels, related project IDs, and evidence
  sentences. No numeric percentages.
- **Reason:** Percentage ratings without owner-supplied calibration are
  fiction. Linking each skill to the project that proves it turns the skills
  page into evidence, and skills without public evidence are labeled
  honestly (learning/familiarity/interest).
- **Alternatives considered:** A logo wall; self-rated bars.
- **Consequences:** Adding a skill requires updating its evidence; the detail
  pages get a reverse "skills this project demonstrates" section.
- **Reconsider when:** The owner supplies calibrated self-ratings.

## ADR-019 — Profile content has a single source of truth

- **Decision:** One `PortfolioProfile` object (`src/data/profile.ts`) owns
  identity, career directions, and verified links; pages and the footer
  import it.
- **Reason:** Duplicated biography text across pages drifts. A single typed
  object keeps the persona coherent and makes future CMS migration trivial.
- **Alternatives considered:** Per-page copy; a CMS now.
- **Consequences:** Adding links (LinkedIn/resume) is a one-line change.
- **Reconsider when:** A CMS replaces local content — the profile contract
  becomes the adapter boundary.
