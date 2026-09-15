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

export interface InteractiveExperienceProps {
  onExit: () => void;
}

function ExperienceInner({ onExit }: InteractiveExperienceProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [travelMenuOpen, setTravelMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => soundManager.isEnabled());
  const [isTourActive, setIsTourActive] = useState(false);
  const { currentArea, areaInfo, isTransitioning, travelToArea } = useWorldArea();
  const { setShowDiagnostics, setShowHelp } = usePerformance();
  const { recordDiscovery, setIsJournalOpen, discoveredIds, totalMilestones } = useDiscoveryJournal();
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : undefined;

  const toggleSound = useCallback(() => {
    const next = !soundEnabled;
    soundManager.setEnabled(next);
    setSoundEnabled(next);
  }, [soundEnabled]);

  const toggleTour = useCallback(() => {
    setIsTourActive((prev) => !prev);
  }, []);

  // Record area discovery
  useEffect(() => {
    recordDiscovery(`district-${currentArea}`, areaInfo.name, "District");
  }, [currentArea, areaInfo.name, recordDiscovery]);

  // Tour Hotkey: T
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLElement &&
        (e.target.closest("input, textarea, select") ||
          e.target.closest(".command-backdrop"))
      ) {
        return;
      }
      if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        toggleTour();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTour]);

  const handleInteraction = useCallback((event: InteractionEvent) => {
    if (event.kind === "open-project") {
      soundManager.playChime();
      setSelectedProjectId(event.projectId);
      recordDiscovery(`project-${event.projectId}`, undefined, "Exhibit");
      return;
    }

    if (event.kind === "travel-to-area") {
      soundManager.playPortalTravel();
      travelToArea(event.targetArea);
      return;
    }

    console.info("Atlas interaction event has no handler in the current experience:", event);
  }, [travelToArea, recordDiscovery]);

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
              className={`button button--compact ${soundEnabled ? "button--sound-active" : ""}`}
              onClick={toggleSound}
              title="Toggle Procedural Audio Effects"
            >
              {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
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

            <button type="button" onClick={onExit}>
              Exit 3D hub
            </button>
          </div>
        </div>

        {/* Atmospheric Screen-Fade Transition Veil */}
        <div
          className={`area-transition-veil ${isTransitioning ? "area-transition-veil--active" : ""}`}
          aria-hidden="true"
        />

        <InteractionHud />
        <SpatialRadarHud />
        <PerformanceHud />
        <ControlsHelpModal />
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
