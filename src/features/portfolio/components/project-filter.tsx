"use client";

import { useMemo, useState } from "react";

import type { PortfolioProject, ProjectCategory } from "@/types/portfolio";

import { ProjectCard } from "./project-card";

const filterGroups: ReadonlyArray<{ id: string; label: string; categories: readonly ProjectCategory[] }> = [
  { id: "all", label: "All", categories: [] },
  { id: "software", label: "Software & Tools", categories: ["software-engineering", "developer-tools", "automation", "desktop-application"] },
  { id: "games", label: "Games & Interactive", categories: ["game-development", "interactive-systems"] },
  { id: "ai-data", label: "AI & Data", categories: ["data-and-intelligence"] },
  { id: "web-mobile", label: "Web & Mobile", categories: ["web-development", "mobile-development"] },
  { id: "experiments", label: "Experiments", categories: ["experimental"] },
];

interface ProjectFilterProps {
  projects: readonly PortfolioProject[];
}

export function ProjectFilter({ projects }: ProjectFilterProps) {
  const [activeGroup, setActiveGroup] = useState("all");

  const visibleProjects = useMemo(() => {
    if (activeGroup === "all") return projects;
    const group = filterGroups.find((entry) => entry.id === activeGroup);
    if (!group) return projects;
    return projects.filter((project) =>
      group.categories.includes(project.category) ||
      project.secondaryCategories?.some((category) => group.categories.includes(category)),
    );
  }, [activeGroup, projects]);

  return (
    <div>
      <div className="filter-bar" role="group" aria-label="Filter projects by category">
        {filterGroups.map((group) => (
          <button
            key={group.id}
            type="button"
            className={`filter-button${activeGroup === group.id ? " filter-button--active" : ""}`}
            aria-pressed={activeGroup === group.id}
            onClick={() => setActiveGroup(group.id)}
          >
            {group.label}
          </button>
        ))}
      </div>
      <div className="project-grid project-grid--full">
        {visibleProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>
    </div>
  );
}