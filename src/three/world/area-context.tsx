"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type { WorldAreaId } from "@/types/portfolio";
import { WORLD_AREAS, type WorldAreaInfo } from "@/data/world-areas";

export { WORLD_AREAS, type WorldAreaInfo };


interface WorldAreaContextValue {
  currentArea: WorldAreaId;
  previousArea: WorldAreaId | null;
  areaInfo: WorldAreaInfo;
  isTransitioning: boolean;
  travelToArea: (areaId: WorldAreaId) => void;
}

const WorldAreaContext = createContext<WorldAreaContextValue | null>(null);

export function WorldAreaProvider({
  children,
  initialArea = "atlas-hub",
}: {
  children: ReactNode;
  initialArea?: WorldAreaId;
}) {
  const [currentArea, setCurrentArea] = useState<WorldAreaId>(initialArea);
  const [previousArea, setPreviousArea] = useState<WorldAreaId | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const travelToArea = useCallback((areaId: WorldAreaId) => {
    if (areaId === currentArea) return;
    setIsTransitioning(true);
    setPreviousArea(currentArea);
    
    // Quick atmospheric fade transition
    setTimeout(() => {
      setCurrentArea(areaId);
      setIsTransitioning(false);
    }, 450);
  }, [currentArea]);

  const value = useMemo<WorldAreaContextValue>(() => ({
    currentArea,
    previousArea,
    areaInfo: WORLD_AREAS[currentArea],
    isTransitioning,
    travelToArea,
  }), [currentArea, previousArea, isTransitioning, travelToArea]);

  return (
    <WorldAreaContext.Provider value={value}>
      {children}
    </WorldAreaContext.Provider>
  );
}

export function useWorldArea(): WorldAreaContextValue {
  const context = useContext(WorldAreaContext);
  if (!context) {
    throw new Error("useWorldArea must be used within a WorldAreaProvider");
  }
  return context;
}
