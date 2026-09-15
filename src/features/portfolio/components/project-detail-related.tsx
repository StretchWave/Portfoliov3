import Link from "next/link";

import { getRelatedProjects } from "@/features/portfolio/project-registry";
import type { PortfolioProject } from "@/types/portfolio";

/** Verified relationships only; records without relatedProjectIds render nothing. */
export function ProjectDetailRelated({ project }: { project: PortfolioProject }) {
  const related = getRelatedProjects(project.id);
  if (related.length === 0) return null;

  return (
    <section className="project-detail__section" aria-labelledby="related-heading">
      <h2 id="related-heading">Related projects</h2>
      <ul className="project-link-list">
        {related.map((relatedProject) => (
          <li key={relatedProject.id}>
            <Link className="text-link" href={`/projects/${relatedProject.slug}`}>
              {relatedProject.name} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}