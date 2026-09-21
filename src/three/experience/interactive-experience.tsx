"use client";

import { useCallback, useState, useEffect } from "react";

import { getProjectById } from "@/features/portfolio/project-registry";
import { InteractionHud } from "@/three/interaction/interaction-hud";
import { InteractionProvider } from "@/three/interaction/interaction-provider";
import type { InteractionEvent } from "@/three/interaction/interaction-types";
import { WorldAreaProvider, useWorldArea, WORLD_AREAS } from "@/three/world/area-context";
import type { WorldAreaId } from "@/types/portfolio";
import { soundManager } from "@/lib/audio-synthesizer";
import { CommandPalette } from "@/components/ui/command-palette";
import { useDiscoveryJournal } from "@/features/portfolio/journal/discovery-journal-context";

import { PerformanceProvider, usePerformance } from "../performance/performance-context";
import { PerformanceHud } from "../performance/performance-hud";
import { ControlsHelpModal } from "./controls-help-modal";
import { PortfolioCanvas } from "../core/portfolio-canvas";
import { ProjectInformationPanel } from "./project-information-panel";
import { SpatialRadarHud } from "@/three/interaction/spatial-radar-hud";
import { VirtualJoystick } from "../player/virtual-joystick";
import { TouchActionButton } from "../interaction/touch-action-button";
import { AudioHapticsModal } from "@/components/ui/audio-haptics-modal";
import { cameraSettings } from "@/three/camera/camera-settings";
import { captureViewportScreenshot } from "@/three/capture/viewport-capture";

export interface InteractiveExperienceProps {
  onExit: () => void;
}

