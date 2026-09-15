import Link from "next/link";

import type { PortfolioProject } from "@/types/portfolio";

export function ProjectInteractiveCta({ project }: { project: PortfolioProject }) {
  if (!project.exhibit) return null;

  return (
    <section className="project-interactive-cta" aria-labelledby="interactive-experience-heading">
      <div>
        <p className="eyebrow">Interactive experience</p>
        <h2 id="interactive-experience-heading">See {project.name} in the reference hub.</h2>
        <p>The optional 3D exhibition hall includes a data-driven exhibit for this project. The conventional case study remains the complete non-WebGL path.</p>
      </div>
      <Link className="button button--primary" href="/interactive">Open interactive hub <span aria-hidden="true">→</span></Link>
    </section>
  );
}
