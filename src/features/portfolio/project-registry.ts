import { registeredProjects } from "@/data/projects";
import { profileSkills } from "@/data/skills";
import { worldAreaIds } from "@/types/portfolio";
import { PROJECT_CODE_SNIPPETS } from "@/features/portfolio/code/code-snippets-data";
import type {
  PortfolioProject,
  ProjectCategory,
  ProjectPriority,
  ProfileSkill,
} from "@/types/portfolio";

function indexProjects(projectList: readonly PortfolioProject[]) {
  const byId = new Map<string, PortfolioProject>();
  const bySlug = new Map<string, PortfolioProject>();

  for (const project of projectList) {
    if (byId.has(project.id) || bySlug.has(project.slug)) {
      throw new Error(`Duplicate portfolio project registration: ${project.id} (${project.slug})`);
    }

    byId.set(project.id, project);
    bySlug.set(project.slug, project);
  }

  return { byId, bySlug };
}

const projects = registeredProjects;
const indexes = indexProjects(projects);

export function getAllProjects(): readonly PortfolioProject[] {
  return projects;
}

export function getProjectCount(): number {
  return projects.length;
}

/**
 * Returns projects that have verified, implemented codebase evidence
 * (i.e. excluding purely conceptual designs like Stance Combat PvP).
 */
export function getVerifiedProjects(): readonly PortfolioProject[] {
  return projects.filter((project) => project.status !== "concept");
}

export function getVerifiedProjectCount(): number {
  return getVerifiedProjects().length;
}

export function getFeaturedProjects(): readonly PortfolioProject[] {
  return projects.filter((project) => project.featured);
}

export function getProjectsByCategory(category: ProjectCategory): readonly PortfolioProject[] {
  return projects.filter(
    (project) =>
      project.category === category || project.secondaryCategories?.includes(category)
  );
}

export function getProjectsByPriority(priority: ProjectPriority): readonly PortfolioProject[] {
  return projects.filter((project) => project.priority === priority);
}

export function getRelatedProjects(projectId: string): readonly PortfolioProject[] {
  const project = indexes.byId.get(projectId);
  if (!project?.relatedProjectIds) return [];
  return project.relatedProjectIds
    .map((id) => indexes.byId.get(id))
    .filter((related): related is PortfolioProject => Boolean(related));
}

export function getProjectById(id: string): PortfolioProject | undefined {
  return indexes.byId.get(id);
}

export function getProjectBySlug(slug: string): PortfolioProject | undefined {
  return indexes.bySlug.get(slug);
}

export function getProjectsWithExhibits(area?: string): readonly PortfolioProject[] {
  return projects.filter((project) => {
    if (!area) return Boolean(project.exhibit || project.exhibits?.length);
    if (project.exhibit?.area === area) return true;
    return project.exhibits?.some((ex) => ex.area === area);
  });
}

/**
 * Returns all skills that have verified project associations.
 */
export function getVerifiedSkills(): readonly ProfileSkill[] {
  return profileSkills.filter((skill) => skill.relatedProjectIds.length > 0);
}

/**
 * Extracts the deduplicated list of all technologies used across projects.
 */
export function getProjectTechnologies(): string[] {
  const set = new Set<string>();
  for (const project of projects) {
    for (const tech of project.technologies) {
      set.add(tech);
    }
  }
  return Array.from(set).sort();
}

export interface RegistryValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates referential integrity of the project registry:
 * - Duplicate IDs / Slugs
 * - Related project IDs exist
 * - Exhibit worldAreaIds are valid
 * - Code snippet project IDs exist
 */
export function validateProjectRegistry(): RegistryValidationResult {
  const errors: string[] = [];
  const validAreaSet = new Set<string>(worldAreaIds);
  const projectIds = new Set<string>();
  const projectSlugs = new Set<string>();

  for (const p of projects) {
    if (projectIds.has(p.id)) {
      errors.push(`Duplicate project ID detected: "${p.id}"`);
    }
    projectIds.add(p.id);

    if (projectSlugs.has(p.slug)) {
      errors.push(`Duplicate project slug detected: "${p.slug}"`);
    }
    projectSlugs.add(p.slug);

    if (p.exhibit && !validAreaSet.has(p.exhibit.area)) {
      errors.push(`Project "${p.id}" references invalid world area: "${p.exhibit.area}"`);
    }

    if (p.exhibits) {
      for (const ex of p.exhibits) {
        if (!validAreaSet.has(ex.area)) {
          errors.push(`Project "${p.id}" exhibits reference invalid world area: "${ex.area}"`);
        }
      }
    }

    if (p.relatedProjectIds) {
      for (const relId of p.relatedProjectIds) {
        if (!projects.some((other) => other.id === relId)) {
          errors.push(`Project "${p.id}" references non-existent related project ID: "${relId}"`);
        }
      }
    }
  }

  // Validate code snippet project IDs
  for (const [snippetProjectId] of Object.entries(PROJECT_CODE_SNIPPETS)) {
    if (!projectIds.has(snippetProjectId)) {
      errors.push(`Code snippet references non-existent project ID: "${snippetProjectId}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
