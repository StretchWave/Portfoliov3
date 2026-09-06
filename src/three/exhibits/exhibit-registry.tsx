"use client";

import { getProjectsWithExhibits } from "@/features/portfolio/project-registry";

import { ProjectExhibit } from "./project-exhibit";

interface ExhibitRegistryProps {
  area: string;
}

/** Turns declarative exhibit configurations into generic scene objects. */
export function ExhibitRegistry({ area }: ExhibitRegistryProps) {
  const projects = getProjectsWithExhibits(area);

  return (
    <group>
      {projects.map((project) => {
        const exhibit = project.exhibit;
        if (!exhibit) return null;

        return (
          <ProjectExhibit
            key={project.id}
            projectId={project.id}
            projectName={project.name}
            presentation={exhibit.presentation}
            position={exhibit.position}
            accent={exhibit.accent}
            interactionRange={exhibit.interactionRange ?? 2.8}
          />
        );
      })}
    </group>
  );
}
