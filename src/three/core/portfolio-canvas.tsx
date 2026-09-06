"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

import { BASELINE_RENDERER_OPTIONS, getSafeDevicePixelRatio } from "@/three/performance/renderer-configuration";
import { PrototypeHub } from "@/three/world/prototype-hub";

export function PortfolioCanvas() {
  return (
    <Canvas
      className="portfolio-canvas"
      camera={{ position: [0, 1.7, 7.5], fov: 60, near: 0.1, far: 60 }}
      dpr={[1, getSafeDevicePixelRatio()]}
      gl={BASELINE_RENDERER_OPTIONS}
      shadows
    >
      <Suspense fallback={null}>
        <PrototypeHub />
      </Suspense>
    </Canvas>
  );
}
