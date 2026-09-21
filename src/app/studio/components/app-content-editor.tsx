"use client";

import { useState } from "react";
import type { AppContent, CareerDirectionContent } from "@/types/content";
import { useEditor } from "../state/editor-context";

interface AppContentEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

type SectionTab =
  | "identity"
  | "hero"
  | "about"
  | "careers"
  | "interactive"
  | "seo"
  | "social";

export function AppContentEditor({ isOpen, onClose }: AppContentEditorProps) {
  const { state, updateAppContent, saveToProject, saveStatus } = useEditor();
  const [activeTab, setActiveTab] = useState<SectionTab>("hero");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");

  const content = state.appContent;

  if (!isOpen) return null;

  const handleUpdateIdentity = (patch: Partial<AppContent["identity"]>) => {
    updateAppContent({ identity: { ...content.identity, ...patch } }, "Update Site Identity");
  };

  const handleUpdateHero = (patch: Partial<AppContent["hero"]>) => {
    updateAppContent({ hero: { ...content.hero, ...patch } }, "Update Hero Section");
  };

  const handleUpdateAbout = (patch: Partial<AppContent["about"]>) => {
    updateAppContent({ about: { ...content.about, ...patch } }, "Update About Section");
  };

  const handleUpdateInteractive = (patch: Partial<AppContent["interactiveExperience"]>) => {
    updateAppContent(
      { interactiveExperience: { ...content.interactiveExperience, ...patch } },
      "Update Interactive Landing Content",
    );
  };

  const handleUpdateSeo = (patch: Partial<AppContent["seo"]>) => {
    updateAppContent({ seo: { ...content.seo, ...patch } }, "Update SEO Metadata");
  };

  const handleUpdateSocial = (patch: Partial<AppContent["social"]>) => {
    updateAppContent({ social: { ...content.social, ...patch } }, "Update Social Links");
  };

  // About paragraphs helpers
  const handleAddParagraph = () => {
    handleUpdateAbout({
      paragraphs: [...content.about.paragraphs, "New paragraph content describing your systems methodology."],
    });
  };

  const handleEditParagraph = (index: number, text: string) => {
    const updated = [...content.about.paragraphs];
    updated[index] = text;
    handleUpdateAbout({ paragraphs: updated });
  };

  const handleDeleteParagraph = (index: number) => {
    const updated = content.about.paragraphs.filter((_, i) => i !== index);
    handleUpdateAbout({ paragraphs: updated });
  };

  const handleMoveParagraph = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= content.about.paragraphs.length) return;
    const updated = [...content.about.paragraphs];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    handleUpdateAbout({ paragraphs: updated });
  };

  // Career directions helpers
  const handleAddCareerDirection = () => {
    const newDir: CareerDirectionContent = {
      title: "New Domain Direction",
      description: "Description of the focus area, architecture, and engineering principles.",
    };
    updateAppContent(
      { careerDirections: [...content.careerDirections, newDir] },
      "Add Career Direction",
    );
  };

  const handleEditCareerDirection = (
    index: number,
    patch: Partial<CareerDirectionContent>,
  ) => {
    const updated = [...content.careerDirections];
    updated[index] = { ...updated[index], ...patch };
    updateAppContent({ careerDirections: updated }, "Edit Career Direction");
  };

  const handleDeleteCareerDirection = (index: number) => {
    const updated = content.careerDirections.filter((_, i) => i !== index);
    updateAppContent({ careerDirections: updated }, "Delete Career Direction");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs font-sans p-6">
      <div className="relative flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-3 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-sm font-bold text-cyan-400">
              📝
            </span>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
                Application Content Authoring
              </h2>
              <p className="text-[11px] text-zinc-400">
                Edits canonical source data for conventional portfolio pages, SEO, and interactive landing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={`rounded px-2.5 py-1 transition-colors ${
                  viewMode === "edit" ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Editor Only
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`rounded px-2.5 py-1 transition-colors ${
                  viewMode === "split" ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`rounded px-2.5 py-1 transition-colors ${
                  viewMode === "preview" ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Live Preview
              </button>
            </div>

            <button
              type="button"
              onClick={() => saveToProject()}
              className="rounded bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-cyan-400 transition-colors shadow-xs"
            >
              {saveStatus === "saving" ? "Saving..." : "Save to Project (Ctrl+S)"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-zinc-800/80 px-6 bg-zinc-950 text-xs font-medium">
          {[
            { id: "hero", label: "Hero & Headline" },
            { id: "about", label: "About Narrative" },
            { id: "careers", label: "Career Directions" },
            { id: "interactive", label: "Interactive Hub" },
            { id: "identity", label: "Site Identity" },
            { id: "seo", label: "SEO & OpenGraph" },
            { id: "social", label: "Social Channels" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as SectionTab)}
              className={`py-2.5 px-3.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === item.id
                  ? "border-cyan-400 text-cyan-300 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content Area: Editor + Live Preview */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor Form Column */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div
              className={`overflow-y-auto p-6 space-y-4 text-xs ${
                viewMode === "split" ? "w-1/2 border-r border-zinc-800/80" : "w-full"
              }`}
            >
              {activeTab === "hero" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-200">Hero Section</h3>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Role Eyebrow
                    </label>
                    <input
                      type="text"
                      value={content.hero.eyebrow}
                      onChange={(e) => handleUpdateHero({ eyebrow: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Primary Headline
                    </label>
                    <textarea
                      rows={2}
                      value={content.hero.headline}
                      onChange={(e) => handleUpdateHero({ headline: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Short Introduction / Lede
                    </label>
                    <textarea
                      rows={3}
                      value={content.hero.shortDescription}
                      onChange={(e) => handleUpdateHero({ shortDescription: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Primary CTA Label
                      </label>
                      <input
                        type="text"
                        value={content.hero.primaryAction.label}
                        onChange={(e) =>
                          handleUpdateHero({
                            primaryAction: { ...content.hero.primaryAction, label: e.target.value },
                          })
                        }
                        className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Secondary CTA Label
                      </label>
                      <input
                        type="text"
                        value={content.hero.secondaryAction.label}
                        onChange={(e) =>
                          handleUpdateHero({
                            secondaryAction: { ...content.hero.secondaryAction, label: e.target.value },
                          })
                        }
                        className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-200">About Narrative</h3>
                    <button
                      type="button"
                      onClick={handleAddParagraph}
                      className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                    >
                      + Add Paragraph
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={content.about.title}
                      onChange={(e) => handleUpdateAbout({ title: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    {content.about.paragraphs.map((p, idx) => (
                      <div
                        key={`about-p-${idx}`}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-400">
                            Paragraph #{idx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveParagraph(idx, "up")}
                              disabled={idx === 0}
                              className="rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-white disabled:opacity-30"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveParagraph(idx, "down")}
                              disabled={idx === content.about.paragraphs.length - 1}
                              className="rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-white disabled:opacity-30"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteParagraph(idx)}
                              className="text-[10px] text-rose-400 hover:text-rose-300 ml-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <textarea
                          rows={3}
                          value={p}
                          onChange={(e) => handleEditParagraph(idx, e.target.value)}
                          className="w-full rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-zinc-200 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "careers" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-200">Career Directions</h3>
                    <button
                      type="button"
                      onClick={handleAddCareerDirection}
                      className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                    >
                      + Add Direction
                    </button>
                  </div>

                  <div className="space-y-3">
                    {content.careerDirections.map((dir, idx) => (
                      <div
                        key={`dir-${idx}`}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-400">
                            Direction #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCareerDirection(idx)}
                            className="text-[10px] text-rose-400 hover:text-rose-300"
                          >
                            Delete
                          </button>
                        </div>
                        <input
                          type="text"
                          value={dir.title}
                          onChange={(e) => handleEditCareerDirection(idx, { title: e.target.value })}
                          placeholder="Direction Title"
                          className="w-full rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 font-medium focus:border-cyan-500 focus:outline-none"
                        />
                        <textarea
                          rows={2}
                          value={dir.description}
                          onChange={(e) =>
                            handleEditCareerDirection(idx, { description: e.target.value })
                          }
                          placeholder="Detailed engineering methodology and platform description..."
                          className="w-full rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-zinc-200 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "interactive" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-200">Interactive 3D Landing</h3>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Experience Title
                    </label>
                    <input
                      type="text"
                      value={content.interactiveExperience.title}
                      onChange={(e) => handleUpdateInteractive({ title: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Supporting Description
                    </label>
                    <textarea
                      rows={3}
                      value={content.interactiveExperience.description}
                      onChange={(e) => handleUpdateInteractive({ description: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Launch Button Label
                    </label>
                    <input
                      type="text"
                      value={content.interactiveExperience.launchLabel}
                      onChange={(e) => handleUpdateInteractive({ launchLabel: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "identity" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-200">Site Identity</h3>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={content.identity.author}
                      onChange={(e) => handleUpdateIdentity({ author: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Site Brand Name
                    </label>
                    <input
                      type="text"
                      value={content.identity.siteName}
                      onChange={(e) => handleUpdateIdentity({ siteName: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Browser Tab Default Title
                    </label>
                    <input
                      type="text"
                      value={content.identity.browserTitle}
                      onChange={(e) => handleUpdateIdentity({ browserTitle: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-200">SEO & Metadata</h3>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={2}
                      value={content.seo.description}
                      onChange={(e) => handleUpdateSeo({ description: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      OpenGraph Social Preview Title
                    </label>
                    <input
                      type="text"
                      value={content.seo.openGraphTitle}
                      onChange={(e) => handleUpdateSeo({ openGraphTitle: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      OpenGraph Social Preview Description
                    </label>
                    <textarea
                      rows={2}
                      value={content.seo.openGraphDescription}
                      onChange={(e) => handleUpdateSeo({ openGraphDescription: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "social" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-200">Social Channels</h3>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={content.social.github}
                      onChange={(e) => handleUpdateSocial({ github: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      LinkedIn URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={content.social.linkedin ?? ""}
                      onChange={(e) => handleUpdateSocial({ linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={content.social.email ?? ""}
                      onChange={(e) => handleUpdateSocial({ email: e.target.value })}
                      placeholder="contact@..."
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Preview Column */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div
              className={`overflow-y-auto bg-zinc-900/40 p-8 select-text ${
                viewMode === "split" ? "w-1/2" : "w-full"
              }`}
            >
              <div className="max-w-xl mx-auto space-y-8">
                {/* Live Hero Card Preview */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-3">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
                    {content.hero.eyebrow}
                  </p>
                  <h1 className="text-xl font-bold tracking-tight text-white leading-snug">
                    {content.identity.author}.<br />
                    <span className="text-zinc-400 italic font-serif">
                      {content.hero.headline}
                    </span>
                  </h1>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {content.hero.shortDescription}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="rounded bg-cyan-500 px-3 py-1 text-xs font-semibold text-zinc-950">
                      {content.hero.primaryAction.label} →
                    </span>
                    <span className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
                      {content.hero.secondaryAction.label}
                    </span>
                  </div>
                </div>

                {/* Live Career Directions Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Career Directions Preview
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {content.careerDirections.map((dir, i) => (
                      <div
                        key={`preview-dir-${i}`}
                        className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3.5 space-y-1"
                      >
                        <h4 className="text-xs font-semibold text-cyan-300">{dir.title}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {dir.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Card Preview */}
                <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-500">
                    OpenGraph Social Card Simulation
                  </span>
                  <div className="rounded border border-zinc-800 bg-zinc-900 p-3 space-y-1">
                    <p className="text-xs font-bold text-white">{content.seo.openGraphTitle}</p>
                    <p className="text-[11px] text-zinc-400">{content.seo.openGraphDescription}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
