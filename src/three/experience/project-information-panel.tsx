"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Tag } from "@/components/ui/tag";
import { ProjectDemonstration } from "@/features/portfolio/demonstrations/project-demonstration";
import { ProjectCodeInspector } from "@/features/portfolio/components/project-code-inspector";
import { PROJECT_CODE_SNIPPETS } from "@/features/portfolio/code/code-snippets-data";
import { soundManager } from "@/lib/audio-synthesizer";
import type { PortfolioProject } from "@/types/portfolio";

interface ProjectInformationPanelProps {
  project: PortfolioProject;
  onClose: () => void;
}

/** Overlay presentation only; it is not responsible for world interaction. */
export function ProjectInformationPanel({ project, onClose }: ProjectInformationPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "code">("overview");
  const hasSnippets = Boolean(PROJECT_CODE_SNIPPETS[project.id]?.length);

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

      {/* Segmented Tab Switcher (Overview vs Code Terminal) */}
      {hasSnippets ? (
        <div className="panel-tab-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "overview"}
            className={`panel-tab ${activeTab === "overview" ? "panel-tab--active" : ""}`}
            onClick={() => {
              soundManager.playBlip();
              setActiveTab("overview");
            }}
          >
            ✦ Overview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "code"}
            className={`panel-tab ${activeTab === "code" ? "panel-tab--active" : ""}`}
            onClick={() => {
              soundManager.playBlip();
              setActiveTab("code");
            }}
          >
            ⌨ Code Terminal
          </button>
        </div>
      ) : null}

      {activeTab === "code" && hasSnippets ? (
        <div className="panel-terminal-view">
          <ProjectCodeInspector projectId={project.id} variant="terminal" />
        </div>
      ) : (
        <>
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
        </>
      )}

      <div className="button-row">
        <Link className="button button--quiet" href={`/projects/${project.slug}`}>Full case study</Link>
        <button className="button button--primary" type="button" onClick={onClose}>Continue exploring</button>
      </div>
    </aside>
  );
}
