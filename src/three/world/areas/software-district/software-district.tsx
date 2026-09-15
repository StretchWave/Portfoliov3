"use client";

import { ExhibitRegistry } from "@/three/exhibits/exhibit-registry";
import { InteractionDetector } from "@/three/interaction/interaction-detector";
import { ExplorerController } from "@/three/player/explorer-controller";
import { AtmosphericParticles } from "@/three/world/environment/atmospheric-particles";
import { PortalGateway } from "@/three/world/environment/portal-gateway";
import { WorldEnvironment } from "@/three/world/environment/world-environment";

import { DistrictArchitecture } from "./district-architecture";
import { ServerDataConduit } from "./server-data-conduit";

export const SOFTWARE_BOUNDS = {
  minX: -7.6,
  maxX: 7.6,
  minZ: -7.8,
  maxZ: 6.8,
} as const;

/**
 * Software Systems District — The high-density technical server lab environment.
 * Houses systems engineering, automation pipelines, and core application platforms.
 */
export function SoftwareDistrict() {
  return (
    <>
      <WorldEnvironment />
      <DistrictArchitecture />
      <ServerDataConduit />
      <AtmosphericParticles color="#38bdf8" />

      {/* District Accent and Atmosphere Lights (budget: 2 bounded point lights) */}
      <pointLight color="#38bdf8" intensity={12} distance={8} position={[0, 3.2, -4.5]} />
      <pointLight color="#0284c7" intensity={8} distance={7} position={[0, 2.8, 4.2]} />

      {/* Return Portal to Central Hub */}
      <PortalGateway
        targetArea="atlas-hub"
        targetLabel="Atlas Central Hub"
        subtitle="Return Portal"
        position={[0, 0, 6.4]}
        rotation={[0, Math.PI, 0]}
        accent="#ffc76b"
      />

      <ExhibitRegistry area="software-district" />
      <ExplorerController bounds={SOFTWARE_BOUNDS} initialPosition={[0, 1.7, 5.2]} initialYaw={0} />
      <InteractionDetector />
    </>
  );
}
export default SoftwareDistrict;
