"use client";

import { ExhibitRegistry } from "@/three/exhibits/exhibit-registry";
import { InteractionDetector } from "@/three/interaction/interaction-detector";
import { ExplorerController } from "@/three/player/explorer-controller";
import { AtmosphericParticles } from "@/three/world/environment/atmospheric-particles";
import { PortalGateway } from "@/three/world/environment/portal-gateway";

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
 * the data-driven exhibits registered for this area, district portals,
 * and the exploration + interaction systems scoped to its bounds.
 */
export function AtlasHub() {
  return (
    <>
      <WorldEnvironment />
      <HubArchitecture />
      <HubNavigation />
      <AtmosphericParticles color="#68e4ff" />
      <pointLight color="#ffc76b" intensity={12} distance={7} position={[0, 2.8, 5.6]} />
      <pointLight color="#68e4ff" intensity={8} distance={8} position={[0, 3.4, -1.5]} />

      {/* District Spatial Portals */}
      <PortalGateway
        targetArea="software-district"
        targetLabel="Software District"
        subtitle="Systems & Tooling"
        position={[-7.2, 0, 1.8]}
        rotation={[0, Math.PI / 2, 0]}
        accent="#38bdf8"
      />
      <PortalGateway
        targetArea="intelligence-observatory"
        targetLabel="Intelligence Observatory"
        subtitle="Data & Decision AI"
        position={[7.2, 0, 1.8]}
        rotation={[0, -Math.PI / 2, 0]}
        accent="#818cf8"
      />
      <PortalGateway
        targetArea="creative-workshop"
        targetLabel="Creative Workshop"
        subtitle="Interaction & Games"
        position={[0, 0, -7.4]}
        rotation={[0, 0, 0]}
        accent="#f472d0"
      />

      <ExhibitRegistry area="atlas-hub" />
      <ExplorerController bounds={HUB_BOUNDS} initialPosition={[0, 1.7, 5.8]} initialYaw={0} />
      <InteractionDetector />
    </>
  );
}