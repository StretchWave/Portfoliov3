"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
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

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentAreaRef = useRef<WorldAreaId>(currentArea);
  useEffect(() => {
    currentAreaRef.current = currentArea;
  }, [currentArea]);

  // Clean up any pending transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const travelToArea = useCallback((areaId: WorldAreaId) => {
    // If already at destination and not transitioning, no-op
    if (areaId === currentAreaRef.current && !transitionTimerRef.current) return;

    // Deterministic cancellation: abort any in-flight transition timer so final request wins
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    setIsTransitioning(true);
    setPreviousArea(currentAreaRef.current);

    // Controlled atmospheric fade transition
    transitionTimerRef.current = setTimeout(() => {
      setCurrentArea(areaId);
      setIsTransitioning(false);
      transitionTimerRef.current = null;
    }, 450);
  }, []);

  const value = useMemo<WorldAreaContextValue>(
    () => ({
      currentArea,
      previousArea,
      areaInfo: WORLD_AREAS[currentArea],
      isTransitioning,
      travelToArea,
    }),
    [currentArea, previousArea, isTransitioning, travelToArea]
  );

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
