"use client";

import { useMemo, useState } from "react";
import { useDiscoveryJournal } from "@/features/portfolio/journal/discovery-journal-context";

interface FloodRiskSimulatorDemoProps {
  defaultDistrict?: string;
}

interface ScenarioPreset {
  id: string;
  name: string;
  rainfall: number;
  reservoir: number;
  soil: number;
}

const PRESETS: ScenarioPreset[] = [
  {
    id: "nominal",
    name: "Pre-Monsoon Nominal",
    rainfall: 45,
    reservoir: 38,
    soil: 0.3,
  },
  {
    id: "spill",
    name: "Controlled Sluice Spill",
    rainfall: 190,
    reservoir: 82,
    soil: 0.65,
  },
  {
    id: "2018-peak",
    name: "2018 Monsoon Peak",
    rainfall: 385,
    reservoir: 98,
    soil: 0.95,
  },
];

export function FloodRiskSimulatorDemo({
  defaultDistrict = "Periyar River Basin & Idukki Reservoir",
}: FloodRiskSimulatorDemoProps) {
  const [rainfall, setRainfall] = useState(190); // mm/24h
  const [reservoirCapacity, setReservoirCapacity] = useState(82); // %
  const [soilSaturation, setSoilSaturation] = useState(0.65); // 0.0 - 1.0

  // Simulated decision-support model score
  const { riskScore, alertTier, color, action, dischargeRate, zones } = useMemo(() => {
    // Weighted model simulation formula
    const rawScore =
      (rainfall / 350) * 0.45 +
      (reservoirCapacity / 100) * 0.35 +
      soilSaturation * 0.2;
    const score = Math.min(100, Math.round(rawScore * 100));

    // Zone Inundation Model
    const zoneHighRange = score > 75 ? "Submerged" : score > 45 ? "Saturated" : "Nominal";
    const zoneMidFoothills = score > 60 ? "Flash Surge" : score > 35 ? "High Flow" : "Nominal";
    const zoneUrbanEstuary = score > 70 ? "Critical Backflow" : score > 50 ? "Waterlogged" : "Nominal";
    const zoneKuttanadDelta = score > 55 ? "Flooded" : score > 30 ? "Rising" : "Nominal";

    const discharge = Math.round((reservoirCapacity / 100) * (rainfall / 100) * 850);

    if (score < 35) {
      return {
        riskScore: score,
        alertTier: "Tier 1: NORMAL MONITORING",
        color: "#22c55e",
        action: "Telemetry nominal. Standard hourly river-gage polling active across all 14 gauge stations.",
        dischargeRate: `${Math.max(40, discharge)} m³/s`,
        zones: { highRange: zoneHighRange, mid: zoneMidFoothills, urban: zoneUrbanEstuary, delta: zoneKuttanadDelta },
      };
    }
    if (score < 65) {
      return {
        riskScore: score,
        alertTier: "Tier 2: PRECAUTIONARY ADVISORY",
        color: "#eab308",
        action: "Downstream panchayats alerted. Spillway gates pre-staged for calibrated discharge.",
        dischargeRate: `${discharge} m³/s`,
        zones: { highRange: zoneHighRange, mid: zoneMidFoothills, urban: zoneUrbanEstuary, delta: zoneKuttanadDelta },
      };
    }
    if (score < 85) {
      return {
        riskScore: score,
        alertTier: "Tier 3: HIGH INUNDATION WARNING",
        color: "#f97316",
        action: "Controlled high-volume discharge authorized. Low-lying evacuation routes initiated along Periyar corridor.",
        dischargeRate: `${discharge} m³/s`,
        zones: { highRange: zoneHighRange, mid: zoneMidFoothills, urban: zoneUrbanEstuary, delta: zoneKuttanadDelta },
      };
    }
    return {
      riskScore: score,
      alertTier: "Tier 4: CRITICAL EMERGENCY DISPATCH",
      color: "#ef4444",
      action: "Emergency red alert automated broadcast dispatched. Multi-agency rescue deployment triggered.",
      dischargeRate: `${Math.max(1450, discharge * 2)} m³/s`,
      zones: { highRange: zoneHighRange, mid: zoneMidFoothills, urban: zoneUrbanEstuary, delta: zoneKuttanadDelta },
    };
  }, [rainfall, reservoirCapacity, soilSaturation]);

  const { recordDiscovery } = useDiscoveryJournal();

  function loadPreset(preset: ScenarioPreset) {
    recordDiscovery("demo-flood-sim");
    setRainfall(preset.rainfall);
    setReservoirCapacity(preset.reservoir);
    setSoilSaturation(preset.soil);
  }

  return (
    <div className="demo-flood">
      {/* Header with Title and Risk Score */}
      <div className="demo-flood__header">
        <div>
          <span className="demo-flood__eyebrow">XGBoost Geospatial Telemetry</span>
          <h4 className="demo-flood__basin">{defaultDistrict}</h4>
        </div>
        <div className="demo-flood__score-badge" style={{ borderColor: color, color }}>
          <span className="demo-flood__score-val">{riskScore}%</span>
          <span className="demo-flood__score-lbl">Risk Index</span>
        </div>
      </div>

      {/* Scenario Presets Bar */}
      <div className="flood-presets-bar">
        <span className="preset-label">Scenarios:</span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="preset-chip"
            onClick={() => loadPreset(p)}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Interactive Catchment Elevation & River Basin Topological Diagram */}
      <div className="catchment-map">
        <div className="catchment-map__header">
          <span>Topological Basin Elevation Profile</span>
          <span style={{ color }}>Projected Spill: <strong>{dischargeRate}</strong></span>
        </div>

        <div className="catchment-zones-grid">
          <div className={`catchment-zone ${riskScore > 75 ? "catchment-zone--danger" : ""}`}>
            <span className="zone-name">Western Ghats / Idukki</span>
            <span className="zone-elev">1,200m ASL</span>
            <span className="zone-status" style={{ color }}>{zones.highRange}</span>
          </div>
          <div className="catchment-arrow">→</div>
          <div className={`catchment-zone ${riskScore > 60 ? "catchment-zone--warning" : ""}`}>
            <span className="zone-name">Periyar Foothills</span>
            <span className="zone-elev">450m ASL</span>
            <span className="zone-status" style={{ color }}>{zones.mid}</span>
          </div>
          <div className="catchment-arrow">→</div>
          <div className={`catchment-zone ${riskScore > 70 ? "catchment-zone--danger" : ""}`}>
            <span className="zone-name">Ernakulam Estuary</span>
            <span className="zone-elev">2m ASL</span>
            <span className="zone-status" style={{ color }}>{zones.urban}</span>
          </div>
          <div className="catchment-arrow">→</div>
          <div className={`catchment-zone ${riskScore > 55 ? "catchment-zone--warning" : ""}`}>
            <span className="zone-name">Kuttanad Delta</span>
            <span className="zone-elev">-1.5m ASL</span>
            <span className="zone-status" style={{ color }}>{zones.delta}</span>
          </div>
        </div>
      </div>

      {/* Telemetry Sliders */}
      <div className="demo-flood__sliders">
        <label className="demo-slider-row">
          <div className="demo-slider-row__header">
            <span>24h Precipitation:</span>
            <strong>{rainfall} mm</strong>
          </div>
          <input
            type="range"
            min={10}
            max={400}
            step={5}
            value={rainfall}
            onChange={(e) => setRainfall(Number(e.target.value))}
            className="demo-slider"
          />
        </label>

        <label className="demo-slider-row">
          <div className="demo-slider-row__header">
            <span>Reservoir Level:</span>
            <strong>{reservoirCapacity}%</strong>
          </div>
          <input
            type="range"
            min={20}
            max={100}
            step={1}
            value={reservoirCapacity}
            onChange={(e) => setReservoirCapacity(Number(e.target.value))}
            className="demo-slider"
          />
        </label>

        <label className="demo-slider-row">
          <div className="demo-slider-row__header">
            <span>Antecedent Soil Moisture:</span>
            <strong>{(soilSaturation * 100).toFixed(0)}%</strong>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.05}
            value={soilSaturation}
            onChange={(e) => setSoilSaturation(Number(e.target.value))}
            className="demo-slider"
          />
        </label>
      </div>

      {/* Model Decision Support Output */}
      <div className="demo-flood__result" style={{ borderLeftColor: color }}>
        <div className="demo-flood__tier" style={{ color }}>{alertTier}</div>
        <p className="demo-flood__action">{action}</p>
      </div>
    </div>
  );
}
