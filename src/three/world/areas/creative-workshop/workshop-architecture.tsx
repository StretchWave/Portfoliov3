"use client";

import { Column, FrameRib, WallSegment } from "../../environment/architectural-modules";
import { CeilingPanelLight, LightRibbon } from "../../environment/environment-lighting";
import { getEnvironmentMaterials } from "../../environment/environment-materials";

/**
 * Creative Workshop & Interaction Arena Architecture:
 * An open, vibrant creative laboratory featuring exposed structural trusses,
 * combat testing ring markers on the floor, and kinetic experiment staging.
 */
export function WorkshopArchitecture() {
  const materials = getEnvironmentMaterials();

  return (
    <group>
      {/* Perimeter walls */}
      <WallSegment position={[0, 2.4, -9.0]} width={18.0} axis="x" railSide={1} />
      <WallSegment position={[-9.0, 2.4, -0.8]} width={16.4} axis="z" railSide={1} />
      <WallSegment position={[9.0, 2.4, -0.8]} width={16.4} axis="z" railSide={-1} />
      <WallSegment position={[-6.0, 2.4, 7.4]} width={6.0} axis="x" railSide={-1} />
      <WallSegment position={[6.0, 2.4, 7.4]} width={6.0} axis="x" railSide={-1} />

      {/* Frame ribs */}
      {[-8.0, -4.0, 0, 4.0, 7.0].map((z) => (
        <FrameRib key={`work-rib-l-${z}`} position={[-9.15, 2.4, z]} axis="z" />
      ))}
      {[-8.0, -4.0, 0, 4.0, 7.0].map((z) => (
        <FrameRib key={`work-rib-r-${z}`} position={[9.15, 2.4, z]} axis="z" />
      ))}

      {/* Interactive Combat / Test Ring on the Floor */}
      <mesh position={[0, 0.02, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.28, 32]} />
        <meshBasicMaterial color="#f472d0" />
      </mesh>
      <mesh position={[0, 0.02, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 1.86, 32]} />
        <meshBasicMaterial color="#f43f5e" />
      </mesh>

      {/* Workshop Staging Bays (North Wall) */}
      <mesh position={[0, 2.2, -8.7]}>
        <boxGeometry args={[8.4, 1.8, 0.3]} />
        <primitive object={materials.displayGlass} attach="material" />
      </mesh>
      <mesh position={[0, 2.2, -8.52]}>
        <planeGeometry args={[8.0, 1.4]} />
        <meshBasicMaterial color="#2a0d24" />
      </mesh>
      {/* Workshop display accent strip */}
      <mesh position={[0, 3.15, -8.5]}>
        <planeGeometry args={[8.0, 0.05]} />
        <meshBasicMaterial color="#f472d0" />
      </mesh>

      {/* Exposed Overhead Truss Beams */}
      {[-4.0, 1.0].map((z) => (
        <group key={`truss-${z}`} position={[0, 4.3, z]}>
          <mesh castShadow>
            <boxGeometry args={[17.4, 0.24, 0.5]} />
            <primitive object={materials.structural} attach="material" />
          </mesh>
          {/* Diagonal truss braces */}
          {[-6.0, -3.0, 0, 3.0, 6.0].map((x) => (
            <mesh key={`truss-diag-${x}`} position={[x, -0.3, 0]}>
              <boxGeometry args={[0.12, 0.5, 0.12]} />
              <primitive object={materials.structural} attach="material" />
            </mesh>
          ))}
          <CeilingPanelLight position={[0, -0.13, 0]} width={6.0} depth={0.4} />
        </group>
      ))}

      {/* Longitudinal Magenta Neon Spine */}
      <LightRibbon position={[0, 4.2, -0.75]} length={15.5} axis="z" color="#f472d0" />

      {/* Structural Columns */}
      <Column position={[-3.2, 0, 7.4]} accentCaps />
      <Column position={[3.2, 0, 7.4]} accentCaps />
      <Column position={[-7.5, 0, -1.8]} accentCaps />
      <Column position={[7.5, 0, -1.8]} accentCaps />
    </group>
  );
}
