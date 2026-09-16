"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";

import { touchMovement } from "./touch-controls-state";
import { cameraSettings } from "../camera/camera-settings";

const movementKeys = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowleft",
  "arrowdown",
  "arrowright",
  " ",
  "space",
  "c",
  "shift",
]);
const up = new Vector3(0, 1, 0);
const forward = new Vector3();
const right = new Vector3();
const movement = new Vector3();

const DEFAULT_BOUNDS = { minX: -8, maxX: 8, minZ: -8, maxZ: 8 };

export interface ExplorerBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface ExplorerControllerProps {
  bounds?: ExplorerBounds;
  initialPosition?: readonly [number, number, number];
  initialYaw?: number;
}

/**
 * Minimal first-person exploration, intentionally isolated from interaction
 * and exhibits. Bounds are owned by the mounted area so the controller stays
 * reusable; movement is bounded, not collision/physics based.
 */
export function ExplorerController({
  bounds = DEFAULT_BOUNDS,
  initialPosition,
  initialYaw = 0,
}: ExplorerControllerProps) {
  const pressedKeys = useRef(new Set<string>());
  const dragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);
  const { camera } = useThree();

  useEffect(() => {
    if (!initialized.current) {
      if (initialPosition) {
        camera.position.set(...initialPosition);
      }
      camera.rotation.order = "YXZ";
      camera.rotation.set(0, initialYaw, 0);
      initialized.current = true;
    }
  }, [camera, initialPosition, initialYaw]);

  useEffect(() => {
    function updateKey(event: KeyboardEvent, pressed: boolean) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const key = event.key.toLowerCase();
      if (!movementKeys.has(key)) return;
      pressedKeys.current[pressed ? "add" : "delete"](key);
      event.preventDefault();
    }

    function onBlur() {
      pressedKeys.current.clear();
      dragging.current = false;
    }

    const onKeyDown = (event: KeyboardEvent) => updateKey(event, true);
    const onKeyUp = (event: KeyboardEvent) => updateKey(event, false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!(event.target instanceof HTMLCanvasElement)) return;
      dragging.current = true;
      previousPointer.current = { x: event.clientX, y: event.clientY };
    }

    function onPointerMove(event: PointerEvent) {
      if (!dragging.current) return;
      const deltaX = event.clientX - previousPointer.current.x;
      const deltaY = event.clientY - previousPointer.current.y;
      previousPointer.current = { x: event.clientX, y: event.clientY };

      camera.rotation.order = "YXZ";
      camera.rotation.y -= deltaX * 0.003;
      camera.rotation.x = Math.max(-1.45, Math.min(1.45, camera.rotation.x - deltaY * 0.003));
    }

    function stopDragging() {
      dragging.current = false;
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("blur", stopDragging);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("blur", stopDragging);
    };
  }, [camera]);

  useFrame((_, delta) => {
    const isFlight = cameraSettings.isFlightMode();

    const keys = pressedKeys.current;
    const keyForward = Number(keys.has("w") || keys.has("arrowup")) - Number(keys.has("s") || keys.has("arrowdown"));
    const keySide = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
    const keyAscend = Number(keys.has(" ") || keys.has("space"));
    const keyDescend = Number(keys.has("c") || keys.has("shift"));

    const touchForward = touchMovement.active ? touchMovement.y : 0;
    const touchSide = touchMovement.active ? touchMovement.x : 0;

    let forwardInput = keyForward + touchForward;
    let sideInput = keySide + touchSide;
    const verticalInput = keyAscend - keyDescend;

    const lenSq = forwardInput * forwardInput + sideInput * sideInput;
    const hasMoveInput = lenSq > 0.0001;
    const hasVertInput = Math.abs(verticalInput) > 0.0001;

    if (!hasMoveInput && !hasVertInput) {
      cameraSettings.setAltitude(camera.position.y);
      return;
    }

    if (hasMoveInput) {
      if (lenSq > 1) {
        const invLen = 1 / Math.sqrt(lenSq);
        forwardInput *= invLen;
        sideInput *= invLen;
      }

      camera.getWorldDirection(forward);
      if (!isFlight) {
        forward.y = 0;
        forward.normalize();
      }
      right.crossVectors(forward, up).normalize();
      movement.copy(forward).multiplyScalar(forwardInput).addScaledVector(right, sideInput);
      if (!isFlight) {
        movement.normalize();
      }
      const speed = isFlight ? 6.4 : 4.2;
      camera.position.addScaledVector(movement, Math.min(delta, 0.05) * speed);
    }

    if (isFlight) {
      if (hasVertInput) {
        camera.position.y += verticalInput * Math.min(delta, 0.05) * 5.2;
      }
      // Altitude bounds in flight mode: 0.4m to 25.0m
      camera.position.y = Math.max(0.4, Math.min(25.0, camera.position.y));

      // Expanded flight boundary (2.5x base)
      const flightMinX = bounds.minX * 2.5;
      const flightMaxX = bounds.maxX * 2.5;
      const flightMinZ = bounds.minZ * 2.5;
      const flightMaxZ = bounds.maxZ * 2.5;
      camera.position.x = Math.max(flightMinX, Math.min(flightMaxX, camera.position.x));
      camera.position.z = Math.max(flightMinZ, Math.min(flightMaxZ, camera.position.z));
    } else {
      // Ground walking bounds
      camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.position.x));
      camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, camera.position.z));
      camera.position.y = 1.7;
    }

    cameraSettings.setAltitude(camera.position.y);
  });

  return null;
}
