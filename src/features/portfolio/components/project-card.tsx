import Link from "next/link";

import { Tag } from "@/components/ui/tag";
import type { PortfolioProject, ProjectPriority } from "@/types/portfolio";

interface ProjectCardProps {
  project: PortfolioProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const featured = project.priority === "flagship" || project.priority === "featured";

  function getBlueprintIcon(category: string) {
    if (category.includes("audio") || category.includes("desktop")) {
      return (
        <svg viewBox="0 0 100 24" className="blueprint-svg" aria-hidden="true">
          <path d="M0 12 Q 15 2, 30 12 T 60 12 T 90 12 T 100 12" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <path d="M10 12 Q 25 20, 40 12 T 70 12 T 95 12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        </svg>
      );
    }
    if (category.includes("intelligence") || category.includes("geospatial")) {
      return (
        <svg viewBox="0 0 100 24" className="blueprint-svg" aria-hidden="true">
          <ellipse cx="50" cy="12" rx="42" ry="9" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
          <ellipse cx="50" cy="12" rx="22" ry="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <circle cx="50" cy="12" r="2.5" fill="currentColor" opacity="0.8" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 100 24" className="blueprint-svg" aria-hidden="true">
        <line x1="0" y1="6" x2="100" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.2" strokeDasharray="3 3" />
        <line x1="0" y1="18" x2="100" y2="18" stroke="currentColor" strokeWidth="1" opacity="0.2" strokeDasharray="3 3" />
        <circle cx="20" cy="12" r="3" fill="currentColor" opacity="0.6" />
        <line x1="20" y1="12" x2="60" y2="12" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
        <circle cx="60" cy="12" r="3" fill="currentColor" opacity="0.6" />
        <line x1="60" y1="12" x2="85" y2="12" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
        <circle cx="85" cy="12" r="3" fill="currentColor" opacity="0.6" />
      </svg>
    );
  }

  return (
    <article className={`project-card${featured ? " project-card--featured" : ""}`}>
      <div className="project-card__header-blueprint">
        <div className="blueprint-art">{getBlueprintIcon(project.category)}</div>
        <span className="blueprint-id">SYS-{project.slug.slice(0, 4).toUpperCase()}</span>
      </div>
      <div className="project-card__eyebrow">
        <span>{formatCategory(project.category)}</span>
        <span>{formatPriority(project.priority)} · {project.status.replaceAll("-", " ")}</span>
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

export function formatPriority(priority: ProjectPriority): string {
  switch (priority) {
    case "flagship": return "Flagship";
    case "featured": return "Featured";
    case "supporting": return "Supporting";
    case "experiment": return "Experiment";
    case "archived": return "Archived";
  }
}