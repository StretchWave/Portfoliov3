"use client";

import { useEffect, useRef, useState } from "react";
import { getDefaultAtlasScene } from "@/data/scenes";
import { validateScene } from "@/lib/scene-validation";
import type { AtlasSceneDefinition } from "@/types/scene";
import { useEditor } from "../state/editor-context";

interface ImportExportDialogProps {
  onClose: () => void;
}

export function ImportExportDialog({ onClose }: ImportExportDialogProps) {
  const { state, loadScene, markSaved } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleExportJSON = () => {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(state.scene, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `atlas-scene-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setSuccessMsg("Scene JSON exported successfully as portable snapshot (project source is unchanged).");
    } catch (e) {
      setErrorMsg("Failed to export scene JSON: " + String(e));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as AtlasSceneDefinition;

        const validation = validateScene(parsed);
        const fatalErrors = validation.errors.filter((err) => err.severity === "error");

        if (fatalErrors.length > 0) {
          setErrorMsg(
            `Import failed with ${fatalErrors.length} validation error(s): ${fatalErrors[0].message}`,
          );
          return;
        }

        loadScene(parsed);
        setSuccessMsg("Scene successfully loaded from JSON file.");
      } catch (err) {
        setErrorMsg("Failed to parse JSON file: " + String(err));
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    if (window.confirm("Are you sure you want to reset all scenes to canonical defaults? All unsaved edits will be lost.")) {
      loadScene(getDefaultAtlasScene());
      setSuccessMsg("Reset to canonical default scene.");
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">📦</span>
            <div>
              <h3 id="dialog-title" className="font-semibold text-zinc-100 text-sm">
                Export / Import Scene JSON
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">Portable External Snapshots</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs transition-colors"
            title="Close dialog (Escape)"
          >
            ✕
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="rounded border border-rose-900/50 bg-rose-950/30 p-2.5 text-xs text-rose-300 font-mono">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded border border-emerald-900/50 bg-emerald-950/30 p-2.5 text-xs text-emerald-300 font-mono">
            {successMsg}
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Section: Export */}
          <div className="space-y-1.5">
            <span className="font-semibold text-zinc-200 block">
              Export Scene
            </span>
            <p className="text-[11px] text-zinc-400">
              Download the current multi-district scene document as a structured JSON snapshot.
            </p>
            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full rounded border border-cyan-500/40 bg-cyan-600/20 hover:bg-cyan-600/30 hover:border-cyan-400 py-2 text-xs font-semibold text-cyan-300 transition-colors cursor-pointer"
            >
              Export JSON File
            </button>
          </div>

          {/* Section: Import */}
          <div className="border-t border-zinc-800/80 pt-3 space-y-1.5">
            <span className="font-semibold text-zinc-200 block">
              Import Scene
            </span>
            <p className="text-[11px] text-zinc-400">
              Load a previously exported scene JSON file with schema validation.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700/80 py-2 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
            >
              Choose JSON File to Load
            </button>
          </div>

          {/* Section: Danger Zone */}
          <div className="border-t border-zinc-800/80 pt-3 space-y-1.5">
            <span className="font-semibold text-rose-400 block text-[11px] uppercase tracking-wider">
              Danger Zone
            </span>
            <p className="text-[11px] text-zinc-500">
              Reset all districts and environment configurations to canonical repository defaults.
            </p>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="w-full rounded border border-rose-900/40 bg-rose-950/20 hover:bg-rose-900/30 py-1.5 text-xs text-rose-400 transition-colors cursor-pointer"
            >
              Reset to Canonical Defaults
            </button>
          </div>
        </div>

        <div className="border-t border-zinc-800/80 pt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-zinc-800 bg-zinc-800/80 px-4 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
