export interface StudioCommandContext {
  state: any;
  dispatch: (action: any) => void;
  selectObject: (id: string | null) => void;
  selectAll: () => void;
  deselectAll: () => void;
  startModalTransform: (mode: "translate" | "rotate" | "scale", pointer: { x: number; y: number }) => void;
  duplicateObject: (id?: string) => void;
  deleteObject: (id?: string) => void;
  undo: () => void;
  redo: () => void;
  openCommandPalette: () => void;
  openSceneData: () => void;
  openShortcuts: () => void;
  openRenameModal: () => void;
  openSnapMenu: () => void;
  toggleGrid: () => void;
  toggleWireframe?: () => void;
  toggleInspector: () => void;
  toggleHierarchy: () => void;
  setCameraView: (view: "front" | "right" | "top" | "focus" | "home") => void;
  setEditorMode: (mode: "edit" | "interaction" | "preview") => void;
  openAddMenu?: () => void;
  saveToProject?: () => Promise<boolean> | void;
  openChangeReview?: () => void;
}

export interface StudioCommand {
  id: string;
  label: string;
  category: "Transform" | "Select" | "Object" | "View" | "System" | "Interaction";
  shortcut?: string;
  description?: string;
  run: (ctx: StudioCommandContext) => void;
  isEnabled?: (ctx: StudioCommandContext) => boolean;
}

