# Portfolio Project Data Model

## Source of truth

`src/types/portfolio.ts` defines framework-independent TypeScript contracts. Individual records live in `src/data/projects`, and `src/data/projects/index.ts` is the sole registration point. Every record uses `as const satisfies PortfolioProject`, which preserves literal type checking without widening data unnecessarily.

## `PortfolioProject`

| Field | Meaning |
| --- | --- |
| `id`, `slug`, `name` | Stable identity, URL identity, and display name |
| `category`, `secondaryCategories` | Primary category plus optional verified secondary context |
| `status`, `priority`, `featured` | Lifecycle, visual importance, and home-page presence |
| `summary`, `description` | Short and extended narrative |
| `technologies`, `skills` | Display-ready technical vocabulary |
| `architecture` | Optional overview plus ordered system layers |
| `caseStudy` | Optional problem, solution, feature, and engineering-decision content for the generic detail template |
| `thumbnail`, `imagePaths`, `links` | Optional conventional media/links |
| `relatedProjectIds` | Verified relationships only; the detail page renders them automatically |
| `demonstration` | A discriminated future-demo strategy |
| `exhibit` | Optional 3D placement and appearance configuration |

Allowed categories: `software-engineering`, `data-and-intelligence`, `game-development`, `interactive-systems`, `experimental`, `mobile-development`, `developer-tools`, `web-development`, `desktop-application`, `automation`. Statuses: `active`, `in-progress`, `prototype`, `completed`, `concept`, `archived`. Priorities: `flagship`, `featured`, `supporting`, `experiment`, `archived` — flagships and featured projects carry the portfolio; `featured: true` controls the home page.

The full verified catalog, including which repositories were deliberately excluded, lives in `docs/PORTFOLIO_INVENTORY.md`.

`DemonstrationConfiguration` intentionally models information, external links, video, interactive scenes, and dedicated experiences, but only the information strategy is rendered today. `ExhibitConfiguration` models an area ID, presentation kind, position, accent, and optional interaction range. The only first-class area today is `atlas-hub` (the reference environment); new areas add their stable ID to the `area` union and to `WorldAreas` before exhibits can reference them.

`ProjectCaseStudy` is deliberately small: `problem`, `solution`, a list of titled `features`, and optional titled `engineeringDecisions`. It supplies content only; the layout is always the generic `ProjectDetails` composition. Lyrune is the reference record for a fully populated case study.

`thumbnail` and `imagePaths` are typed extension points but no generic media renderer has been implemented yet. Do not register media until it is verified and a focused renderer is needed; do not make a project detail page depend on remote repository media.

## Registry API

```ts
getAllProjects(): readonly PortfolioProject[]
getFeaturedProjects(): readonly PortfolioProject[]
getProjectsByCategory(category): readonly PortfolioProject[]
getProjectById(id): PortfolioProject | undefined
getProjectBySlug(slug): PortfolioProject | undefined
getProjectsWithExhibits(area?): readonly PortfolioProject[]
```

The registry creates `Map` indexes and throws on duplicate IDs or slugs when the module is loaded. It returns readonly views so consumers do not treat data as mutable state.

## Add a project

1. Verify the repository facts first (`docs/PORTFOLIO_INVENTORY.md`).
2. Copy an existing record in `src/data/projects` and name it for the project, e.g. `my-project.ts`.
3. Fill all required fields honestly (including `priority` and `status`); omit optional URLs/media that do not exist.
4. Use `as const satisfies PortfolioProject`.
5. Export and add the record to `src/data/projects/index.ts` (display order: flagships first).
6. Run `npm run typecheck`; this catches invalid categories, statuses, priorities, demonstration configuration, and exhibit fields.
7. Add an `exhibit` only if the project belongs in a mounted world area. The conventional website automatically sees every registered record.
8. Add `caseStudy` only when its problem, solution, feature descriptions, and decisions can be supported by project evidence. The generic page automatically renders it.
9. If the project demonstrates a skill, link it in `src/data/skills.ts` and update `docs/SKILL_EVIDENCE.md`.

## Relationships

```text
PortfolioProject.exhibit.project-independent configuration
  -> ExhibitRegistry filters by area
  -> ProjectExhibit receives projectId/name/configuration
  -> InteractionEvent { kind: 'open-project', projectId }
  -> Information panel resolves project via registry
```

The exhibit holds no project description or technology list. That data remains in the project record and is resolved only at presentation time.

`relatedProjectIds` is the only relationship mechanism, and it must stay
verified: no record currently sets it because the public repositories show
no documented cross-project relationships. Derived-work attribution (Sonara →
Harmony Music, Lucida-Sync → lucida-flow) lives in the record descriptions
instead.

## Profile and skills model

- `PortfolioProfile` (`src/data/profile.ts`): derived directly from `defaultAppContent.identity`, `about`, `careerDirections`, and `social`. Pages import it directly; no per-page copies.
- `ProfileSkill` (`src/data/skills.ts`): id, name, category (a `SkillCategory`
  union), qualitative `proficiencyLabel`, `relatedProjectIds`, `evidence`, and
  `displayPriority`. Skills must reference registered project IDs and must be
  supported by the repository evidence (see `docs/SKILL_EVIDENCE.md`).
- Reverse lookups: `getSkillsForProject(projectId)` (detail pages) and
  `getSkillsByCategory()` (skills page).

## App Content Model

`src/types/content.ts` and `src/data/app-content.ts` define the single canonical source of truth for site-wide narrative copy:
- `identity`: `siteName`, `author`, `title`, `description`
- `hero`: `eyebrow`, `headline`, `shortDescription`, `primaryAction`, `secondaryAction`
- `about`: `title`, `paragraphs: string[]`
- `careerDirections`: array of `{ id, title, description, focusAreas, icon }`
- `interactiveExperience`: `title`, `description`, `launchLabel`, `supportingText`
- `seo`: `title`, `description`, `ogDescription`, `keywords`
- `social`: `github`, `linkedin`, `email`, `resume`

`src/lib/site-config.ts` and `src/data/profile.ts` consume `defaultAppContent` directly.

## Spatial & Collision Data Models

`src/types/scene.ts` defines the canonical spatial hierarchy:
- `WorldManifest` (`src/data/scenes/manifest.ts`):
  - `defaultAreaId: string`
  - `areas: WorldAreaManifestEntry[]` (each with `id`, `name`, `defaultRoomId`, `rooms: RoomManifestEntry[]`)
- `AreaSceneDefinition`:
  - `id: string`, `version: number`, `metadata: AreaMetadata`, `bounds: AreaBounds`, `spawnPoint: Vec3`, `objects: SceneObject[]`
  - Optional `rooms?: RoomDefinition[]` and `defaultRoomId?: string`
- `RoomDefinition`:
  - `id: string`, `name: string`, `description?: string`
  - `bounds: AreaBounds`
  - `spawnPoints: SpawnPoint[]`, `defaultSpawnPointId: string`
  - `objects: SceneObject[]`
  - `environment?: Partial<EnvironmentConfig>`
- `ColliderDefinition`:
  - `id: string`, `enabled: boolean`, `type: "box" | "sphere" | "capsule" | "cylinder"`
  - `center?: Vec3`, `size?: Vec3`, `radius?: number`, `height?: number`, `rotation?: Vec3`
  - `isTrigger?: boolean`
  - Objects attach zero or more colliders via `colliders?: ColliderDefinition[]`.

## Future CMS/API migration

Keep the `PortfolioProject` contract and registry methods. Replace `registeredProjects` with an adapter that normalizes CMS/API responses to the same serializable shape. Do not expose remote provider records directly to components or world code.

