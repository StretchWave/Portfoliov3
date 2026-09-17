"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";

import { Tag } from "@/components/ui/tag";
import { ProjectDemonstration } from "@/features/portfolio/demonstrations/project-demonstration";
import { ProjectCodeInspector } from "@/features/portfolio/components/project-code-inspector";
import { PROJECT_CODE_SNIPPETS } from "@/features/portfolio/code/code-snippets-data";
import { soundManager } from "@/lib/audio-synthesizer";
import { useModalFocusTrap } from "@/lib/modal-accessibility";
import type { PortfolioProject } from "@/types/portfolio";

interface ProjectInformationPanelProps {
  project: PortfolioProject;
  onClose: () => void;
}

/** Overlay presentation only; it is not responsible for world interaction. */
export function ProjectInformationPanel({ project, onClose }: ProjectInformationPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "code">("overview");
  const panelRef = useRef<HTMLElement>(null);
  const hasSnippets = Boolean(PROJECT_CODE_SNIPPETS[project.id]?.length);

  useModalFocusTrap(true, panelRef, onClose);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, currentTab: "overview" | "code") => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const nextTab = currentTab === "overview" ? "code" : "overview";
        setActiveTab(nextTab);
        soundManager.playBlip();
        const targetBtn = panelRef.current?.querySelector<HTMLButtonElement>(`#panel-tab-${nextTab}`);
        targetBtn?.focus();
      }
    },
    []
  );

  return (
    <aside
      ref={panelRef}
      className="project-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-panel-title"
    >
      <button
        className="project-panel__close"
        type="button"
        onClick={onClose}
        aria-label="Close project information (Escape)"
      >
        ×
      </button>
      <p className="eyebrow">{project.category.replaceAll("-", " ")}</p>
      <h2 id="project-panel-title">{project.name}</h2>

      {/* Segmented Tab Switcher (Overview vs Code Terminal) */}
      {hasSnippets ? (
        <div className="panel-tab-bar" role="tablist" aria-label="Project detail views">
          <button
            id="panel-tab-overview"
            type="button"
            role="tab"
            aria-selected={activeTab === "overview"}
            aria-controls="panel-panel-overview"
            tabIndex={activeTab === "overview" ? 0 : -1}
            className={`panel-tab ${activeTab === "overview" ? "panel-tab--active" : ""}`}
            onClick={() => {
              soundManager.playBlip();
              setActiveTab("overview");
            }}
            onKeyDown={(e) => handleTabKeyDown(e, "overview")}
          >
            ✦ Overview
          </button>
          <button
            id="panel-tab-code"
            type="button"
            role="tab"
            aria-selected={activeTab === "code"}
            aria-controls="panel-panel-code"
            tabIndex={activeTab === "code" ? 0 : -1}
            className={`panel-tab ${activeTab === "code" ? "panel-tab--active" : ""}`}
            onClick={() => {
              soundManager.playBlip();
              setActiveTab("code");
            }}
            onKeyDown={(e) => handleTabKeyDown(e, "code")}
          >
            ⌨ Code Terminal
          </button>
        </div>
      ) : null}

      {activeTab === "code" && hasSnippets ? (
        <div
          id="panel-panel-code"
          role="tabpanel"
          aria-labelledby="panel-tab-code"
          className="panel-terminal-view"
        >
          <ProjectCodeInspector projectId={project.id} variant="terminal" />
        </div>
      ) : (
        <div
          id="panel-panel-overview"
          role="tabpanel"
          aria-labelledby="panel-tab-overview"
        >
          <p>{project.summary}</p>
          <div className="tag-list" aria-label={`${project.name} technologies`}>
            {project.technologies.slice(0, 5).map((technology) => (
              <Tag key={technology}>{technology}</Tag>
            ))}
          </div>
          <p className="project-panel__description">{project.description}</p>
          {/* Interactive Demonstration Section */}
          <ProjectDemonstration project={project} />
          {project.architecture ? (
            <div className="project-panel__architecture">
              <span>System layers</span>
              <ol>
                {project.architecture.layers.map((layer) => (
                  <li key={layer}>{layer}</li>
                ))}
              </ol>
            </div>
          ) : null}
          {project.links?.length ? (
            <div className="project-panel__links" aria-label={`${project.name} links`}>
              {project.links.map((link) => {
                const isExternal =
                  link.href.startsWith("http://") || link.href.startsWith("https://");
                return (
                  <a
                    key={link.href}
                    className="text-link"
                    href={link.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                  >
                    {link.label} {isExternal ? <span aria-hidden="true">↗</span> : null}
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      )}

      <div className="button-row">
        <Link className="button button--quiet" href={`/projects/${project.slug}`}>
          Full case study
        </Link>
        <button className="button button--primary" type="button" onClick={onClose}>
          Continue exploring
        </button>
      </div>
    </aside>
  );
}
