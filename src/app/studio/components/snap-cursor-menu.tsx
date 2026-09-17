"use client";

import { useEffect, useRef } from "react";
import { useEditor } from "../state/editor-context";

interface SnapCursorMenuProps {
  isOpen: boolean;
  onClose: () => void;
  x?: number;
  y?: number;
}

export function SnapCursorMenu({ isOpen, onClose, x, y }: SnapCursorMenuProps) {
  const { executeSnapAction, state } = useEditor();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasSelection = Boolean(
    state.selectedObjectId || state.selectedObjectIds.length > 0,
  );

  const options: {
    id:
      | "cursor-to-selected"
      | "cursor-to-origin"
      | "selection-to-cursor"
      | "selection-to-origin"
      | "cursor-to-grid";
    label: string;
    shortcut: string;
    disabled?: boolean;
  }[] = [
    {
      id: "selection-to-cursor",
      label: "Selection to Cursor",
      shortcut: "1",
      disabled: !hasSelection,
    },
    {
      id: "selection-to-origin",
      label: "Selection to World Origin",
      shortcut: "2",
      disabled: !hasSelection,
    },
    {
      id: "cursor-to-selected",
      label: "Cursor to Selected",
      shortcut: "3",
      disabled: !hasSelection,
    },
    {
      id: "cursor-to-origin",
      label: "Cursor to World Origin",
      shortcut: "4",
    },
    {
      id: "cursor-to-grid",
      label: "Cursor to Grid Increment",
      shortcut: "5",
    },
  ];

  return (
    <div
      role="dialog"
      aria-label="Snap / 3D Cursor Operations"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in select-none"
    >
      <div
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "#18181b" }}
        className="w-64 rounded-lg border border-zinc-800 bg-zinc-900 p-2 shadow-2xl text-xs text-zinc-200 font-sans"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-2 py-1.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 text-sm">🎯</span>
            <span className="font-semibold text-zinc-100 text-xs">Snap / 3D Cursor</span>
          </div>
          <span className="font-mono text-[10px] text-zinc-500">Shift+S</span>
        </div>

        <div className="space-y-0.5">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={opt.disabled}
              onClick={() => {
                executeSnapAction(opt.id);
                onClose();
              }}
              className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left transition-colors bg-transparent ${
                opt.disabled
                  ? "opacity-35 cursor-not-allowed text-zinc-500"
                  : "text-zinc-200 hover:bg-zinc-800 hover:text-cyan-300 cursor-pointer"
              }`}
            >
              <span>{opt.label}</span>
              <kbd className="font-mono text-[10px] text-zinc-500">{opt.shortcut}</kbd>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
