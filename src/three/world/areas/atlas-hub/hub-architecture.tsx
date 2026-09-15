"use client";

import { Column, FrameRib, WallSegment } from "../../environment/architectural-modules";
import { CeilingPanelLight } from "../../environment/environment-lighting";
import { getEnvironmentMaterials } from "../../environment/environment-materials";

/**
 * The Atlas Hub is a compact exhibition hall: a single volume framed by
 * structural walls, a central light gantry over the circulation spine, and
 * two exhibit positions on the open floor. All structural surfaces come from
 * the shared environment language (materials + architectural modules).
 *
 * Layout (top-down, spawn at z = +7.5 looking toward -Z):
 *
 *   z=-9   ┌── back wall (status panel + ribs) ──────────────────┐
 *   z=-6   │  [column]                                [column]   │  gantry span
 *   z=-2.6 │      exhibit (-4.2)          exhibit (+4.2)         │
 *   z= 0   │              circulation spine (x = 0)              │
 *   z= 4   │  [column]                                [column]   │
 *   z= 7.3 │  wall ── [pillar]  entrance opening  [pillar] ── wall
 *          └─────────────────────────────────────────────────────┘
 */
export function HubArchitecture() {
  const materials = getEnvironmentMaterials();

  return (
    <group>
      {/* Perimeter walls with the luminous data rail on their inner faces. */}
      <WallSegment position={[0, 2.2, -8.9]} width={17.7} axis="x" railSide={1} />
      <WallSegment position={[-8.9, 2.2, -0.7]} width={16.4} axis="z" railSide={1} />
      <WallSegment position={[8.9, 2.2, -0.7]} width={16.4} axis="z" railSide={-1} />
      <WallSegment position={[-6.575, 2.2, 7.3]} width={4.55} axis="x" railSide={-1} />
      <WallSegment position={[6.575, 2.2, 7.3]} width={4.55} axis="x" railSide={-1} />

      {/* Frame ribs punctuating the walls. */}
      {[-8.3, -4.7, -1.1, 2.5, 6.1].map((z) => (
        <FrameRib key={`rib-left-${z}`} position={[-9.06, 2.2, z]} axis="z" />
      ))}
      {[-8.3, -4.7, -1.1, 2.5, 6.1].map((z) => (
        <FrameRib key={`rib-right-${z}`} position={[9.06, 2.2, z]} axis="z" />
      ))}
      {[-6.9, -3.45, 0, 3.45, 6.9].map((x) => (
        <FrameRib key={`rib-back-${x}`} position={[x, 2.2, -9.06]} axis="x" />
      ))}

      {/* Hub status panel on the back wall: a dim wall display. */}
      <mesh position={[0, 2.1, -8.73]}>
        <boxGeometry args={[6.8, 1.4, 0.06]} />
        <meshBasicMaterial color="#0d2b46" />
      </mesh>

      {/* Entrance: pillars and lintel (the threshold marker lives in navigation). */}
      <Column position={[-3.8, 0, 7.3]} accentCaps />
      <Column position={[3.8, 0, 7.3]} accentCaps />
      <mesh castShadow position={[0, 4.25, 7.3]}>
        <boxGeometry args={[7.9, 0.3, 0.3]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>

      {/* Gantry supports framing the circulation spine. */}
      <Column position={[-5.6, 0, -6]} accentCaps />
      <Column position={[5.6, 0, -6]} accentCaps />
      <Column position={[-5.6, 0, 4]} accentCaps />
      <Column position={[5.6, 0, 4]} accentCaps />

      {/* Light gantry: two long beams, three cross beams, luminous panels. */}
      <mesh castShadow position={[-5.6, 4.34, -1]}>
        <boxGeometry args={[0.26, 0.26, 10.4]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>
      <mesh castShadow position={[5.6, 4.34, -1]}>
        <boxGeometry args={[0.26, 0.26, 10.4]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>
      {[-4.6, -1.4, 1.8].map((z) => (
        <mesh key={`gantry-cross-${z}`} castShadow position={[0, 4.3, z]}>
          <boxGeometry args={[11.2, 0.22, 0.22]} />
          <primitive object={materials.structural} attach="material" />
        </mesh>
      ))}
      <CeilingPanelLight position={[0, 4.13, -3.4]} width={6.2} depth={1} />
      <CeilingPanelLight position={[0, 4.13, 0.4]} width={6.2} depth={1} />
    </group>
  );
}