"use client";

import { ExhibitRegistry } from "@/three/exhibits/exhibit-registry";
import { InteractionDetector } from "@/three/interaction/interaction-detector";
import { ExplorerController } from "@/three/player/explorer-controller";

import { WorldEnvironment } from "../../environment/world-environment";
import { HubArchitecture } from "./hub-architecture";
import { HubNavigation } from "./hub-navigation";

/** The walkable footprint of the hub hall; owns where the visitor may roam. */
export const HUB_BOUNDS = {
  minX: -8.4,
  maxX: 8.4,
  minZ: -8.4,
  maxZ: 7,
} as const;

/**
 * Atlas Hub — the reference environment and first polished world area.
 * It composes the shared environment, its own architecture and wayfinding,
 * the data-driven exhibits registered for this area, and the exploration +
 * interaction systems scoped to its bounds.
 *
 * Area lighting follows the budget: emissive fixtures carry most of the look;
 * only two small fill lights (entrance + spine) are added here on top of the
 * global sun/hemisphere and the per-exhibit accent lights.
 */
export function AtlasHub() {
  return (
    <>
      <WorldEnvironment />
      <HubArchitecture />
      <HubNavigation />
      <pointLight color="#ffc76b" intensity={12} distance={7} position={[0, 2.8, 5.6]} />
      <pointLight color="#68e4ff" intensity={8} distance={8} position={[0, 3.4, -1.5]} />
      <ExhibitRegistry area="atlas-hub" />
      <ExplorerController bounds={HUB_BOUNDS} />
      <InteractionDetector />
    </>
  );
}