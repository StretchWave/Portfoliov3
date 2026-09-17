"use client";

import { Grid } from "@react-three/drei";

import { getEnvironmentConfig } from "@/data/scenes";
import type { EnvironmentConfig } from "@/types/scene";

import { getEnvironmentMaterials } from "./environment-materials";

export interface WorldEnvironmentProps {
  config?: EnvironmentConfig;
}

/**
 * Global environment shared by every mounted world area: atmosphere, ambient
 * fill, the single shadow-casting sun light, ground, and technical grid.
 * Can read from canonical scene data or override config dynamically.
 */
export function WorldEnvironment({ config = getEnvironmentConfig() }: WorldEnvironmentProps) {
  const materials = getEnvironmentMaterials();

  return (
    <>
      <color attach="background" args={[config.background]} />
      <fog attach="fog" args={[config.fog.color, config.fog.near, config.fog.far]} />
      <hemisphereLight
        color={config.hemisphereLight.skyColor}
        groundColor={config.hemisphereLight.groundColor}
        intensity={config.hemisphereLight.intensity}
      />
      <directionalLight
        castShadow
        intensity={config.directionalLight.intensity}
        position={config.directionalLight.position}
        shadow-mapSize-width={config.directionalLight.shadow.mapSize}
        shadow-mapSize-height={config.directionalLight.shadow.mapSize}
        shadow-camera-left={config.directionalLight.shadow.camera.left}
        shadow-camera-right={config.directionalLight.shadow.camera.right}
        shadow-camera-top={config.directionalLight.shadow.camera.top}
        shadow-camera-bottom={config.directionalLight.shadow.camera.bottom}
        shadow-camera-near={config.directionalLight.shadow.camera.near}
        shadow-camera-far={config.directionalLight.shadow.camera.far}
        shadow-bias={config.directionalLight.shadow.bias}
      />
      <mesh receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[config.ground.size, config.ground.size]} />
        <primitive object={materials.floor} attach="material" />
      </mesh>
      <Grid
        args={[config.grid.size[0], config.grid.size[1]]}
        cellSize={config.grid.cellSize}
        cellThickness={config.grid.cellThickness}
        cellColor={config.grid.cellColor}
        sectionSize={config.grid.sectionSize}
        sectionThickness={config.grid.sectionThickness}
        sectionColor={config.grid.sectionColor}
        fadeDistance={config.grid.fadeDistance}
        fadeStrength={config.grid.fadeStrength}
      />
    </>
  );
}