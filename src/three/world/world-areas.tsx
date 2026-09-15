"use client";

import { AtlasHub } from "./areas/atlas-hub/atlas-hub";

/**
 * The world composition seam. Each world area is an independently mountable
 * module under `areas/` with its own bounds, architecture, and loading
 * boundary. Only the Atlas Hub (the reference environment) is mounted today.
 *
 * When a second area exists (e.g. a district), this component becomes a small
 * router that dynamically imports the active area by its stable area ID so no
 * area's code or assets are loaded until it is actually entered. Never append
 * new areas to a single world file.
 */
export function WorldAreas() {
  return <AtlasHub />;
}