/**
 * The shared, serializable vocabulary for portfolio content. Keep this file
 * independent from React and Three.js so a future CMS adapter can use it too.
 */
export const projectCategories = [
  "software-engineering",
  "data-and-intelligence",
  "game-development",
  "interactive-systems",
  "experimental",
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export const projectStatuses = ["active", "in-progress", "concept", "archived"] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export type DemonstrationConfiguration =
  | { kind: "information" }
  | { kind: "external"; label: string; href: string }
  | { kind: "video"; title: string; source: string }
  | { kind: "interactive-scene"; sceneId: string }
  | { kind: "dedicated-experience"; route: string };

export type ExhibitPresentation =
  | "information-display"
  | "terminal"
  | "portal"
  | "installation";

export interface ExhibitConfiguration {
  /** A stable world-area identifier; it is not a display name. */
  area: "prototype-hub" | (string & {});
  presentation: ExhibitPresentation;
  position: readonly [number, number, number];
  accent: string;
  interactionRange?: number;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface TechnicalArchitecture {
  overview: string;
  layers: readonly string[];
}

/** A concise, reusable content block for a project’s conventional case study. */
export interface CaseStudyItem {
  title: string;
  description: string;
}

export interface ProjectCaseStudy {
  problem: string;
  solution: string;
  features: readonly CaseStudyItem[];
  engineeringDecisions?: readonly CaseStudyItem[];
}

export interface PortfolioProject {
  id: string;
  slug: string;
  name: string;
  category: ProjectCategory;
  status: ProjectStatus;
  featured: boolean;
  summary: string;
  description: string;
  technologies: readonly string[];
  skills: readonly string[];
  architecture?: TechnicalArchitecture;
  caseStudy?: ProjectCaseStudy;
  thumbnail?: string;
  imagePaths?: readonly string[];
  links?: readonly ProjectLink[];
  demonstration: DemonstrationConfiguration;
  exhibit?: ExhibitConfiguration;
}
