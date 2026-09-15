import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { profile } from "@/data/profile";
import { getProjectsByCategory } from "@/features/portfolio/project-registry";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const gameProjects = getProjectsByCategory("game-development");

  return (
    <PageShell>
      <article className="article-page section-wrap">
        <p className="eyebrow">{profile.roleEyebrow}</p>
        <h1>Systems are the medium.</h1>
        <p className="lede">{profile.introShort}</p>
        <div className="copy-stack article-copy">
          {profile.introLong.map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>)}
        </div>

        <section className="about-directions" aria-labelledby="about-directions-heading">
          <h2 id="about-directions-heading">Where the work is going</h2>
          <div className="direction-grid direction-grid--about">
            {profile.careerDirections.map((direction) => (
              <article key={direction.title} className="direction-card">
                <h3>{direction.title}</h3>
                <p>{direction.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-game-direction" aria-labelledby="game-direction-heading">
          <h2 id="game-direction-heading">The game development direction</h2>
          <p>
            Game development is a serious direction, currently at the design stage. The active concept is a
            turn-based/strategic PvP combat system built around dodge, block, and timed parry, with three stances
            (strength, agility, endurance), separate stance skill trees, and stat-driven progression.
            {gameProjects.length > 0 ? " It is listed among the projects as a concept until a playable build exists." : ""}
          </p>
          <div className="button-row">
            <Link className="button button--quiet" href="/projects">See the full project catalog</Link>
            <Link className="button button--quiet" href="/interactive">Explore the 3D hub</Link>
          </div>
        </section>
      </article>
    </PageShell>
  );
}