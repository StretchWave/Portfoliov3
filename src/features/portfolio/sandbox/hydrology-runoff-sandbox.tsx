"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { soundManager } from "@/lib/audio-synthesizer";

export const GRID_SIZE = 24;

export type TerrainPreset = "valley" | "basin" | "coastal" | "plain";

export function generateTerrain(preset: TerrainPreset): Float32Array {
  const elev = new Float32Array(GRID_SIZE * GRID_SIZE);

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const idx = r * GRID_SIZE + c;
      const nx = c / (GRID_SIZE - 1);
      const ny = r / (GRID_SIZE - 1);

      switch (preset) {
        case "valley": {
          // River running diagonally from top-left (ny=0, nx=0) to bottom-right (ny=1, nx=1)
          const distToDiag = Math.abs(ny - nx) / Math.SQRT2;
          const valleyDepth = Math.pow(distToDiag * 2.8, 1.6) * 65;
          const slope = (1 - (ny + nx) / 2) * 35;
          elev[idx] = Math.max(5, valleyDepth + slope);
          break;
        }
        case "basin": {
          // Bowl shape with steep rims and central depression
          const dx = nx - 0.5;
          const dy = ny - 0.5;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy) * 2;
          elev[idx] = Math.min(95, 15 + Math.pow(distFromCenter, 2.2) * 75);
          break;
        }
        case "coastal": {
          // Rolling highlands on west (nx=0) sloping down to flat sea level on east (nx=1)
          const hill = Math.sin(ny * Math.PI * 3) * 12 + Math.cos(nx * Math.PI * 2) * 8;
          const coastSlope = (1 - nx) * 70;
          elev[idx] = Math.max(0, coastSlope + hill);
          break;
        }
        case "plain": {
          // Low relief urban plain with small depressions
          const noise = Math.sin(nx * 10) * 4 + Math.cos(ny * 8) * 3;
          elev[idx] = 18 + noise + (1 - ny) * 8;
          break;
        }
      }
    }
  }

  return elev;
}

