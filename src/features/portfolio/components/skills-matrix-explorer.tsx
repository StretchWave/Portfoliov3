"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { profileSkills } from "@/data/skills";
import { getProjectById } from "@/features/portfolio/project-registry";
import type { ProfileSkill } from "@/types/portfolio";

export function SkillsMatrixExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "proven" | "core">("proven");
  const [selectedSkillId, setSelectedSkillId] = useState<string>("python");

  const filteredSkills = useMemo(() => {
    return profileSkills.filter((skill) => {
      // Filter mode check
      if (filterMode === "proven" && skill.relatedProjectIds.length === 0) {
        return false;
      }
      if (filterMode === "core") {
        const label = skill.proficiencyLabel.toLowerCase();
        if (!label.includes("core") && !label.includes("production")) {
          return false;
        }
      }

      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = skill.name.toLowerCase().includes(q);
        const matchCat = skill.category.toLowerCase().includes(q);
        const matchEvidence = skill.evidence.toLowerCase().includes(q);
        return matchName || matchCat || matchEvidence;
      }

      return true;
    });
  }, [searchQuery, filterMode]);

  const selectedSkill = useMemo(() => {
    const matchInFiltered = filteredSkills.find((s) => s.id === selectedSkillId);
    if (matchInFiltered) return matchInFiltered;
    return filteredSkills[0] ?? null;
  }, [selectedSkillId, filteredSkills]);

  const relatedProjects = useMemo(() => {
    if (!selectedSkill) return [];
    return selectedSkill.relatedProjectIds
      .map((id) => getProjectById(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [selectedSkill]);

  return (
    <div className="skills-matrix-container">
      <div className="skills-matrix__toolbar">
        {/* Search */}
        <div className="skills-matrix__search">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="skills-matrix__input"
            placeholder="Search skills by technology, domain, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter skills by keyword"
          />
          {searchQuery ? (
            <button
              type="button"
              className="skills-matrix__clear-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          ) : null}
        </div>

        {/* Filter Mode Pills */}
        <div className="skills-matrix__modes" role="group" aria-label="Evidence level">
          <button
            type="button"
            className={`matrix-mode-btn ${filterMode === "all" ? "matrix-mode-btn--active" : ""}`}
            onClick={() => setFilterMode("all")}
          >
            All Skills ({profileSkills.length})
          </button>
          <button
            type="button"
            className={`matrix-mode-btn ${filterMode === "proven" ? "matrix-mode-btn--active" : ""}`}
            onClick={() => setFilterMode("proven")}
          >
            With Project Evidence ({profileSkills.filter((s) => s.relatedProjectIds.length > 0).length})
          </button>
          <button
            type="button"
            className={`matrix-mode-btn ${filterMode === "core" ? "matrix-mode-btn--active" : ""}`}
            onClick={() => setFilterMode("core")}
          >
            Core & Production
          </button>
        </div>
      </div>

      {/* Interactive Skill Chips Grid */}
      <div className="skills-matrix__chips" role="tablist" aria-label="Interactive skills matrix">
        {filteredSkills.length === 0 ? (
          <p className="skills-matrix__empty">No skills match your search query.</p>
        ) : (
          filteredSkills.map((skill) => {
            const isSelected = skill.id === selectedSkill?.id;
            const hasProof = skill.relatedProjectIds.length > 0;

            return (
              <button
                key={skill.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`skill-chip ${isSelected ? "skill-chip--selected" : ""} ${
                  hasProof ? "skill-chip--proven" : "skill-chip--learning"
                }`}
                onClick={() => setSelectedSkillId(skill.id)}
              >
                <span className="skill-chip__name">{skill.name}</span>
                {hasProof ? (
                  <span className="skill-chip__count" title={`${skill.relatedProjectIds.length} verified project(s)`}>
                    {skill.relatedProjectIds.length}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {/* Selected Skill Telemetry Breakdown */}
      {selectedSkill ? (
        <div className="skills-matrix__detail-card" role="tabpanel">
          <div className="skills-matrix__detail-header">
            <div>
              <span className="detail-category">{selectedSkill.category.toUpperCase()}</span>
              <h3>{selectedSkill.name}</h3>
            </div>
            <span className="detail-level-badge">{selectedSkill.proficiencyLabel}</span>
          </div>

          <p className="detail-evidence-text">{selectedSkill.evidence}</p>

          <div className="detail-proof-section">
            <span className="proof-label">VERIFIED IN SYSTEMS:</span>
            {relatedProjects.length > 0 ? (
              <div className="detail-projects-grid">
                {relatedProjects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.slug}`} className="proof-project-card">
                    <div className="proof-project-header">
                      <strong>{p.name}</strong>
                      <span className="proof-project-priority">{p.priority.toUpperCase()}</span>
                    </div>
                    <p className="proof-project-summary">{p.summary}</p>
                    <span className="proof-project-link">View Architecture Breakdown →</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="proof-none-text">
                Studied for systems engineering depth; foundational curriculum and directed interest without a public portfolio repository.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
