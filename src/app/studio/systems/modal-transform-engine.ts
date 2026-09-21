import * as THREE from "three";
import type { Vec3, SceneObject } from "@/types/scene";
import type {
  PivotMode,
  TransformOrientation,
  ModalTransformState,
} from "../state/editor-reducer";

export interface ComputeTransformParams {
  mode: "translate" | "rotate" | "scale";
  axisLock: null | "x" | "y" | "z" | "xy" | "xz" | "yz";
  orientation: TransformOrientation;
  pivot: PivotMode;
  pivotPoint: Vec3;
  startPointer: { x: number; y: number };
  currentPointer: { x: number; y: number };
  viewportWidth: number;
  viewportHeight: number;
  camera: THREE.Camera;
  startObjects: Record<string, { position: Vec3; rotation?: Vec3; scale?: Vec3 }>;
  numericInput: string;
  precision: boolean;
  snapping: boolean;
  snapStep: number;
  activeObjectRotation?: Vec3;
}

export interface TransformResult {
  previewTransforms: Record<string, { position: Vec3; rotation: Vec3; scale: Vec3 }>;
  delta: {
    translation: Vec3;
    rotation: Vec3;
    scale: Vec3;
  };
  displayText: string;
}

/**
 * Calculates the pivot point in World space based on selected objects and mode.
 */
export function calculatePivotPoint(
  objects: SceneObject[],
  pivotMode: PivotMode,
  activeObjectId: string | null,
  cursor3D: Vec3,
): Vec3 {
  if (pivotMode === "cursor") {
    return [...cursor3D];
  }

  if (pivotMode === "active" && activeObjectId) {
    const activeObj = objects.find((o) => o.id === activeObjectId);
    if (activeObj) {
      return [...activeObj.transform.position];
    }
  }

  if (objects.length === 0) {
    return [0, 0, 0];
  }

  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  for (const obj of objects) {
    sumX += obj.transform.position[0];
    sumY += obj.transform.position[1];
    sumZ += obj.transform.position[2];
  }
  return [sumX / objects.length, sumY / objects.length, sumZ / objects.length];
}

/**
 * Parses numeric input string (e.g. "2", "1.5", "-3") into a float or null.
 */
export function parseNumericInput(input: string): number | null {
  if (!input || input === "-" || input === ".") return null;
  const val = parseFloat(input);
  return isNaN(val) ? null : val;
}

/**
 * Pure math transformation engine for Blender-style modal transforms.
 */
