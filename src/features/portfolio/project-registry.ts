import { registeredProjects } from "@/data/projects";
import type { PortfolioProject, ProjectCategory, ProjectPriority } from "@/types/portfolio";

function indexProjects(projects: readonly PortfolioProject[]) {
  const byId = new Map<string, PortfolioProject>();
  const bySlug = new Map<string, PortfolioProject>();

  for (const project of projects) {
    if (byId.has(project.id) || bySlug.has(project.slug)) {
      throw new Error(`Duplicate portfolio project registration: ${project.id}`);
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

export function getFeaturedProjects(): readonly PortfolioProject[] {
  return projects.filter((project) => project.featured);
}

export function getProjectsByCategory(category: ProjectCategory): readonly PortfolioProject[] {
  return projects.filter((project) => project.category === category || project.secondaryCategories?.includes(category));
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
  return projects.filter((project) => project.exhibit && (!area || project.exhibit.area === area));
}
