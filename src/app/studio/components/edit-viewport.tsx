"use client";

import { OrbitControls, TransformControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";

import { ExhibitRegistry } from "@/three/exhibits/exhibit-registry";
import { AtmosphericParticles } from "@/three/world/environment/atmospheric-particles";
import { WorldEnvironment } from "@/three/world/environment/world-environment";
import { SceneArchitecture } from "@/three/world/renderers/scene-architecture";
import { SceneDecorations } from "@/three/world/renderers/scene-decorations";
import { SceneLights } from "@/three/world/renderers/scene-lights";
import { ScenePortals } from "@/three/world/renderers/scene-portals";
import type {
  ArchitectureObject,
  DecorationObject,
  PointLightObject,
  PortalObject,
  SceneObject,
  Vec3,
} from "@/types/scene";

import { useEditor } from "../state/editor-context";
import {
  calculatePivotPoint,
  computeModalTransform,
} from "../systems/modal-transform-engine";
import { triggerObjectInteraction } from "../systems/interaction-engine";

interface EditViewportProps {
  showGrid?: boolean;
  wireframeMode?: boolean;
  onOpenContextMenu?: (x: number, y: number) => void;
  onShowProject?: (projectId: string) => void;
}

/**
 * 3D Cursor Visualizer.
 * Displays crosshair and dashed red/white circle at cursor3D coordinates.
 */
function Cursor3DVisualizer({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      {/* Horizontal ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.25, 32]} />
        <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
      </mesh>
      {/* Inner crosshairs */}
      <axesHelper args={[0.4]} />
      {/* Center point */}
      <mesh>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/**
 * Transform Constraint Guidelines (Blender infinite axis lines).
 * Appears during G/R/S modal transforms when an axis (X, Y, Z) is locked.
 */
function TransformGuidelines({
  pivot,
  axisLock,
}: {
  pivot: Vec3;
  axisLock: null | "x" | "y" | "z" | "xy" | "xz" | "yz";
}) {
  if (!axisLock) return null;

  const points: [number, number, number][] = [];
  let color = "#ffffff";

  if (axisLock === "x") {
    points.push([-500, 0, 0], [500, 0, 0]);
    color = "#ef4444"; // Red for X
  } else if (axisLock === "y") {
    points.push([0, -500, 0], [0, 500, 0]);
    color = "#22c55e"; // Green for Y
  } else if (axisLock === "z") {
    points.push([0, 0, -500], [0, 0, 500]);
    color = "#3b82f6"; // Blue for Z
  } else if (axisLock === "xy") {
    color = "#38bdf8";
  } else if (axisLock === "xz") {
    color = "#a855f7";
  } else if (axisLock === "yz") {
    color = "#f97316";
  }

  if (points.length === 0) return null;

  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(...p)),
    );
    const mat = new THREE.LineBasicMaterial({ color, linewidth: 2, transparent: true, opacity: 0.8 });
    return new THREE.Line(geo, mat);
  }, [points, color]);

  return (
    <group position={pivot}>
      {/* Guideline line */}
      <primitive object={lineObj} />
    </group>
  );
}

/**
 * Multi-Selection Bounding Visualizer.
 * Renders bounding indicators for all currently selected objects.
 */
function MultiSelectionVisualizer({
  selectedObjects,
  activeObjectId,
}: {
  selectedObjects: SceneObject[];
  activeObjectId: string | null;
}) {
  return (
    <group>
      {selectedObjects.map((obj) => {
        const isActive = obj.id === activeObjectId;
        const pos = obj.transform.position;
        const rot = obj.transform.rotation ?? [0, 0, 0];
        const scl = obj.transform.scale ?? [1, 1, 1];

        return (
          <group key={obj.id} position={pos} rotation={rot} scale={scl}>
            <mesh>
              <boxGeometry args={[1.2, 1.2, 1.2]} />
              <meshBasicMaterial
                color={isActive ? "#22d3ee" : "#0891b2"}
                wireframe
                transparent
                opacity={isActive ? 0.45 : 0.25}
              />
            </mesh>
            {isActive && <axesHelper args={[1.4]} />}
          </group>
        );
      })}
    </group>
  );
}

