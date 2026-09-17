"use client";

import { loadSettings, saveSettings } from "@/lib/storage";

/**
 * Procedural Web Audio Synthesizer.
 * Generates 100% procedural synthesized audio using Web Audio API oscillators
 * and gain envelopes — zero external audio files downloaded.
 *
 * Audio Bus Hierarchy:
 * AudioContext
 *      ↓
 * Master Gain
 *      ├── Ambient Gain (District ambient soundscapes)
 *      └── Effects Gain (UI clicks, spatial portals, footsteps, chimes)
 *               ↓
 *           (Spatial Panner)
 *               ↓
 *          Destination
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

  // Dedicated Audio Bus Nodes
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;

  private activeAmbientNodes: {
    oscillators: OscillatorNode[];
    gain: GainNode;
    intervals: number[];
  } | null = null;
  private currentDistrict: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const settings = loadSettings();
      this.enabled = settings.soundEnabled;
      this.volume = settings.masterVolume;
      this.ambientVolume = settings.ambientVolume;
      this.effectsVolume = settings.effectsVolume;
      this.profile = settings.soundProfile;
      this.spatialEnabled = settings.spatialEnabled;

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
    saveSettings({ masterVolume: this.volume });
    this.syncGains();
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public setAmbientVolume(vol: number): void {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    saveSettings({ ambientVolume: this.ambientVolume });
    this.syncGains();
  }

  public getEffectsVolume(): number {
    return this.effectsVolume;
  }

  public setEffectsVolume(vol: number): void {
    this.effectsVolume = Math.max(0, Math.min(1, vol));
    saveSettings({ effectsVolume: this.effectsVolume });
    this.syncGains();
  }

  public getProfile(): SoundProfile {
    return this.profile;
  }

  public setProfile(profile: SoundProfile): void {
    this.profile = profile;
    saveSettings({ soundProfile: profile });
  }

  public isSpatialEnabled(): boolean {
    return this.spatialEnabled;
  }

  public setSpatialEnabled(enabled: boolean): void {
    this.spatialEnabled = enabled;
    saveSettings({ spatialEnabled: enabled });
  }

  public updateSpatialListener(x: number, _y: number, z: number, yaw: number): void {
    this.listenerX = x;
    this.listenerZ = z;
    this.listenerYaw = yaw;
  }

  private syncGains(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, now, 0.05);
    }
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(this.ambientVolume, now, 0.05);
    }
    if (this.effectsGain) {
      this.effectsGain.gain.setTargetAtTime(this.effectsVolume, now, 0.05);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    saveSettings({ soundEnabled: enabled });

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
    if (this.ctx && !this.masterGain) {
      // 1. Master Gain connected to hardware destination
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 2. Ambient Bus connected to Master
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // 3. Effects Bus connected to Master
      this.effectsGain = this.ctx.createGain();
      this.effectsGain.gain.setValueAtTime(this.effectsVolume, this.ctx.currentTime);
      this.effectsGain.connect(this.masterGain);
    }
    return this.ctx;
  }

  private getEffectsDestination(): AudioNode {
    if (this.effectsGain) return this.effectsGain;
    if (this.masterGain) return this.masterGain;
    if (this.ctx) return this.ctx.destination;
    throw new Error("AudioContext not initialized");
  }

  private pauseAmbient(): void {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.15);
    }
  }

  private resumeAmbient(): void {
    if (this.ambientGain && this.ctx && this.enabled) {
      this.ambientGain.gain.setTargetAtTime(this.ambientVolume, this.ctx.currentTime, 0.3);
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
    if (!ctx || !this.ambientGain) return;

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

    // Initialize new district track routed through ambientGain bus
    const districtGain = ctx.createGain();
    districtGain.gain.setValueAtTime(0.0001, now);
    districtGain.gain.linearRampToValueAtTime(0.18, now + 1.4);
    districtGain.connect(this.ambientGain);

    const oscillators: OscillatorNode[] = [];
    const intervals: number[] = [];

    if (areaId === "software-district") {
      // Deep resonant server hum with gentle flutter
      const sub = ctx.createOscillator();
      sub.type = "sine";
      sub.frequency.setValueAtTime(55, now); // A1 note
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.35, now);
      sub.connect(subGain);
      subGain.connect(districtGain);
      sub.start(now);
      oscillators.push(sub);

      const hum = ctx.createOscillator();
      hum.type = "triangle";
      hum.frequency.setValueAtTime(110, now); // A2 note
      const humFilter = ctx.createBiquadFilter();
      humFilter.type = "lowpass";
      humFilter.frequency.setValueAtTime(240, now);
      const humGain = ctx.createGain();
      humGain.gain.setValueAtTime(0.12, now);
      hum.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(districtGain);
      hum.start(now);
      oscillators.push(hum);
    } else if (areaId === "intelligence-observatory") {
      // Cosmic shimmering drone
      const drone = ctx.createOscillator();
      drone.type = "sine";
      drone.frequency.setValueAtTime(65.41, now); // C2
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(3, now);
      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.4, now);
      drone.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(districtGain);
      drone.start(now);
      oscillators.push(drone);

      const highPad = ctx.createOscillator();
      highPad.type = "sine";
      highPad.frequency.setValueAtTime(261.63, now); // C4
      const highGain = ctx.createGain();
      highGain.gain.setValueAtTime(0.06, now);
      highPad.connect(highGain);
      highGain.connect(districtGain);
      highPad.start(now);
      oscillators.push(highPad);
    } else if (areaId === "creative-workshop") {
      // Vibrant dual-tone harmonic bed
      const chords = [146.83, 174.61, 220.0]; // D-minor triad
      chords.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.setValueAtTime(350, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.08, now);
        osc.connect(f);
        f.connect(g);
        g.connect(districtGain);
        osc.start(now);
        oscillators.push(osc);
      });
    } else {
      // Central Hub: serene pristine baseline drone (F-major 7th)
      const hubFrequencies = [87.31, 130.81, 164.81]; // F2, C3, E3
      hubFrequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.setValueAtTime(280, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.15 / (idx + 1), now);
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
    if (!this.ctx || !this.activeAmbientNodes) return;
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
    this.currentDistrict = null;
  }

  // Tactical SFX Sound Generators routed through Effects Gain Bus

  public playClick(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();

    if (this.profile === "cybernetic") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "square";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.04);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3200, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.045);
    } else if (this.profile === "harmonic") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.065);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.025);
    }
  }

  public playBlip(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1046.5, now); // C6
    osc.frequency.exponentialRampToValueAtTime(2093.0, now + 0.05); // C7

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playChime(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.0, now + 0.06); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.12); // D6

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2400, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  public playWarpSound(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.35);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  public playTactileClick(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.015);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  /**
   * Spatially located sound effect for portals and world exhibits.
   * Calculates stereo panning and 1/distance attenuation relative to listener position.
   */
  public playSpatialPortalSound(emitterX: number, emitterZ: number): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const dx = emitterX - this.listenerX;
    const dz = emitterZ - this.listenerZ;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Attenuation falls off smoothly between 1.0m and 18.0m
    const maxDist = 18.0;
    if (dist > maxDist) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const atten = Math.max(0, 1 - dist / maxDist);
    const volume = 0.22 * (atten * atten);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);

    if (this.spatialEnabled && typeof ctx.createStereoPanner === "function") {
      const panner = ctx.createStereoPanner();
      const localX = dx * Math.cos(-this.listenerYaw) - dz * Math.sin(-this.listenerYaw);
      const panValue = Math.max(-1, Math.min(1, localX / 8.0));
      panner.pan.setValueAtTime(panValue, now);
      gain.connect(panner);
      panner.connect(dest);
    } else {
      gain.connect(dest);
    }

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playFootstep(isSprint: boolean = false): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const baseFreq = isSprint ? 95 : 75;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.04);

    const vol = isSprint ? 0.12 : 0.08;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  public playJump(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.09);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.095);
  }

  public playLand(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.065);
  }

  public playRadarPing(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1760, now); // A6
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  public playCameraShutter(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();

    // Click 1: shutter curtain open
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(2400, now);
    osc1.frequency.exponentialRampToValueAtTime(400, now + 0.02);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1800, now);

    gain1.gain.setValueAtTime(0.22, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc1.connect(filter);
    filter.connect(gain1);
    gain1.connect(dest);

    osc1.start(now);
    osc1.stop(now + 0.03);

    // Click 2: shutter curtain close (delayed 45ms)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1200, now + 0.045);
    osc2.frequency.exponentialRampToValueAtTime(200, now + 0.08);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.18, now + 0.045);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    osc2.connect(gain2);
    gain2.connect(dest);

    osc2.start(now + 0.045);
    osc2.stop(now + 0.09);
  }

  public playFovStep(isZoomIn: boolean): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const startFreq = isZoomIn ? 640 : 420;
    const endFreq = isZoomIn ? 880 : 320;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.03);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  public playNodeBeep(pitchOffset: number = 0): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const baseFreq = 520 * Math.pow(2, pitchOffset / 12);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playCombat(type: "parry" | "dodge" | "block" | "hit"): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    switch (type) {
      case "parry":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        break;
      case "dodge":
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        break;
      case "block":
        osc.type = "square";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.05);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        break;
      case "hit":
      default:
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        break;
    }

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playSpatialPing(emitterX: number, emitterZ: number, baseFreq: number = 784): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const dx = emitterX - this.listenerX;
    const dz = emitterZ - this.listenerZ;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const maxDist = 24.0;
    if (dist > maxDist) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const atten = Math.max(0, 1 - dist / maxDist);
    const volume = 0.16 * (atten * atten);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.1);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);

    if (this.spatialEnabled && typeof ctx.createStereoPanner === "function") {
      const panner = ctx.createStereoPanner();
      const localX = dx * Math.cos(-this.listenerYaw) - dz * Math.sin(-this.listenerYaw);
      const panValue = Math.max(-1, Math.min(1, localX / 10.0));
      panner.pan.setValueAtTime(panValue, now);
      gain.connect(panner);
      panner.connect(dest);
    } else {
      gain.connect(dest);
    }

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playFlightEngage(isEngaging: boolean): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    const startFreq = isEngaging ? 220 : 540;
    const endFreq = isEngaging ? 580 : 180;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playPortalTravel(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dest = this.getEffectsDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.23);
  }
}

export const soundManager = new AudioSynthesizer();
