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
  "mobile-development",
  "developer-tools",
  "web-development",
  "desktop-application",
  "automation",
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export const projectStatuses = ["active", "in-progress", "prototype", "completed", "concept", "archived"] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

/**
 * Visual importance of a project. Flagship and featured projects carry the
 * portfolio; supporting, experiment, and archived projects fill out the
 * catalog without claiming equal weight.
 */
export const projectPriorities = ["flagship", "featured", "supporting", "experiment", "archived"] as const;
export type ProjectPriority = (typeof projectPriorities)[number];

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
  area: "atlas-hub" | (string & {});
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
  /** Secondary categories are shown as context; a project keeps one primary identity. */
  secondaryCategories?: readonly ProjectCategory[];
  status: ProjectStatus;
  priority: ProjectPriority;
  /** Controls home-page presence; flagships/featured should set it. */
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
  /** Verified relationships between projects; never speculative. */
  relatedProjectIds?: readonly string[];
  demonstration: DemonstrationConfiguration;
  exhibit?: ExhibitConfiguration;
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export const skillCategories = [
  "languages",
  "frameworks",
  "game-development",
  "web",
  "ai-ml",
  "data",
  "cloud",
  "tools",
  "design",
  "interactive",
] as const;

export type SkillCategory = (typeof skillCategories)[number];

/**
 * An evidence-based skill. `relatedProjectIds` reference PortfolioProject
 * ids; `evidence` states where the skill is demonstrated. Proficiency labels
 * are qualitative on purpose — never inflated percentages.
 */
export interface ProfileSkill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiencyLabel: string;
  relatedProjectIds: readonly string[];
  /** One or two sentences describing where/how the skill is demonstrated. */
  evidence: string;
  displayPriority: number;
}

export interface CareerDirection {
  title: string;
  description: string;
}

export interface PortfolioProfile {
  name: string;
  title: string;
  roleEyebrow: string;
  introShort: string;
  /** Paragraphs for the about page; keep honest and specific. */
  introLong: readonly string[];
  careerDirections: readonly CareerDirection[];
  links: readonly ProjectLink[];
}