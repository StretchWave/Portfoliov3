export type WorldPosition = readonly [number, number, number];

/** Events are intentionally domain-neutral; the experience decides what one means. */
export type InteractionEvent =
  | { kind: "open-project"; projectId: string }
  | { kind: "trigger-action"; actionId: string };

export interface InteractableDefinition {
  id: string;
  label: string;
  hint: string;
  position: WorldPosition;
  range: number;
  event: InteractionEvent;
}
