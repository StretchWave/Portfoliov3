"use client";

import { useState, useCallback } from "react";
import { soundManager } from "@/lib/audio-synthesizer";
import { PROJECT_CODE_SNIPPETS, type CodeSnippetItem } from "../code/code-snippets-data";

export interface ProjectCodeInspectorProps {
  projectId: string;
  variant?: "full" | "embedded" | "terminal";
}

export function ProjectCodeInspector({ projectId, variant = "full" }: ProjectCodeInspectorProps) {
  const snippets = PROJECT_CODE_SNIPPETS[projectId] || [];
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeSnippet: CodeSnippetItem | undefined = snippets[activeIdx];

  const handleCopy = useCallback(() => {
    if (!activeSnippet) return;
    soundManager.playTactileClick();
    navigator.clipboard.writeText(activeSnippet.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }).catch(() => {});
  }, [activeSnippet]);

  if (!snippets.length || !activeSnippet) {
    return null;
  }

  const lines = activeSnippet.code.split("\n");

  return (
    <div
      className={`code-inspector code-inspector--${variant}`}
      role="region"
      aria-label={`${activeSnippet.title} Code Architecture`}
    >
      {/* Tab Switcher if multiple snippets exist */}
      {snippets.length > 1 ? (
        <div className="code-inspector__tabs" role="tablist">
          {snippets.map((snip, idx) => (
            <button
              key={snip.id}
              type="button"
              role="tab"
              aria-selected={idx === activeIdx}
              className={`code-tab-btn ${idx === activeIdx ? "code-tab-btn--active" : ""}`}
              onClick={() => {
                soundManager.playBlip();
                setActiveIdx(idx);
              }}
            >
              {snip.title}
            </button>
          ))}
        </div>
      ) : null}

      {/* Header bar with file path, language badge, and copy button */}
      <div className="code-inspector__header">
        <div className="code-inspector__file-group">
          <span className="code-inspector__badge">{activeSnippet.language.toUpperCase()}</span>
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

      {/* Syntax Code Pre Block */}
      <div className="code-inspector__body">
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
