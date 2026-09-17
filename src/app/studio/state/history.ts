import type { AtlasSceneDefinition } from "@/types/scene";

export interface HistoryEntry {
  label: string;
  timestamp: number;
  snapshot: AtlasSceneDefinition;
}

export interface HistoryStack {
  entries: HistoryEntry[];
  currentIndex: number;
  maxEntries: number;
}

const DEFAULT_MAX_ENTRIES = 100;

export function createHistoryStack(
  initialSnapshot: AtlasSceneDefinition,
  maxEntries: number = DEFAULT_MAX_ENTRIES,
): HistoryStack {
  return {
    entries: [
      {
        label: "Initial Scene",
        timestamp: Date.now(),
        snapshot: structuredClone(initialSnapshot),
      },
    ],
    currentIndex: 0,
    maxEntries,
  };
}

export function pushHistory(
  stack: HistoryStack,
  label: string,
  snapshot: AtlasSceneDefinition,
): HistoryStack {
  // Truncate any redo entries ahead of current index
  const newEntries = stack.entries.slice(0, stack.currentIndex + 1);

  newEntries.push({
    label,
    timestamp: Date.now(),
    snapshot: structuredClone(snapshot),
  });

  // Cap at maxEntries
  if (newEntries.length > stack.maxEntries) {
    newEntries.shift();
  }

  return {
    ...stack,
    entries: newEntries,
    currentIndex: newEntries.length - 1,
  };
}

export function canUndo(stack: HistoryStack): boolean {
  return stack.currentIndex > 0;
}

export function canRedo(stack: HistoryStack): boolean {
  return stack.currentIndex < stack.entries.length - 1;
}

export function undo(
  stack: HistoryStack,
): { stack: HistoryStack; snapshot: AtlasSceneDefinition } | null {
  if (!canUndo(stack)) return null;

  const nextIndex = stack.currentIndex - 1;
  const snapshot = structuredClone(stack.entries[nextIndex].snapshot);

  return {
    stack: {
      ...stack,
      currentIndex: nextIndex,
    },
    snapshot,
  };
}

export function redo(
  stack: HistoryStack,
): { stack: HistoryStack; snapshot: AtlasSceneDefinition } | null {
  if (!canRedo(stack)) return null;

  const nextIndex = stack.currentIndex + 1;
  const snapshot = structuredClone(stack.entries[nextIndex].snapshot);

  return {
    stack: {
      ...stack,
      currentIndex: nextIndex,
    },
    snapshot,
  };
}
