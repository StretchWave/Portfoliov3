"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";

import type { ExhibitPresentation } from "@/types/portfolio";
import { useInteraction } from "@/three/interaction/interaction-provider";
import type { WorldPosition } from "@/three/interaction/interaction-types";
import { useInteractable } from "@/three/interaction/use-interactable";

interface ProjectExhibitProps {
  projectId: string;
  projectName: string;
  presentation: ExhibitPresentation;
  position: WorldPosition;
  accent: string;
  interactionRange: number;
}

/**
 * A reusable visual shell for a project. It deliberately receives data-shaped
 * props rather than importing any particular project record.
 */
export function ProjectExhibit({
  projectId,
  projectName,
  presentation,
  position,
  accent,
  interactionRange,
}: ProjectExhibitProps) {
  const { requestInteraction } = useInteraction();
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
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[1.45, 1.7, 0.35, 8]} />
        <meshStandardMaterial color="#142c46" metalness={0.58} roughness={0.38} />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <boxGeometry args={[1.7, 1.25, 0.5]} />
        <meshStandardMaterial color="#0f2136" metalness={0.4} roughness={0.34} />
      </mesh>
      <mesh position={[0, 1.04, 0.27]}>
        <planeGeometry args={[1.28, terminalLike ? 0.76 : 0.93]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.6} roughness={0.25} />
      </mesh>
      {terminalLike ? (
        <>
          <mesh position={[0, 0.49, 0.32]}><boxGeometry args={[1.25, 0.06, 0.05]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.65} /></mesh>
          <mesh position={[-0.38, 0.28, 0.32]}><boxGeometry args={[0.37, 0.04, 0.04]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.65} /></mesh>
        </>
      ) : null}
      <Html center position={[0, 1.86, 0]} distanceFactor={9} sprite>
        <div className="exhibit-label" style={{ borderColor: accent }}>
          <span style={{ color: accent }}>{presentation.replaceAll("-", " ")}</span>
          <strong>{projectName}</strong>
        </div>
      </Html>
      <pointLight color={accent} intensity={2.2} distance={3.5} position={[0, 1.3, 0.45]} />
    </group>
  );
}
