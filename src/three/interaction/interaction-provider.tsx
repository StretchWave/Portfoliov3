"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from "react";
import type { ReactNode } from "react";

import type { InteractionEvent, InteractableDefinition } from "./interaction-types";

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

export function InteractionProvider({ children, onInteraction }: InteractionProviderProps) {
  const targets = useRef(new Map<string, InteractableDefinition>());
  const playerTransformRef = useRef<PlayerTransform>({ x: 0, y: 1.7, z: 0, yaw: 0 });
  const onInteractionRef = useRef(onInteraction);
  const [focused, setFocused] = useState<InteractableDefinition | undefined>(undefined);

  useEffect(() => {
    onInteractionRef.current = onInteraction;
  }, [onInteraction]);

  const getPlayerTransform = useCallback(() => playerTransformRef.current, []);
  const getTargets = useCallback(() => Array.from(targets.current.values()), []);

  const register = useCallback((target: InteractableDefinition) => {
    targets.current.set(target.id, target);
    return () => {
      targets.current.delete(target.id);
      setFocused((current) => (current?.id === target.id ? undefined : current));
    };
  }, []);

  const updateFocusFromPosition = useCallback((position: { x: number; y: number; z: number }, yaw = 0) => {
    playerTransformRef.current = { x: position.x, y: position.y, z: position.z, yaw };
    let nearestTarget: InteractableDefinition | undefined = undefined;
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

        if (forwardDot < -0.2 && distance > 1.2) {
          continue;
        }

        const score = distance * (1.6 - Math.max(-0.5, forwardDot) * 0.6);

        if (score < nearestScore) {
          nearestScore = score;
          nearestTarget = target;
        }
      }
    }

    setFocused((prev) => {
      if (prev?.id === nearestTarget?.id) return prev;
      return nearestTarget;
    });
  }, []);

  const requestInteraction = useCallback((targetId?: string) => {
    const resolvedId = targetId ?? focused?.id;
    if (!resolvedId) return;

    const target = targets.current.get(resolvedId);
    if (target) onInteractionRef.current(target.event);
  }, [focused]);

  const value = useMemo<InteractionContextValue>(() => ({
    focused,
    register,
    updateFocusFromPosition,
    requestInteraction,
    getPlayerTransform,
    getTargets,
  }), [focused, register, requestInteraction, updateFocusFromPosition, getPlayerTransform, getTargets]);

  return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>;
}

export function useInteraction(): InteractionContextValue {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error("useInteraction must be used inside InteractionProvider.");
  }
  return context;
}
