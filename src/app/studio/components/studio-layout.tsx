"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { validateScene } from "@/lib/scene-validation";
import { getProjectById } from "@/features/portfolio/project-registry";
import { ProjectInformationPanel } from "@/three/experience/project-information-panel";
import { useEditor } from "../state/editor-context";
import type { ActivePanel } from "../state/editor-reducer";
import { AssetBrowser } from "./asset-browser";
import { StudioCommandPalette } from "./command-palette-studio";
import { EnvironmentEditor } from "./environment-editor";
import { ImportExportDialog } from "./import-export-dialog";
import { InspectorPanel } from "./inspector-panel";
import { PanelResizer } from "./panel-resizer";
import { ProjectEditor } from "./project-editor";
import { SceneHierarchy } from "./scene-hierarchy";
import { StudioStatusBar } from "./studio-status-bar";
import { StudioToolbar } from "./studio-toolbar";
import { StudioTopBar } from "./studio-top-bar";
import { StudioViewport } from "./studio-viewport";
import { ValidationPanel } from "./validation-panel";
import { ViewportContextMenu, type AddObjectType } from "./viewport-context-menu";
import { ShortcutsDialog } from "./shortcuts-dialog";
import { SnapCursorMenu } from "./snap-cursor-menu";
import { RenameDialog } from "./rename-dialog";
import { ChangeReviewDialog } from "./change-review-dialog";
import { RecoveryPromptDialog } from "./recovery-prompt-dialog";
import { RoomManagementDialog } from "./room-management-dialog";
import { AppContentEditor } from "./app-content-editor";
import { ImportImagePlaneDialog } from "./import-image-plane-dialog";
import { handleStudioKeyDown } from "../systems/studio-input-router";
import type { StudioCommandContext } from "../systems/studio-commands";

