"use client";

import { usePerformance, QualityTier } from "./performance-context";

export function PerformanceHud() {
  const { showDiagnostics, setShowDiagnostics, metrics, quality, setQuality } = usePerformance();

  if (!showDiagnostics) return null;

  const fpsColor =
    metrics.fps >= 50 ? "#22c55e" : metrics.fps >= 30 ? "#eab308" : "#ef4444";

  return (
    <div className="perf-hud" role="region" aria-label="Performance diagnostics">
      <div className="perf-hud__header">
        <span className="perf-hud__title">WebGL Diagnostics (P)</span>
        <button
          type="button"
          className="perf-hud__close"
          onClick={() => setShowDiagnostics(false)}
          aria-label="Close diagnostics"
        >
          ×
        </button>
      </div>

      <div className="perf-hud__body">
        <div className="perf-metric-row">
          <span className="perf-metric-label">Frame Rate:</span>
          <span className="perf-metric-val" style={{ color: fpsColor }}>
            {metrics.fps} FPS
          </span>
        </div>
        <div className="perf-metric-row">
          <span className="perf-metric-label">Draw Calls:</span>
          <span className="perf-metric-val">{metrics.drawCalls}</span>
        </div>
        <div className="perf-metric-row">
          <span className="perf-metric-label">Triangles:</span>
          <span className="perf-metric-val">{metrics.triangles.toLocaleString()}</span>
        </div>
        <div className="perf-metric-row">
          <span className="perf-metric-label">Geometries:</span>
          <span className="perf-metric-val">{metrics.geometries}</span>
        </div>
        <div className="perf-metric-row">
          <span className="perf-metric-label">Textures:</span>
          <span className="perf-metric-val">{metrics.textures}</span>
        </div>
      </div>

      <div className="perf-hud__footer">
        <span className="perf-hud__tier-label">Quality Preset:</span>
        <div className="perf-hud__tiers">
          {(["low", "balanced", "high"] as QualityTier[]).map((tier) => (
            <button
              key={tier}
              type="button"
              className={`perf-tier-btn ${quality === tier ? "perf-tier-btn--active" : ""}`}
              onClick={() => setQuality(tier)}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
