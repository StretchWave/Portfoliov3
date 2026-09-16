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
| 12. Mobile Touch Controls & Virtual Joystick | **Completed** | Full smartphone and tablet support with 60 FPS zero-overhead virtual movement joystick, touch-swipe camera look, floating action buttons (`[ ⬡ INTERACT ]`), and touch-adaptive interaction telemetry. |
| 13. Dynamic OpenGraph Cards & Showcase Visuals | **Completed** | Next.js dynamic `ImageResponse` social cards (1200×630) for root and all 9 project routes, plus architectural SVG blueprint header art on project cards. |
| 14. Procedural Generative Ambient Soundscapes | **Completed** | Continuous real-time procedural background soundscapes for all 4 world districts using browser Web Audio API (0 KB downloads) with 1.2s equal-power crossfading and tab visibility management. |
| 15. Production Hardening, PWA & CI/CD Pipeline | **Completed** | Strict HTTP security headers in `next.config.ts`, Web App Manifest (`manifest.ts`) for PWA installation, and automated GitHub Actions CI workflow (`.github/workflows/ci.yml`). |
| 16. Interactive Skills Matrix, Multi-Dimensional Project Explorer & Holographic Pedestals | **Completed** | Interactive skill-to-project matrix on `/skills` with evidence level filters and verified systems linking; multi-dimensional search, priority chips, and sort controls on `/projects`; floating holographic telemetry displays bobbing over 3D pedestals with proximity-triggered focus highlights. |
| 17. Systems Architecture Topology Visualizer, Algorithmic Audio FX & Mobile Haptics | **Completed** | Interactive SVG Systems Architecture Topology Graph on `/about` modeling 10 system nodes and data flow pipelines; procedural micro-clicks and harmonic pings in `AudioSynthesizer`; battery-safe mobile haptic engine (`hapticManager`) integrated into touch controls and combat mechanics. |
| 18. Spatial 3D Audio Sonification, Audio & Haptics Control Center & Interactive Pipeline Diagrams | **Completed** | Real-time Web Audio StereoPanner tracking camera coordinates and yaw with acoustic horizon; Audio & Haptics modal (<kbd>U</kbd>) with volume sliders, profile selectors, and haptic test bench; Interactive architectural pipeline diagram on `/projects/[slug]` with stage inspection and sequential data flow simulation. |
| 19. Systems Diff Engine: Cross-Project Architectural Trade-Off Matrix | **Completed** | Multi-system side-by-side comparative analyzer on `/projects` comparing latency budgets, state patterns, failure modes, and architectural trade-offs with dynamic SVG radar/spider charts. |
| 20. Drone Flight Free-Cam, FOV Controls & Viewport Screenshot Capture | **Completed** | Unconstrained 3D Drone Flight mode (<kbd>F</kbd>) to explore world architecture from any height; customizable Field of View (60°–105°) and sensitivity; HUD-less high-resolution WebGL screenshot capture tool (<kbd>X</kbd>) with custom watermark. |
| 21. Architectural Core Memory Terminals & In-World Code Snippet Inspector | **Completed** | In-world interactive Memory Terminals near flagship pedestals and "Core Abstractions" tab on project detail pages featuring syntax-highlighted algorithmic code with performance commentary and copy utilities. |
| 22. Live Engineering Algorithm Sandboxes (`/sandbox`) | **Completed** | Browser-native, zero-dependency engineering algorithm playground (interactive biquad DSP audio filter visualizer, hydrological runoff simulator, and finite state machine combat parser). |
| 23. Machine-Readable Engineering Dossier Export & Print-Optimized Resume Engine | **Completed** | High-fidelity `@media print` stylesheets generating print-ready 2-page engineering resumes, one-click PDF / JSON Resume schema exports for recruiter ATS parsing, and offline PWA IndexedDB cache fallback. |



## Recommended next task sequence for repository owner

1. Collect owner-supplied links (LinkedIn, resume PDF, email) in `src/data/profile.ts` when ready to publish.
2. Add verified media (license-safe screenshots/video) for the flagship records in `src/data/projects/<id>.ts`.
3. Profile on real low-end mobile hardware and fine-tune dynamic resolution scale for budget devices.

## Intentionally deferred

Heavy binary GLB/KTX2 downloads (to maintain instant web load times under performance budgets), third-person character rigging (first-person inspection optimized), external CMS/backend database (statically verified data-first architecture), and external personal tracking cookies/analytics.