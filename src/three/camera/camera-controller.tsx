"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { PerspectiveCamera } from "three";
import { cameraSettings } from "./camera-settings";

export function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    function applyFov() {
      const pCam = camera as PerspectiveCamera;
      if (pCam.isPerspectiveCamera) {
        const targetFov = cameraSettings.getFov();
        if (pCam.fov !== targetFov) {
          pCam.fov = targetFov;
          pCam.updateProjectionMatrix();
        }
      }
    }

    // Apply initially
    applyFov();

    // Subscribe to changes
    return cameraSettings.subscribe(applyFov);
  }, [camera]);

  return null;
}
