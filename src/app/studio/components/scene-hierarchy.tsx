"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { getAllProjects } from "@/features/portfolio/project-registry";
import type { SceneObject } from "@/types/scene";
import type { WorldAreaId } from "@/types/portfolio";
import { useEditor } from "../state/editor-context";

interface ContextMenuState {
  x: number;
  y: number;
  objectId: string;
}

interface SceneHierarchyProps {
  onOpenImportImagePlane?: () => void;
}

export function SceneHierarchy({ onOpenImportImagePlane }: SceneHierarchyProps = {}) {
  const {
    currentAreaScene,
    state,
    selectObject,
    selectObjectToggle,
    deleteObject,
    duplicateObject,
    updateObject,
    addObject,
  } = useEditor();

  const [filterQuery, setFilterQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isHierarchyMenuOpen, setIsHierarchyMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const hierMenuRef = useRef<HTMLDivElement>(null);

  // Folder collapse states (default collapse architecture to prevent a 41-item wall of noise)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    environment: true,
    architecture: false, // Collapsed by default so 41 objects don't overwhelm the viewport
    lighting: true,
    decorations: true,
    portals: true,
    interactive: true,
    exhibits: false,
  });

  const toggleFolder = (key: string) => {
    setExpandedFolders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setExpandedFolders({
      root: true,
      environment: true,
      architecture: true,
      lighting: true,
      decorations: true,
      portals: true,
      interactive: true,
      exhibits: true,
    });
    setIsHierarchyMenuOpen(false);
  };

  const collapseAll = () => {
    setExpandedFolders({
      root: true,
      environment: true,
      architecture: false,
      lighting: false,
      decorations: false,
      portals: false,
      interactive: false,
      exhibits: false,
    });
    setIsHierarchyMenuOpen(false);
  };

  // Close menus on outside click or escape
  useEffect(() => {
    const handleWindowClick = () => {
      setContextMenu(null);
      setIsAddMenuOpen(false);
      setIsHierarchyMenuOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu(null);
        setIsAddMenuOpen(false);
        setIsHierarchyMenuOpen(false);
        setEditingId(null);
      }
    };

    window.addEventListener("click", handleWindowClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleWindowClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filtered objects
  const filteredObjects = useMemo(() => {
    if (!filterQuery.trim()) return currentAreaScene.objects;
    const q = filterQuery.toLowerCase();
    return currentAreaScene.objects.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        (o.label && o.label.toLowerCase().includes(q)) ||
        o.type.toLowerCase().includes(q),
    );
  }, [currentAreaScene.objects, filterQuery]);

  // Grouped objects
  const grouped = useMemo(() => {
    const arch: SceneObject[] = [];
    const lights: SceneObject[] = [];
    const portals: SceneObject[] = [];
    const decorations: SceneObject[] = [];
    const interactive: SceneObject[] = [];

    for (const obj of filteredObjects) {
      if (obj.type === "architecture") arch.push(obj);
      else if (obj.type === "point-light") lights.push(obj);
      else if (obj.type === "portal") portals.push(obj);
      else if (obj.type === "decoration") decorations.push(obj);
      else interactive.push(obj);
    }

    return { architecture: arch, lights, portals, decorations, interactive };
  }, [filteredObjects]);

  // Area exhibits
  const areaExhibits = useMemo(() => {
    return getAllProjects().filter((p) => p.exhibit?.area === currentAreaScene.id);
  }, [currentAreaScene.id]);

  const handleCreateObject = useCallback(
    (
      type:
        | "point-light"
        | "portal"
        | "wall"
        | "column"
        | "platform"
        | "ring"
        | "teleport-point"
        | "trigger-volume"
        | "audio-source"
        | "info-display"
        | "image-plane"
        | "project-exhibit",
    ) => {
      setIsAddMenuOpen(false);
      const suffix = Date.now().toString(36).slice(-4);

      if (type === "image-plane") {
        onOpenImportImagePlane?.();
        return;
      } else if (type === "project-exhibit") {
        const firstProject = getAllProjects()[0];
        addObject({
          id: `exhibit-${suffix}`,
          type: "info-display",
          label: `${firstProject ? firstProject.name : "Project"} Exhibit`,
          title: `${firstProject ? firstProject.name : "Project"} Exhibit`,
          transform: { position: [0, 1.2, 0] },
          interaction: {
            enabled: true,
            trigger: "click",
            prompt: `Inspect ${firstProject ? firstProject.name : "Project"}`,
            actions: [
              {
                type: "show-project",
                projectId: firstProject?.id ?? "",
              },
            ],
          },
        });
        setExpandedFolders((p) => ({ ...p, interactive: true }));
        return;
      }

    if (type === "point-light") {
      addObject({
        id: `light-${suffix}`,
        type: "point-light",
        label: `Point Light ${suffix}`,
        transform: { position: [0, 3, 0] },
        color: "#ffffff",
        intensity: 8,
        distance: 10,
        castShadow: true,
      });
      setExpandedFolders((p) => ({ ...p, lighting: true }));
    } else if (type === "portal") {
      addObject({
        id: `portal-${suffix}`,
        type: "portal",
        label: `Portal Gateway ${suffix}`,
        transform: { position: [0, 0, 0] },
        targetArea: "software-district",
        targetLabel: "Software District",
        accent: "#818cf8",
      });
      setExpandedFolders((p) => ({ ...p, portals: true }));
    } else if (type === "wall") {
      addObject({
        id: `wall-${suffix}`,
        type: "architecture",
        moduleType: "wall-segment",
        label: `Wall Segment ${suffix}`,
        transform: { position: [0, 1.5, 0] },
        props: { width: 4, axis: "x", height: 3, thickness: 0.4 },
      });
      setExpandedFolders((p) => ({ ...p, architecture: true }));
    } else if (type === "column") {
      addObject({
        id: `column-${suffix}`,
        type: "architecture",
        moduleType: "column",
        label: `Pillar Column ${suffix}`,
        transform: { position: [0, 2, 0] },
        props: { height: 4, size: 0.8, accentCaps: true },
      });
      setExpandedFolders((p) => ({ ...p, architecture: true }));
    } else if (type === "platform") {
      addObject({
        id: `platform-${suffix}`,
        type: "architecture",
        moduleType: "mesh-primitive",
        label: `Platform Base ${suffix}`,
        transform: { position: [0, 0, 0] },
        props: {
          geometry: "box",
          args: [6, 0.4, 6],
          material: "floor",
          receiveShadow: true,
        },
      });
      setExpandedFolders((p) => ({ ...p, architecture: true }));
    } else if (type === "ring") {
      addObject({
        id: `ring-${suffix}`,
        type: "decoration",
        moduleType: "floating-ring",
        label: `Floating Ring ${suffix}`,
        transform: { position: [0, 2, 0] },
        props: { color: "#06b6d4", speed: 1 },
      });
      setExpandedFolders((p) => ({ ...p, decorations: true }));
    } else if (type === "teleport-point") {
      addObject({
        id: `teleport-${suffix}`,
        type: "teleport-point",
        label: `Teleport Point ${suffix}`,
        transform: { position: [0, 0, 0] },
        targetArea: currentAreaScene.id as WorldAreaId,
        interaction: {
          enabled: true,
          trigger: "proximity",
          prompt: "Teleport",
          actions: [{ type: "teleport-player", targetArea: currentAreaScene.id as WorldAreaId }],
        },
      });
      setExpandedFolders((p) => ({ ...p, interactive: true }));
    } else if (type === "trigger-volume") {
      addObject({
        id: `trigger-${suffix}`,
        type: "trigger-volume",
        label: `Trigger Volume ${suffix}`,
        transform: { position: [0, 1, 0] },
        dimensions: [2, 2, 2],
        interaction: {
          enabled: true,
          trigger: "proximity",
          range: 3,
          actions: [{ type: "play-sound", soundId: "chime" }],
        },
      });
      setExpandedFolders((p) => ({ ...p, interactive: true }));
    } else if (type === "audio-source") {
      addObject({
        id: `audio-${suffix}`,
        type: "audio-source",
        label: `Audio Source ${suffix}`,
        transform: { position: [0, 2, 0] },
        soundId: "ambient-chime",
        volume: 0.8,
        loop: true,
        range: 5,
        interaction: {
          enabled: true,
          trigger: "proximity",
          range: 5,
          actions: [{ type: "play-sound", soundId: "ambient-chime" }],
        },
      });
      setExpandedFolders((p) => ({ ...p, interactive: true }));
    } else if (type === "info-display") {
      addObject({
        id: `info-${suffix}`,
        type: "info-display",
        label: `Info Terminal ${suffix}`,
        transform: { position: [0, 1.2, 0] },
        title: `Terminal ${suffix}`,
        description: "System overview and documentation specifications.",
        interaction: {
          enabled: true,
          trigger: "click",
          prompt: "Read Documentation",
          actions: [
            {
              type: "show-information",
              title: `Terminal ${suffix}`,
              description: "System overview and documentation specifications.",
            },
          ],
        },
      });
      setExpandedFolders((p) => ({ ...p, interactive: true }));
    }
  }, [addObject, currentAreaScene.id, onOpenImportImagePlane]);

  const handleStartRename = (obj: SceneObject) => {
    setEditingId(obj.id);
    setEditingLabel(obj.label ?? obj.id);
  };

  const handleSaveRename = (objId: string) => {
    if (editingLabel.trim()) {
      updateObject(objId, { label: editingLabel.trim() }, `Rename to ${editingLabel.trim()}`);
    }
    setEditingId(null);
  };

  const handleContextMenu = (e: React.MouseEvent, objectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    selectObject(objectId);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      objectId,
    });
  };

  const handleFocusSelected = (objId: string) => {
    selectObject(objId);
    window.dispatchEvent(new CustomEvent("studio:focus-selected"));
  };

  // Add menu categories
  const creationCategories = [
    {
      name: "3D Primitives",
      items: [
        { label: "Wall Segment", type: "wall" as const, icon: "🧱" },
        { label: "Pillar Column", type: "column" as const, icon: "🏛️" },
        { label: "Platform Base", type: "platform" as const, icon: "⬛" },
      ],
    },
    {
      name: "Lighting",
      items: [{ label: "Point Light", type: "point-light" as const, icon: "💡" }],
    },
    {
      name: "Interactive & Gameplay",
      items: [
        { label: "Project Exhibit", type: "project-exhibit" as const, icon: "📦" },
        { label: "Portal Gateway", type: "portal" as const, icon: "🌀" },
        { label: "Teleport Point", type: "teleport-point" as const, icon: "📍" },
        { label: "Trigger Volume", type: "trigger-volume" as const, icon: "🔲" },
        { label: "Audio Source", type: "audio-source" as const, icon: "🔊" },
        { label: "Info Terminal", type: "info-display" as const, icon: "📋" },
      ],
    },
    {
      name: "Decorations & Media",
      items: [
        { label: "Image as Plane", type: "image-plane" as const, icon: "🖼️" },
        { label: "Floating Ring", type: "ring" as const, icon: "✨" },
      ],
    },
  ];

  return (
    <aside className="flex h-full w-full flex-col bg-zinc-950/90 text-zinc-300 backdrop-blur-md select-none border-r border-zinc-800/80 overflow-hidden font-sans">
      {/* Hierarchy Header Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/80 px-2.5 py-1.5 bg-zinc-900/40">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Hierarchy
          </span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.2 font-mono text-[10px] text-zinc-400 font-medium">
            {currentAreaScene.objects.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Add Object Dropdown Trigger */}
          <div className="relative" ref={addMenuRef} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsAddMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-colors cursor-pointer"
              title="Add 3D object to scene"
            >
              <span>+ Add</span>
              <span className="text-[9px]">▼</span>
            </button>

            {isAddMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-zinc-800 bg-zinc-900/95 p-1 shadow-2xl z-50 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-75">
                {creationCategories.map((cat) => (
                  <div key={cat.name} className="py-0.5">
                    <div className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                      {cat.name}
                    </div>
                    {cat.items.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => handleCreateObject(item.type)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-zinc-300 hover:bg-zinc-800 hover:text-cyan-300 transition-colors"
                      >
                        <span className="text-xs">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* More Options Dropdown (Expand/Collapse All) */}
          <div className="relative" ref={hierMenuRef} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsHierarchyMenuOpen((p) => !p)}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              title="Hierarchy display options"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {isHierarchyMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-md border border-zinc-800 bg-zinc-900/95 p-1 shadow-2xl z-50 text-xs backdrop-blur-md">
                <button
                  type="button"
                  onClick={expandAll}
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-zinc-300 hover:bg-zinc-800 hover:text-cyan-300"
                >
                  <span>Expand All</span>
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-zinc-300 hover:bg-zinc-800 hover:text-cyan-300"
                >
                  <span>Collapse All</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="shrink-0 border-b border-zinc-800/80 px-2 py-1.5 bg-zinc-950">
        <div className="relative flex items-center">
          <svg
            className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search objects..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full rounded border border-zinc-800/80 bg-zinc-900/60 pl-7 pr-6 py-0.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery("")}
              className="absolute right-2 text-zinc-500 hover:text-zinc-300 text-xs"
              title="Clear filter"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tree View (Scrolls independently) */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1.5 font-sans text-xs space-y-0.5">
        {/* District Root Node */}
        <div className="select-none">
          <div
            onClick={() => toggleFolder("root")}
            className="flex items-center gap-1.5 rounded px-1.5 py-1 text-zinc-200 hover:bg-zinc-900 cursor-pointer font-medium text-xs"
          >
            <span className="text-[10px] text-zinc-500 w-3 text-center">
              {expandedFolders.root ? "▼" : "▶"}
            </span>
            <span className="text-cyan-400 text-xs">🌐</span>
            <span className="truncate">{currentAreaScene.metadata.name}</span>
          </div>

          {(expandedFolders.root || Boolean(filterQuery)) && (
            <div className="ml-2 pl-2 border-l border-zinc-800/80 space-y-0.5 mt-0.5">
              {/* Category: Environment */}
              <div>
                <div
                  onClick={() => toggleFolder("environment")}
                  className="flex items-center justify-between rounded px-1.5 py-0.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 cursor-pointer text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-zinc-500 w-3 text-center">
                      {expandedFolders.environment || Boolean(filterQuery) ? "▼" : "▶"}
                    </span>
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-400">
                      Environment
                    </span>
                  </div>
                </div>

                {(expandedFolders.environment || Boolean(filterQuery)) && (
                  <div className="ml-2 pl-2 border-l border-zinc-800/60 space-y-0.5 mt-0.5">
                    {/* Architecture Subgroup */}
                    <div>
                      <div
                        onClick={() => toggleFolder("architecture")}
                        className="flex items-center justify-between rounded px-1.5 py-0.5 text-zinc-300 hover:bg-zinc-900 cursor-pointer text-[11px]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-zinc-500 w-3 text-center">
                            {expandedFolders.architecture || Boolean(filterQuery) ? "▼" : "▶"}
                          </span>
                          <span className="text-slate-400">🏛️</span>
                          <span>Architecture</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-1 rounded">
                          {grouped.architecture.length}
                        </span>
                      </div>

                      {(expandedFolders.architecture || Boolean(filterQuery)) && (
                        <div className="ml-2 pl-2 border-l border-zinc-800/40 space-y-0.5 mt-0.5">
                          {grouped.architecture.map((obj) => (
                            <SceneItemRow
                              key={obj.id}
                              obj={obj}
                              isSelected={
                                state.selectedObjectId === obj.id ||
                                state.selectedObjectIds.includes(obj.id)
                              }
                              isActive={state.selectedObjectId === obj.id}
                              editingId={editingId}
                              editingLabel={editingLabel}
                              onSelect={(e) => {
                                if (e.shiftKey) selectObjectToggle(obj.id);
                                else selectObject(obj.id);
                              }}
                              onContextMenu={(e) => handleContextMenu(e, obj.id)}
                              onStartRename={() => handleStartRename(obj)}
                              onEditingLabelChange={setEditingLabel}
                              onSaveRename={() => handleSaveRename(obj.id)}
                              onToggleVisibility={() =>
                                updateObject(obj.id, { visible: obj.visible === false ? true : false })
                              }
                              onOpenMenu={(e) => handleContextMenu(e, obj.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lighting Subgroup */}
                    <div>
                      <div
                        onClick={() => toggleFolder("lighting")}
                        className="flex items-center justify-between rounded px-1.5 py-0.5 text-zinc-300 hover:bg-zinc-900 cursor-pointer text-[11px]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-zinc-500 w-3 text-center">
                            {expandedFolders.lighting || Boolean(filterQuery) ? "▼" : "▶"}
                          </span>
                          <span className="text-amber-400">💡</span>
                          <span>Lighting</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-1 rounded">
                          {grouped.lights.length}
                        </span>
                      </div>

                      {(expandedFolders.lighting || Boolean(filterQuery)) && (
                        <div className="ml-2 pl-2 border-l border-zinc-800/40 space-y-0.5 mt-0.5">
                          {grouped.lights.map((obj) => (
                            <SceneItemRow
                              key={obj.id}
                              obj={obj}
                              isSelected={
                                state.selectedObjectId === obj.id ||
                                state.selectedObjectIds.includes(obj.id)
                              }
                              isActive={state.selectedObjectId === obj.id}
                              editingId={editingId}
                              editingLabel={editingLabel}
                              onSelect={(e) => {
                                if (e.shiftKey) selectObjectToggle(obj.id);
                                else selectObject(obj.id);
                              }}
                              onContextMenu={(e) => handleContextMenu(e, obj.id)}
                              onStartRename={() => handleStartRename(obj)}
                              onEditingLabelChange={setEditingLabel}
                              onSaveRename={() => handleSaveRename(obj.id)}
                              onToggleVisibility={() =>
                                updateObject(obj.id, { visible: obj.visible === false ? true : false })
                              }
                              onOpenMenu={(e) => handleContextMenu(e, obj.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Decorations Subgroup */}
                    <div>
                      <div
                        onClick={() => toggleFolder("decorations")}
                        className="flex items-center justify-between rounded px-1.5 py-0.5 text-zinc-300 hover:bg-zinc-900 cursor-pointer text-[11px]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-zinc-500 w-3 text-center">
                            {expandedFolders.decorations || Boolean(filterQuery) ? "▼" : "▶"}
                          </span>
                          <span className="text-cyan-400">✨</span>
                          <span>Decorations</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-1 rounded">
                          {grouped.decorations.length}
                        </span>
                      </div>

                      {(expandedFolders.decorations || Boolean(filterQuery)) && (
                        <div className="ml-2 pl-2 border-l border-zinc-800/40 space-y-0.5 mt-0.5">
                          {grouped.decorations.map((obj) => (
                            <SceneItemRow
                              key={obj.id}
                              obj={obj}
                              isSelected={
                                state.selectedObjectId === obj.id ||
                                state.selectedObjectIds.includes(obj.id)
                              }
                              isActive={state.selectedObjectId === obj.id}
                              editingId={editingId}
                              editingLabel={editingLabel}
                              onSelect={(e) => {
                                if (e.shiftKey) selectObjectToggle(obj.id);
                                else selectObject(obj.id);
                              }}
                              onContextMenu={(e) => handleContextMenu(e, obj.id)}
                              onStartRename={() => handleStartRename(obj)}
                              onEditingLabelChange={setEditingLabel}
                              onSaveRename={() => handleSaveRename(obj.id)}
                              onToggleVisibility={() =>
                                updateObject(obj.id, { visible: obj.visible === false ? true : false })
                              }
                              onOpenMenu={(e) => handleContextMenu(e, obj.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Category: Portals */}
              <div>
                <div
                  onClick={() => toggleFolder("portals")}
                  className="flex items-center justify-between rounded px-1.5 py-0.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 cursor-pointer text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-zinc-500 w-3 text-center">
                      {expandedFolders.portals || Boolean(filterQuery) ? "▼" : "▶"}
                    </span>
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-400">
                      Portals
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-1 rounded">
                    {grouped.portals.length}
                  </span>
                </div>

                {(expandedFolders.portals || Boolean(filterQuery)) && (
                  <div className="ml-2 pl-2 border-l border-zinc-800/60 space-y-0.5 mt-0.5">
                    {grouped.portals.map((obj) => (
                      <SceneItemRow
                        key={obj.id}
                        obj={obj}
                        isSelected={
                          state.selectedObjectId === obj.id ||
                          state.selectedObjectIds.includes(obj.id)
                        }
                        isActive={state.selectedObjectId === obj.id}
                        editingId={editingId}
                        editingLabel={editingLabel}
                        onSelect={(e) => {
                          if (e.shiftKey) selectObjectToggle(obj.id);
                          else selectObject(obj.id);
                        }}
                        onContextMenu={(e) => handleContextMenu(e, obj.id)}
                        onStartRename={() => handleStartRename(obj)}
                        onEditingLabelChange={setEditingLabel}
                        onSaveRename={() => handleSaveRename(obj.id)}
                        onToggleVisibility={() =>
                          updateObject(obj.id, { visible: obj.visible === false ? true : false })
                        }
                        onOpenMenu={(e) => handleContextMenu(e, obj.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Category: Interactive Objects (Teleport points, Triggers, Audio, Info displays) */}
              {grouped.interactive.length > 0 && (
                <div>
                  <div
                    onClick={() => toggleFolder("interactive")}
                    className="flex items-center justify-between rounded px-1.5 py-0.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 cursor-pointer text-[11px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-zinc-500 w-3 text-center">
                        {expandedFolders.interactive || Boolean(filterQuery) ? "▼" : "▶"}
                      </span>
                      <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-400">
                        Interactive
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-1 rounded">
                      {grouped.interactive.length}
                    </span>
                  </div>

                  {(expandedFolders.interactive || Boolean(filterQuery)) && (
                    <div className="ml-2 pl-2 border-l border-zinc-800/60 space-y-0.5 mt-0.5">
                      {grouped.interactive.map((obj) => (
                        <SceneItemRow
                          key={obj.id}
                          obj={obj}
                          isSelected={
                            state.selectedObjectId === obj.id ||
                            state.selectedObjectIds.includes(obj.id)
                          }
                          isActive={state.selectedObjectId === obj.id}
                          editingId={editingId}
                          editingLabel={editingLabel}
                          onSelect={(e) => {
                            if (e.shiftKey) selectObjectToggle(obj.id);
                            else selectObject(obj.id);
                          }}
                          onContextMenu={(e) => handleContextMenu(e, obj.id)}
                          onStartRename={() => handleStartRename(obj)}
                          onEditingLabelChange={setEditingLabel}
                          onSaveRename={() => handleSaveRename(obj.id)}
                          onToggleVisibility={() =>
                            updateObject(obj.id, { visible: obj.visible === false ? true : false })
                          }
                          onOpenMenu={(e) => handleContextMenu(e, obj.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Category: Exhibits */}
              {areaExhibits.length > 0 && (
                <div>
                  <div
                    onClick={() => toggleFolder("exhibits")}
                    className="flex items-center justify-between rounded px-1.5 py-0.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 cursor-pointer text-[11px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-zinc-500 w-3 text-center">
                        {expandedFolders.exhibits || Boolean(filterQuery) ? "▼" : "▶"}
                      </span>
                      <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-400">
                        Exhibits
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-1 rounded">
                      {areaExhibits.length}
                    </span>
                  </div>

                  {(expandedFolders.exhibits || Boolean(filterQuery)) && (
                    <div className="ml-2 pl-2 border-l border-zinc-800/60 space-y-0.5 mt-0.5">
                      {areaExhibits.map((project) => {
                        const existingObj = currentAreaScene.objects.find(
                          (o) =>
                            o.id === `exhibit-${project.id}` ||
                            o.id === `exhibit-${project.slug}` ||
                            o.interaction?.actions?.some((a) => a.projectId === project.id),
                        );
                        const isSelected = existingObj
                          ? state.selectedObjectId === existingObj.id
                          : state.selectedObjectId === `exhibit-${project.slug}` ||
                            state.selectedObjectId === `exhibit-${project.id}`;

                        return (
                          <div
                            key={project.id}
                            onClick={() => {
                              if (existingObj) {
                                selectObject(existingObj.id);
                              } else {
                                const exId = `exhibit-${project.id}`;
                                addObject({
                                  id: exId,
                                  type: "info-display",
                                  label: `${project.name} Exhibit`,
                                  title: `${project.name} Exhibit`,
                                  transform: {
                                    position: project.exhibit?.position
                                      ? [
                                          project.exhibit.position[0],
                                          project.exhibit.position[1],
                                          project.exhibit.position[2],
                                        ]
                                      : [0, 1.2, 0],
                                  },
                                  interaction: {
                                    enabled: true,
                                    trigger: "click",
                                    prompt: `Inspect ${project.name}`,
                                    actions: [
                                      {
                                        type: "show-project",
                                        projectId: project.id,
                                      },
                                    ],
                                  },
                                });
                                selectObject(exId);
                              }
                            }}
                            className={`flex items-center justify-between rounded px-1.5 py-0.5 text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-cyan-500/20 text-cyan-200 border-l-2 border-cyan-400 font-medium"
                                : "text-zinc-300 hover:bg-zinc-900/80 hover:text-zinc-100"
                            }`}
                            title={
                              existingObj
                                ? "Select and configure exhibit in Inspector"
                                : "Add to Scene Objects to configure interaction, transform & snapping"
                            }
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-cyan-400 shrink-0 text-xs">📦</span>
                              <span className="truncate">{project.name}</span>
                            </div>
                            <span className="text-[9px] font-mono text-zinc-500">
                              {existingObj ? "Configured" : "+ Control"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Item Context Menu (Dropdown from ••• or Right-Click in tree) */}
      {contextMenu && (
        <div
          role="menu"
          style={{
            top: Math.min(contextMenu.y, window.innerHeight - 200),
            left: Math.min(contextMenu.x, window.innerWidth - 180),
          }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-44 rounded-md border border-zinc-800 bg-zinc-900/95 p-1 shadow-2xl text-xs font-sans text-zinc-200 backdrop-blur-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              handleFocusSelected(contextMenu.objectId);
              setContextMenu(null);
            }}
            className="flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-zinc-800 hover:text-cyan-300"
          >
            <span>Focus Camera</span>
            <kbd className="text-[10px] font-mono text-zinc-500">F</kbd>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const target = currentAreaScene.objects.find((o) => o.id === contextMenu.objectId);
              if (target) {
                updateObject(target.id, { visible: target.visible === false ? true : false });
              }
              setContextMenu(null);
            }}
            className="flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-zinc-800 hover:text-cyan-300"
          >
            <span>Toggle Visibility</span>
            <kbd className="text-[10px] font-mono text-zinc-500">H</kbd>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const target = currentAreaScene.objects.find((o) => o.id === contextMenu.objectId);
              if (target) handleStartRename(target);
              setContextMenu(null);
            }}
            className="flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-zinc-800 hover:text-cyan-300"
          >
            <span>Rename</span>
            <kbd className="text-[10px] font-mono text-zinc-500">F2</kbd>
          </button>
          <div className="h-[1px] bg-zinc-800 my-1" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              duplicateObject(contextMenu.objectId);
              setContextMenu(null);
            }}
            className="flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-zinc-800 hover:text-cyan-300"
          >
            <span>Duplicate</span>
            <kbd className="text-[10px] font-mono text-zinc-500">Shift+D</kbd>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              deleteObject(contextMenu.objectId);
              setContextMenu(null);
            }}
            className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
          >
            <span>Delete</span>
            <kbd className="text-[10px] font-mono text-rose-500">X</kbd>
          </button>
        </div>
      )}
    </aside>
  );
}

interface SceneItemRowProps {
  obj: SceneObject;
  isSelected: boolean;
  isActive: boolean;
  editingId: string | null;
  editingLabel: string;
  onSelect: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onStartRename: () => void;
  onEditingLabelChange: (val: string) => void;
  onSaveRename: () => void;
  onToggleVisibility: () => void;
  onOpenMenu: (e: React.MouseEvent) => void;
}

function SceneItemRow({
  obj,
  isSelected,
  isActive,
  editingId,
  editingLabel,
  onSelect,
  onContextMenu,
  onStartRename,
  onEditingLabelChange,
  onSaveRename,
  onToggleVisibility,
  onOpenMenu,
}: SceneItemRowProps) {
  const isHidden = obj.visible === false;

  return (
    <div
      onClick={onSelect}
      onContextMenu={onContextMenu}
      onDoubleClick={onStartRename}
      className={`group flex items-center justify-between rounded px-1.5 py-0.5 text-xs transition-colors cursor-pointer ${
        isActive
          ? "bg-cyan-500/25 text-cyan-100 border-l-2 border-cyan-400 font-semibold shadow-xs"
          : isSelected
          ? "bg-cyan-950/40 text-cyan-200 border-l-2 border-cyan-600/70 font-medium"
          : isHidden
          ? "text-zinc-600 hover:bg-zinc-900/80 hover:text-zinc-400"
          : "text-zinc-300 hover:bg-zinc-900/80 hover:text-zinc-100"
      }`}
      title={`${obj.label ?? obj.id} (${obj.type}) - Shift+Click to multi-select, Double click to rename`}
    >
      {/* Left: Icon & Label */}
      <div className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1">
        <span className="text-[10px] text-zinc-500 shrink-0">
          {obj.type === "point-light" && "💡"}
          {obj.type === "portal" && "🌀"}
          {obj.type === "architecture" && "▫️"}
          {obj.type === "decoration" && "✨"}
          {obj.type === "teleport-point" && "📍"}
          {obj.type === "trigger-volume" && "🔲"}
          {obj.type === "audio-source" && "🔊"}
          {obj.type === "info-display" && "📋"}
        </span>

        {editingId === obj.id ? (
          <input
            type="text"
            value={editingLabel}
            autoFocus
            onChange={(e) => onEditingLabelChange(e.target.value)}
            onBlur={onSaveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveRename();
              if (e.key === "Escape") onEditingLabelChange(obj.label ?? obj.id);
            }}
            className="w-28 rounded border border-cyan-500 bg-zinc-900 px-1 py-0 text-xs text-white focus:outline-none"
          />
        ) : (
          <span className="truncate font-sans">{obj.label ?? obj.id}</span>
        )}
      </div>

      {/* Right: Hover-Only Actions [👁️] and [•••] */}
      <div
        className={`flex items-center gap-0.5 shrink-0 ${
          isHidden ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        } transition-opacity`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toggle Visibility */}
        <button
          type="button"
          onClick={onToggleVisibility}
          className="rounded p-0.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          title={isHidden ? "Show Object (H)" : "Hide Object (H)"}
        >
          {isHidden ? (
            <svg className="h-3.5 w-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>

        {/* More Actions Menu Button (•••) */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded p-0.5 text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800 transition-colors"
          title="More actions"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
