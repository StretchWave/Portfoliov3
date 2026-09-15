"use client";

import { ExhibitRegistry } from "@/three/exhibits/exhibit-registry";
import { InteractionDetector } from "@/three/interaction/interaction-detector";
import { ExplorerController } from "@/three/player/explorer-controller";
import { AtmosphericParticles } from "@/three/world/environment/atmospheric-particles";
import { PortalGateway } from "@/three/world/environment/portal-gateway";
import { WorldEnvironment } from "@/three/world/environment/world-environment";

import { HolographicStanceRings } from "./holographic-stance-rings";
import { WorkshopArchitecture } from "./workshop-architecture";

export const WORKSHOP_BOUNDS = {
  minX: -8.0,
  maxX: 8.0,
  minZ: -8.0,
  maxZ: 7.0,
} as const;

/**
 * Creative & Interactive Systems Workshop — An open interaction arena.
 * Showcases combat mechanics, game design, browser-native extensions,
 * and mobile applications.
 */
export function CreativeWorkshop() {
  return (
    <>
      <WorldEnvironment />
      <WorkshopArchitecture />
      <HolographicStanceRings />
      <AtmosphericParticles color="#f472d0" />

      {/* Atmospheric Workshop Lights (budget: 2 bounded point lights) */}
      <pointLight color="#f472d0" intensity={12} distance={8} position={[0, 3.4, -2.5]} />
      <pointLight color="#fb7185" intensity={8} distance={7} position={[0, 2.8, 4.5]} />

      {/* Return Portal to Central Hub */}
      <PortalGateway
        targetArea="atlas-hub"
        targetLabel="Atlas Central Hub"
        subtitle="Return Portal"
        position={[0, 0, 6.5]}
        rotation={[0, Math.PI, 0]}
        accent="#ffc76b"
      />

      <ExhibitRegistry area="creative-workshop" />
      <ExplorerController bounds={WORKSHOP_BOUNDS} initialPosition={[0, 1.7, 5.2]} initialYaw={0} />
      <InteractionDetector />
    </>
  );
}
export default CreativeWorkshop;
