# Project Atlas — Claude / Agent Guidelines

Project Atlas is an engineering portfolio application built with Next.js 16 (App Router), React 19, Three.js / React Three Fiber, and TypeScript.

## Core Directives & Standards

1. **Honesty & Evidence First**:
   - Never fabricate implementation evidence or inflate proficiency labels.
   - Code snippets must be explicitly classified (`verified-source`, `adapted-example`, `conceptual`, `simulation`).
   - Distinguish strictly between: *verified codebase*, *adapted example*, *conceptual design*, and *simulated demonstration*.
   - Never claim "production-grade" without production deployment verification.
   - Concepts (such as Stance Combat PvP) must always be labeled as conceptual architecture.

2. **Bundle Architecture & Conventional Route Isolation**:
   - Zero Three.js leakage: Conventional routes (`/`, `/about`, `/projects`, `/skills`, `/sandbox`, `/resume`) must NOT bundle or load Three.js or React Three Fiber.
   - Dynamic 3D experiences are isolated exclusively to `/interactive`.
   - Client storage uses versioned, fault-tolerant keys (`atlas-settings-v1`, `atlas-discovery-v1`) with hydration-safe `useSyncExternalStore`.

3. **Validation Commands**:
   - Typecheck: `npm run typecheck` (`tsc --noEmit`)
   - Lint: `npm run lint` (`eslint .`)
   - Unit Tests: `npm test` (`tsx --test tests/unit/**/*.test.ts`)
   - Production Build: `npm run build` (`next build`)
   - E2E Assertion Suite: `node scripts/atlas-e2e.mjs`

4. **Single Source of Truth**:
   - Canonical site configuration lives in `src/lib/site-config.ts`.
   - Project metadata lives strictly in `src/data/projects/` and `src/features/portfolio/project-registry.ts`.
   - Derived functions (`getVerifiedProjects()`, `getProjectCount()`, `getVerifiedSkills()`, `getProjectTechnologies()`) must be used instead of hardcoded numbers.
