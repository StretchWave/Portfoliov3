"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { ColliderDefinition, SceneObject } from "@/types/scene";

interface ColliderVisualizerProps {
  objects: readonly SceneObject[];
  selectedObjectId: string | null;
  showColliders?: boolean;
  showTriggers?: boolean;
}

interface SingleColliderMeshProps {
  collider: ColliderDefinition;
  parentPosition: [number, number, number];
  parentRotation: [number, number, number];
  parentScale: [number, number, number];
  isSelected: boolean;
  showColliders: boolean;
  showTriggers: boolean;
}

function SingleColliderMesh({
  collider,
  parentPosition,
  parentRotation,
  parentScale,
  isSelected,
  showColliders,
  showTriggers,
}: SingleColliderMeshProps) {
  const isTrigger = Boolean(collider.isTrigger);

  if (!collider.enabled) return null;
  if (isTrigger && !showTriggers) return null;
  if (!isTrigger && !showColliders) return null;

  const color = isSelected
    ? "#f59e0b" // Amber for selected
    : isTrigger
      ? "#c084fc" // Purple for trigger
      : "#22d3ee"; // Cyan for physical collider

  const center = collider.center ?? [0, 0, 0];
  const rot = collider.rotation ?? [0, 0, 0];
  const size = collider.size ?? [1, 1, 1];
  const radius = collider.radius ?? 0.5;
  const height = collider.height ?? 1.0;

  return (
    <group position={parentPosition} rotation={parentRotation} scale={parentScale}>
      <group position={center} rotation={rot}>
        {collider.type === "box" && (
          <mesh>
            <boxGeometry args={size as [number, number, number]} />
            <meshBasicMaterial
              color={color}
              wireframe
              transparent
              opacity={isSelected ? 0.9 : 0.4}
            />
          </mesh>
        )}

        {collider.type === "sphere" && (
          <mesh>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshBasicMaterial
              color={color}
              wireframe
              transparent
              opacity={isSelected ? 0.9 : 0.4}
            />
          </mesh>
        )}

        {collider.type === "cylinder" && (
          <mesh>
            <cylinderGeometry args={[radius, radius, height, 16]} />
            <meshBasicMaterial
              color={color}
              wireframe
              transparent
              opacity={isSelected ? 0.9 : 0.4}
            />
          </mesh>
        )}

        {collider.type === "capsule" && (
          <mesh>
            <capsuleGeometry args={[radius, height, 8, 16]} />
            <meshBasicMaterial
              color={color}
              wireframe
              transparent
              opacity={isSelected ? 0.9 : 0.4}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

/**
 * Viewport overlay for visualizing physical and trigger colliders.
 * Editor-only: Never rendered in production runtime.
 */
export function ColliderVisualizer({
  objects,
  selectedObjectId,
  showColliders = true,
  showTriggers = true,
}: ColliderVisualizerProps) {
  if (!showColliders && !showTriggers) return null;

  return (
    <group name="studio-collider-visualizers">
      {objects.map((obj) => {
        const isSelected = obj.id === selectedObjectId;
        const pos = obj.transform.position;
        const rot = obj.transform.rotation ?? [0, 0, 0];
        const scl = obj.transform.scale ?? [1, 1, 1];

        if (obj.colliders && obj.colliders.length > 0) {
          return obj.colliders.map((col) => (
            <SingleColliderMesh
              key={`${obj.id}-${col.id}`}
              collider={col}
              parentPosition={pos as [number, number, number]}
              parentRotation={rot as [number, number, number]}
              parentScale={scl as [number, number, number]}
              isSelected={isSelected}
              showColliders={showColliders}
              showTriggers={showTriggers}
            />
          ));
        }

        // Implicit trigger-volume representation
        if (obj.type === "trigger-volume") {
          const trig = obj as any;
          const trigCollider: ColliderDefinition = {
            id: `${obj.id}-trigger`,
            enabled: true,
            type: "box",
            size: trig.dimensions ?? [2, 2, 2],
            isTrigger: true,
          };
          return (
            <SingleColliderMesh
              key={`${obj.id}-trigger`}
              collider={trigCollider}
              parentPosition={pos as [number, number, number]}
              parentRotation={rot as [number, number, number]}
              parentScale={scl as [number, number, number]}
              isSelected={isSelected}
              showColliders={showColliders}
              showTriggers={showTriggers}
            />
          );
        }

        return null;
      })}
    </group>
  );
}
