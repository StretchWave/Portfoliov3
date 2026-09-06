import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { ProjectCard } from "@/features/portfolio/components/project-card";
import { getAllProjects } from "@/features/portfolio/project-registry";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <PageShell>
      <section className="section-wrap projects-page">
        <p className="eyebrow">Portfolio registry</p>
        <h1>Projects</h1>
        <p className="lede">A data-driven collection of current software, intelligent-systems, and interactive work.</p>
        <div className="project-grid project-grid--full">
          {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </section>
    </PageShell>
  );
}
