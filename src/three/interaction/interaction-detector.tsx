"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect } from "react";

import { useInteraction } from "./interaction-provider";

/**
 * The prototype uses proximity because it is predictable with a drag-to-look
 * camera. A future raycast detector can feed the same provider API.
 */
export function InteractionDetector() {
  const { requestInteraction, updateFocusFromPosition } = useInteraction();

  useFrame(({ camera }) => {
    updateFocusFromPosition(camera.position);
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.key.toLowerCase() !== "e") return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement) return;

      requestInteraction();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestInteraction]);

  return null;
}
