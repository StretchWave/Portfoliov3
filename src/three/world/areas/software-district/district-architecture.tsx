"use client";

import { Column, FrameRib, WallSegment } from "../../environment/architectural-modules";
import { CeilingPanelLight, LightRibbon } from "../../environment/environment-lighting";
import { getEnvironmentMaterials } from "../../environment/environment-materials";

/**
 * Server Lab Architecture:
 * Dense, ordered industrial geometry with server racks, overhead conduit trays,
 * and high-contrast vertical server bays flanking a central processing aisle.
 */
export function DistrictArchitecture() {
  const materials = getEnvironmentMaterials();

  return (
    <group>
      {/* Perimeter walls */}
      <WallSegment position={[0, 2.2, -8.6]} width={17.2} axis="x" railSide={1} />
      <WallSegment position={[-8.6, 2.2, -0.7]} width={16.0} axis="z" railSide={1} />
      <WallSegment position={[8.6, 2.2, -0.7]} width={16.0} axis="z" railSide={-1} />
      <WallSegment position={[-5.8, 2.2, 7.2]} width={5.6} axis="x" railSide={-1} />
      <WallSegment position={[5.8, 2.2, 7.2]} width={5.6} axis="x" railSide={-1} />

      {/* Frame ribs along the walls */}
      {[-7.8, -4.2, -0.6, 3.0, 6.2].map((z) => (
        <FrameRib key={`soft-rib-l-${z}`} position={[-8.75, 2.2, z]} axis="z" />
      ))}
      {[-7.8, -4.2, -0.6, 3.0, 6.2].map((z) => (
        <FrameRib key={`soft-rib-r-${z}`} position={[8.75, 2.2, z]} axis="z" />
      ))}

      {/* Server racks along the left bay */}
      {[-6.0, -3.5, -1.0, 1.5, 4.0].map((z) => (
        <group key={`rack-left-${z}`} position={[-7.4, 1.6, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.2, 3.2, 1.6]} />
            <primitive object={materials.structural} attach="material" />
          </mesh>
          {/* Server rack status indicator lights */}
          <mesh position={[0.61, 0.4, 0]}>
            <planeGeometry args={[0.02, 2.4]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0.61, 0, 0.4]}>
            <boxGeometry args={[0.02, 0.08, 0.08]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
          <mesh position={[0.61, -0.3, 0.4]}>
            <boxGeometry args={[0.02, 0.08, 0.08]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      {/* Server racks along the right bay */}
      {[-6.0, -3.5, -1.0, 1.5, 4.0].map((z) => (
        <group key={`rack-right-${z}`} position={[7.4, 1.6, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.2, 3.2, 1.6]} />
            <primitive object={materials.structural} attach="material" />
          </mesh>
          {/* Server rack status indicator lights */}
          <mesh position={[-0.61, 0.4, 0]}>
            <planeGeometry args={[0.02, 2.4]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[-0.61, 0, 0.4]}>
            <boxGeometry args={[0.02, 0.08, 0.08]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
          <mesh position={[-0.61, -0.3, 0.4]}>
            <boxGeometry args={[0.02, 0.08, 0.08]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      {/* Central Server Core on the back wall */}
      <mesh position={[0, 2.3, -8.4]}>
        <boxGeometry args={[6.2, 2.4, 0.4]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>
      {/* Back wall data status matrix */}
      <mesh position={[0, 2.3, -8.18]}>
        <planeGeometry args={[5.8, 2.0]} />
        <meshBasicMaterial color="#0c253d" />
      </mesh>
      {/* Emissive telemetry line */}
      <mesh position={[0, 2.3, -8.16]}>
        <planeGeometry args={[5.2, 0.04]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Overhead Cable Trays / Gantries */}
      {[-4.5, 0, 4.5].map((z) => (
        <group key={`gantry-${z}`} position={[0, 4.1, z]}>
          <mesh castShadow>
            <boxGeometry args={[16.8, 0.2, 0.6]} />
            <primitive object={materials.structural} attach="material" />
          </mesh>
          <CeilingPanelLight position={[0, -0.11, 0]} width={5.0} depth={0.4} />
        </group>
      ))}

      {/* Longitudinal data spine light overhead */}
      <LightRibbon position={[0, 4.0, -0.6]} length={15.2} axis="z" color="#38bdf8" />

      {/* Entrance Gateway Columns */}
      <Column position={[-2.6, 0, 7.2]} accentCaps />
      <Column position={[2.6, 0, 7.2]} accentCaps />
    </group>
  );
}
