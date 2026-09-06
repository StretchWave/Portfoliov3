# Performance Strategy

The target is a high-quality stylized experience that respects browser constraints. Atlas treats performance as an architectural constraint, not a late cleanup pass.

## Implemented now

| Concern | Current implementation |
| --- | --- |
| Initial web bundle | Conventional routes do not import `src/three`, Three.js, R3F, or Drei. |
| Interactive entry | `/interactive` renders a small client launcher rather than an immediate Canvas. |
| Engine/world loading | The click handler dynamically imports `interactive-experience`; the visitor must opt in. |
| Rendering | DPR is capped at 1.5 and antialiasing is disabled; the prototype is made from low-cost primitives. |
| Lighting | One shadow-casting directional light with a 1024 map; small point lights have finite distances. |
| Scene boundary | `PrototypeHub` is an independently named world-area component inside a Suspense boundary. |
| Data lookup | Registry uses maps for repeated ID/slug lookup. |
| Fallback | WebGL is checked before import; conventional project browsing remains available. |

The prototype has no external models or textures, so no asset loader or compression pipeline is prematurely added.

## Recommended later

### Models

- Ship runtime models as `.glb`/glTF only, stored by area under `public/models/` or fetched from a controlled CDN.
- Keep source Blender/Maya files out of runtime asset folders.
- Use Meshopt compression by default for production meshes; evaluate Draco only where its decode/network trade-off wins.
- Reuse geometry and materials, instance repeated props, and add LODs only for demonstrated distance/complexity pressure.
- Name files predictably, such as `hub-terminal-a.glb`, `intelligence-command-table.glb`, and `lyrune-exhibit-v01.glb`.

### Textures

- Prefer KTX2/Basis Universal for production GPU textures after installing a tested transcoder pipeline.
- Use sensible resolutions (usually 1K–2K unless a measured close-up needs more), authored mipmaps, and shared texture sets.
- Name map roles explicitly, e.g. `terminal-screen_basecolor.ktx2`, `terminal-screen_emissive.ktx2`.

### World loading

- Make each district a dynamically imported module mounted only when selected/nearby.
- Wrap area modules and asset groups in React Suspense with intentional visual loading states.
- Add distance/visibility mounting only after profiling shows that whole-area rendering is the bottleneck.
- Keep heavy demonstration experiences on dedicated routes or separately lazy imports.

### Measurement

- Track route chunk sizes with `next experimental-analyze` before and after material bundle changes.
- Profile device classes with browser Performance tools; record FPS, long tasks, GPU memory symptoms, and interaction latency.
- Test a cold interactive launch on representative integrated graphics and a constrained mobile device.
- Set a concrete asset/triangle/texture budget only after art direction and target devices are agreed.

## Avoid until necessary

- A world-streaming engine, global graphics-settings store, automatic LOD generator, or an asset database for this two-exhibit greybox.
- Compression of prototype primitives or configuration added solely to support theoretical future files.
- Loading all future districts “just in case.”
- Browser-hosted AAA photorealism that trades project access for GPU requirements.

## Regression rule

Before accepting a new 3D dependency, model, texture set, or world district, answer: which user-visible capability requires it, which route loads it, and how will its bundle/render cost be measured? If those answers are unclear, keep it out of the foundation.
