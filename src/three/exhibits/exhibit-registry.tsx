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
      {projects.flatMap((project) => {
        const configs = [];
        if (project.exhibit && project.exhibit.area === area) {
          configs.push(project.exhibit);
        }
        if (project.exhibits) {
          for (const ex of project.exhibits) {
            if (ex.area === area) configs.push(ex);
          }
        }

        return configs.map((exhibit, index) => (
          <ProjectExhibit
            key={`${project.id}-${exhibit.area}-${index}`}
            projectId={project.id}
            projectName={project.name}
            presentation={exhibit.presentation}
            position={exhibit.position}
            accent={exhibit.accent}
            interactionRange={exhibit.interactionRange ?? 2.8}
          />
        ));
      })}
    </group>
  );
}
