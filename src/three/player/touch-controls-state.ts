/**
 * Zero-dependency, garbage-collection-free touch input state container.
 * Directly read in R3F useFrame loops to achieve 60 FPS without React re-renders.
 */
export interface TouchMovementState {
  x: number; // -1.0 (strafe left) to +1.0 (strafe right)
  y: number; // -1.0 (move backward) to +1.0 (move forward)
  active: boolean;
}

export const touchMovement: TouchMovementState = {
  x: 0,
  y: 0,
  active: false,
};

export function setTouchMovement(x: number, y: number): void {
  touchMovement.x = Math.max(-1, Math.min(1, x));
  touchMovement.y = Math.max(-1, Math.min(1, y));
  touchMovement.active = true;
}

export function resetTouchMovement(): void {
  touchMovement.x = 0;
  touchMovement.y = 0;
  touchMovement.active = false;
}
