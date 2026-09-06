# Portfolio Project Data Model

## Source of truth

`src/types/portfolio.ts` defines framework-independent TypeScript contracts. Individual records live in `src/data/projects`, and `src/data/projects/index.ts` is the sole registration point. Every record uses `as const satisfies PortfolioProject`, which preserves literal type checking without widening data unnecessarily.

## `PortfolioProject`

| Field | Meaning |
| --- | --- |
| `id`, `slug`, `name` | Stable identity, URL identity, and display name |
| `category`, `status`, `featured` | Classification and conventional presentation controls |
| `summary`, `description` | Short and extended narrative |
| `technologies`, `skills` | Display-ready technical vocabulary |
| `architecture` | Optional overview plus ordered system layers |
| `caseStudy` | Optional problem, solution, feature, and engineering-decision content for the generic detail template |
| `thumbnail`, `imagePaths`, `links` | Optional conventional media/links |
| `demonstration` | A discriminated future-demo strategy |
| `exhibit` | Optional 3D placement and appearance configuration |

Allowed categories are currently `software-engineering`, `data-and-intelligence`, `game-development`, `interactive-systems`, and `experimental`. Statuses are `active`, `in-progress`, `concept`, and `archived`.

`DemonstrationConfiguration` intentionally models information, external links, video, interactive scenes, and dedicated experiences, but only the information strategy is rendered today. `ExhibitConfiguration` models an area ID, presentation kind, position, accent, and optional interaction range.

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

1. Copy an existing record in `src/data/projects` and name it for the project, e.g. `my-project.ts`.
2. Fill all required fields honestly; omit optional URLs/media that do not exist.
3. Use `as const satisfies PortfolioProject`.
4. Export and add the record to `src/data/projects/index.ts`.
5. Run `npm run typecheck`; this catches invalid categories, demonstration configuration, and exhibit fields.
6. Add an `exhibit` only if the project belongs in a mounted world area. The conventional website automatically sees every registered record.
7. Add `caseStudy` only when its problem, solution, feature descriptions, and decisions can be supported by project evidence. The generic page automatically renders it.

## Relationships

```text
PortfolioProject.exhibit.project-independent configuration
  -> ExhibitRegistry filters by area
  -> ProjectExhibit receives projectId/name/configuration
  -> InteractionEvent { kind: 'open-project', projectId }
  -> Information panel resolves project via registry
```

The exhibit holds no project description or technology list. That data remains in the project record and is resolved only at presentation time.

## Future CMS/API migration

Keep the `PortfolioProject` contract and registry methods. Replace `registeredProjects` with an adapter that normalizes CMS/API responses to the same serializable shape. Do not expose remote provider records directly to components or world code.
