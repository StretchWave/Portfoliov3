"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { ReactNode } from "react";

export type QualityTier = "low" | "balanced" | "high";

export interface PerformanceMetrics {
  fps: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
}

interface PerformanceContextValue {
  showDiagnostics: boolean;
  setShowDiagnostics: (show: boolean | ((prev: boolean) => boolean)) => void;
  showHelp: boolean;
  setShowHelp: (show: boolean | ((prev: boolean) => boolean)) => void;
  quality: QualityTier;
  setQuality: (quality: QualityTier) => void;
  metrics: PerformanceMetrics;
  updateMetrics: (metrics: PerformanceMetrics) => void;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [quality, setQuality] = useState<QualityTier>("balanced");
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
  });

  const updateMetrics = useCallback((nextMetrics: PerformanceMetrics) => {
    setMetrics(nextMetrics);
  }, []);

  // Global keybindings: P for performance diagnostics, ? for controls help
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLElement &&
        (e.target.closest("input, textarea, select") ||
          e.target.closest(".command-backdrop"))
      ) {
        return;
      }
      if (e.key === "p" || e.key === "P") {
        setShowDiagnostics((prev) => !prev);
      } else if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        setShowHelp((prev) => !prev);
      } else if (e.key === "Escape" && showHelp) {
        setShowHelp(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showHelp]);

  const value = useMemo<PerformanceContextValue>(
    () => ({
      showDiagnostics,
      setShowDiagnostics,
      showHelp,
      setShowHelp,
      quality,
      setQuality,
      metrics,
      updateMetrics,
    }),
    [showDiagnostics, showHelp, quality, metrics, updateMetrics]
  );

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance(): PerformanceContextValue {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformance must be used within a PerformanceProvider");
  }
  return context;
}
