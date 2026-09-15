import { formatCategory, formatPriority } from "./project-card";

import type { PortfolioProject } from "@/types/portfolio";

export function ProjectDetailHero({ project }: { project: PortfolioProject }) {
  const secondary = project.secondaryCategories?.length
    ? ` · ${project.secondaryCategories.map(formatCategory).join(" / ")}`
    : "";

  return (
    <header className="project-detail__hero">
      <p className="eyebrow">
        {formatCategory(project.category)}{secondary} · {project.status.replaceAll("-", " ")} · {formatPriority(project.priority)}
      </p>
      <h1>{project.name}</h1>
      <p className="lede">{project.summary}</p>
    </header>
  );
}