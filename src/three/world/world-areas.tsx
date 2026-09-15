"use client";

import { lazy, Suspense } from "react";
import { useWorldArea } from "./area-context";
import { AtlasHub } from "./areas/atlas-hub/atlas-hub";

const SoftwareDistrict = lazy(() => import("./areas/software-district/software-district"));
const IntelligenceObservatory = lazy(() => import("./areas/intelligence-observatory/intelligence-observatory"));
const CreativeWorkshop = lazy(() => import("./areas/creative-workshop/creative-workshop"));

/**
 * The world composition router. World areas are independently mountable
 * modules under `areas/` with their own bounds, architecture, and loading
 * boundaries. Only the active area is loaded and mounted, keeping memory
 * and rendering budgets tight.
 */
export function WorldAreas() {
  const { currentArea } = useWorldArea();

  switch (currentArea) {
    case "software-district":
      return (
        <Suspense fallback={null}>
          <SoftwareDistrict />
        </Suspense>
      );
    case "intelligence-observatory":
      return (
        <Suspense fallback={null}>
          <IntelligenceObservatory />
        </Suspense>
      );
    case "creative-workshop":
      return (
        <Suspense fallback={null}>
          <CreativeWorkshop />
        </Suspense>
      );
    case "atlas-hub":
    default:
      return <AtlasHub />;
  }
}