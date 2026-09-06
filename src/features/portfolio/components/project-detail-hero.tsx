import { formatCategory } from "./project-card";

import type { PortfolioProject } from "@/types/portfolio";

export function ProjectDetailHero({ project }: { project: PortfolioProject }) {
  return (
    <header className="project-detail__hero">
      <p className="eyebrow">{formatCategory(project.category)} · {project.status.replace("-", " ")}</p>
      <h1>{project.name}</h1>
      <p className="lede">{project.summary}</p>
    </header>
  );
}
