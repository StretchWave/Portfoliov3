"use client";

import { useCallback, useState } from "react";

import { getProjectById } from "@/features/portfolio/project-registry";
import { InteractionHud } from "@/three/interaction/interaction-hud";
import { InteractionProvider } from "@/three/interaction/interaction-provider";
import type { InteractionEvent } from "@/three/interaction/interaction-types";

import { PortfolioCanvas } from "../core/portfolio-canvas";
import { ProjectInformationPanel } from "./project-information-panel";

export interface InteractiveExperienceProps {
  onExit: () => void;
}

/**
 * The route-level composition root for the opt-in 3D chunk. Keep domain
 * resolution here and generic systems below it free of project UI concerns.
 */
export function InteractiveExperience({ onExit }: InteractiveExperienceProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : undefined;

  const handleInteraction = useCallback((event: InteractionEvent) => {
    if (event.kind === "open-project") {
      setSelectedProjectId(event.projectId);
      return;
    }

    // Generic action events are an intentional extension point for future world systems.
    console.info("Atlas interaction event has no prototype handler:", event.actionId);
  }, []);

  return (
    <main className="interactive-experience">
      <InteractionProvider onInteraction={handleInteraction}>
        <PortfolioCanvas />
        <div className="experience-topbar">
          <span><b>ATLAS</b> / PROTOTYPE HUB</span>
          <button type="button" onClick={onExit}>Exit 3D hub</button>
        </div>
        <InteractionHud />
        {selectedProject ? <ProjectInformationPanel project={selectedProject} onClose={() => setSelectedProjectId(null)} /> : null}
      </InteractionProvider>
    </main>
  );
}
