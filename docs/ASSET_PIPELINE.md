# Asset Pipeline — Project Atlas

How future assets enter the project. Today the interactive world is 100%
procedural geometry (no external assets), which is intentional: the reference
hub proves architecture and visual direction before files accumulate. When a
real asset is needed, this document is the entry process.

## Models

### Format

- Runtime models are **GLB / glTF** only.
- Source files (Blender `.blend`, etc.) stay out of the repository. Keep a
  documented source location if the owner works from one.
- Store runtime models under `public/models/<area>/`.

### Evaluation checklist for every model

1. **Purpose** — which area, which exhibit or prop, why it cannot be
   procedural geometry.
2. **Destination area** — which area loads it (see asset ownership).
3. **File size** — fits the per-model budget in
   `docs/PERFORMANCE_BUDGETS.md`.
4. **Geometry complexity** — triangle count is appropriate at its viewing
   distance.
5. **Material count** — maps onto the shared palette where possible; no
   unique material per object.
6. **Texture dependencies** — none, or within the texture budgets.
7. **Reusability** — can it be shared by other areas/exhibits?
8. **Loading strategy** — loaded with its area, not with the initial chunk.

### Optimization options (use only when justified)

| Technique | When | Trade-off |
| --- | --- | --- |
| Mesh simplification | Excess triangles at typical viewing distance | Manual review needed; don't automate blindly |
| Instancing | Repeated props (columns, rails, markers) | Reduces draw calls; complicates per-object state |
| Meshopt compression | Production GLB delivery | Default choice for shipped meshes |
| Draco | Where decode cost beats network cost | Decoder adds bundle weight; evaluate per asset |

Do not apply compression "because it exists". Every technique has a decode or
tooling cost; the budgets doc defines when each is warranted.

## Textures

- **Resolutions:** 1K by default; 2K only for measured close-up need; 4K
  requires a written justification.
- **Reuse:** share texture sets across objects and areas; do not re-export
  the same map per object.
- **Mipmaps:** generate and ship mipmapped textures to avoid shimmer.
- **KTX2 / Basis Universal** is appropriate for production GPU textures once a
  tested transcoder pipeline exists (e.g. `gltf-transform`, `basis` CLI).
  For the current procedural scene, no compressed textures are needed.
- Store textures under `public/textures/<area>/` with role-explicit names
  (e.g. `terminal-screen_basecolor.ktx2`, `terminal-screen_emissive.ktx2`).

## Materials

- Prefer the shared material palette in
  `src/three/world/environment/environment-materials.ts`; it is instantiated
  once and reused across areas.
- A unique material is allowed only when the shared set genuinely cannot
  express the surface, and it should be registered in or documented next to
  the palette so the material collection stays controlled.
- Never generate a unique material per object for the same surface.

## Asset ownership

Every major asset belongs to a named world area.

```text
public/models/<area>/      models that load with that area
public/textures/<area>/    textures that load with that area
```

- `public/models/atlas-hub/` — models for the reference hub (currently none;
  the hub is procedural).
- A future `software-district` owns its models/textures under
  `public/models/software-district/`.
- Shared cross-area assets live one level up (`public/models/shared/`,
  `public/textures/shared/`) and must be documented as shared.

The loading boundary rule: **an area's assets are fetched when that area
mounts, never with the initial 3D chunk.** The first mounted area's assets
may be bundled with its lazy import, but later areas must lazy-load their own
assets (see `src/three/world/world-areas.tsx` and the handoff doc).

## Naming convention

Keep it practical:

```text
<area>-<object>-<variant>.<ext>
```

Examples:

```text
atlas-hub-status-wall.glb
lyrune-exhibit-screen-v01.glb
terminal-screen_basecolor.ktx2
terminal-screen_emissive.ktx2
```

Rules:

- Lowercase, hyphens, no spaces.
- Include a variant/version (`v01`) when a model may be iterated.
- Texture role suffixes: `_basecolor`, `_normal`, `_roughness`, `_metalness`,
  `_emissive`, `_ao`.
- No dates, no "final"/"new" words, no capital letters.

## Licensing

Any external asset must have:

1. A license that permits the intended use (portfolio, possibly commercial
   later).
2. Its source and license recorded next to the asset (a short `README.md`
   per asset folder) and in this document.
3. A stated purpose, approximate payload, and optimization strategy.

If a suitable asset cannot satisfy these requirements, prefer procedural
geometry. The reference hub proves that the current quality bar can be met
without any external assets.