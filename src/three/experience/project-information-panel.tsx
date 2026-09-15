"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Tag } from "@/components/ui/tag";
import { ProjectDemonstration } from "@/features/portfolio/demonstrations/project-demonstration";
import type { PortfolioProject } from "@/types/portfolio";

interface ProjectInformationPanelProps {
  project: PortfolioProject;
  onClose: () => void;
}

/** Overlay presentation only; it is not responsible for world interaction. */
export function ProjectInformationPanel({ project, onClose }: ProjectInformationPanelProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <aside className="project-panel" role="dialog" aria-modal="true" aria-labelledby="project-panel-title">
      <button className="project-panel__close" type="button" onClick={onClose} aria-label="Close project information">×</button>
      <p className="eyebrow">{project.category.replaceAll("-", " ")}</p>
      <h2 id="project-panel-title">{project.name}</h2>
      <p>{project.summary}</p>
      <div className="tag-list" aria-label={`${project.name} technologies`}>
        {project.technologies.slice(0, 5).map((technology) => <Tag key={technology}>{technology}</Tag>)}
      </div>
      <p className="project-panel__description">{project.description}</p>
      {/* Interactive Demonstration Section */}
      <ProjectDemonstration project={project} />
      {project.architecture ? (
        <div className="project-panel__architecture">
          <span>System layers</span>
          <ol>{project.architecture.layers.map((layer) => <li key={layer}>{layer}</li>)}</ol>
        </div>
      ) : null}
      {project.links?.length ? (
        <div className="project-panel__links" aria-label={`${project.name} links`}>
          {project.links.map((link) => {
            const isExternal = link.href.startsWith("http://") || link.href.startsWith("https://");
            return (
              <a key={link.href} className="text-link" href={link.href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}>
                {link.label} {isExternal ? <span aria-hidden="true">↗</span> : null}
              </a>
            );
          })}
        </div>
      ) : null}
      <div className="button-row">
        <Link className="button button--quiet" href={`/projects/${project.slug}`}>Full case study</Link>
        <button className="button button--primary" type="button" onClick={onClose}>Continue exploring</button>
      </div>
    </aside>
  );
}
