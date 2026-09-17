"use client";

import { useState, useRef } from "react";
import { soundManager, type SoundProfile } from "@/lib/audio-synthesizer";
import { hapticManager } from "@/lib/haptic-feedback";
import { useModalFocusTrap } from "@/lib/modal-accessibility";

interface AudioHapticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioHapticsModal({ isOpen, onClose }: AudioHapticsModalProps) {
  const [soundEnabled, setSoundEnabled] = useState(() => soundManager.isEnabled());
  const [masterVolume, setMasterVolume] = useState(() => soundManager.getVolume());
  const [ambientVolume, setAmbientVolume] = useState(() => soundManager.getAmbientVolume());
  const [effectsVolume, setEffectsVolume] = useState(() => soundManager.getEffectsVolume());
  const [spatialEnabled, setSpatialEnabled] = useState(() => soundManager.isSpatialEnabled());
  const [profile, setProfile] = useState<SoundProfile>(() => soundManager.getProfile());
  const [hapticsEnabled, setHapticsEnabled] = useState(() => hapticManager.getEnabled());
  const hasHaptics = hapticManager.hasHardwareSupport();

  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(isOpen, modalRef, onClose);

  if (!isOpen) return null;

  function handleMasterToggle(enabled: boolean) {
    soundManager.setEnabled(enabled);
    setSoundEnabled(enabled);
    if (enabled) soundManager.playTactileClick();
  }

  function handleMasterVolChange(val: number) {
    soundManager.setVolume(val);
    setMasterVolume(val);
  }

  function handleAmbientVolChange(val: number) {
    soundManager.setAmbientVolume(val);
    setAmbientVolume(val);
  }

  function handleEffectsVolChange(val: number) {
    soundManager.setEffectsVolume(val);
    setEffectsVolume(val);
  }

  function handleSpatialToggle(val: boolean) {
    soundManager.setSpatialEnabled(val);
    setSpatialEnabled(val);
    soundManager.playTactileClick();
  }

  function handleProfileSelect(p: SoundProfile) {
    soundManager.setProfile(p);
    setProfile(p);
    soundManager.playNodeBeep(p === "cybernetic" ? 0 : p === "harmonic" ? 4 : 7);
    hapticManager.trigger("light");
  }

  function handleHapticToggle(enabled: boolean) {
    hapticManager.setEnabled(enabled);
    setHapticsEnabled(enabled);
    if (enabled) hapticManager.trigger("success");
  }

