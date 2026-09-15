"use client";

import { getEnvironmentMaterials } from "./environment-materials";

/**
 * Reusable lighting-language fixtures. These are emissive surfaces that read
 * as light sources without adding dynamic lights to the scene; area fills are
 * reserved for a small number of intentional point lights placed per area.
 */

interface CeilingPanelLightProps {
  position: readonly [number, number, number];
  width: number;
  depth: number;
}

/** A luminous ceiling panel used by area light gantries. */
export function CeilingPanelLight({ position, width, depth }: CeilingPanelLightProps) {
  const materials = getEnvironmentMaterials();
  return (
    <mesh position={[...position]}>
      <boxGeometry args={[width, 0.05, depth]} />
      <primitive object={materials.fixtureLight} attach="material" />
    </mesh>
  );
}

interface LightRibbonProps {
  position: readonly [number, number, number];
  length: number;
  axis: "x" | "z";
  color?: string;
}

/** A thin luminous strip: data rails, floor spines, thresholds, guide lines. */
export function LightRibbon({ position, length, axis, color }: LightRibbonProps) {
  const materials = getEnvironmentMaterials();
  const geometryArgs = axis === "x" ? ([length, 0.05, 0.05] as const) : ([0.05, 0.05, length] as const);
  const material = color ? { color } : materials.trim;

  return (
    <mesh position={[...position]}>
      <boxGeometry args={geometryArgs} />
      {color ? <meshBasicMaterial color={color} /> : <primitive object={material} attach="material" />}
    </mesh>
  );
}