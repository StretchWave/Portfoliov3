import type {
  InteractionAction,
  InteractionCondition,
  InteractionDefinition,
  SceneObject,
} from "@/types/scene";
import { getProjectById } from "@/features/portfolio/project-registry";
import { soundManager } from "@/lib/audio-synthesizer";

export interface InteractionExecutionContext {
  activeAreaId: string;
  discoveredMilestones?: string[];
  variables?: Record<string, unknown>;
  onShowProject?: (projectId: string) => void;
  onShowInformation?: (info: { title: string; description?: string; category?: string }) => void;
  onTeleportPlayer?: (targetArea: string, teleportPointId?: string) => void;
  onHighlightObject?: (objectId: string) => void;
  onNotification?: (message: string) => void;
  log?: (entry: InteractionLogEntry) => void;
}

export interface InteractionLogEntry {
  timestamp: number;
  objectId: string;
  trigger: string;
  conditionsPassed: boolean;
  executedActions: string[];
  error?: string;
}

/**
 * Checks whether an interaction condition evaluates to true.
 */
export function evaluateCondition(
  cond: InteractionCondition,
  ctx: InteractionExecutionContext,
): boolean {
  switch (cond.type) {
    case "discovered-milestone":
      return Boolean(ctx.discoveredMilestones?.includes(cond.key));
    case "variable-equals":
      return ctx.variables?.[cond.key] === cond.value;
    case "district-active":
      return ctx.activeAreaId === cond.key;
    default:
      return true;
  }
}

/**
 * Executes a single InteractionAction within the provided execution context.
 */
export async function executeInteractionAction(
  action: InteractionAction,
  targetObject: SceneObject,
  ctx: InteractionExecutionContext,
): Promise<boolean> {
  try {
    switch (action.type) {
      case "show-project": {
        if (!action.projectId) {
          throw new Error("Action 'show-project' missing projectId.");
        }
        const proj = getProjectById(action.projectId);
        if (!proj) {
          throw new Error(`Project "${action.projectId}" not found in registry.`);
        }
        ctx.onShowProject?.(action.projectId);
        soundManager.playChime();
        return true;
      }

      case "show-information": {
        ctx.onShowInformation?.({
          title: action.title ?? targetObject.label ?? "Information",
          description: action.description,
          category: action.category,
        });
        soundManager.playChime();
        return true;
      }

      case "teleport-player": {
        const destination = action.targetArea ?? ctx.activeAreaId;
        ctx.onTeleportPlayer?.(destination, action.teleportPointId ?? action.targetSpawnPointId ?? action.targetRoomId);
        soundManager.playWarpSound();
        return true;
      }

      case "teleport-to-room": {
        const destination = action.targetArea ?? ctx.activeAreaId;
        ctx.onTeleportPlayer?.(destination, action.targetSpawnPointId ?? action.targetRoomId);
        soundManager.playWarpSound();
        return true;
      }

      case "open-district": {
        if (action.targetArea) {
          ctx.onTeleportPlayer?.(action.targetArea);
          soundManager.playWarpSound();
          return true;
        }
        return false;
      }

      case "play-sound": {
        if (action.soundId === "teleport") soundManager.playWarpSound();
        else if (action.soundId === "modal" || action.soundId === "chime") soundManager.playChime();
        else soundManager.playTactileClick();
        return true;
      }

      case "highlight-object": {
        ctx.onHighlightObject?.(targetObject.id);
        return true;
      }

      case "open-link": {
        if (action.url && typeof window !== "undefined") {
          window.open(action.url, "_blank", "noopener,noreferrer");
          return true;
        }
        return false;
      }

      case "toggle-state": {
        if (action.variable && ctx.variables) {
          ctx.variables[action.variable] =
            action.value !== undefined ? action.value : !ctx.variables[action.variable];
          return true;
        }
        return false;
      }

      default:
        return false;
    }
  } catch (err: any) {
    ctx.log?.({
      timestamp: Date.now(),
      objectId: targetObject.id,
      trigger: "action-error",
      conditionsPassed: true,
      executedActions: [],
      error: err.message,
    });
    return false;
  }
}

/**
 * Resolves and triggers an interaction on a target scene object.
 */
export async function triggerObjectInteraction(
  target: SceneObject,
  trigger: "click" | "double-click" | "hover" | "proximity" | "interact-key" | "tap",
  ctx: InteractionExecutionContext,
): Promise<boolean> {
  const def = target.interaction;
  if (!def || !def.enabled) {
    return false;
  }

  // Check trigger match
  if (def.trigger !== trigger) {
    return false;
  }

  // Evaluate conditions
  if (def.conditions && def.conditions.length > 0) {
    const allPassed = def.conditions.every((cond) => evaluateCondition(cond, ctx));
    if (!allPassed) {
      ctx.log?.({
        timestamp: Date.now(),
        objectId: target.id,
        trigger,
        conditionsPassed: false,
        executedActions: [],
      });
      return false;
    }
  }

  // Execute actions sequentially
  const executed: string[] = [];
  for (const act of def.actions) {
    const ok = await executeInteractionAction(act, target, ctx);
    if (ok) {
      executed.push(act.type);
    }
  }

  ctx.log?.({
    timestamp: Date.now(),
    objectId: target.id,
    trigger,
    conditionsPassed: true,
    executedActions: executed,
  });

  return executed.length > 0;
}
