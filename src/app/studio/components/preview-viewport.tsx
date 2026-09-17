"use client";

import { Canvas } from "@react-three/fiber";
import { DataDrivenArea } from "@/three/world/areas/data-driven-area";
import { useEditor } from "../state/editor-context";

export function PreviewViewport() {
  const { currentAreaScene, state, setEditorMode } = useEditor();

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-950 select-none">
      {/* Prominent Runtime Preview HUD Banner */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full border border-emerald-500/40 bg-zinc-950/90 px-4 py-1.5 font-mono text-xs text-emerald-300 shadow-2xl backdrop-blur-md">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-semibold tracking-wider">RUNTIME PLAYTEST</span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-400 font-sans text-[11px] hidden sm:inline">
          WASD to move • Mouse to look • E to interact
        </span>
        <button
          type="button"
          onClick={() => setEditorMode("edit")}
          className="ml-1 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-sans font-semibold text-emerald-200 hover:bg-emerald-500/30 hover:border-emerald-400 transition-colors cursor-pointer"
        >
          Exit Preview [Space]
        </button>
      </div>

      {/* R3F Canvas */}
      <div className="absolute inset-0 h-full w-full">
        <Canvas
          camera={{ position: currentAreaScene.spawn.position, fov: 60 }}
          shadows
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "block",
          }}
        >
          <DataDrivenArea
            scene={currentAreaScene}
            environmentConfig={state.scene.environment}
          />
        </Canvas>
      </div>
    </div>
  );
}
