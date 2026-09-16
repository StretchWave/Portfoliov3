"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { soundManager } from "@/lib/audio-synthesizer";
import { hapticManager } from "@/lib/haptic-feedback";

export interface TopologyNode {
  id: string;
  code: string;
  name: string;
  slug?: string;
  domain: "audio" | "spatial" | "intelligence" | "systems" | "combat";
  domainLabel: string;
  accent: string;
  x: number;
  y: number;
  radius: number;
  tech: string[];
  summary: string;
  protocols: string[];
}

export interface TopologyEdge {
  from: string;
  to: string;
  label: string;
}

const NODES: TopologyNode[] = [
  {
    id: "sonara",
    code: "SYS-SONA",
    name: "Sonara",
    slug: "sonara",
    domain: "audio",
    domainLabel: "Audio & DSP",
    accent: "#38bdf8",
    x: 180,
    y: 110,
    radius: 26,
    tech: ["Flutter", "Audio Engine", "REST API", "FFT"],
    summary: "Ambient streaming audio and frequency visualizer with Spotify backend integration.",
    protocols: ["PCM Stream", "WebSocket", "Audio Pipeline"],
  },
  {
    id: "lyrune",
    code: "SYS-LYRU",
    name: "Lyrune",
    slug: "lyrune",
    domain: "audio",
    domainLabel: "Audio & DSP",
    accent: "#38bdf8",
    x: 340,
    y: 90,
    radius: 28,
    tech: ["Web Audio API", "DSP Synthesizer", "BiquadFilter", "Canvas 2D"],
    summary: "Real-time procedural audio synthesis engine with live biquad resonance and FFT visualization.",
    protocols: ["Web Audio Graph", "FFT Spectrum Analysis"],
  },
  {
    id: "atlas",
    code: "SYS-ATLS",
    name: "Project Atlas Runtime",
    domain: "spatial",
    domainLabel: "Spatial & Graphics Runtime",
    accent: "#ffc76b",
    x: 420,
    y: 240,
    radius: 36,
    tech: ["Next.js 16", "Three.js", "R3F", "TypeScript", "Procedural Audio"],
    summary: "Central spatial operating system, multi-district environment routing, and procedural asset-free Web Audio synthesizer.",
    protocols: ["WebGL 2.0", "Reactive Event Loop", "PWA"],
  },
  {
    id: "kerala",
    code: "SYS-KERA",
    name: "Kerala Flood Platform",
    slug: "kerala-flood-risk-platform",
    domain: "intelligence",
    domainLabel: "Geospatial Intelligence",
    accent: "#818cf8",
    x: 640,
    y: 130,
    radius: 28,
    tech: ["Python", "Hydrology Engine", "Spatial GeoJSON", "Predictive Analytics"],
    summary: "Multi-parameter river basin flood forecasting and sluice gate discharge simulation platform.",
    protocols: ["GeoJSON", "Inundation Vector Telemetry", "REST"],
  },
  {
    id: "lucida",
    code: "SYS-LUCI",
    name: "Lucida-Sync",
    slug: "lucida-sync",
    domain: "systems",
    domainLabel: "Systems & Infrastructure",
    accent: "#34d399",
    x: 210,
    y: 360,
    radius: 25,
    tech: ["Async I/O", "File Watchers", "State Trees", "CLI"],
    summary: "Resilient bi-directional cloud state synchronization and directory integrity engine.",
    protocols: ["POSIX I/O", "Checksum Verification", "Atomic Write"],
  },
  {
    id: "recoverai",
    code: "SYS-RECO",
    name: "RecoverAI",
    slug: "recoverai",
    domain: "systems",
    domainLabel: "Systems & Infrastructure",
    accent: "#34d399",
    x: 370,
    y: 390,
    radius: 25,
    tech: ["Automated Recovery", "Diagnostic Heuristics", "Process Supervision"],
    summary: "Intelligent error isolation, process health watchdog, and crash recovery pipeline.",
    protocols: ["IPC Signals", "Supervision Loop", "Health Probes"],
  },
  {
    id: "stance",
    code: "SYS-STNC",
    name: "Stance Combat PvP",
    slug: "stance-combat-pvp",
    domain: "combat",
    domainLabel: "Interactive Mechanics",
    accent: "#f472d0",
    x: 610,
    y: 340,
    radius: 26,
    tech: ["Deterministic Engine", "Stance Finite States", "Timing Windows"],
    summary: "Tactical frame-rule combat system featuring 3 stances and strict Parry/Dodge/Block counters.",
    protocols: ["Frame Tick Clock", "Deterministic State Machine"],
  },
  {
    id: "scrollbrake",
    code: "SYS-SCRO",
    name: "ScrollBrake",
    slug: "scrollbrake",
    domain: "systems",
    domainLabel: "Systems & Infrastructure",
    accent: "#34d399",
    x: 100,
    y: 240,
    radius: 22,
    tech: ["DOM Interceptors", "Attention Architecture", "Chrome Extension"],
    summary: "Behavioral doom-scrolling friction engine intercepting feed consumption.",
    protocols: ["MutationObserver", "Content Script IPC"],
  },
  {
    id: "neerad",
    code: "SYS-NEER",
    name: "Neerad Store",
    slug: "neerad-store",
    domain: "systems",
    domainLabel: "Systems & Infrastructure",
    accent: "#34d399",
    x: 740,
    y: 250,
    radius: 22,
    tech: ["Commerce State", "Cart Pipelines", "Responsive Design"],
    summary: "High-performance digital commerce platform with client-cached catalogs.",
    protocols: ["Cart State Container", "Edge Caching"],
  },
  {
    id: "mainmenu",
    code: "SYS-MAIN",
    name: "MainMenu",
    slug: "main-menu",
    domain: "spatial",
    domainLabel: "Foundation & Genesis",
    accent: "#ffc76b",
    x: 520,
    y: 430,
    radius: 20,
    tech: ["HTML5", "Vanilla CSS", "JavaScript Genesis"],
    summary: "First public digital architecture portfolio; evolutionary genesis of Project Atlas.",
    protocols: ["Static Hypermedia", "Evolutionary Root"],
  },
];

