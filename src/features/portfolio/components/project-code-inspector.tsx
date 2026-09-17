"use client";

import { useState, useCallback, useRef } from "react";
import { soundManager } from "@/lib/audio-synthesizer";
import { PROJECT_CODE_SNIPPETS, type CodeSnippetItem } from "../code/code-snippets-data";
import type { CodeEvidenceType } from "@/types/portfolio";

export interface ProjectCodeInspectorProps {
  projectId: string;
  variant?: "full" | "embedded" | "terminal";
}

const EVIDENCE_LABELS: Record<CodeEvidenceType, { label: string; classModifier: string }> = {
  "verified-source": { label: "Verified Source Excerpt", classModifier: "verified" },
  "adapted-example": { label: "Adapted Architecture Excerpt", classModifier: "adapted" },
  conceptual: { label: "Conceptual Architecture", classModifier: "conceptual" },
  simulation: { label: "Simulated Demonstration", classModifier: "simulation" },
};

export function ProjectCodeInspector({ projectId, variant = "full" }: ProjectCodeInspectorProps) {
  const snippets = PROJECT_CODE_SNIPPETS[projectId] || [];
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const tabListRef = useRef<HTMLDivElement>(null);

  const activeSnippet: CodeSnippetItem | undefined = snippets[activeIdx];

  const handleCopy = useCallback(() => {
    if (!activeSnippet) return;
    soundManager.playTactileClick();
    navigator.clipboard
      .writeText(activeSnippet.code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      })
      .catch(() => {});
  }, [activeSnippet]);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (!snippets.length) return;
      let nextIndex = index;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextIndex = (index + 1) % snippets.length;
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        nextIndex = (index - 1 + snippets.length) % snippets.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = snippets.length - 1;
      }

      if (nextIndex !== index) {
        setActiveIdx(nextIndex);
        soundManager.playBlip();
        const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>("[role='tab']");
        buttons?.[nextIndex]?.focus();
      }
    },
    [snippets.length]
  );

  if (!snippets.length || !activeSnippet) {
    return null;
  }

  const lines = activeSnippet.code.split("\n");
  const evidence = EVIDENCE_LABELS[activeSnippet.evidenceType] || EVIDENCE_LABELS["adapted-example"];
  const tabId = `code-tab-${activeSnippet.id}`;
  const panelId = `code-panel-${activeSnippet.id}`;

  return (
    <div
      className={`code-inspector code-inspector--${variant}`}
      role="region"
      aria-label={`${activeSnippet.title} Code Architecture`}
    >
      {/* Tab Switcher if multiple snippets exist */}
      {snippets.length > 1 ? (
        <div className="code-inspector__tabs" role="tablist" ref={tabListRef} aria-label="Code snippets">
          {snippets.map((snip, idx) => (
            <button
              key={snip.id}
              id={`code-tab-${snip.id}`}
              type="button"
              role="tab"
              aria-selected={idx === activeIdx}
              aria-controls={`code-panel-${snip.id}`}
              tabIndex={idx === activeIdx ? 0 : -1}
              className={`code-tab-btn ${idx === activeIdx ? "code-tab-btn--active" : ""}`}
              onClick={() => {
                soundManager.playBlip();
                setActiveIdx(idx);
              }}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
            >
              {snip.title}
            </button>
          ))}
        </div>
      ) : null}

      {/* Header bar with file path, language badge, evidence badge, and copy button */}
      <div className="code-inspector__header">
        <div className="code-inspector__file-group">
          <span className="code-inspector__badge">{activeSnippet.language.toUpperCase()}</span>
          <span className={`code-evidence-badge code-evidence-badge--${evidence.classModifier}`}>
            {evidence.label}
          </span>
          <span className="code-inspector__filepath">{activeSnippet.filePath}</span>
        </div>

        <div className="code-inspector__actions">
          <span className="code-inspector__complexity" title="Algorithmic Time / Space Complexity">
            {activeSnippet.complexity}
          </span>
          <button
            type="button"
            className={`code-copy-btn ${copied ? "code-copy-btn--copied" : ""}`}
            onClick={handleCopy}
            title="Copy code snippet to clipboard"
            aria-label="Copy code to clipboard"
          >
            {copied ? "✓ Copied" : "Copy Snippet"}
          </button>
        </div>
      </div>

      {/* Description & Algorithmic Purpose */}
      <div className="code-inspector__description">
        <p>{activeSnippet.description}</p>
      </div>

      {/* Syntax Code Pre Block in tabpanel */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId}
        className="code-inspector__body"
      >
        <pre className="code-pre">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="code-line">
                <span className="code-line-number" aria-hidden="true">
                  {String(i + 1).padStart(2, " ")}
                </span>
                <span className="code-line-content">{line || " "}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
