# Performance Budgets — Project Atlas

This document defines provisional performance targets for the interactive
portfolio. **Targets are planning budgets, not measured guarantees.** Measured
results are listed separately, with the environment in which they were taken.

## Target device categories

Provisional planning categories. These are not promises until profiled on
real hardware.

| Category | Example hardware | Expectation |
| --- | --- | --- |
| Lower-end capable desktop/laptop | Older iGPU (Intel UHD-class), 1080p | Playable exploration at reduced detail; the conventional site is fully supported everywhere |
| Typical modern laptop | Recent Intel/AMD iGPU or entry dGPU, 1080p–1440p | Full reference-hub experience at comfortable frame rates |
| Recommended desktop | Dedicated GPU (GTX 1660-class or better), 1440p | Reference experience with headroom for future areas |

Mobile is **not** a target for the full interactive experience unless
intentionally implemented and tested. The conventional website must remain
broadly accessible on all devices.

## Performance targets (provisional)

Distinguish target from measured: nothing in the "Target" column is a claim
about current performance.

| Concern | Target | Measured (see below) |
| --- | --- | --- |
| Initial website load | Conventional routes under ~150 KB JS (route-split, no 3D) | Not measured this phase |
| Interactive entry page | Small client launcher only; engine fetched on click | Not measured this phase |
| Interactive experience load | 3D chunk + world under ~1 MB gzipped, no external assets | Not measured this phase |
| Frame rate | 60 fps on typical laptop; 30 fps floor on lower-end capable | Not measured on real GPU yet |
| Frame time | ≤ 16.7 ms (60 fps) typical; ≤ 33 ms floor | Not measured this phase |
| JavaScript work per frame | Low; scene is static except player/detector updates | Not measured this phase |
| GPU complexity | ≤ ~100 draw calls, ≤ ~6 lights, single shadow map for the reference hub | Not measured this phase |
| Initial 3D asset payload | 0 external assets (procedural geometry only) | 0 assets — measured by construction |
| Additional area payload | Each future area ≤ ~1 MB gzipped including its assets | N/A (no additional areas yet) |

### Bundle guidance

- The whole 3D experience is one lazy chunk today (engine + world + exhibits
  + UI). Keep it under ~1 MB gzipped as long as the world is procedural.
- When areas gain models/textures, each area's assets should load with that
  area, never with the initial chunk (see `docs/ASSET_PIPELINE.md`).
- Check chunk sizes with `next build` output / `experimental-analyze` before
  and after material bundle changes.

## Asset budgets

Guidance for future assets. These are planning numbers to be confirmed by
profiling, not hard guarantees.

| Asset kind | Budget guidance |
| --- | --- |
| Individual model | ≤ ~250 KB gzipped GLB for a hero prop; ≤ ~100 KB for supporting props |
| Total initial asset payload | ≤ ~1 MB gzipped for the first mounted area |
| Additional area payload | ≤ ~1 MB gzipped per additional area, loaded on entry |
| Texture resolution | 1K default; 2K only for measured close-up need; no 4K without justification |
| Texture memory | Keep active GPU textures ≤ ~128 MB for the whole scene |
| Material count | Reuse the shared palette; a few unique materials per area, not per object |
| Geometry complexity | Individual meshes ≤ ~50k triangles; area totals ≤ ~300k triangles before LOD/instancing review |

Rationale: these numbers follow browser-3D best practice for a stylized,
low-poly-honest look. They will be revised after the first profiling pass on
the target device categories above.

## Measurement process

Future developers should measure before changing budgets. Use practical tools
only; no analytics system is needed.

### Frame rate and frame time

1. Open the interactive experience in Chrome/Edge DevTools → **Performance**.
2. Record 10–30 seconds of representative movement (walk the spine, approach
   both exhibits, open/close a panel).
3. Read: average/max frame times, long tasks, and the FPS summary.
4. Note: device, browser, resolution, device-pixel-ratio, quality settings,
   and whether the GPU is dedicated or integrated.

### CPU and JS cost

- Performance panel "Main thread" flame graph: look for long tasks (>50 ms)
  and React re-renders during interaction.
- React DevTools Profiler when investigating re-render storms.

### GPU cost

- DevTools → Rendering → **Frame Rendering Stats** (GPU frame time).
- Task Manager (Chrome) GPU process usage as a rough signal.
- WebGL insights (e.g. `about:gpu`, ANGLE info) when needed.

### Network payload and bundle size

- `next build` route table + `npx next experimental-analyze` for chunk sizes.
- DevTools → Network with "Disable cache": record the 3D chunk size and any
  asset requests on launch.

### Asset loading

- Record asset request timings on a cold launch and on area entry.
- Log or measure decode time for compressed textures if used.

### Recording format

Every measurement should be recorded with:

```text
Device: [class + hardware]
Browser: [name + version]
Resolution: [e.g. 1920×1080 @ dpr 1]
Quality config: [baseline / any future tier]
Environment: [Atlas Hub spawn, walked spine, both exhibits, panel opened]
Result: [numbers]
```

## Status

- **Reference hub:** procedural geometry only; zero external assets; single
  shadow-casting light; ~6 lights total. Visual behavior was smoke-tested in
  headless Chrome (rendering, movement, focus, panel flow) — see
  `docs/AI_HANDOFF.md` for the validation record.
- **Not yet measured:** real-device FPS, frame times, and bundle bytes.
  These are the first items to measure when the reference environment is
  profiled on target hardware.