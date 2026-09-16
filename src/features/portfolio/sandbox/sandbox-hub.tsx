"use client";

import { useState } from "react";
import { soundManager } from "@/lib/audio-synthesizer";
import { DspFilterSandbox } from "./dsp-filter-sandbox";
import { HydrologyRunoffSandbox } from "./hydrology-runoff-sandbox";
import { CombatFsmSandbox } from "./combat-fsm-sandbox";

export type SandboxTab = "dsp" | "hydrology" | "combat";

interface TabItem {
  id: SandboxTab;
  title: string;
  badge: string;
  desc: string;
}

const TABS: TabItem[] = [
  {
    id: "dsp",
    title: "Biquad DSP Audio Filter",
    badge: "AUDIO SYSTEMS",
    desc: "Complex frequency response transfer function & live Web Audio pass-through",
  },
  {
    id: "hydrology",
    title: "Hydrological DEM Runoff",
    badge: "GEOSPATIAL SIMULATION",
    desc: "2D cellular automaton hydraulic routing & depression accumulation",
  },
  {
    id: "combat",
    title: "Deterministic Combat FSM",
    badge: "GAME MECHANICS",
    desc: "60 FPS frame-data parser with startup, active hitbox, and block advantage",
  },
];

export function SandboxHub() {
  const [activeTab, setActiveTab] = useState<SandboxTab>("dsp");

  const handleTabChange = (tabId: SandboxTab) => {
    soundManager.playBlip();
    setActiveTab(tabId);
  };

  return (
    <div className="sandbox-hub-root">
      {/* Tab Navigation Switcher */}
      <div className="sandbox-tabs-nav" role="tablist" aria-label="Engineering Sandbox Selector">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`sandbox-tab-btn ${isActive ? "sandbox-tab-btn--active" : ""}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <div className="sandbox-tab-btn__header">
                <span className="sandbox-tab-badge">{tab.badge}</span>
                <span className="sandbox-tab-title">{tab.title}</span>
              </div>
              <span className="sandbox-tab-desc">{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Active Sandbox View */}
      <div className="sandbox-active-view">
        {activeTab === "dsp" && <DspFilterSandbox />}
        {activeTab === "hydrology" && <HydrologyRunoffSandbox />}
        {activeTab === "combat" && <CombatFsmSandbox />}
      </div>
    </div>
  );
}
