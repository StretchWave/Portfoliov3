"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useDiscoveryJournal } from "@/features/portfolio/journal/discovery-journal-context";

interface AudioVisualizerDemoProps {
  sampleTrackTitle?: string;
}

type WaveformType = "sine" | "triangle" | "sawtooth" | "square";
type EngineSource = "synth" | "simulated";

// Lydian chord progression frequencies (C maj9 / F maj7#11)
const CHORD_NOTES: number[][] = [
  [261.63, 329.63, 392.0, 493.88, 587.33], // C4, E4, G4, B4, D5 (C maj9)
  [349.23, 440.0, 523.25, 659.25, 739.99], // F4, A4, C5, E5, F#5 (F maj7#11)
  [220.0, 329.63, 392.0, 493.88, 659.25],  // A3, E4, G4, B4, E5 (A min9)
  [293.66, 369.99, 440.0, 587.33, 739.99], // D4, F#4, A4, D5, F#5 (D maj9)
];

export function AudioVisualizerDemo({
  sampleTrackTitle = "Lyrune DSP Engine — Real-Time FFT & Filter Sandbox",
}: AudioVisualizerDemoProps) {
  const { recordDiscovery } = useDiscoveryJournal();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [source, setSource] = useState<EngineSource>("simulated");
  const [isPlaying, setIsPlaying] = useState(true);
  const [mode, setMode] = useState<"bars" | "wave">("bars");
  const [waveform, setWaveform] = useState<WaveformType>("sawtooth");
  const [cutoff, setCutoff] = useState<number>(2800);
  const [resonance, setResonance] = useState<number>(4.5);

  // Web Audio Nodes refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const arpIntervalRef = useRef<number>(0);
  const currentChordIdx = useRef<number>(0);
  const noteIdx = useRef<number>(0);
  const animationRef = useRef<number>(0);

  // Initialize Web Audio DSP Pipeline
  const initAudioEngine = useCallback(() => {
    if (audioCtxRef.current) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64; // 32 frequency bins
    analyser.smoothingTimeConstant = 0.8;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, ctx.currentTime);
    filter.Q.setValueAtTime(resonance, ctx.currentTime);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.08, ctx.currentTime); // Safe soft listening volume

    // Connect: Filter -> Analyser -> MasterGain -> Destination
    filter.connect(analyser);
    analyser.connect(masterGain);
    masterGain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    filterRef.current = filter;
    analyserRef.current = analyser;
    masterGainRef.current = masterGain;
  }, [cutoff, resonance]);

  // Update filter parameters live
  useEffect(() => {
    if (filterRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      filterRef.current.frequency.setTargetAtTime(cutoff, now, 0.05);
      filterRef.current.Q.setTargetAtTime(resonance, now, 0.05);
    }
  }, [cutoff, resonance]);

  // Procedural Arpeggiator synth voice generator
  useEffect(() => {
    if (source !== "synth" || !isPlaying) {
      if (arpIntervalRef.current) clearInterval(arpIntervalRef.current);
      return;
    }

    initAudioEngine();
    const ctx = audioCtxRef.current;
    const filter = filterRef.current;
    if (!ctx || !filter) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    arpIntervalRef.current = window.setInterval(() => {
      if (!ctx || !filter) return;
      const now = ctx.currentTime;
      const chord = CHORD_NOTES[currentChordIdx.current];
      const freq = chord[noteIdx.current % chord.length];

      noteIdx.current += 1;
      if (noteIdx.current % (chord.length * 2) === 0) {
        currentChordIdx.current = (currentChordIdx.current + 1) % CHORD_NOTES.length;
      }

      // Voice oscillator
      const osc = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      osc.type = waveform;
      osc.frequency.setValueAtTime(freq, now);

      // Fast attack, exponential decay envelope
      voiceGain.gain.setValueAtTime(0.001, now);
      voiceGain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      voiceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(voiceGain);
      voiceGain.connect(filter);

      osc.start(now);
      osc.stop(now + 0.4);
    }, 180);

    return () => {
      if (arpIntervalRef.current) clearInterval(arpIntervalRef.current);
    };
  }, [source, isPlaying, waveform, initAudioEngine]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (arpIntervalRef.current) clearInterval(arpIntervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Main Canvas Render Loop (Simulated OR Real AnalyserNode)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const barsCount = 32;
    const heights = new Array(barsCount).fill(6);
    const dataArray = new Uint8Array(barsCount);

    function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cybernetic Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, "rgba(7, 20, 35, 0.95)");
      bgGrad.addColorStop(1, "rgba(3, 10, 18, 0.98)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) phase += 0.04;

      if (source === "synth" && analyserRef.current) {
        // Read LIVE audio spectrum from Web Audio AnalyserNode
        analyserRef.current.getByteFrequencyData(dataArray);
      }

      if (mode === "bars") {
        const barWidth = (canvas.width - (barsCount - 1) * 3) / barsCount;
        for (let i = 0; i < barsCount; i++) {
          let target = 6;
          if (isPlaying) {
            if (source === "synth" && analyserRef.current) {
              const val = dataArray[i] || 0;
              target = (val / 255) * (canvas.height - 18) + 6;
            } else {
              // Simulated dynamic waveform
              target =
                Math.abs(Math.sin(phase * 1.5 + i * 0.28) * 0.6 + Math.cos(phase * 2.2 - i * 0.2) * 0.4) *
                  (canvas.height - 20) +
                6;
            }
          }

          // Attack/decay smoothing
          heights[i] += (target - heights[i]) * 0.35;
          const x = i * (barWidth + 3);
          const y = canvas.height - heights[i];

          const grad = ctx.createLinearGradient(0, canvas.height, 0, y);
          grad.addColorStop(0, "#0284c7");
          grad.addColorStop(0.65, "#38bdf8");
          grad.addColorStop(1, source === "synth" ? "#818cf8" : "#68e4ff");

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, heights[i]);

          // Peak cap indicator
          ctx.fillStyle = "#e0f2fe";
          ctx.fillRect(x, y - 2, barWidth, 2);
        }
      } else {
        // Continuous Waveform Scope
        ctx.beginPath();
        ctx.strokeStyle = source === "synth" ? "#818cf8" : "#68e4ff";
        ctx.lineWidth = 2.5;

        for (let x = 0; x < canvas.width; x++) {
          const normX = x / canvas.width;
          let amp = 0;
          if (isPlaying) {
            if (source === "synth" && analyserRef.current) {
              const byteIdx = Math.floor(normX * dataArray.length);
              amp = ((dataArray[byteIdx] || 0) / 255 - 0.5) * (canvas.height * 0.6);
            } else {
              amp =
                Math.sin(normX * 12 + phase * 3) *
                Math.cos(normX * 6 - phase) *
                (canvas.height * 0.35);
            }
          }
          const y = canvas.height / 2 + amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(render);
    }

    animationRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, mode, source]);

  return (
    <div className="demo-visualizer">
      {/* Header with Title and Mode Toggles */}
      <div className="demo-visualizer__header">
        <div className="demo-visualizer__indicator">
          <span className={`demo-status-dot ${isPlaying ? "demo-status-dot--active" : ""}`} />
          <span className="demo-visualizer__title">{sampleTrackTitle}</span>
        </div>
        <div className="demo-visualizer__controls">
          <button
            type="button"
            className={`demo-btn ${source === "synth" ? "demo-btn--primary" : ""}`}
            onClick={() => {
              const next = source === "synth" ? "simulated" : "synth";
              setSource(next);
              if (next === "synth") {
                initAudioEngine();
                recordDiscovery("demo-lyrune-dsp");
              }
            }}
            title="Toggle Live Web Audio API Synthesizer"
          >
            {source === "synth" ? "🎹 Live DSP Synth" : "📻 Sim Track"}
          </button>
          <button
            type="button"
            className="demo-btn"
            onClick={() => setMode(mode === "bars" ? "wave" : "bars")}
          >
            {mode === "bars" ? "Waveform" : "FFT Bins"}
          </button>
          <button
            type="button"
            className="demo-btn"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={400}
        height={110}
        className="demo-visualizer__canvas"
      />

      {/* Interactive DSP Filter Controls (Visible when in Live Synth mode) */}
      {source === "synth" ? (
        <div className="dsp-controls-panel">
          <div className="dsp-waveform-selector">
            <span className="dsp-label">Oscillator:</span>
            {(["sawtooth", "square", "triangle", "sine"] as WaveformType[]).map((wf) => (
              <button
                key={wf}
                type="button"
                className={`dsp-wf-btn ${waveform === wf ? "dsp-wf-btn--active" : ""}`}
                onClick={() => setWaveform(wf)}
              >
                {wf}
              </button>
            ))}
          </div>

          <div className="dsp-slider-group">
            <label className="dsp-slider-label">
              <span>Cutoff: <strong>{cutoff} Hz</strong></span>
              <input
                type="range"
                min={200}
                max={7500}
                step={50}
                value={cutoff}
                onChange={(e) => setCutoff(Number(e.target.value))}
                className="demo-slider"
              />
            </label>
            <label className="dsp-slider-label">
              <span>Resonance (Q): <strong>{resonance.toFixed(1)}</strong></span>
              <input
                type="range"
                min={0.5}
                max={12}
                step={0.5}
                value={resonance}
                onChange={(e) => setResonance(Number(e.target.value))}
                className="demo-slider"
              />
            </label>
          </div>
        </div>
      ) : null}

      {/* Footer Specs */}
      <div className="demo-visualizer__footer">
        <span>{source === "synth" ? "Active: Web Audio BiquadFilter (24dB/oct)" : "WASAPI Loopback Capture"}</span>
        <span>{source === "synth" ? `FFT: 32 Bins · Q: ${resonance}` : "Attack: 12ms · Decay: 85ms"}</span>
      </div>
    </div>
  );
}
