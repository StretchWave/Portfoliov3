"use client";

import { useEffect } from "react";

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsDialog({ isOpen, onClose }: ShortcutsDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "F1") {
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

  const categories = [
    {
      title: "Tools & Transform",
      shortcuts: [
        { key: "Q", desc: "Select Tool" },
        { key: "W / G", desc: "Translate (Move / Grab)" },
        { key: "E / R", desc: "Rotate" },
        { key: "R / S", desc: "Scale" },
        { key: "Alt + G", desc: "Reset Transform" },
        { key: "Space", desc: "Toggle Edit / Preview Mode" },
      ],
    },
    {
      title: "Selection & Objects",
      shortcuts: [
        { key: "LMB", desc: "Select Object / Click Empty to Deselect" },
        { key: "RMB", desc: "Object Context Menu / Add Menu" },
        { key: "Shift + D", desc: "Duplicate Selected Object" },
        { key: "X / Del", desc: "Delete Selected Object" },
        { key: "H", desc: "Hide Selected Object" },
        { key: "Alt + H", desc: "Unhide All Objects in District" },
        { key: "Alt + A", desc: "Deselect Active Object" },
        { key: "Shift + A", desc: "Quick Add Object Menu" },
      ],
    },
    {
      title: "Camera & Navigation",
      shortcuts: [
        { key: "MMB Drag", desc: "Orbit / Rotate Camera" },
        { key: "Shift + MMB", desc: "Pan / Move Camera" },
        { key: "Scroll", desc: "Zoom In / Out" },
        { key: "F / .", desc: "Frame / Focus Selected Object" },
        { key: "1 / Numpad 1", desc: "Front View Camera" },
        { key: "3 / Numpad 3", desc: "Right View Camera" },
        { key: "7 / Numpad 7", desc: "Top View Camera" },
        { key: "Z", desc: "Toggle Wireframe Mode" },
      ],
    },
    {
      title: "History & Interface",
      shortcuts: [
        { key: "Ctrl + Z", desc: "Undo History" },
        { key: "Ctrl + Y", desc: "Redo History" },
        { key: "Ctrl + K", desc: "Open Studio Command Palette" },
        { key: "Ctrl + S", desc: "Save to Project Source Files" },
        { key: "Ctrl + Alt + D", desc: "Review Unsaved Changes" },
        { key: "[ / ]", desc: "Toggle Left / Right Panels" },
        { key: "Esc", desc: "Close Menus & Dialogs" },
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-100"
      style={{ zIndex: 9999 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl text-zinc-100 font-sans relative"
        style={{ backgroundColor: "#18181b", zIndex: 10000 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">⌨️</span>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Atlas Studio Shortcuts
              </h2>
              <p className="text-xs text-zinc-400">
                Blender-compatible navigation and visual editing controls
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-3 space-y-2"
            >
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400/90">
                {cat.title}
              </h3>
              <div className="space-y-1 text-xs">
                {cat.shortcuts.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center justify-between py-0.5 border-b border-zinc-800/30 last:border-none"
                  >
                    <span className="text-zinc-300 text-[11px]">{s.desc}</span>
                    <kbd className="rounded border border-zinc-700/60 bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Press <kbd className="font-mono text-zinc-400">Esc</kbd> to close</span>
          <span>Tip: Press <kbd className="font-mono text-zinc-400">Ctrl + K</kbd> anytime for Command Palette</span>
        </div>
      </div>
    </div>
  );
}
