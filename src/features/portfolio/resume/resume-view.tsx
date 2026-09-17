"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { soundManager } from "@/lib/audio-synthesizer";
import { getAllProjects } from "@/features/portfolio/project-registry";
import { profile } from "@/data/profile";
import { profileSkills } from "@/data/skills";
import { generateJsonResume, generatePlainTextResume } from "./json-resume-data";
import type { PortfolioProject } from "@/types/portfolio";

export type ResumeFocus = "all" | "systems" | "data" | "games";

export function ResumeView() {
  const [focus, setFocus] = useState<ResumeFocus>("all");
  const [copiedText, setCopiedText] = useState(false);
  const projects = getAllProjects();

  // Filter and order projects based on focus
  const filteredProjects = projects.filter((p) => {
    if (focus === "systems") {
      return ["sonara", "lyrune", "neerad-store"].includes(p.id);
    }
    if (focus === "data") {
      return ["kerala-flood-risk-platform", "recoverai", "lucida-sync"].includes(p.id);
    }
    if (focus === "games") {
      return ["stance-combat-pvp", "scrollbrake", "lyrune"].includes(p.id);
    }
    return true;
  });

  const handlePrint = useCallback(() => {
    soundManager.playTactileClick();
    window.print();
  }, []);

  const handleDownloadJson = useCallback(() => {
    soundManager.playTactileClick();
    const json = generateJsonResume();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mohammed-mishal-resume.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleCopyPlainText = useCallback(() => {
    soundManager.playTactileClick();
    const text = generatePlainTextResume();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2400);
    }).catch(() => {});
  }, []);

  // Categorize skills
  const languages = profileSkills.filter((s) => s.category === "languages");
  const frameworks = profileSkills.filter((s) => ["frameworks", "game-development", "web"].includes(s.category));
  const dataSystems = profileSkills.filter((s) => ["ai-ml", "data", "cloud"].includes(s.category));

  return (
    <div className="resume-container">
      {/* Interactive Action Toolbar (Hidden in Print) */}
      <div className="resume-toolbar" role="toolbar" aria-label="Resume export actions">
        <div className="resume-toolbar__actions">
          <button
            type="button"
            className="resume-tool-btn resume-tool-btn--primary"
            onClick={handlePrint}
            title="Print or export 2-page PDF via native browser dialog"
          >
            🖨 Print / Save as PDF
          </button>
          <button
            type="button"
            className="resume-tool-btn"
            onClick={handleDownloadJson}
            title="Download JSON Resume schema file"
          >
            💾 Export JSON Resume
          </button>
          <button
            type="button"
            className={`resume-tool-btn ${copiedText ? "resume-tool-btn--copied" : ""}`}
            onClick={handleCopyPlainText}
            title="Copy plaintext ATS-formatted resume to clipboard"
          >
            {copiedText ? "✓ Copied Plaintext" : "📋 Copy Plaintext ATS"}
          </button>
        </div>

        <div className="resume-toolbar__filters">
          <span className="filter-label">Focus:</span>
          {(
            [
              ["all", "All Systems"],
              ["systems", "Desktop & Native"],
              ["data", "Intelligent & Data"],
              ["games", "Games & Web"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              className={`resume-filter-chip ${focus === val ? "resume-filter-chip--active" : ""}`}
              onClick={() => {
                soundManager.playBlip();
                setFocus(val);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Printable Paper Document */}
      <article className="resume-paper" id="resume-document">
        {/* Candidate Header */}
        <header className="resume-header">
          <div className="resume-title-block">
            <h1 className="resume-name">{profile.name}</h1>
            <p className="resume-headline">
              Computer Engineering Student · Software Systems, Intelligent Telemetry & Interactive Worlds
            </p>
          </div>

          <div className="resume-contact-block">
            <span>🌐 stretchwave.github.io/Atlas</span>
            <span>💻 github.com/StretchWave</span>
            <span>📍 Kerala, India</span>
            <span>🎓 B.Tech Computer Science & Engineering (In Progress)</span>
          </div>
        </header>

        {/* Executive Engineering Summary */}
        <section className="resume-section">
          <h2 className="resume-section__title">Executive Engineering Profile</h2>
          <p className="resume-text">
            Computer Engineering student building end-to-end systems with clear architectural boundaries and honest engineering.
            Experience developing desktop media engines with vectorized audio DSP and lyrics inference, predictive geospatial flood
            telemetry with digital elevation runoff routing, local-first SQLite persistence architectures, and web-native 3D
            environments. Breadth treated as an architectural asset—each domain teaching performance and failure constraints that
            strengthen the others.
          </p>
        </section>

        {/* Core Technical Competencies */}
        <section className="resume-section">
          <h2 className="resume-section__title">Technical Competencies & Systems Tooling</h2>
          <div className="resume-skills-grid">
            <div className="resume-skill-row">
              <strong className="resume-skill-cat">Systems & Languages:</strong>
              <span>{languages.map((s) => s.name).join(" · ")}</span>
            </div>
            <div className="resume-skill-row">
              <strong className="resume-skill-cat">Frameworks & Engines:</strong>
              <span>Flutter / Dart · Next.js / React · Three.js / WebGL · Web Audio API · PyQt6</span>
            </div>
            <div className="resume-skill-row">
              <strong className="resume-skill-cat">Architectural Patterns:</strong>
              <span>
                Vectorized Audio DSP · Hydrological Runoff Models · Local-First SQLite Persistence ·
                Bounded Circuit Breakers · Deterministic Finite State Machines · Append-Only Write-Ahead Logging (WAL)
              </span>
            </div>
          </div>
        </section>

        {/* Flagship Architectures & Engineering Systems */}
        <section className="resume-section resume-section--projects">
          <h2 className="resume-section__title">Selected Systems & Engineering Projects</h2>
          <div className="resume-projects-list">
            {filteredProjects.map((p: PortfolioProject) => (
              <div key={p.id} className="resume-project-item">
                <div className="resume-project-item__header">
                  <div className="resume-project-item__title-row">
                    <h3 className="resume-project-name">{p.name}</h3>
                    <span className="resume-project-badge">{p.priority.toUpperCase()}</span>
                  </div>
                  <span className="resume-project-tech">{p.technologies.join(" · ")}</span>
                </div>

                <p className="resume-project-summary">{p.summary}</p>

                <ul className="resume-project-bullets">
                  <li>{p.description}</li>
                  {p.architecture ? (
                    <li>
                      <strong>System Architecture:</strong> {p.architecture.layers.join(" → ")}.
                    </li>
                  ) : null}
                  {p.architecture?.overview ? (
                    <li>
                      <strong>Technical Overview:</strong> {p.architecture.overview}
                    </li>
                  ) : null}
                </ul>

                <div className="resume-project-links">
                  {p.links?.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="resume-link">
                      {l.label} ↗
                    </a>
                  ))}
                  <Link href={`/projects/${p.slug}`} className="resume-link resume-link--case-study">
                    Case Study ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education & Academic Rigor */}
        <section className="resume-section resume-section--education">
          <h2 className="resume-section__title">Education & Academic Foundation</h2>
          <div className="resume-education-block">
            <div className="resume-edu-header">
              <strong>Bachelor of Technology (B.Tech) in Computer Science & Engineering</strong>
              <span>Expected Graduation: 2026</span>
            </div>
            <p className="resume-edu-institution">APJ Abdul Kalam Technological University · Kerala, India</p>
            <p className="resume-edu-courses">
              <strong>Core Engineering Foundations:</strong> Data Structures & Algorithms, Systems Programming & Operating Systems,
              Computer Architecture, Database Management Systems, Computer Networks, Object-Oriented Software Design.
            </p>
          </div>
        </section>

        <footer className="resume-footer">
          <span>Mohammed Mishal · Project Atlas Engineering Dossier · ATS-Friendly Export</span>
          <span>Verified Data Registry · https://stretchwave.github.io/Atlas/resume</span>
        </footer>
      </article>
    </div>
  );
}
