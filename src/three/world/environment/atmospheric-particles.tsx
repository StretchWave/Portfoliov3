"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface AtmosphericParticlesProps {
  count?: number;
  color?: string;
  bounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
}

/**
 * High-performance ambient light motes / atmospheric dust drifting in the space.
 * Uses a single Points instance (1 draw call) with subtle mathematical drift.
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function AtmosphericParticles({
  count = 130,
  color = "#68e4ff",
  bounds = { minX: -7.5, maxX: 7.5, minZ: -7.5, maxZ: 6.5 },
}: AtmosphericParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, initialSeeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r1 = pseudoRandom(i * 4 + 1);
      const r2 = pseudoRandom(i * 4 + 2);
      const r3 = pseudoRandom(i * 4 + 3);
      const r4 = pseudoRandom(i * 4 + 4);

      pos[i * 3] = bounds.minX + r1 * (bounds.maxX - bounds.minX);
      pos[i * 3 + 1] = 0.5 + r2 * 3.6; // height above ground
      pos[i * 3 + 2] = bounds.minZ + r3 * (bounds.maxZ - bounds.minZ);
      seeds[i] = r4 * Math.PI * 2;
    }

    return [pos, seeds];
  }, [count, bounds.minX, bounds.maxX, bounds.minZ, bounds.maxZ]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const posAttribute = geometry.attributes.position;
    if (!posAttribute) return;

    const time = clock.getElapsedTime() * 0.4;
    const array = posAttribute.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const seed = initialSeeds[i];

      // Gentle vertical float
      array[idx + 1] += 0.003;
      if (array[idx + 1] > 4.2) {
        array[idx + 1] = 0.5;
      }

      // Subtle horizontal sway
      array[idx] += Math.sin(time + seed) * 0.002;
    }

    posAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={color}
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
