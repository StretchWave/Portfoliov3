# Project Atlas

Project Atlas is a web-native, progressively enhanced portfolio platform showcasing software engineering, data & intelligent systems, and interactive creative technology. The conventional Next.js site delivers full accessibility and fast static delivery independently, while visitors can launch an optional procedural 3D world hub.

---

## Quick Start

```bash
# Install dependencies (deterministic)
npm ci

# Run development server
npm run dev
```

Open `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

---

## Verification & Testing Pipeline

Atlas maintains a rigorous, deterministic verification pipeline:

```bash
# 1. Typecheck TypeScript without emit
npm run typecheck

# 2. Run ESLint code standards
npm run lint

# 3. Run pure-logic automated unit tests
npm test

# 4. Compile production bundle & pre-render static routes (SSG)
npm run build

# 5. Run full headless E2E assertion suite (routes, districts, mobile layout, 0 errors)
node scripts/atlas-e2e.mjs
```

---

## Atlas Studio Visual Editor

Project Atlas includes **Atlas Studio**, a visual 3D world scene authoring environment located at `/studio`.

Features:
- **Canonical Scene Data Layer**: World areas, lighting, portals, bounds, spawn, atmosphere, and reusable architecture modules are defined in typed data records (`src/data/scenes/`).
- **Interactive 3D Viewport**: Live OrbitControls and TransformControls (translate `W`, rotate `E`, scale `R`) for editing objects in real time.
- **Scene Hierarchy & Inspector**: Search, categorize, unhide/hide, duplicate, and delete objects with type-safe controls.
- **Runtime Preview Mode**: Switch from edit mode to real-time first-person exploration (`WASD`) within the editor.
- **Scene Health Validation**: Real-time validation checks for bounds, spawn positions, light budgets, and referential integrity.
- **Persistence & Export**: JSON scene snapshot export/import and CLI conversion to version-controlled TypeScript data files via `scripts/scene-to-ts.ts`.


## Canonical Documentation

- **[Architecture](docs/ARCHITECTURE.md)**: System topology, bundle isolation boundaries, district lazy loading, procedural audio bus, and versioned client persistence.
- **[Development Guide](docs/DEVELOPMENT.md)**: Tooling setup, testing conventions, and engineering workflows.
- **[Verified Inventory](docs/VERIFIED-INVENTORY.md)**: Authoritative project catalog detailing verified implementations, roles, evidence classifications, and public repositories.
- **[Performance Policy](docs/PERFORMANCE.md)**: Measured build benchmarks vs design targets, CI WebGL testing notes, and memory management.
- **[Architectural Decisions](docs/DECISIONS.md)**: Architectural Decision Records (ADRs) detailing core rationales and system tradeoffs.
