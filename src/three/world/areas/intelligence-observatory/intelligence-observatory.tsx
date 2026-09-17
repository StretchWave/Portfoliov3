"use client";

import { intelligenceObservatoryScene } from "@/data/scenes";
import { DataDrivenArea } from "../data-driven-area";

export const OBSERVATORY_BOUNDS = intelligenceObservatoryScene.bounds;

/**
 * Intelligent Systems Observatory — Atmospheric observation deck.
 * Dedicated to large-scale data systems, geospatial predictive intelligence,
 * and decision-support platforms. Fully data-driven implementation.
 */
export function IntelligenceObservatory() {
  return <DataDrivenArea scene={intelligenceObservatoryScene} />;
}
export default IntelligenceObservatory;
