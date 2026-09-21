import type { StudioCommandContext } from "./studio-commands";
import { findCommandById } from "./studio-commands";

export type InputContext =
  | "TEXT_INPUT"
  | "MODAL_TRANSFORM"
  | "DIALOG_OPEN"
  | "VIEWPORT"
  | "PREVIEW";

export function getActiveInputContext(
  target: EventTarget | null,
  isModalTransformActive: boolean,
  isDialogOpen: boolean,
  editorMode: "edit" | "interaction" | "preview",
): InputContext {
  const el = target as HTMLElement | null;

  if (
    el &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.tagName === "SELECT" ||
      el.isContentEditable)
  ) {
    return "TEXT_INPUT";
  }

  if (isModalTransformActive) {
    return "MODAL_TRANSFORM";
  }

  if (isDialogOpen) {
    return "DIALOG_OPEN";
  }

  if (editorMode === "preview") {
    return "PREVIEW";
  }

  return "VIEWPORT";
}

/**
 * Global Keyboard Input Router for Atlas Studio.
 */
export function handleStudioKeyDown(
  e: KeyboardEvent,
  ctx: StudioCommandContext,
  isDialogOpen: boolean,
  onCloseDialogs: () => void,
) {
  const inputContext = getActiveInputContext(
    e.target,
    Boolean(ctx.state.modalTransform?.active),
    isDialogOpen,
    ctx.state.editorMode,
  );

  // 1. Text input context: do not intercept normal letters/numbers
  if (inputContext === "TEXT_INPUT") {
    if (e.key === "Escape") {
      (e.target as HTMLElement)?.blur();
    }
    return;
  }

  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const mod = isMac ? e.metaKey : e.ctrlKey;

  // 2. Modal Transform Context (G, R, S active)
  if (inputContext === "MODAL_TRANSFORM") {
    // Escape or RMB cancels
    if (e.key === "Escape") {
      e.preventDefault();
      ctx.dispatch({ type: "CANCEL_MODAL_TRANSFORM" });
      return;
    }

    // Enter confirms
    if (e.key === "Enter") {
      e.preventDefault();
      ctx.dispatch({ type: "CONFIRM_MODAL_TRANSFORM" });
      return;
    }

    // Axis and Plane Locks
    if (!mod && !e.altKey) {
      if (e.shiftKey) {
        if (e.key === "X" || e.key === "x") {
          e.preventDefault();
          ctx.dispatch({ type: "UPDATE_MODAL_TRANSFORM", patch: { axisLock: "yz" } });
          return;
        }
        if (e.key === "Y" || e.key === "y") {
          e.preventDefault();
          ctx.dispatch({ type: "UPDATE_MODAL_TRANSFORM", patch: { axisLock: "xz" } });
          return;
        }
        if (e.key === "Z" || e.key === "z") {
          e.preventDefault();
          ctx.dispatch({ type: "UPDATE_MODAL_TRANSFORM", patch: { axisLock: "xy" } });
          return;
        }
      } else {
        if (e.key === "x" || e.key === "X") {
          e.preventDefault();
          ctx.dispatch({ type: "UPDATE_MODAL_TRANSFORM", patch: { axisLock: "x" } });
          return;
        }
        if (e.key === "y" || e.key === "Y") {
          e.preventDefault();
          ctx.dispatch({ type: "UPDATE_MODAL_TRANSFORM", patch: { axisLock: "y" } });
          return;
        }
        if (e.key === "z" || e.key === "Z") {
          e.preventDefault();
          ctx.dispatch({ type: "UPDATE_MODAL_TRANSFORM", patch: { axisLock: "z" } });
          return;
        }
      }

      // Numeric Buffer Input (0-9, ., -)
      if (/^[0-9.-]$/.test(e.key)) {
        e.preventDefault();
        const currentInput = ctx.state.modalTransform?.numericInput ?? "";
        // Disallow multiple decimals or minus not at start
        if (e.key === "." && currentInput.includes(".")) return;
        if (e.key === "-" && currentInput.length > 0) return;

        ctx.dispatch({
          type: "UPDATE_MODAL_TRANSFORM",
          patch: { numericInput: currentInput + e.key },
        });
        return;
      }

      // Backspace clears numeric input character
      if (e.key === "Backspace") {
        e.preventDefault();
        const currentInput = ctx.state.modalTransform?.numericInput ?? "";
        ctx.dispatch({
          type: "UPDATE_MODAL_TRANSFORM",
          patch: { numericInput: currentInput.slice(0, -1) },
        });
        return;
      }
    }

    return;
  }

  // 3. Dialog Open Context
  if (inputContext === "DIALOG_OPEN") {
    if (e.key === "Escape") {
      e.preventDefault();
      onCloseDialogs();
      return;
    }
    return;
  }

  // 4. Global System Shortcuts (Undo, Redo, Save, Palette)
  if (mod && (e.key === "z" || e.key === "Z")) {
    e.preventDefault();
    if (e.shiftKey) {
      findCommandById("system.redo")?.run(ctx);
    } else {
      findCommandById("system.undo")?.run(ctx);
    }
    return;
  }

  if (mod && (e.key === "y" || e.key === "Y")) {
    e.preventDefault();
    findCommandById("system.redo")?.run(ctx);
    return;
  }

  if (mod && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    findCommandById("system.save")?.run(ctx);
    return;
  }

  if (mod && (e.key === "k" || e.key === "K")) {
    e.preventDefault();
    findCommandById("system.command_palette")?.run(ctx);
    return;
  }

  if (e.key === "F3") {
    e.preventDefault();
    findCommandById("system.command_palette")?.run(ctx);
    return;
  }

  if (e.key === "F1" || (!mod && !e.altKey && e.key === "?")) {
    e.preventDefault();
    findCommandById("system.shortcuts_dialog")?.run(ctx);
    return;
  }

  // Preview Toggle (Space)
  if (!mod && !e.altKey && !e.shiftKey && e.key === " ") {
    e.preventDefault();
    findCommandById("mode.preview")?.run(ctx);
    return;
  }

  // 5. Viewport Hotkeys
  if (!mod && !e.altKey && !e.shiftKey) {
    // Blender Transform Modals
    if (e.key === "g" || e.key === "G") {
      e.preventDefault();
      findCommandById("transform.translate")?.run(ctx);
      return;
    }
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      findCommandById("transform.rotate")?.run(ctx);
      return;
    }
    if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      findCommandById("transform.scale")?.run(ctx);
      return;
    }

    // Delete
    if (e.key === "x" || e.key === "X" || e.key === "Delete") {
      e.preventDefault();
      findCommandById("object.delete")?.run(ctx);
      return;
    }

    // Rename
    if (e.key === "F2") {
      e.preventDefault();
      findCommandById("object.rename")?.run(ctx);
      return;
    }

    // Select All
    if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      findCommandById("select.all")?.run(ctx);
      return;
    }

    // Frame Selected
    if (e.key === "f" || e.key === "F" || e.key === ".") {
      e.preventDefault();
      findCommandById("view.frame_selected")?.run(ctx);
      return;
    }

    // Frame All
    if (e.key === "Home") {
      e.preventDefault();
      findCommandById("view.frame_all")?.run(ctx);
      return;
    }

    // Camera Alignments
    if (e.key === "1") {
      e.preventDefault();
      findCommandById("view.front")?.run(ctx);
      return;
    }
    if (e.key === "3") {
      e.preventDefault();
      findCommandById("view.right")?.run(ctx);
      return;
    }
    if (e.key === "7") {
      e.preventDefault();
      findCommandById("view.top")?.run(ctx);
      return;
    }

    // Toggle Inspector
    if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      findCommandById("system.toggle_inspector")?.run(ctx);
      return;
    }

    // Toggle Panels
    if (e.key === "[") {
      e.preventDefault();
      findCommandById("system.toggle_hierarchy")?.run(ctx);
      return;
    }
    if (e.key === "]") {
      e.preventDefault();
      findCommandById("system.toggle_inspector")?.run(ctx);
      return;
    }

    // Drop to Surface (End)
    if (e.key === "End") {
      e.preventDefault();
      ctx.dispatch({ type: "DROP_TO_SURFACE" });
      return;
    }

    // Toggle Snap (Shift+Tab)
    if (e.shiftKey && e.key === "Tab") {
      e.preventDefault();
      ctx.dispatch({ type: "TOGGLE_SNAP" });
      return;
    }
  }

  // Alt combinations
  if (e.altKey && !mod && !e.shiftKey) {
    if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      findCommandById("select.none")?.run(ctx);
      return;
    }
    if (e.key === "g" || e.key === "G") {
      e.preventDefault();
      findCommandById("transform.reset")?.run(ctx);
      return;
    }
  }

  // Shift combinations
  if (e.shiftKey && !mod && !e.altKey) {
    if (e.key === "D" || e.key === "d") {
      e.preventDefault();
      findCommandById("object.duplicate")?.run(ctx);
      return;
    }
    if (e.key === "S" || e.key === "s") {
      e.preventDefault();
      findCommandById("view.snap_menu")?.run(ctx);
      return;
    }
    if (e.key === "A" || e.key === "a") {
      e.preventDefault();
      findCommandById("object.add_menu")?.run(ctx);
      return;
    }
  }
}
