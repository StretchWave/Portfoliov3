"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { setTouchMovement, resetTouchMovement } from "./touch-controls-state";

export function VirtualJoystick() {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeTouchId = useRef<number | null>(null);
  const isPointerActive = useRef(false);
  const [isActive, setIsActive] = useState(false);

  const MAX_RADIUS = 42; // Max radius distance the knob can travel in px

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !knobRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    let clampedX = dx;
    let clampedY = dy;

    if (dist > MAX_RADIUS) {
      clampedX = (dx / dist) * MAX_RADIUS;
      clampedY = (dy / dist) * MAX_RADIUS;
    }

    // Direct DOM transform for 60fps performance without React re-render lag
    knobRef.current.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`;

    // normX: -1 (left) to +1 (right)
    // normY: -1 (backward/down) to +1 (forward/up)
    const normX = clampedX / MAX_RADIUS;
    const normY = -clampedY / MAX_RADIUS;

    setTouchMovement(normX, normY);
  }, []);

  const handleEnd = useCallback(() => {
    activeTouchId.current = null;
    isPointerActive.current = false;
    setIsActive(false);
    resetTouchMovement();
    if (knobRef.current) {
      knobRef.current.style.transform = "translate3d(0px, 0px, 0)";
    }
  }, []);

  // Touch handlers
  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (activeTouchId.current !== null) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      activeTouchId.current = touch.identifier;
      setIsActive(true);
      handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch && touch.identifier === activeTouchId.current) {
          handleMove(touch.clientX, touch.clientY);
          break;
        }
      }
    },
    [handleMove]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch && touch.identifier === activeTouchId.current) {
          handleEnd();
          break;
        }
      }
    },
    [handleEnd]
  );

  // Pointer fallback for testing or mouse drag
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "touch") return; // Touch handled by touch events
      isPointerActive.current = true;
      setIsActive(true);
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  useEffect(() => {
    function onWindowPointerMove(e: PointerEvent) {
      if (!isPointerActive.current) return;
      handleMove(e.clientX, e.clientY);
    }
    function onWindowPointerUp() {
      if (isPointerActive.current) {
        handleEnd();
      }
    }
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
    };
  }, [handleMove, handleEnd]);

  return (
    <div
      ref={containerRef}
      className={`virtual-joystick ${isActive ? "virtual-joystick--active" : ""}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      onPointerDown={onPointerDown}
      role="group"
      aria-label="Virtual Movement Joystick"
    >
      <div className="virtual-joystick__base">
        <div className="virtual-joystick__axis-h" />
        <div className="virtual-joystick__axis-v" />
        <div ref={knobRef} className="virtual-joystick__knob">
          <span className="virtual-joystick__knob-center" />
        </div>
      </div>
      <span className="virtual-joystick__label">MOVE</span>
    </div>
  );
}
