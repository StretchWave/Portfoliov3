import { MeshBasicMaterial, MeshStandardMaterial } from "three";

/**
 * Semantic color constants for the Atlas visual language. These are plain
 * values shared by the conventional site palette (see globals.css) and the
 * 3D environment so the two experiences belong to the same world.
 */
export const environmentSemanticColors = {
  /** Interactive/active states: exhibits, focus, data rails. */
  interactive: "#68e4ff",
  /** Navigation/wayfinding: floor markers, thresholds, guide chevrons. */
  navigation: "#ffc76b",
  /** Primary structural surfaces: columns, frames, plinth bodies. */
  structural: "#16283f",
  /** Wall infill panels. */
  wallPanel: "#0c1c30",
  /** Floor surface. */
  floor: "#091527",
  /** Emissive fixture light (ceiling panels). */
  fixtureLight: "#eaf6ff",
  /** Dark glass/display backing. */
  displayGlass: "#06121f",
} as const;

/**
 * The shared environment material set. Created lazily and cached so every
 * area reuses the same material instances instead of allocating per-mesh
 * copies. Do not mutate these materials from area code; if an area needs a
 * genuinely different surface, define it locally and document why.
 */
export interface EnvironmentMaterials {
  structural: MeshStandardMaterial;
  wallPanel: MeshStandardMaterial;
  floor: MeshStandardMaterial;
  displayGlass: MeshStandardMaterial;
  trim: MeshBasicMaterial;
  fixtureLight: MeshBasicMaterial;
  marker: MeshBasicMaterial;
}

let cachedMaterials: EnvironmentMaterials | null = null;

export function getEnvironmentMaterials(): EnvironmentMaterials {
  if (cachedMaterials) return cachedMaterials;

  cachedMaterials = {
    structural: new MeshStandardMaterial({
      color: environmentSemanticColors.structural,
      metalness: 0.62,
      roughness: 0.42,
    }),
    wallPanel: new MeshStandardMaterial({
      color: environmentSemanticColors.wallPanel,
      metalness: 0.25,
      roughness: 0.74,
    }),
    floor: new MeshStandardMaterial({
      color: environmentSemanticColors.floor,
      metalness: 0.2,
      roughness: 0.9,
    }),
    displayGlass: new MeshStandardMaterial({
      color: environmentSemanticColors.displayGlass,
      metalness: 0.55,
      roughness: 0.18,
    }),
    // Emissive-only surfaces use basic materials: they read as light sources
    // without paying for additional dynamic lights.
    trim: new MeshBasicMaterial({ color: environmentSemanticColors.interactive }),
    fixtureLight: new MeshBasicMaterial({ color: environmentSemanticColors.fixtureLight }),
    marker: new MeshBasicMaterial({ color: environmentSemanticColors.navigation }),
  };

  return cachedMaterials;
}