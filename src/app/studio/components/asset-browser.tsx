"use client";

import { useState } from "react";

const SYNTH_SOUNDS = [
  { id: "ambient-hum", name: "Deep Ambient World Drone", type: "Procedural WebAudio Oscillator" },
  { id: "portal-enter", name: "Spatial Portal Shift", type: "Swept Frequency FM Filter" },
  { id: "exhibit-chime", name: "Interactive Plinth Proximity", type: "Dual Sine Bell Chime" },
  { id: "telemetry-ping", name: "Data Stream Packet", type: "Bandpass Resonant Pulse" },
  { id: "footstep-tap", name: "Floor Impact Resonance", type: "Filtered Noise Burst" },
];

const ASSET_DIRECTORIES = [
  { path: "/public/models", label: "3D Models (.glb / .gltf)", count: 0, status: "Procedural Primitives Active" },
  { path: "/public/textures", label: "PBR Textures & Normal Maps", count: 0, status: "Shared Procedural Materials Active" },
  { path: "/public/images", label: "Project Imagery & Thumbnails", count: 0, status: "Ready for External Media" },
];

export function AssetBrowser() {
  const [activeTab, setActiveTab] = useState<"audio" | "filesystem">("audio");

  return (
    <div className="flex h-full w-full flex-col bg-transparent select-none overflow-hidden">
      <div className="border-b border-zinc-800/80 p-3 bg-zinc-900/40">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
          Asset & Media Explorer
        </span>
        <div className="flex rounded border border-slate-800 bg-slate-900 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("audio")}
            className={`flex-1 rounded py-1 text-xs font-medium transition ${
              activeTab === "audio"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Spatial Audio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("filesystem")}
            className={`flex-1 rounded py-1 text-xs font-medium transition ${
              activeTab === "filesystem"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            File System
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
        {activeTab === "audio" ? (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Synthesized Audio Assets
            </span>
            <p className="text-[11px] text-slate-400 font-sans">
              Project Atlas synthesizes all sound effects on-the-fly using the Web Audio API without loading external media files.
            </p>
            <div className="space-y-1.5 pt-1">
              {SYNTH_SOUNDS.map((s) => (
                <div
                  key={s.id}
                  className="rounded border border-slate-800 bg-slate-900/60 p-2 space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-200 font-semibold">
                    <span>{s.name}</span>
                    <span className="text-[10px] text-cyan-400">DSP</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{s.type}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Storage Buckets
            </span>
            <div className="space-y-2">
              {ASSET_DIRECTORIES.map((dir) => (
                <div
                  key={dir.path}
                  className="rounded border border-slate-800 bg-slate-900/60 p-2.5 space-y-1"
                >
                  <div className="text-slate-200 font-semibold">{dir.label}</div>
                  <div className="text-[11px] text-slate-500">{dir.path}</div>
                  <div className="text-[10px] text-emerald-400/80">{dir.status}</div>
                </div>
              ))}
            </div>
            <div className="rounded border border-dashed border-slate-800 p-3 text-center text-[11px] text-slate-500 font-sans">
              To import GLTF/GLB models or custom textures, place them in <code className="text-slate-400">public/models/</code> and reference their relative path in scene definitions.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
