import type { WorldAreaId } from "@/types/portfolio";
import type {
  AreaSceneDefinition,
  AtlasSceneDefinition,
  EnvironmentConfig,
  SceneObject,
  Vec3,
} from "@/types/scene";

import {
  canRedo,
  canUndo,
  createHistoryStack,
  type HistoryStack,
  pushHistory,
  redo,
  undo,
} from "./history";

export type TransformMode = "select" | "translate" | "rotate" | "scale";
export type TransformSpace = "world" | "local";
export type EditorMode = "edit" | "interaction" | "preview";
export type PivotMode = "median" | "active" | "cursor";
export type TransformOrientation = "world" | "local" | "view";
export type SnapMode = "increment" | "vertex" | "surface";

export type ActivePanel =
  | "hierarchy"
  | "inspector"
  | "environment"
  | "projects"
  | "assets"
  | "validation"
  | "interaction";

export interface ModalTransformState {
  active: boolean;
  mode: "translate" | "rotate" | "scale";
  axisLock: null | "x" | "y" | "z" | "xy" | "xz" | "yz";
  orientation: TransformOrientation;
  pivot: PivotMode;
  startPointer: { x: number; y: number };
  startObjects: Record<string, { position: Vec3; rotation?: Vec3; scale?: Vec3 }>;
  numericInput: string;
  precision: boolean; // Shift held
  snapping: boolean; // Ctrl held or snap enabled
  currentDelta: {
    translation: Vec3;
    rotation: Vec3;
    scale: Vec3;
  };
}

export interface EditorState {
  scene: AtlasSceneDefinition;
  activeAreaId: WorldAreaId;
  selectedObjectId: string | null;
  selectedObjectIds: string[];
  cursor3D: Vec3;
  pivotMode: PivotMode;
  transformOrientation: TransformOrientation;
  snapEnabled: boolean;
  snapMode: SnapMode;
  snapStep: number;
  editorMode: EditorMode;
  transformMode: TransformMode;
  transformSpace: TransformSpace;
  modalTransform: ModalTransformState | null;
  activePanel: ActivePanel;
  history: HistoryStack;
  isDirty: boolean;
  isDraggingGizmo: boolean;
  interactionDebugTargetId: string | null;
  savedRevision: number;
  currentRevision: number;
  lastSavedTimestamp: number | null;
  savedScene: AtlasSceneDefinition;
}

