import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { SandboxHub } from "@/features/portfolio/sandbox/sandbox-hub";

export const metadata: Metadata = {
  title: "Engineering Algorithm Sandboxes",
  description:
    "Live browser-native computational sandboxes: Biquad DSP audio frequency visualizer with Web Audio audition, 2D cellular hydrological runoff simulator, and deterministic combat action FSM parser.",
};

export default function SandboxPage() {
  return (
    <PageShell>
      <section className="section-wrap sandbox-page">
        <header className="page-header">
          <p className="eyebrow">COMPUTATIONAL TEST BENCH · ZERO EXTERNAL ASSETS</p>
          <h1>Engineering Algorithm Sandboxes</h1>
          <p className="lead">
            Live browser-native computational sandboxes demonstrating real-time DSP mathematical modeling,
            hydrological flood routing, and deterministic combat action parsers running purely on client-side TypeScript.
          </p>
        </header>

        <SandboxHub />
      </section>
    </PageShell>
  );
}
