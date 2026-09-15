# Visual Direction — Project Atlas

This document defines the visual identity of the interactive portfolio: the
feel, the architectural language, the material and lighting rules, and the
semantic color strategy. It is a **direction**, not a final art pass. Every
future world area should be readable as part of this same universe.

The reference implementation of this direction is the **Atlas Hub** — the
first polished environment slice (see `docs/AI_HANDOFF.md`). When a future
area wants a different look, it should deviate deliberately and document why;
silent drift is what this document exists to prevent.

## Identity

Project Atlas is the portfolio of a computer engineering student building
software, intelligent systems, and interactive worlds. The interactive
environment should feel like a space that person would design: a place where
systems are on display, built from the same discipline that builds the
software. The conceptual model is a **technical exhibition hall** — the
physical counterpart of a portfolio — not a game level and not an abstract
light show.

The environment is:

- **Purposeful.** Every structure supports circulation, sightlines, or the
  display of a project. Nothing exists "because it looks cool".
- **Technological.** Surfaces read as engineered: frames, panels, rails,
  gantries. Detail is structured and repeating, never random.
- **Calm and legible.** The space is dark, restrained, and readable. Light is
  used to explain the space (what is interactive, where to go), not to dazzle.
- **Scale-honest.** A compact hall, not a vast open world. The visitor is a
  person walking through a room, not a camera flying over terrain.

## Core atmosphere

Visitors should feel they have entered a working exhibition: an environment
that is *showing* the owner's work, and where exploration feels safe,
guided, and rewarding.

How the design produces that feeling:

- **Defined enclosure.** The hub is one bounded hall with walls, a light
  gantry, and an entrance. The visitor always knows where the space ends and
  where they came in. No void to fall into, no featureless horizon.
- **A clear circulation spine.** A luminous line on the floor runs from the
  entrance to the far wall. The visitor never has to guess the intended path;
  they can also leave it freely.
- **Exhibits as destinations.** Project displays sit on raised plinths in the
  open floor, framed by the light gantry above and marked by floor chevrons.
  They read as the *reason* the room exists.
- **Purposeful darkness.** The space is dark enough to make emissive surfaces
  and exhibits glow, but ambient and fill light keep every surface legible.
  This is not a horror atmosphere; it is a museum one.

## Architectural language

Principles for any future area:

### Building forms

- **Orthogonal, engineered forms.** Walls, columns, ribs, and beams are the
  vocabulary. Boxes and regular polygons; no organic or chaotic shapes.
- **Structure is expressed.** Frames, ribs, and gantries are visible as
  structure, not hidden. Columns carry beams; beams carry light panels.
- **A repeating module.** Areas should reuse a consistent structural rhythm
  (e.g. rib spacing, column positions) so the eye learns the pattern.

### Room proportions

- **Human scale with headroom.** Wall height 4.4 units with a visitor eye
  height of 1.7 gives a comfortable hall feel without tall-void emptiness.
- **Compact, walkable halls.** Areas should stay within a bounded footprint
  (the hub is ~18 × 16.5 units). Corridors and halls are wide enough to walk
  around exhibits and each other's sightlines, not vast.
- **Ceilings are optional and architectural.** Full ceilings are avoided in
  favor of light gantries and partial overhead structure: cheaper to render,
  keeps fog and sightlines interesting, and avoids a flat box feel.

### Structural elements

- Walls: panel + vertical frame ribs + a luminous trim rail at ~2.9 units.
- Columns: square-section with emissive base rings and caps for landmark
  positions.
- Gantries: paired beams carrying cross beams and luminous ceiling panels.
- Display walls: recessed/dim wall panels (e.g. the hub status panel).

### Corridors, open spaces, and sightlines

