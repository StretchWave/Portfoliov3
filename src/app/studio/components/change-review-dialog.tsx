"use client";

import { useMemo, useEffect } from "react";
import type { AtlasSceneDefinition, SceneObject } from "@/types/scene";

const AREA_LABELS: Record<string, string> = {
  "atlas-hub": "Atlas Central Hub",
  "software-district": "Software District",
  "intelligence-observatory": "Intelligence Observatory",
  "creative-workshop": "Creative Workshop",
};

export interface ObjectDiff {
  id: string;
  label: string;
  type: string;
  status: "added" | "removed" | "modified";
  diffs: string[];
}

export interface AreaDiffGroup {
  areaId: string;
  areaName: string;
  diffs: ObjectDiff[];
}

function compareObjects(before: SceneObject, after: SceneObject): string[] {
  const diffs: string[] = [];

  if (before.label !== after.label) {
    diffs.push(`Label: "${before.label ?? before.id}" → "${after.label ?? after.id}"`);
  }

  const bPos = before.transform.position;
  const aPos = after.transform.position;
  if (bPos[0] !== aPos[0] || bPos[1] !== aPos[1] || bPos[2] !== aPos[2]) {
    diffs.push(
      `Position: [${bPos.map((n) => n.toFixed(2)).join(", ")}] → [${aPos.map((n) => n.toFixed(2)).join(", ")}]`,
    );
  }

  const bRot = before.transform.rotation ?? [0, 0, 0];
  const aRot = after.transform.rotation ?? [0, 0, 0];
  if (bRot[0] !== aRot[0] || bRot[1] !== aRot[1] || bRot[2] !== aRot[2]) {
    diffs.push(
      `Rotation: [${bRot.map((n) => n.toFixed(2)).join(", ")}] → [${aRot.map((n) => n.toFixed(2)).join(", ")}]`,
    );
  }

  const bScale = before.transform.scale ?? [1, 1, 1];
  const aScale = after.transform.scale ?? [1, 1, 1];
  if (bScale[0] !== aScale[0] || bScale[1] !== aScale[1] || bScale[2] !== aScale[2]) {
    diffs.push(
      `Scale: [${bScale.map((n) => n.toFixed(2)).join(", ")}] → [${aScale.map((n) => n.toFixed(2)).join(", ")}]`,
    );
  }

  if (JSON.stringify(before.interaction) !== JSON.stringify(after.interaction)) {
    const bEnabled = before.interaction?.enabled ?? false;
    const aEnabled = after.interaction?.enabled ?? false;
    if (bEnabled !== aEnabled) {
      diffs.push(`Interaction: ${bEnabled ? "Enabled" : "Disabled"} → ${aEnabled ? "Enabled" : "Disabled"}`);
    } else {
      diffs.push(`Interaction configuration updated (${after.interaction?.trigger ?? "click"})`);
    }
  }

  return diffs;
}

export function computeSceneDiffs(
  savedScene: AtlasSceneDefinition,
  currentScene: AtlasSceneDefinition,
): AreaDiffGroup[] {
  const groups: AreaDiffGroup[] = [];

  for (const [areaId, currentArea] of Object.entries(currentScene.areas)) {
    if (!currentArea) continue;
    const savedArea = savedScene.areas[areaId as keyof typeof savedScene.areas];
    if (!savedArea) continue;

    const savedMap = new Map(savedArea.objects.map((o) => [o.id, o]));
    const currentMap = new Map(currentArea.objects.map((o) => [o.id, o]));

    const diffs: ObjectDiff[] = [];

    // Added or Modified
    for (const [id, currObj] of currentMap) {
      const savedObj = savedMap.get(id);
      if (!savedObj) {
        diffs.push({
          id,
          label: currObj.label ?? id,
          type: currObj.type,
          status: "added",
          diffs: [
            `Position: [${currObj.transform.position.map((n) => n.toFixed(2)).join(", ")}]`,
            `Type: ${currObj.type}`,
          ],
        });
      } else {
        const fieldDiffs = compareObjects(savedObj, currObj);
        if (fieldDiffs.length > 0) {
          diffs.push({
            id,
            label: currObj.label ?? id,
            type: currObj.type,
            status: "modified",
            diffs: fieldDiffs,
          });
        }
      }
    }

    // Removed
    for (const [id, savedObj] of savedMap) {
      if (!currentMap.has(id)) {
        diffs.push({
          id,
          label: savedObj.label ?? id,
          type: savedObj.type,
          status: "removed",
          diffs: [`Deleted from ${AREA_LABELS[areaId as keyof typeof AREA_LABELS] ?? areaId}`],
        });
      }
    }

    if (diffs.length > 0) {
      groups.push({
        areaId,
        areaName: AREA_LABELS[areaId as keyof typeof AREA_LABELS] ?? currentArea.metadata.name ?? areaId,
        diffs,
      });
    }
  }

  return groups;
}

