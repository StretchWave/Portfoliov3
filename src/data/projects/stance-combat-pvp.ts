import type { PortfolioProject } from "@/types/portfolio";

export const stanceCombatPvpProject = {
  id: "stance-combat-pvp",
  slug: "stance-combat-pvp",
  name: "Stance Combat PvP (Concept)",
  category: "game-development",
  status: "concept",
  priority: "supporting",
  featured: false,
  summary: "A concept for a turn-based/strategic PvP combat game built around dodge, block, and timed parry.",
  description:
    "A game-design concept in the works: turn-based strategic combat where timing is the skill — dodge, block, and timed parry against an opponent — built around three stances (strength, agility, endurance), each with its own skill tree and stat-driven progression, with a potential hybrid-stance path. This is a design concept: no public repository or playable build exists yet, and no mechanic is claimed as implemented.",
  technologies: ["Game design", "Combat systems design"],
  skills: ["Combat systems design", "Game balance thinking", "Stance & progression design"],
  demonstration: { kind: "information" },
} as const satisfies PortfolioProject;