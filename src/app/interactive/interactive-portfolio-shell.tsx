"use client";

import Link from "next/link";
import { useState } from "react";
import type { ComponentType } from "react";

type InteractiveExperienceComponent = ComponentType<{ onExit: () => void }>;

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function InteractivePortfolioShell() {
  const [experience, setExperience] = useState<InteractiveExperienceComponent | null>(null);
  const [launchState, setLaunchState] = useState<"ready" | "loading" | "unsupported" | "failed">("ready");

  async function launchExperience() {
    if (!supportsWebGL()) {
      setLaunchState("unsupported");
      return;
    }

    setLaunchState("loading");
    try {
      // This import is deliberately event-triggered: normal portfolio browsing
      // never asks the browser to fetch Three.js or the interactive world.
      const module = await import("@/three/experience/interactive-experience");
      setExperience(() => module.InteractiveExperience);
    } catch {
      setLaunchState("failed");
    }
  }

  if (experience) {
    const Experience = experience;
    return <Experience onExit={() => { setExperience(null); setLaunchState("ready"); }} />;
  }

  const unavailable = launchState === "unsupported" || launchState === "failed";

  return (
    <main className="interactive-entry">
      <section className="interactive-entry__content">
        <p className="eyebrow">Optional interactive portfolio</p>
        <h1>Enter the reference hub.</h1>
        <p className="lede">A compact WebGL exhibition hall — the Atlas reference environment — that proves the project, exhibit, player, and interaction architecture. Drag the scene to look, then click an exhibit or move near it and press <kbd>E</kbd>.</p>
        <div className="button-row">
          <button className="button button--primary" type="button" onClick={launchExperience} disabled={launchState === "loading"}>
            {launchState === "loading" ? "Loading 3D hub…" : "Launch 3D hub"} <span aria-hidden="true">→</span>
          </button>
          <Link className="button button--quiet" href="/projects">Browse without 3D</Link>
        </div>
        {unavailable ? (
          <p className="callout" role="status">
            {launchState === "unsupported" ? "WebGL is unavailable in this browser or device. " : "The interactive chunk did not load. "}
            You can still access every project from the standard portfolio.
          </p>
        ) : null}
      </section>
      <aside className="interactive-entry__notes" aria-label="Interactive hub details">
        <div><span>01</span><p>Atlas reference hub</p></div>
        <div><span>02</span><p>Keyboard exploration</p></div>
        <div><span>03</span><p>Data-driven exhibits</p></div>
      </aside>
    </main>
  );
}
