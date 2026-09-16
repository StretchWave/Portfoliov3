import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { getSkillsByCategory } from "@/data/skills";
import { getProjectById } from "@/features/portfolio/project-registry";
import type { SkillCategory } from "@/types/portfolio";
import { DiscoveryTracker } from "@/features/portfolio/journal/discovery-tracker";

import { SkillsMatrixExplorer } from "@/features/portfolio/components/skills-matrix-explorer";

export const metadata: Metadata = { title: "Skills" };

const categoryOrder: readonly SkillCategory[] = [
  "languages",
  "frameworks",
  "game-development",
  "web",
  "ai-ml",
  "data",
  "cloud",
  "tools",
  "interactive",
];

const categoryLabels: Record<SkillCategory, string> = {
  languages: "Languages",
  frameworks: "Frameworks & Libraries",
  "game-development": "Game Development",
  web: "Web",
  "ai-ml": "AI / ML",
  data: "Data",
  cloud: "Cloud",
  tools: "Tools & Practice",
  design: "Design",
  interactive: "Interactive & Creative Technology",
};

export default function SkillsPage() {
  const skillsByCategory = getSkillsByCategory();

  return (
    <PageShell>
      <section className="section-wrap skills-page">
        <DiscoveryTracker milestoneId="sys-skills-evidence" />
        <p className="eyebrow">Evidence-based skills</p>
        <h1>What I know,<br /><em>and where it shows.</em></h1>
        <p className="lede">
          Skills are qualitative on purpose — no inflated percentages. Each entry links to the project that
          demonstrates it; where there is no public project yet, the label says so.
        </p>

        <SkillsMatrixExplorer />


        {categoryOrder.map((category) => {
          const skills = skillsByCategory.get(category) ?? [];
          if (skills.length === 0) return null;
          return (
            <section key={category} className="skills-category" aria-labelledby={`skills-${category}`}>
              <h2 id={`skills-${category}`}>{categoryLabels[category]}</h2>
              <ul className="skill-list">
                {skills.map((skill) => (
                  <li key={skill.id} className="skill-entry">
                    <div className="skill-entry__heading">
                      <strong>{skill.name}</strong>
                      <span className="skill-entry__level">{skill.proficiencyLabel}</span>
                    </div>
                    <p>{skill.evidence}</p>
                    {skill.relatedProjectIds.length > 0 ? (
                      <div className="skill-entry__projects" aria-label={`Projects demonstrating ${skill.name}`}>
                        {skill.relatedProjectIds.map((projectId) => {
                          const project = getProjectById(projectId);
                          if (!project) return null;
                          return (
                            <Link key={projectId} className="text-link" href={`/projects/${project.slug}`}>
                              {project.name} →
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="skill-entry__no-evidence">No public project evidence yet.</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </section>
    </PageShell>
  );
}