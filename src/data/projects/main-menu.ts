import type { PortfolioProject } from "@/types/portfolio";

export const mainMenuProject = {
  id: "main-menu",
  slug: "main-menu",
  name: "MainMenu — First Personal Site",
  category: "web-development",
  status: "archived",
  priority: "archived",
  featured: false,
  summary: "The owner's first hand-built personal website (2023): a single-page HTML/CSS/JS site with menu navigation.",
  description:
    "MainMenu is the predecessor to this portfolio: a custom single-page website written in 2023 with plain HTML, CSS, and JavaScript — menu navigation, sectioned content, custom graphics, and a GitHub Pages deployment workflow. It documents where the owner started: hand-rolled web design before frameworks.",
  technologies: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
  skills: ["Hand-rolled web design", "UI layout", "Static site publishing"],
  links: [{ label: "View the archived site source on GitHub", href: "https://github.com/StretchWave/MainMenu" }],
  demonstration: { kind: "information" },
} as const satisfies PortfolioProject;