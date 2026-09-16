"use client";

/**
 * Procedural Web Audio Synthesizer.
 * Generates tactile sound effects directly in code using browser oscillators
 * and gain envelopes — zero audio files, zero KB asset load.
 * Features generative district ambient soundscapes with smooth crossfading.
 */

export type SoundProfile = "cybernetic" | "harmonic" | "crisp";

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;
  private volume: number = 0.45;
  private ambientVolume: number = 0.4;
  private effectsVolume: number = 0.55;
  private profile: SoundProfile = "cybernetic";
  private spatialEnabled: boolean = true;
  private listenerX: number = 0;
  private listenerZ: number = 0;
  private listenerYaw: number = 0;

  private ambientMasterGain: GainNode | null = null;
  private activeAmbientNodes: {
    oscillators: OscillatorNode[];
    gain: GainNode;
    intervals: number[];
  } | null = null;
  private currentDistrict: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("atlas-sound-enabled");
      this.enabled = stored === "true";

      const storedVol = localStorage.getItem("atlas-sound-volume");
      if (storedVol) {
        const parsed = Number.parseFloat(storedVol);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }

      const storedAmb = localStorage.getItem("atlas-ambient-volume");
      if (storedAmb) {
        const parsed = Number.parseFloat(storedAmb);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.ambientVolume = parsed;
        }
      }

      const storedFx = localStorage.getItem("atlas-effects-volume");
      if (storedFx) {
        const parsed = Number.parseFloat(storedFx);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.effectsVolume = parsed;
        }
      }

      const storedProfile = localStorage.getItem("atlas-sound-profile") as SoundProfile;
      if (storedProfile === "cybernetic" || storedProfile === "harmonic" || storedProfile === "crisp") {
        this.profile = storedProfile;
      }

      const storedSpatial = localStorage.getItem("atlas-spatial-enabled");
      if (storedSpatial !== null) {
        this.spatialEnabled = storedSpatial === "true";
      }

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.pauseAmbient();
        } else if (this.enabled) {
          this.resumeAmbient();
        }
      });
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (typeof window !== "undefined") {
      localStorage.setItem("atlas-sound-volume", this.volume.toString());
    }
    this.syncGains();
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public setAmbientVolume(vol: number): void {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== "undefined") {
      localStorage.setItem("atlas-ambient-volume", this.ambientVolume.toString());
    }
    this.syncGains();
  }

  public getEffectsVolume(): number {
    return this.effectsVolume;
  }

  public setEffectsVolume(vol: number): void {
    this.effectsVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== "undefined") {
      localStorage.setItem("atlas-effects-volume", this.effectsVolume.toString());
    }
  }

  public getProfile(): SoundProfile {
    return this.profile;
  }

  public setProfile(profile: SoundProfile): void {
    this.profile = profile;
    if (typeof window !== "undefined") {
      localStorage.setItem("atlas-sound-profile", profile);
    }
  }

  public isSpatialEnabled(): boolean {
    return this.spatialEnabled;
  }

  public setSpatialEnabled(enabled: boolean): void {
    this.spatialEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("atlas-spatial-enabled", String(enabled));
    }
  }

  public updateSpatialListener(x: number, _y: number, z: number, yaw: number): void {
    this.listenerX = x;
    this.listenerZ = z;
    this.listenerYaw = yaw;
  }

  private syncGains(): void {
    if (this.ambientMasterGain && this.ctx) {
      const targetGain = this.volume * this.ambientVolume;
      this.ambientMasterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("atlas-sound-enabled", enabled ? "true" : "false");
    }
    if (enabled) {
      this.initContext();
      this.playClick();
      if (this.currentDistrict) {
        const d = this.currentDistrict;
        this.currentDistrict = null;
        this.setAmbientDistrict(d);
      }
    } else {
      this.stopAmbient();
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.ambientMasterGain) {
      this.ambientMasterGain = this.ctx.createGain();
      this.ambientMasterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.ambientMasterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private pauseAmbient(): void {
    if (this.ambientMasterGain && this.ctx) {
      this.ambientMasterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.15);
    }
  }

  private resumeAmbient(): void {
    if (this.ambientMasterGain && this.ctx && this.enabled) {
      this.ambientMasterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.3);
    }
  }

  /**
   * Generative continuous procedural soundscapes with equal-power 1.2s crossfading.
   */
  public setAmbientDistrict(areaId: string): void {
    if (this.currentDistrict === areaId) return;
    this.currentDistrict = areaId;

    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.ambientMasterGain) return;

    const now = ctx.currentTime;

    // Crossfade old track out
    if (this.activeAmbientNodes) {
      const oldTrack = this.activeAmbientNodes;
      oldTrack.gain.gain.setValueAtTime(oldTrack.gain.gain.value, now);
      oldTrack.gain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
      setTimeout(() => {
        for (const osc of oldTrack.oscillators) {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Ignore if already stopped
          }
        }
        for (const inv of oldTrack.intervals) {
          window.clearInterval(inv);
        }
        oldTrack.gain.disconnect();
      }, 1300);
      this.activeAmbientNodes = null;
    }

    // Initialize new district track
    const districtGain = ctx.createGain();
    districtGain.gain.setValueAtTime(0.0001, now);
    districtGain.gain.linearRampToValueAtTime(0.18, now + 1.4);
    districtGain.connect(this.ambientMasterGain);

    const oscillators: OscillatorNode[] = [];
    const intervals: number[] = [];

    if (areaId === "software-district") {
      // Deep server hum + subtle filtered noise modulation
      const sub = ctx.createOscillator();
      sub.type = "sine";
      sub.frequency.setValueAtTime(55, now); // A1
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.35, now);
      sub.connect(subGain);
      subGain.connect(districtGain);
      sub.start(now);
      oscillators.push(sub);

      const hum = ctx.createOscillator();
      hum.type = "triangle";
      hum.frequency.setValueAtTime(110, now); // A2
      const humFilter = ctx.createBiquadFilter();
      humFilter.type = "lowpass";
      humFilter.frequency.setValueAtTime(450, now);
      const humGain = ctx.createGain();
      humGain.gain.setValueAtTime(0.12, now);
      hum.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(districtGain);
      hum.start(now);
      oscillators.push(hum);
    } else if (areaId === "intelligence-observatory") {
      // Atmospheric ocean/rain resonance
      const drone = ctx.createOscillator();
      drone.type = "sine";
      drone.frequency.setValueAtTime(43.65, now); // F1
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(280, now);
      filter.Q.setValueAtTime(3.0, now);
      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.4, now);
      drone.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(districtGain);
      drone.start(now);
      oscillators.push(drone);

      const highPad = ctx.createOscillator();
      highPad.type = "sine";
      highPad.frequency.setValueAtTime(130.81, now); // C3
      const highGain = ctx.createGain();
      highGain.gain.setValueAtTime(0.15, now);
      highPad.connect(highGain);
      highGain.connect(districtGain);
      highPad.start(now);
      oscillators.push(highPad);
    } else if (areaId === "creative-workshop") {
      // Warm, open harmonic synth chord
      [110, 164.81, 220].forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.setValueAtTime(650, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.12, now);
        osc.connect(f);
        f.connect(g);
        g.connect(districtGain);
        osc.start(now);
        oscillators.push(osc);
      });
    } else {
      // Atlas Central Hub — Airy Lydian chime pad
      [92.5, 138.59, 207.65].forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.setValueAtTime(750, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.14, now);
        osc.connect(f);
        f.connect(g);
        g.connect(districtGain);
        osc.start(now);
        oscillators.push(osc);
      });
    }

    this.activeAmbientNodes = {
      oscillators,
      gain: districtGain,
      intervals,
    };
  }

  public stopAmbient(): void {
    if (!this.activeAmbientNodes || !this.ctx) return;
    const now = this.ctx.currentTime;
    const track = this.activeAmbientNodes;
    track.gain.gain.setValueAtTime(track.gain.gain.value, now);
    track.gain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    setTimeout(() => {
      for (const osc of track.oscillators) {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Ignore
        }
      }
      for (const inv of track.intervals) {
        window.clearInterval(inv);
      }
      track.gain.disconnect();
    }, 700);
    this.activeAmbientNodes = null;
  }

  /**
   * Resonant low-pass filtered harmonic sweep for portal travel.
   */
  public playPortalTravel(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Harmonic chord (Root + Fifth + Octave)
    [220, 329.63, 440].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.45);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.3);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.5);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    });
  }

  /**
   * Crisp high-frequency glass chime for exhibit inspection.
   */
  public playChime(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [880, 1318.51, 1760].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.4);
    });
  }

  /**
   * Soft tactile click for UI button interactions.
   */
  public playClick(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  /**
   * Ultra-crisp micro-click for UI buttons, tabs, chips, and toggles.
   */
  public playTactileClick(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(2800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.012);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.014);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.016);
  }

  /**
   * Harmonic resonant chime for topology node inspection.
   */
  public playNodeBeep(pitchOffset: number = 0): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreq = 1046.5 * Math.pow(2, pitchOffset / 12);

    [baseFreq, baseFreq * 1.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.02);

      gain.gain.setValueAtTime(0.001, now + idx * 0.02);
      gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.02 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.02 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.02);
      osc.stop(now + idx * 0.02 + 0.25);
    });
  }

  /**
   * Fast melodic blip for stage progression, navigation pulses, and tab switches.
   */
  public playBlip(pitchOffset: number = 0): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const freq = 880 * Math.pow(2, pitchOffset / 12);
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.04);

    const effGain = 0.045 * this.effectsVolume;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(effGain, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  /**
   * Spatial 3D Audio Sonification ping based on listener distance & camera angle.
   */
  public playSpatialPing(emitterX: number, emitterZ: number, baseFreq: number = 784): void {
    if (!this.enabled || !this.spatialEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    // Euclidean distance in X-Z plane
    const dx = emitterX - this.listenerX;
    const dz = emitterZ - this.listenerZ;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Beyond auditory horizon (e.g. 24 units), skip processing
    if (dist > 24) return;

    // Distance attenuation curve (inverse proportional with soft minimum)
    const maxVol = 0.05 * this.effectsVolume;
    const attenuation = Math.max(0.001, maxVol * (1 - dist / 24));

    // Spatial Panning calculation:
    // Determine relative angle to camera yaw
    const angleToEmitter = Math.atan2(dx, dz);
    const relativeAngle = angleToEmitter - this.listenerYaw;
    const rawPan = Math.sin(relativeAngle);
    // Clamp to standard StereoPanner [-1, 1]
    const pan = Math.max(-1, Math.min(1, rawPan));

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = this.profile === "harmonic" ? "triangle" : this.profile === "crisp" ? "sine" : "sawtooth";
    osc.frequency.setValueAtTime(baseFreq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(attenuation, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc.connect(gain);

    // Stereo Panning (StereoPannerNode if supported)
    const contextWithPanner = ctx as unknown as { createStereoPanner?: () => StereoPannerNode };
    if (typeof contextWithPanner.createStereoPanner === "function") {
      const panner = contextWithPanner.createStereoPanner();
      panner.pan.setValueAtTime(pan, now);
      gain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      gain.connect(ctx.destination);
    }

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Dynamic audio feedback for combat trainer mechanics.
   */
  public playCombat(type: "parry" | "dodge" | "block" | "hit"): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === "parry") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1480, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "dodge") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.15);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "block") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  /**
   * Mechanical camera shutter sound for viewport screenshot capture.
   */
  public playCameraShutter(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Two quick mechanical clicks (mirror up, shutter close)
    [0, 0.06].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "highpass";
      filter.frequency.setValueAtTime(1800, now + offset);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(idx === 0 ? 3200 : 2400, now + offset);
      osc.frequency.exponentialRampToValueAtTime(800, now + offset + 0.03);

      gain.gain.setValueAtTime(0.06 * this.effectsVolume, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.04);
    });
  }

  /**
   * Flight mode activation audio cue: ascending/descending frequency swoop.
   */
  public playFlightEngage(isEngaging: boolean): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    if (isEngaging) {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);
    } else {
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.05 * this.effectsVolume, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const soundManager = new AudioSynthesizer();
