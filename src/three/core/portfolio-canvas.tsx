"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { PCFShadowMap } from "three";

import { BASELINE_RENDERER_OPTIONS, getSafeDevicePixelRatio } from "@/three/performance/renderer-configuration";
import { WorldAreas } from "@/three/world/world-areas";

export function PortfolioCanvas() {
  return (
    <Canvas
      className="portfolio-canvas"
      camera={{ position: [0, 1.7, 7.5], fov: 60, near: 0.1, far: 60 }}
      dpr={[1, getSafeDevicePixelRatio()]}
      gl={BASELINE_RENDERER_OPTIONS}
      shadows={{ type: PCFShadowMap }}
    >
      {/* The Suspense boundary is the loading boundary for mounted world areas. */}
      <Suspense fallback={null}>
        <WorldAreas />
      </Suspense>
    </Canvas>
  );
}