export const STUDIO_COMMANDS: StudioCommand[] = [
  // ─── Transform ─────────────────────────────────────────────────────────────
  {
    id: "transform.translate",
    label: "Move / Grab",
    category: "Transform",
    shortcut: "G",
    description: "Start interactive translation of selected object(s)",
    run: (ctx) => {
      ctx.startModalTransform("translate", {
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
      });
    },
    isEnabled: (ctx) => Boolean(ctx.state.selectedObjectId || ctx.state.selectedObjectIds.length > 0),
  },
  {
    id: "transform.rotate",
    label: "Rotate",
    category: "Transform",
    shortcut: "R",
    description: "Start interactive rotation around pivot",
    run: (ctx) => {
      ctx.startModalTransform("rotate", {
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
      });
    },
    isEnabled: (ctx) => Boolean(ctx.state.selectedObjectId || ctx.state.selectedObjectIds.length > 0),
  },
  {
    id: "transform.scale",
    label: "Scale",
    category: "Transform",
    shortcut: "S",
    description: "Start interactive scaling relative to pivot",
    run: (ctx) => {
      ctx.startModalTransform("scale", {
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
      });
    },
    isEnabled: (ctx) => Boolean(ctx.state.selectedObjectId || ctx.state.selectedObjectIds.length > 0),
  },
  {
    id: "transform.reset",
    label: "Reset Transform",
    category: "Transform",
    shortcut: "Alt+G",
    description: "Reset position, rotation, and scale to defaults",
    run: (ctx) => {
      if (ctx.state.selectedObjectId) {
        ctx.dispatch({
          type: "UPDATE_OBJECT",
          objectId: ctx.state.selectedObjectId,
          patch: {
            transform: {
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [1, 1, 1],
            },
          },
          historyLabel: "Reset Transform",
        });
      }
    },
    isEnabled: (ctx) => Boolean(ctx.state.selectedObjectId),
  },

  // ─── Select ────────────────────────────────────────────────────────────────
  {
    id: "select.all",
    label: "Select All Objects",
    category: "Select",
    shortcut: "A",
    description: "Select all objects in the active district",
    run: (ctx) => ctx.selectAll(),
  },
  {
    id: "select.none",
    label: "Deselect All",
    category: "Select",
    shortcut: "Alt+A",
    description: "Clear current selection",
    run: (ctx) => ctx.deselectAll(),
  },

  // ─── Object Operations ─────────────────────────────────────────────────────
  {
    id: "object.duplicate",
    label: "Duplicate Object",
    category: "Object",
    shortcut: "Shift+D",
    description: "Duplicate selected object(s) and start translation",
    run: (ctx) => {
      ctx.duplicateObject();
      // Immediately enter move modal
      setTimeout(() => {
        ctx.startModalTransform("translate", {
          x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
          y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
        });
      }, 30);
    },
    isEnabled: (ctx) => Boolean(ctx.state.selectedObjectId || ctx.state.selectedObjectIds.length > 0),
  },
  {
    id: "object.delete",
    label: "Delete Selected",
    category: "Object",
    shortcut: "X",
    description: "Delete selected object(s) with undo recovery",
    run: (ctx) => ctx.deleteObject(),
    isEnabled: (ctx) => Boolean(ctx.state.selectedObjectId || ctx.state.selectedObjectIds.length > 0),
  },
  {
    id: "object.rename",
    label: "Rename Object",
    category: "Object",
    shortcut: "F2",
    description: "Rename the active selected object",
    run: (ctx) => ctx.openRenameModal(),
    isEnabled: (ctx) => Boolean(ctx.state.selectedObjectId),
  },
  {
    id: "object.drop_to_surface",
    label: "Drop to Surface",
    category: "Object",
    shortcut: "End",
    description: "Drop selected object flush to the floor or surface beneath it",
    run: (ctx) => ctx.dispatch({ type: "DROP_TO_SURFACE" }),
    isEnabled: (ctx) => Boolean(ctx.state.selectedObjectId || ctx.state.selectedObjectIds.length > 0),
  },
  {
    id: "object.add_menu",
    label: "Add Object Menu",
    category: "Object",
    shortcut: "Shift+A",
    description: "Open the Add Object menu to insert new scene objects",
    run: (ctx) => ctx.openAddMenu?.(),
  },

  // ─── View & Camera ─────────────────────────────────────────────────────────
  {
    id: "view.frame_selected",
    label: "Frame Selected",
    category: "View",
    shortcut: "F",
    description: "Focus camera smoothly onto selected object",
    run: (ctx) => ctx.setCameraView("focus"),
    isEnabled: (ctx) => Boolean(ctx.state.selectedObjectId),
  },
  {
    id: "view.frame_all",
    label: "Frame All / Home",
    category: "View",
    shortcut: "Home",
    description: "Frame entire district exhibition hall",
    run: (ctx) => ctx.setCameraView("home"),
  },
  {
    id: "view.front",
    label: "View Front",
    category: "View",
    shortcut: "1",
    description: "Align camera to front orthographic/perspective plane",
    run: (ctx) => ctx.setCameraView("front"),
  },
  {
    id: "view.right",
    label: "View Right",
    category: "View",
    shortcut: "3",
    description: "Align camera to right profile plane",
    run: (ctx) => ctx.setCameraView("right"),
  },
  {
    id: "view.top",
    label: "View Top",
    category: "View",
    shortcut: "7",
    description: "Align camera to top-down architectural plane",
    run: (ctx) => ctx.setCameraView("top"),
  },
  {
    id: "view.snap_menu",
    label: "Snap / 3D Cursor Menu",
    category: "View",
    shortcut: "Shift+S",
    description: "Open snap operations for 3D cursor and selection",
    run: (ctx) => ctx.openSnapMenu(),
  },
  {
    id: "view.toggle_grid",
    label: "Toggle Ground Grid",
    category: "View",
    shortcut: "G",
    description: "Show or hide 3D world reference grid",
    run: (ctx) => ctx.toggleGrid(),
  },

  // ─── System / Interface ───────────────────────────────────────────────────
  {
    id: "system.undo",
    label: "Undo",
    category: "System",
    shortcut: "Ctrl+Z",
    description: "Undo the last scene modification",
    run: (ctx) => ctx.undo(),
  },
  {
    id: "system.redo",
    label: "Redo",
    category: "System",
    shortcut: "Ctrl+Shift+Z",
    description: "Redo the previously undone modification",
    run: (ctx) => ctx.redo(),
  },
  {
    id: "system.save",
    label: "Save to Project",
    category: "System",
    shortcut: "Ctrl+S",
    description: "Persist scene modifications to canonical project source files",
    run: (ctx) => {
      if (ctx.saveToProject) {
        ctx.saveToProject();
      } else {
        ctx.openSceneData();
      }
    },
  },
  {
    id: "system.review_changes",
    label: "Review Unsaved Changes",
    category: "System",
    shortcut: "Ctrl+Alt+D",
    description: "Inspect modified objects and scene differences before saving",
    run: (ctx) => {
      ctx.openChangeReview?.();
    },
  },
  {
    id: "system.export_json",
    label: "Export Scene JSON (Portable)",
    category: "System",
    description: "Export full scene definition as portable JSON snapshot",
    run: (ctx) => ctx.openSceneData(),
  },
  {
    id: "system.command_palette",
    label: "Command Palette",
    category: "System",
    shortcut: "F3",
    description: "Search and execute all Studio commands",
    run: (ctx) => ctx.openCommandPalette(),
  },
  {
    id: "system.shortcuts_dialog",
    label: "Shortcuts Help",
    category: "System",
    shortcut: "F1",
    description: "Open full keyboard shortcuts reference",
    run: (ctx) => ctx.openShortcuts(),
  },
  {
    id: "system.toggle_inspector",
    label: "Toggle Inspector Panel",
    category: "System",
    shortcut: "N",
    description: "Expand or collapse right inspector panel",
    run: (ctx) => ctx.toggleInspector(),
  },
  {
    id: "system.toggle_hierarchy",
    label: "Toggle Hierarchy Panel",
    category: "System",
    shortcut: "[",
    description: "Expand or collapse left scene hierarchy",
    run: (ctx) => ctx.toggleHierarchy(),
  },

  // ─── Interaction & Modes ───────────────────────────────────────────────────
  {
    id: "mode.edit",
    label: "Switch to Edit Mode",
    category: "Interaction",
    description: "Standard 3D transform and authoring mode",
    run: (ctx) => ctx.setEditorMode("edit"),
  },
  {
    id: "mode.interaction",
    label: "Switch to Interaction Authoring Mode",
    category: "Interaction",
    description: "Visualize interactable objects, triggers, and ranges",
    run: (ctx) => ctx.setEditorMode("interaction"),
  },
  {
    id: "mode.preview",
    label: "Switch to Preview Mode",
    category: "Interaction",
    shortcut: "Space",
    description: "Live interactive test of player raycasts and actions",
    run: (ctx) => {
      ctx.setEditorMode(ctx.state.editorMode === "preview" ? "edit" : "preview");
    },
  },
];

export function findCommandById(id: string): StudioCommand | undefined {
  return STUDIO_COMMANDS.find((cmd) => cmd.id === id);
}
