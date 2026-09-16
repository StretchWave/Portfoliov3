"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { InteractionEvent, InteractableDefinition, WorldPosition } from "./interaction-types";

export interface PlayerTransform {
  x: number;
  y: number;
  z: number;
  yaw: number;
}

interface InteractionContextValue {
  focused: InteractableDefinition | undefined;
  register: (target: InteractableDefinition) => () => void;
  updateFocusFromPosition: (position: { x: number; y: number; z: number }, yaw?: number) => void;
  requestInteraction: (targetId?: string) => void;
  getPlayerTransform: () => PlayerTransform;
  getTargets: () => InteractableDefinition[];
}

const InteractionContext = createContext<InteractionContextValue | null>(null);

interface InteractionProviderProps {
  children: ReactNode;
  onInteraction: (event: InteractionEvent) => void;
}

function squaredDistance(position: { x: number; y: number; z: number }, target: WorldPosition): number {
  const x = position.x - target[0];
  const y = position.y - target[1];
  const z = position.z - target[2];
  return x * x + y * y + z * z;
}

export function InteractionProvider({ children, onInteraction }: InteractionProviderProps) {
  const targets = useRef(new Map<string, InteractableDefinition>());
  const playerTransformRef = useRef<PlayerTransform>({ x: 0, y: 1.7, z: 0, yaw: 0 });
  const onInteractionRef = useRef(onInteraction);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  onInteractionRef.current = onInteraction;

  const getPlayerTransform = useCallback(() => playerTransformRef.current, []);
  const getTargets = useCallback(() => Array.from(targets.current.values()), []);

  const register = useCallback((target: InteractableDefinition) => {
    targets.current.set(target.id, target);
    return () => {
      targets.current.delete(target.id);
      setFocusedId((current) => current === target.id ? null : current);
    };
  }, []);

  const updateFocusFromPosition = useCallback((position: { x: number; y: number; z: number }, yaw = 0) => {
    playerTransformRef.current = { x: position.x, y: position.y, z: position.z, yaw };
    let nearestId: string | null = null;
    let nearestScore = Number.POSITIVE_INFINITY;

    // Camera forward vector in XZ plane
    const camDirX = -Math.sin(yaw);
    const camDirZ = -Math.cos(yaw);

    for (const target of targets.current.values()) {
      const dx = target.position[0] - position.x;
      const dy = target.position[1] - position.y;
      const dz = target.position[2] - position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance <= target.range) {
        const distXZ = Math.hypot(dx, dz);
        const forwardDot = distXZ > 0.001 ? (dx * camDirX + dz * camDirZ) / distXZ : 1;

        // If the target is behind the player, ignore unless in immediate proximity (< 1.0m)
        if (forwardDot >= -0.1 || distance < 1.0) {
          const alignmentMultiplier = forwardDot < 0 ? 1.5 : (1.2 - forwardDot * 0.4);
          const score = distance * alignmentMultiplier;
          if (score < nearestScore) {
            nearestScore = score;
            nearestId = target.id;
          }
        }
      }
    }

    setFocusedId((current) => (current === nearestId ? current : nearestId));
  }, []);

  const requestInteraction = useCallback((targetId?: string) => {
    const resolvedId = targetId ?? focusedId;
    if (!resolvedId) return;

    const target = targets.current.get(resolvedId);
    if (target) onInteractionRef.current(target.event);
  }, [focusedId]);

  const value = useMemo<InteractionContextValue>(() => ({
    focused: focusedId ? targets.current.get(focusedId) : undefined,
    register,
    updateFocusFromPosition,
    requestInteraction,
    getPlayerTransform,
    getTargets,
  }), [focusedId, register, requestInteraction, updateFocusFromPosition, getPlayerTransform, getTargets]);

  return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>;
}

export function useInteraction(): InteractionContextValue {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error("useInteraction must be used inside InteractionProvider.");
  }
  return context;
}
