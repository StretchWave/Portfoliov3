"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { InteractionEvent, InteractableDefinition, WorldPosition } from "./interaction-types";

interface InteractionContextValue {
  focused: InteractableDefinition | undefined;
  register: (target: InteractableDefinition) => () => void;
  updateFocusFromPosition: (position: { x: number; y: number; z: number }) => void;
  requestInteraction: (targetId?: string) => void;
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
  const onInteractionRef = useRef(onInteraction);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  onInteractionRef.current = onInteraction;

  const register = useCallback((target: InteractableDefinition) => {
    targets.current.set(target.id, target);
    return () => {
      targets.current.delete(target.id);
      setFocusedId((current) => current === target.id ? null : current);
    };
  }, []);

  const updateFocusFromPosition = useCallback((position: { x: number; y: number; z: number }) => {
    let nearestId: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const target of targets.current.values()) {
      const distance = squaredDistance(position, target.position);
      if (distance <= target.range * target.range && distance < nearestDistance) {
        nearestDistance = distance;
        nearestId = target.id;
      }
    }

    setFocusedId((current) => current === nearestId ? current : nearestId);
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
  }), [focusedId, register, requestInteraction, updateFocusFromPosition]);

  return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>;
}

export function useInteraction(): InteractionContextValue {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error("useInteraction must be used inside InteractionProvider.");
  }
  return context;
}
