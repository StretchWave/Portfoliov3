"use client";

import { useInteraction } from "./interaction-provider";

export function InteractionHud() {
  const { focused } = useInteraction();

  return (
    <div className="interaction-hud" aria-live="polite">
      {focused ? (
        <p><span className="interaction-hud__dot" aria-hidden="true" /> {focused.hint}: <strong>{focused.label}</strong> <kbd>E</kbd></p>
      ) : (
        <p>WASD / arrows to move · drag the scene to look</p>
      )}
    </div>
  );
}
