"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { PCFShadowMap } from "three";

import { BASELINE_RENDERER_OPTIONS, getSafeDevicePixelRatio } from "@/three/performance/renderer-configuration";
import { DiagnosticsCollector } from "@/three/performance/diagnostics-collector";
import { usePerformance } from "@/three/performance/performance-context";
import { WorldAreas } from "@/three/world/world-areas";
import { DirectorTourController } from "@/three/player/director-tour-controller";

interface PortfolioCanvasProps {
  isTourActive?: boolean;
  onTourDeactivate?: () => void;
}

export function PortfolioCanvas({ isTourActive = false, onTourDeactivate = () => {} }: PortfolioCanvasProps) {
  const { quality } = usePerformance();

  const dpr = quality === "low" ? 1 : quality === "balanced" ? 1.25 : getSafeDevicePixelRatio();
  const shadowsEnabled = quality !== "low";

  return (
    <Canvas
      className="portfolio-canvas"
      camera={{ position: [0, 1.7, 7.5], fov: 60, near: 0.1, far: 60 }}
      dpr={[1, dpr]}
      gl={BASELINE_RENDERER_OPTIONS}
      shadows={shadowsEnabled ? { type: PCFShadowMap } : false}
    >
      <DiagnosticsCollector />
      <DirectorTourController isActive={isTourActive} onDeactivate={onTourDeactivate} />
      {/* The Suspense boundary is the loading boundary for mounted world areas. */}
      <Suspense fallback={null}>
        <WorldAreas />
      </Suspense>
    </Canvas>
  );
}
