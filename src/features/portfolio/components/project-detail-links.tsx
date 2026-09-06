import type { PortfolioProject } from "@/types/portfolio";

export function ProjectDetailLinks({ project }: { project: PortfolioProject }) {
  if (!project.links?.length) return null;

  return (
    <section className="project-detail__section" aria-labelledby="links-heading">
      <h2 id="links-heading">Repository and links</h2>
      <ul className="project-link-list">
        {project.links.map((link) => {
          const isExternal = link.href.startsWith("http://") || link.href.startsWith("https://");
          return (
            <li key={link.href}>
              <a className="text-link" href={link.href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}>
                {link.label} {isExternal ? <span aria-hidden="true">↗</span> : null}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
