import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { profile } from "@/data/profile";
import { ProjectCard } from "@/features/portfolio/components/project-card";
import { getFeaturedProjects } from "@/features/portfolio/project-registry";

export default function HomePage() {
  const featuredProjects = getFeaturedProjects();

  return (
    <PageShell>
      <section className="hero section-wrap">
        <p className="eyebrow">{profile.roleEyebrow}</p>
        <h1>{profile.name}.<br /><em>I build systems — sometimes they become worlds.</em></h1>
        <p className="lede hero__copy">{profile.introShort}</p>
        <div className="button-row">
          <Link className="button button--primary" href="/projects">Browse projects <span aria-hidden="true">→</span></Link>
          <Link className="button button--quiet" href="/interactive">Explore the 3D hub</Link>
          <Link className="button button--quiet" href={profile.links[0].href} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="section-wrap direction-section" aria-labelledby="directions-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">What I build</p>
            <h2 id="directions-heading">Three directions, one method.</h2>
          </div>
          <Link className="text-link" href="/about">About →</Link>
        </div>
        <div className="direction-grid">
          {profile.careerDirections.map((direction) => (
            <article key={direction.title} className="direction-card">
              <h3>{direction.title}</h3>
              <p>{direction.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-wrap featured-section" aria-labelledby="featured-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 id="featured-heading">Systems worth opening up.</h2>
          </div>
          <Link className="text-link" href="/projects">All projects →</Link>
        </div>
        <div className="project-grid">
          {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </section>

      <section className="section-wrap skills-strip" aria-labelledby="skills-strip-heading">
        <div>
          <p className="eyebrow">What I know</p>
          <h2 id="skills-strip-heading">Skills backed by projects, not logos.</h2>
          <p className="copy-stack">Every skill on the skills page points at the project that proves it.</p>
        </div>
        <Link className="button button--quiet" href="/skills">See the evidence <span aria-hidden="true">→</span></Link>
      </section>
    </PageShell>
  );
}