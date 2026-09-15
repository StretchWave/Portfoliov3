"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * An undulating 3D topographic wireframe mesh mounted on the Observatory
 * panoramic wall, simulating river basin elevation contours and flood telemetry.
 */
export function TopographicContourGrid() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
    const pos = geometry.attributes.position;
    if (!pos) return;

    const time = clock.getElapsedTime() * 0.8;
    const count = pos.count;

    for (let i = 0; i < count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      // Topographic wave simulation
      const z =
        Math.sin(u * 0.8 + time) * 0.18 +
        Math.cos(v * 1.2 - time * 0.6) * 0.12 +
        Math.sin(Math.sqrt(u * u + v * v) * 1.5 - time) * 0.1;
      pos.setZ(i, z);
    }

    pos.needsUpdate = true;
  });

  return (
    <group position={[0, 2.6, -8.35]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[9.6, 2.4, 28, 12]} />
        <meshBasicMaterial
          color="#818cf8"
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}
