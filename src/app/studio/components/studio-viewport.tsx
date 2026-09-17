"use client";

import { useEditor } from "../state/editor-context";
import { EditViewport } from "./edit-viewport";
import { PreviewViewport } from "./preview-viewport";

interface StudioViewportProps {
  showGrid?: boolean;
  wireframeMode?: boolean;
  onOpenContextMenu?: (x: number, y: number) => void;
  onShowProject?: (projectId: string) => void;
}

export function StudioViewport({
  showGrid = true,
  wireframeMode = false,
  onOpenContextMenu,
  onShowProject,
}: StudioViewportProps) {
  const { state } = useEditor();

  if (state.editorMode === "preview") {
    return <PreviewViewport />;
  }

  return (
    <EditViewport
      showGrid={showGrid}
      wireframeMode={wireframeMode}
      onOpenContextMenu={onOpenContextMenu}
      onShowProject={onShowProject}
    />
  );
}
