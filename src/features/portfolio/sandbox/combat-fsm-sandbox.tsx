"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { soundManager } from "@/lib/audio-synthesizer";

export type CombatActionType = "light_jab" | "heavy_cleave" | "parry" | "dodge_roll" | "poise_break";

export type FramePhase = "neutral" | "startup" | "active" | "recovery" | "iframe" | "hitstun";

export interface ActionDefinition {
  id: CombatActionType;
  name: string;
  totalFrames: number;
  startup: number;
  active: number;
  recovery: number;
  iframes?: { start: number; end: number };
  onHitAdvantage: number;
  onBlockAdvantage: number;
  poiseDamage: number;
  staminaCost: number;
  description: string;
}

export const COMBAT_ACTIONS: Record<CombatActionType, ActionDefinition> = {
  light_jab: {
    id: "light_jab",
    name: "Light Thrust",
    totalFrames: 12,
    startup: 3,
    active: 2,
    recovery: 7,
    onHitAdvantage: 2,
    onBlockAdvantage: -3,
    poiseDamage: 18,
    staminaCost: 12,
    description: "Fast poke with frame-safe recovery. Used for spacing and interrupt priority.",
  },
  heavy_cleave: {
    id: "heavy_cleave",
    name: "Heavy Cleave",
    totalFrames: 26,
    startup: 9,
    active: 4,
    recovery: 13,
    onHitAdvantage: 7,
    onBlockAdvantage: -9,
    poiseDamage: 52,
    staminaCost: 28,
    description: "High-commitment swing with heavy poise break damage. Punishable on whiff or block.",
  },
  parry: {
    id: "parry",
    name: "Defensive Parry",
    totalFrames: 16,
    startup: 2,
    active: 5,
    recovery: 9,
    onHitAdvantage: 15,
    onBlockAdvantage: 15,
    poiseDamage: 75,
    staminaCost: 20,
    description: "Deflective poise redirect. Deflects incoming active frames into massive frame advantage.",
  },
  dodge_roll: {
    id: "dodge_roll",
    name: "Evasive Roll",
    totalFrames: 22,
    startup: 2,
    active: 0,
    recovery: 9,
    iframes: { start: 3, end: 13 },
    onHitAdvantage: 0,
    onBlockAdvantage: 0,
    poiseDamage: 0,
    staminaCost: 22,
    description: "Spatial repositioning with 11 invulnerability frames (I-frames) bypassing hitboxes.",
  },
  poise_break: {
    id: "poise_break",
    name: "Poise Break Stagger",
    totalFrames: 42,
    startup: 0,
    active: 0,
    recovery: 42,
    onHitAdvantage: -22,
    onBlockAdvantage: -22,
    poiseDamage: 0,
    staminaCost: 0,
    description: "Poise meter depleted to zero; target is staggered in critical vulnerable hitstun.",
  },
};

export function getPhaseForFrame(frame: number, act: ActionDefinition): FramePhase {
  if (frame === 0) return "neutral";
  if (act.id === "poise_break") return "hitstun";

  if (act.iframes && frame >= act.iframes.start && frame <= act.iframes.end) {
    return "iframe";
  }

  if (frame <= act.startup) {
    return "startup";
  }
  if (frame <= act.startup + act.active) {
    return "active";
  }
  return "recovery";
}

