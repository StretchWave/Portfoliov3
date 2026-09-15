"use client";

import type { PortfolioProject } from "@/types/portfolio";
import { AudioVisualizerDemo } from "./audio-visualizer-demo";
import { CombatTimingTrainerDemo } from "./combat-timing-trainer-demo";
import { FloodRiskSimulatorDemo } from "./flood-risk-simulator-demo";
import { InteractiveTerminalDemo } from "./interactive-terminal-demo";

interface ProjectDemonstrationProps {
  project: PortfolioProject;
}

/**
 * Dedicated demonstration renderer selected at a narrow presentation boundary.
 * Renders live interactive prototypes, telemetry simulators, or audio spectrum engines.
 */
export function ProjectDemonstration({ project }: ProjectDemonstrationProps) {
  const demo = project.demonstration;
  if (!demo || demo.kind === "information") return null;

  return (
    <section className="project-demonstration-wrapper" aria-label={`${project.name} live demonstration`}>
      <div className="project-demonstration-wrapper__header">
        <span className="eyebrow">Interactive Demonstration</span>
        <h3>Experience {project.name} in action</h3>
      </div>

      <div className="project-demonstration-wrapper__content">
        {demo.kind === "audio-visualizer" ? (
          <AudioVisualizerDemo sampleTrackTitle={demo.sampleTrackTitle} />
        ) : demo.kind === "interactive-terminal" ? (
          <InteractiveTerminalDemo
            initialCommand={demo.initialCommand}
            availableCommands={demo.availableCommands}
          />
        ) : demo.kind === "flood-risk-simulator" ? (
          <FloodRiskSimulatorDemo defaultDistrict={demo.defaultDistrict} />
        ) : demo.kind === "combat-timing-trainer" ? (
          <CombatTimingTrainerDemo />
        ) : null}
      </div>
    </section>
  );
}
