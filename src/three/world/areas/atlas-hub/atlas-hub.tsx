"use client";

import { atlasHubScene } from "@/data/scenes";
import { DataDrivenArea } from "../data-driven-area";

/** The walkable footprint of the hub hall; owns where the visitor may roam. */
export const HUB_BOUNDS = atlasHubScene.bounds;

/**
 * Atlas Hub — the reference environment and first polished world area.
 * Data-driven implementation composing architecture, lights, portals,
 * exhibits, wayfinding, controls, and interaction detection.
 */
export function AtlasHub() {
  return <DataDrivenArea scene={atlasHubScene} />;
}
export default AtlasHub;