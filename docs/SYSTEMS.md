# Implemented Systems

## Conventional portfolio routes

- **Purpose:** provide the dependable portfolio experience without WebGL.
- **Responsibilities:** navigation, home/about/project pages, case-study rendering, metadata, and 404 behavior.
- **Dependencies:** Next.js App Router, layout/UI components, project registry.
- **Public interfaces:** routes `/`, `/about`, `/projects`, `/projects/[slug]`.
- **Data flow:** registry queries → server components → semantic HTML.
- **Extension:** add route-specific presentation in `src/app` or a feature component; leave project records independent.

## Project registry

- **Purpose:** be the single query layer over local project records.
- **Responsibilities:** uniquely index records and provide all/by-category/by-priority/by-ID/by-slug/featured/exhibitable/related queries.
- **Dependencies:** `data/projects`, `types/portfolio`.
- **Public interfaces:** `getAllProjects`, `getFeaturedProjects`, `getProjectsByCategory`, `getProjectsByPriority`, `getProjectById`, `getProjectBySlug`, `getProjectsWithExhibits`, `getRelatedProjects`.
- **Data flow:** registered records → duplicate guard + maps → readonly queries.
- **Extension:** preserve these function contracts when replacing local records with a CMS/API adapter.

## Profile content

- **Purpose:** single source of truth for the owner's identity and directions.
- **Responsibilities:** name, title, intro paragraphs, career directions, verified links.
- **Dependencies:** `types/portfolio` only (plain serializable data).
- **Public interface:** `profile` from `src/data/profile.ts`.
- **Data flow:** imported directly by home, about, and footer.
- **Extension:** add verified links (LinkedIn/resume) here; never duplicate bio text in pages.

## Evidence-based skills

- **Purpose:** turn skills into evidence instead of claims.
- **Responsibilities:** typed skill entries with qualitative proficiency labels, related project IDs, and evidence sentences; category grouping.
- **Dependencies:** `types/portfolio`, project IDs.
- **Public interfaces:** `profileSkills`, `getSkillsForProject`, `getSkillsByCategory`.
- **Data flow:** skills registry → `/skills` page sections; reverse lookup → project detail "Skills this project demonstrates".
- **Extension:** add a skill by editing `src/data/skills.ts` and `docs/SKILL_EVIDENCE.md`; verify the project link against the inventory first.

## Project index filter

- **Purpose:** let visitors group the catalog without a heavy interface.
- **Responsibilities:** client-side category grouping with an accessible button bar.
- **Dependencies:** project registry, project cards.
- **Public interface:** `ProjectFilter`.
- **Data flow:** all projects → active group → filtered cards.
- **Extension:** extend `filterGroups` when categories change; keep the number of groups small.

## Project case-study template

- **Purpose:** render the first long-form project integration without making the route or components project-specific.
- **Responsibilities:** present the project hero, overview, optional problem/solution narrative, verified feature cards, stack/skills, architecture flow, optional engineering decisions, links, and optional interactive-hub CTA.
- **Dependencies:** plain `PortfolioProject` data, the shared `Tag` primitive, and Next Link.
- **Public interface:** `ProjectDetails` composes focused `project-detail-*` components in `src/features/portfolio/components`.
- **Data flow:** `PortfolioProject` / optional `ProjectCaseStudy` → server-rendered sections → semantic conventional case study.
- **Extension:** add truthful content to `caseStudy` in a project record; do not add a project-named route component. Records without case-study data retain a useful concise detail page.

## Opt-in 3D launcher

- **Purpose:** keep the traditional portfolio and `/interactive` entry lightweight.
- **Responsibilities:** WebGL capability check, error state, event-triggered dynamic import, and conventional fallback link.
- **Dependencies:** React and Next Link; no runtime 3D imports.
- **Public interface:** `InteractivePortfolioShell`.
- **Data flow:** button click → capability check → dynamic import → mounted `InteractiveExperience`.
- **Extension:** add an optional quality selector or pre-launch diagnostics here only if profiling justifies it.

## Canvas and world

- **Purpose:** configure and render the interactive world from the lazy chunk.
- **Responsibilities:** Canvas DPR/renderer defaults, Suspense boundary, the world composition seam, and area-level composition.
- **Dependencies:** React Three Fiber, Drei Grid, performance configuration.
- **Public interfaces:** `PortfolioCanvas`, `WorldAreas`, `AtlasHub`, `HUB_BOUNDS`.
- **Data flow:** Canvas → `WorldAreas` seam → mounted area (environment → architecture → navigation → exhibits → controller → detector).
- **Extension:** add a new area as an independently mountable module under `src/three/world/areas/<area>/`; mount or dynamically import it from `WorldAreas`. Never append areas to an existing area module.

