"use client";

import { LightRibbon } from "../../environment/environment-lighting";
import { getEnvironmentMaterials } from "../../environment/environment-materials";

/**
 * Floor-level wayfinding for the hub: the luminous circulation spine, the
 * entrance threshold, and guide chevrons that point toward each exhibit.
 * Navigation markers use the shared amber "navigation" color so they read as
 * guidance rather than interactivity (which is cyan).
 */
export function HubNavigation() {
  const materials = getEnvironmentMaterials();

  return (
    <group>
      {/* Circulation spine along the hall axis. */}
      <LightRibbon position={[0, 0.03, 0]} length={13} axis="z" />
      {/* Entrance threshold. */}
      <LightRibbon position={[0, 0.03, 7.15]} length={7.6} axis="x" />

      {/* Guide chevrons toward each exhibit position. */}
      {[-4.2, 4.2].map((x) =>
        [-1.95, -1.45].map((z) => (
          <mesh key={`chevron-${x}-${z}`} position={[x, 0.035, z]} rotation={[Math.PI / 2, Math.PI, 0]}>
            <coneGeometry args={[0.32, 0.55, 4]} />
            <primitive object={materials.marker} attach="material" />
          </mesh>
        )),
      )}
    </group>
  );
}