export function computeModalTransform(params: ComputeTransformParams): TransformResult {
  const {
    mode,
    axisLock,
    orientation,
    pivotPoint,
    startPointer,
    currentPointer,
    viewportWidth,
    viewportHeight,
    camera,
    startObjects,
    numericInput,
    precision,
    snapping,
    snapStep,
    activeObjectRotation,
  } = params;

  const parsedNumber = parseNumericInput(numericInput);
  const precisionFactor = precision ? 0.1 : 1.0;

  // Screen space delta
  const dxScreen = (currentPointer.x - startPointer.x) * precisionFactor;
  const dyScreen = (currentPointer.y - startPointer.y) * precisionFactor;

  // ─── TRANSLATE MODE ──────────────────────────────────────────────────────────
  if (mode === "translate") {
    let tDelta: [number, number, number] = [0, 0, 0];

    if (parsedNumber !== null) {
      // Numeric input overrides pointer delta
      const val = parsedNumber;
      if (axisLock === "x") tDelta = [val, 0, 0];
      else if (axisLock === "y") tDelta = [0, val, 0];
      else if (axisLock === "z") tDelta = [0, 0, val];
      else if (axisLock === "xy") tDelta = [val, val, 0];
      else if (axisLock === "xz") tDelta = [val, 0, val];
      else if (axisLock === "yz") tDelta = [0, val, val];
      else tDelta = [val, 0, 0];
    } else {
      const pivot3D = new THREE.Vector3(...pivotPoint);

      if (axisLock === "x" || axisLock === "y" || axisLock === "z") {
        // ── 1D Axis Constraint ──
        // Project 3D axis vector onto 2D screen line to determine movement
        const axisDir = new THREE.Vector3(
          axisLock === "x" ? 1 : 0,
          axisLock === "y" ? 1 : 0,
          axisLock === "z" ? 1 : 0,
        );

        if (orientation === "local" && activeObjectRotation) {
          const euler = new THREE.Euler(
            activeObjectRotation[0],
            activeObjectRotation[1],
            activeObjectRotation[2],
            "YXZ",
          );
          axisDir.applyEuler(euler).normalize();
        }

        const tip3D = pivot3D.clone().add(axisDir);

        const pivotScreen = pivot3D.clone().project(camera);
        const tipScreen = tip3D.clone().project(camera);

        // Screen vector in pixel coordinates
        const axisScreen = new THREE.Vector2(
          (tipScreen.x - pivotScreen.x) * (viewportWidth / 2),
          -(tipScreen.y - pivotScreen.y) * (viewportHeight / 2),
        );

        const mouseDelta = new THREE.Vector2(
          (currentPointer.x - startPointer.x) * precisionFactor,
          (currentPointer.y - startPointer.y) * precisionFactor,
        );

        let worldDistance = 0;
        const axisScreenLen = axisScreen.length();

        if (axisScreenLen > 2) {
          // Normal case: Project mouse displacement onto the 2D screen axis vector
          const normAxis = axisScreen.clone().normalize();
          const dotPixels = mouseDelta.dot(normAxis);

          // Calculate pixels-per-world-unit at the pivot depth
          const distToPivot = camera.position.distanceTo(pivot3D);
          let pixelsPerUnit = 50;
          if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
            const fovRad = (((camera as THREE.PerspectiveCamera).fov || 50) * Math.PI) / 180;
            pixelsPerUnit = viewportHeight / (2 * Math.tan(fovRad / 2) * Math.max(distToPivot, 0.1));
          } else if ((camera as THREE.OrthographicCamera).isOrthographicCamera) {
            const orthoCam = camera as THREE.OrthographicCamera;
            pixelsPerUnit = viewportHeight / Math.max(orthoCam.top - orthoCam.bottom, 0.1);
          }

          worldDistance = dotPixels / Math.max(pixelsPerUnit, 1);
        } else {
          // Degenerate case: Axis points directly towards/away from camera
          worldDistance = -mouseDelta.y * 0.05;
        }

        if (snapping) {
          const s = snapStep || 0.5;
          worldDistance = Math.round(worldDistance / s) * s;
        }

        const worldDisplacement = axisDir.clone().multiplyScalar(worldDistance);
        tDelta = [worldDisplacement.x, worldDisplacement.y, worldDisplacement.z];
      } else if (axisLock === "xy" || axisLock === "xz" || axisLock === "yz") {
        // ── 2D Plane Constraint ──
        // Intersect true constraint plane (e.g. horizontal floor for XZ)
        const planeNormal = new THREE.Vector3(
          axisLock === "yz" ? 1 : 0,
          axisLock === "xz" ? 1 : 0,
          axisLock === "xy" ? 1 : 0,
        );

        if (orientation === "local" && activeObjectRotation) {
          const euler = new THREE.Euler(
            activeObjectRotation[0],
            activeObjectRotation[1],
            activeObjectRotation[2],
            "YXZ",
          );
          planeNormal.applyEuler(euler).normalize();
        }

        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, pivot3D);

        const raycaster = new THREE.Raycaster();
        const ndcStart = new THREE.Vector2(
          (startPointer.x / viewportWidth) * 2 - 1,
          -(startPointer.y / viewportHeight) * 2 + 1,
        );
        const ndcCurrent = new THREE.Vector2(
          (currentPointer.x / viewportWidth) * 2 - 1,
          -(currentPointer.y / viewportHeight) * 2 + 1,
        );

        raycaster.setFromCamera(ndcStart, camera);
        const startIntersect = new THREE.Vector3();
        const hitStart = raycaster.ray.intersectPlane(plane, startIntersect);

        raycaster.setFromCamera(ndcCurrent, camera);
        const currentIntersect = new THREE.Vector3();
        const hitCurrent = raycaster.ray.intersectPlane(plane, currentIntersect);

        if (hitStart && hitCurrent) {
          const rawDelta = new THREE.Vector3()
            .subVectors(currentIntersect, startIntersect)
            .multiplyScalar(precisionFactor);

          if (snapping) {
            const s = snapStep || 0.5;
            rawDelta.x = Math.round(rawDelta.x / s) * s;
            rawDelta.y = Math.round(rawDelta.y / s) * s;
            rawDelta.z = Math.round(rawDelta.z / s) * s;
          }

          tDelta = [rawDelta.x, rawDelta.y, rawDelta.z];
        }
      } else {
        // ── Free Translation ──
        // Project onto a plane at pivot facing the camera
        const planeNormal = new THREE.Vector3();
        camera.getWorldDirection(planeNormal).negate();

        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, pivot3D);

        const raycaster = new THREE.Raycaster();
        const ndcStart = new THREE.Vector2(
          (startPointer.x / viewportWidth) * 2 - 1,
          -(startPointer.y / viewportHeight) * 2 + 1,
        );
        const ndcCurrent = new THREE.Vector2(
          (currentPointer.x / viewportWidth) * 2 - 1,
          -(currentPointer.y / viewportHeight) * 2 + 1,
        );

        raycaster.setFromCamera(ndcStart, camera);
        const startIntersect = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, startIntersect);

        raycaster.setFromCamera(ndcCurrent, camera);
        const currentIntersect = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, currentIntersect);

        const rawDelta = new THREE.Vector3()
          .subVectors(currentIntersect, startIntersect)
          .multiplyScalar(precisionFactor);

        if (snapping) {
          const s = snapStep || 0.5;
          rawDelta.x = Math.round(rawDelta.x / s) * s;
          rawDelta.y = Math.round(rawDelta.y / s) * s;
          rawDelta.z = Math.round(rawDelta.z / s) * s;
        }

        tDelta = [rawDelta.x, rawDelta.y, rawDelta.z];
      }
    }

    // Apply translation to each object
    const previewTransforms: Record<string, { position: Vec3; rotation: Vec3; scale: Vec3 }> = {};
    for (const [id, orig] of Object.entries(startObjects)) {
      previewTransforms[id] = {
        position: [
          orig.position[0] + tDelta[0],
          orig.position[1] + tDelta[1],
          orig.position[2] + tDelta[2],
        ],
        rotation: orig.rotation ? [...orig.rotation] : [0, 0, 0],
        scale: orig.scale ? [...orig.scale] : [1, 1, 1],
      };
    }

    const distVal = Math.sqrt(tDelta[0] ** 2 + tDelta[1] ** 2 + tDelta[2] ** 2);
    const axisStr = axisLock ? ` (${axisLock.toUpperCase()})` : "";
    const orientStr = orientation === "local" ? " [Local]" : " [World]";
    const numStr = numericInput ? ` = ${numericInput}` : ` ${distVal.toFixed(2)}m`;

    return {
      previewTransforms,
      delta: {
        translation: tDelta,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      displayText: `MOVE${axisStr}${orientStr}${numStr}`,
    };
  }

  // ─── ROTATE MODE ─────────────────────────────────────────────────────────────
  if (mode === "rotate") {
    // Screen-project pivot point
    const pivotV = new THREE.Vector3(...pivotPoint);
    pivotV.project(camera);
    const pivotScreenX = ((pivotV.x + 1) / 2) * viewportWidth;
    const pivotScreenY = ((-pivotV.y + 1) / 2) * viewportHeight;

    const startAngle = Math.atan2(startPointer.y - pivotScreenY, startPointer.x - pivotScreenX);
    const currentAngle = Math.atan2(currentPointer.y - pivotScreenY, currentPointer.x - pivotScreenX);

    let angleDelta = (currentAngle - startAngle) * precisionFactor;

    if (parsedNumber !== null) {
      // Numeric input in degrees
      angleDelta = (parsedNumber * Math.PI) / 180;
    } else if (snapping) {
      // Snap to 5° (approx 0.08726 rad) or 15° (approx 0.2618 rad)
      const snapRad = (15 * Math.PI) / 180;
      angleDelta = Math.round(angleDelta / snapRad) * snapRad;
    }

    let rDelta: [number, number, number] = [0, 0, 0];
    if (axisLock === "x") rDelta = [angleDelta, 0, 0];
    else if (axisLock === "y") rDelta = [0, angleDelta, 0];
    else if (axisLock === "z") rDelta = [0, 0, angleDelta];
    else rDelta = [0, angleDelta, 0]; // Default view orbit rotation around Y

    const previewTransforms: Record<string, { position: Vec3; rotation: Vec3; scale: Vec3 }> = {};

    for (const [id, orig] of Object.entries(startObjects)) {
      const origPos = new THREE.Vector3(...orig.position);
      const pivotV3 = new THREE.Vector3(...pivotPoint);

      // Rotate position around pivot
      const relPos = origPos.clone().sub(pivotV3);
      if (axisLock === "x") {
        relPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), rDelta[0]);
      } else if (axisLock === "z") {
        relPos.applyAxisAngle(new THREE.Vector3(0, 0, 1), rDelta[2]);
      } else {
        relPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), rDelta[1]);
      }
      const newPos = pivotV3.add(relPos);

      const origRot = orig.rotation ?? [0, 0, 0];
      previewTransforms[id] = {
        position: [newPos.x, newPos.y, newPos.z],
        rotation: [
          origRot[0] + rDelta[0],
          origRot[1] + rDelta[1],
          origRot[2] + rDelta[2],
        ],
        scale: orig.scale ? [...orig.scale] : [1, 1, 1],
      };
    }

    const deg = ((angleDelta * 180) / Math.PI).toFixed(1);
    const axisStr = axisLock ? ` (${axisLock.toUpperCase()})` : " (Y)";
    const numStr = numericInput ? ` = ${numericInput}°` : ` ${deg}°`;

    return {
      previewTransforms,
      delta: {
        translation: [0, 0, 0],
        rotation: rDelta,
        scale: [1, 1, 1],
      },
      displayText: `ROTATE${axisStr}${numStr}`,
    };
  }

  // ─── SCALE MODE ──────────────────────────────────────────────────────────────
  if (mode === "scale") {
    const pivotV = new THREE.Vector3(...pivotPoint);
    pivotV.project(camera);
    const pivotScreenX = ((pivotV.x + 1) / 2) * viewportWidth;
    const pivotScreenY = ((-pivotV.y + 1) / 2) * viewportHeight;

    const startDist = Math.max(
      Math.hypot(startPointer.x - pivotScreenX, startPointer.y - pivotScreenY),
      20,
    );
    const currentDist = Math.hypot(
      currentPointer.x - pivotScreenX,
      currentPointer.y - pivotScreenY,
    );

    let rawScale = 1.0 + ((currentDist / startDist) - 1.0) * precisionFactor;

    if (parsedNumber !== null) {
      rawScale = parsedNumber;
    } else if (snapping) {
      const step = 0.1;
      rawScale = Math.round(rawScale / step) * step;
    }

    let sDelta: [number, number, number] = [rawScale, rawScale, rawScale];
    if (axisLock === "x") sDelta = [rawScale, 1, 1];
    else if (axisLock === "y") sDelta = [1, rawScale, 1];
    else if (axisLock === "z") sDelta = [1, 1, rawScale];
    else if (axisLock === "xy") sDelta = [rawScale, rawScale, 1];
    else if (axisLock === "xz") sDelta = [rawScale, 1, rawScale];
    else if (axisLock === "yz") sDelta = [1, rawScale, rawScale];

    const previewTransforms: Record<string, { position: Vec3; rotation: Vec3; scale: Vec3 }> = {};

    for (const [id, orig] of Object.entries(startObjects)) {
      const origPos = new THREE.Vector3(...orig.position);
      const pivotV3 = new THREE.Vector3(...pivotPoint);

      // Scale position relative to pivot
      const relPos = origPos.clone().sub(pivotV3);
      relPos.x *= sDelta[0];
      relPos.y *= sDelta[1];
      relPos.z *= sDelta[2];
      const newPos = pivotV3.add(relPos);

      const origScale = orig.scale ?? [1, 1, 1];
      previewTransforms[id] = {
        position: [newPos.x, newPos.y, newPos.z],
        rotation: orig.rotation ? [...orig.rotation] : [0, 0, 0],
        scale: [
          origScale[0] * sDelta[0],
          origScale[1] * sDelta[1],
          origScale[2] * sDelta[2],
        ],
      };
    }

    const axisStr = axisLock ? ` (${axisLock.toUpperCase()})` : "";
    const numStr = numericInput ? ` = ${numericInput}` : ` ${rawScale.toFixed(3)}`;

    return {
      previewTransforms,
      delta: {
        translation: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: sDelta,
      },
      displayText: `SCALE${axisStr}${numStr}`,
    };
  }

  return {
    previewTransforms: {},
    delta: { translation: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    displayText: "",
  };
}
