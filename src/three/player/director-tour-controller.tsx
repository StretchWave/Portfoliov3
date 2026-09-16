"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, useCallback } from "react";
import { Vector3 } from "three";
import { useWorldArea } from "../world/area-context";
import type { WorldAreaId } from "@/types/portfolio";
import { touchMovement } from "./touch-controls-state";

export interface TourWaypoint {
  pos: [number, number, number];
  look: [number, number, number];
  label: string;
}

const AREA_WAYPOINTS: Record<WorldAreaId, TourWaypoint[]> = {
  "atlas-hub": [
    { pos: [0, 2.4, 5.5], look: [0, 1.2, 0], label: "Central Hall Vantage" },
    { pos: [-2.6, 1.8, -1.0], look: [-4.2, 1.3, -2.6], label: "Lyrune Audio Platform" },
    { pos: [0, 1.8, -2.5], look: [0, 1.3, -4.8], label: "Sonara Architecture" },
    { pos: [2.6, 1.8, -1.0], look: [4.2, 1.3, -2.6], label: "Kerala Flood Intelligence" },
    { pos: [-4.2, 1.9, 1.6], look: [-7.2, 1.6, 1.8], label: "Software Systems Portal" },
    { pos: [4.2, 1.9, 1.6], look: [7.2, 1.6, 1.8], label: "Creative Workshop Portal" },
  ],
  "software-district": [
    { pos: [0, 2.2, 4.0], look: [0, 1.4, -4.0], label: "Server Lab Central Concourse" },
    { pos: [-2.2, 1.8, -1.0], look: [-4.0, 1.3, -2.5], label: "Lyrune DSP Server Unit" },
    { pos: [0, 1.8, -2.5], look: [0, 1.5, -5.2], label: "Central Server Processing Core" },
    { pos: [2.2, 1.8, -1.0], look: [4.0, 1.3, -2.5], label: "Lucida-Sync Cloud Relay" },
  ],
  "intelligence-observatory": [
    { pos: [0, 2.5, 4.2], look: [0, 1.6, -3.5], label: "Panoramic Observation Deck" },
    { pos: [0, 1.8, -1.0], look: [0, 1.5, -7.0], label: "Topographic River Contour Display" },
    { pos: [2.0, 1.8, -1.8], look: [0, 1.3, -3.8], label: "Kerala Flood Telemetry Console" },
  ],
  "creative-workshop": [
    { pos: [0, 2.4, 4.2], look: [0, 1.2, -5.0], label: "Interaction Arena Overview" },
    { pos: [0, 1.8, -2.2], look: [0, 1.0, -5.2], label: "Holographic Combat Rings" },
    { pos: [-2.5, 1.8, -1.0], look: [-4.2, 1.3, -2.5], label: "Sonara Client Station" },
    { pos: [2.5, 1.8, -1.0], look: [4.2, 1.3, -2.5], label: "ScrollBrake Browser Sandbox" },
  ],
};

const currentLook = new Vector3();
const targetPos = new Vector3();
const targetLook = new Vector3();

export interface DirectorTourControllerProps {
  isActive: boolean;
  onDeactivate: () => void;
}

export function DirectorTourController({
  isActive,
  onDeactivate,
}: DirectorTourControllerProps) {
  const { currentArea } = useWorldArea();
  const { camera } = useThree();
  const waypointIdx = useRef(0);
  const dwellTimer = useRef(0);
  const waypoints = AREA_WAYPOINTS[currentArea] || AREA_WAYPOINTS["atlas-hub"];

  // Reset index when entering new area
  useEffect(() => {
    waypointIdx.current = 0;
    dwellTimer.current = 0;
  }, [currentArea]);

  // Seamless manual takeover: If user presses movement keys or drags mouse, disengage tour
  useEffect(() => {
    if (!isActive) return;

    function handleUserInput(e: KeyboardEvent | PointerEvent) {
      if (e instanceof KeyboardEvent) {
        const key = e.key.toLowerCase();
        if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(key)) {
          onDeactivate();
        }
      } else if (e instanceof PointerEvent && e.buttons > 0) {
        onDeactivate();
      }
    }

    window.addEventListener("keydown", handleUserInput);
    window.addEventListener("pointerdown", handleUserInput);
    return () => {
      window.removeEventListener("keydown", handleUserInput);
      window.removeEventListener("pointerdown", handleUserInput);
    };
  }, [isActive, onDeactivate]);

  useFrame((_, delta) => {
    if (!isActive) return;

    if (touchMovement.active) {
      onDeactivate();
      return;
    }

    const wp = waypoints[waypointIdx.current];
    if (!wp) return;

    targetPos.set(...wp.pos);
    targetLook.set(...wp.look);

    // Smooth camera position interpolation
    camera.position.lerp(targetPos, Math.min(1, delta * 1.4));

    // Smooth lookAt interpolation
    camera.getWorldDirection(currentLook);
    const lookDir = targetLook.clone().sub(camera.position).normalize();
    currentLook.lerp(lookDir, Math.min(1, delta * 2.0));

    const focusPoint = camera.position.clone().add(currentLook);
    camera.lookAt(focusPoint);

    // Dwell logic
    const distToWp = camera.position.distanceTo(targetPos);
    if (distToWp < 0.4) {
      dwellTimer.current += delta;
      if (dwellTimer.current > 4.5) {
        // Advance to next waypoint
        dwellTimer.current = 0;
        waypointIdx.current = (waypointIdx.current + 1) % waypoints.length;
      }
    }
  });

  return null;
}
