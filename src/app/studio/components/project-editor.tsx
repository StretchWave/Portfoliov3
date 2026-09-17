"use client";

import { useMemo, useState } from "react";
import { getAllProjects } from "@/features/portfolio/project-registry";
import type { PortfolioProject } from "@/types/portfolio";
import { useEditor } from "../state/editor-context";

export function ProjectEditor() {
  const projects = useMemo(() => getAllProjects(), []);
  const [selectedSlug, setSelectedSlug] = useState<string>(projects[0]?.slug ?? "");
  const { setActiveArea } = useEditor();

  const currentProject = useMemo<PortfolioProject | undefined>(
    () => projects.find((p) => p.slug === selectedSlug),
    [projects, selectedSlug],
  );

  return (
    <div className="flex h-full w-full flex-col bg-transparent select-none overflow-hidden">
      <div className="border-b border-zinc-800/80 p-3 bg-zinc-900/40">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 block">
          Project Content & Exhibits
        </span>
        <select
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className="w-full rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
        >
          {projects.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name} ({p.exhibit?.area ?? "No 3D Exhibit"})
            </option>
          ))}
        </select>
      </div>

      {currentProject && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-mono">
          <section className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Project Details
            </span>
            <div className="rounded border border-slate-800 bg-slate-900/60 p-2.5 space-y-2">
              <div>
                <span className="text-slate-500 text-[10px] block">Name</span>
                <span className="text-slate-200 font-sans font-semibold">{currentProject.name}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Summary</span>
                <span className="text-slate-300 font-sans">{currentProject.summary}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Category:</span>
                <span className="text-slate-300">{currentProject.category}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Priority:</span>
                <span className="text-slate-300">{currentProject.priority}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400">{currentProject.status}</span>
              </div>
            </div>
          </section>

          {/* 3D Exhibit Plinth Placement */}
          <section className="space-y-2 border-t border-slate-800 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              3D Exhibit Configuration
            </span>
            {currentProject.exhibit ? (
              <div className="rounded border border-cyan-900/40 bg-slate-900/60 p-2.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Area:</span>
                  <button
                    type="button"
                    onClick={() => setActiveArea(currentProject.exhibit!.area)}
                    className="rounded bg-cyan-950 px-2 py-0.5 text-cyan-300 hover:bg-cyan-900 text-[11px]"
                    title="Switch editor view to this area"
                  >
                    {currentProject.exhibit.area} ↗
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Presentation:</span>
                  <span className="text-slate-200">{currentProject.exhibit.presentation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Accent:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-3 w-3 rounded-full border border-slate-700"
                      style={{ backgroundColor: currentProject.exhibit.accent }}
                    />
                    <span className="text-slate-200">{currentProject.exhibit.accent}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block mb-1">Plinth Position:</span>
                  <div className="rounded bg-slate-950 p-1.5 text-center text-cyan-300">
                    [{currentProject.exhibit.position.join(", ")}]
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded border border-slate-800 bg-slate-900/40 p-3 text-center text-slate-500">
                This project does not have a 3D exhibit registered.
              </div>
            )}
          </section>

          {/* Stack & Technologies */}
          <section className="space-y-1.5 border-t border-slate-800 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Technologies ({currentProject.technologies.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {currentProject.technologies.map((t) => (
                <span
                  key={t}
                  className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
