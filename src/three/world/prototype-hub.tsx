"use client";

import { InteractionDetector } from "@/three/interaction/interaction-detector";

import { ExhibitRegistry } from "../exhibits/exhibit-registry";
import { ExplorerController } from "../player/explorer-controller";
import { HubArchitecture } from "./hub-architecture";
import { WorldEnvironment } from "./world-environment";

/** The first mountable world area; future districts should follow this pattern. */
export function PrototypeHub() {
  return (
    <>
      <WorldEnvironment />
      <HubArchitecture />
      <ExhibitRegistry area="prototype-hub" />
      <ExplorerController />
      <InteractionDetector />
    </>
  );
}