- One dominant axis per area (the hub's spine runs entrance → back wall).
- The entrance should give a first sightline toward the most important
  exhibit or structure.
- Exhibit positions should be visible from the circulation path, with floor
  guidance (chevrons) leading toward them.
- Keep at least one clear line of sight from the entrance to the far wall so
  the space is understood in one glance.

### Navigation

- The floor is the primary wayfinding surface: a spine line, threshold
  markers, and guide chevrons.
- Wayfinding uses the amber "navigation" color; interactive objects use cyan
  (see color strategy). These two meanings must never swap.
- Every exhibit is approachable from the spine without climbing over
  geometry; no invisible barriers.

### Browser rendering limits

- Prefer modular geometry from boxes/cylinders; instancing and LODs only when
  profiling demands them.
- Keep per-area mesh counts in the low hundreds and light counts in single
  digits (see `docs/PERFORMANCE_BUDGETS.md`).
- Fog and background color do most of the depth work; avoid expensive sky
  domes or post-processing.

## Material philosophy

A restrained material language: a small set of shared materials covers the
whole world. Areas do not invent their own structural surfaces. The palette
lives in `src/three/world/environment/environment-materials.ts` and is
instantiated once and reused.

| Category | Role | Definition |
| --- | --- | --- |
| Structural | Columns, beams, plinth bodies, ribs | Dark blue-slate, metalness ~0.6, roughness ~0.42 |
| Wall panel | Wall infill | Darker, roughness ~0.74, low metalness |
| Floor | Ground surface | Very dark, roughness ~0.9 |
| Display glass | Exhibit housings, screens' backing | Near-black, metalness ~0.55, roughness ~0.18 |
| Emissive fixtures | Light panels, rails, spines | MeshBasic (unlit), no dynamic-light cost |
| Navigation markers | Chevrons, thresholds | MeshBasic amber |

Rules:

- Emissive-looking surfaces use **basic (unlit) materials**, not glowing
  standard materials with extra lights. This is both a performance rule and a
  visual rule: fixture light is flat and clean.
- Project-specific color enters only through the exhibit `accent` from data,
  applied to the exhibit screen, ring, label, and point light.
- Do not create one-off materials for trivial variations; vary via geometry,
  not new materials.

## Lighting philosophy

The hierarchy, from global to local:

```text
Global environment (hemisphere + one shadow-casting directional)
        │
        ├── Area lighting (emissive gantry panels + 1–2 bounded point lights)
        ├── Exhibit lighting (accent point light per exhibit)
        └── Interactive accents (emissive rails, rings, screens)
```

- **Global:** one hemisphere light for fill, one directional for structure
  shadows (the only shadow-casting light in the scene).
- **Area:** luminous ceiling panels are the primary "area light" (zero light
  cost). A small number of point lights (finite distance, physical decay)
  provide warm/cool color interest; the hub uses two.
- **Exhibit:** each exhibit carries one accent-colored point light with a
  short range. Two exhibits → two lights. This is the only place project
  color becomes a light.
- **Navigation:** no lights for wayfinding — the markers are emissive.
- **Budget:** the whole hub runs ~6 lights (1 hemisphere, 1 directional,
  4 point). A future area should stay in the same range. Adding a second
  shadow-casting light requires a documented performance decision.

Lighting rules:

- Keep shadows to the single directional light; shadows are the most
  expensive visual feature.
- Use physical light decay (three.js default) and finite distances on point
  lights.
- Never add post-processing to compensate for weak composition.

## Semantic color strategy

Colors mean something. They are defined in
`environmentSemanticColors` (`environment-materials.ts`) and match the
conventional site palette in `src/app/globals.css` so both experiences share
one identity.

| Color | Meaning | Usage |
| --- | --- | --- |
| Cyan `#68e4ff` | Interactivity, active state | Exhibit screens, under-glow rings, focus dots, data rails, spine, topbar wordmark |
| Amber `#ffc76b` | Navigation / guidance | Floor chevrons, entrance threshold, entry-fill light, warnings |
| Deep blue-slate | Structure | Walls, columns, beams, plinths |
| Warm white | Fixture light | Ceiling panels |
| Project accent | That project | The only data-driven color; per exhibit |

Rules:

- Cyan = "you can interact with this". Never use amber for interactivity or
  cyan for wayfinding.
- Project categories **may** map to accent hues later (e.g. software =
  cyan-family, data = amber-family, games = magenta-family), but accents are
  currently supplied per record in project data — the exhibit system stays
  data-driven and the mapping decision belongs to content, not scene code.
- Limit hues per area: one structural family + cyan + amber + project
  accents. If an area needs another hue it should be justified in its design
  doc.

## Future district identity

Future districts should share the universe but have distinct identities.
All of them reuse: the material palette, the architectural modules, the
lighting hierarchy, and the semantic colors.

| District | Identity direction (not yet built) |
| --- | --- |
| Software Systems | Dense, ordered "server lab" language: rack-like frames, rows of status displays, corridor rhythm |
| Intelligent Systems | "Observation deck" language: darker, calmer, larger display surfaces, data-visualization panels, fewer but larger exhibits |
| Interactive Systems | "Workshop / playfield" language: brighter accent presence, exposed experimental structures, more open floor |

Guidelines for a new area's identity:

1. Pick one architectural idea (lab / observatory / workshop) and apply it
   through forms, not new colors.
2. Reuse the shared modules and materials; deviate only with a documented
   reason.
3. Keep the semantic color rules identical (cyan interactive, amber
   navigation).
4. Document the area's identity in its own section of this file (or a short
   per-area doc) when it is built.