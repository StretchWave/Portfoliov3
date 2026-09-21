"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { AreaBounds } from "@/types/scene";

interface RoomBoundsVisualizerProps {
  bounds: AreaBounds;
  visible?: boolean;
}

/**
 * Renders glowing room boundary outline and corner bounds markers in edit viewport.
 * Editor-only: Never rendered in production runtime.
 */
export function RoomBoundsVisualizer({ bounds, visible = true }: RoomBoundsVisualizerProps) {
  const { minX, maxX, minZ, maxZ } = bounds;
  const height = 4.0;

  const lineGeometry = useMemo(() => {
    const points = [
      // Floor rectangle
      new THREE.Vector3(minX, 0.05, minZ),
      new THREE.Vector3(maxX, 0.05, minZ),
      new THREE.Vector3(maxX, 0.05, maxZ),
      new THREE.Vector3(minX, 0.05, maxZ),
      new THREE.Vector3(minX, 0.05, minZ),

      // Ceiling rectangle
      new THREE.Vector3(minX, height, minZ),
      new THREE.Vector3(maxX, height, minZ),
      new THREE.Vector3(maxX, height, maxZ),
      new THREE.Vector3(minX, height, maxZ),
      new THREE.Vector3(minX, height, minZ),
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [minX, maxX, minZ, maxZ, height]);

  const corners = useMemo(() => {
    return [
      [minX, minZ],
      [maxX, minZ],
      [maxX, maxZ],
      [minX, maxZ],
    ];
  }, [minX, maxX, minZ, maxZ]);

  if (!visible) return null;

  return (
    <group name="studio-room-bounds">
      {/* Perimeter lines */}
      <primitive
        object={
          new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({
              color: "#38bdf8",
              transparent: true,
              opacity: 0.5,
              linewidth: 2,
            }),
          )
        }
      />

      {/* Vertical corner pillars */}
      {corners.map(([x, z], i) => (
        <group key={`corner-${i}`} position={[x, height / 2, z]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, height, 8]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
