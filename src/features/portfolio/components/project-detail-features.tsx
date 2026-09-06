import type { ProjectCaseStudy } from "@/types/portfolio";

export function ProjectDetailFeatures({ caseStudy }: { caseStudy: ProjectCaseStudy | undefined }) {
  if (!caseStudy) return null;

  return (
    <section className="project-detail__section" aria-labelledby="features-heading">
      <h2 id="features-heading">Key features</h2>
      <ul className="case-study-grid">
        {caseStudy.features.map((feature) => (
          <li key={feature.title} className="case-study-card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
