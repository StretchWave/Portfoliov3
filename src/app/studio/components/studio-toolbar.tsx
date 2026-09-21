"use client";

import { useEditor } from "../state/editor-context";
import type { TransformMode } from "../state/editor-reducer";

interface StudioToolbarProps {
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onFocusSelected?: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

export function StudioToolbar({
  isLeftPanelOpen,
  isRightPanelOpen,
  onToggleLeftPanel,
  onToggleRightPanel,
  onFocusSelected,
  showGrid,
  onToggleGrid,
}: StudioToolbarProps) {
  const {
    state,
    setTransformMode,
    setTransformSpace,
    setPivotMode,
    setTransformOrientation,
    toggleSnap,
    setSnapMode,
    dropToSurface,
    selectedObject,
    updateObject,
  } = useEditor();

  const handleResetTransform = () => {
    if (!selectedObject) return;
    updateObject(
      selectedObject.id,
      {
        transform: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
      },
      `Reset Transform ${selectedObject.label ?? selectedObject.id}`,
    );
  };

  const transformTools: {
    mode: TransformMode;
    label: string;
    key: string;
    description: string;
    icon: string;
  }[] = [
    {
      mode: "select",
      label: "Select",
      key: "Q",
      description: "Selection tool (Q)",
      icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5",
    },
    {
      mode: "translate",
      label: "Move",
      key: "G",
      description: "Grab / Translate object (G or W)",
      icon: "M4 12h16m-16 0l4-4m-4 4l4 4m12-4l-4-4m4 4l-4 4",
    },
    {
      mode: "rotate",
      label: "Rotate",
      key: "R",
      description: "Rotate object (R or E)",
      icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    },
    {
      mode: "scale",
      label: "Scale",
      key: "S",
      description: "Scale object (S or R)",
      icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4",
    },
  ];

  const handleSelectCameraView = (view: "front" | "right" | "top" | "focus") => {
    window.dispatchEvent(
      new CustomEvent("studio:set-camera-view", { detail: { view } }),
    );
  };

  return (
    <div className="flex h-9 w-full shrink-0 items-center justify-between border-b border-zinc-800/70 bg-zinc-950/80 px-2.5 select-none z-20 font-sans text-xs">
      {/* Left: Categorized Groups */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {/* Category 1: Transform Tools */}
        <div className="flex rounded-md border border-zinc-800/90 bg-zinc-900/80 p-0.5 shadow-xs">
          {transformTools.map((tool) => {
            const isActive = state.transformMode === tool.mode;
            return (
              <button
                key={tool.mode}
                type="button"
                onClick={() => setTransformMode(tool.mode)}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent"
                }`}
                title={tool.description}
              >
                <svg
                  className="h-3 w-3 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
                </svg>
                <span>{tool.label}</span>
                <span className="text-[10px] font-mono text-zinc-500">[{tool.key}]</span>
              </button>
            );
          })}
        </div>

        <div className="h-4 w-[1px] bg-zinc-800/80 shrink-0" />

        {/* Category 2: Transform Orientation, Pivot & Snapping */}
        <div className="flex items-center gap-1.5">
          {/* Transform Orientation (World, Local, View) */}
          <div className="relative flex items-center">
            <select
              value={state.transformOrientation}
              onChange={(e) => setTransformOrientation(e.target.value as any)}
              className="appearance-none rounded border border-zinc-800/80 bg-zinc-900/60 pl-2 pr-6 py-1 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
              title="Transform Orientation (World, Local, View)"
            >
              <option value="world">Orientation: World</option>
              <option value="local">Orientation: Local</option>
              <option value="view">Orientation: View</option>
            </select>
            <div className="pointer-events-none absolute right-1.5 text-zinc-500 text-[9px]">
              ▼
            </div>
          </div>

          {/* Pivot Point Selector (Median, Active, 3D Cursor) */}
          <div className="relative flex items-center">
            <select
              value={state.pivotMode}
              onChange={(e) => setPivotMode(e.target.value as any)}
              className="appearance-none rounded border border-zinc-800/80 bg-zinc-900/60 pl-2 pr-6 py-1 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
              title="Pivot Point (Median Point, Active Element, 3D Cursor)"
            >
              <option value="median">Pivot: Median Point</option>
              <option value="active">Pivot: Active Element</option>
              <option value="cursor">Pivot: 3D Cursor</option>
            </select>
            <div className="pointer-events-none absolute right-1.5 text-zinc-500 text-[9px]">
              ▼
            </div>
          </div>

          {/* Snapping Toggle */}
          {/* Snapping Controls */}
          <div className="flex items-center rounded border border-zinc-800/80 bg-zinc-900/60 p-0.5">
            <button
              type="button"
              onClick={() => toggleSnap()}
              className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                state.snapEnabled
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
              }`}
              title="Toggle Snapping [Ctrl / Shift+Tab]"
            >
              <svg
                className="h-3 w-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span>Snap</span>
            </button>

            <select
              value={state.snapMode}
              onChange={(e) => setSnapMode(e.target.value as any)}
              className="appearance-none bg-transparent px-1.5 py-0.5 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer"
              title="Snap Target Mode"
            >
              <option value="increment" className="bg-zinc-900 text-zinc-200">
                Grid
              </option>
              <option value="vertex" className="bg-zinc-900 text-zinc-200">
                Vertex
              </option>
              <option value="surface" className="bg-zinc-900 text-zinc-200">
                Surface
              </option>
            </select>

            {/* Grid Step Increment Selector */}
            {state.snapMode === "increment" && (
              <select
                value={state.snapStep}
                onChange={(e) => setSnapMode("increment", parseFloat(e.target.value))}
                className="appearance-none border-l border-zinc-800/80 bg-transparent pl-1.5 pr-1 py-0.5 text-[10px] font-mono text-amber-400 hover:text-amber-300 focus:outline-none cursor-pointer"
                title="Grid Snapping Step Size"
              >
                <option value={0.1} className="bg-zinc-900 text-zinc-200">0.1m</option>
                <option value={0.25} className="bg-zinc-900 text-zinc-200">0.25m</option>
                <option value={0.5} className="bg-zinc-900 text-zinc-200">0.5m</option>
                <option value={1.0} className="bg-zinc-900 text-zinc-200">1.0m</option>
                <option value={2.0} className="bg-zinc-900 text-zinc-200">2.0m</option>
              </select>
            )}
          </div>

          {/* Quick Action: Drop to Surface */}
          <button
            type="button"
            onClick={() => dropToSurface()}
            disabled={!selectedObject}
            className={`flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition-colors ${
              selectedObject
                ? "border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-900/40 hover:text-cyan-100 cursor-pointer"
                : "border-zinc-800/40 bg-zinc-900/30 text-zinc-600 cursor-not-allowed"
            }`}
            title="Drop selected object flush to the floor or surface beneath it (End)"
          >
            <span className="text-[11px]">⬇</span>
            <span>Drop to Surface</span>
          </button>

          {/* Viewport Grid Toggle */}
          <button
            type="button"
            onClick={onToggleGrid}
            className={`flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors ${
              showGrid
                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-medium"
                : "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
            title="Toggle ground reference grid in viewport"
          >
            <svg
              className="h-3 w-3 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16M6 4v16M12 4v16M18 4v16"
              />
            </svg>
            <span>Grid</span>
          </button>
        </div>

        <div className="h-4 w-[1px] bg-zinc-800/80 shrink-0" />

        {/* Category 3: Camera Alignment & Focus */}
        <div className="flex items-center gap-1">
          {/* Camera Views Preset Dropdown */}
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                handleSelectCameraView(e.target.value as any);
                e.target.value = "";
              }
            }}
            className="rounded border border-zinc-800/80 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-700 hover:text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
            title="Switch aligned camera angle"
          >
            <option value="" disabled>
              Camera View ▼
            </option>
            <option value="front">Front View [1]</option>
            <option value="right">Right View [3]</option>
            <option value="top">Top View [7]</option>
            <option value="focus">Focus Selected [F]</option>
          </select>

          {/* Focus Camera on Object */}
          <button
            type="button"
            disabled={!selectedObject}
            onClick={onFocusSelected}
            className="flex items-center gap-1 rounded border border-zinc-800/80 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-700 hover:text-white disabled:opacity-30 disabled:hover:border-zinc-800/80 disabled:hover:text-zinc-300 transition-colors"
            title="Focus camera view on selected object (F or .)"
          >
            <svg
              className="h-3 w-3 text-cyan-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="3" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12h3m12 0h3M12 3v3m0 12v3"
              />
            </svg>
            <span>Focus</span>
            <span className="text-[10px] font-mono text-zinc-500">[F]</span>
          </button>

          {/* Reset Transform */}
          {selectedObject && (
            <button
              type="button"
              onClick={handleResetTransform}
              className="rounded border border-zinc-800/80 bg-zinc-900/60 px-2 py-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
              title="Reset position, rotation and scale to origin defaults (Alt+G)"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Right: Panel Visibility Toggles */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Toggle Hierarchy Sidebar */}
        <button
          type="button"
          onClick={onToggleLeftPanel}
          className={`flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors ${
            isLeftPanelOpen
              ? "border-zinc-700 bg-zinc-800/90 text-zinc-200 font-medium"
              : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-300"
          }`}
          title={`${isLeftPanelOpen ? "Collapse" : "Expand"} Scene Hierarchy [[]`}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
          </svg>
          <span className="hidden md:inline">Hierarchy</span>
        </button>

        {/* Toggle Inspector Sidebar */}
        <button
          type="button"
          onClick={onToggleRightPanel}
          className={`flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors ${
            isRightPanelOpen
              ? "border-zinc-700 bg-zinc-800/90 text-zinc-200 font-medium"
              : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-300"
          }`}
          title={`${isRightPanelOpen ? "Collapse" : "Expand"} Inspector Panel []]`}
        >
          <span className="hidden md:inline">Inspector</span>
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M15 3v18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
