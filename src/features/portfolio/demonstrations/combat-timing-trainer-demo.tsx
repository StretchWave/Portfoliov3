"use client";

import { useEffect, useState, useRef } from "react";
import { soundManager } from "@/lib/audio-synthesizer";
import { useDiscoveryJournal } from "@/features/portfolio/journal/discovery-journal-context";

type Stance = "strength" | "agility" | "endurance";

export function CombatTimingTrainerDemo() {
  const { recordDiscovery } = useDiscoveryJournal();
  const [stance, setStance] = useState<Stance>("strength");
  const [stamina, setStamina] = useState(100);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [incomingMeter, setIncomingMeter] = useState(0); // 0 to 100
  const [isAttacking, setIsAttacking] = useState(true);
  const timerRef = useRef<number>(0);

  // Attack cycle loop
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 2.5;
      if (current > 100) {
        // Attack hit visitor if no defense was triggered
        setFeedback({ text: "Attacked landed! -25 HP", success: false });
        soundManager.playCombat("hit");
        setStreak(0);
        setStamina((s) => Math.min(100, s + 15));
        current = 0;
      }
      setIncomingMeter(current);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  function handleAction(action: "parry" | "dodge" | "block") {
    recordDiscovery("demo-combat-trainer");
    const windowStart = stance === "agility" ? 65 : 75;
    const windowEnd = 95;
    const inSweetSpot = incomingMeter >= windowStart && incomingMeter <= windowEnd;

    if (stamina < 20) {
      setFeedback({ text: "Exhausted! Not enough stamina.", success: false });
      soundManager.playCombat("hit");
      return;
    }

    if (action === "parry") {
      if (inSweetSpot && (stance === "strength" || incomingMeter >= 82)) {
        setFeedback({ text: "⚡ PERFECT PARRY! Counter-attack window open!", success: true });
        soundManager.playCombat("parry");
        setStreak((s) => s + 1);
        setStamina((s) => Math.max(0, s - 10));
      } else {
        setFeedback({ text: "Parry missed! Window too narrow.", success: false });
        soundManager.playCombat("hit");
        setStreak(0);
        setStamina((s) => Math.max(0, s - 25));
      }
    } else if (action === "dodge") {
      if (incomingMeter >= 50 && incomingMeter <= 95) {
        setFeedback({ text: "💨 CLEAN DODGE! Evasive roll executed.", success: true });
        soundManager.playCombat("dodge");
        setStreak((s) => s + 1);
        setStamina((s) => Math.max(0, s - 15));
      } else {
        setFeedback({ text: "Dodge mistimed! Clipped by swing.", success: false });
        soundManager.playCombat("hit");
        setStreak(0);
      }
    } else if (action === "block") {
      const staminaCost = stance === "endurance" ? 10 : 25;
      setFeedback({ text: `🛡️ BLOCKED! Absorbed hit (-${staminaCost} Stamina)`, success: true });
      soundManager.playCombat("block");
      setStamina((s) => Math.max(0, s - staminaCost));
    }

    setIncomingMeter(0); // Reset swing
  }

  // Tactical keyboard shortcuts: E (Parry), Space (Dodge), Shift (Block)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "e") {
        e.preventDefault();
        handleAction("parry");
      } else if (e.key === " " || key === "spacebar") {
        e.preventDefault();
        handleAction("dodge");
      } else if (e.key === "Shift") {
        e.preventDefault();
        handleAction("block");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="demo-combat">
      <div className="demo-combat__header">
        <div>
          <span className="demo-combat__eyebrow">Mechanics Simulator</span>
          <h4 className="demo-combat__title">Combat Timing & Stances</h4>
        </div>
        <div className="demo-combat__stats">
          <div className="combat-stat">
            <span className="combat-stat__label">Stamina:</span>
            <div className="stamina-bar">
              <div className="stamina-bar__fill" style={{ width: `${stamina}%` }} />
            </div>
          </div>
          <span className="streak-badge">Streak: {streak}</span>
        </div>
      </div>

      {/* Stance Selector */}
      <div className="stance-row">
        <button
          type="button"
          className={`stance-btn ${stance === "strength" ? "stance-btn--active" : ""}`}
          onClick={() => setStance("strength")}
        >
          <strong>Strength</strong>
          <small>Tight parry (+Counter)</small>
        </button>
        <button
          type="button"
          className={`stance-btn ${stance === "agility" ? "stance-btn--active" : ""}`}
          onClick={() => setStance("agility")}
        >
          <strong>Agility</strong>
          <small>Wide dodge window</small>
        </button>
        <button
          type="button"
          className={`stance-btn ${stance === "endurance" ? "stance-btn--active" : ""}`}
          onClick={() => setStance("endurance")}
        >
          <strong>Endurance</strong>
          <small>Low-cost guard block</small>
        </button>
      </div>

      {/* Incoming Attack Swing Indicator */}
      <div className="timing-meter-container">
        <div className="timing-meter-header">
          <span>Enemy Attack Window</span>
          <span>{incomingMeter > 75 ? "PARRY NOW!" : "Incoming..."}</span>
        </div>
        <div className="timing-meter-track">
          {/* Sweet spot highlight */}
          <div className="timing-meter-sweetspot" />
          <div className="timing-meter-cursor" style={{ left: `${incomingMeter}%` }} />
        </div>
      </div>

      {/* Defense Actions */}
      <div className="combat-actions">
        <button
          type="button"
          className="demo-btn demo-btn--parry"
          onClick={() => handleAction("parry")}
        >
          Parry (E)
        </button>
        <button
          type="button"
          className="demo-btn demo-btn--dodge"
          onClick={() => handleAction("dodge")}
        >
          Dodge (Space)
        </button>
        <button
          type="button"
          className="demo-btn demo-btn--block"
          onClick={() => handleAction("block")}
        >
          Block (Shift)
        </button>
      </div>

      {feedback ? (
        <div
          className={`combat-feedback ${
            feedback.success ? "combat-feedback--success" : "combat-feedback--fail"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}
    </div>
  );
}
