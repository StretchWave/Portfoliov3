import type { PortfolioProject } from "@/types/portfolio";
import { PROJECT_CODE_SNIPPETS } from "../code/code-snippets-data";
import { ProjectCodeInspector } from "./project-code-inspector";

export function ProjectDetailCode({ project }: { project: PortfolioProject }) {
  const snippets = PROJECT_CODE_SNIPPETS[project.id];
  if (!snippets || !snippets.length) return null;

  return (
    <section className="project-detail__section" aria-labelledby="code-abstractions-heading">
      <h2 id="code-abstractions-heading">Core Abstractions & Code Architecture</h2>
      <p>
        Verified implementation and architecture excerpt highlighting key algorithmic boundaries, data structures, and failure-mode mitigations.
      </p>
      <ProjectCodeInspector projectId={project.id} variant="full" />
    </section>
  );
}