## Environment language

- **Purpose:** give every area a shared visual and structural vocabulary.
- **Responsibilities:** the shared material palette, reusable architectural modules (walls, columns, ribs), emissive lighting fixtures, and the global atmosphere (background, fog, hemisphere, single shadow-casting sun, ground, grid).
- **Dependencies:** Three.js materials; no project data.
- **Public interfaces:** `getEnvironmentMaterials`, `environmentSemanticColors`, `WallSegment`, `Column`, `FrameRib`, `CeilingPanelLight`, `LightRibbon`, `WorldEnvironment`.
- **Data flow:** areas compose these modules; the palette is created once and reused.
- **Extension:** add a genuinely new surface type to the palette with a documented reason; do not create one-off materials for trivial variation.

## Atlas Hub (reference area)

- **Purpose:** the first polished environment slice; the reference for how any area is built and for the visual direction.
- **Responsibilities:** a bounded exhibition hall (walls, light gantry, entrance, status wall), floor wayfinding (spine, threshold, chevrons), area lighting within budget, and mounting the data-driven exhibits for its area.
- **Dependencies:** environment language, exhibit registry, explorer controller, interaction detector.
- **Public interfaces:** `AtlasHub`, `HUB_BOUNDS`.
- **Data flow:** area mounts → `ExhibitRegistry area="atlas-hub"` resolves exhibit configurations from project data.
- **Extension:** do not grow it into the whole world; new districts are new area modules following its pattern (see `docs/VISUAL_DIRECTION.md` for identity rules).

## Explorer controller

- **Purpose:** prove minimal first-person exploration.
- **Responsibilities:** drag-to-look camera control and bounded WASD/arrow movement.
- **Dependencies:** R3F camera lifecycle and Three.js vector math.
- **Public interface:** `ExplorerController`.
- **Data flow:** browser key/pointer events → per-frame camera translation and camera rotation.
- **Extension:** replace or supplement it with a third-person, guided, or cinematic controller behind a common camera-mode contract. Do not embed interaction actions inside it.

## Interaction framework

- **Purpose:** share focus, prompts, and activation across exhibits and future world objects.
- **Responsibilities:** target registration, nearest in-range detection, focus state, keyboard activation, click activation, and HUD display.
- **Dependencies:** React context and R3F frame loop.
- **Public interfaces:** `InteractableDefinition`, `InteractionEvent`, `InteractionProvider`, `useInteractable`, `useInteraction`.
- **Data flow:** object definition → provider map → detector chooses focus → HUD informs visitor → event dispatches to experience root.
- **Extension:** add an event variant or substitute detection strategy; do not write unique `keydown` logic in each object.

## Exhibit framework

- **Purpose:** turn project exhibit configuration into generic scene objects.
- **Responsibilities:** resolve records that have an exhibit for an area, render a reusable display and readable project label, and register its interaction event.
- **Dependencies:** registry, portfolio exhibit types, interaction hook.
- **Public interfaces:** `ExhibitRegistry`, `ProjectExhibit`.
- **Data flow:** project record `exhibit` → registry filtering → generic props → interaction event with `projectId`.
- **Extension:** add a presentation component for a new `ExhibitPresentation`; project records should only select/configure it.

## Project information panel

- **Purpose:** display selected project content from a scene interaction.
- **Responsibilities:** semantic dialog, Escape/close behavior, summary, technologies, architecture layers, verified project links, and conventional case-study link.
- **Dependencies:** plain `PortfolioProject`, `Tag`, Next Link.
- **Public interface:** `ProjectInformationPanel`.
- **Data flow:** `open-project` event → selected ID in `InteractiveExperience` → registry lookup → panel props.
- **Extension:** split screenshot/video/demo renderers by demonstration kind before the panel becomes a large multipurpose modal.

## Performance configuration

- **Purpose:** hold conservative renderer defaults in one inspectable place.
- **Responsibilities:** capped DPR and baseline WebGL options.
- **Dependencies:** browser window only at runtime.
- **Public interfaces:** `BASELINE_RENDERER_OPTIONS`, `getSafeDevicePixelRatio`.
- **Extension:** use measured device tiers and telemetry before adding adaptive graphics behavior.
