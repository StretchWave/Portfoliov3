"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Kinetic data packets that travel along the overhead cable conduits
 * between server bays and the central server core.
 */
export function ServerDataConduit() {
  const groupRef = useRef<THREE.Group>(null);

  // 6 data packet nodes travelling along the overhead line at y = 4.0, x = 0
  const packets = useMemo(() => [
    { offset: 0, speed: 2.2 },
    { offset: 2.5, speed: 2.2 },
    { offset: 5.0, speed: 2.2 },
    { offset: 7.5, speed: 2.2 },
    { offset: 10.0, speed: 2.2 },
    { offset: 12.5, speed: 2.2 },
  ], []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const children = groupRef.current.children;

    for (let i = 0; i < children.length; i++) {
      const mesh = children[i];
      // Travel from entrance z=6.5 towards back wall z=-8.0
      mesh.position.z -= packets[i].speed * delta;
      if (mesh.position.z < -8.2) {
        mesh.position.z = 6.8;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {packets.map((p, idx) => (
        <mesh key={idx} position={[0, 4.0, 6.8 - p.offset]}>
          <boxGeometry args={[0.08, 0.08, 0.35]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      ))}
    </group>
  );
}
