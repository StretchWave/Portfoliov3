"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { soundManager } from "@/lib/audio-synthesizer";
import { useInteraction } from "@/three/interaction/interaction-provider";

export function SpatialAudioListener() {
  const { getTargets } = useInteraction();
  const lastPingTime = useRef<number>(0);

  useFrame(({ camera, clock }) => {
    // Continuously stream 3D camera coordinates to audio synthesizer
    soundManager.updateSpatialListener(
      camera.position.x,
      camera.position.y,
      camera.position.z,
      camera.rotation.y
    );

    // Periodic spatial sonification of nearby exhibits (every 3.8s)
    const t = clock.getElapsedTime();
    if (t - lastPingTime.current > 3.8 && soundManager.isSpatialEnabled() && soundManager.isEnabled()) {
      lastPingTime.current = t;
      const targets = getTargets();
      for (const target of targets) {
        const dx = target.position[0] - camera.position.x;
        const dz = target.position[2] - camera.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 1.2 && dist < 5.8) {
          const freq = target.id.startsWith("portal") ? 587.33 : 880;
          soundManager.playSpatialPing(target.position[0], target.position[2], freq);
          break; // Ping closest nearby item per pulse
        }
      }
    }
  });

  return null;
}
