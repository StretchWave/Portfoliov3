import Link from "next/link";

import { Tag } from "@/components/ui/tag";
import type { PortfolioProject } from "@/types/portfolio";

interface ProjectCardProps {
  project: PortfolioProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="project-card">
      <div className="project-card__eyebrow">
        <span>{formatCategory(project.category)}</span>
        <span>{project.status.replace("-", " ")}</span>
      </div>
      <h2>{project.name}</h2>
      <p>{project.summary}</p>
      <div className="tag-list" aria-label={`${project.name} technologies`}>
        {project.technologies.slice(0, 4).map((technology) => (
          <Tag key={technology}>{technology}</Tag>
        ))}
      </div>
      <Link className="text-link" href={`/projects/${project.slug}`}>
        Read case study <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export function formatCategory(category: PortfolioProject["category"]): string {
  return category.replaceAll("-", " ");
}