const EDGES: TopologyEdge[] = [
  { from: "sonara", to: "lyrune", label: "Shared DSP Algorithms" },
  { from: "lyrune", to: "atlas", label: "Web Audio Synthesizer Engine" },
  { from: "kerala", to: "atlas", label: "Topographic Grid Visualizer" },
  { from: "stance", to: "atlas", label: "Combat Arena & Audio FX" },
  { from: "lucida", to: "recoverai", label: "Resilience & Watchdog" },
  { from: "lucida", to: "atlas", label: "Terminal Command Runner" },
  { from: "scrollbrake", to: "atlas", label: "Focus & Spatial Framing" },
  { from: "neerad", to: "lucida", label: "State Hydration" },
  { from: "mainmenu", to: "atlas", label: "Architectural Lineage" },
];

export function SystemsTopologyGraph() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("atlas");
  const [activeDomain, setActiveDomain] = useState<string>("all");

  const selectedNode = useMemo(() => {
    return NODES.find((n) => n.id === selectedNodeId) || NODES[2];
  }, [selectedNodeId]);

  const activeEdges = useMemo(() => {
    return EDGES.filter(
      (e) => e.from === selectedNodeId || e.to === selectedNodeId
    );
  }, [selectedNodeId]);

  const connectedNodeIds = useMemo(() => {
    const set = new Set<string>([selectedNodeId]);
    for (const e of activeEdges) {
      set.add(e.from);
      set.add(e.to);
    }
    return set;
  }, [selectedNodeId, activeEdges]);

  function handleSelectNode(node: TopologyNode) {
    setSelectedNodeId(node.id);
    soundManager.playNodeBeep(node.domain === "audio" ? 4 : node.domain === "spatial" ? 7 : 0);
    hapticManager.trigger("light");
  }

  const filteredNodes = useMemo(() => {
    if (activeDomain === "all") return NODES;
    return NODES.filter((n) => n.domain === activeDomain);
  }, [activeDomain]);

  return (
    <div className="topology-graph-container" role="region" aria-label="Interactive Systems Architecture Topology">
      {/* Domain Filters & Status */}
      <div className="topology-toolbar">
        <div className="topology-domain-pills" role="group" aria-label="Filter systems by domain">
          <button
            type="button"
            className={`domain-pill ${activeDomain === "all" ? "domain-pill--active" : ""}`}
            onClick={() => {
              setActiveDomain("all");
              soundManager.playTactileClick();
            }}
          >
            All Systems ({NODES.length})
          </button>
          <button
            type="button"
            className={`domain-pill ${activeDomain === "audio" ? "domain-pill--active" : ""}`}
            onClick={() => {
              setActiveDomain("audio");
              soundManager.playTactileClick();
            }}
          >
            Audio & DSP
          </button>
          <button
            type="button"
            className={`domain-pill ${activeDomain === "spatial" ? "domain-pill--active" : ""}`}
            onClick={() => {
              setActiveDomain("spatial");
              soundManager.playTactileClick();
            }}
          >
            Spatial & 3D
          </button>
          <button
            type="button"
            className={`domain-pill ${activeDomain === "intelligence" ? "domain-pill--active" : ""}`}
            onClick={() => {
              setActiveDomain("intelligence");
              soundManager.playTactileClick();
            }}
          >
            Intelligence
          </button>
          <button
            type="button"
            className={`domain-pill ${activeDomain === "systems" ? "domain-pill--active" : ""}`}
            onClick={() => {
              setActiveDomain("systems");
              soundManager.playTactileClick();
            }}
          >
            Systems / Infra
          </button>
        </div>

        <span className="topology-hint">Click or tap any node to inspect telemetry & data links</span>
      </div>

      {/* SVG Canvas */}
      <div className="topology-canvas-wrapper">
        <svg
          viewBox="0 0 840 480"
          className="topology-svg"
          aria-hidden="true"
        >
          <defs>
            {/* Ambient Background Grid Pattern */}
            <pattern id="topology-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(104, 228, 255, 0.05)" strokeWidth="1" />
            </pattern>

            {/* Glowing filter for active nodes */}
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="840" height="480" fill="url(#topology-grid)" />

          {/* Render Connection Edges */}
          {EDGES.map((edge) => {
            const fromNode = NODES.find((n) => n.id === edge.from);
            const toNode = NODES.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const isHighlighted =
              edge.from === selectedNodeId || edge.to === selectedNodeId;

            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  className={`topology-edge ${isHighlighted ? "topology-edge--highlighted" : ""}`}
                  stroke={isHighlighted ? selectedNode.accent : "rgba(104, 228, 255, 0.16)"}
                  strokeWidth={isHighlighted ? 2.2 : 1}
                  strokeDasharray={isHighlighted ? "none" : "4, 4"}
                />
                {isHighlighted ? (
                  <circle
                    r="3.5"
                    fill={selectedNode.accent}
                    className="edge-pulse-dot"
                  >
                    <animateMotion
                      path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                ) : null}
              </g>
            );
          })}

          {/* Render Nodes */}
          {NODES.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const isConnected = connectedNodeIds.has(node.id);
            const isFiltered = activeDomain !== "all" && node.domain !== activeDomain;

            return (
              <g
                key={node.id}
                className={`topology-node-group ${isSelected ? "topology-node--selected" : ""} ${
                  isFiltered ? "topology-node--dimmed" : ""
                }`}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleSelectNode(node)}
                role="button"
                tabIndex={0}
                aria-label={`Inspect ${node.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectNode(node);
                  }
                }}
              >
                {/* Node Outer Orbit Ring */}
                {isSelected ? (
                  <circle
                    r={node.radius + 8}
                    fill="none"
                    stroke={node.accent}
                    strokeWidth="1.5"
                    strokeDasharray="5, 3"
                    className="node-orbit-ring"
                  />
                ) : null}

                {/* Main Node Body */}
                <circle
                  r={node.radius}
                  fill="#0b1829"
                  stroke={isSelected ? node.accent : isConnected ? "rgba(104, 228, 255, 0.5)" : "rgba(104, 228, 255, 0.25)"}
                  strokeWidth={isSelected ? 2.5 : 1.2}
                  filter={isSelected ? "url(#node-glow)" : undefined}
                  className="node-core-circle"
                />

                {/* Node Code Label (Inside Node) */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fill={isSelected ? "#f8fafc" : node.accent}
                  fontSize={node.radius > 30 ? 11 : 9.5}
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                  className="node-code-text"
                >
                  {node.code}
                </text>

                {/* Overhead Subtitle Label */}
                <text
                  textAnchor="middle"
                  dy={node.radius + 15}
                  fill={isSelected ? "#e2e8f0" : "var(--muted)"}
                  fontSize="10"
                  fontFamily="inherit"
                  fontWeight={isSelected ? "600" : "400"}
                  className="node-title-text"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Reactive Telemetry Detail Breakdown Card */}
      {selectedNode ? (
        <div className="topology-detail-card" role="region" aria-label={`System telemetry for ${selectedNode.name}`}>
          <div className="topology-detail-header">
            <div>
              <span className="topology-detail-eyebrow" style={{ color: selectedNode.accent }}>
                {selectedNode.code} · {selectedNode.domainLabel.toUpperCase()}
              </span>
              <h3>{selectedNode.name}</h3>
            </div>
            {selectedNode.slug ? (
              <Link href={`/projects/${selectedNode.slug}`} className="button button--compact">
                View Architecture Case Study →
              </Link>
            ) : null}
          </div>

          <p className="topology-detail-summary">{selectedNode.summary}</p>

          <div className="topology-detail-grid">
            <div className="detail-grid-column">
              <span className="detail-column-label">PRIMARY ARCHITECTURAL STACK:</span>
              <div className="detail-tags-wrap">
                {selectedNode.tech.map((t) => (
                  <span key={t} className="topology-tech-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="detail-grid-column">
              <span className="detail-column-label">CONNECTED PROTOCOLS & DATA PIPELINES:</span>
              <div className="detail-tags-wrap">
                {selectedNode.protocols.map((p) => (
                  <span key={p} className="topology-protocol-tag" style={{ borderColor: selectedNode.accent }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
