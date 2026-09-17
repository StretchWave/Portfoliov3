"use client";

import type { RecoverySnapshot } from "../persistence/local-recovery";

interface RecoveryPromptDialogProps {
  snapshot: RecoverySnapshot;
  onRestore: () => void;
  onDiscard: () => void;
}

export function RecoveryPromptDialog({
  snapshot,
  onRestore,
  onDiscard,
}: RecoveryPromptDialogProps) {
  const formattedTime = new Date(snapshot.timestamp).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recovery-title"
        className="w-full max-w-md rounded-xl border border-amber-500/40 bg-zinc-900 p-5 shadow-2xl space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-lg">
            ⚠️
          </div>
          <div>
            <h2 id="recovery-title" className="text-sm font-semibold text-zinc-100">
              Unsaved Session Recovered
            </h2>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              Atlas Studio found an unsaved editing session from{" "}
              <strong className="text-zinc-200">{formattedTime}</strong> (revision {snapshot.revision}).
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-300 space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-zinc-500">Active Area:</span>
            <span className="text-cyan-400">{snapshot.activeAreaId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Objects in buffer:</span>
            <span>{snapshot.scene.areas[snapshot.activeAreaId]?.objects.length ?? 0}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onDiscard}
            className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={onRestore}
            className="rounded bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition-colors"
          >
            Restore Session
          </button>
        </div>
      </div>
    </div>
  );
}