export type EditorAction =
  | { type: "SELECT_OBJECT"; objectId: string | null }
  | { type: "SELECT_OBJECT_TOGGLE"; objectId: string }
  | { type: "SELECT_ALL" }
  | { type: "DESELECT_ALL" }
  | { type: "SET_ACTIVE_AREA"; areaId: WorldAreaId }
  | { type: "SET_EDITOR_MODE"; mode: EditorMode }
  | { type: "SET_TRANSFORM_MODE"; mode: TransformMode }
  | { type: "SET_TRANSFORM_SPACE"; space: TransformSpace }
  | { type: "SET_PIVOT_MODE"; mode: PivotMode }
  | { type: "SET_TRANSFORM_ORIENTATION"; orientation: TransformOrientation }
  | { type: "TOGGLE_SNAP"; enabled?: boolean }
  | { type: "SET_SNAP_MODE"; mode: SnapMode; step?: number }
  | { type: "SET_3D_CURSOR"; position: Vec3 }
  | { type: "SET_ACTIVE_PANEL"; panel: ActivePanel }
  | { type: "UPDATE_OBJECT"; objectId: string; patch: Partial<SceneObject>; historyLabel?: string }
  | {
      type: "BATCH_UPDATE_OBJECTS";
      updates: { id: string; patch: Partial<SceneObject> }[];
      historyLabel?: string;
    }
  | { type: "RENAME_OBJECT"; objectId: string; label: string }
  | { type: "ADD_OBJECT"; object: SceneObject; areaId?: WorldAreaId; historyLabel?: string }
  | { type: "DELETE_OBJECT"; objectId?: string; historyLabel?: string }
  | { type: "DUPLICATE_OBJECT"; objectId?: string; historyLabel?: string }
  | {
      type: "START_MODAL_TRANSFORM";
      mode: "translate" | "rotate" | "scale";
      pointer: { x: number; y: number };
    }
  | { type: "UPDATE_MODAL_TRANSFORM"; patch: Partial<ModalTransformState> }
  | {
      type: "APPLY_MODAL_TRANSFORM_PREVIEW";
      previewTransforms: Record<string, { position: Vec3; rotation?: Vec3; scale?: Vec3 }>;
      delta?: { translation?: Vec3; rotation?: Vec3; scale?: Vec3 };
    }
  | {
      type: "CONFIRM_MODAL_TRANSFORM";
      finalTransforms?: Record<string, { position: Vec3; rotation?: Vec3; scale?: Vec3 }>;
      historyLabel?: string;
    }
  | { type: "CANCEL_MODAL_TRANSFORM" }
  | {
      type: "EXECUTE_SNAP_ACTION";
      action:
        | "cursor-to-selected"
        | "cursor-to-origin"
        | "selection-to-cursor"
        | "selection-to-origin"
        | "cursor-to-grid";
    }
  | {
      type: "UPDATE_AREA_CONFIG";
      areaId: WorldAreaId;
      patch: Partial<AreaSceneDefinition>;
      historyLabel?: string;
    }
  | { type: "UPDATE_ENVIRONMENT"; patch: Partial<EnvironmentConfig>; historyLabel?: string }
  | { type: "LOAD_SCENE"; scene: AtlasSceneDefinition }
  | { type: "MARK_SAVED"; revision?: number; timestamp?: number }
  | { type: "SET_DRAGGING_GIZMO"; isDragging: boolean }
  | { type: "RECORD_GIZMO_DRAG_END"; historyLabel?: string }
  | { type: "SET_INTERACTION_DEBUG_TARGET"; objectId: string | null }
  | { type: "SYNC_SERVER_REVISION"; revision: number }
  | { type: "UNDO" }
  | { type: "REDO" };

