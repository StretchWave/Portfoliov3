"use client";

import { useMemo } from "react";

import type { ExhibitPresentation } from "@/types/portfolio";
import { useInteraction } from "@/three/interaction/interaction-provider";
import type { WorldPosition } from "@/three/interaction/interaction-types";
import { useInteractable } from "@/three/interaction/use-interactable";
import { getEnvironmentMaterials } from "@/three/world/environment/environment-materials";
import { HolographicDisplay } from "./holographic-display";

interface ProjectExhibitProps {
  projectId: string;
  projectName: string;
  presentation: ExhibitPresentation;
  position: WorldPosition;
  accent: string;
  interactionRange: number;
}

/**
 * A reusable visual shell for a project — a display plinth from the shared
 * environment language. It deliberately receives data-shaped props rather
 * than importing any particular project record: the accent color is the only
 * project-configured visual input.
 */
export function ProjectExhibit({
  projectId,
  projectName,
  presentation,
  position,
  accent,
  interactionRange,
}: ProjectExhibitProps) {
  const { focused, requestInteraction } = useInteraction();
  const materials = getEnvironmentMaterials();
  const definition = useMemo(() => ({
    id: `project-exhibit:${projectId}`,
    label: projectName,
    hint: "Inspect exhibit",
    position,
    range: interactionRange,
    event: { kind: "open-project" as const, projectId },
  }), [interactionRange, position, projectId, projectName]);
  useInteractable(definition);

  const terminalLike = presentation === "terminal";

  return (
    <group position={[...position]} onClick={(event) => { event.stopPropagation(); requestInteraction(definition.id); }}>
      {/* Base plinth in the shared structural material. */}
      <mesh castShadow receiveShadow position={[0, 0.28, 0]}>
        <cylinderGeometry args={[1.15, 1.35, 0.56, 8]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>
      {/* Accent under-glow ring marking the plinth as interactive. */}
      <mesh position={[0, 0.585, 0]}>
        <cylinderGeometry args={[1.28, 1.28, 0.05, 8]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      {/* Stem and display housing. */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <boxGeometry args={[0.46, 0.9, 0.46]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>
      <mesh castShadow position={[0, 1.72, 0]}>
        <boxGeometry args={[1.6, 1.05, 0.34]} />
        <primitive object={materials.displayGlass} attach="material" />
      </mesh>
      {/* The screen surface carries the project accent. */}
      <mesh position={[0, 1.72, 0.181]}>
        <planeGeometry args={[1.34, terminalLike ? 0.62 : 0.82]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.5} roughness={0.3} />
      </mesh>
      {terminalLike ? (
        <>
          <mesh position={[0, 1.42, 0.18]}>
            <boxGeometry args={[1.2, 0.05, 0.3]} />
            <primitive object={materials.displayGlass} attach="material" />
          </mesh>
          {[-0.3, 0, 0.3].map((x) => (
            <mesh key={`status-${x}`} position={[x, 1.89, 0.19]}>
              <boxGeometry args={[0.09, 0.03, 0.02]} />
              <meshBasicMaterial color={accent} />
            </mesh>
          ))}
        </>
      ) : null}
      <HolographicDisplay
        label={projectName}
        category={presentation}
        accent={accent}
        isFocused={focused?.id === definition.id}
      />
      <pointLight color={accent} intensity={6} distance={4.5} position={[0, 2.1, 0.55]} />
    </group>
  );
}