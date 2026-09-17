"use client";

import type { DecorationObject } from "@/types/scene";

import { HolographicStanceRings } from "../areas/creative-workshop/holographic-stance-rings";
import { TopographicContourGrid } from "../areas/intelligence-observatory/topographic-contour-grid";
import { ServerDataConduit } from "../areas/software-district/server-data-conduit";
import { getEnvironmentMaterials } from "../environment/environment-materials";

export interface SceneDecorationsProps {
  decorations: readonly DecorationObject[];
  onSelect?: (id: string) => void;
  onContextMenu?: (id: string, clientX: number, clientY: number) => void;
}

function ServerRack({
  side,
}: {
  side?: "left" | "right";
}) {
  const materials = getEnvironmentMaterials();
  const isRight = side === "right";
  const xSign = isRight ? -1 : 1;

  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 3.2, 1.6]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>
      {/* Server rack status indicator vertical strip */}
      <mesh position={[0.61 * xSign, 0.4, 0]}>
        <planeGeometry args={[0.02, 2.4]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      {/* Green active status LED */}
      <mesh position={[0.61 * xSign, 0, 0.4]}>
        <boxGeometry args={[0.02, 0.08, 0.08]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      {/* Blue telemetry LED */}
      <mesh position={[0.61 * xSign, -0.3, 0.4]}>
        <boxGeometry args={[0.02, 0.08, 0.08]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}

function DataTerminal() {
  const materials = getEnvironmentMaterials();

  return (
    <group>
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
  );
}

/**
 * Data-driven decoration renderer.
 * Dispatches to kinetic or complex compound decorative modules.
 */
export function SceneDecorations({
  decorations,
  onSelect,
  onContextMenu,
}: SceneDecorationsProps) {
  return (
    <group name="scene-decorations">
      {decorations.map((dec) => {
        if (dec.visible === false) return null;

        const { position, rotation, scale } = dec.transform;
        const rotEuler = rotation
          ? ([rotation[0], rotation[1], rotation[2]] as [number, number, number])
          : undefined;
        const scaleVec = scale
          ? ([scale[0], scale[1], scale[2]] as [number, number, number])
          : undefined;

        let content = null;
        switch (dec.moduleType) {
          case "server-data-conduit":
            content = <ServerDataConduit />;
            break;

          case "server-rack":
            content = <ServerRack side={dec.props?.side as "left" | "right" | undefined} />;
            break;

          case "data-terminal":
            content = <DataTerminal />;
            break;

          case "topographic-contour-grid":
            content = <TopographicContourGrid />;
            break;

          case "holographic-stance-rings":
            content = <HolographicStanceRings />;
            break;

          default:
            return null;
        }

        return (
          <group
            key={dec.id}
            position={position}
            rotation={rotEuler}
            scale={scaleVec}
            onClick={(e) => {
              if (onSelect) {
                e.stopPropagation();
                onSelect(dec.id);
              }
            }}
            onContextMenu={(e) => {
              if (onContextMenu) {
                e.stopPropagation();
                onContextMenu(dec.id, e.nativeEvent.clientX, e.nativeEvent.clientY);
              }
            }}
          >
            {content}
          </group>
        );
      })}
    </group>
  );
}
