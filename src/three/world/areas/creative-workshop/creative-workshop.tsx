"use client";

import { creativeWorkshopScene } from "@/data/scenes";
import { DataDrivenArea } from "../data-driven-area";

export const WORKSHOP_BOUNDS = creativeWorkshopScene.bounds;

/**
 * Creative & Interactive Systems Workshop — An open interaction arena.
 * Showcases combat mechanics, game design, browser-native extensions,
 * and mobile applications. Fully data-driven implementation.
 */
export function CreativeWorkshop() {
  return <DataDrivenArea scene={creativeWorkshopScene} />;
}
export default CreativeWorkshop;
