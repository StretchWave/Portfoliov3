import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { ProjectFilter } from "@/features/portfolio/components/project-filter";
import { getAllProjects } from "@/features/portfolio/project-registry";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  const projects = getAllProjects();
  const flagshipCount = projects.filter((project) => project.priority === "flagship").length;

  return (
    <PageShell>
      <section className="section-wrap projects-page">
        <p className="eyebrow">Portfolio registry</p>
        <h1>Projects</h1>
        <p className="lede">
          A verified catalog of {projects.length} projects across software, intelligent systems, and interactive
          work — {flagshipCount} flagships, supporting tools, experiments, and one design concept. Flagship and
          featured projects carry the portfolio; the rest show the full range of experimentation.
        </p>
        <ProjectFilter projects={projects} />
      </section>
    </PageShell>
  );
}