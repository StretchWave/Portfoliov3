"use client";

import { Grid } from "@react-three/drei";

import { getEnvironmentMaterials } from "./environment-materials";

/**
 * Global environment shared by every mounted world area: atmosphere, ambient
 * fill, the single shadow-casting sun light, ground, and technical grid.
 * Areas add their own bounded lighting (emissive fixtures + a few point
 * lights) and must not add extra shadow-casting lights.
 */
export function WorldEnvironment() {
  const materials = getEnvironmentMaterials();

  return (
    <>
      <color attach="background" args={["#07111f"]} />
      <fog attach="fog" args={["#07111f", 14, 34]} />
      <hemisphereLight color="#9fd8ff" groundColor="#0a1830" intensity={0.55} />
      <directionalLight
        castShadow
        intensity={1.15}
        position={[6, 9, 4]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={13}
        shadow-camera-bottom={-13}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
      <mesh receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[26, 26]} />
        <primitive object={materials.floor} attach="material" />
      </mesh>
      <Grid
        args={[24, 24]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#16355a"
        sectionSize={4}
        sectionThickness={0.8}
        sectionColor="#1f4d7d"
        fadeDistance={21}
        fadeStrength={1.4}
      />
    </>
  );
}