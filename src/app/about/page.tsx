import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <PageShell>
      <article className="article-page section-wrap">
        <p className="eyebrow">About Atlas</p>
        <h1>Systems are the medium.</h1>
        <p className="lede">This portfolio is designed around the overlap between engineering discipline, intelligent systems, and interactive experience.</p>
        <div className="copy-stack article-copy">
          <p>The work represented here ranges from desktop software and decision-support concepts to future game systems. The through-line is not a single technology; it is the intent to build clear, capable systems that people can use and explore.</p>
          <p>Atlas treats the 3D hub as an immersive extension of that story, not a replacement for a useful portfolio. Conventional pages remain the fastest route to project information and are available without WebGL.</p>
        </div>
      </article>
    </PageShell>
  );
}
