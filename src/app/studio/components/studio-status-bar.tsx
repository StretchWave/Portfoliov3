"use client";

import { useEditor } from "../state/editor-context";

export function StudioStatusBar() {
  const { currentAreaScene, selectedObject, state } = useEditor();

  return (
    <footer className="flex h-6 w-full shrink-0 items-center justify-between border-t border-zinc-800/80 bg-zinc-950 px-3 text-[11px] font-mono text-zinc-400 select-none z-30">
      {/* Left: District, Object count, Selected item */}
      <div className="flex items-center gap-3 truncate">
        <div className="flex items-center gap-1">
          <span className="text-zinc-500">Area:</span>
          <span className="text-zinc-200 font-sans font-medium">
            {currentAreaScene.metadata.name}
          </span>
        </div>

        <span className="text-zinc-800">|</span>

        <div className="flex items-center gap-1">
          <span className="text-zinc-500">Objects:</span>
          <span className="text-zinc-300 font-medium">
            {currentAreaScene.objects.length}
          </span>
        </div>

        <span className="text-zinc-800">|</span>

        <div className="flex items-center gap-1 truncate">
          <span className="text-zinc-500">Selected:</span>
          {selectedObject ? (
            <span className="text-cyan-400 font-sans font-medium truncate">
              {selectedObject.label ?? selectedObject.id}{" "}
              <span className="text-zinc-500 text-[10px]">({selectedObject.type})</span>
            </span>
          ) : (
            <span className="text-zinc-600">None</span>
          )}
        </div>
      </div>

      {/* Center: Blender Navigation & Shortcut Hints */}
      <div className="hidden lg:flex items-center gap-2 text-zinc-500 text-[10px]">
        {selectedObject ? (
          <span>
            [G] Move • [R] Rotate • [S] Scale • [Shift+D] Duplicate • [X] Delete • [F] Focus • [H] Hide
          </span>
        ) : (
          <span>
            MMB: Orbit • Shift+MMB: Pan • LMB: Select • RMB: Menu • [Shift+A] Add • [1/3/7] Views
          </span>
        )}
      </div>

      {/* Right: Autosave Status & Version */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              state.isDirty ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
            }`}
          />
          <span className="text-[10px]">
            {state.isDirty ? "Unsaved Buffer" : "LocalStorage Synced"}
          </span>
        </div>

        <span className="text-zinc-800">|</span>

        <span className="text-cyan-500/80 font-medium">Atlas Studio v1.2</span>
      </div>
    </footer>
  );
}
