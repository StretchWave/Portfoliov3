"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * Counter-rotating holographic combat stance rings hovering
 * above the interaction arena floor.
 */
export function HolographicStanceRings() {
  const outerRingRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y += delta * 0.4;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y -= delta * 0.6;
    }
  });

  return (
    <group position={[0, 0.4, -1.8]}>
      {/* Outer rotating ring with stance orbit nodes */}
      <group ref={outerRingRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 2.84, 32]} />
          <meshBasicMaterial color="#f472d0" transparent opacity={0.65} />
        </mesh>
        {/* Stance nodal markers */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 2.82, 0, Math.sin(angle) * 2.82]}
          >
            <boxGeometry args={[0.1, 0.05, 0.1]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
        ))}
      </group>

      {/* Inner counter-rotating ring */}
      <group ref={innerRingRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.53, 24]} />
          <meshBasicMaterial color="#fb7185" transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  );
}
