"use client";

import { Grid } from "@react-three/drei";

export function WorldEnvironment() {
  return (
    <>
      <color attach="background" args={["#07111f"]} />
      <fog attach="fog" args={["#07111f", 12, 30]} />
      <ambientLight intensity={0.55} />
      <directionalLight castShadow intensity={1.4} position={[5, 8, 5]} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight color="#4dc2ff" intensity={10} distance={10} position={[-5, 3, -3]} />
      <pointLight color="#ffb35c" intensity={8} distance={9} position={[5, 2.5, -3]} />
      <mesh receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#0b1a2d" roughness={0.88} metalness={0.18} />
      </mesh>
      <Grid args={[24, 24]} cellSize={1} cellThickness={0.4} cellColor="#17365b" sectionSize={4} sectionThickness={0.8} sectionColor="#245487" fadeDistance={20} fadeStrength={1.2} />
    </>
  );
}