function ExperienceInner({ onExit }: InteractiveExperienceProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [travelMenuOpen, setTravelMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => soundManager.isEnabled());
  const [isTourActive, setIsTourActive] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isFlightMode, setIsFlightMode] = useState(() => cameraSettings.isFlightMode());
  const [altitude, setAltitude] = useState(() => cameraSettings.getAltitude());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { currentArea, areaInfo, isTransitioning, travelToArea } = useWorldArea();
  const { setShowDiagnostics, setShowHelp } = usePerformance();
  const { recordDiscovery, setIsJournalOpen, discoveredIds, totalMilestones } = useDiscoveryJournal();
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : undefined;

  // Subscribe to camera settings (flight mode & altitude)
  useEffect(() => {
    return cameraSettings.subscribe(() => {
      setIsFlightMode(cameraSettings.isFlightMode());
      setAltitude(cameraSettings.getAltitude());
    });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundEnabled;
    soundManager.setEnabled(next);
    setSoundEnabled(next);
  }, [soundEnabled]);

  const toggleTour = useCallback(() => {
    setIsTourActive((prev) => !prev);
  }, []);

  const toggleFlight = useCallback(() => {
    const next = cameraSettings.toggleFlightMode();
    soundManager.playFlightEngage(next);
    showToast(
      next
        ? "🛸 Drone Flight Mode Active (Space to Ascend, C to Descend)"
        : "🚶 Ground Walking Mode Active"
    );
    if (next) {
      recordDiscovery("flight-matrix", "Drone Flight Matrix", "District");
    }
  }, [recordDiscovery, showToast]);

  const handleSnapshot = useCallback(async () => {
    showToast("📸 Capturing High-Res Viewport...");
    const ok = await captureViewportScreenshot(areaInfo.name);
    if (ok) {
      showToast("📸 Viewport Saved as PNG!");
      recordDiscovery("snapshot-captured", "Visual Archive Recorded", "District");
    }
  }, [areaInfo.name, recordDiscovery, showToast]);

  // Record area discovery and set ambient district soundscape
  useEffect(() => {
    recordDiscovery(`district-${currentArea}`, areaInfo.name, "District");
    soundManager.setAmbientDistrict(currentArea);
  }, [currentArea, areaInfo.name, recordDiscovery]);

  useEffect(() => {
    return () => {
      soundManager.stopAmbient();
    };
  }, []);

  // Hotkeys: T for tour, U for audio, F for flight, X for screenshot, [ / ] for FOV
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLElement &&
        (e.target.closest("input, textarea, select") ||
          e.target.closest(".command-backdrop") ||
          e.target.closest(".audio-haptics-modal") ||
          e.target.closest(".comparison-modal"))
      ) {
        return;
      }
      if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        toggleTour();
      } else if (e.key.toLowerCase() === "u") {
        e.preventDefault();
        setIsAudioModalOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFlight();
      } else if (e.key.toLowerCase() === "x") {
        e.preventDefault();
        handleSnapshot();
      } else if (e.key === "[" || e.key === "{") {
        e.preventDefault();
        cameraSettings.adjustFov(-5);
        showToast(`FOV: ${cameraSettings.getFov()}° (Zoomed In)`);
      } else if (e.key === "]" || e.key === "}") {
        e.preventDefault();
        cameraSettings.adjustFov(5);
        showToast(`FOV: ${cameraSettings.getFov()}° (Wide View)`);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTour, toggleFlight, handleSnapshot, showToast]);

  const handleInteraction = useCallback((event: InteractionEvent) => {
    if (event.kind === "open-project") {
      soundManager.playChime();
      setSelectedProjectId(event.projectId);
      recordDiscovery(`project-${event.projectId}`, undefined, "Exhibit");
      return;
    }

    if (event.kind === "travel-to-area") {
      soundManager.playPortalTravel();
      travelToArea(event.targetArea as WorldAreaId);
      return;
    }

    if (event.kind === "teleport-to-room") {
      soundManager.playPortalTravel();
      if (event.targetArea && event.targetArea !== currentArea) {
        travelToArea(event.targetArea as WorldAreaId);
        showToast(`Warping to ${event.targetArea} / ${event.roomId}...`);
      } else {
        showToast(`Entering room: ${event.roomId}...`);
        window.dispatchEvent(
          new CustomEvent("atlas:teleport-player", {
            detail: { roomId: event.roomId, spawnPointId: event.spawnPointId },
          }),
        );
      }
      return;
    }

    if (event.kind === "show-information") {
      soundManager.playChime();
      showToast(`ℹ️ ${event.title}${event.description ? `: ${event.description}` : ""}`);
      return;
    }

    if (event.kind === "open-link") {
      soundManager.playClick();
      window.open(event.url, "_blank", "noopener,noreferrer");
      return;
    }

    console.info("Atlas interaction event has no handler in the current experience:", event);
  }, [travelToArea, recordDiscovery, currentArea, showToast]);

  return (
    <main className="interactive-experience">
      <InteractionProvider onInteraction={handleInteraction}>
        <PortfolioCanvas
          isTourActive={isTourActive}
          onTourDeactivate={() => setIsTourActive(false)}
        />

        {/* Experience Top Bar with Area Indicator, Fast-Travel, Diagnostics, and Help */}
        <div className="experience-topbar">
          <div className="experience-topbar__title">
            <span>
              <b>ATLAS</b> / {areaInfo.name.toUpperCase()}
            </span>
            <span className="experience-topbar__eyebrow">{areaInfo.categoryTitle}</span>
          </div>

          <div className="experience-topbar__actions">
            <button
              type="button"
              className="button button--compact"
              onClick={() => setIsJournalOpen(true)}
              title="Open Discovery Journal (J)"
            >
              ✦ Log ({discoveredIds.length}/{totalMilestones})
            </button>

            <button
              type="button"
              className={`button button--compact ${isTourActive ? "button--tour-active" : ""}`}
              onClick={toggleTour}
              title="Toggle Cinematic Director Tour (T)"
            >
              {isTourActive ? "🎬 Tour ON" : "🎬 Tour (T)"}
            </button>

            <CommandPalette
              onTravelToArea={(areaId) => {
                soundManager.playPortalTravel();
                travelToArea(areaId);
              }}
            />

            <div className="travel-selector">
              <button
                type="button"
                className="button button--compact"
                onClick={() => setTravelMenuOpen((prev) => !prev)}
                aria-expanded={travelMenuOpen}
              >
                Districts ▾
              </button>
              {travelMenuOpen ? (
                <div className="travel-dropdown">
                  {(Object.keys(WORLD_AREAS) as WorldAreaId[]).map((areaId) => {
                    const info = WORLD_AREAS[areaId];
                    const isActive = areaId === currentArea;
                    return (
                      <button
                        key={areaId}
                        type="button"
                        className={`travel-option ${isActive ? "travel-option--active" : ""}`}
                        onClick={() => {
                          soundManager.playPortalTravel();
                          travelToArea(areaId);
                          setTravelMenuOpen(false);
                        }}
                      >
                        <span className="travel-option__name">{info.name}</span>
                        <span className="travel-option__desc">{info.categoryTitle}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className={`button button--compact ${isFlightMode ? "button--flight-active" : ""}`}
              onClick={toggleFlight}
              title="Toggle Drone Flight / Free-Cam Mode (F)"
            >
              {isFlightMode ? "🛸 Flying (F)" : "🛸 Flight (F)"}
            </button>

            <button
              type="button"
              className="button button--compact"
              onClick={handleSnapshot}
              title="Capture Viewport Screenshot (X)"
            >
              📸 Snap (X)
            </button>

            <button
              type="button"
              className={`button button--compact ${soundEnabled ? "button--sound-active" : ""}`}
              onClick={toggleSound}
              title="Toggle Procedural Audio Effects"
            >
              {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
            </button>

            <button
              type="button"
              className="button button--compact"
              onClick={() => setIsAudioModalOpen(true)}
              title="Open Audio & Haptics Control Center (U)"
            >
              ⚙ Audio (U)
            </button>

            <button
              type="button"
              className="button button--compact"
              onClick={() => setShowDiagnostics((p) => !p)}
              title="Toggle WebGL Performance Metrics (P)"
            >
              Stats (P)
            </button>

            <button
              type="button"
              className="button button--compact"
              onClick={() => setShowHelp((h) => !h)}
              title="Keyboard & Navigation Help (?)"
            >
              Help (?)
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.stopAmbient();
                onExit();
              }}
            >
              Exit 3D hub
            </button>
          </div>
        </div>

        {/* Atmospheric Screen-Fade Transition Veil */}
        <div
          className={`area-transition-veil ${isTransitioning ? "area-transition-veil--active" : ""}`}
          aria-hidden="true"
        />

        {/* Drone Flight Mode Telemetry Banner */}
        {isFlightMode ? (
          <div className="flight-hud-banner" role="status" aria-live="polite">
            <span className="flight-hud__badge">DRONE FLIGHT</span>
            <span className="flight-hud__alt">ALT: {altitude.toFixed(1)}m</span>
            <span className="flight-hud__controls">
              SPACE Ascend &bull; C/SHIFT Descend &bull; WASD Vector &bull; F Land
            </span>
          </div>
        ) : null}

        {/* Dynamic Studio & Flight Notification Toast */}
        {toastMessage ? (
          <div className="experience-toast" role="status">
            {toastMessage}
          </div>
        ) : null}

        <InteractionHud />
        <SpatialRadarHud />
        <VirtualJoystick />
        <TouchActionButton />
        <PerformanceHud />
        <ControlsHelpModal />
        <AudioHapticsModal
          isOpen={isAudioModalOpen}
          onClose={() => {
            setIsAudioModalOpen(false);
            setSoundEnabled(soundManager.isEnabled());
          }}
        />
        {selectedProject ? (
          <ProjectInformationPanel
            project={selectedProject}
            onClose={() => setSelectedProjectId(null)}
          />
        ) : null}
      </InteractionProvider>
    </main>
  );
}

/**
 * Route-level composition root for the 3D portfolio chunk.
 * Scopes performance metrics, world area state, and translates interaction events into UI.
 */
export function InteractiveExperience({ onExit }: InteractiveExperienceProps) {
  return (
    <PerformanceProvider>
      <WorldAreaProvider>
        <ExperienceInner onExit={onExit} />
      </WorldAreaProvider>
    </PerformanceProvider>
  );
}