  return (
    <div
      className="controls-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-modal-title"
    >
      <div ref={modalRef} className="audio-haptics-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="audio-modal__header">
          <div>
            <span className="audio-modal__eyebrow">TACTILE & ACOUSTIC TELEMETRY</span>
            <h3 id="audio-modal-title">Audio & Haptics Control Center</h3>
          </div>
          <button
            type="button"
            className="controls-modal__close"
            onClick={onClose}
            aria-label="Close audio settings"
          >
            ×
          </button>
        </div>

        <div className="audio-modal__body">
          {/* Master Audio Toggle */}
          <div className="audio-toggle-card">
            <div className="audio-toggle-info">
              <strong>Master Audio Synthesizer</strong>
              <small>Zero-asset browser Web Audio API procedural synthesis</small>
            </div>
            <button
              type="button"
              className={`button button--compact ${soundEnabled ? "button--sound-active" : ""}`}
              onClick={() => handleMasterToggle(!soundEnabled)}
            >
              {soundEnabled ? "🔊 Sound Enabled" : "🔇 Muted"}
            </button>
          </div>

          {/* Volume Sliders */}
          <div className="audio-sliders-panel">
            <div className="audio-slider-row">
              <div className="slider-label-wrap">
                <span>Master Volume</span>
                <strong>{Math.round(masterVolume * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                disabled={!soundEnabled}
                onChange={(e) => handleMasterVolChange(Number.parseFloat(e.target.value))}
                className="audio-range-slider"
                aria-label="Master volume"
              />
            </div>

            <div className="audio-slider-row">
              <div className="slider-label-wrap">
                <span>District Ambient Soundscape</span>
                <strong>{Math.round(ambientVolume * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={ambientVolume}
                disabled={!soundEnabled}
                onChange={(e) => handleAmbientVolChange(Number.parseFloat(e.target.value))}
                className="audio-range-slider"
                aria-label="Ambient soundscape volume"
              />
            </div>

            <div className="audio-slider-row">
              <div className="slider-label-wrap">
                <span>Sound Effects & Micro-Clicks</span>
                <strong>{Math.round(effectsVolume * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={effectsVolume}
                disabled={!soundEnabled}
                onChange={(e) => handleEffectsVolChange(Number.parseFloat(e.target.value))}
                className="audio-range-slider"
                aria-label="Sound effects volume"
              />
            </div>
          </div>

          {/* Sound Profiles */}
          <div className="audio-profiles-section">
            <span className="section-sublabel">ACOUSTIC PROFILE PRESET:</span>
            <div className="audio-profiles-grid">
              <button
                type="button"
                className={`profile-card ${profile === "cybernetic" ? "profile-card--active" : ""}`}
                onClick={() => handleProfileSelect("cybernetic")}
              >
                <div className="profile-card__header">
                  <strong>Cybernetic Core</strong>
                  {profile === "cybernetic" ? <span className="profile-active-tag">Active</span> : null}
                </div>
                <p>Deep resonant sub-bass server hums, crisp band-passed clicks, and futuristic tech pads.</p>
              </button>

              <button
                type="button"
                className={`profile-card ${profile === "harmonic" ? "profile-card--active" : ""}`}
                onClick={() => handleProfileSelect("harmonic")}
              >
                <div className="profile-card__header">
                  <strong>Ambient Harmonic</strong>
                  {profile === "harmonic" ? <span className="profile-active-tag">Active</span> : null}
                </div>
                <p>Warm melodic Lydian chord sweeps, crystalline high-frequency chimes, and smooth pads.</p>
              </button>

              <button
                type="button"
                className={`profile-card ${profile === "crisp" ? "profile-card--active" : ""}`}
                onClick={() => handleProfileSelect("crisp")}
              >
                <div className="profile-card__header">
                  <strong>Crisp Studio</strong>
                  {profile === "crisp" ? <span className="profile-active-tag">Active</span> : null}
                </div>
                <p>Pure sine waves, minimal harmonic distortion, low decay tail, and discrete micro-clicks.</p>
              </button>
            </div>
          </div>

          {/* 3D Spatial Audio & Haptics Toggles */}
          <div className="audio-features-row">
            <div className="feature-item">
              <div>
                <strong>In-World 3D Spatial Audio</strong>
                <small>Stereo panning & distance attenuation as you roam</small>
              </div>
              <button
                type="button"
                className={`button button--compact ${spatialEnabled ? "button--sound-active" : ""}`}
                onClick={() => handleSpatialToggle(!spatialEnabled)}
              >
                {spatialEnabled ? "Spatial ON" : "Flat Stereo"}
              </button>
            </div>

            <div className="feature-item">
              <div>
                <strong>Mobile Haptic Vibration</strong>
                <small>{hasHaptics ? "Tactile pulses on touch interactions" : "Hardware vibration supported on mobile devices"}</small>
              </div>
              <button
                type="button"
                className={`button button--compact ${hapticsEnabled ? "button--sound-active" : ""}`}
                onClick={() => handleHapticToggle(!hapticsEnabled)}
              >
                {hapticsEnabled ? "Haptics ON" : "Haptics OFF"}
              </button>
            </div>
          </div>

          {/* Sound Testing Bar */}
          <div className="audio-test-bar">
            <span className="section-sublabel">LIVE PREVIEW TEST BENCH:</span>
            <div className="audio-test-buttons">
              <button
                type="button"
                className="test-btn"
                onClick={() => {
                  soundManager.playTactileClick();
                  hapticManager.trigger("light");
                }}
              >
                Test Micro-Click
              </button>
              <button
                type="button"
                className="test-btn"
                onClick={() => {
                  soundManager.playChime();
                  hapticManager.trigger("medium");
                }}
              >
                Test Chime
              </button>
              <button
                type="button"
                className="test-btn"
                onClick={() => {
                  soundManager.playCombat("parry");
                  hapticManager.trigger("success");
                }}
              >
                Test Combat Parry
              </button>
              <button
                type="button"
                className="test-btn"
                onClick={() => hapticManager.trigger("warning")}
              >
                Test Haptic Warning
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="audio-modal__footer">
          <span>Shortcuts: Press <kbd>U</kbd> anytime to open audio settings · <kbd>Esc</kbd> to close</span>
          <button type="button" className="button button--compact" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
