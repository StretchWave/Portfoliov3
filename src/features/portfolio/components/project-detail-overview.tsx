import type { PortfolioProject } from "@/types/portfolio";

export function ProjectDetailOverview({ project }: { project: PortfolioProject }) {
  return (
    <>
      <section className="project-detail__section" aria-labelledby="what-it-is-heading">
        <h2 id="what-it-is-heading">What it is</h2>
        <p>{project.description}</p>
      </section>
      {project.caseStudy ? (
        <div className="project-detail__narrative">
          <section className="project-detail__section" aria-labelledby="problem-heading">
            <h2 id="problem-heading">Problem / motivation</h2>
            <p>{project.caseStudy.problem}</p>
          </section>
          <section className="project-detail__section" aria-labelledby="solution-heading">
            <h2 id="solution-heading">Solution</h2>
            <p>{project.caseStudy.solution}</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
