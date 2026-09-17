"use client";

import type { PointLightObject } from "@/types/scene";

interface SceneLightsProps {
  lights: readonly PointLightObject[];
}

/**
 * Data-driven point light renderer.
 * Renders bounded point lights defined in the scene configuration.
 */
export function SceneLights({ lights }: SceneLightsProps) {
  return (
    <group name="scene-lights">
      {lights.map((light) => {
        if (light.visible === false) return null;

        return (
          <pointLight
            key={light.id}
            color={light.color}
            intensity={light.intensity}
            distance={light.distance}
            position={light.transform.position}
            castShadow={light.castShadow ?? false}
          />
        );
      })}
    </group>
  );
}
