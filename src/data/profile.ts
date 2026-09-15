import type { PortfolioProfile } from "@/types/portfolio";

/**
 * Single source of truth for the owner's professional profile. Only facts
 * that are verified (or supplied by the owner) belong here. Links must be
 * real; unknown channels (LinkedIn, email, resume) stay absent until supplied.
 */
export const profile = {
  name: "Mohammed Mishal",
  title: "Computer Engineering student building software, games, and interactive systems.",
  roleEyebrow: "Computer Engineering · systems & interactive worlds",
  introShort:
    "I build systems. Sometimes they are applications. Sometimes they are intelligent systems. Sometimes they are interactive worlds.",
  introLong: [
    "I am a Computer Engineering student with a career direction across software engineering, game development, and interactive systems. The work I keep returning to is the same in all three: understanding a system end to end, then building it with clear boundaries and honest engineering.",
    "That shows up as desktop applications with real platform integration, data pipelines and decision-support systems, full-stack prototypes with tests, and a growing interest in game mechanics and 3D experiences. I treat breadth as a feature: each area teaches constraints that make the others better.",
    "This portfolio is built the same way. The conventional site is the fast, accessible path to my work; the optional 3D hub is an interactive layer for people who want to explore the projects spatially.",
  ],
  careerDirections: [
    {
      title: "Software Engineering",
      description:
        "Desktop and full-stack systems with real platform constraints — media integration, packaging, release automation, and tooling that people actually run.",
    },
    {
      title: "Game Development",
      description:
        "Combat and interaction design, stances and timing systems, and the path from game concept to playable mechanics. The current PvP concept is in design; nothing is claimed as shipped until it exists.",
    },
    {
      title: "Interactive Systems & Creative Technology",
      description:
        "3D environments, browser-native interactive experiences, and interfaces that make technical systems legible — including this portfolio's own WebGL hub.",
    },
  ],
  links: [{ label: "GitHub profile", href: "https://github.com/StretchWave" }],
} as const satisfies PortfolioProfile;