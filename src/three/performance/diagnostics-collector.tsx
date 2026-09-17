"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { usePerformance } from "./performance-context";

/**
 * An invisible component mounted inside the R3F Canvas to sample
 * WebGL renderer telemetry (FPS, draw calls, triangles, geometry memory)
 * and pipe them to the UI diagnostics overlay without re-rendering the scene.
 */
export function DiagnosticsCollector() {
  const { gl } = useThree();
  const { updateMetrics, showDiagnostics } = usePerformance();
  const frameCount = useRef(0);
  const lastTime = useRef(0);

  useFrame(() => {
    frameCount.current += 1;
    const now = performance.now();
    if (lastTime.current === 0) {
      lastTime.current = now;
      return;
    }
    const elapsed = now - lastTime.current;

    // Sample every 500ms
    if (elapsed >= 500) {
      const calculatedFps = Math.round((frameCount.current * 1000) / elapsed);
      frameCount.current = 0;
      lastTime.current = now;

      if (showDiagnostics) {
        updateMetrics({
          fps: calculatedFps,
          drawCalls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
          geometries: gl.info.memory.geometries,
          textures: gl.info.memory.textures,
        });
      }
    }
  });

  return null;
}
