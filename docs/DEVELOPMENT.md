# Project Atlas — Development Guide

This document outlines the workflows, tooling, commands, and conventions for developing on Project Atlas.

---

## Prerequisites

- **Node.js**: v20.x or higher (developed on Node v24.x)
- **npm**: v10.x or higher
- **Chrome / Chromium**: Required for running the headless E2E assertion test suite.

---

## Scripts & Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Builds the production bundle and pre-renders static routes (SSG) |
| `npm run start` | Starts the production server from `.next` build output |
| `npm run typecheck` | Runs TypeScript compiler (`tsc --noEmit`) to verify types |
| `npm run lint` | Runs ESLint across the codebase using Next.js core web vitals rules |
| `npm test` | Runs the automated unit test suite (`tsx --test tests/unit/**/*.test.ts`) |
| `node scripts/atlas-e2e.mjs` | Runs headless E2E assertions with browser console error capture |

---

## Test Architecture

### 1. Unit Testing (`tests/unit/`)
Unit tests focus on pure, deterministic logic:
- **`project-registry.test.ts`**: Validates registry referential integrity, duplicate IDs, duplicate slugs, related project links, and derived metrics.
- **`project-search.test.ts`**: Tests search query matching across title, summary, technologies, and skills.
- **`discovery-journal.test.ts`**: Validates milestone IDs, progress calculations, and bounds ($0\% \le \text{progress} \le 100\%$).
- **`storage.test.ts`**: Tests fault-tolerant parsing of corrupted `localStorage` records, number clamping, and defaults.
- **`combat-sandbox.test.ts`**: Tests deterministic frame data, state transitions, startup/active/recovery/I-frame phases.
- **`hydrology-sandbox.test.ts`**: Tests elevation boundaries, preset shapes, and runoff simulation calculations.
- **`dsp-sandbox.test.ts`**: Tests biquad filter coefficient calculations across 5 filter types and DC gain accuracy.

### 2. End-to-End Testing (`scripts/atlas-e2e.mjs`)
The E2E suite drives headless Chrome via the Chrome DevTools Protocol (CDP):
- **Compatibility Note**: When executed in CI with `--enable-unsafe-swiftshader`, this is documented as a **CI WebGL compatibility test**, verifying shader compilation and scene mounting. It is **not** a GPU performance benchmark.
- **Console Error Capture**: Listens to `Runtime.consoleAPICalled` and `Runtime.exceptionThrown`. The test fails if any unexpected browser errors or unhandled exceptions occur.
- **Route & Component Coverage**: Asserts that all 15 conventional routes, skills matrix, project cards, comparison radar chart, code snippet inspectors, and sandboxes render.
- **3D World & District Transitions**: Verifies 3D canvas initialization, WebGL context, and transitions across all 4 districts.
- **Mobile Viewport Emulation**: Simulates mobile viewport (390x844) and asserts zero horizontal scroll overflow.

---

## Engineering Guidelines

1. **Bundle Isolation**: Never import Three.js or R3F modules into conventional route components (`src/app/page.tsx`, `src/app/projects/*`, etc.).
2. **Evidence-Based Snippets**: Every code snippet in `code-snippets-data.ts` must include an `evidenceType`:
   - `verified-source`: Code matches public repository.
   - `adapted-example`: Simplified architecture demonstration.
   - `conceptual`: Pure design concept.
   - `simulation`: Simulated demonstration console.
3. **No Hardcoded Project Statistics**: Use registry derivation helpers (`getProjectCount()`, `getVerifiedProjects()`, etc.).
4. **Accessible Dialogs**: Every modal dialog must utilize `useModalFocusTrap` or follow semantic dialog patterns with focus trapping and Escape handling.