export function StudioLayout() {
  const {
    state,
    dispatch,
    undo,
    redo,
    setTransformMode,
    deleteObject,
    duplicateObject,
    setActivePanel,
    setEditorMode,
    setAppContentOpen,
    selectedObject,
    selectedObjects,
    selectObject,
    selectAll,
    deselectAll,
    startModalTransform,
    addObject,
    updateObject,
    currentAreaScene,
    saveStatus,
    saveError,
    validationErrors,
    isReviewOpen,
    setIsReviewOpen,
    recoverySnapshot,
    restoreRecoverySnapshot,
    discardRecoverySnapshot,
    saveToProject,
  } = useEditor();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSnapMenuOpen, setIsSnapMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isRoomManagementOpen, setIsRoomManagementOpen] = useState(false);
  const [isImagePlaneDialogOpen, setIsImagePlaneDialogOpen] = useState(false);
  const [previewProjectId, setPreviewProjectId] = useState<string | null>(null);
  const [previewInfo, setPreviewInfo] = useState<{ title: string; description?: string } | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Panel Dimensions & Visibility
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("atlas_studio_left_width");
        if (saved) {
          const val = parseInt(saved, 10);
          if (!isNaN(val) && val >= 220 && val <= 440) return val;
        }
      } catch {}
    }
    return 270;
  });

  const [rightPanelWidth, setRightPanelWidth] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("atlas_studio_right_width");
        if (saved) {
          const val = parseInt(saved, 10);
          if (!isNaN(val) && val >= 280 && val <= 500) return val;
        }
      } catch {}
    }
    return 330;
  });

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const handleResizeLeft = useCallback((newWidth: number) => {
    setLeftPanelWidth(newWidth);
    try {
      localStorage.setItem("atlas_studio_left_width", String(newWidth));
    } catch {
      // Ignore write errors
    }
  }, []);

  const handleResizeRight = useCallback((newWidth: number) => {
    setRightPanelWidth(newWidth);
    try {
      localStorage.setItem("atlas_studio_right_width", String(newWidth));
    } catch {
      // Ignore write errors
    }
  }, []);

  const handleFocusSelected = useCallback(() => {
    window.dispatchEvent(new CustomEvent("studio:focus-selected"));
  }, []);

  const handleAddObject = useCallback(
    (type: AddObjectType) => {
      if (type === "image-plane") {
        setIsImagePlaneDialogOpen(true);
        return;
      }
      const suffix = Date.now().toString(36).slice(-4);
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
      } else if (type === "wall") {
        addObject({
          id: `wall-${suffix}`,
          type: "architecture",
          moduleType: "wall-segment",
          label: `Wall Segment ${suffix}`,
          transform: { position: [0, 1.5, 0] },
          props: { width: 4, axis: "x", height: 3, thickness: 0.4 },
        });
      } else if (type === "column") {
        addObject({
          id: `column-${suffix}`,
          type: "architecture",
          moduleType: "column",
          label: `Pillar Column ${suffix}`,
          transform: { position: [0, 2, 0] },
          props: { height: 4, size: 0.8, accentCaps: true },
        });
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
      } else if (type === "ring") {
        addObject({
          id: `ring-${suffix}`,
          type: "decoration",
          moduleType: "floating-ring",
          label: `Floating Ring ${suffix}`,
          transform: { position: [0, 2, 0] },
          props: { color: "#06b6d4", speed: 1 },
        });
      }
    },
    [addObject],
  );

  // Compute validation issues for tab badge
  const validationSummary = useMemo(() => {
    const res = validateScene(state.scene);
    const errors = res.errors.filter((e) => e.severity === "error").length;
    const warnings = res.errors.filter((e) => e.severity === "warning").length;
    return { errors, warnings, total: errors + warnings };
  }, [state.scene]);

  // Command execution context for keyboard router & command palette
  const commandContext: StudioCommandContext = useMemo(
    () => ({
      state,
      dispatch,
      selectObject,
      selectAll,
      deselectAll,
      startModalTransform,
      duplicateObject,
      deleteObject,
      undo,
      redo,
      openCommandPalette: () => setIsCommandPaletteOpen(true),
      openSceneData: () => setIsImportExportOpen(true),
      openShortcuts: () => setIsShortcutsOpen(true),
      openRenameModal: () => setIsRenameOpen(true),
      openSnapMenu: () => setIsSnapMenuOpen(true),
      toggleGrid: () => setShowGrid((p) => !p),
      toggleWireframe: () => setWireframeMode((p) => !p),
      toggleInspector: () => setIsRightPanelOpen((p) => !p),
      toggleHierarchy: () => setIsLeftPanelOpen((p) => !p),
      setCameraView: (view) =>
        window.dispatchEvent(
          new CustomEvent("studio:set-camera-view", { detail: { view } }),
        ),
      setEditorMode,
      openAddMenu: () => {
        // Open the viewport context menu centered in the viewport
        const viewportEl = document.querySelector('[class*="bg-zinc-950"][class*="flex-1"]');
        const rect = viewportEl?.getBoundingClientRect();
        const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
        setContextMenuPos({ x: cx, y: cy });
      },
      saveToProject,
      openChangeReview: () => setIsReviewOpen(true),
    }),
    [
      state,
      dispatch,
      selectObject,
      selectAll,
      deselectAll,
      startModalTransform,
      duplicateObject,
      deleteObject,
      undo,
      redo,
      setEditorMode,
      saveToProject,
      setIsReviewOpen,
    ],
  );

  // Global Context-Aware Keyboard Router
  useEffect(() => {
    const isDialogOpen =
      isCommandPaletteOpen ||
      isImportExportOpen ||
      isShortcutsOpen ||
      isSnapMenuOpen ||
      isRenameOpen ||
      Boolean(previewProjectId) ||
      Boolean(previewInfo);

    const handleCloseAllDialogs = () => {
      setIsCommandPaletteOpen(false);
      setIsImportExportOpen(false);
      setIsShortcutsOpen(false);
      setIsSnapMenuOpen(false);
      setIsRenameOpen(false);
      setPreviewProjectId(null);
      setPreviewInfo(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      handleStudioKeyDown(e, commandContext, isDialogOpen, handleCloseAllDialogs);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    commandContext,
    isCommandPaletteOpen,
    isImportExportOpen,
    isShortcutsOpen,
    isSnapMenuOpen,
    isRenameOpen,
    previewProjectId,
    previewInfo,
  ]);

  // Right Panel Tabs
  const rightPanelTabs: { id: ActivePanel; label: string }[] = [
    { id: "inspector", label: "Inspector" },
    { id: "environment", label: "Environment" },
    { id: "projects", label: "Projects" },
    { id: "assets", label: "Assets" },
    { id: "validation", label: "Health" },
  ];

  const [isMoreTabsOpen, setIsMoreTabsOpen] = useState(false);

  // Responsive tab splitting based on inspector width
  const visibleTabs =
    rightPanelWidth < 340
      ? rightPanelTabs.slice(0, 2)
      : rightPanelTabs.slice(0, 4);
  const overflowTabs =
    rightPanelWidth < 340
      ? rightPanelTabs.slice(2)
      : rightPanelTabs.slice(4);

  // If activePanel is "hierarchy" in state, display inspector in right panel
  const activeRightTab = state.activePanel === "hierarchy" ? "inspector" : state.activePanel;
  const isMoreActive = overflowTabs.some((t) => t.id === activeRightTab);

  // Close More tabs menu when clicking outside
  useEffect(() => {
    if (!isMoreTabsOpen) return;
    const handleClose = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") {
        setIsMoreTabsOpen(false);
      } else if (e instanceof MouseEvent) {
        setIsMoreTabsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClose);
    window.addEventListener("keydown", handleClose);
    return () => {
      window.removeEventListener("mousedown", handleClose);
      window.removeEventListener("keydown", handleClose);
    };
  }, [isMoreTabsOpen]);

  return (
    <div className="fixed inset-0 h-[100dvh] w-full flex flex-col overflow-hidden bg-zinc-950 text-zinc-100 antialiased font-sans select-none">
      {/* Tier 1: Studio Top Bar */}
      <StudioTopBar
        onOpenSceneData={() => setIsImportExportOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenRoomManagement={() => setIsRoomManagementOpen(true)}
        onOpenAppContent={() => setAppContentOpen(true)}
        onOpenImportImagePlane={() => setIsImagePlaneDialogOpen(true)}
      />

      {/* Tier 2: Secondary Toolbar (Tools, Space, Grid, Focus, Panel Toggles) */}
      <StudioToolbar
        isLeftPanelOpen={isLeftPanelOpen}
        isRightPanelOpen={isRightPanelOpen}
        onToggleLeftPanel={() => setIsLeftPanelOpen((p) => !p)}
        onToggleRightPanel={() => setIsRightPanelOpen((p) => !p)}
        onFocusSelected={handleFocusSelected}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((p) => !p)}
      />

      {/* Main Workspace: Left Hierarchy | 3D Viewport | Right Multi-Tab Inspector */}
      <main className="flex flex-1 min-h-0 min-w-0 w-full overflow-hidden relative">
        {/* Left Hierarchy Panel */}
        {isLeftPanelOpen && (
          <>
            <div
              style={{ width: leftPanelWidth }}
              className="flex h-full min-h-0 shrink-0 flex-col overflow-hidden"
            >
              <SceneHierarchy onOpenImportImagePlane={() => setIsImagePlaneDialogOpen(true)} />
            </div>

            {/* Left Draggable Resizer */}
            <PanelResizer
              side="left"
              currentWidth={leftPanelWidth}
              minWidth={220}
              maxWidth={440}
              onResize={handleResizeLeft}
              onResetDefault={() => handleResizeLeft(270)}
            />
          </>
        )}

        {/* Central 3D Canvas Viewport - Dominant, fully stretched */}
        <div
          className="flex-1 min-w-0 min-h-0 h-full relative overflow-hidden bg-zinc-950"
          style={{ isolation: "isolate", zIndex: 1 }}
        >
          <div className="absolute inset-0 h-full w-full">
            <StudioViewport
              showGrid={showGrid}
              wireframeMode={wireframeMode}
              onOpenContextMenu={(x, y) => setContextMenuPos({ x, y })}
              onShowProject={(id) => setPreviewProjectId(id)}
            />
          </div>
        </div>

        {/* Right Dynamic Panel & Tab Hub */}
        {isRightPanelOpen && (
          <>
            {/* Right Draggable Resizer */}
            <PanelResizer
              side="right"
              currentWidth={rightPanelWidth}
              minWidth={280}
              maxWidth={500}
              onResize={handleResizeRight}
              onResetDefault={() => handleResizeRight(330)}
            />

            <div
              style={{ width: rightPanelWidth }}
              className="flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-l border-zinc-800/80 bg-zinc-950"
            >
              {/* Right Panel Tab Strip - Responsive with Overflow Menu */}
              <div className="flex h-8 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-1.5 font-sans overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-0.5 shrink-0">
                  {visibleTabs.map((tab) => {
                    const isActive = activeRightTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActivePanel(tab.id)}
                        className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium shrink-0 transition-colors ${
                          isActive
                            ? "bg-zinc-800 text-cyan-300 font-semibold shadow-xs"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.id === "validation" && validationSummary.total > 0 && (
                          <span
                            className={`rounded-full px-1 py-0.2 font-mono text-[9px] font-bold ${
                              validationSummary.errors > 0
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {validationSummary.total}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Overflow 'More ▾' Dropdown */}
                  {overflowTabs.length > 0 && (
                    <div
                      className="relative shrink-0"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setIsMoreTabsOpen((p) => !p)}
                        className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium shrink-0 transition-colors ${
                          isMoreActive
                            ? "bg-zinc-800 text-cyan-300 font-semibold shadow-xs"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                        title="More panels"
                      >
                        <span>
                          {isMoreActive
                            ? (rightPanelTabs.find((t) => t.id === activeRightTab)?.label ?? "More")
                            : "More"}
                        </span>
                        <span className="text-[9px] opacity-70">▾</span>
                        {validationSummary.total > 0 &&
                          overflowTabs.some((t) => t.id === "validation") && (
                            <span
                              className={`rounded-full px-1 py-0.2 font-mono text-[9px] font-bold ${
                                validationSummary.errors > 0
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {validationSummary.total}
                            </span>
                          )}
                      </button>

                      {isMoreTabsOpen && (
                        <div className="absolute right-0 top-full mt-1 w-36 rounded-md border border-zinc-700/80 bg-zinc-900 py-1 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                          {overflowTabs.map((tab) => {
                            const isTabActive = activeRightTab === tab.id;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                  setActivePanel(tab.id);
                                  setIsMoreTabsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1 text-left text-xs transition-colors ${
                                  isTabActive
                                    ? "bg-cyan-950/60 text-cyan-300 font-semibold"
                                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                }`}
                              >
                                <span>{tab.label}</span>
                                {tab.id === "validation" && validationSummary.total > 0 && (
                                  <span
                                    className={`rounded-full px-1 py-0.2 font-mono text-[9px] font-bold ${
                                      validationSummary.errors > 0
                                        ? "bg-rose-500/20 text-rose-400"
                                        : "bg-amber-500/20 text-amber-400"
                                    }`}
                                  >
                                    {validationSummary.total}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel Content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {activeRightTab === "inspector" && <InspectorPanel />}
                {activeRightTab === "environment" && <EnvironmentEditor />}
                {activeRightTab === "projects" && <ProjectEditor />}
                {activeRightTab === "assets" && <AssetBrowser />}
                {activeRightTab === "validation" && <ValidationPanel />}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Bottom Status Bar */}
      <StudioStatusBar />

      {/* Viewport 3D Context Menu (Blender RMB) */}
      {contextMenuPos && (
        <ViewportContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          hasSelection={Boolean(state.selectedObjectId)}
          selectedLabel={selectedObject?.label ?? state.selectedObjectId ?? undefined}
          onClose={() => setContextMenuPos(null)}
          onSelectTool={setTransformMode}
          onFocus={handleFocusSelected}
          onDuplicate={() => {
            if (state.selectedObjectId) duplicateObject(state.selectedObjectId);
          }}
          onDelete={() => {
            if (state.selectedObjectId) deleteObject(state.selectedObjectId);
          }}
          onToggleVisibility={() => {
            if (selectedObject) {
              updateObject(selectedObject.id, {
                visible: selectedObject.visible === false ? true : false,
              });
            }
          }}
          onResetTransform={() => {
            if (selectedObject) {
              updateObject(selectedObject.id, {
                transform: {
                  position: [0, 0, 0],
                  rotation: [0, 0, 0],
                  scale: [1, 1, 1],
                },
              });
            }
          }}
          onDeselect={() => selectObject(null)}
          onAddObject={handleAddObject}
          onOpenImportImagePlane={() => setIsImagePlaneDialogOpen(true)}
        />
      )}

      {/* Overlays / Modals */}
      <StudioCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
      />

      {isImportExportOpen && (
        <ImportExportDialog onClose={() => setIsImportExportOpen(false)} />
      )}

      {/* Change Review Dialog */}
      {isReviewOpen && (
        <ChangeReviewDialog
          savedScene={state.savedScene}
          currentScene={state.scene}
          errorMessage={saveError}
          onClose={() => setIsReviewOpen(false)}
          onSave={async () => {
            const ok = await saveToProject();
            if (ok) setIsReviewOpen(false);
          }}
          onForceSave={async () => {
            const ok = await saveToProject({ force: true });
            if (ok) setIsReviewOpen(false);
          }}
          isSaving={saveStatus === "saving"}
        />
      )}

      {/* Local Recovery Prompt Dialog */}
      {recoverySnapshot && (
        <RecoveryPromptDialog
          snapshot={recoverySnapshot}
          onRestore={restoreRecoverySnapshot}
          onDiscard={discardRecoverySnapshot}
        />
      )}

      {/* Shortcuts Help Modal */}
      <ShortcutsDialog
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* 3D Cursor Snap Menu (Shift+S) */}
      <SnapCursorMenu
        isOpen={isSnapMenuOpen}
        onClose={() => setIsSnapMenuOpen(false)}
      />

      {/* Rename Dialog (F2) */}
      <RenameDialog
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
      />

      {/* Runtime Project Information Modal (Show Project Action) */}
      {previewProjectId && getProjectById(previewProjectId) && (
        <ProjectInformationPanel
          project={getProjectById(previewProjectId)!}
          onClose={() => setPreviewProjectId(null)}
        />
      )}

      {/* Runtime Information Notice (Show Information Action) */}
      {previewInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="max-w-md w-full rounded-xl border border-cyan-500/40 bg-zinc-900/95 p-5 shadow-2xl text-zinc-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-semibold text-cyan-300 font-sans">{previewInfo.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewInfo(null)}
                className="rounded p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{previewInfo.description}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewInfo(null)}
                className="rounded bg-cyan-600 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-500 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Room Management Modal */}
      <RoomManagementDialog
        isOpen={isRoomManagementOpen}
        onClose={() => setIsRoomManagementOpen(false)}
      />

      {/* App Content Authoring Modal */}
      <AppContentEditor
        isOpen={state.isAppContentOpen}
        onClose={() => setAppContentOpen(false)}
      />

      {/* Import Image as Plane Dialog */}
      <ImportImagePlaneDialog
        isOpen={isImagePlaneDialogOpen}
        onClose={() => setIsImagePlaneDialogOpen(false)}
      />
    </div>
  );
}
export default StudioLayout;
