"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { soundManager } from "@/lib/audio-synthesizer";
import { useModalFocusTrap } from "@/lib/modal-accessibility";
import {
  COMPARISON_SPECS,
  COMPARISON_PRESETS,
  type ProjectArchitectureSpec,
} from "../comparison/project-comparison-data";
import { ProjectRadarChart } from "./project-radar-chart";

export interface ProjectComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectIds?: string[];
}

export function ProjectComparisonModal({
  isOpen,
  onClose,
  initialProjectIds,
}: ProjectComparisonModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialProjectIds && initialProjectIds.length >= 2) {
      return initialProjectIds.slice(0, 3);
    }
    return ["sonara", "lyrune"];
  });

  const [activePresetId, setActivePresetId] = useState<string | null>("desktop-ipc");

  const [prevInitialIds, setPrevInitialIds] = useState(initialProjectIds);
  if (initialProjectIds !== prevInitialIds) {
    setPrevInitialIds(initialProjectIds);
    if (initialProjectIds && initialProjectIds.length >= 2) {
      setSelectedIds(initialProjectIds.slice(0, 3));
      setActivePresetId(null);
    }
  }

  const dialogRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(isOpen, dialogRef, onClose);

  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = COMPARISON_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    soundManager.playChime();
    setSelectedIds(preset.projectIds);
    setActivePresetId(presetId);
  }, []);

  const handleToggleProject = useCallback((projectId: string) => {
    soundManager.playBlip();
    setActivePresetId(null);

    setSelectedIds((prev) => {
      if (prev.includes(projectId)) {
        if (prev.length <= 2) {
          // Keep at least 2 projects for meaningful comparison
          return prev;
        }
        return prev.filter((id) => id !== projectId);
      } else {
        if (prev.length >= 3) {
          // Replace the second item to keep 3
          return [prev[0], prev[2], projectId];
        }
        return [...prev, projectId];
      }
    });
  }, []);

  if (!isOpen) return null;

  const activeSpecs: ProjectArchitectureSpec[] = selectedIds
    .map((id) => COMPARISON_SPECS[id])
    .filter(Boolean);

  const allProjectKeys = Object.keys(COMPARISON_SPECS);

  return (
    <div
      className="comparison-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diff-engine-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="comparison-modal">
        {/* Header */}
        <div className="comparison-modal__header">
          <div>
            <span className="comparison-modal__badge">SYSTEMS ARCHITECTURE DIFF ENGINE</span>
            <h2 id="diff-engine-title" className="comparison-modal__title">
              Cross-Project Trade-Off Matrix
            </h2>
            <p className="comparison-modal__subtitle">
              Compare architectural paradigms, latency budgets, state patterns, and trade-off rationales side-by-side.
            </p>
          </div>
          <button
            type="button"
            className="comparison-modal__close"
            onClick={onClose}
            aria-label="Close Systems Diff Engine (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Preset Selector */}
        <div className="comparison-modal__presets">
          <span className="comparison-presets-label">Quick Scenarios:</span>
          <div className="comparison-presets-list">
            {COMPARISON_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`preset-btn ${activePresetId === preset.id ? "preset-btn--active" : ""}`}
                onClick={() => handleSelectPreset(preset.id)}
              >
                <span className="preset-btn__tag">{preset.badge}</span>
                <span className="preset-btn__title">{preset.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Project Selector Chips */}
        <div className="comparison-selector-row">
          <span className="comparison-selector-label">
            Comparing ({selectedIds.length}/3 Systems):
          </span>
          <div className="comparison-chips-wrap">
            {allProjectKeys.map((key) => {
              const spec = COMPARISON_SPECS[key];
              const isSelected = selectedIds.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  className={`comparison-chip ${isSelected ? "comparison-chip--selected" : ""}`}
                  style={isSelected ? { borderColor: spec.accentColor, color: "#f1f5f9" } : undefined}
                  onClick={() => handleToggleProject(key)}
                  aria-pressed={isSelected}
                >
                  <span
                    className="comparison-chip__indicator"
                    style={{ backgroundColor: isSelected ? spec.accentColor : "transparent" }}
                  />
                  {spec.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body Grid: Radar Chart + Specs Matrix */}
        <div className="comparison-modal__body">
          {/* Visual Radar Telemetry Section */}
          <div className="comparison-radar-section">
            <div className="section-eyebrow">SYSTEM PROFILE RADAR (5 DIMENSIONS)</div>
            <ProjectRadarChart projects={activeSpecs} />
          </div>

          {/* Detailed Side-by-Side Specs Matrix */}
          <div className="comparison-matrix-section">
            <div className="section-eyebrow">ARCHITECTURAL SPECIFICATION BREAKDOWN</div>
            <div
              className="comparison-cards-grid"
              style={{
                gridTemplateColumns: `repeat(${activeSpecs.length}, minmax(260px, 1fr))`,
              }}
            >
              {activeSpecs.map((spec) => (
                <div key={spec.projectId} className="comparison-project-card">
                  {/* Card Header */}
                  <div
                    className="comparison-project-card__header"
                    style={{ borderTopColor: spec.accentColor }}
                  >
                    <div className="card-title-group">
                      <span className="project-category-tag">{spec.categoryTitle}</span>
                      <h3 className="project-title" style={{ color: spec.accentColor }}>
                        {spec.name}
                      </h3>
                    </div>
                    <Link
                      href={`/projects/${spec.projectId}`}
                      className="case-study-quicklink"
                      onClick={onClose}
                    >
                      Case Study ↗
                    </Link>
                  </div>

                  {/* Specs List */}
                  <div className="comparison-specs-list">
                    <div className="spec-item">
                      <span className="spec-item__label">✦ Architecture Paradigm</span>
                      <span className="spec-item__value">{spec.paradigm}</span>
                    </div>

                    <div className="spec-item">
                      <span className="spec-item__label">⏱ Latency & Frame Budget</span>
                      <span className="spec-item__value">{spec.latencyBudget}</span>
                    </div>

                    <div className="spec-item">
                      <span className="spec-item__label">💾 State Strategy & Persistence</span>
                      <span className="spec-item__value">{spec.stateStrategy}</span>
                    </div>

                    <div className="spec-item">
                      <span className="spec-item__label">🛡 Failure Mode & Fallback</span>
                      <span className="spec-item__value">{spec.failureMode}</span>
                    </div>

                    <div className="spec-item">
                      <span className="spec-item__label">⚡ Concurrency & Process Model</span>
                      <span className="spec-item__value">{spec.concurrencyModel}</span>
                    </div>

                    {/* Trade-Off Deep Dive */}
                    <div className="spec-tradeoff-box">
                      <div className="spec-tradeoff-header">
                        <span className="tradeoff-icon">⚖</span> KEY ARCHITECTURAL TRADE-OFF
                      </div>
                      <div className="tradeoff-row tradeoff-row--chosen">
                        <span className="tradeoff-tag tradeoff-tag--chosen">CHOSEN</span>
                        <span className="tradeoff-text">{spec.primaryTradeoff.chosen}</span>
                      </div>
                      <div className="tradeoff-row tradeoff-row--rejected">
                        <span className="tradeoff-tag tradeoff-tag--rejected">REJECTED</span>
                        <span className="tradeoff-text">{spec.primaryTradeoff.rejected}</span>
                      </div>
                      <div className="tradeoff-rationale">
                        <strong>Rationale:</strong> {spec.primaryTradeoff.rationale}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="comparison-modal__footer">
          <div className="comparison-footer__info">
            ✦ All architectural ratings and constraints are statically verified from Project Atlas codebase repositories.
          </div>
          <button type="button" className="button button--compact" onClick={onClose}>
            Done Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
