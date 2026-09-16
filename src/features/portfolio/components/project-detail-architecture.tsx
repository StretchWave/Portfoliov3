import type { PortfolioProject } from "@/types/portfolio";
import { ArchitecturalPipelineDiagram } from "./architectural-pipeline-diagram";

export function ProjectDetailArchitecture({ project }: { project: PortfolioProject }) {
  if (!project.architecture) return null;

  const decisions = project.caseStudy?.engineeringDecisions;

  return (
    <section className="project-detail__section" aria-labelledby="architecture-heading">
      <h2 id="architecture-heading">Technical architecture</h2>
      <p>{project.architecture.overview}</p>
      <ArchitecturalPipelineDiagram
        projectName={project.name}
        overview={project.architecture.overview}
        layers={project.architecture.layers}
      />
      {decisions?.length ? (
        <div className="project-detail__decisions" aria-labelledby="decisions-heading">
          <h3 id="decisions-heading">Interesting engineering decisions</h3>
          <ul className="case-study-grid case-study-grid--decisions">
            {decisions.map((decision) => (
              <li key={decision.title} className="case-study-card">
                <h4>{decision.title}</h4>
                <p>{decision.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
