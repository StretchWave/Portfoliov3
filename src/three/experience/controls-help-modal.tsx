"use client";

import { usePerformance } from "../performance/performance-context";

export function ControlsHelpModal() {
  const { showHelp, setShowHelp } = usePerformance();

  if (!showHelp) return null;

  return (
    <div
      className="controls-modal-backdrop"
      onClick={() => setShowHelp(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="controls-modal-title"
    >
      <div className="controls-modal" onClick={(e) => e.stopPropagation()}>
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
            <kbd>Click + Drag</kbd>
            <p>Look around and orbit perspective</p>
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
