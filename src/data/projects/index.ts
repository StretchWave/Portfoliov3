import type { PortfolioProject } from "@/types/portfolio";

import { keralaFloodRiskPlatformProject } from "./kerala-flood-risk-platform";
import { lucidaSyncProject } from "./lucida-sync";
import { lyruneProject } from "./lyrune";
import { mainMenuProject } from "./main-menu";
import { neeradStoreProject } from "./neerad-store";
import { recoveraiProject } from "./recoverai";
import { scrollbrakeProject } from "./scrollbrake";
import { sonaraProject } from "./sonara";
import { stanceCombatPvpProject } from "./stance-combat-pvp";

/**
 * The only registration point for local project content. Order here is the
 * display order: flagships first, then featured, supporting, experiments,
 * archived, and concepts. A future CMS adapter should preserve the
 * PortfolioProject contract and replace this source only.
 */
export const registeredProjects: readonly PortfolioProject[] = [
  sonaraProject,
  lyruneProject,
  keralaFloodRiskPlatformProject,
  neeradStoreProject,
  lucidaSyncProject,
  recoveraiProject,
  scrollbrakeProject,
  stanceCombatPvpProject,
  mainMenuProject,
];