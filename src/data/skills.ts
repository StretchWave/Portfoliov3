import type { ProfileSkill } from "@/types/portfolio";

/**
 * Evidence-based skill registry. Every skill carries `relatedProjectIds`
 * (PortfolioProject ids) and an evidence sentence. A skill without public
 * project evidence is labeled honestly (learning / familiarity / interest)
 * rather than removed or inflated. See docs/SKILL_EVIDENCE.md for the full
 * mapping rationale.
 */
export const profileSkills = [
  // Languages ---------------------------------------------------------------
  {
    id: "python",
    name: "Python",
    category: "languages",
    proficiencyLabel: "Core language",
    relatedProjectIds: ["lyrune", "lucida-sync", "kerala-flood-risk-platform"],
    evidence: "Primary language of Lyrune (desktop overlay), Lucida-Sync (CLI/API), and the Kerala Flood Risk pipelines and serving layer.",
    displayPriority: 1,
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "languages",
    proficiencyLabel: "Used in full-stack work",
    relatedProjectIds: ["recoverai"],
    evidence: "Frontend of the RecoverAI mission-control prototype; also the language of this portfolio itself.",
    displayPriority: 2,
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "languages",
    proficiencyLabel: "Used in web work",
    relatedProjectIds: ["scrollbrake", "main-menu"],
    evidence: "ScrollBrake extension logic and the 2023 hand-built personal site.",
    displayPriority: 3,
  },
  {
    id: "dart",
    name: "Dart",
    category: "languages",
    proficiencyLabel: "Used in Flutter apps",
    relatedProjectIds: ["sonara", "neerad-store"],
    evidence: "Application and backend code for Sonara and the Neerad Store app, both Flutter projects.",
    displayPriority: 4,
  },
  {
    id: "html-css",
    name: "HTML & CSS",
    category: "languages",
    proficiencyLabel: "Used in web work",
    relatedProjectIds: ["main-menu", "scrollbrake"],
    evidence: "Hand-written page structure and styling across the 2023 personal site, extension UI, and this portfolio.",
    displayPriority: 5,
  },
  {
    id: "c",
    name: "C",
    category: "languages",
    proficiencyLabel: "Learning",
    relatedProjectIds: [],
    evidence: "No public project yet; part of the engineering curriculum and systems interest.",
    displayPriority: 6,
  },
  {
    id: "cpp",
    name: "C++",
    category: "languages",
    proficiencyLabel: "Learning",
    relatedProjectIds: [],
    evidence: "No public project yet; targeted for game development and systems work.",
    displayPriority: 7,
  },
  {
    id: "csharp",
    name: "C#",
    category: "languages",
    proficiencyLabel: "Familiarity",
    relatedProjectIds: [],
    evidence: "Studied for application development; no public project yet.",
    displayPriority: 8,
  },
  {
    id: "java",
    name: "Java",
    category: "languages",
    proficiencyLabel: "Familiarity",
    relatedProjectIds: [],
    evidence: "Studied in coursework; no public project yet.",
    displayPriority: 9,
  },
  {
    id: "php",
    name: "PHP",
    category: "languages",
    proficiencyLabel: "Familiarity",
    relatedProjectIds: [],
    evidence: "Studied for web development; no public project yet.",
    displayPriority: 10,
  },

  // Frameworks --------------------------------------------------------------
  {
    id: "pyqt6",
    name: "PyQt6",
    category: "frameworks",
    proficiencyLabel: "Used in production projects",
    relatedProjectIds: ["lyrune"],
    evidence: "Lyrune's overlay rendering, animation, settings, and tray behavior are built on PyQt6.",
    displayPriority: 1,
  },
  {
    id: "flutter",
    name: "Flutter",
    category: "frameworks",
    proficiencyLabel: "Used in production projects",
    relatedProjectIds: ["sonara", "neerad-store"],
    evidence: "Sonara ships Android, Windows, and Linux targets; Neerad Store covers desktop and mobile targets.",
    displayPriority: 2,
  },
  {
    id: "fastapi",
    name: "FastAPI",
    category: "frameworks",
    proficiencyLabel: "Used in projects",
    relatedProjectIds: ["lucida-sync", "recoverai", "kerala-flood-risk-platform"],
    evidence: "REST API in Lucida-Sync, the RecoverAI backend, and the Kerala model-serving API.",
    displayPriority: 3,
  },
  {
    id: "react",
    name: "React",
    category: "frameworks",
    proficiencyLabel: "Used in projects",
    relatedProjectIds: ["recoverai"],
    evidence: "RecoverAI's mission-control frontend; React also powers this portfolio's interactive layer.",
    displayPriority: 4,
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "frameworks",
    proficiencyLabel: "Used in production",
    relatedProjectIds: [],
    evidence: "This portfolio itself is a Next.js App Router application with server-first pages.",
    displayPriority: 5,
  },
  {
    id: "threejs",
    name: "Three.js / React Three Fiber",
    category: "frameworks",
    proficiencyLabel: "Used in production",
    relatedProjectIds: [],
    evidence: "The Atlas 3D hub: a lazy-loaded WebGL environment with a shared material system.",
    displayPriority: 6,
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "frameworks",
    proficiencyLabel: "Used in projects",
    relatedProjectIds: ["recoverai"],
    evidence: "Styling for the RecoverAI frontend.",
    displayPriority: 7,
  },

  // Game development --------------------------------------------------------
  {
    id: "game-design",
    name: "Game & combat design",
    category: "game-development",
    proficiencyLabel: "Concept design",
    relatedProjectIds: ["stance-combat-pvp"],
    evidence: "The PvP stance-combat concept: dodge/block/timed parry, three stances with separate skill trees, stat-driven progression.",
    displayPriority: 1,
  },
  {
    id: "unreal-engine",
    name: "Unreal Engine",
    category: "game-development",
    proficiencyLabel: "Learning / interest",
    relatedProjectIds: [],
    evidence: "Directed interest for game development; no public project yet.",
    displayPriority: 2,
  },
  {
    id: "ui-ux",
    name: "UI / UX design",
    category: "game-development",
    proficiencyLabel: "Practiced in projects",
    relatedProjectIds: ["lyrune", "sonara", "main-menu"],
    evidence: "Lyrune's overlay presets and typography controls, Sonara's theming and navigation, and the 2023 hand-built site.",
    displayPriority: 3,
  },

  // Web ----------------------------------------------------------------------
  {
    id: "browser-extensions",
    name: "Browser extensions",
    category: "web",
    proficiencyLabel: "Prototype built",
    relatedProjectIds: ["scrollbrake"],
    evidence: "ScrollBrake: a Manifest V3 extension with service worker, content scripts, popup, and options pages.",
    displayPriority: 1,
  },
  {
    id: "web-scraping",
    name: "Web scraping & automation",
    category: "web",
    proficiencyLabel: "Used in projects",
    relatedProjectIds: ["lucida-sync"],
    evidence: "Lucida-Sync drives Lucida.to's web interface with Playwright and a session-managed HTTP client.",
    displayPriority: 2,
  },

  // AI / ML ------------------------------------------------------------------
  {
    id: "machine-learning",
    name: "Machine learning",
    category: "ai-ml",
    proficiencyLabel: "Applied in projects",
    relatedProjectIds: ["kerala-flood-risk-platform"],
    evidence: "XGBoost flood-risk model training and evaluation in the Kerala platform, alongside BQ ML forecasting.",
    displayPriority: 1,
  },
  {
    id: "llm-integration",
    name: "LLM / generative AI integration",
    category: "ai-ml",
    proficiencyLabel: "Used in projects",
    relatedProjectIds: ["scrollbrake"],
    evidence: "ScrollBrake classifies YouTube videos with free-tier Gemini models (auto-discovered from the user's API key).",
    displayPriority: 2,
  },

  // Data ---------------------------------------------------------------------
  {
    id: "data-engineering",
    name: "Data engineering",
    category: "data",
    proficiencyLabel: "Applied in projects",
    relatedProjectIds: ["kerala-flood-risk-platform"],
    evidence: "Feature pipelines written for pandas, cuDF, and PySpark with a published benchmark report.",
    displayPriority: 1,
  },
  {
    id: "gpu-acceleration",
    name: "GPU acceleration",
    category: "data",
    proficiencyLabel: "Explored in projects",
    relatedProjectIds: ["kerala-flood-risk-platform"],
    evidence: "RAPIDS (cuDF/cuML) variants of the Kerala ETL and training pipelines.",
    displayPriority: 2,
  },
  {
    id: "forecasting",
    name: "Forecasting",
    category: "data",
    proficiencyLabel: "Applied in projects",
    relatedProjectIds: ["kerala-flood-risk-platform"],
    evidence: "ARIMA_PLUS / TimesFM forecasting in the Kerala architecture.",
    displayPriority: 3,
  },

  // Cloud ---------------------------------------------------------------------
  {
    id: "cloud-architecture",
    name: "Cloud architecture",
    category: "cloud",
    proficiencyLabel: "Designed in projects",
    relatedProjectIds: ["kerala-flood-risk-platform"],
    evidence: "Google Cloud blueprint: Parquet storage, managed Spark, BigQuery feature store, GKE model serving.",
    displayPriority: 1,
  },

  // Tools ---------------------------------------------------------------------
  {
    id: "desktop-packaging",
    name: "Desktop packaging & release automation",
    category: "tools",
    proficiencyLabel: "Used in production",
    relatedProjectIds: ["lyrune"],
    evidence: "PyInstaller specs, Inno Setup installer, and a GitHub Actions workflow building tagged release artifacts.",
    displayPriority: 1,
  },
  {
    id: "playwright",
    name: "Playwright",
    category: "tools",
    proficiencyLabel: "Used in projects",
    relatedProjectIds: ["lucida-sync"],
    evidence: "Chromium automation for music downloads in Lucida-Sync.",
    displayPriority: 2,
  },
  {
    id: "testing",
    name: "Automated testing",
    category: "tools",
    proficiencyLabel: "Practiced in projects",
    relatedProjectIds: ["recoverai", "lucida-sync"],
    evidence: "Backend test suites for RecoverAI (policy engine, safety gates, simulations) and download tests for Lucida-Sync.",
    displayPriority: 3,
  },

  // Design & interactive ------------------------------------------------------
  {
    id: "3d-interactive",
    name: "3D / interactive experiences",
    category: "interactive",
    proficiencyLabel: "Used in production",
    relatedProjectIds: [],
    evidence: "This portfolio's WebGL hub: lazy-loaded environment with shared materials, lighting budget, and data-driven exhibits.",
    displayPriority: 1,
  },
  {
    id: "desktop-apps",
    name: "Desktop application development",
    category: "interactive",
    proficiencyLabel: "Used in production",
    relatedProjectIds: ["lyrune", "neerad-store"],
    evidence: "Lyrune (Windows/Linux overlay) and Neerad Store (Flutter store management) are both real desktop applications.",
    displayPriority: 2,
  },
] satisfies readonly ProfileSkill[];

/** Skills that demonstrate a given project (reverse lookup for detail pages). */
export function getSkillsForProject(projectId: string): readonly ProfileSkill[] {
  return profileSkills
    .filter((skill) => skill.relatedProjectIds.includes(projectId))
    .sort((a, b) => a.displayPriority - b.displayPriority);
}

export function getSkillsByCategory(): ReadonlyMap<ProfileSkill["category"], readonly ProfileSkill[]> {
  const grouped = new Map<ProfileSkill["category"], ProfileSkill[]>();
  for (const skill of profileSkills) {
    const list = grouped.get(skill.category) ?? [];
    list.push(skill);
    grouped.set(skill.category, list);
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => a.displayPriority - b.displayPriority);
  }
  return grouped;
}