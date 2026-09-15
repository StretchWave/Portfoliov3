"use client";

import { getEnvironmentMaterials } from "./environment-materials";

/**
 * Reusable structural building blocks of the Atlas architectural language.
 * Areas compose these modules; they never hardcode area layout.
 */

const DEFAULT_WALL_HEIGHT = 4.4;
const DEFAULT_WALL_THICKNESS = 0.3;

interface WallSegmentProps {
  position: readonly [number, number, number];
  /** Width along the wall axis. */
  width: number;
  axis: "x" | "z";
  height?: number;
  thickness?: number;
  /** Render the luminous data rail on the inner face. */
  rail?: boolean;
  /** Which way the interior sits along the axis perpendicular to the wall: -1 or 1. */
  railSide?: -1 | 1;
}

/** A wall panel with the language's luminous trim rail on its inner face. */
export function WallSegment({ position, width, axis, height = DEFAULT_WALL_HEIGHT, thickness = DEFAULT_WALL_THICKNESS, rail = true, railSide = 1 }: WallSegmentProps) {
  const materials = getEnvironmentMaterials();
  const [x, y, z] = position;
  const offset = (thickness / 2 + 0.015) * railSide;
  const railPosition: readonly [number, number, number] =
    axis === "x" ? [x, 2.9, z + offset] : [x + offset, 2.9, z];
  const railLength = width - 0.35;

  return (
    <group>
      <mesh castShadow receiveShadow position={[...position]}>
        <boxGeometry args={axis === "x" ? [width, height, thickness] : [thickness, height, width]} />
        <primitive object={materials.wallPanel} attach="material" />
      </mesh>
      {rail ? (
        <mesh position={[...railPosition]}>
          <boxGeometry args={axis === "x" ? [railLength, 0.05, 0.05] : [0.05, 0.05, railLength]} />
          <primitive object={materials.trim} attach="material" />
        </mesh>
      ) : null}
    </group>
  );
}

interface ColumnProps {
  position: readonly [number, number, number];
  height?: number;
  size?: number;
  /** Emissive base ring and cap for landmark columns. */
  accentCaps?: boolean;
}

/** A structural column with optional luminous base/cap details. */
export function Column({ position, height = DEFAULT_WALL_HEIGHT, size = 0.5, accentCaps = false }: ColumnProps) {
  const materials = getEnvironmentMaterials();
  const [x, y, z] = position;

  return (
    <group position={[x, y, z]}>
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[size, height, size]} />
        <primitive object={materials.structural} attach="material" />
      </mesh>
      {accentCaps ? (
        <>
          <mesh position={[0, 0.07, 0]}>
            <boxGeometry args={[size + 0.14, 0.14, size + 0.14]} />
            <primitive object={materials.trim} attach="material" />
          </mesh>
          <mesh position={[0, height - 0.07, 0]}>
            <boxGeometry args={[size + 0.14, 0.14, size + 0.14]} />
            <primitive object={materials.trim} attach="material" />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

interface FrameRibProps {
  position: readonly [number, number, number];
  height?: number;
  axis: "x" | "z";
  thickness?: number;
}

/** A vertical frame rib that punctuates wall surfaces. */
export function FrameRib({ position, height = DEFAULT_WALL_HEIGHT, axis, thickness = 0.18 }: FrameRibProps) {
  const materials = getEnvironmentMaterials();
  return (
    <mesh castShadow position={[...position]}>
      <boxGeometry args={axis === "x" ? [thickness, height, 0.18] : [0.18, height, thickness]} />
      <primitive object={materials.structural} attach="material" />
    </mesh>
  );
}