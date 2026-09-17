"use client";

import { useMemo } from "react";
import { validateScene } from "@/lib/scene-validation";
import type { WorldAreaId } from "@/types/portfolio";
import { useEditor } from "../state/editor-context";

export function ValidationPanel() {
  const { state, selectObject, setActiveArea, setActivePanel } = useEditor();

  const validationResult = useMemo(() => {
    return validateScene(state.scene);
  }, [state.scene]);

  const errors = useMemo(
    () => validationResult.errors.filter((e) => e.severity === "error"),
    [validationResult],
  );
  const warnings = useMemo(
    () => validationResult.errors.filter((e) => e.severity === "warning"),
    [validationResult],
  );

  const handleNavigateToIssue = (areaId?: string, objectId?: string) => {
    if (areaId) {
      setActiveArea(areaId as WorldAreaId);
    }
    if (objectId) {
      selectObject(objectId);
      setActivePanel("inspector");
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-transparent select-none overflow-hidden">
      <div className="border-b border-zinc-800/80 p-3 bg-zinc-900/40">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Scene Health & Integrity
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Status Banner */}
        <div
          className={`rounded border p-3 text-xs ${
            errors.length > 0
              ? "border-rose-900/50 bg-rose-950/20 text-rose-300"
              : warnings.length > 0
              ? "border-amber-900/50 bg-amber-950/20 text-amber-300"
              : "border-emerald-900/50 bg-emerald-950/20 text-emerald-300"
          }`}
        >
          <div className="font-semibold mb-1">
            {errors.length > 0
              ? `❌ ${errors.length} Critical Issue${errors.length > 1 ? "s" : ""}`
              : warnings.length > 0
              ? `⚠️ ${warnings.length} Advisory Warning${warnings.length > 1 ? "s" : ""}`
              : "✔ All Scene Invariants Passed"}
          </div>
          <p className="text-[11px] opacity-80">
            {errors.length > 0
              ? "Critical issues prevent production deployment and will cause runtime errors."
              : warnings.length > 0
              ? "The scene is valid, but some performance budgets or guidelines are exceeded."
              : "Zero duplicate IDs, all bounds valid, all portal references resolve correctly."}
          </p>
        </div>

        {/* Errors list */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Errors ({errors.length})
            </span>
            <div className="space-y-1.5">
              {errors.map((err, idx) => (
                <div
                  key={idx}
                  onClick={() => handleNavigateToIssue(err.areaId, err.objectId)}
                  className="rounded border border-rose-950 bg-slate-900 p-2 text-xs cursor-pointer hover:border-rose-800 transition"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-rose-400 mb-1">
                    <span>{err.code}</span>
                    {err.areaId && <span>{err.areaId}</span>}
                  </div>
                  <div className="text-slate-200">{err.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings list */}
        {warnings.length > 0 && (
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Warnings ({warnings.length})
            </span>
            <div className="space-y-1.5">
              {warnings.map((warn, idx) => (
                <div
                  key={idx}
                  onClick={() => handleNavigateToIssue(warn.areaId, warn.objectId)}
                  className="rounded border border-amber-950 bg-slate-900 p-2 text-xs cursor-pointer hover:border-amber-800 transition"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 mb-1">
                    <span>{warn.code}</span>
                    {warn.areaId && <span>{warn.areaId}</span>}
                  </div>
                  <div className="text-slate-200">{warn.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
