"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { soundManager } from "@/lib/audio-synthesizer";

export interface ArchitecturalPipelineDiagramProps {
  projectName: string;
  overview: string;
  layers: readonly string[];
}

function inferStageCategory(layer: string, index: number, total: number): string {
  const lower = layer.toLowerCase();
  if (lower.includes("guardrail") || lower.includes("policy") || lower.includes("safety")) {
    return "Governance & Safety";
  }
  if (lower.includes("database") || lower.includes("cache") || lower.includes("store") || lower.includes("state")) {
    return "State & Persistence";
  }
  if (lower.includes("engine") || lower.includes("worker") || lower.includes("resolver") || lower.includes("pipeline") || lower.includes("parsing")) {
    return "Core Processing";
  }
  if (index === 0) return "Ingestion / Source";
  if (index === total - 1) return "Egress / Interface";
  return "Transformation";
}

export function ArchitecturalPipelineDiagram({
  projectName,
  overview,
  layers,
}: ArchitecturalPipelineDiagramProps) {
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);
  const [simulatingIndex, setSimulatingIndex] = useState<number | null>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalStages = layers.length;
  const activeIndex = simulatingIndex !== null ? simulatingIndex : selectedStageIndex;
  const activeStage = layers[activeIndex] || layers[0];
  const activeCategory = inferStageCategory(activeStage, activeIndex, totalStages);

  // Stop simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
    };
  }, []);

  const handleStageSelect = useCallback((index: number) => {
    soundManager.playBlip();
    setSelectedStageIndex(index);
    setSimulatingIndex(null);
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
  }, []);

  const runSimulation = useCallback(() => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
    }
    soundManager.playChime();
    setSimulatingIndex(0);

    let current = 0;
    simulationTimerRef.current = setInterval(() => {
      current += 1;
      if (current < totalStages) {
        setSimulatingIndex(current);
        soundManager.playBlip();
      } else {
        clearInterval(simulationTimerRef.current!);
        simulationTimerRef.current = null;
        setSimulatingIndex(null);
        soundManager.playChime();
      }
    }, 650);
  }, [totalStages]);

  const upstream = activeIndex > 0 ? layers[activeIndex - 1] : "Client Input / Ingestion Source";
  const downstream = activeIndex < totalStages - 1 ? layers[activeIndex + 1] : "Presentation UI / Client Consumer";

  return (
    <div className="pipeline-diagram" role="region" aria-label={`${projectName} Architectural Pipeline`}>
      <div className="pipeline-diagram__header">
        <div className="pipeline-diagram__title-group">
          <span className="pipeline-diagram__badge">PIPELINE ARCHITECTURE</span>
          <span className="pipeline-diagram__subtitle">
            {totalStages} Architectural Stages Connected in Sequence
          </span>
        </div>

        <button
          type="button"
          className={`button button--compact pipeline-simulate-btn ${simulatingIndex !== null ? "pipeline-simulate-btn--active" : ""}`}
          onClick={runSimulation}
          title="Simulate data payload traversing through pipeline stages"
        >
          {simulatingIndex !== null ? (
            <>
              <span className="pipeline-pulse-dot" /> Simulating Flow ({simulatingIndex + 1}/{totalStages})...
            </>
          ) : (
            <>▶ Simulate Data Flow</>
          )}
        </button>
      </div>

      {/* Horizontal / Wrapped Stages Flow */}
      <div className="pipeline-stages-container">
        <div className="pipeline-stages-scroll">
          {layers.map((layer, index) => {
            const isSelected = selectedStageIndex === index && simulatingIndex === null;
            const isSimulating = simulatingIndex === index;
            const category = inferStageCategory(layer, index, totalStages);

            return (
              <div key={layer} className="pipeline-stage-wrapper">
                <button
                  type="button"
                  className={`pipeline-stage-card ${isSelected ? "pipeline-stage-card--selected" : ""} ${isSimulating ? "pipeline-stage-card--simulating" : ""}`}
                  onClick={() => handleStageSelect(index)}
                  aria-selected={isSelected || isSimulating}
                >
                  <div className="pipeline-stage-card__header">
                    <span className="pipeline-stage-card__number">
                      STAGE {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="pipeline-stage-card__tag">{category}</span>
                  </div>
                  <div className="pipeline-stage-card__title">{layer}</div>
                  <div className="pipeline-stage-card__indicator" />
                </button>

                {index < totalStages - 1 ? (
                  <div
                    className={`pipeline-connector ${isSimulating || (simulatingIndex !== null && simulatingIndex > index) ? "pipeline-connector--active" : ""}`}
                    aria-hidden="true"
                  >
                    <svg className="pipeline-connector__svg" viewBox="0 0 40 16">
                      <line x1="0" y1="8" x2="32" y2="8" className="pipeline-connector__line" />
                      <polyline points="28,4 36,8 28,12" className="pipeline-connector__arrowhead" />
                    </svg>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Detailed Inspector Panel */}
      <div className="pipeline-detail-panel">
        <div className="pipeline-detail-panel__header">
          <div className="pipeline-detail-panel__stage-eyebrow">
            STAGE {String(activeIndex + 1).padStart(2, "0")} OF {String(totalStages).padStart(2, "0")} &bull;{" "}
            {activeCategory}
          </div>
          <h4 className="pipeline-detail-panel__title">{activeStage}</h4>
        </div>

        <div className="pipeline-detail-panel__relations">
          <div className="pipeline-relation-item">
            <span className="pipeline-relation-item__label">▲ Upstream Feeder</span>
            <span className="pipeline-relation-item__value">{upstream}</span>
          </div>

          <div className="pipeline-relation-item">
            <span className="pipeline-relation-item__label">▼ Downstream Consumer</span>
            <span className="pipeline-relation-item__value">{downstream}</span>
          </div>

          <div className="pipeline-relation-item">
            <span className="pipeline-relation-item__label">✦ Pipeline Responsibility</span>
            <span className="pipeline-relation-item__value">
              {activeIndex === 0
                ? "Accepts incoming network packets, raw events, or stream inputs; parses schemas and initializes boundary contracts."
                : activeIndex === totalStages - 1
                ? "Emits formatted outputs, dispatches reactivity signals to view controllers, and finalizes presentation state."
                : "Validates state invariants, enforces transactional isolation, and transforms data payloads for subsequent pipeline consumers."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
