"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";

import { useInteraction } from "@/three/interaction/interaction-provider";
import type { WorldPosition } from "@/three/interaction/interaction-types";
import { useInteractable } from "@/three/interaction/use-interactable";
import { getEnvironmentMaterials } from "@/three/world/environment/environment-materials";
import type { WorldAreaId } from "@/types/portfolio";

export interface PortalGatewayProps {
  targetArea: WorldAreaId | string;
  targetLabel: string;
  subtitle?: string;
  position: WorldPosition;
  rotation?: [number, number, number];
  accent?: string;
}

/**
 * A spatial gateway archway that allows visitors to navigate between world areas.
 * Built using the shared environment language with emissive portal threshold.
 */
export function PortalGateway({
  targetArea,
  targetLabel,
  subtitle = "World Portal",
  position,
  rotation = [0, 0, 0],
  accent = "#68e4ff",
}: PortalGatewayProps) {
  const { requestInteraction } = useInteraction();
  const materials = getEnvironmentMaterials();

  const definition = useMemo(
    () => ({
      id: `portal:${targetArea}`,
      label: `Travel to ${targetLabel}`,
      hint: "Enter Portal",
      position,
      range: 2.8,
      event: { kind: "travel-to-area" as const, targetArea, label: targetLabel },
    }),
    [position, targetArea, targetLabel]
  );

  useInteractable(definition);

  return (
    <group
      position={[...position]}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        requestInteraction(definition.id);
      }}
    >
      {/* Archway base plinths */}
      <mesh castShadow receiveShadow position={[-1.4, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.6]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>
      <mesh castShadow receiveShadow position={[1.4, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.6]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>

      {/* Vertical columns */}
      <mesh castShadow position={[-1.4, 1.8, 0]}>
        <boxGeometry args={[0.36, 2.8, 0.46]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>
      <mesh castShadow position={[1.4, 1.8, 0]}>
        <boxGeometry args={[0.36, 2.8, 0.46]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>

      {/* Emissive inner light strips along columns */}
      <mesh position={[-1.2, 1.8, 0]}>
        <boxGeometry args={[0.04, 2.7, 0.2]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <mesh position={[1.2, 1.8, 0]}>
        <boxGeometry args={[0.04, 2.7, 0.2]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      {/* Overhead lintel beam */}
      <mesh castShadow position={[0, 3.3, 0]}>
        <boxGeometry args={[3.2, 0.42, 0.52]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>
      {/* Emissive bottom trim on lintel */}
      <mesh position={[0, 3.07, 0]}>
        <boxGeometry args={[2.5, 0.04, 0.2]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      {/* Portal energy veil */}
      <mesh position={[0, 1.65, 0]}>
        <planeGeometry args={[2.3, 2.7]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.6}
          roughness={0.2}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Ground threshold guide marker */}
      <mesh position={[0, 0.02, 0]}>
        <planeGeometry args={[2.2, 0.6]} />
        <meshBasicMaterial color={accent} transparent opacity={0.5} />
      </mesh>

      {/* Portal sign overhead */}
      <Html center position={[0, 3.75, 0]} distanceFactor={8} sprite>
        <div className="exhibit-label portal-label" style={{ borderColor: accent }}>
          <span style={{ color: accent }}>{subtitle}</span>
          <strong>{targetLabel} →</strong>
        </div>
      </Html>

      {/* Ambient threshold lighting */}
      <pointLight color={accent} intensity={8} distance={5} position={[0, 1.8, 0.4]} />
    </group>
  );
}