/**
 * In-Canvas Controller for Blender Modal Transforms (G/R/S).
 */
function ModalTransformCanvasController({
  onHudUpdate,
}: {
  onHudUpdate: (text: string) => void;
}) {
  const { camera, size } = useThree();
  const {
    state,
    selectedObjects,
    applyModalTransformPreview,
    confirmModalTransform,
    cancelModalTransform,
    updateModalTransform,
  } = useEditor();

  const isModal = Boolean(state.modalTransform?.active);
  const latestTextRef = useRef("");

  const pivotPoint = useMemo(() => {
    return calculatePivotPoint(
      selectedObjects,
      state.pivotMode,
      state.selectedObjectId,
      state.cursor3D,
    );
  }, [selectedObjects, state.pivotMode, state.selectedObjectId, state.cursor3D]);

  // Pointer movement listener during active modal
  useEffect(() => {
    if (!isModal || !state.modalTransform) return;

    const handlePointerMove = (e: MouseEvent) => {
      const activeObj = selectedObjects.find((o) => o.id === state.selectedObjectId);
      const activeObjRotation = activeObj?.transform.rotation as Vec3 | undefined;

      const res = computeModalTransform({
        mode: state.modalTransform!.mode,
        axisLock: state.modalTransform!.axisLock,
        orientation: state.modalTransform!.orientation,
        pivot: state.modalTransform!.pivot,
        pivotPoint,
        startPointer: state.modalTransform!.startPointer,
        currentPointer: { x: e.clientX, y: e.clientY },
        viewportWidth: size.width,
        viewportHeight: size.height,
        camera,
        startObjects: state.modalTransform!.startObjects,
        numericInput: state.modalTransform!.numericInput,
        precision: e.shiftKey,
        snapping: e.ctrlKey || state.snapEnabled,
        snapStep: state.snapStep,
        activeObjectRotation: activeObjRotation,
      });

      latestTextRef.current = res.displayText;
      onHudUpdate(res.displayText);
      applyModalTransformPreview(res.previewTransforms, res.delta);
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        // LMB confirms
        e.preventDefault();
        e.stopPropagation();
        confirmModalTransform(undefined, latestTextRef.current);
        onHudUpdate("");
      } else if (e.button === 2) {
        // RMB cancels
        e.preventDefault();
        e.stopPropagation();
        cancelModalTransform();
        onHudUpdate("");
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("mousedown", handlePointerDown, { capture: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousedown", handlePointerDown, { capture: true });
    };
  }, [
    isModal,
    state.modalTransform,
    state.snapEnabled,
    state.snapStep,
    selectedObjects,
    pivotPoint,
    size,
    camera,
    applyModalTransformPreview,
    confirmModalTransform,
    cancelModalTransform,
    onHudUpdate,
  ]);

  if (!isModal || !state.modalTransform) return null;

  return (
    <TransformGuidelines
      pivot={pivotPoint}
      axisLock={state.modalTransform.axisLock}
    />
  );
}

/**
 * Gizmo controller when transform toolbar gizmos are used (fallback/mouse mode).
 */
function GizmoController({
  controlsRef,
}: {
  controlsRef: React.RefObject<any>;
}) {
  const { state, selectedObject, updateObject, dispatch } = useEditor();
  const pivotRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const preDragTransformRef = useRef<{ position: Vec3; rotation?: Vec3; scale?: Vec3 } | null>(null);

  useEffect(() => {
    if (!pivotRef.current || !selectedObject || isDragging) return;

    const pos = selectedObject.transform.position;
    const rot = selectedObject.transform.rotation ?? [0, 0, 0];
    const scl = selectedObject.transform.scale ?? [1, 1, 1];

    pivotRef.current.position.set(pos[0], pos[1], pos[2]);
    pivotRef.current.rotation.set(rot[0], rot[1], rot[2]);
    pivotRef.current.scale.set(scl[0], scl[1], scl[2]);
  }, [selectedObject, isDragging]);

  const isModalActive = Boolean(state.modalTransform?.active);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={!isDragging && !state.isDraggingGizmo && !isModalActive}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2 - 0.02}
        mouseButtons={{
          LEFT: -1 as any,
          MIDDLE: THREE.MOUSE.ROTATE,
          RIGHT: -1 as any,
        }}
      />

      {selectedObject && !isModalActive && (
        <group ref={pivotRef}>
          <axesHelper args={[1.4]} />
        </group>
      )}

      {selectedObject &&
        state.transformMode !== "select" &&
        !isModalActive &&
        state.editorMode === "edit" && (
          <TransformControls
            object={pivotRef.current ?? undefined}
            mode={state.transformMode}
            space={state.transformSpace}
            onMouseDown={() => {
              setIsDragging(true);
              if (selectedObject) {
                preDragTransformRef.current = {
                  position: [...selectedObject.transform.position],
                  rotation: selectedObject.transform.rotation
                    ? [...selectedObject.transform.rotation]
                    : undefined,
                  scale: selectedObject.transform.scale
                    ? [...selectedObject.transform.scale]
                    : undefined,
                };
              }
              dispatch({ type: "SET_DRAGGING_GIZMO", isDragging: true });
            }}
            onMouseUp={() => {
              setIsDragging(false);
              if (pivotRef.current && selectedObject) {
                const p = pivotRef.current.position;
                const r = pivotRef.current.rotation;
                const s = pivotRef.current.scale;

                updateObject(
                  selectedObject.id,
                  {
                    transform: {
                      position: [p.x, p.y, p.z],
                      rotation: [r.x, r.y, r.z],
                      scale: [s.x, s.y, s.z],
                    },
                  },
                  `Transform ${selectedObject.label ?? selectedObject.id}`,
                );
              }
              dispatch({ type: "RECORD_GIZMO_DRAG_END", historyLabel: "Transform Object" });
            }}
          />
        )}
    </>
  );
}

