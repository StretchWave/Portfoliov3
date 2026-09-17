"use client";

import dynamic from "next/dynamic";

const StudioApp = dynamic(() => import("./studio-app"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        <span>Initializing Atlas Studio Workspace...</span>
      </div>
    </div>
  ),
});

export default function StudioPage() {
  return <StudioApp />;
}
