"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type AddObjectType =
  | "point-light"
  | "wall"
  | "column"
  | "platform"
  | "portal"
  | "ring";

interface ViewportContextMenuProps {
  x: number;
  y: number;
  hasSelection: boolean;
  selectedLabel?: string;
  onClose: () => void;
  onSelectTool: (mode: "translate" | "rotate" | "scale") => void;
  onFocus: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onResetTransform: () => void;
  onDeselect: () => void;
  onAddObject: (type: AddObjectType) => void;
}

export function ViewportContextMenu({
  x,
  y,
  hasSelection,
  selectedLabel,
  onClose,
  onSelectTool,
  onFocus,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  onResetTransform,
  onDeselect,
  onAddObject,
}: ViewportContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Screen edge boundary clamping (compact 192px width, ~280px max height)
  const clampedX = Math.max(12, Math.min(x, window.innerWidth - 208));
  const clampedY = Math.max(12, Math.min(y, window.innerHeight - 310));

  // Selection actions list
  const selectionActions = [
    { label: "Move / Grab", shortcut: "G", action: () => onSelectTool("translate") },
    { label: "Rotate", shortcut: "R", action: () => onSelectTool("rotate") },
    { label: "Scale", shortcut: "S", action: () => onSelectTool("scale") },
    { type: "divider" },
    { label: "Reset Transform", shortcut: "Alt+G", action: onResetTransform },
    { label: "Focus Selected", shortcut: "F", action: onFocus },
    { label: "Duplicate", shortcut: "Shift+D", action: onDuplicate },
    { label: "Hide Selected", shortcut: "H", action: onToggleVisibility },
    { label: "Deselect", shortcut: "Alt+A", action: onDeselect },
    { type: "divider" },
    { label: "Delete Object", shortcut: "X", action: onDelete, danger: true },
  ];

  // Quick Add categories
  const addCategories: {
    category: string;
    items: { label: string; type: AddObjectType; icon: string }[];
  }[] = [
    {
      category: "3D Primitives",
      items: [
        { label: "Wall Segment", type: "wall", icon: "🧱" },
        { label: "Pillar Column", type: "column", icon: "🏛️" },
        { label: "Platform Base", type: "platform", icon: "⬛" },
      ],
    },
    {
      category: "Lighting",
      items: [{ label: "Point Light", type: "point-light", icon: "💡" }],
    },
    {
      category: "Interactive",
      items: [{ label: "Portal Gateway", type: "portal", icon: "🌀" }],
    },
    {
      category: "Decorations",
      items: [{ label: "Floating Ring", type: "ring", icon: "✨" }],
    },
  ];

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={hasSelection ? "Object Actions Menu" : "Add Object Menu"}
      style={{ top: clampedY, left: clampedX }}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-50 w-48 rounded-md border border-zinc-800/90 bg-zinc-900/95 py-1 text-xs text-zinc-200 shadow-2xl backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-75 font-sans"
    >
      {hasSelection ? (
        <>
          {/* Subtle Compact Header */}
          {selectedLabel && (
            <div className="px-2.5 py-1 border-b border-zinc-800/80 mb-0.5">
              <span className="text-[11px] font-medium text-zinc-300 truncate block">
                {selectedLabel}
              </span>
            </div>
          )}

          {/* Compact Actions */}
          <div className="py-0.5">
            {selectionActions.map((item, idx) => {
              if (item.type === "divider") {
                return <div key={`div-${idx}`} className="my-1 border-t border-zinc-800/80" />;
              }

              const isDanger = item.danger;
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    item.action?.();
                    onClose();
                  }}
                  className={`group flex w-full items-center justify-between px-2.5 py-1 text-left bg-transparent transition-colors ${
                    isDanger
                      ? "text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-cyan-300"
                  }`}
                >
                  <span className="font-normal">{item.label}</span>
                  {item.shortcut && (
                    <kbd
                      className={`font-mono text-[10px] tracking-tight bg-transparent ${
                        isDanger
                          ? "text-rose-500/70 group-hover:text-rose-400"
                          : "text-zinc-500 group-hover:text-zinc-400"
                      }`}
                    >
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Add Menu Header */}
          <div className="px-2.5 py-1 border-b border-zinc-800/80 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
              Add Object
            </span>
            <span className="font-mono text-[9px] text-zinc-500">Shift+A</span>
          </div>

          {/* Categorized Add Options */}
          <div className="py-0.5 space-y-1">
            {addCategories.map((group) => (
              <div key={group.category} className="px-1">
                <div className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                  {group.category}
                </div>
                {group.items.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onAddObject(item.type);
                      onClose();
                    }}
                    className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-zinc-300 bg-transparent hover:bg-zinc-800 hover:text-cyan-300 transition-colors"
                  >
                    <span className="text-xs shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
