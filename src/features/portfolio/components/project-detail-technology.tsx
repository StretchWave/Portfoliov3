import { Tag } from "@/components/ui/tag";
import type { PortfolioProject } from "@/types/portfolio";

export function ProjectDetailTechnology({ project }: { project: PortfolioProject }) {
  return (
    <section className="project-detail__section" aria-labelledby="technology-heading">
      <h2 id="technology-heading">Technical stack</h2>
      <div className="tag-list" aria-label={`${project.name} technologies`}>
        {project.technologies.map((technology) => <Tag key={technology}>{technology}</Tag>)}
      </div>
      <h3 className="project-detail__subheading">Skills demonstrated</h3>
      <ul className="clean-list">
        {project.skills.map((skill) => <li key={skill}>{skill}</li>)}
      </ul>
    </section>
  );
}
