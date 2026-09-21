"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

import { getDefaultAtlasScene } from "@/data/scenes";
import type { WorldAreaId } from "@/types/portfolio";
import type {
  AreaSceneDefinition,
  AtlasSceneDefinition,
  ColliderDefinition,
  EnvironmentConfig,
  RoomDefinition,
  SceneObject,
  Vec3,
} from "@/types/scene";
import type { AppContent } from "@/types/content";
import type { ValidationError } from "@/lib/scene-validation";
import { defaultPersistenceAdapter } from "../persistence/scene-persistence-adapter";
import {
  getRecoverySnapshot,
  saveRecoverySnapshot,
  clearRecoverySnapshot,
  type RecoverySnapshot,
} from "../persistence/local-recovery";

import {
  createInitialEditorState,
  editorReducer,
  type ActivePanel,
  type EditorAction,
  type EditorMode,
  type EditorState,
  type ModalTransformState,
  type PivotMode,
  type SnapMode,
  type StudioOverlaysConfig,
  type TransformMode,
  type TransformOrientation,
  type TransformSpace,
} from "./editor-reducer";
import { canRedo as canRedoHistory, canUndo as canUndoHistory } from "./history";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface EditorContextValue {
  state: EditorState;
  dispatch: (action: EditorAction) => void;
  // Derived / Convenience
  currentAreaScene: AreaSceneDefinition;
  selectedObject: SceneObject | null;
  selectedObjects: SceneObject[];
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  validationErrors: readonly ValidationError[];
  isReviewOpen: boolean;
  setIsReviewOpen: (open: boolean) => void;
  recoverySnapshot: RecoverySnapshot | null;
  restoreRecoverySnapshot: () => void;
  discardRecoverySnapshot: () => void;
  saveToProject: (options?: { force?: boolean }) => Promise<boolean>;
  selectObject: (id: string | null) => void;
  selectObjectToggle: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setActiveArea: (areaId: WorldAreaId) => void;
  setEditorMode: (mode: EditorMode) => void;
  setTransformMode: (mode: TransformMode) => void;
  setTransformSpace: (space: TransformSpace) => void;
  setPivotMode: (mode: PivotMode) => void;
  setTransformOrientation: (orientation: TransformOrientation) => void;
  toggleSnap: (enabled?: boolean) => void;
  setSnapMode: (mode: SnapMode, step?: number) => void;
  setSnapRotationStep: (step: number) => void;
  setSnapScaleStep: (step: number) => void;
  dropToSurface: (padding?: number) => void;
  set3DCursor: (position: Vec3) => void;
  setActivePanel: (panel: ActivePanel) => void;
  updateObject: (id: string, patch: Partial<SceneObject>, historyLabel?: string) => void;
  batchUpdateObjects: (
    updates: { id: string; patch: Partial<SceneObject> }[],
    historyLabel?: string,
  ) => void;
  renameObject: (objectId: string, label: string) => void;
  addObject: (object: SceneObject, areaId?: WorldAreaId, historyLabel?: string) => void;
  deleteObject: (id?: string, historyLabel?: string) => void;
  duplicateObject: (id?: string, historyLabel?: string) => void;
  startModalTransform: (
    mode: "translate" | "rotate" | "scale",
    pointer: { x: number; y: number },
  ) => void;
  updateModalTransform: (patch: Partial<ModalTransformState>) => void;
  applyModalTransformPreview: (
    previewTransforms: Record<string, { position: Vec3; rotation?: Vec3; scale?: Vec3 }>,
    delta?: { translation?: Vec3; rotation?: Vec3; scale?: Vec3 },
  ) => void;
  confirmModalTransform: (
    finalTransforms?: Record<string, { position: Vec3; rotation?: Vec3; scale?: Vec3 }>,
    historyLabel?: string,
  ) => void;
  cancelModalTransform: () => void;
  executeSnapAction: (
    action:
      | "cursor-to-selected"
      | "cursor-to-origin"
      | "selection-to-cursor"
      | "selection-to-origin"
      | "cursor-to-grid",
  ) => void;
  setInteractionDebugTarget: (objectId: string | null) => void;
  updateAreaConfig: (
    areaId: WorldAreaId,
    patch: Partial<AreaSceneDefinition>,
    historyLabel?: string,
  ) => void;
  updateEnvironment: (patch: Partial<EnvironmentConfig>, historyLabel?: string) => void;
  setActiveRoom: (roomId: string) => void;
  activeRoom: RoomDefinition | null;
  toggleOverlay: (key: keyof StudioOverlaysConfig, enabled?: boolean) => void;
  setOverlays: (overlays: Partial<StudioOverlaysConfig>) => void;
  addCollider: (objectId: string, collider: ColliderDefinition, historyLabel?: string) => void;
  updateCollider: (objectId: string, colliderId: string, patch: Partial<ColliderDefinition>, historyLabel?: string) => void;
  deleteCollider: (objectId: string, colliderId: string, historyLabel?: string) => void;
  duplicateCollider: (objectId: string, colliderId: string, historyLabel?: string) => void;
  fitCollider: (objectId: string, colliderId: string, historyLabel?: string) => void;
  addRoom: (areaId: WorldAreaId, room: RoomDefinition, historyLabel?: string) => void;
  updateRoom: (areaId: WorldAreaId, roomId: string, patch: Partial<RoomDefinition>, historyLabel?: string) => void;
  deleteRoom: (areaId: WorldAreaId, roomId: string, historyLabel?: string) => void;
  duplicateRoom: (areaId: WorldAreaId, roomId: string, historyLabel?: string) => void;
  fitRoomBounds: (areaId: WorldAreaId, roomId?: string, padding?: number, historyLabel?: string) => void;
  updateAppContent: (patch: Partial<AppContent>, historyLabel?: string) => void;
  setAppContentOpen: (isOpen: boolean) => void;
  undo: () => void;
  redo: () => void;
  loadScene: (scene: AtlasSceneDefinition) => void;
  markSaved: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({
  children,
  initialScene = getDefaultAtlasScene(),
}: {
  children: ReactNode;
  initialScene?: AtlasSceneDefinition;
}) {
  const [state, dispatch] = useReducer(
    editorReducer,
    initialScene,
    createInitialEditorState,
  );

  const currentAreaScene = useMemo(() => {
    const area = state.scene.areas[state.activeAreaId];
    if (!area) {
      const fallback = getDefaultAtlasScene().areas[state.activeAreaId];
      if (!fallback) throw new Error(`Area "${state.activeAreaId}" missing from scene document.`);
      return fallback;
    }
    return area;
  }, [state.scene.areas, state.activeAreaId]);

  const selectedObject = useMemo(() => {
    if (!state.selectedObjectId) return null;
    return currentAreaScene.objects.find((o) => o.id === state.selectedObjectId) ?? null;
  }, [currentAreaScene, state.selectedObjectId]);

  const selectedObjects = useMemo(() => {
    if (state.selectedObjectIds.length === 0) {
      return selectedObject ? [selectedObject] : [];
    }
    const idSet = new Set(state.selectedObjectIds);
    return currentAreaScene.objects.filter((o) => idSet.has(o.id));
  }, [currentAreaScene.objects, state.selectedObjectIds, selectedObject]);

  const canUndo = useMemo(() => canUndoHistory(state.history), [state.history]);
  const canRedo = useMemo(() => canRedoHistory(state.history), [state.history]);

  const selectObject = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_OBJECT", objectId: id });
  }, []);

  const selectObjectToggle = useCallback((id: string) => {
    dispatch({ type: "SELECT_OBJECT_TOGGLE", objectId: id });
  }, []);

  const selectAll = useCallback(() => {
    dispatch({ type: "SELECT_ALL" });
  }, []);

  const deselectAll = useCallback(() => {
    dispatch({ type: "DESELECT_ALL" });
  }, []);

  const setActiveArea = useCallback((areaId: WorldAreaId) => {
    dispatch({ type: "SET_ACTIVE_AREA", areaId });
  }, []);

  const setEditorMode = useCallback((mode: EditorMode) => {
    dispatch({ type: "SET_EDITOR_MODE", mode });
  }, []);

  const setTransformMode = useCallback((mode: TransformMode) => {
    dispatch({ type: "SET_TRANSFORM_MODE", mode });
  }, []);

  const setTransformSpace = useCallback((space: TransformSpace) => {
    dispatch({ type: "SET_TRANSFORM_SPACE", space });
  }, []);

  const setPivotMode = useCallback((mode: PivotMode) => {
    dispatch({ type: "SET_PIVOT_MODE", mode });
  }, []);

  const setTransformOrientation = useCallback((orientation: TransformOrientation) => {
    dispatch({ type: "SET_TRANSFORM_ORIENTATION", orientation });
  }, []);

  const toggleSnap = useCallback((enabled?: boolean) => {
    dispatch({ type: "TOGGLE_SNAP", enabled });
  }, []);

  const setSnapMode = useCallback((mode: SnapMode, step?: number) => {
    dispatch({ type: "SET_SNAP_MODE", mode, step });
  }, []);

  const setSnapRotationStep = useCallback((step: number) => {
    dispatch({ type: "SET_SNAP_ROTATION_STEP", step });
  }, []);

  const setSnapScaleStep = useCallback((step: number) => {
    dispatch({ type: "SET_SNAP_SCALE_STEP", step });
  }, []);

  const dropToSurface = useCallback((padding?: number) => {
    dispatch({ type: "DROP_TO_SURFACE", padding });
  }, []);

  const set3DCursor = useCallback((position: Vec3) => {
    dispatch({ type: "SET_3D_CURSOR", position });
  }, []);

  const setActivePanel = useCallback((panel: ActivePanel) => {
    dispatch({ type: "SET_ACTIVE_PANEL", panel });
  }, []);

  const updateObject = useCallback(
    (id: string, patch: Partial<SceneObject>, historyLabel?: string) => {
      dispatch({ type: "UPDATE_OBJECT", objectId: id, patch, historyLabel });
    },
    [],
  );

  const batchUpdateObjects = useCallback(
    (updates: { id: string; patch: Partial<SceneObject> }[], historyLabel?: string) => {
      dispatch({ type: "BATCH_UPDATE_OBJECTS", updates, historyLabel });
    },
    [],
  );

  const renameObject = useCallback((objectId: string, label: string) => {
    dispatch({ type: "RENAME_OBJECT", objectId, label });
  }, []);

  const addObject = useCallback(
    (object: SceneObject, areaId?: WorldAreaId, historyLabel?: string) => {
      dispatch({ type: "ADD_OBJECT", object, areaId, historyLabel });
    },
    [],
  );

  const deleteObject = useCallback((id?: string, historyLabel?: string) => {
    dispatch({ type: "DELETE_OBJECT", objectId: id, historyLabel });
  }, []);

  const duplicateObject = useCallback((id?: string, historyLabel?: string) => {
    dispatch({ type: "DUPLICATE_OBJECT", objectId: id, historyLabel });
  }, []);

  const startModalTransform = useCallback(
    (mode: "translate" | "rotate" | "scale", pointer: { x: number; y: number }) => {
      dispatch({ type: "START_MODAL_TRANSFORM", mode, pointer });
    },
    [],
  );

  const updateModalTransform = useCallback((patch: Partial<ModalTransformState>) => {
    dispatch({ type: "UPDATE_MODAL_TRANSFORM", patch });
  }, []);

  const applyModalTransformPreview = useCallback(
    (
      previewTransforms: Record<string, { position: Vec3; rotation?: Vec3; scale?: Vec3 }>,
      delta?: { translation?: Vec3; rotation?: Vec3; scale?: Vec3 },
    ) => {
      dispatch({ type: "APPLY_MODAL_TRANSFORM_PREVIEW", previewTransforms, delta });
    },
    [],
  );

  const confirmModalTransform = useCallback(
    (
      finalTransforms?: Record<string, { position: Vec3; rotation?: Vec3; scale?: Vec3 }>,
      historyLabel?: string,
    ) => {
      dispatch({ type: "CONFIRM_MODAL_TRANSFORM", finalTransforms, historyLabel });
    },
    [],
  );

  const cancelModalTransform = useCallback(() => {
    dispatch({ type: "CANCEL_MODAL_TRANSFORM" });
  }, []);

  const executeSnapAction = useCallback(
    (
      action:
        | "cursor-to-selected"
        | "cursor-to-origin"
        | "selection-to-cursor"
        | "selection-to-origin"
        | "cursor-to-grid",
    ) => {
      dispatch({ type: "EXECUTE_SNAP_ACTION", action });
    },
    [],
  );

  const setInteractionDebugTarget = useCallback((objectId: string | null) => {
    dispatch({ type: "SET_INTERACTION_DEBUG_TARGET", objectId });
  }, []);

  const updateAreaConfig = useCallback(
    (areaId: WorldAreaId, patch: Partial<AreaSceneDefinition>, historyLabel?: string) => {
      dispatch({ type: "UPDATE_AREA_CONFIG", areaId, patch, historyLabel });
    },
    [],
  );

  const updateEnvironment = useCallback(
    (patch: Partial<EnvironmentConfig>, historyLabel?: string) => {
      dispatch({ type: "UPDATE_ENVIRONMENT", patch, historyLabel });
    },
    [],
  );

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<readonly ValidationError[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [recoverySnapshot, setRecoverySnapshot] = useState<RecoverySnapshot | null>(() => {
    if (typeof window !== "undefined") {
      return getRecoverySnapshot();
    }
    return null;
  });

  // Sync initial server revision on mount and window focus
  useEffect(() => {
    const syncStatus = () => {
      defaultPersistenceAdapter
        .getStatus()
        .then((status) => {
          if (status && typeof status.revision === "number") {
            dispatch({ type: "SYNC_SERVER_REVISION", revision: status.revision });
          }
        })
        .catch(() => {});
    };

    syncStatus();
    window.addEventListener("focus", syncStatus);
    return () => window.removeEventListener("focus", syncStatus);
  }, []);

  // Autosave recovery snapshot when dirty
  useEffect(() => {
    if (!state.isDirty) return;
    const timer = setTimeout(() => {
      saveRecoverySnapshot(state.scene, state.currentRevision, state.activeAreaId);
    }, 1500);
    return () => clearTimeout(timer);
  }, [state.isDirty, state.scene, state.currentRevision, state.activeAreaId]);

  const restoreRecoverySnapshot = useCallback(() => {
    if (recoverySnapshot) {
      dispatch({ type: "LOAD_SCENE", scene: recoverySnapshot.scene });
      if (recoverySnapshot.activeAreaId) {
        dispatch({ type: "SET_ACTIVE_AREA", areaId: recoverySnapshot.activeAreaId });
      }
      clearRecoverySnapshot();
      setRecoverySnapshot(null);
    }
  }, [recoverySnapshot]);

  const discardRecoverySnapshot = useCallback(() => {
    clearRecoverySnapshot();
    setRecoverySnapshot(null);
  }, []);

  const saveToProject = useCallback(
    async (options?: { force?: boolean }): Promise<boolean> => {
      setSaveStatus("saving");
      setSaveError(null);
      setValidationErrors([]);

      try {
        const result = await defaultPersistenceAdapter.saveScene(state.scene, {
          clientRevision: state.savedRevision,
          activeAreaId: state.activeAreaId,
          appContent: state.appContent,
          force: options?.force,
        });

        if (result.success) {
          dispatch({
            type: "MARK_SAVED",
            revision: result.revision,
            timestamp: result.timestamp,
          });
          clearRecoverySnapshot();
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 4000);
          return true;
        } else {
          setSaveStatus("error");
          setSaveError(result.error ?? "Failed to save scene to project source.");
          if (result.errors) {
            setValidationErrors(result.errors);
          }
          // On revision conflict, sync to server's current revision so next save/retry proceeds cleanly
          if (result.code === "REVISION_CONFLICT" && typeof result.revision === "number") {
            dispatch({ type: "SYNC_SERVER_REVISION", revision: result.revision });
          }
          return false;
        }
      } catch (err) {
        setSaveStatus("error");
        setSaveError(`Network or server error: ${String(err)}`);
        return false;
      }
    },
    [state.scene, state.savedRevision, state.activeAreaId, state.appContent],
  );

  const activeRoom = useMemo<RoomDefinition | null>(() => {
    const area = state.scene.areas[state.activeAreaId];
    if (!area) return null;
    const room = area.rooms?.find((r) => r.id === state.activeRoomId);
    if (room) return room;
    if (area.rooms && area.rooms.length > 0) return area.rooms[0];
    return null;
  }, [state.scene.areas, state.activeAreaId, state.activeRoomId]);

  const setActiveRoom = useCallback((roomId: string) => {
    dispatch({ type: "SET_ACTIVE_ROOM", roomId });
  }, []);

  const toggleOverlay = useCallback((key: keyof StudioOverlaysConfig, enabled?: boolean) => {
    dispatch({ type: "TOGGLE_OVERLAY", key, enabled });
  }, []);

  const setOverlays = useCallback((overlays: Partial<StudioOverlaysConfig>) => {
    dispatch({ type: "SET_OVERLAYS", overlays });
  }, []);

  const addCollider = useCallback(
    (objectId: string, collider: ColliderDefinition, historyLabel?: string) => {
      dispatch({ type: "ADD_COLLIDER", objectId, collider, historyLabel });
    },
    [],
  );

  const updateCollider = useCallback(
    (
      objectId: string,
      colliderId: string,
      patch: Partial<ColliderDefinition>,
      historyLabel?: string,
    ) => {
      dispatch({ type: "UPDATE_COLLIDER", objectId, colliderId, patch, historyLabel });
    },
    [],
  );

  const deleteCollider = useCallback(
    (objectId: string, colliderId: string, historyLabel?: string) => {
      dispatch({ type: "DELETE_COLLIDER", objectId, colliderId, historyLabel });
    },
    [],
  );

  const duplicateCollider = useCallback(
    (objectId: string, colliderId: string, historyLabel?: string) => {
      dispatch({ type: "DUPLICATE_COLLIDER", objectId, colliderId, historyLabel });
    },
    [],
  );

  const fitCollider = useCallback(
    (objectId: string, colliderId: string, historyLabel?: string) => {
      dispatch({ type: "FIT_COLLIDER", objectId, colliderId, historyLabel });
    },
    [],
  );

  const addRoom = useCallback(
    (areaId: WorldAreaId, room: RoomDefinition, historyLabel?: string) => {
      dispatch({ type: "ADD_ROOM", areaId, room, historyLabel });
    },
    [],
  );

  const updateRoom = useCallback(
    (areaId: WorldAreaId, roomId: string, patch: Partial<RoomDefinition>, historyLabel?: string) => {
      dispatch({ type: "UPDATE_ROOM", areaId, roomId, patch, historyLabel });
    },
    [],
  );

  const deleteRoom = useCallback(
    (areaId: WorldAreaId, roomId: string, historyLabel?: string) => {
      dispatch({ type: "DELETE_ROOM", areaId, roomId, historyLabel });
    },
    [],
  );

  const duplicateRoom = useCallback(
    (areaId: WorldAreaId, roomId: string, historyLabel?: string) => {
      dispatch({ type: "DUPLICATE_ROOM", areaId, roomId, historyLabel });
    },
    [],
  );

  const fitRoomBounds = useCallback(
    (areaId: WorldAreaId, roomId?: string, padding?: number, historyLabel?: string) => {
      dispatch({ type: "FIT_ROOM_BOUNDS", areaId, roomId, padding, historyLabel });
    },
    [],
  );

  const updateAppContent = useCallback((patch: Partial<AppContent>, historyLabel?: string) => {
    dispatch({ type: "UPDATE_APP_CONTENT", patch, historyLabel });
  }, []);

  const setAppContentOpen = useCallback((isOpen: boolean) => {
    dispatch({ type: "SET_APP_CONTENT_OPEN", isOpen });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const loadScene = useCallback((scene: AtlasSceneDefinition) => {
    dispatch({ type: "LOAD_SCENE", scene });
  }, []);

  const markSaved = useCallback(() => {
    dispatch({ type: "MARK_SAVED" });
  }, []);

  const value = useMemo<EditorContextValue>(
    () => ({
      state,
      dispatch,
      currentAreaScene,
      selectedObject,
      selectedObjects,
      canUndo,
      canRedo,
      saveStatus,
      saveError,
      validationErrors,
      isReviewOpen,
      setIsReviewOpen,
      recoverySnapshot,
      restoreRecoverySnapshot,
      discardRecoverySnapshot,
      saveToProject,
      selectObject,
      selectObjectToggle,
      selectAll,
      deselectAll,
      setActiveArea,
      setActiveRoom,
      activeRoom,
      setEditorMode,
      setTransformMode,
      setTransformSpace,
      setPivotMode,
      setTransformOrientation,
      toggleSnap,
      setSnapMode,
      setSnapRotationStep,
      setSnapScaleStep,
      dropToSurface,
      set3DCursor,
      setActivePanel,
      toggleOverlay,
      setOverlays,
      addCollider,
      updateCollider,
      deleteCollider,
      duplicateCollider,
      fitCollider,
      addRoom,
      updateRoom,
      deleteRoom,
      duplicateRoom,
      fitRoomBounds,
      updateAppContent,
      setAppContentOpen,
      updateObject,
      batchUpdateObjects,
      renameObject,
      addObject,
      deleteObject,
      duplicateObject,
      startModalTransform,
      updateModalTransform,
      applyModalTransformPreview,
      confirmModalTransform,
      cancelModalTransform,
      executeSnapAction,
      setInteractionDebugTarget,
      updateAreaConfig,
      updateEnvironment,
      undo,
      redo,
      loadScene,
      markSaved,
    }),
    [
      state,
      currentAreaScene,
      selectedObject,
      selectedObjects,
      canUndo,
      canRedo,
      saveStatus,
      saveError,
      validationErrors,
      isReviewOpen,
      recoverySnapshot,
      restoreRecoverySnapshot,
      discardRecoverySnapshot,
      saveToProject,
      selectObject,
      selectObjectToggle,
      selectAll,
      deselectAll,
      setActiveArea,
      setActiveRoom,
      activeRoom,
      setEditorMode,
      setTransformMode,
      setTransformSpace,
      setPivotMode,
      setTransformOrientation,
      toggleSnap,
      setSnapMode,
      setSnapRotationStep,
      setSnapScaleStep,
      dropToSurface,
      set3DCursor,
      setActivePanel,
      toggleOverlay,
      setOverlays,
      addCollider,
      updateCollider,
      deleteCollider,
      duplicateCollider,
      fitCollider,
      addRoom,
      updateRoom,
      deleteRoom,
      duplicateRoom,
      fitRoomBounds,
      updateAppContent,
      setAppContentOpen,
      updateObject,
      batchUpdateObjects,
      renameObject,
      addObject,
      deleteObject,
      duplicateObject,
      startModalTransform,
      updateModalTransform,
      applyModalTransformPreview,
      confirmModalTransform,
      cancelModalTransform,
      executeSnapAction,
      setInteractionDebugTarget,
      updateAreaConfig,
      updateEnvironment,
      undo,
      redo,
      loadScene,
      markSaved,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
