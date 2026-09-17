import type { PortfolioProject } from "@/types/portfolio";

/**
 * Single, unified search utility for Project Atlas.
 * Used consistently across the Project Filter catalog, Command Palette,
 * and automated test suites.
 */
export function matchesProjectSearch(project: PortfolioProject, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  const terms = query.split(/\s+/).filter(Boolean);

  const fields: string[] = [
    project.name,
    project.slug,
    project.summary,
    project.description,
    project.category,
    project.status,
    project.priority,
    ...(project.secondaryCategories || []),
    ...(project.technologies || []),
    ...(project.skills || []),
    ...(project.architecture?.overview ? [project.architecture.overview] : []),
    ...(project.architecture?.layers || []),
  ].map((s) => s.toLowerCase());

  return terms.every((term) => fields.some((field) => field.includes(term)));
}
