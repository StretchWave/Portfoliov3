/**
 * Central Keyboard Shortcut Registry for Project Atlas.
 * Prevents key collision, standardizes input-guard checks,
 * and serves as the single source of truth for the controls help modal.
 */

export interface KeyboardShortcutDefinition {
  id: string;
  key: string;
  modifiers?: Array<"ctrl" | "shift" | "alt" | "meta">;
  description: string;
  context: "global" | "3d-interactive" | "modal";
  allowWhileTyping?: boolean;
}

export const SHORTCUT_REGISTRY: readonly KeyboardShortcutDefinition[] = [
  {
    id: "command-palette",
    key: "k",
    modifiers: ["ctrl"],
    description: "Open Command Palette & fast-travel search",
    context: "global",
    allowWhileTyping: false,
  },
  {
    id: "toggle-journal",
    key: "j",
    description: "Toggle Discovery Journal & Milestone Dossier",
    context: "global",
    allowWhileTyping: false,
  },
  {
    id: "toggle-radar",
    key: "m",
    description: "Toggle spatial directional radar mini-map",
    context: "3d-interactive",
    allowWhileTyping: false,
  },
  {
    id: "toggle-flight",
    key: "f",
    description: "Toggle flight mode vs surface walking",
    context: "3d-interactive",
    allowWhileTyping: false,
  },
  {
    id: "toggle-audio-modal",
    key: "u",
    description: "Open Audio & Haptics control center",
    context: "3d-interactive",
    allowWhileTyping: false,
  },
  {
    id: "toggle-tour",
    key: "t",
    description: "Toggle cinematic automated director tour",
    context: "3d-interactive",
    allowWhileTyping: false,
  },
  {
    id: "capture-screenshot",
    key: "x",
    description: "Capture real-time viewport screenshot PNG",
    context: "3d-interactive",
    allowWhileTyping: false,
  },
  {
    id: "toggle-help",
    key: "?",
    description: "Toggle controls & keyboard shortcut guide",
    context: "3d-interactive",
    allowWhileTyping: false,
  },
  {
    id: "fov-narrow",
    key: "[",
    description: "Step camera Field of View inwards (telephoto / zoom in)",
    context: "3d-interactive",
    allowWhileTyping: false,
  },
  {
    id: "fov-wide",
    key: "]",
    description: "Step camera Field of View outwards (wide angle)",
    context: "3d-interactive",
    allowWhileTyping: false,
  },
  {
    id: "close-modal",
    key: "Escape",
    description: "Close active modal, overlay, or command palette",
    context: "modal",
    allowWhileTyping: true,
  },
] as const;

/**
 * Returns true if the keyboard event was dispatched from a user text input,
 * textarea, select, or editable element where hotkeys should be suppressed.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }

  if (target.isContentEditable) {
    return true;
  }

  if (target.closest("[contenteditable='true']")) {
    return true;
  }

  return false;
}
