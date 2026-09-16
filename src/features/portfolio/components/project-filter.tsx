"use client";

import { useMemo, useState } from "react";
import type { PortfolioProject, ProjectCategory, ProjectPriority } from "@/types/portfolio";
import { soundManager } from "@/lib/audio-synthesizer";
import { ProjectCard } from "./project-card";
import { ProjectComparisonModal } from "./project-comparison-modal";

const filterGroups: ReadonlyArray<{ id: string; label: string; categories: readonly ProjectCategory[] }> = [
  { id: "all", label: "All Categories", categories: [] },
  { id: "software", label: "Software & Tools", categories: ["software-engineering", "developer-tools", "automation", "desktop-application"] },
  { id: "games", label: "Games & Interactive", categories: ["game-development", "interactive-systems"] },
  { id: "ai-data", label: "AI & Data", categories: ["data-and-intelligence"] },
  { id: "web-mobile", label: "Web & Mobile", categories: ["web-development", "mobile-development"] },
  { id: "experiments", label: "Experiments", categories: ["experimental"] },
];

const priorityRanks: Record<ProjectPriority, number> = {
  flagship: 0,
  featured: 1,
  supporting: 2,
  experiment: 3,
  archived: 4,
};

interface ProjectFilterProps {
  projects: readonly PortfolioProject[];
}

export function ProjectFilter({ projects }: ProjectFilterProps) {
  const [activeGroup, setActiveGroup] = useState("all");
  const [activePriority, setActivePriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"priority" | "name" | "tech">("priority");
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const visibleProjects = useMemo(() => {
    let result = [...projects];

    // Category filter
    if (activeGroup !== "all") {
      const group = filterGroups.find((entry) => entry.id === activeGroup);
      if (group) {
        result = result.filter(
          (p) =>
            group.categories.includes(p.category) ||
            p.secondaryCategories?.some((cat) => group.categories.includes(cat))
        );
      }
    }

    // Priority filter
    if (activePriority !== "all") {
      result = result.filter((p) => p.priority === activePriority);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.technologies.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "tech") {
        return b.technologies.length - a.technologies.length;
      }
      return priorityRanks[a.priority] - priorityRanks[b.priority];
    });

    return result;
  }, [projects, activeGroup, activePriority, searchQuery, sortBy]);

  const hasActiveFilters = activeGroup !== "all" || activePriority !== "all" || Boolean(searchQuery.trim()) || sortBy !== "priority";

  function resetFilters() {
    setActiveGroup("all");
    setActivePriority("all");
    setSearchQuery("");
    setSortBy("priority");
  }

  return (
    <div className="project-explorer-root">
      {/* Top Search & Sorting Controls */}
      <div className="project-filter-toolbar">
        <div className="project-filter-search">
          <span className="search-prefix" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="project-search-input"
            placeholder="Search projects by name, technology (e.g. Python, Flutter, Web Audio)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search systems catalog"
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search query"
            >
              ×
            </button>
          ) : null}
        </div>

        <div className="project-filter-controls">
          <button
            type="button"
            className="button button--compact comparison-trigger-btn"
            onClick={() => {
              soundManager.playChime();
              setIsComparisonOpen(true);
            }}
            title="Open Systems Architecture Diff Engine"
          >
            ⚖ Compare Systems (Diff)
          </button>

          <div className="filter-sort-group">
            <label htmlFor="project-sort-select" className="sort-label">Sort by:</label>
            <select
              id="project-sort-select"
              className="project-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "priority" | "name" | "tech")}
            >
              <option value="priority">Priority (Flagships First)</option>
              <option value="name">Alphabetical (A-Z)</option>
              <option value="tech">Tech Stack Depth</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
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

      {/* Priority Chips & Counter Bar */}
      <div className="project-status-bar">
        <div className="priority-chips-group" role="group" aria-label="Filter by priority">
          <span className="priority-label">Priority:</span>
          {(["all", "flagship", "featured", "supporting", "experiment"] as const).map((pri) => (
            <button
              key={pri}
              type="button"
              className={`priority-chip ${activePriority === pri ? "priority-chip--active" : ""}`}
              onClick={() => setActivePriority(pri)}
            >
              {pri === "all" ? "All" : pri.charAt(0).toUpperCase() + pri.slice(1)}
            </button>
          ))}
        </div>

        <div className="filter-result-meta">
          <span className="filter-counter">
            Showing <strong>{visibleProjects.length}</strong> of {projects.length} systems
          </span>
          {hasActiveFilters ? (
            <button type="button" className="filter-reset-btn" onClick={resetFilters}>
              Reset all filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Project Cards Grid */}
      {visibleProjects.length === 0 ? (
        <div className="project-empty-state">
          <p>No projects match your current filters.</p>
          <button type="button" className="button button--compact" onClick={resetFilters}>
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="project-grid project-grid--full">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />
    </div>
  );
}