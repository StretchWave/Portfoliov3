"use client";

import { softwareDistrictScene } from "@/data/scenes";
import { DataDrivenArea } from "../data-driven-area";

export const SOFTWARE_BOUNDS = softwareDistrictScene.bounds;

/**
 * Software Systems District — The high-density technical server lab environment.
 * Houses systems engineering, automation pipelines, and core application platforms.
 * Fully data-driven implementation.
 */
export function SoftwareDistrict() {
  return <DataDrivenArea scene={softwareDistrictScene} />;
}
export default SoftwareDistrict;