/**
 * Interactive Light Gizmo Helpers for 3D Viewport.
 */
function LightHelpers({
  lights,
  selectedIds,
  onSelect,
  onContextMenu,
}: {
  lights: PointLightObject[];
  selectedIds: string[];
  onSelect: (id: string, isShift: boolean) => void;
  onContextMenu?: (id: string, clientX: number, clientY: number) => void;
}) {
  return (
    <group>
      {lights.map((light) => {
        const isSelected = selectedIds.includes(light.id);
        const [x, y, z] = light.transform.position;
        return (
          <group
            key={light.id}
            position={[x, y, z]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(light.id, e.shiftKey);
            }}
            onContextMenu={(e) => {
              if (onContextMenu) {
                e.stopPropagation();
                onContextMenu(light.id, e.nativeEvent.clientX, e.nativeEvent.clientY);
              }
            }}
          >
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial
                color={light.color}
                wireframe
                transparent
                opacity={isSelected ? 0.9 : 0.6}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshBasicMaterial color={light.color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function EditViewport({
  showGrid = true,
  wireframeMode = false,
  onOpenContextMenu,
  onShowProject,
}: EditViewportProps) {
  const {
    currentAreaScene,
    state,
    selectedObject,
    selectedObjects,
    selectObject,
    selectObjectToggle,
    set3DCursor,
  } = useEditor();

  const controlsRef = useRef<any>(null);
  const [modalHudText, setModalHudText] = useState("");

  const { architecture, lights, portals, decorations } = useMemo(() => {
    const arch: ArchitectureObject[] = [];
    const lgt: PointLightObject[] = [];
    const port: PortalObject[] = [];
    const deco: DecorationObject[] = [];

    for (const obj of currentAreaScene.objects) {
      if (obj.type === "architecture") arch.push(obj as ArchitectureObject);
      else if (obj.type === "point-light") lgt.push(obj as PointLightObject);
      else if (obj.type === "portal") port.push(obj as PortalObject);
      else if (obj.type === "decoration") deco.push(obj as DecorationObject);
    }

    return { architecture: arch, lights: lgt, portals: port, decorations: deco };
  }, [currentAreaScene.objects]);

  // Camera Alignment & Focus Listener
  useEffect(() => {
    const handleCameraView = (
      e: CustomEvent<{ view: "front" | "right" | "top" | "focus" | "home" }>,
    ) => {
      if (!controlsRef.current) return;
      const target = controlsRef.current.target;
      const cam = controlsRef.current.object as THREE.Camera;
      if (!cam) return;

      if (e.detail.view === "focus") {
        if (selectedObject) {
          const [x, y, z] = selectedObject.transform.position;
          controlsRef.current.target.set(x, y, z);
          controlsRef.current.update();
        }
      } else if (e.detail.view === "home") {
        controlsRef.current.target.set(0, 1.5, 0);
        cam.position.set(0, 8, 14);
        controlsRef.current.update();
      } else if (e.detail.view === "front") {
        cam.position.set(target.x, target.y + 1, target.z + 16);
        controlsRef.current.update();
      } else if (e.detail.view === "right") {
        cam.position.set(target.x + 16, target.y + 1, target.z);
        controlsRef.current.update();
      } else if (e.detail.view === "top") {
        cam.position.set(target.x, target.y + 24, target.z + 0.001);
        controlsRef.current.update();
      }
    };

    window.addEventListener("studio:set-camera-view" as any, handleCameraView);
    return () => window.removeEventListener("studio:set-camera-view" as any, handleCameraView);
  }, [selectedObject]);

  const handleSelect = useCallback(
    (id: string, isShift: boolean) => {
      if (state.editorMode === "preview") {
        // Preview mode: trigger interaction
        const target = currentAreaScene.objects.find((o) => o.id === id);
        if (target) {
          triggerObjectInteraction(target, "click", {
            activeAreaId: currentAreaScene.id,
            onShowProject,
          });
        }
        return;
      }

      if (isShift) {
        selectObjectToggle(id);
      } else {
        selectObject(id);
      }
    },
    [state.editorMode, currentAreaScene, selectObject, selectObjectToggle, onShowProject],
  );

  const handleCanvasContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (state.modalTransform?.active) return;
      if (onOpenContextMenu) {
        onOpenContextMenu(e.clientX, e.clientY);
      }
    },
    [onOpenContextMenu, state.modalTransform],
  );

  const selectedIds = useMemo(() => {
    if (state.selectedObjectIds.length > 0) return state.selectedObjectIds;
    return state.selectedObjectId ? [state.selectedObjectId] : [];
  }, [state.selectedObjectIds, state.selectedObjectId]);

  return (
    <div
      onContextMenu={handleCanvasContextMenu}
      className="relative h-full w-full overflow-hidden bg-zinc-950 select-none"
    >
      {/* Viewport Top-Left Navigation & Mode Pill */}
      <div className="pointer-events-none absolute top-2 left-2 z-10 font-mono text-[10px] text-zinc-400 flex items-center gap-1.5">
        <div className="rounded border border-zinc-800/80 bg-zinc-900/80 px-2 py-0.5 backdrop-blur-xs shadow-xs">
          Nav: MMB Orbit · Shift+MMB Pan
        </div>
        <div
          className={`rounded border px-1.5 py-0.5 font-sans font-semibold uppercase text-[9px] ${
            state.editorMode === "edit"
              ? "border-cyan-500/40 bg-cyan-950/40 text-cyan-300"
              : state.editorMode === "interaction"
                ? "border-amber-500/40 bg-amber-950/40 text-amber-300"
                : "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
          }`}
        >
          {state.editorMode}
        </div>
      </div>

      {/* Viewport Top-Center Selected Object(s) Badge */}
      {selectedObjects.length > 0 && (
        <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-10 font-sans text-xs">
          <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-zinc-900/90 px-2.5 py-0.5 text-cyan-300 backdrop-blur-xs shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
            <span className="font-medium truncate max-w-[260px]">
              {selectedObjects.length === 1
                ? selectedObjects[0].label ?? selectedObjects[0].id
                : `${selectedObjects.length} Objects Selected`}
            </span>
            {selectedObjects.length === 1 && (
              <span className="text-[10px] font-mono text-cyan-500/80">
                ({selectedObjects[0].type})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Modal Transform HUD (Blender G/R/S Overlay) */}
      {state.modalTransform?.active && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-20 font-mono text-xs animate-in">
          <div className="flex items-center gap-2.5 rounded-lg border border-cyan-400/50 bg-zinc-900/95 px-3.5 py-2 text-zinc-100 shadow-2xl backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-semibold text-cyan-300">
              {modalHudText || state.modalTransform.mode.toUpperCase()}
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-[11px] text-zinc-400">
              <kbd className="text-zinc-200">Shift</kbd>: Fine ·{" "}
              <kbd className="text-zinc-200">Ctrl</kbd>: Snap ·{" "}
              <kbd className="text-zinc-200">LMB / Enter</kbd>: OK ·{" "}
              <kbd className="text-zinc-200">RMB / Esc</kbd>: Cancel
            </span>
          </div>
        </div>
      )}

      {/* R3F Canvas */}
      <div className="absolute inset-0 h-full w-full">
        <Canvas
          camera={{ position: [0, 8, 14], fov: 50 }}
          shadows
          onPointerMissed={(e) => {
            if (e.type === "click" && (e as MouseEvent).button === 0) {
              if (state.editorMode !== "preview") {
                selectObject(null);
              }
            }
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "block",
          }}
        >
          <WorldEnvironment config={state.scene.environment} />

          {showGrid && (
            <gridHelper
              args={[100, 100, "#3f3f46", "#18181b"]}
              position={[0, -0.01, 0]}
            />
          )}

          {/* Scene Renderers */}
          <SceneArchitecture
            objects={architecture}
            onSelect={(id) => handleSelect(id, false)}
            onContextMenu={(id, x, y) => {
              selectObject(id);
              onOpenContextMenu?.(x, y);
            }}
          />
          <SceneLights lights={lights} />
          <ScenePortals
            portals={portals}
            onSelect={(id) => handleSelect(id, false)}
            onContextMenu={(id, x, y) => {
              selectObject(id);
              onOpenContextMenu?.(x, y);
            }}
          />
          <SceneDecorations
            decorations={decorations}
            onSelect={(id) => handleSelect(id, false)}
            onContextMenu={(id, x, y) => {
              selectObject(id);
              onOpenContextMenu?.(x, y);
            }}
          />

          {/* Interactive Light Gizmo Helpers */}
          <LightHelpers
            lights={lights}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onContextMenu={(id, x, y) => {
              selectObject(id);
              onOpenContextMenu?.(x, y);
            }}
          />

          {/* 3D Cursor Visualizer */}
          <Cursor3DVisualizer position={state.cursor3D} />

          {/* Multi-Selection Bounding Boxes */}
          <MultiSelectionVisualizer
            selectedObjects={selectedObjects}
            activeObjectId={state.selectedObjectId}
          />

          {/* Background Plane for direct deselect on empty ground click */}
          <mesh
            position={[0, -0.05, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={false}
            onClick={(e) => {
              if (e.button === 0 && !e.shiftKey) {
                e.stopPropagation();
                selectObject(null);
              }
            }}
          >
            <planeGeometry args={[2000, 2000]} />
            <meshBasicMaterial visible={false} />
          </mesh>

          <AtmosphericParticles
            color={currentAreaScene.atmosphere.particleColor}
            count={currentAreaScene.atmosphere.particleCount}
            bounds={currentAreaScene.bounds}
          />
          <ExhibitRegistry area={currentAreaScene.id} />

          {/* Modal Transform In-Canvas Controller */}
          <ModalTransformCanvasController onHudUpdate={setModalHudText} />

          {/* Orbit & Fallback Toolbar Gizmos */}
          <GizmoController controlsRef={controlsRef} />
        </Canvas>
      </div>
    </div>
  );
}
