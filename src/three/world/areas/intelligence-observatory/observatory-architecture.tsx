"use client";

import { Column, FrameRib, WallSegment } from "../../environment/architectural-modules";
import { CeilingPanelLight } from "../../environment/environment-lighting";
import { getEnvironmentMaterials } from "../../environment/environment-materials";

/**
 * Intelligent Systems Observatory:
 * A calm, contemplative observation deck with panoramic display surfaces,
 * telemetry monitoring arrays, and deep indigo data visualization lighting.
 */
export function ObservatoryArchitecture() {
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
        <FrameRib key={`obs-rib-l-${z}`} position={[-9.15, 2.4, z]} axis="z" />
      ))}
      {[-8.0, -4.0, 0, 4.0, 7.0].map((z) => (
        <FrameRib key={`obs-rib-r-${z}`} position={[9.15, 2.4, z]} axis="z" />
      ))}

      {/* Observation Deck Panoramic Telemetry Wall (Back Wall) */}
      <mesh position={[0, 2.6, -8.7]}>
        <boxGeometry args={[11.5, 3.2, 0.4]} />
        <primitive object={materials.displayGlass} attach="material" />
      </mesh>
      {/* Primary Data Screen Surface */}
      <mesh position={[0, 2.6, -8.48]}>
        <planeGeometry args={[10.8, 2.8]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>
      {/* Horizontal Data Scanlines */}
      {[-0.8, 0, 0.8].map((y) => (
        <mesh key={`scanline-${y}`} position={[0, 2.6 + y, -8.46]}>
          <planeGeometry args={[10.2, 0.03]} />
          <meshBasicMaterial color="#818cf8" />
        </mesh>
      ))}

      {/* Flanking Data Terminals */}
      <group position={[-5.8, 1.2, -4.5]} rotation={[0, Math.PI / 6, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 2.4, 0.4]} />
          <primitive object={materials.structural} attach="material" />
        </mesh>
        <mesh position={[0, 0.3, 0.22]}>
          <planeGeometry args={[1.5, 1.4]} />
          <meshBasicMaterial color="#1e1b4b" />
        </mesh>
        <mesh position={[0, -0.2, 0.23]}>
          <planeGeometry args={[1.2, 0.04]} />
          <meshBasicMaterial color="#818cf8" />
        </mesh>
      </group>

      <group position={[5.8, 1.2, -4.5]} rotation={[0, -Math.PI / 6, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 2.4, 0.4]} />
          <primitive object={materials.structural} attach="material" />
        </mesh>
        <mesh position={[0, 0.3, 0.22]}>
          <planeGeometry args={[1.5, 1.4]} />
          <meshBasicMaterial color="#1e1b4b" />
        </mesh>
        <mesh position={[0, -0.2, 0.23]}>
          <planeGeometry args={[1.2, 0.04]} />
          <meshBasicMaterial color="#818cf8" />
        </mesh>
      </group>

      {/* Observation Columns */}
      <Column position={[-3.8, 0, 1.5]} accentCaps />
      <Column position={[3.8, 0, 1.5]} accentCaps />
      <Column position={[-2.8, 0, 7.4]} accentCaps />
      <Column position={[2.8, 0, 7.4]} accentCaps />

      {/* Overhead Ring / Halo Lighting */}
      <mesh position={[0, 4.4, -2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.2, 0.06, 8, 32]} />
        <meshBasicMaterial color="#818cf8" />
      </mesh>

      {/* Overhead central illumination */}
      <CeilingPanelLight position={[0, 4.3, 2.0]} width={4.2} depth={0.6} />
    </group>
  );
}
