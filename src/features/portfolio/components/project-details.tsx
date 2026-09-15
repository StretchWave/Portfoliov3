import type { PortfolioProject } from "@/types/portfolio";

import { ProjectDetailArchitecture } from "./project-detail-architecture";
import { ProjectDetailFeatures } from "./project-detail-features";
import { ProjectDetailHero } from "./project-detail-hero";
import { ProjectDetailLinks } from "./project-detail-links";
import { ProjectDetailOverview } from "./project-detail-overview";
import { ProjectDetailRelated } from "./project-detail-related";
import { ProjectDetailSkills } from "./project-detail-skills";
import { ProjectDetailTechnology } from "./project-detail-technology";
import { ProjectInteractiveCta } from "./project-interactive-cta";

import Link from "next/link";

export function ProjectDetails({ project }: { project: PortfolioProject }) {
  return (
    <article className="project-detail">
      <ProjectDetailHero project={project} />
      <ProjectDetailOverview project={project} />
      <ProjectDetailFeatures caseStudy={project.caseStudy} />
      <ProjectDetailTechnology project={project} />
      <ProjectDetailSkills project={project} />
      <ProjectDetailArchitecture project={project} />
      <ProjectDetailLinks project={project} />
      <ProjectDetailRelated project={project} />
      <ProjectInteractiveCta project={project} />
      <Link className="text-link project-detail__back-link" href="/projects">← All projects</Link>
    </article>
  );
}
