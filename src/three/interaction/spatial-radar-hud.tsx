"use client";

import { useEffect, useRef, useState } from "react";
import { useInteraction } from "./interaction-provider";
import { useWorldArea } from "../world/area-context";
import { useDiscoveryJournal } from "@/features/portfolio/journal/discovery-journal-context";

export function SpatialRadarHud() {
  const { getPlayerTransform, getTargets, focused } = useInteraction();
  const { areaInfo } = useWorldArea();
  const { recordDiscovery } = useDiscoveryJournal();
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    recordDiscovery("sys-spatial-radar");
  }, [recordDiscovery]);

  // Toggle on 'M' key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLElement &&
        (e.target.closest("input, textarea, select") ||
          e.target.closest(".command-backdrop"))
      ) {
        return;
      }
      if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 60 FPS Canvas Radar Render Loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const size = canvas.width;
    const center = size / 2;
    const radarRadius = center - 8;
    const scale = 4.2; // pixels per world meter

    function renderRadar() {
      if (!ctx || !canvas) return;
      const player = getPlayerTransform();
      const targets = getTargets();

      // Update text HUD readouts directly via DOM to avoid React re-renders
      if (coordsRef.current) {
        coordsRef.current.textContent = `X: ${player.x.toFixed(1)}  Z: ${player.z.toFixed(1)}`;
      }
      if (headingRef.current) {
        let deg = Math.round((-player.yaw * (180 / Math.PI)) % 360);
        if (deg < 0) deg += 360;
        headingRef.current.textContent = `${deg.toString().padStart(3, "0")}°`;
      }

      ctx.clearRect(0, 0, size, size);

      // Radar Background Disc
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radarRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(7, 17, 31, 0.82)";
      ctx.fill();
      ctx.strokeStyle = "rgba(104, 228, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Clip within radar circle
      ctx.clip();

      // Concentric Range Rings (5m, 10m, 15m)
      [5, 10, 15].forEach((dist) => {
        const r = dist * scale;
        if (r < radarRadius) {
          ctx.beginPath();
          ctx.arc(center, center, r, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(104, 228, 255, 0.12)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // 4.2m Interaction Range Ring (Cyan glow)
      const interactR = 4.2 * scale;
      ctx.beginPath();
      ctx.arc(center, center, interactR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Crosshairs / Grid
      ctx.beginPath();
      ctx.moveTo(center - radarRadius, center);
      ctx.lineTo(center + radarRadius, center);
      ctx.moveTo(center, center - radarRadius);
      ctx.lineTo(center, center + radarRadius);
      ctx.strokeStyle = "rgba(104, 228, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rotating Scanner Sweep Effect
      const now = performance.now() * 0.0015;
      const sweepAngle = now % (Math.PI * 2);
      const sweepGrad = ctx.createRadialGradient(center, center, 2, center, center, radarRadius);
      sweepGrad.addColorStop(0, "rgba(56, 189, 248, 0.2)");
      sweepGrad.addColorStop(1, "rgba(56, 189, 248, 0.0)");
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radarRadius, sweepAngle, sweepAngle + 0.45);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      // Render Targets (Exhibits & Portals)
      targets.forEach((target) => {
        const dx = (target.position[0] - player.x) * scale;
        const dz = (target.position[2] - player.z) * scale; // In WebGL -Z is forward, but 2D Y is down

        const dist = Math.sqrt(dx * dx + dz * dz);
        let plotX = center + dx;
        let plotY = center + dz;

        // Is it a portal or exhibit?
        const isPortal = target.event.kind === "travel-to-area";
        const isFocused = focused?.id === target.id;

        // Clamp to perimeter if out of range
        if (dist > radarRadius - 6) {
          const angle = Math.atan2(dz, dx);
          plotX = center + Math.cos(angle) * (radarRadius - 7);
          plotY = center + Math.sin(angle) * (radarRadius - 7);
        }

        // Color coding
        let blipColor = "#38bdf8"; // Default cyan
        if (isPortal) {
          blipColor = "#ffc76b"; // Amber portal
        } else if (target.id.includes("observatory") || target.id.includes("kerala")) {
          blipColor = "#818cf8"; // Indigo
        } else if (target.id.includes("creative") || target.id.includes("combat") || target.id.includes("sonara")) {
          blipColor = "#f472d0"; // Magenta
        }

        // Focused pulsing aura
        if (isFocused) {
          ctx.beginPath();
          const pulse = (Math.sin(performance.now() * 0.008) + 1) * 3 + 4;
          ctx.arc(plotX, plotY, pulse, 0, Math.PI * 2);
          ctx.fillStyle = isPortal ? "rgba(255, 199, 107, 0.35)" : "rgba(104, 228, 255, 0.35)";
          ctx.fill();
        }

        // Blip Shape
        ctx.beginPath();
        if (isPortal) {
          // Diamond for portals
          ctx.moveTo(plotX, plotY - 4);
          ctx.lineTo(plotX + 4, plotY);
          ctx.lineTo(plotX, plotY + 4);
          ctx.lineTo(plotX - 4, plotY);
          ctx.closePath();
        } else {
          // Circle for exhibits
          ctx.arc(plotX, plotY, 3.5, 0, Math.PI * 2);
        }
        ctx.fillStyle = blipColor;
        ctx.fill();
        ctx.strokeStyle = "#07111f";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Player Blip & Sight Cone
      ctx.save();
      ctx.translate(center, center);

      // Player Yaw sight cone (FOV 60 deg)
      const yaw = player.yaw;
      // In Three.js: -Z is forward. Camera yaw is around Y axis.
      // 2D Canvas: 0 rad points right (+X). Forward (-Z) corresponds to -PI/2.
      const forwardAngle = yaw - Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 24, forwardAngle - 0.45, forwardAngle + 0.45);
      ctx.closePath();
      const fovGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
      fovGrad.addColorStop(0, "rgba(104, 228, 255, 0.45)");
      fovGrad.addColorStop(1, "rgba(104, 228, 255, 0.0)");
      ctx.fillStyle = fovGrad;
      ctx.fill();

      // Player Center Dot
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
      ctx.restore(); // Restore outer clip

      animId = requestAnimationFrame(renderRadar);
    }

    animId = requestAnimationFrame(renderRadar);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, getPlayerTransform, getTargets, focused]);

  if (!isOpen) {
    return (
      <button
        type="button"
        className="spatial-radar-minimized"
        onClick={() => setIsOpen(true)}
        title="Open Spatial Radar (M)"
        aria-label="Open mini-map radar"
      >
        <span className="radar-icon">⌖</span>
        <span>RADAR (M)</span>
      </button>
    );
  }

  return (
    <div className="spatial-radar-container">
      <div className="spatial-radar-card">
        <div className="spatial-radar-header">
          <div className="spatial-radar-header__left">
            <span className="radar-live-blip" />
            <span className="spatial-radar-area">{areaInfo.name.toUpperCase()}</span>
          </div>
          <button
            type="button"
            className="spatial-radar-close"
            onClick={() => setIsOpen(false)}
            title="Minimize Radar (M)"
          >
            _
          </button>
        </div>

        <div className="spatial-radar-viewport">
          <canvas
            ref={canvasRef}
            width={180}
            height={180}
            className="spatial-radar-canvas"
          />
          <div className="spatial-radar-cardinals">
            <span className="cardinal cardinal--n">N</span>
            <span className="cardinal cardinal--s">S</span>
            <span className="cardinal cardinal--w">W</span>
            <span className="cardinal cardinal--e">E</span>
          </div>
        </div>

        <div className="spatial-radar-telemetry">
          <span ref={coordsRef} className="radar-coords">X: 0.0  Z: 0.0</span>
          <span ref={headingRef} className="radar-heading">000°</span>
        </div>

        <div className="spatial-radar-legend">
          <span><i className="legend-dot legend-dot--cyan" /> Software</span>
          <span><i className="legend-dot legend-dot--indigo" /> Observ.</span>
          <span><i className="legend-dot legend-dot--magenta" /> Workshop</span>
          <span><i className="legend-dot legend-dot--portal" /> Portal</span>
        </div>
      </div>
    </div>
  );
}
