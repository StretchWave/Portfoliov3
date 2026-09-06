import type { PortfolioProject } from "@/types/portfolio";

import { keralaFloodRiskPlatformProject } from "./kerala-flood-risk-platform";
import { lyruneProject } from "./lyrune";

/**
 * The only registration point for local project content. A future CMS adapter
 * should preserve the PortfolioProject contract and replace this source only.
 */
export const registeredProjects = [lyruneProject, keralaFloodRiskPlatformProject] as const satisfies readonly PortfolioProject[];
