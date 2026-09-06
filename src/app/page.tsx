import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { ProjectCard } from "@/features/portfolio/components/project-card";
import { getFeaturedProjects } from "@/features/portfolio/project-registry";

export default function HomePage() {
  const featuredProjects = getFeaturedProjects();

  return (
    <PageShell>
      <section className="hero section-wrap">
        <p className="eyebrow">Computer Engineering · systems & interactive worlds</p>
        <h1>I build systems.<br /><em>Sometimes they become worlds.</em></h1>
        <p className="lede hero__copy">
          Project Atlas is a portfolio for software, intelligent systems, and interactive work—built to make the thinking behind each project easy to explore.
        </p>
        <div className="button-row">
          <Link className="button button--primary" href="/interactive">Explore the 3D hub <span aria-hidden="true">→</span></Link>
          <Link className="button button--quiet" href="/projects">Browse projects</Link>
        </div>
      </section>

      <section className="section-wrap section-grid" aria-labelledby="approach-heading">
        <div>
          <p className="eyebrow">The approach</p>
          <h2 id="approach-heading">A portfolio with two useful ways in.</h2>
        </div>
        <div className="copy-stack">
          <p>Use the conventional site to scan projects, technologies, and technical context quickly. Enter the interactive hub when you want a more spatial, exploratory view.</p>
          <p>The 3D experience is optional by design. The portfolio remains practical, accessible, and readable without it.</p>
        </div>
      </section>

      <section className="section-wrap featured-section" aria-labelledby="featured-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 id="featured-heading">Systems worth opening up.</h2>
          </div>
          <Link className="text-link" href="/projects">All projects →</Link>
        </div>
        <div className="project-grid">
          {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </section>
    </PageShell>
  );
}
