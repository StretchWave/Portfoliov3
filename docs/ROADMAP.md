# Project Atlas Roadmap

Status reflects this repository after the Visual Direction and Environment
Foundation phase.

| Phase | Status | Scope |
| --- | --- | --- |
| 0. Foundation | **Completed** | Next.js base, typed data registry, conventional pages, opt-in 3D hub, player, interaction, generic exhibits, docs, and handoff. |
| 1. Portfolio Core | **Completed** | Owner profile, evidence-based skills, and a verified 9-project catalog (3 flagships, featured, supporting, concept, archived) with priority/status hierarchy, category filters, and case studies where supported. |
| 2. Major Project Exhibits | **Completed** | All projects configured with data-driven exhibits across Atlas Hub and dedicated districts; custom labels, accents, and spatial portals mounted. |
| 3. Visual Direction & Environment Foundation | **Completed** | Visual direction document, performance budgets, asset pipeline, modular world architecture (`world/environment` + `world/areas`), shared material palette, lighting hierarchy, and the first polished reference environment: the Atlas Hub. |
| 4. Portfolio Content Integration | **Completed** | Verified project inventory, evidence-based skills, single-source profile, priority/status taxonomy, category filters, and the PvP concept entry. See `docs/PORTFOLIO_INVENTORY.md` and `docs/SKILL_EVIDENCE.md`. |
| 5. World Expansion | **Completed** | Dynamic lazy area router in `WorldAreas`, spatial `PortalGateway` wayfinding, and three full thematic districts: Software Systems District, Intelligent Systems Observatory, and Creative & Interactive Workshop. |
| 6. Interactive Demonstrations | **Completed** | Live interactive demonstrations implemented: Audio spectrum visualizer (Lyrune), bash CLI & API terminal runner (Lucida-Sync & RecoverAI), flood risk telemetry simulator (Kerala Flood Risk), and combat timing trainer (Stance Combat PvP). |
| 7. Optimization & Diagnostics | **Completed** | Real-time WebGL performance telemetry HUD (FPS, draw calls, triangles, geometry memory), dynamic quality tiers (Low/Balanced/High), and controls help modal. |
| 8. Deployment and SEO | **Completed** | Dynamic `sitemap.ts`, `robots.ts`, OpenGraph and Twitter card metadata, and Schema.org JSON-LD structured data. Production build verified. |
| 9. Audio & Omnisearch | **Completed** | Universal Command Palette (`Ctrl+K`) for rapid navigation and spatial teleportation, plus zero-asset procedural Web Audio synthesizer for tactile sound feedback. |
| 10. Spatial Radar & Advanced Telemetry | **Completed** | 60fps canvas Spatial Radar & Mini-Map HUD (`M`), real-time Web Audio API DSP filter & FFT engine for Lyrune, and River Basin Inundation Map with historical crisis replay for Kerala Flood Risk. |
| 11. Guided Director Tour & Discovery Journal | **Completed** | Hands-free cinematic camera tour mode (<kbd>T</kbd>) with curated district waypoints and instant manual takeover, plus 12-milestone persistent Discovery Journal system (<kbd>J</kbd>) with micro-toast alerts, exploration ranks, and zero Three.js bundle leakage. |


## Recommended next task sequence for repository owner

1. Collect owner-supplied links (LinkedIn, resume PDF, email) in `src/data/profile.ts` when ready to publish.
2. Add verified media (license-safe screenshots/video) for the flagship records in `src/data/projects/<id>.ts`.
3. Profile on real low-end mobile hardware and fine-tune dynamic resolution scale for budget devices.

## Intentionally deferred

Heavy binary GLB/KTX2 downloads (to maintain instant web load times under performance budgets), third-person character rigging (first-person inspection optimized), external CMS/backend database (statically verified data-first architecture), and external personal tracking cookies/analytics.