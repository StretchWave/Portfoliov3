"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";

const movementKeys = new Set(["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"]);
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

/**
 * Minimal first-person exploration, intentionally isolated from interaction
 * and exhibits. Bounds are owned by the mounted area so the controller stays
 * reusable; movement is bounded, not collision/physics based.
 */
export function ExplorerController({ bounds = DEFAULT_BOUNDS }: { bounds?: ExplorerBounds }) {
  const pressedKeys = useRef(new Set<string>());
  const dragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  useEffect(() => {
    function updateKey(event: KeyboardEvent, pressed: boolean) {
      const key = event.key.toLowerCase();
      if (!movementKeys.has(key)) return;
      pressedKeys.current[pressed ? "add" : "delete"](key);
      event.preventDefault();
    }

    const onKeyDown = (event: KeyboardEvent) => updateKey(event, true);
    const onKeyUp = (event: KeyboardEvent) => updateKey(event, false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
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
    const keys = pressedKeys.current;
    const forwardInput = Number(keys.has("w") || keys.has("arrowup")) - Number(keys.has("s") || keys.has("arrowdown"));
    const sideInput = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
    if (!forwardInput && !sideInput) return;

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, up).normalize();
    movement.copy(forward).multiplyScalar(forwardInput).addScaledVector(right, sideInput).normalize();
    camera.position.addScaledVector(movement, Math.min(delta, 0.05) * 4.2);

    // The area owns its walkable footprint; this is not a collision system.
    camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.position.x));
    camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, camera.position.z));
    camera.position.y = 1.7;
  });

  return null;
}
