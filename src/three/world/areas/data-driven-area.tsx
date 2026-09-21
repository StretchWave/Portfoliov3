"use client";

import { useEffect, useMemo } from "react";

import { globalCollisionWorld } from "@/lib/collision-world";
import { getAreaScene } from "@/data/scenes";
import { ExhibitRegistry } from "@/three/exhibits/exhibit-registry";
import { InteractionDetector } from "@/three/interaction/interaction-detector";
import { ExplorerController } from "@/three/player/explorer-controller";
import { AtmosphericParticles } from "@/three/world/environment/atmospheric-particles";
import { WorldEnvironment } from "@/three/world/environment/world-environment";
import { SceneArchitecture } from "@/three/world/renderers/scene-architecture";
import { SceneDecorations } from "@/three/world/renderers/scene-decorations";
import { SceneLights } from "@/three/world/renderers/scene-lights";
import { ScenePortals } from "@/three/world/renderers/scene-portals";
import { SceneImagePlanes } from "@/three/world/renderers/scene-image-planes";
import { InteractiveObjectsRegistrar } from "@/three/interaction/interactive-objects-registrar";
import type { WorldAreaId } from "@/types/portfolio";
import type {
  ArchitectureObject,
  AreaSceneDefinition,
  DecorationObject,
  EnvironmentConfig,
  ImagePlaneObject,
  PointLightObject,
  PortalObject,
} from "@/types/scene";

export interface DataDrivenAreaProps {
  areaId?: WorldAreaId;
  scene?: AreaSceneDefinition;
  environmentConfig?: EnvironmentConfig;
}

/**
 * Universal data-driven area composition root.
 * Consumes an AreaSceneDefinition and mounts architecture, lights, portals,
 * exhibits, controls, and interaction detector automatically.
 */
export function DataDrivenArea({
  areaId,
  scene: providedScene,
  environmentConfig,
}: DataDrivenAreaProps) {
  const scene = useMemo(() => {
    if (providedScene) return providedScene;
    if (areaId) return getAreaScene(areaId);
    throw new Error("[DataDrivenArea] Either areaId or scene must be provided.");
  }, [areaId, providedScene]);

  const { architecture, lights, portals, decorations, imagePlanes } = useMemo(() => {
    const arch: ArchitectureObject[] = [];
    const lgt: PointLightObject[] = [];
    const port: PortalObject[] = [];
    const deco: DecorationObject[] = [];
    const imgPlanes: ImagePlaneObject[] = [];

    for (const obj of scene.objects) {
      if (obj.type === "architecture") arch.push(obj as ArchitectureObject);
      else if (obj.type === "point-light") lgt.push(obj as PointLightObject);
      else if (obj.type === "portal") port.push(obj as PortalObject);
      else if (obj.type === "decoration") deco.push(obj as DecorationObject);
      else if (obj.type === "image-plane") imgPlanes.push(obj as ImagePlaneObject);
    }

    return { architecture: arch, lights: lgt, portals: port, decorations: deco, imagePlanes: imgPlanes };
  }, [scene.objects]);

  useEffect(() => {
    globalCollisionWorld.clear();

    for (const obj of scene.objects) {
      if (obj.colliders && obj.colliders.length > 0) {
        for (const col of obj.colliders) {
          globalCollisionWorld.registerCollider(obj.id, obj.transform, col);
        }
      } else if (obj.type === "trigger-volume") {
        const trig = obj as any;
        globalCollisionWorld.registerCollider(obj.id, obj.transform, {
          id: `${obj.id}-trigger`,
          enabled: true,
          type: "box",
          size: trig.dimensions ?? [2, 2, 2],
          isTrigger: true,
        });
      }
    }

    return () => {
      globalCollisionWorld.clear();
    };
  }, [scene.objects]);

  return (
    <>
      <WorldEnvironment config={environmentConfig} />
      <SceneArchitecture objects={architecture} />
      <SceneLights lights={lights} />
      <ScenePortals portals={portals} />
      <SceneDecorations decorations={decorations} />
      <SceneImagePlanes imagePlanes={imagePlanes} />
      <AtmosphericParticles
        color={scene.atmosphere.particleColor}
        count={scene.atmosphere.particleCount}
        bounds={scene.bounds}
      />
      <ExhibitRegistry area={scene.id} />
      <ExplorerController
        bounds={scene.bounds}
        initialPosition={scene.spawn.position}
        initialYaw={scene.spawn.yaw}
      />
      <InteractionDetector />
      <InteractiveObjectsRegistrar objects={scene.objects} />
    </>
  );
}