export function CombatFsmSandbox() {
  const [activeActionId, setActiveActionId] = useState<CombatActionType>("light_jab");
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const action = COMBAT_ACTIONS[activeActionId];
  const totalFrames = action.totalFrames;

  const currentPhase = getPhaseForFrame(currentFrame, action);

  // Playback timer (60 FPS = ~16.6ms)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= totalFrames) {
            setIsPlaying(false);
            return 0; // Return to neutral
          }
          return prev + 1;
        });
      }, 33); // 30 FPS slowed for visual clarity
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, totalFrames]);

  const selectAction = (id: CombatActionType) => {
    soundManager.playBlip();
    setActiveActionId(id);
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const stepFrame = () => {
    soundManager.playTactileClick();
    setCurrentFrame((prev) => (prev >= totalFrames ? 0 : prev + 1));
  };

  const resetNeutral = () => {
    soundManager.playBlip();
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const playAction = () => {
    soundManager.playTactileClick();
    setCurrentFrame(1);
    setIsPlaying(true);
  };

  return (
    <div className="sandbox-panel" role="region" aria-label="Deterministic Combat Action FSM Parser">
      <div className="sandbox-panel__header">
        <div className="sandbox-badge-row">
          <span className="sandbox-badge">ACTION COMBAT</span>
          <span className="sandbox-badge sandbox-badge--sub">DETERMINISTIC FSM</span>
          <span className="sandbox-complexity">Complexity: O(1) · Fixed Window Matrix</span>
        </div>
        <h3>Deterministic Frame-Data & State-Transition Engine</h3>
        <p>
          Frame-by-frame combat action simulator modeling startup commitments, active hitbox windows, whiff recovery
          punishments, and block advantage calculations inspired by Stance Combat PvP.
        </p>
      </div>

      {/* Action Selector Chips */}
      <div className="combat-action-selector">
        {Object.values(COMBAT_ACTIONS).map((act) => (
          <button
            key={act.id}
            type="button"
            className={`combat-action-chip ${act.id === activeActionId ? "combat-action-chip--active" : ""}`}
            onClick={() => selectAction(act.id)}
          >
            {act.name} <span className="chip-frames">({act.totalFrames}f)</span>
          </button>
        ))}
      </div>

      {/* Frame Timeline Bar */}
      <div className="timeline-container">
        <div className="timeline-header">
          <span className="timeline-title">
            FRAME TIMELINE ({currentFrame === 0 ? "NEUTRAL" : `FRAME ${currentFrame} / ${totalFrames}`})
          </span>
          <span className={`phase-badge phase-badge--${currentPhase}`}>
            PHASE: {currentPhase.toUpperCase()}
          </span>
        </div>

        <div className="frame-timeline-track" role="progressbar" aria-valuenow={currentFrame} aria-valuemin={0} aria-valuemax={totalFrames}>
          {Array.from({ length: totalFrames }).map((_, i) => {
            const frameNum = i + 1;
            const phase = getPhaseForFrame(frameNum, action);
            const isCurrent = frameNum === currentFrame;

            return (
              <div
                key={frameNum}
                className={`timeline-frame-cell timeline-frame-cell--${phase} ${isCurrent ? "timeline-frame-cell--current" : ""}`}
                title={`Frame ${frameNum}: ${phase}`}
                onClick={() => {
                  soundManager.playTactileClick();
                  setCurrentFrame(frameNum);
                }}
              >
                <span className="frame-num">{frameNum}</span>
              </div>
            );
          })}
        </div>

        {/* Phase Legend */}
        <div className="timeline-legend">
          <span className="legend-item"><span className="legend-dot legend-dot--startup" /> Startup ({action.startup}f)</span>
          {action.active > 0 ? (
            <span className="legend-item"><span className="legend-dot legend-dot--active" /> Active Hitbox ({action.active}f)</span>
          ) : null}
          {action.iframes ? (
            <span className="legend-item"><span className="legend-dot legend-dot--iframe" /> Invulnerable I-Frames</span>
          ) : null}
          <span className="legend-item"><span className="legend-dot legend-dot--recovery" /> Recovery ({action.recovery}f)</span>
        </div>
      </div>

      {/* 2D Fighter Wireframe & Hitbox Schematic */}
      <div className="combat-schematic-grid">
        <div className="fighter-schematic-card">
          <svg className="fighter-svg" viewBox="0 0 200 160" aria-hidden="true">
            {/* Ground Grid */}
            <line x1="10" y1="140" x2="190" y2="140" stroke="rgba(104, 228, 255, 0.25)" strokeWidth="1.5" />

            {/* Fighter Body (Green Hurtbox) */}
            <rect
              x="85"
              y="50"
              width="30"
              height="85"
              rx="4"
              fill={currentPhase === "iframe" ? "rgba(16, 185, 129, 0.25)" : "rgba(34, 197, 94, 0.15)"}
              stroke={currentPhase === "iframe" ? "#10b981" : "#22c55e"}
              strokeWidth="2"
              strokeDasharray={currentPhase === "iframe" ? "4 2" : undefined}
            />
            {/* Fighter Head */}
            <circle
              cx="100"
              cy="35"
              r="12"
              fill={currentPhase === "iframe" ? "rgba(16, 185, 129, 0.25)" : "rgba(34, 197, 94, 0.2)"}
              stroke={currentPhase === "iframe" ? "#10b981" : "#22c55e"}
              strokeWidth="2"
            />

            {/* Active Hitbox (Red/Cyan Overlay when ACTIVE) */}
            {currentPhase === "active" ? (
              <g className="hitbox-overlay">
                <rect
                  x="115"
                  y="45"
                  width={activeActionId === "heavy_cleave" ? "65" : "45"}
                  height="40"
                  rx="6"
                  fill="rgba(239, 68, 68, 0.35)"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />
                <text x="138" y="70" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  HITBOX
                </text>
              </g>
            ) : null}

            {/* Parry Arc when in Parry active window */}
            {currentPhase === "active" && activeActionId === "parry" ? (
              <path
                d="M 115 30 A 45 45 0 0 1 115 130"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeDasharray="6 3"
              />
            ) : null}

            {/* Stagger Star if Poise Broken */}
            {currentPhase === "hitstun" ? (
              <text x="100" y="20" fill="#f87171" fontSize="16" textAnchor="middle">
                💫 STUNNED
              </text>
            ) : null}
          </svg>
          <span className="schematic-caption">
            {currentPhase === "active"
              ? "ACTIVE HITBOX GENERATED (Hurtbox Vulnerable)"
              : currentPhase === "iframe"
              ? "INVULNERABILITY STATE (Hitboxes Pass Through)"
              : currentPhase === "startup"
              ? "STARTUP COMMITMENT (Input Locked)"
              : currentPhase === "recovery"
              ? "RECOVERY (Whiff Punishable Window)"
              : "NEUTRAL STANCE (Ready for Buffer)"}
          </span>
        </div>

        {/* Action Controls & Math Telemetry */}
        <div className="combat-stats-panel">
          <p className="action-description">{action.description}</p>

          <div className="sandbox-actions-row">
            <button
              type="button"
              className={`sandbox-btn ${isPlaying ? "sandbox-btn--active" : ""}`}
              onClick={playAction}
            >
              {isPlaying ? "⏸ Pause" : "▶ Play Animation"}
            </button>
            <button type="button" className="sandbox-btn" onClick={stepFrame} disabled={isPlaying}>
              ⏯ Step +1f
            </button>
            <button type="button" className="sandbox-btn" onClick={resetNeutral}>
              ↺ Neutral
            </button>
          </div>

          <div className="combat-advantage-grid">
            <div className="telemetry-card">
              <span className="telemetry-label">ON-HIT ADVANTAGE</span>
              <span
                className="telemetry-val"
                style={{ color: action.onHitAdvantage >= 0 ? "#4ade80" : "#f87171" }}
              >
                {action.onHitAdvantage > 0 ? `+${action.onHitAdvantage}f` : `${action.onHitAdvantage}f`}
              </span>
            </div>
            <div className="telemetry-card">
              <span className="telemetry-label">ON-BLOCK ADVANTAGE</span>
              <span
                className="telemetry-val"
                style={{ color: action.onBlockAdvantage >= -3 ? "#4ade80" : "#f87171" }}
              >
                {action.onBlockAdvantage > 0 ? `+${action.onBlockAdvantage}f` : `${action.onBlockAdvantage}f`}
              </span>
            </div>
            <div className="telemetry-card">
              <span className="telemetry-label">BLOCK PUNISHABLE?</span>
              <span
                className="telemetry-val"
                style={{ color: action.onBlockAdvantage < -5 ? "#f87171" : "#38bdf8" }}
              >
                {action.onBlockAdvantage < -5 ? "YES (PUNISHABLE)" : "NO (SAFE)"}
              </span>
            </div>
            <div className="telemetry-card">
              <span className="telemetry-label">POISE DAMAGE</span>
              <span className="telemetry-val">{action.poiseDamage} pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
