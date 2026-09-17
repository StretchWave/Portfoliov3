"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor } from "../state/editor-context";

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RenameDialog({ isOpen, onClose }: RenameDialogProps) {
  const { selectedObject, renameObject } = useEditor();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && selectedObject) {
      setName(selectedObject.label ?? selectedObject.id);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 30);
    }
  }, [isOpen, selectedObject]);

  if (!isOpen || !selectedObject) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (trimmed && trimmed !== selectedObject.label) {
      renameObject(selectedObject.id, trimmed);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label="Rename Object"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "#18181b" }}
        className="w-80 rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-2xl text-xs text-zinc-200 font-sans"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-3">
          <span className="font-semibold text-zinc-100 text-xs">Rename Object</span>
          <span className="font-mono text-[10px] text-zinc-500">F2</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Object Name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  onClose();
                }
              }}
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-2.5 py-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancel (Esc)
            </button>
            <button
              type="submit"
              className="rounded bg-cyan-600 px-3 py-1 font-medium text-white hover:bg-cyan-500 transition-colors"
            >
              OK (Enter)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
