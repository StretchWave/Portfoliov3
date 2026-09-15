"use client";

import { ExhibitRegistry } from "@/three/exhibits/exhibit-registry";
import { InteractionDetector } from "@/three/interaction/interaction-detector";
import { ExplorerController } from "@/three/player/explorer-controller";
import { AtmosphericParticles } from "@/three/world/environment/atmospheric-particles";
import { PortalGateway } from "@/three/world/environment/portal-gateway";
import { WorldEnvironment } from "@/three/world/environment/world-environment";

import { ObservatoryArchitecture } from "./observatory-architecture";
import { TopographicContourGrid } from "./topographic-contour-grid";

export const OBSERVATORY_BOUNDS = {
  minX: -8.0,
  maxX: 8.0,
  minZ: -8.0,
  maxZ: 7.0,
} as const;

/**
 * Intelligent Systems Observatory — Atmospheric observation deck.
 * Dedicated to large-scale data systems, geospatial predictive intelligence,
 * and decision-support platforms.
 */
export function IntelligenceObservatory() {
  return (
    <>
      <WorldEnvironment />
      <ObservatoryArchitecture />
      <TopographicContourGrid />
      <AtmosphericParticles color="#818cf8" />

      {/* Atmospheric lighting (budget: 2 bounded point lights) */}
      <pointLight color="#818cf8" intensity={10} distance={9} position={[0, 3.6, -3.5]} />
      <pointLight color="#4338ca" intensity={7} distance={8} position={[0, 2.6, 4.5]} />

      {/* Return Portal to Central Hub */}
      <PortalGateway
        targetArea="atlas-hub"
        targetLabel="Atlas Central Hub"
        subtitle="Return Portal"
        position={[0, 0, 6.5]}
        rotation={[0, Math.PI, 0]}
        accent="#ffc76b"
      />

      <ExhibitRegistry area="intelligence-observatory" />
      <ExplorerController bounds={OBSERVATORY_BOUNDS} initialPosition={[0, 1.7, 5.2]} initialYaw={0} />
      <InteractionDetector />
    </>
  );
}
export default IntelligenceObservatory;
