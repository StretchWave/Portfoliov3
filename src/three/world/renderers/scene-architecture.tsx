"use client";

import { useMemo } from "react";
import * as THREE from "three";

import type { ArchitectureObject, MeshPrimitiveProps } from "@/types/scene";

import {
  Column,
  FrameRib,
  WallSegment,
} from "../environment/architectural-modules";
import {
  CeilingPanelLight,
  LightRibbon,
} from "../environment/environment-lighting";
import {
  type EnvironmentMaterials,
  getEnvironmentMaterials,
} from "../environment/environment-materials";

export interface SceneArchitectureProps {
  objects: readonly ArchitectureObject[];
  onSelect?: (id: string) => void;
  onContextMenu?: (id: string, clientX: number, clientY: number) => void;
}

function MeshPrimitiveRenderer({
  obj,
  materials,
}: {
  obj: ArchitectureObject & { moduleType: "mesh-primitive" };
  materials: EnvironmentMaterials;
}) {
  const { geometry, args, material, castShadow, receiveShadow } = obj.props;
  const { position, rotation, scale } = obj.transform;

  // Render geometry element
  const geomElement = useMemo(() => {
    switch (geometry) {
      case "box":
        return <boxGeometry args={args as [number, number, number]} />;
      case "plane":
        return <planeGeometry args={args as [number, number]} />;
      case "cylinder":
        return <cylinderGeometry args={args as [number, number, number, number]} />;
      case "sphere":
        return <sphereGeometry args={args as [number, number, number]} />;
      case "cone":
        return <coneGeometry args={args as [number, number, number]} />;
      case "torus":
        return <torusGeometry args={args as [number, number, number, number]} />;
      case "ring":
        return <ringGeometry args={args as [number, number, number]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [geometry, args]);

  // Render material element
  const matElement = useMemo(() => {
    if (typeof material === "string") {
      const shared = materials[material as keyof EnvironmentMaterials];
      if (shared) {
        return <primitive object={shared} attach="material" />;
      }
      return <meshStandardMaterial color="#ffffff" />;
    }

    if (material.basicMaterial) {
      return (
        <meshBasicMaterial
          color={material.color}
          transparent={material.transparent}
          opacity={material.opacity}
        />
      );
    }

    return (
      <meshStandardMaterial
        color={material.color}
        emissive={material.emissive}
        emissiveIntensity={material.emissiveIntensity}
        roughness={material.roughness}
        metalness={material.metalness}
        transparent={material.transparent}
        opacity={material.opacity}
      />
    );
  }, [material, materials]);

  return (
    <mesh
      position={position}
      rotation={rotation ? [rotation[0], rotation[1], rotation[2]] : undefined}
      scale={scale ? [scale[0], scale[1], scale[2]] : undefined}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      {geomElement}
      {matElement}
    </mesh>
  );
}

/**
 * Data-driven architecture renderer.
 * Maps serializable architecture objects directly to reusable world modules.
 */
export function SceneArchitecture({
  objects,
  onSelect,
  onContextMenu,
}: SceneArchitectureProps) {
  const materials = getEnvironmentMaterials();
  const isInteractive = Boolean(onSelect || onContextMenu);

  return (
    <group name="scene-architecture">
      {objects.map((obj) => {
        if (obj.visible === false) return null;

        let content = null;
        switch (obj.moduleType) {
          case "wall-segment":
            content = (
              <WallSegment
                position={obj.transform.position}
                width={obj.props.width}
                axis={obj.props.axis}
                height={obj.props.height}
                thickness={obj.props.thickness}
                rail={obj.props.rail}
                railSide={obj.props.railSide}
              />
            );
            break;

          case "column":
            content = (
              <Column
                position={obj.transform.position}
                height={obj.props.height}
                size={obj.props.size}
                accentCaps={obj.props.accentCaps}
              />
            );
            break;

          case "frame-rib":
            content = (
              <FrameRib
                position={obj.transform.position}
                height={obj.props.height}
                axis={obj.props.axis}
                thickness={obj.props.thickness}
              />
            );
            break;

          case "ceiling-panel-light":
            content = (
              <CeilingPanelLight
                position={obj.transform.position}
                width={obj.props.width}
                depth={obj.props.depth}
              />
            );
            break;

          case "light-ribbon":
            content = (
              <LightRibbon
                position={obj.transform.position}
                length={obj.props.length}
                axis={obj.props.axis}
                color={obj.props.color}
              />
            );
            break;

          case "mesh-primitive":
            content = (
              <MeshPrimitiveRenderer
                obj={obj as ArchitectureObject & { moduleType: "mesh-primitive" }}
                materials={materials}
              />
            );
            break;

          default:
            return null;
        }

        if (!isInteractive) {
          return <group key={obj.id}>{content}</group>;
        }

        return (
          <group
            key={obj.id}
            onClick={(e) => {
              if (onSelect) {
                e.stopPropagation();
                onSelect(obj.id);
              }
            }}
            onContextMenu={(e) => {
              if (onContextMenu) {
                e.stopPropagation();
                onContextMenu(obj.id, e.nativeEvent.clientX, e.nativeEvent.clientY);
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
