"use client";

import { useState } from "react";
import Link from "next/link";
import { worldAreaIds, type WorldAreaId } from "@/types/portfolio";
import type { StudioOverlaysConfig } from "../state/editor-reducer";
import { useEditor } from "../state/editor-context";

const AREA_LABELS: Record<WorldAreaId, string> = {
  "atlas-hub": "Atlas Central Hub",
  "software-district": "Software Systems District",
  "intelligence-observatory": "Intelligence Observatory",
  "creative-workshop": "Creative Workshop",
};

const OVERLAY_ITEMS: { key: keyof StudioOverlaysConfig; label: string; icon: string }[] = [
  { key: "colliders", label: "Colliders", icon: "📦" },
  { key: "triggers", label: "Triggers", icon: "⚡" },
  { key: "roomBounds", label: "Room Bounds", icon: "📐" },
  { key: "spawnPoints", label: "Spawn Points", icon: "📍" },
  { key: "grid", label: "Ground Grid", icon: "▦" },
  { key: "cursor3D", label: "3D Cursor", icon: "⊕" },
];

interface StudioTopBarProps {
  onOpenSceneData: () => void;
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  onOpenRoomManagement?: () => void;
  onOpenAppContent?: () => void;
  onOpenImportImagePlane?: () => void;
}

