"use client";

import { useMemo, useState } from "react";
import type { ProjectArchitectureSpec } from "../comparison/project-comparison-data";

export interface ProjectRadarChartProps {
  projects: ProjectArchitectureSpec[];
}

interface AxisDefinition {
  key: keyof ProjectArchitectureSpec["metrics"];
  label: string;
  sublabel: string;
}

const AXES: AxisDefinition[] = [
  { key: "responsiveness", label: "Responsiveness", sublabel: "Latency & FPS" },
  { key: "complexity", label: "Complexity", sublabel: "Subsystems & Math" },
  { key: "resilience", label: "Resilience", sublabel: "Fault Tolerance" },
  { key: "throughput", label: "Throughput", sublabel: "Data Density" },
  { key: "autonomy", label: "Autonomy", sublabel: "Zero-Cloud Independence" },
];

export function ProjectRadarChart({ projects }: ProjectRadarChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    projectName: string;
    axisLabel: string;
    score: number;
    x: number;
    y: number;
  } | null>(null);

  const cx = 200;
  const cy = 180;
  const R = 125;
  const numAxes = AXES.length;

  // Concentric pentagon ring paths
  const ringLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const ringPaths = useMemo(() => {
    return ringLevels.map((level) => {
      const radius = R * level;
      const points = AXES.map((_, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      return points;
    });
  }, [cx, cy, R, numAxes]);

  // Axis lines and label anchors
  const axisLines = useMemo(() => {
    return AXES.map((axis, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;
      const x2 = cx + R * Math.cos(angle);
      const y2 = cy + R * Math.sin(angle);
      const labelRadius = R + 26;
      const lx = cx + labelRadius * Math.cos(angle);
      const ly = cy + labelRadius * Math.sin(angle);

      let textAnchor: "middle" | "start" | "end" = "middle";
      if (Math.cos(angle) > 0.3) textAnchor = "start";
      else if (Math.cos(angle) < -0.3) textAnchor = "end";

      return {
        key: axis.key,
        label: axis.label,
        sublabel: axis.sublabel,
        x1: cx,
        y1: cy,
        x2,
        y2,
        lx,
        ly,
        textAnchor,
      };
    });
  }, [cx, cy, R, numAxes]);

  // Calculated polygons for active projects
  const projectPolygons = useMemo(() => {
    return projects.map((proj) => {
      const vertices = AXES.map((axis, i) => {
        const score = proj.metrics[axis.key];
        const fraction = Math.max(0.1, Math.min(1.0, score / 10));
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;
        const x = cx + fraction * R * Math.cos(angle);
        const y = cy + fraction * R * Math.sin(angle);
        return {
          x,
          y,
          score,
          axisLabel: axis.label,
        };
      });

      const pointsString = vertices.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(" ");

      return {
        projectId: proj.projectId,
        name: proj.name,
        color: proj.accentColor,
        pointsString,
        vertices,
      };
    });
  }, [projects, cx, cy, R, numAxes]);

  return (
    <div className="radar-chart-container" role="region" aria-label="Systems Architecture Radar Comparison">
      <svg
        className="radar-chart-svg"
        viewBox="0 0 400 360"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="radarCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.12)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
          </radialGradient>
          {projects.map((proj) => (
            <filter key={`glow-${proj.projectId}`} id={`glow-${proj.projectId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={proj.accentColor} floodOpacity="0.6" />
            </filter>
          ))}
        </defs>

        {/* Ambient Center Glow */}
        <circle cx={cx} cy={cy} r={R} fill="url(#radarCenterGlow)" />

        {/* Concentric Pentagons */}
        {ringPaths.map((pts, idx) => (
          <polygon
            key={`ring-${idx}`}
            points={pts}
            fill="none"
            stroke="rgba(104, 228, 255, 0.15)"
            strokeWidth={idx === ringPaths.length - 1 ? 1.5 : 1}
            strokeDasharray={idx === ringPaths.length - 1 ? "none" : "2 3"}
          />
        ))}

        {/* Axis Lines */}
        {axisLines.map((axis) => (
          <line
            key={`line-${axis.key}`}
            x1={axis.x1}
            y1={axis.y1}
            x2={axis.x2}
            y2={axis.y2}
            stroke="rgba(104, 228, 255, 0.2)"
            strokeWidth="1"
          />
        ))}

        {/* Project Polygons */}
        {projectPolygons.map((proj) => (
          <g key={`poly-${proj.projectId}`} className="radar-polygon-group">
            <polygon
              points={proj.pointsString}
              fill={proj.color}
              fillOpacity="0.22"
              stroke={proj.color}
              strokeWidth="2.2"
              filter={`url(#glow-${proj.projectId})`}
              className="radar-polygon"
            />
            {/* Vertices Interactive Points */}
            {proj.vertices.map((v, i) => (
              <circle
                key={`vertex-${proj.projectId}-${i}`}
                cx={v.x}
                cy={v.y}
                r="4.5"
                fill="#030812"
                stroke={proj.color}
                strokeWidth="2"
                className="radar-vertex-dot"
                onMouseEnter={() =>
                  setHoveredPoint({
                    projectName: proj.name,
                    axisLabel: v.axisLabel,
                    score: v.score,
                    x: v.x,
                    y: v.y,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </g>
        ))}

        {/* Axis Labels */}
        {axisLines.map((axis) => (
          <g key={`label-${axis.key}`} className="radar-axis-label-group">
            <text
              x={axis.lx}
              y={axis.ly}
              textAnchor={axis.textAnchor}
              className="radar-axis-label"
              dominantBaseline="middle"
            >
              {axis.label}
            </text>
            <text
              x={axis.lx}
              y={axis.ly + 10}
              textAnchor={axis.textAnchor}
              className="radar-axis-sublabel"
              dominantBaseline="middle"
            >
              {axis.sublabel}
            </text>
          </g>
        ))}

        {/* Interactive Tooltip Callout */}
        {hoveredPoint ? (
          <g className="radar-tooltip" transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y - 12})`}>
            <rect
              x="-48"
              y="-28"
              width="96"
              height="24"
              rx="4"
              fill="rgba(5, 14, 28, 0.95)"
              stroke="rgba(104, 228, 255, 0.4)"
              strokeWidth="1"
            />
            <text x="0" y="-13" textAnchor="middle" className="radar-tooltip-text">
              {hoveredPoint.projectName}: {hoveredPoint.score}/10
            </text>
          </g>
        ) : null}
      </svg>

      {/* Legend & Score Breakdown */}
      <div className="radar-legend">
        {projects.map((proj) => (
          <div key={proj.projectId} className="radar-legend-item">
            <span className="radar-legend-swatch" style={{ backgroundColor: proj.accentColor }} />
            <span className="radar-legend-name">{proj.name}</span>
            <span className="radar-legend-category">{proj.categoryTitle}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
