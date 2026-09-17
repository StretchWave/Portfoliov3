"use client";

import { useEffect, useMemo, useState } from "react";
import { worldAreaIds } from "@/types/portfolio";
import { useEditor } from "../state/editor-context";
import type { ActivePanel } from "../state/editor-reducer";

interface CommandItem {
  id: string;
  title: string;
  category: string;
  action: () => void;
}

export function StudioCommandPalette({
  isOpen,
  onClose,
  onOpenImportExport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenImportExport: () => void;
}) {
  const {
    setActiveArea,
    setEditorMode,
    setTransformMode,
    setActivePanel,
    selectObject,
    currentAreaScene,
    undo,
    redo,
  } = useEditor();

  const [search, setSearch] = useState("");

  const commands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // Modes
      {
        id: "mode-edit",
        title: "Switch to Edit Mode",
        category: "Mode",
        action: () => setEditorMode("edit"),
      },
      {
        id: "mode-preview",
        title: "Switch to Runtime Preview Mode",
        category: "Mode",
        action: () => setEditorMode("preview"),
      },

      // Transforms
      {
        id: "tool-translate",
        title: "Translate Tool (W)",
        category: "Tools",
        action: () => setTransformMode("translate"),
      },
      {
        id: "tool-rotate",
        title: "Rotate Tool (E)",
        category: "Tools",
        action: () => setTransformMode("rotate"),
      },
      {
        id: "tool-scale",
        title: "Scale Tool (R)",
        category: "Tools",
        action: () => setTransformMode("scale"),
      },

      // Panels
      {
        id: "panel-hierarchy",
        title: "Open Hierarchy Panel",
        category: "Panels",
        action: () => setActivePanel("hierarchy"),
      },
      {
        id: "panel-inspector",
        title: "Open Inspector Panel",
        category: "Panels",
        action: () => setActivePanel("inspector"),
      },
      {
        id: "panel-env",
        title: "Open Global Environment Panel",
        category: "Panels",
        action: () => setActivePanel("environment"),
      },
      {
        id: "panel-projects",
        title: "Open Projects & Exhibits Panel",
        category: "Panels",
        action: () => setActivePanel("projects"),
      },
      {
        id: "panel-validate",
        title: "Run Scene Validation & Health Checks",
        category: "Panels",
        action: () => setActivePanel("validation"),
      },

      // History
      {
        id: "history-undo",
        title: "Undo Last Action",
        category: "Edit",
        action: () => undo(),
      },
      {
        id: "history-redo",
        title: "Redo Last Action",
        category: "Edit",
        action: () => redo(),
      },

      // File
      {
        id: "file-io",
        title: "Import / Export Scene JSON",
        category: "File",
        action: () => onOpenImportExport(),
      },
    ];

    // Add Area Navigation
    for (const areaId of worldAreaIds) {
      list.push({
        id: `nav-${areaId}`,
        title: `Navigate to ${areaId}`,
        category: "Navigation",
        action: () => setActiveArea(areaId),
      });
    }

    // Add Object Quick Select for current area
    for (const obj of currentAreaScene.objects) {
      list.push({
        id: `obj-${obj.id}`,
        title: `Select: ${obj.label ?? obj.id} (${obj.type})`,
        category: "Objects",
        action: () => {
          selectObject(obj.id);
          setActivePanel("inspector");
        },
      });
    }

    return list;
  }, [
    setEditorMode,
    setTransformMode,
    setActivePanel,
    undo,
    redo,
    onOpenImportExport,
    setActiveArea,
    currentAreaScene.objects,
    selectObject,
  ]);

  const filtered = useMemo(() => {
    if (!search.trim()) return commands;
    const q = search.toLowerCase();
    return commands.filter(
      (c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q),
    );
  }, [commands, search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="border-b border-slate-800 p-3 flex items-center gap-2">
          <span className="text-cyan-400 font-mono text-sm">⌘</span>
          <input
            type="text"
            autoFocus
            placeholder="Type a command, tool, or object name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                item.action();
                onClose();
              }}
              className="w-full flex items-center justify-between rounded px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition"
            >
              <span>{item.title}</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                {item.category}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-500">No matching commands.</div>
          )}
        </div>
      </div>
    </div>
  );
}
