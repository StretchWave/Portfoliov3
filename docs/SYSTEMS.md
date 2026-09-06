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
- **Responsibilities:** uniquely index records and provide all/by-category/by-ID/by-slug/featured/exhibitable queries.
- **Dependencies:** `data/projects`, `types/portfolio`.
- **Public interfaces:** `getAllProjects`, `getFeaturedProjects`, `getProjectsByCategory`, `getProjectById`, `getProjectBySlug`, `getProjectsWithExhibits`.
- **Data flow:** registered records → duplicate guard + maps → readonly queries.
- **Extension:** preserve these function contracts when replacing local records with a CMS/API adapter.

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

- **Purpose:** configure and render a small, readable 3D hub.
- **Responsibilities:** Canvas DPR/renderer defaults, Suspense boundary, greybox environment, hub architecture, and an area-level composition component.
- **Dependencies:** React Three Fiber, Drei Grid, performance configuration.
- **Public interfaces:** `PortfolioCanvas`, `PrototypeHub`, `WorldEnvironment`, `HubArchitecture`.
- **Data flow:** Canvas → mounted area → environment/exhibits/controller/detector.
- **Extension:** create a separately importable district module rather than growing `PrototypeHub` indefinitely.

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