export function HydrologyRunoffSandbox() {
  const [preset, setPreset] = useState<TerrainPreset>("valley");
  const [rainRate, setRainRate] = useState<number>(65); // mm/hr
  const [permeability, setPermeability] = useState<number>(0.35); // 0 to 1
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [stats, setStats] = useState({
    step: 0,
    floodedCells: 0,
    totalWaterVol: 0,
    peakDepth: 0,
    absorbedVol: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const elevationRef = useRef<Float32Array>(generateTerrain("valley"));
  const waterRef = useRef<Float32Array>(new Float32Array(GRID_SIZE * GRID_SIZE));
  const absorbedTotalRef = useRef<number>(0);
  const stepCountRef = useRef<number>(0);

  // Initialize or reset terrain
  const resetSimulation = useCallback((newPreset: TerrainPreset = preset) => {
    elevationRef.current = generateTerrain(newPreset);
    waterRef.current = new Float32Array(GRID_SIZE * GRID_SIZE);
    absorbedTotalRef.current = 0;
    stepCountRef.current = 0;
    setStats({
      step: 0,
      floodedCells: 0,
      totalWaterVol: 0,
      peakDepth: 0,
      absorbedVol: 0,
    });
  }, [preset]);

  // Simulation single step calculation
  const simulateStep = useCallback(() => {
    const elev = elevationRef.current;
    const water = waterRef.current;
    const nextWater = new Float32Array(water);

    const rainPerStep = (rainRate / 3600) * 0.15; // Precipitation in meters
    const absorptionPerStep = permeability * 0.04; // Infiltration in meters

    let totalWater = 0;
    let peakDepth = 0;
    let floodedCount = 0;

    // 1. Precipitation & Infiltration
    for (let i = 0; i < elev.length; i++) {
      let w = water[i] + rainPerStep;
      const absorbed = Math.min(w, absorptionPerStep);
      w -= absorbed;
      absorbedTotalRef.current += absorbed * 100; // metric unit scaling
      nextWater[i] = w;
    }

    // 2. Hydraulic Gradient Routing (D4 flow direction)
    const flowOut = new Float32Array(GRID_SIZE * GRID_SIZE);
    const flowIn = new Float32Array(GRID_SIZE * GRID_SIZE);

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const idx = r * GRID_SIZE + c;
        const head = elev[idx] + nextWater[idx];
        if (nextWater[idx] <= 0.001) continue;

        let totalHeadDiff = 0;
        const diffs: number[] = [];
        const neighborIndices: number[] = [];

        for (let d = 0; d < 4; d++) {
          const nr = r + dr[d];
          const nc = c + dc[d];
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            const nIdx = nr * GRID_SIZE + nc;
            const nHead = elev[nIdx] + nextWater[nIdx];
            const diff = head - nHead;
            if (diff > 0) {
              diffs.push(diff);
              neighborIndices.push(nIdx);
              totalHeadDiff += diff;
            }
          }
        }

        if (totalHeadDiff > 0 && neighborIndices.length > 0) {
          // Flow capacity fraction
          const maxTransfer = Math.min(nextWater[idx] * 0.45, totalHeadDiff * 0.25);
          for (let k = 0; k < neighborIndices.length; k++) {
            const fraction = diffs[k] / totalHeadDiff;
            const transferred = maxTransfer * fraction;
            flowOut[idx] += transferred;
            flowIn[neighborIndices[k]] += transferred;
          }
        }
      }
    }

    // Apply flow adjustments
    for (let i = 0; i < elev.length; i++) {
      let w = nextWater[i] - flowOut[i] + flowIn[i];
      // Slight evaporation
      w *= 0.998;
      if (w < 0.0005) w = 0;
      water[i] = w;

      totalWater += w * 100;
      if (w > peakDepth) peakDepth = w;
      if (w > 0.4) floodedCount++;
    }

    stepCountRef.current++;
    setStats({
      step: stepCountRef.current,
      floodedCells: floodedCount,
      totalWaterVol: Math.round(totalWater),
      peakDepth: Number(peakDepth.toFixed(2)),
      absorbedVol: Math.round(absorbedTotalRef.current),
    });
  }, [rainRate, permeability]);

  // Render Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / GRID_SIZE;
    const cellH = height / GRID_SIZE;

    const elev = elevationRef.current;
    const water = waterRef.current;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const idx = r * GRID_SIZE + c;
        const e = elev[idx];
        const w = water[idx];

        // 1. Shaded relief elevation color (charcoal to mountain slate)
        const normE = Math.min(1, Math.max(0, e / 90));
        // Hillshading: compare with west neighbor
        const westE = c > 0 ? elev[r * GRID_SIZE + (c - 1)] : e;
        const shade = Math.min(1.2, Math.max(0.7, 1 + (westE - e) * 0.035));

        const baseR = Math.round((14 + normE * 35) * shade);
        const baseG = Math.round((28 + normE * 50) * shade);
        const baseB = Math.round((46 + normE * 65) * shade);

        ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
        ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);

        // 2. Water depth overlay
        if (w > 0.005) {
          const depthRatio = Math.min(1, w / 1.5);
          if (depthRatio > 0.6) {
            // Deep water: vibrant royal blue
            ctx.fillStyle = `rgba(30, 95, 200, ${0.45 + depthRatio * 0.45})`;
          } else if (depthRatio > 0.2) {
            // Medium water: cyan
            ctx.fillStyle = `rgba(56, 189, 248, ${0.35 + depthRatio * 0.45})`;
          } else {
            // Shallow runoff sheen
            ctx.fillStyle = `rgba(104, 228, 255, ${0.25 + depthRatio * 0.35})`;
          }
          ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);

          // Crest foam for very fast/high water
          if (w > 0.8) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.fillRect(c * cellW + cellW * 0.2, r * cellH + cellH * 0.2, cellW * 0.6, cellH * 0.6);
          }
        }
      }
    }
  }, []);

  // Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    function loop(time: number) {
      if (isRunning && time - lastTime > 66) { // ~15 FPS simulation rate
        simulateStep();
        lastTime = time;
      }
      renderCanvas();
      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, simulateStep, renderCanvas]);

  return (
    <div className="sandbox-panel" role="region" aria-label="Hydrology Runoff & Flood Simulator">
      <div className="sandbox-panel__header">
        <div className="sandbox-badge-row">
          <span className="sandbox-badge">GEOSPATIAL HYDROLOGY</span>
          <span className="sandbox-badge sandbox-badge--sub">CELLULAR AUTOMATON</span>
          <span className="sandbox-complexity">Complexity: O(V + E) · Head Routing</span>
        </div>
        <h3>Digital Elevation Model Runoff & Routing Simulator</h3>
        <p>
          2D cellular automaton modeling hydraulic head gradient routing, depression accumulation, and Horton
          infiltration over topography matrices inspired by the Kerala Flood Risk Platform.
        </p>
      </div>

      <div className="hydrology-layout">
        {/* Canvas Heatmap */}
        <div className="hydrology-canvas-container">
          <canvas
            ref={canvasRef}
            width={480}
            height={480}
            className="hydrology-canvas"
            role="img"
            aria-label="Elevation relief map with dynamic flood water overlay"
          />
          <div className="canvas-watermark">24×24 D4 CELLULAR RUNOFF FIELD</div>
        </div>

        {/* Telemetry & Metrics Sidebar */}
        <div className="hydrology-sidebar">
          <div className="sandbox-control-group">
            <label htmlFor="preset-select">Catchment Basin Topography:</label>
            <select
              id="preset-select"
              className="sandbox-select"
              value={preset}
              onChange={(e) => {
                const newPreset = e.target.value as TerrainPreset;
                soundManager.playBlip();
                setPreset(newPreset);
                resetSimulation(newPreset);
              }}
            >
              <option value="valley">Western Ghats River Valley</option>
              <option value="basin">Highland Reservoir Catchment Basin</option>
              <option value="coastal">Arabian Sea Coastal Estuary</option>
              <option value="plain">Lowland Urban Alluvial Plain</option>
            </select>
          </div>

          <div className="sandbox-control-group">
            <label htmlFor="rain-slider">
              Precipitation Intensity: <span className="val-badge">{rainRate} mm/hr</span>
            </label>
            <input
              id="rain-slider"
              type="range"
              min="0"
              max="150"
              step="5"
              value={rainRate}
              onChange={(e) => setRainRate(Number(e.target.value))}
            />
          </div>

          <div className="sandbox-control-group">
            <label htmlFor="permeability-slider">
              Soil Permeability / Infiltration: <span className="val-badge">{Math.round(permeability * 100)}%</span>
            </label>
            <input
              id="permeability-slider"
              type="range"
              min="0.05"
              max="0.85"
              step="0.05"
              value={permeability}
              onChange={(e) => setPermeability(Number(e.target.value))}
            />
          </div>

          <div className="sandbox-actions-row">
            <button
              type="button"
              className={`sandbox-btn ${isRunning ? "sandbox-btn--active" : ""}`}
              onClick={() => {
                soundManager.playTactileClick();
                setIsRunning((r) => !r);
              }}
            >
              {isRunning ? "⏸ Pause Runoff" : "▶ Start Simulation"}
            </button>
            <button
              type="button"
              className="sandbox-btn"
              onClick={() => {
                soundManager.playTactileClick();
                simulateStep();
              }}
              disabled={isRunning}
            >
              ⏯ Step 1f
            </button>
            <button
              type="button"
              className="sandbox-btn"
              onClick={() => {
                soundManager.playBlip();
                resetSimulation();
              }}
            >
              ↺ Reset
            </button>
          </div>

          {/* Telemetry Numbers */}
          <div className="hydrology-telemetry-list">
            <div className="telemetry-card">
              <span className="telemetry-label">SIMULATION TICKS</span>
              <span className="telemetry-val">{stats.step} steps</span>
            </div>
            <div className="telemetry-card">
              <span className="telemetry-label">INUNDATED CELLS (&gt;0.4m)</span>
              <span className="telemetry-val" style={{ color: stats.floodedCells > 15 ? "#f87171" : "#38bdf8" }}>
                {stats.floodedCells} / 576
              </span>
            </div>
            <div className="telemetry-card">
              <span className="telemetry-label">SURFACE WATER VOLUME</span>
              <span className="telemetry-val">{stats.totalWaterVol.toLocaleString()} m³</span>
            </div>
            <div className="telemetry-card">
              <span className="telemetry-label">PEAK RUNOFF DEPTH</span>
              <span className="telemetry-val">{stats.peakDepth} m</span>
            </div>
            <div className="telemetry-card">
              <span className="telemetry-label">ABSORBED INFILTRATION</span>
              <span className="telemetry-val">{stats.absorbedVol.toLocaleString()} m³</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
