"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { soundManager } from "@/lib/audio-synthesizer";

export type BiquadFilterType = "lowpass" | "highpass" | "bandpass" | "notch" | "peaking";

export interface FilterParams {
  type: BiquadFilterType;
  cutoff: number; // Hz (20 to 20000)
  q: number; // Quality factor (0.2 to 14.0)
  gain: number; // dB (-18 to +18) for peaking
}

export const MIN_FREQ = 20;
export const MAX_FREQ = 20000;
export const SAMPLE_RATE = 44100;

export interface BiquadCoefficients {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

export function calculateBiquadCoefficients(params: FilterParams, sampleRate = SAMPLE_RATE): BiquadCoefficients {
  const f0 = params.cutoff;
  const Q = params.q;
  const gainDb = params.gain;

  const w0 = (2 * Math.PI * f0) / sampleRate;
  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * Q);
  const A = Math.pow(10, gainDb / 40);

  let b0 = 0, b1 = 0, b2 = 0, a0 = 1, a1 = 0, a2 = 0;

  switch (params.type) {
    case "lowpass":
      b0 = (1 - cosW0) / 2;
      b1 = 1 - cosW0;
      b2 = (1 - cosW0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
    case "highpass":
      b0 = (1 + cosW0) / 2;
      b1 = -(1 + cosW0);
      b2 = (1 + cosW0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
    case "bandpass":
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
    case "notch":
      b0 = 1;
      b1 = -2 * cosW0;
      b2 = 1;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
    case "peaking":
      b0 = 1 + alpha * A;
      b1 = -2 * cosW0;
      b2 = 1 - alpha * A;
      a0 = 1 + alpha / A;
      a1 = -2 * cosW0;
      a2 = 1 - alpha / A;
      break;
  }

  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}

export function DspFilterSandbox() {
  const [params, setParams] = useState<FilterParams>({
    type: "lowpass",
    cutoff: 1200,
    q: 2.5,
    gain: 6,
  });

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Calculate biquad coefficients based on Robert Bristow-Johnson Cookbook
  const coefficients = useMemo(() => {
    return calculateBiquadCoefficients(params);
  }, [params]);

  // Compute frequency response curve (120 points from 20Hz to 20kHz log spaced)
  const plotPoints = useMemo(() => {
    const { b0, b1, b2, a1, a2 } = coefficients;
    const points: Array<{ f: number; x: number; y: number; db: number }> = [];
    const count = 120;
    const width = 640;
    const height = 240;
    const topMargin = 20;
    const bottomMargin = 30;
    const plotH = height - topMargin - bottomMargin;
    const zeroY = topMargin + plotH * (20 / 60); // 20 dB of 60 dB total range (+20 to -40)

    for (let i = 0; i <= count; i++) {
      const logRatio = i / count;
      const f = MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, logRatio);
      const w = (2 * Math.PI * f) / SAMPLE_RATE;

      const cosW = Math.cos(w);
      const sinW = Math.sin(w);
      const cos2W = Math.cos(2 * w);
      const sin2W = Math.sin(2 * w);

      const numRe = b0 + b1 * cosW + b2 * cos2W;
      const numIm = -b1 * sinW - b2 * sin2W;

      const denRe = 1 + a1 * cosW + a2 * cos2W;
      const denIm = -a1 * sinW - a2 * sin2W;

      const mag = Math.sqrt((numRe * numRe + numIm * numIm) / (denRe * denRe + denIm * denIm));
      const db = 20 * Math.log10(Math.max(mag, 1e-6));

      const x = (i / count) * width;
      // Map +20dB to top (topMargin) and -40dB to bottom (height - bottomMargin)
      const clampedDb = Math.max(-40, Math.min(20, db));
      const y = zeroY - (clampedDb / 60) * plotH;

      points.push({ f, x, y, db });
    }

    return points;
  }, [coefficients]);

  const svgPath = useMemo(() => {
    if (!plotPoints.length) return "";
    return plotPoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, "");
  }, [plotPoints]);

