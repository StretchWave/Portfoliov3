"use client";

import { useMemo } from "react";
import type { SceneObject } from "@/types/scene";
import type { InteractionEvent, WorldPosition } from "./interaction-types";
import { useInteractable } from "./use-interactable";

interface SingleInteractiveObjectProps {
  obj: SceneObject;
}

function SingleInteractiveObject({ obj }: SingleInteractiveObjectProps) {
  const definition = useMemo(() => {
    if (!obj.interaction || !obj.interaction.enabled || !obj.interaction.actions.length) {
      return null;
    }

    const action = obj.interaction.actions[0];
    let event: InteractionEvent;

    switch (action.type) {
      case "show-project":
        event = {
          kind: "open-project",
          projectId: action.projectId ?? "unknown",
        };
        break;

      case "teleport-to-room":
        event = {
          kind: "teleport-to-room",
          targetArea: action.targetArea,
          roomId: action.targetRoomId ?? "default",
          spawnPointId: action.targetSpawnPointId,
        };
        break;

      case "teleport-player":
        if (action.targetRoomId) {
          event = {
            kind: "teleport-to-room",
            targetArea: action.targetArea,
            roomId: action.targetRoomId,
            spawnPointId: action.targetSpawnPointId,
          };
        } else {
          event = {
            kind: "travel-to-area",
            targetArea: action.targetArea ?? "software-district",
            label: obj.label,
          };
        }
        break;

      case "open-district":
        event = {
          kind: "travel-to-area",
          targetArea: action.targetArea ?? "software-district",
          label: obj.label,
        };
        break;

      case "show-information":
        event = {
          kind: "show-information",
          title: action.title ?? obj.label ?? "Information",
          description: action.description,
        };
        break;

      case "open-link":
        event = {
          kind: "open-link",
          url: action.url ?? "#",
        };
        break;

      default:
        event = {
          kind: "trigger-action",
          actionId: obj.id,
        };
        break;
    }

    const pos = obj.transform.position;
    const worldPos: WorldPosition = [pos[0], pos[1], pos[2]];

    return {
      id: `scene-obj:${obj.id}`,
      label: obj.label ?? obj.id,
      hint: obj.interaction.prompt ?? "Interact",
      position: worldPos,
      range: obj.interaction.range ?? 3.0,
      event,
    };
  }, [obj]);

  useInteractable(
    definition ?? {
      id: `noop-${obj.id}`,
      label: "",
      hint: "",
      position: [0, 0, 0],
      range: 0,
      event: { kind: "trigger-action", actionId: "none" },
    },
  );

  return null;
}

export function InteractiveObjectsRegistrar({
  objects,
}: {
  objects: readonly SceneObject[];
}) {
  const interactiveObjects = useMemo(
    () =>
      objects.filter(
        (o) =>
          o.interaction &&
          o.interaction.enabled &&
          o.interaction.actions &&
          o.interaction.actions.length > 0 &&
          o.type !== "portal", // Portals register themselves via PortalGateway
      ),
    [objects],
  );

  return (
    <>
      {interactiveObjects.map((obj) => (
        <SingleInteractiveObject key={obj.id} obj={obj} />
      ))}
    </>
  );
}
