# Project Atlas Roadmap

Status reflects this repository after the Visual Direction and Environment
Foundation phase.

| Phase | Status | Scope |
| --- | --- | --- |
| 0. Foundation | **Completed** | Next.js base, typed data registry, conventional pages, opt-in 3D hub, player, interaction, generic exhibits, docs, and handoff. |
| 1. Portfolio Core | **Completed** | Owner profile, evidence-based skills, and a verified 9-project catalog (3 flagships, featured, supporting, concept, archived) with priority/status hierarchy, category filters, and case studies where supported. |
| 2. Major Project Exhibits | **Started** | Lyrune, Kerala Flood Risk Platform, and Sonara have labeled, data-configured exhibits in the Atlas Hub. Richer presentations and the Kerala command center remain deferred until content/assets are ready. |
| 3. Visual Direction & Environment Foundation | **Completed** | Visual direction document, performance budgets, asset pipeline, modular world architecture (`world/environment` + `world/areas`), shared material palette, lighting hierarchy, and the first polished reference environment: the Atlas Hub. |
| 4. Portfolio Content Integration | **Completed** | Verified project inventory, evidence-based skills, single-source profile, priority/status taxonomy, category filters, and the PvP concept entry. See `docs/PORTFOLIO_INVENTORY.md` and `docs/SKILL_EVIDENCE.md`. |
| 5. World Expansion | Deferred | Add separately loaded districts for software, intelligent, and interactive systems; create area navigation and transitions via the `WorldAreas` seam. |
| 6. Interactive Demonstrations | Deferred | Introduce focused demo renderers/experiences for video, simulation, external tools, and later playable web prototypes. |
| 7. Optimization | Deferred until profiling exists | Profile the reference hub on target hardware (see `docs/PERFORMANCE_BUDGETS.md`), then apply asset pipeline, area loading, compression, and quality tiers based on measurements. |
| 8. Deployment and Analytics | Deferred | Hosting, privacy-conscious analytics, error monitoring, SEO assets, performance monitoring, and deployment documentation. |

## Recommended next task sequence

1. Collect owner-supplied links (LinkedIn, resume) and verified media (license-safe screenshots/video) for the flagship records.
2. Profile the Atlas Hub on target devices (see the measurement process in `docs/PERFORMANCE_BUDGETS.md`) and record real numbers before importing assets.
3. Add the first new world area (a district) following the Atlas Hub pattern and the `WorldAreas` dynamic-import conversion described in `docs/DEVELOPMENT_GUIDE.md`.
4. Convert the PvP concept into a real project record once a repository or prototype exists.
5. Add a richer exhibit presentation only when its project has verified content/assets to support it.

## Intentionally deferred

Final environment art, third-person character animation, collision physics, world streaming, graphics settings, multiplayer, authentication, database/CMS infrastructure, a complete PvP game, final playable demos, deployment analytics, and a full asset pipeline are deliberately outside this phase. The asset pipeline *rules* exist in `docs/ASSET_PIPELINE.md`, but no external assets are imported yet.