  // Handle live Web Audio testing
  const toggleAudio = useCallback(() => {
    soundManager.playTactileClick();

    if (isPlayingAudio) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Create pink noise buffer (2 seconds loop)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      noiseSourceRef.current = source;

      const filter = ctx.createBiquadFilter();
      filter.type = params.type;
      filter.frequency.setValueAtTime(params.cutoff, ctx.currentTime);
      filter.Q.setValueAtTime(params.q, ctx.currentTime);
      filter.gain.setValueAtTime(params.gain, ctx.currentTime);
      filterNodeRef.current = filter;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime); // Safe, gentle volume
      gainNodeRef.current = gain;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      setIsPlayingAudio(true);
    } catch {
      setIsPlayingAudio(false);
    }
  }, [isPlayingAudio, params]);

  // Sync parameters with active AudioNode if playing
  useEffect(() => {
    if (filterNodeRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      filterNodeRef.current.type = params.type;
      filterNodeRef.current.frequency.setTargetAtTime(params.cutoff, ctx.currentTime, 0.02);
      filterNodeRef.current.Q.setTargetAtTime(params.q, ctx.currentTime, 0.02);
      filterNodeRef.current.gain.setTargetAtTime(params.gain, ctx.currentTime, 0.02);
    }
  }, [params]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const gridFreqs = [50, 100, 200, 500, 1000, 2000, 5000, 10000];

  return (
    <div className="sandbox-panel" role="region" aria-label="Biquad DSP Audio Filter Visualizer">
      <div className="sandbox-panel__header">
        <div className="sandbox-badge-row">
          <span className="sandbox-badge">AUDIO DSP</span>
          <span className="sandbox-badge sandbox-badge--sub">BIQUAD IIR FILTER</span>
          <span className="sandbox-complexity">Complexity: O(1) · 0 Heap Allocations</span>
        </div>
        <h3>Biquad IIR Filter Magnitude Response Engine</h3>
        <p>
          Real-time Direct Form II Transposed filter evaluating complex transfer function{" "}
          <code>H(z) = (b0 + b1*z^-1 + b2*z^-2) / (1 + a1*z^-1 + a2*z^-2)</code> over a 20Hz–20kHz logarithmic spectrum.
        </p>
      </div>

      {/* SVG Frequency Response Graph */}
      <div className="dsp-graph-wrapper">
        <svg
          className="dsp-graph"
          viewBox="0 0 640 240"
          preserveAspectRatio="none"
          role="img"
          aria-label="DSP filter frequency response graph"
        >
          <defs>
            <linearGradient id="dspCurveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines (Frequency) */}
          {gridFreqs.map((freq) => {
            const x = (Math.log10(freq / MIN_FREQ) / Math.log10(MAX_FREQ / MIN_FREQ)) * 640;
            return (
              <g key={freq}>
                <line x1={x} y1="20" x2={x} y2="210" stroke="rgba(104, 228, 255, 0.12)" strokeDasharray="3 3" />
                <text x={x} y="228" fill="rgba(148, 163, 184, 0.5)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  {freq >= 1000 ? `${freq / 1000}k` : freq}
                </text>
              </g>
            );
          })}

          {/* dB Horizontal Reference Lines (+20dB, 0dB, -20dB, -40dB) */}
          {[-20, 0, 20].map((dbVal) => {
            const y = 20 + 190 * (20 / 60) - (dbVal / 60) * 190;
            return (
              <g key={dbVal}>
                <line
                  x1="0"
                  y1={y}
                  x2="640"
                  y2={y}
                  stroke={dbVal === 0 ? "rgba(104, 228, 255, 0.45)" : "rgba(255, 255, 255, 0.08)"}
                  strokeWidth={dbVal === 0 ? "1.5" : "1"}
                  strokeDasharray={dbVal === 0 ? undefined : "2 4"}
                />
                <text x="635" y={y - 3} fill="rgba(148, 163, 184, 0.6)" fontSize="9" textAnchor="end" fontFamily="monospace">
                  {dbVal > 0 ? `+${dbVal}` : dbVal} dB
                </text>
              </g>
            );
          })}

          {/* Filled Area under curve */}
          {svgPath ? (
            <path
              d={`${svgPath} L 640 210 L 0 210 Z`}
              fill="url(#dspCurveGrad)"
              pointerEvents="none"
            />
          ) : null}

          {/* Frequency Response Line */}
          {svgPath ? (
            <path
              d={svgPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {/* Cutoff Indicator Marker */}
          {(() => {
            const cutoffX = (Math.log10(params.cutoff / MIN_FREQ) / Math.log10(MAX_FREQ / MIN_FREQ)) * 640;
            return (
              <g className="cutoff-marker">
                <line x1={cutoffX} y1="20" x2={cutoffX} y2="210" stroke="#ffc76b" strokeWidth="1.5" strokeDasharray="4 2" />
                <circle cx={cutoffX} cy="83" r="5" fill="#ffc76b" stroke="#040c1a" strokeWidth="2" />
                <text x={cutoffX + 8} y="32" fill="#ffc76b" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  fc: {params.cutoff}Hz
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Interactive Controls Bar */}
      <div className="sandbox-controls">
        <div className="sandbox-control-group">
          <label htmlFor="filter-type-select">Filter Topology:</label>
          <select
            id="filter-type-select"
            className="sandbox-select"
            value={params.type}
            onChange={(e) => {
              soundManager.playBlip();
              setParams((p) => ({ ...p, type: e.target.value as BiquadFilterType }));
            }}
          >
            <option value="lowpass">Lowpass (attenuates highs)</option>
            <option value="highpass">Highpass (attenuates lows)</option>
            <option value="bandpass">Bandpass (passes center band)</option>
            <option value="notch">Notch / Band-Reject (cuts center band)</option>
            <option value="peaking">Peaking EQ (bell filter)</option>
          </select>
        </div>

        <div className="sandbox-control-group">
          <label htmlFor="cutoff-slider">
            Cutoff Frequency (fc): <span className="val-badge">{params.cutoff} Hz</span>
          </label>
          <input
            id="cutoff-slider"
            type="range"
            min="20"
            max="18000"
            step="10"
            value={params.cutoff}
            onChange={(e) => setParams((p) => ({ ...p, cutoff: Number(e.target.value) }))}
          />
        </div>

        <div className="sandbox-control-group">
          <label htmlFor="q-slider">
            Resonance (Q): <span className="val-badge">{params.q.toFixed(1)}</span>
          </label>
          <input
            id="q-slider"
            type="range"
            min="0.3"
            max="12.0"
            step="0.1"
            value={params.q}
            onChange={(e) => setParams((p) => ({ ...p, q: Number(e.target.value) }))}
          />
        </div>

        {params.type === "peaking" ? (
          <div className="sandbox-control-group">
            <label htmlFor="gain-slider">
              Gain (dB): <span className="val-badge">{params.gain > 0 ? `+${params.gain}` : params.gain} dB</span>
            </label>
            <input
              id="gain-slider"
              type="range"
              min="-18"
              max="18"
              step="1"
              value={params.gain}
              onChange={(e) => setParams((p) => ({ ...p, gain: Number(e.target.value) }))}
            />
          </div>
        ) : null}

        <div className="sandbox-actions-row">
          <button
            type="button"
            className={`sandbox-btn ${isPlayingAudio ? "sandbox-btn--active" : ""}`}
            onClick={toggleAudio}
            aria-label={isPlayingAudio ? "Mute pink noise audio test" : "Play pink noise through biquad filter"}
          >
            {isPlayingAudio ? "🔊 Mute Live Pass-Through" : "▶ Audition Pink Noise Pass-Through"}
          </button>
        </div>
      </div>

      {/* Real-time Math & Coefficient Readout */}
      <div className="sandbox-telemetry-grid">
        <div className="telemetry-card">
          <span className="telemetry-label">NORMALIZED B0</span>
          <span className="telemetry-val">{coefficients.b0.toFixed(5)}</span>
        </div>
        <div className="telemetry-card">
          <span className="telemetry-label">NORMALIZED B1</span>
          <span className="telemetry-val">{coefficients.b1.toFixed(5)}</span>
        </div>
        <div className="telemetry-card">
          <span className="telemetry-label">NORMALIZED B2</span>
          <span className="telemetry-val">{coefficients.b2.toFixed(5)}</span>
        </div>
        <div className="telemetry-card">
          <span className="telemetry-label">FEEDBACK A1</span>
          <span className="telemetry-val">{coefficients.a1.toFixed(5)}</span>
        </div>
        <div className="telemetry-card">
          <span className="telemetry-label">FEEDBACK A2</span>
          <span className="telemetry-val">{coefficients.a2.toFixed(5)}</span>
        </div>
      </div>
    </div>
  );
}
