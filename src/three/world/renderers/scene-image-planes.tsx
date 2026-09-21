"use client";

import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import type { ImagePlaneObject } from "@/types/scene";

interface SceneImagePlanesProps {
  imagePlanes: readonly ImagePlaneObject[];
  onSelect?: (id: string) => void;
  onContextMenu?: (id: string, clientX: number, clientY: number) => void;
  selectedIds?: string[];
}

function SingleImagePlane({
  plane,
  isSelected,
  onSelect,
  onContextMenu,
}: {
  plane: ImagePlaneObject;
  isSelected: boolean;
  onSelect?: (id: string) => void;
  onContextMenu?: (id: string, clientX: number, clientY: number) => void;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!plane.imageUrl) {
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      plane.imageUrl,
      (loadedTex) => {
        if (!isMounted) return;
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTex);
      },
      undefined,
      () => {
        if (isMounted) setTexture(null);
      },
    );

    return () => {
      isMounted = false;
    };
  }, [plane.imageUrl]);

  const effectiveTexture = plane.imageUrl ? texture : null;

  const { position, rotation, scale } = plane.transform;
  const width = plane.width || 2;
  const height = plane.height || (width / (plane.aspectRatio || 1.777));
  const doubleSided = plane.doubleSided ?? true;
  const transparent = plane.transparent ?? true;

  return (
    <group
      position={[position[0], position[1], position[2]]}
      rotation={rotation ? [rotation[0], rotation[1], rotation[2]] : [0, 0, 0]}
      scale={scale ? [scale[0], scale[1], scale[2]] : [1, 1, 1]}
      onClick={(e) => {
        if (onSelect) {
          e.stopPropagation();
          onSelect(plane.id);
        }
      }}
      onContextMenu={(e) => {
        if (onContextMenu) {
          e.stopPropagation();
          onContextMenu(plane.id, e.clientX, e.clientY);
        }
      }}
    >
      <mesh castShadow receiveShadow>
        <planeGeometry args={[width, height]} />
        {effectiveTexture ? (
          <meshStandardMaterial
            map={effectiveTexture}
            side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
            transparent={transparent}
            opacity={plane.opacity ?? 1}
            roughness={plane.roughness ?? 0.6}
            metalness={0.1}
            emissive={plane.emissive ? "#ffffff" : "#000000"}
            emissiveIntensity={plane.emissiveIntensity ?? 0.2}
          />
        ) : (
          <meshStandardMaterial
            color="#27272a"
            wireframe={!plane.imageUrl}
            side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
            roughness={0.8}
          />
        )}
      </mesh>

      {/* Frame border when selected */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(width + 0.04, height + 0.04)]} />
          <lineBasicMaterial color="#22d3ee" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
}

export function SceneImagePlanes({
  imagePlanes,
  onSelect,
  onContextMenu,
  selectedIds = [],
}: SceneImagePlanesProps) {
  if (!imagePlanes || imagePlanes.length === 0) return null;

  return (
    <group>
      {imagePlanes.map((plane) => (
        <SingleImagePlane
          key={plane.id}
          plane={plane}
          isSelected={selectedIds.includes(plane.id)}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
        />
      ))}
    </group>
  );
}
