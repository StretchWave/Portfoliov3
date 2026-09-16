"use client";

import { useEffect, useState } from "react";
import { useInteraction } from "./interaction-provider";

export function InteractionHud() {
  const { focused } = useInteraction();
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    );
  }, []);

  return (
    <div className="interaction-hud" aria-live="polite">
      {focused ? (
        <p>
          <span className="interaction-hud__dot" aria-hidden="true" /> {focused.hint}:{" "}
          <strong>{focused.label}</strong>{" "}
          {isTouch ? (
            <span className="hud-touch-badge">TAP BUTTON</span>
          ) : (
            <kbd>E</kbd>
          )}
        </p>
      ) : (
        <p>
          {isTouch
            ? "Use joystick to move · Swipe to look"
            : "WASD / arrows to move · drag the scene to look"}
        </p>
      )}
    </div>
  );
}