interface ChangeReviewDialogProps {
  savedScene: AtlasSceneDefinition;
  currentScene: AtlasSceneDefinition;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  errorMessage?: string | null;
  onForceSave?: () => void;
}

export function ChangeReviewDialog({
  savedScene,
  currentScene,
  onClose,
  onSave,
  isSaving,
  errorMessage,
  onForceSave,
}: ChangeReviewDialogProps) {
  const diffGroups = useMemo(
    () => computeSceneDiffs(savedScene, currentScene),
    [savedScene, currentScene],
  );

  const totalChanges = useMemo(
    () => diffGroups.reduce((acc, g) => acc + g.diffs.length, 0),
    [diffGroups],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
        aria-labelledby="changes-dialog-title"
        className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl space-y-4 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">📝</span>
            <div>
              <h2 id="changes-dialog-title" className="text-sm font-semibold text-zinc-100">
                Review Unsaved Changes
              </h2>
              <p className="text-[11px] text-zinc-400">
                {totalChanges === 0
                  ? "No modifications detected against saved project source."
                  : `${totalChanges} object change(s) ready to persist to project source files.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Error Banner if save failed or conflicted */}
        {errorMessage && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-start justify-between gap-3 shrink-0">
            <div className="space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-rose-200">
                <span>⚠️</span>
                <span>Save Issue Detected</span>
              </div>
              <p className="text-rose-300/90 text-[11px]">{errorMessage}</p>
            </div>
            {onForceSave && (
              <button
                type="button"
                disabled={isSaving}
                onClick={onForceSave}
                className="shrink-0 rounded bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-500 transition-colors cursor-pointer"
              >
                Force Overwrite
              </button>
            )}
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {totalChanges === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
              <span className="text-2xl mb-2">✨</span>
              <p className="text-xs">All scene objects are in sync with canonical source files.</p>
            </div>
          ) : (
            diffGroups.map((group) => (
              <div key={group.areaId} className="space-y-2">
                <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-1">
                  <span className="text-xs font-mono font-semibold text-cyan-400">
                    {group.areaName}
                  </span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-400 font-mono">
                    {group.diffs.length} change(s)
                  </span>
                </div>

                <div className="space-y-2 pl-2">
                  {group.diffs.map((diff) => (
                    <div
                      key={diff.id}
                      className="rounded border border-zinc-800/70 bg-zinc-950/60 p-2 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.2 text-[10px] font-mono rounded font-semibold uppercase ${
                              diff.status === "added"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : diff.status === "removed"
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {diff.status}
                          </span>
                          <span className="font-medium text-zinc-200">{diff.label}</span>
                          <span className="text-[11px] text-zinc-500 font-mono">({diff.type})</span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">{diff.id}</span>
                      </div>

                      <ul className="pl-4 space-y-0.5 text-[11px] text-zinc-400 font-mono list-disc">
                        {diff.diffs.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            disabled={totalChanges === 0 || isSaving}
            onClick={onSave}
            className="flex items-center gap-1.5 rounded bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-40 transition-colors cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                <span>Saving to Project Source...</span>
              </>
            ) : (
              <>
                <span>Save to Project Source</span>
                <span className="font-mono text-[10px] opacity-70">(Ctrl+S)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