export function createInitialEditorState(initialScene: AtlasSceneDefinition): EditorState {
  const initialAreaId: WorldAreaId = "atlas-hub";

  return {
    scene: initialScene,
    activeAreaId: initialAreaId,
    selectedObjectId: null,
    selectedObjectIds: [],
    cursor3D: [0, 0, 0],
    pivotMode: "median",
    transformOrientation: "world",
    snapEnabled: false,
    snapMode: "increment",
    snapStep: 0.5,
    editorMode: "edit",
    transformMode: "translate",
    transformSpace: "world",
    modalTransform: null,
    activePanel: "hierarchy",
    history: createHistoryStack(initialScene),
    isDirty: false,
    isDraggingGizmo: false,
    interactionDebugTargetId: null,
    savedRevision: 1,
    currentRevision: 1,
    lastSavedTimestamp: null,
    savedScene: initialScene,
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SELECT_OBJECT": {
      const selectedObjectIds = action.objectId ? [action.objectId] : [];
      return {
        ...state,
        selectedObjectId: action.objectId,
        selectedObjectIds,
      };
    }

    case "SELECT_OBJECT_TOGGLE": {
      const targetId = action.objectId;
      const exists = state.selectedObjectIds.includes(targetId);
      const updated = exists
        ? state.selectedObjectIds.filter((id) => id !== targetId)
        : [...state.selectedObjectIds, targetId];

      const newSelectedObjectId = updated.length > 0 ? updated[updated.length - 1] : null;

      return {
        ...state,
        selectedObjectId: newSelectedObjectId,
        selectedObjectIds: updated,
      };
    }

    case "SELECT_ALL": {
      const area = state.scene.areas[state.activeAreaId];
      if (!area) return state;
      const allIds = area.objects.map((o) => o.id);
      return {
        ...state,
        selectedObjectIds: allIds,
        selectedObjectId: allIds.length > 0 ? allIds[0] : null,
      };
    }

    case "DESELECT_ALL": {
      return {
        ...state,
        selectedObjectId: null,
        selectedObjectIds: [],
      };
    }

    case "SET_ACTIVE_AREA": {
      return {
        ...state,
        activeAreaId: action.areaId,
        selectedObjectId: null,
        selectedObjectIds: [],
        modalTransform: null,
      };
    }

    case "SET_EDITOR_MODE": {
      return {
        ...state,
        editorMode: action.mode,
        modalTransform: null,
      };
    }

    case "SET_TRANSFORM_MODE": {
      return {
        ...state,
        transformMode: action.mode,
      };
    }

    case "SET_TRANSFORM_SPACE": {
      return {
        ...state,
        transformSpace: action.space,
      };
    }

    case "SET_PIVOT_MODE": {
      return {
        ...state,
        pivotMode: action.mode,
      };
    }

    case "SET_TRANSFORM_ORIENTATION": {
      return {
        ...state,
        transformOrientation: action.orientation,
        transformSpace: action.orientation === "local" ? "local" : "world",
      };
    }

    case "TOGGLE_SNAP": {
      return {
        ...state,
        snapEnabled: action.enabled !== undefined ? action.enabled : !state.snapEnabled,
      };
    }

    case "SET_SNAP_MODE": {
      return {
        ...state,
        snapMode: action.mode,
        snapStep: action.step ?? state.snapStep,
      };
    }

    case "SET_3D_CURSOR": {
      return {
        ...state,
        cursor3D: action.position,
      };
    }

    case "SET_ACTIVE_PANEL": {
      return {
        ...state,
        activePanel: action.panel,
      };
    }

    case "SET_INTERACTION_DEBUG_TARGET": {
      return {
        ...state,
        interactionDebugTargetId: action.objectId,
      };
    }

    case "UPDATE_OBJECT": {
      const area = state.scene.areas[state.activeAreaId];
      if (!area) return state;

      const objIndex = area.objects.findIndex((o) => o.id === action.objectId);
      if (objIndex === -1) return state;

      const updatedObjects = [...area.objects];
      const currentObj = updatedObjects[objIndex];

      const mergedTransform = action.patch.transform
        ? {
            ...currentObj.transform,
            ...action.patch.transform,
            position: action.patch.transform.position ?? currentObj.transform.position,
            rotation: action.patch.transform.rotation ?? currentObj.transform.rotation,
            scale: action.patch.transform.scale ?? currentObj.transform.scale,
          }
        : currentObj.transform;

      updatedObjects[objIndex] = {
        ...currentObj,
        ...action.patch,
        transform: mergedTransform,
      } as SceneObject;

      const updatedScene: AtlasSceneDefinition = {
        ...state.scene,
        areas: {
          ...state.scene.areas,
          [state.activeAreaId]: {
            ...area,
            objects: updatedObjects,
          },
        },
      };

      const history =
        action.historyLabel && !state.isDraggingGizmo
          ? pushHistory(state.history, action.historyLabel, updatedScene)
          : state.history;

      return {
        ...state,
        scene: updatedScene,
        history,
        isDirty: true,
      };
    }

    case "BATCH_UPDATE_OBJECTS": {
      const area = state.scene.areas[state.activeAreaId];
      if (!area) return state;

      const map = new Map<string, Partial<SceneObject>>();
      for (const u of action.updates) {
        map.set(u.id, u.patch);
      }

      const updatedObjects = area.objects.map((obj) => {
        const patch = map.get(obj.id);
        if (!patch) return obj;

        const mergedTransform = patch.transform
          ? {
              ...obj.transform,
              ...patch.transform,
              position: patch.transform.position ?? obj.transform.position,
              rotation: patch.transform.rotation ?? obj.transform.rotation,
              scale: patch.transform.scale ?? obj.transform.scale,
            }
          : obj.transform;

        return {
          ...obj,
          ...patch,
          transform: mergedTransform,
        } as SceneObject;
      });

      const updatedScene: AtlasSceneDefinition = {
        ...state.scene,
        areas: {
          ...state.scene.areas,
          [state.activeAreaId]: {
            ...area,
            objects: updatedObjects,
          },
        },
      };

      const label = action.historyLabel ?? `Transform ${action.updates.length} Objects`;
      const history = pushHistory(state.history, label, updatedScene);

      return {
        ...state,
        scene: updatedScene,
        history,
        isDirty: true,
      };
    }

    case "RENAME_OBJECT": {
      const area = state.scene.areas[state.activeAreaId];
      if (!area) return state;

      const targetIndex = area.objects.findIndex((o) => o.id === action.objectId);
      if (targetIndex === -1) return state;

      const updatedObjects = [...area.objects];
      const targetObj = updatedObjects[targetIndex];
      updatedObjects[targetIndex] = {
        ...targetObj,
        label: action.label,
      } as SceneObject;

      const updatedScene: AtlasSceneDefinition = {
        ...state.scene,
        areas: {
          ...state.scene.areas,
          [state.activeAreaId]: {
            ...area,
            objects: updatedObjects,
          },
        },
      };

      const history = pushHistory(
        state.history,
        `Rename ${targetObj.label ?? targetObj.id} to "${action.label}"`,
        updatedScene,
      );

      return {
        ...state,
        scene: updatedScene,
        history,
        isDirty: true,
      };
    }

    case "ADD_OBJECT": {
      const targetAreaId = action.areaId ?? state.activeAreaId;
      const area = state.scene.areas[targetAreaId];
      if (!area) return state;

      const updatedScene: AtlasSceneDefinition = {
        ...state.scene,
        areas: {
          ...state.scene.areas,
          [targetAreaId]: {
            ...area,
            objects: [...area.objects, action.object],
          },
        },
      };

      const label = action.historyLabel ?? `Add ${action.object.label ?? action.object.type}`;
      const history = pushHistory(state.history, label, updatedScene);

      return {
        ...state,
        scene: updatedScene,
        history,
        selectedObjectId: action.object.id,
        selectedObjectIds: [action.object.id],
        isDirty: true,
      };
    }

    case "DELETE_OBJECT": {
      const area = state.scene.areas[state.activeAreaId];
      if (!area) return state;

      const targetIds = action.objectId
        ? [action.objectId]
        : state.selectedObjectIds.length > 0
          ? state.selectedObjectIds
          : state.selectedObjectId
            ? [state.selectedObjectId]
            : [];

      if (targetIds.length === 0) return state;

      const deleteSet = new Set(targetIds);
      const updatedObjects = area.objects.filter((o) => !deleteSet.has(o.id));

      const updatedScene: AtlasSceneDefinition = {
        ...state.scene,
        areas: {
          ...state.scene.areas,
          [state.activeAreaId]: {
            ...area,
            objects: updatedObjects,
          },
        },
      };

      const label =
        action.historyLabel ??
        (targetIds.length === 1
          ? `Delete ${area.objects.find((o) => o.id === targetIds[0])?.label ?? targetIds[0]}`
          : `Delete ${targetIds.length} Objects`);

      const history = pushHistory(state.history, label, updatedScene);

      return {
        ...state,
        scene: updatedScene,
        history,
        selectedObjectId: null,
        selectedObjectIds: [],
        isDirty: true,
      };
    }

    case "DUPLICATE_OBJECT": {
      const area = state.scene.areas[state.activeAreaId];
      if (!area) return state;

      const targetIds = action.objectId
        ? [action.objectId]
        : state.selectedObjectIds.length > 0
          ? state.selectedObjectIds
          : state.selectedObjectId
            ? [state.selectedObjectId]
            : [];

      if (targetIds.length === 0) return state;

      const newObjects: SceneObject[] = [];
      const newSelectedIds: string[] = [];

      for (const id of targetIds) {
        const targetObj = area.objects.find((o) => o.id === id);
        if (!targetObj) continue;

        const newId = `${targetObj.id}-copy-${Date.now().toString(36).slice(-4)}-${Math.random().toString(36).slice(2, 5)}`;
        const duplicatedObj: SceneObject = {
          ...structuredClone(targetObj),
          id: newId,
          label: `${targetObj.label ?? targetObj.id} (Copy)`,
          transform: {
            ...targetObj.transform,
            position: [
              targetObj.transform.position[0] + 0.5,
              targetObj.transform.position[1],
              targetObj.transform.position[2] + 0.5,
            ],
          },
        };

        newObjects.push(duplicatedObj);
        newSelectedIds.push(newId);
      }

      if (newObjects.length === 0) return state;

      const updatedScene: AtlasSceneDefinition = {
        ...state.scene,
        areas: {
          ...state.scene.areas,
          [state.activeAreaId]: {
            ...area,
            objects: [...area.objects, ...newObjects],
          },
        },
      };

      const label =
        action.historyLabel ??
        (newObjects.length === 1
          ? `Duplicate ${newObjects[0].label}`
          : `Duplicate ${newObjects.length} Objects`);

      const history = pushHistory(state.history, label, updatedScene);

      return {
        ...state,
        scene: updatedScene,
        history,
        selectedObjectId: newSelectedIds[0],
        selectedObjectIds: newSelectedIds,
        isDirty: true,
      };
    }

    case "START_MODAL_TRANSFORM": {
      const area = state.scene.areas[state.activeAreaId];
      if (!area) return state;

      const targetIds =
        state.selectedObjectIds.length > 0
          ? state.selectedObjectIds
          : state.selectedObjectId
            ? [state.selectedObjectId]
            : [];

      if (targetIds.length === 0) return state;

      const startObjects: Record<string, { position: Vec3; rotation?: Vec3; scale?: Vec3 }> = {};
      for (const id of targetIds) {
        const obj = area.objects.find((o) => o.id === id);
        if (obj) {
          startObjects[id] = {
            position: [...obj.transform.position] as Vec3,
            rotation: obj.transform.rotation ? ([...obj.transform.rotation] as Vec3) : [0, 0, 0],
            scale: obj.transform.scale ? ([...obj.transform.scale] as Vec3) : [1, 1, 1],
          };
        }
      }

      const modalTransform: ModalTransformState = {
        active: true,
        mode: action.mode,
        axisLock: null,
        orientation: state.transformOrientation,
        pivot: state.pivotMode,
        startPointer: { ...action.pointer },
        startObjects,
        numericInput: "",
        precision: false,
        snapping: state.snapEnabled,
        currentDelta: {
          translation: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
      };

      return {
        ...state,
        modalTransform,
      };
    }

    case "UPDATE_MODAL_TRANSFORM": {
      if (!state.modalTransform) return state;
      return {
        ...state,
        modalTransform: {
          ...state.modalTransform,
          ...action.patch,
        },
      };
    }

    case "APPLY_MODAL_TRANSFORM_PREVIEW": {
      if (!state.modalTransform) return state;
      const area = state.scene.areas[state.activeAreaId];
      if (!area) return state;

      const updatedObjects = area.objects.map((obj) => {
        const preview = action.previewTransforms[obj.id];
        if (!preview) return obj;

        return {
          ...obj,
          transform: {
            ...obj.transform,
            position: preview.position,
            rotation: preview.rotation ?? obj.transform.rotation,
            scale: preview.scale ?? obj.transform.scale,
          },
        } as SceneObject;
      });

      return {
        ...state,
        scene: {
          ...state.scene,
          areas: {
            ...state.scene.areas,
            [state.activeAreaId]: {
              ...area,
              objects: updatedObjects,
            },
          },
        },
        modalTransform: {
          ...state.modalTransform,
          currentDelta: {
            translation:
              action.delta?.translation ?? state.modalTransform.currentDelta.translation,
            rotation: action.delta?.rotation ?? state.modalTransform.currentDelta.rotation,
            scale: action.delta?.scale ?? state.modalTransform.currentDelta.scale,
          },
        },
      };
    }

    case "CONFIRM_MODAL_TRANSFORM": {
      if (!state.modalTransform) return state;
      const area = state.scene.areas[state.activeAreaId];
      if (!area) return { ...state, modalTransform: null };

      let updatedObjects = area.objects;
      if (action.finalTransforms) {
        updatedObjects = area.objects.map((obj) => {
          const finalT = action.finalTransforms![obj.id];
          if (!finalT) return obj;
          return {
            ...obj,
            transform: {
              ...obj.transform,
              position: finalT.position,
              rotation: finalT.rotation ?? obj.transform.rotation,
              scale: finalT.scale ?? obj.transform.scale,
            },
          } as SceneObject;
        });
      }

      const updatedScene: AtlasSceneDefinition = {
        ...state.scene,
        areas: {
          ...state.scene.areas,
          [state.activeAreaId]: {
            ...area,
            objects: updatedObjects,
          },
        },
      };

      const modeName = state.modalTransform.mode.toUpperCase();
      const axisName = state.modalTransform.axisLock
        ? ` (${state.modalTransform.axisLock.toUpperCase()})`
        : "";
      const count = Object.keys(state.modalTransform.startObjects).length;
      const label =
        action.historyLabel ??
        `${modeName}${axisName} ${count > 1 ? `${count} Objects` : "Object"}`;

      const history = pushHistory(state.history, label, updatedScene);

      return {
        ...state,
        scene: updatedScene,
        history,
        modalTransform: null,
        isDirty: true,
      };
    }

    case "CANCEL_MODAL_TRANSFORM": {
      if (!state.modalTransform) return state;
      const area = state.scene.areas[state.activeAreaId];
      if (!area) return { ...state, modalTransform: null };

      // Revert objects to pre-modal initial state
      const startObjects = state.modalTransform.startObjects;
      const revertedObjects = area.objects.map((obj) => {
        const start = startObjects[obj.id];
        if (!start) return obj;
        return {
          ...obj,
          transform: {
            ...obj.transform,
            position: start.position,
            rotation: start.rotation ?? obj.transform.rotation,
            scale: start.scale ?? obj.transform.scale,
          },
        } as SceneObject;
      });

      return {
        ...state,
        scene: {
          ...state.scene,
          areas: {
            ...state.scene.areas,
            [state.activeAreaId]: {
              ...area,
              objects: revertedObjects,
            },
          },
        },
        modalTransform: null,
      };
    }

    case "EXECUTE_SNAP_ACTION": {
      const area = state.scene.areas[state.activeAreaId];
      if (!area) return state;

      const targetIds =
        state.selectedObjectIds.length > 0
          ? state.selectedObjectIds
          : state.selectedObjectId
            ? [state.selectedObjectId]
            : [];

      if (action.action === "cursor-to-selected") {
        if (targetIds.length === 0) return state;
        const activeObj = area.objects.find((o) => o.id === targetIds[0]);
        if (!activeObj) return state;
        return {
          ...state,
          cursor3D: [...activeObj.transform.position],
        };
      }

      if (action.action === "cursor-to-origin") {
        return {
          ...state,
          cursor3D: [0, 0, 0],
        };
      }

      if (action.action === "cursor-to-grid") {
        const step = state.snapStep || 0.5;
        const snap = (v: number) => Math.round(v / step) * step;
        return {
          ...state,
          cursor3D: [snap(state.cursor3D[0]), snap(state.cursor3D[1]), snap(state.cursor3D[2])],
        };
      }

      if (action.action === "selection-to-cursor" || action.action === "selection-to-origin") {
        if (targetIds.length === 0) return state;

        const targetPos: Vec3 =
          action.action === "selection-to-cursor" ? state.cursor3D : [0, 0, 0];

        // Calculate centroid of selection
        let sumX = 0;
        let sumY = 0;
        let sumZ = 0;
        let count = 0;

        for (const id of targetIds) {
          const obj = area.objects.find((o) => o.id === id);
          if (obj) {
            sumX += obj.transform.position[0];
            sumY += obj.transform.position[1];
            sumZ += obj.transform.position[2];
            count++;
          }
        }

        if (count === 0) return state;
        const centroid: Vec3 = [sumX / count, sumY / count, sumZ / count];
        const offset: Vec3 = [
          targetPos[0] - centroid[0],
          targetPos[1] - centroid[1],
          targetPos[2] - centroid[2],
        ];

        const targetSet = new Set(targetIds);
        const updatedObjects = area.objects.map((obj) => {
          if (!targetSet.has(obj.id)) return obj;
          return {
            ...obj,
            transform: {
              ...obj.transform,
              position: [
                obj.transform.position[0] + offset[0],
                obj.transform.position[1] + offset[1],
                obj.transform.position[2] + offset[2],
              ] as Vec3,
            },
          } as SceneObject;
        });

        const updatedScene: AtlasSceneDefinition = {
          ...state.scene,
          areas: {
            ...state.scene.areas,
            [state.activeAreaId]: {
              ...area,
              objects: updatedObjects,
            },
          },
        };

        const label =
          action.action === "selection-to-cursor" ? "Selection to Cursor" : "Selection to Origin";
        const history = pushHistory(state.history, label, updatedScene);

        return {
          ...state,
          scene: updatedScene,
          history,
          isDirty: true,
        };
      }

      return state;
    }

    case "UPDATE_AREA_CONFIG": {
      const area = state.scene.areas[action.areaId];
      if (!area) return state;

      const updatedArea: AreaSceneDefinition = {
        ...area,
        ...action.patch,
        bounds: action.patch.bounds ? { ...area.bounds, ...action.patch.bounds } : area.bounds,
        spawn: action.patch.spawn ? { ...area.spawn, ...action.patch.spawn } : area.spawn,
        atmosphere: action.patch.atmosphere
          ? { ...area.atmosphere, ...action.patch.atmosphere }
          : area.atmosphere,
        metadata: action.patch.metadata
          ? { ...area.metadata, ...action.patch.metadata }
          : area.metadata,
      };

      const updatedScene: AtlasSceneDefinition = {
        ...state.scene,
        areas: {
          ...state.scene.areas,
          [action.areaId]: updatedArea,
        },
      };

      const label = action.historyLabel ?? `Update ${area.metadata.name} Settings`;
      const history = pushHistory(state.history, label, updatedScene);

      return {
        ...state,
        scene: updatedScene,
        history,
        isDirty: true,
      };
    }

    case "UPDATE_ENVIRONMENT": {
      const updatedEnv: EnvironmentConfig = {
        ...state.scene.environment,
        ...action.patch,
        fog: action.patch.fog
          ? { ...state.scene.environment.fog, ...action.patch.fog }
          : state.scene.environment.fog,
        hemisphereLight: action.patch.hemisphereLight
          ? { ...state.scene.environment.hemisphereLight, ...action.patch.hemisphereLight }
          : state.scene.environment.hemisphereLight,
        directionalLight: action.patch.directionalLight
          ? { ...state.scene.environment.directionalLight, ...action.patch.directionalLight }
          : state.scene.environment.directionalLight,
        ground: action.patch.ground
          ? { ...state.scene.environment.ground, ...action.patch.ground }
          : state.scene.environment.ground,
        grid: action.patch.grid
          ? { ...state.scene.environment.grid, ...action.patch.grid }
          : state.scene.environment.grid,
      };

      const updatedScene: AtlasSceneDefinition = {
        ...state.scene,
        environment: updatedEnv,
      };

      const label = action.historyLabel ?? "Update Global Environment";
      const history = pushHistory(state.history, label, updatedScene);

      return {
        ...state,
        scene: updatedScene,
        history,
        isDirty: true,
      };
    }

    case "SET_DRAGGING_GIZMO": {
      return {
        ...state,
        isDraggingGizmo: action.isDragging,
      };
    }

    case "RECORD_GIZMO_DRAG_END": {
      const label = action.historyLabel ?? "Transform Object";
      const history = pushHistory(state.history, label, state.scene);

      return {
        ...state,
        history,
        isDraggingGizmo: false,
        isDirty: true,
      };
    }

    case "LOAD_SCENE": {
      return {
        ...state,
        scene: action.scene,
        savedScene: action.scene,
        history: createHistoryStack(action.scene),
        selectedObjectId: null,
        selectedObjectIds: [],
        modalTransform: null,
        isDirty: false,
        currentRevision: 1,
        savedRevision: 1,
      };
    }

    case "MARK_SAVED": {
      const newRev = action.revision ?? state.currentRevision;
      return {
        ...state,
        isDirty: false,
        savedRevision: newRev,
        lastSavedTimestamp: action.timestamp ?? Date.now(),
        savedScene: state.scene,
      };
    }

    case "SYNC_SERVER_REVISION": {
      return {
        ...state,
        savedRevision: action.revision,
        currentRevision: state.isDirty ? state.currentRevision : action.revision,
      };
    }

    case "UNDO": {
      const result = undo(state.history);
      if (!result) return state;

      return {
        ...state,
        scene: result.snapshot,
        history: result.stack,
        modalTransform: null,
        isDirty: true,
      };
    }

    case "REDO": {
      const result = redo(state.history);
      if (!result) return state;

      return {
        ...state,
        scene: result.snapshot,
        history: result.stack,
        modalTransform: null,
        isDirty: true,
      };
    }

    default:
      return state;
  }
}
