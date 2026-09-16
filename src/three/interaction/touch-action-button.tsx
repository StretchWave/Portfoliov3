"use client";

import { hapticManager } from "@/lib/haptic-feedback";
import { soundManager } from "@/lib/audio-synthesizer";
import { useInteraction } from "./interaction-provider";

export function TouchActionButton() {
  const { focused, requestInteraction } = useInteraction();

  if (!focused) {
    return null;
  }

  const isPortal = focused.hint.toLowerCase().includes("portal") || focused.id.startsWith("portal");

  function handleClick() {
    hapticManager.trigger(isPortal ? "heavy" : "medium");
    soundManager.playTactileClick();
    requestInteraction();
  }

  return (
    <button
      type="button"
      className={`touch-action-btn ${isPortal ? "touch-action-btn--portal" : "touch-action-btn--exhibit"}`}
      onClick={handleClick}
      aria-label={`${focused.hint}: ${focused.label}`}
    >
      <span className="touch-action-btn__icon">{isPortal ? "✦" : "⬡"}</span>
      <div className="touch-action-btn__text">
        <span className="touch-action-btn__hint">{focused.hint.toUpperCase()}</span>
        <strong className="touch-action-btn__label">{focused.label}</strong>
      </div>
    </button>
  );
}