export function StudioTopBar({
  onOpenSceneData,
  onOpenCommandPalette,
  onOpenShortcuts,
  onOpenRoomManagement,
  onOpenAppContent,
  onOpenImportImagePlane,
}: StudioTopBarProps) {
  const {
    state,
    setActiveArea,
    setActiveRoom,
    activeRoom,
    toggleOverlay,
    setAppContentOpen,
    setEditorMode,
    undo,
    redo,
    canUndo,
    canRedo,
    saveStatus,
    saveError,
    saveToProject,
    setIsReviewOpen,
  } = useEditor();

  const [isOverlaysOpen, setIsOverlaysOpen] = useState(false);

  const currentArea = state.scene.areas[state.activeAreaId];
  const rooms = currentArea?.rooms && currentArea.rooms.length > 0
    ? currentArea.rooms
    : [{ id: "default", name: "Default Room" }];

  return (
    <header className="flex h-11 w-full shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950 px-3 select-none z-30 font-sans">
      {/* Left: Brand, District & Room Selector, Save Status */}
      <div className="flex items-center gap-2">
        {/* Brand Link */}
        <Link
          href="/"
          className="group flex items-center gap-2 rounded px-1.5 py-1 text-xs font-semibold tracking-wide text-zinc-200 hover:text-white transition-colors"
          title="Return to conventional portfolio"
        >
          <div className="flex h-4 w-4 items-center justify-center rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400 font-mono font-bold group-hover:bg-cyan-500/20">
            A
          </div>
          <span className="font-mono text-xs font-medium tracking-wider text-zinc-100 hidden sm:inline">
            Atlas Studio
          </span>
        </Link>

        <span className="text-zinc-700 font-mono text-xs">/</span>

        {/* District Selector */}
        <div className="relative flex items-center">
          <select
            value={state.activeAreaId}
            onChange={(e) => setActiveArea(e.target.value as WorldAreaId)}
            className="appearance-none rounded border border-zinc-800 bg-zinc-900/90 pl-2.5 pr-7 py-1 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-700 focus:border-cyan-500 focus:outline-none cursor-pointer max-w-[140px] md:max-w-[180px] truncate"
            title="Switch active world district"
          >
            {worldAreaIds.map((id) => (
              <option key={id} value={id} className="bg-zinc-900 text-zinc-200">
                {AREA_LABELS[id] ?? id}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 text-zinc-500 text-[10px]">
            ▼
          </div>
        </div>

        {/* Room Selector & Management */}
        <div className="flex items-center gap-1">
          <div className="relative flex items-center">
            <select
              value={state.activeRoomId || rooms[0]?.id || "default"}
              onChange={(e) => setActiveRoom(e.target.value)}
              className="appearance-none rounded border border-cyan-900/40 bg-zinc-900/90 pl-2.5 pr-6 py-1 text-xs font-medium text-cyan-300 transition-colors hover:border-cyan-700 focus:border-cyan-500 focus:outline-none cursor-pointer max-w-[110px] md:max-w-[160px] truncate"
              title="Switch active room within district"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id} className="bg-zinc-900 text-zinc-200">
                  {r.name || r.id}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 text-cyan-600 text-[9px]">
              ▼
            </div>
          </div>

          {onOpenRoomManagement && (
            <button
              type="button"
              onClick={onOpenRoomManagement}
              className="flex h-6 w-6 items-center justify-center rounded border border-zinc-850 bg-zinc-900/80 text-zinc-400 hover:text-cyan-300 hover:border-zinc-700 transition-colors cursor-pointer"
              title="Manage Rooms, bounds, and templates"
            >
              <span className="text-[11px]">⊞</span>
            </button>
          )}
        </div>

        {/* Save / Status Indicator */}
        <div className="ml-1 flex items-center gap-1.5">
          {saveStatus === "saving" ? (
            <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-medium text-cyan-400">
              <div className="h-2 w-2 animate-spin rounded-full border border-cyan-400 border-t-transparent" />
              <span>Saving...</span>
            </div>
          ) : saveStatus === "error" ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => saveToProject({ force: true })}
                className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/25 transition-colors cursor-pointer shadow-xs"
                title={`${saveError ?? "Save failed"}. Click to force save / retry.`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                <span>Save Error (Retry)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className="rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Review error details and diffs"
              >
                Review
              </button>
            </div>
          ) : state.isDirty ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => saveToProject()}
                className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer shadow-xs"
                title="Unsaved changes in project. Click to Save to Project Source (Ctrl+S)"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Save</span>
                <span className="font-mono text-[9px] opacity-70">Ctrl+S</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className="rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Review unsaved changes before saving"
              >
                Diff
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 rounded-full border border-zinc-800/80 bg-zinc-900/60 px-2 py-0.5 text-[11px] font-medium text-zinc-400"
              title={`All changes saved to project source (Revision ${state.savedRevision})${
                state.lastSavedTimestamp
                  ? ` at ${new Date(state.lastSavedTimestamp).toLocaleTimeString()}`
                  : ""
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Saved</span>
              <span className="font-mono text-[9px] text-zinc-500">r{state.savedRevision}</span>
            </div>
          )}
        </div>
      </div>

      {/* Center: Segmented Mode Switcher (Edit vs Interaction vs Preview) */}
      <div className="flex items-center gap-3">
        <div
          role="radiogroup"
          aria-label="Editor Mode"
          className="flex rounded-md border border-zinc-800/90 bg-zinc-900/80 p-0.5 shadow-inner"
        >
          <button
            type="button"
            role="radio"
            aria-checked={state.editorMode === "edit"}
            onClick={() => setEditorMode("edit")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              state.editorMode === "edit"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs border border-cyan-500/30"
                : "text-zinc-400 hover:text-zinc-200 border border-transparent"
            }`}
            title="Edit Mode (3D Transforms & Scene authoring)"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span>Edit</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={state.editorMode === "interaction"}
            onClick={() => setEditorMode("interaction")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              state.editorMode === "interaction"
                ? "bg-amber-500/20 text-amber-300 font-semibold shadow-xs border border-amber-500/30"
                : "text-zinc-400 hover:text-zinc-200 border border-transparent"
            }`}
            title="Interaction Mode (Author runtime actions, triggers, and exhibits)"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Interaction</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={state.editorMode === "preview"}
            onClick={() => setEditorMode("preview")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              state.editorMode === "preview"
                ? "bg-emerald-500/20 text-emerald-300 font-semibold shadow-xs border border-emerald-500/30"
                : "text-zinc-400 hover:text-zinc-200 border border-transparent"
            }`}
            title="Preview Mode (Playtest runtime interactions [Space])"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Preview</span>
          </button>
        </div>

        {/* 3D Cursor Coordinates Indicator */}
        <div
          className="hidden lg:flex items-center gap-1 font-mono text-[10px] text-zinc-500 bg-zinc-900/60 border border-zinc-800/80 rounded px-2 py-0.5"
          title="3D Cursor Position [Shift+S]"
        >
          <span className="text-red-400 font-semibold">⊕</span>
          <span>
            [{state.cursor3D[0].toFixed(1)}, {state.cursor3D[1].toFixed(1)}, {state.cursor3D[2].toFixed(1)}]
          </span>
        </div>
      </div>

      {/* Right: Secondary Actions + Primary Launch Runtime */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 border-r border-zinc-800/80 pr-1.5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={undo}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10h10a5 5 0 015 5v2a5 5 0 01-5 5H6"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 6L3 10l4 4"
              />
            </svg>
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            type="button"
            disabled={!canRedo}
            onClick={redo}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 10H11a5 5 0 00-5 5v2a5 5 0 005 5h7"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 6l4 4-4 4"
              />
            </svg>
            <span className="hidden sm:inline">Redo</span>
          </button>
        </div>

        {/* Overlays Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOverlaysOpen(!isOverlaysOpen)}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              state.overlays.colliders || state.overlays.triggers || state.overlays.roomBounds
                ? "border-cyan-500/50 bg-cyan-950/40 text-cyan-300"
                : "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:text-white"
            }`}
            title="Toggle Viewport Overlays (Colliders, Triggers, Bounds, Grid)"
          >
            <span className="text-[10px]">👁</span>
            <span className="hidden md:inline">Overlays</span>
            <span className="text-[9px] opacity-70">▼</span>
          </button>

          {isOverlaysOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOverlaysOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-48 rounded-lg border border-zinc-800 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80 mb-1">
                  Viewport Overlays
                </div>
                {OVERLAY_ITEMS.map((item) => {
                  const active = !!state.overlays[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleOverlay(item.key)}
                      className="flex w-full items-center justify-between rounded px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800/80 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          active ? "bg-cyan-400 shadow-xs shadow-cyan-400/50" : "bg-zinc-700"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* App Content Editor Trigger */}
        <button
          type="button"
          onClick={() => {
            if (onOpenAppContent) onOpenAppContent();
            else setAppContentOpen(true);
          }}
          className="flex items-center gap-1.5 rounded border border-purple-500/40 bg-purple-950/30 px-2.5 py-1 text-xs font-medium text-purple-300 hover:border-purple-400 hover:bg-purple-900/40 transition-colors cursor-pointer"
          title="Author Site Identity, Hero, About, Careers, SEO, and Social Links"
        >
          <span className="text-[11px]">📝</span>
          <span className="hidden sm:inline">App Content</span>
        </button>

        {/* Import Image as Plane */}
        {onOpenImportImagePlane && (
          <button
            type="button"
            onClick={onOpenImportImagePlane}
            className="flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-950/30 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/40 transition-colors cursor-pointer"
            title="Import image file or URL as 3D Plane Mesh"
          >
            <span className="text-[11px]">🖼️</span>
            <span className="hidden lg:inline">Image Plane</span>
          </button>
        )}

        {/* Scene Data Export / Import */}
        <button
          type="button"
          onClick={onOpenSceneData}
          className="flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
          title="Export / Import Portable Scene JSON snapshot"
        >
          <svg
            className="h-3.5 w-3.5 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span className="hidden md:inline">Export / Import</span>
        </button>

        {/* Shortcuts Dialog Trigger */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900/80 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
          title="Keyboard shortcuts cheat sheet (F1)"
        >
          <span className="text-[10px]">⌨️</span>
          <span className="hidden lg:inline">Shortcuts</span>
        </button>

        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1 rounded border border-zinc-800/80 bg-zinc-900/60 px-2 py-1 text-[11px] font-mono text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
          title="Open Command Palette (Ctrl+K)"
        >
          <span>⌘K</span>
        </button>

        {/* Primary Action: Launch Runtime */}
        <Link
          href="/interactive"
          className="flex items-center gap-1.5 rounded bg-cyan-500 px-3 py-1 text-xs font-semibold text-zinc-950 hover:bg-cyan-400 shadow-xs transition-colors"
          title="Launch interactive 3D portfolio runtime"
        >
          <span>Runtime</span>
          <span className="text-[11px] font-bold">→</span>
        </Link>
      </div>
    </header>
  );
}
