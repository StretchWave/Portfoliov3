# Project Atlas — Performance & Measurement Policy

This document establishes the performance architecture, measured benchmarks, and engineering targets of Project Atlas. It maintains a strict separation between **empirically measured data** and **design targets**.

---

## 1. Measured Benchmarks vs Design Targets

| Dimension | Classification | Status / Value | Notes |
| :--- | :--- | :--- | :--- |
| **Next.js Production Build** | **Measured** | `1.7s` compilation, `735ms` SSG (31 pages) | Verified on Node v24 with Turbopack |
| **Conventional Bundle Size** | **Measured** | 0 KB Three.js / R3F | Zero Three.js leakage verified via build inspect |
| **Unit Test Execution** | **Measured** | `~450ms` (33 unit tests across 7 suites) | Native `tsx --test` test runner |
| **E2E Suite Execution** | **Measured** | `~50s` across 15 routes + 4 3D districts | Headless Chrome with SwiftShader |
| **CI Headless WebGL** | **Measured Compatibility** | Passing (0 WebGL errors) | SwiftShader software rendering; **not** a GPU benchmark |
| **Desktop 3D Frame Rate** | **Design Target** | 60 FPS target on dedicated GPUs | Requires local hardware profiling |
| **Mobile 3D Frame Rate** | **Design Target** | Designed for low-overhead mobile interaction | Subject to device thermal throttling; unverified on low-end hardware |
| **Procedural Audio Footprint** | **Measured** | 0 KB external audio downloads | Synthesized entirely via Web Audio API oscillators |

---

## 2. CI WebGL Measurement Policy

When running headless tests in continuous integration using:
```bash
--enable-unsafe-swiftshader
--use-angle=swiftshader
```
these tests validate **shader compilation, scene graph construction, and DOM synchronization**.
- **Policy**: SwiftShader results must never be cited as real-world GPU performance measurements.
- Real hardware measurements must be performed on physical devices (desktop discrete GPU, mid-range mobile, integrated graphics).

---

## 3. Bundle Isolation Architecture

Conventional portfolio routes (`/`, `/about`, `/projects`, `/skills`, `/sandbox`, `/resume`) serve standard HTML and minimal CSS/JS.
- **Three.js Isolation**: Dynamic `import("@/three/experience/interactive-experience")` ensures the Three.js and React Three Fiber bundles are only fetched when the user chooses to launch the 3D hub.
- **Font & Asset Strategy**: System fonts and lightweight CSS custom properties are preferred over heavyweight external web font files.
- **PWA Asset Strategy**: Lightweight PNG icons with proper maskable declarations; no bloated background workers.

---

## 4. Memory & WebGL Resource Management

- **District Transitions**: During area transitions, active district Three.js geometries and materials are unmounted to free GPU memory buffers.
- **Context Loss Handling**: Three.js canvas listens for `webglcontextlost` and `webglcontextrestored` to gracefully alert the user without crashing the browser tab.
- **Procedural Audio Garbage Collection**: Temporary oscillators and gain nodes are disconnected and stopped after their ADSR envelopes complete, preventing Web Audio API node leaks.
