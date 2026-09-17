"use client";

import { useRef } from "react";
import { usePerformance } from "../performance/performance-context";
import { useModalFocusTrap } from "@/lib/modal-accessibility";

export function ControlsHelpModal() {
  const { showHelp, setShowHelp } = usePerformance();
  const modalRef = useRef<HTMLDivElement>(null);

  useModalFocusTrap(showHelp, modalRef, () => setShowHelp(false));

  if (!showHelp) return null;

  return (
    <div
      className="controls-modal-backdrop"
      onClick={() => setShowHelp(false)}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="controls-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="controls-modal-title"
      >
        <div className="controls-modal__header">
          <h3 id="controls-modal-title">Navigation & Interaction Controls</h3>
          <button
            type="button"
            className="controls-modal__close"
            onClick={() => setShowHelp(false)}
            aria-label="Close controls modal"
          >
            ×
          </button>
        </div>

        <div className="controls-modal__grid">
          <div className="control-item">
            <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> / <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd>
            <p>Move explorer through the hall</p>
          </div>
          <div className="control-item">
            <kbd>Drag scene</kbd>
            <p>Rotate camera perspective / look around</p>
          </div>
          <div className="control-item">
            <kbd>Touch Joystick</kbd>
            <p>Mobile virtual movement thumbstick & swipe-to-look</p>
          </div>
          <div className="control-item">
            <kbd>E</kbd> / <kbd>Click Exhibit</kbd>
            <p>Inspect project details and open live demos</p>
          </div>
          <div className="control-item">
            <kbd>E</kbd> / <kbd>Click Portal</kbd>
            <p>Travel between world districts</p>
          </div>
          <div className="control-item">
            <kbd>F</kbd>
            <p>Toggle 3D drone flight / free-cam mode</p>
          </div>
          <div className="control-item">
            <kbd>Space</kbd> / <kbd>C</kbd>
            <p>Ascend / descend altitude in flight mode</p>
          </div>
          <div className="control-item">
            <kbd>X</kbd>
            <p>Capture viewport screenshot PNG</p>
          </div>
          <div className="control-item">
            <kbd>[</kbd> <kbd>]</kbd>
            <p>Adjust camera Field of View (zoom in / wide angle)</p>
          </div>
          <div className="control-item">
            <kbd>U</kbd>
            <p>Audio & haptics control center</p>
          </div>
          <div className="control-item">
            <kbd>T</kbd>
            <p>Toggle cinematic automated director tour</p>
          </div>
          <div className="control-item">
            <kbd>J</kbd>
            <p>Open portfolio discovery journal & milestones</p>
          </div>
          <div className="control-item">
            <kbd>M</kbd>
            <p>Toggle spatial radar & mini-map</p>
          </div>
          <div className="control-item">
            <kbd>Ctrl</kbd> <kbd>K</kbd>
            <p>Universal quick search & district fast-travel</p>
          </div>
          <div className="control-item">
            <kbd>P</kbd>
            <p>Toggle real-time WebGL performance metrics</p>
          </div>
          <div className="control-item">
            <kbd>?</kbd>
            <p>Toggle this keyboard guide</p>
          </div>
          <div className="control-item">
            <kbd>Esc</kbd>
            <p>Dismiss active overlay or panel</p>
          </div>
        </div>

        <div className="controls-modal__footer">
          <p>
            <strong>Accessibility Note:</strong> Every project, case study, and technical detail in the 3D hub is accessible via the standard keyboard-friendly, screen-reader optimized conventional web routes.
          </p>
        </div>
      </div>
    </div>
  );
}
