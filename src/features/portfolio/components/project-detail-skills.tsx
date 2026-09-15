import Link from "next/link";

import { getSkillsForProject } from "@/data/skills";
import type { PortfolioProject } from "@/types/portfolio";

/** Links the project back to the evidence-based skill registry. */
export function ProjectDetailSkills({ project }: { project: PortfolioProject }) {
  const skills = getSkillsForProject(project.id);
  if (skills.length === 0) return null;

  return (
    <section className="project-detail__section" aria-labelledby="skills-evidence-heading">
      <h2 id="skills-evidence-heading">Skills this project demonstrates</h2>
      <ul className="evidence-skill-list">
        {skills.map((skill) => (
          <li key={skill.id}>
            <Link className="text-link" href="/skills">{skill.name} →</Link>
            <span>{skill.evidence}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}