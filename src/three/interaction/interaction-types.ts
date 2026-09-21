import type { WorldAreaId } from "@/types/portfolio";

export type WorldPosition = readonly [number, number, number];

/** Events are intentionally domain-neutral; the experience decides what one means. */
export type InteractionEvent =
  | { kind: "open-project"; projectId: string }
  | { kind: "trigger-action"; actionId: string }
  | { kind: "travel-to-area"; targetArea: WorldAreaId | string; label?: string }
  | { kind: "teleport-to-room"; targetArea?: WorldAreaId | string; roomId: string; spawnPointId?: string }
  | { kind: "show-information"; title: string; description?: string }
  | { kind: "open-link"; url: string };

export interface InteractableDefinition {
  id: string;
  label: string;
  hint: string;
  position: WorldPosition;
  range: number;
  event: InteractionEvent;
}
