import { profile } from "@/data/profile";
import { profileSkills } from "@/data/skills";
import { getAllProjects } from "@/features/portfolio/project-registry";
import { SITE_CONFIG } from "@/lib/site-config";
import type { PortfolioProject } from "@/types/portfolio";

export interface JsonResumeSchema {
  $schema: string;
  basics: {
    name: string;
    label: string;
    image?: string;
    email?: string;
    phone?: string;
    url: string;
    summary: string;
    location: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryCode: string;
      region?: string;
    };
    profiles: Array<{
      network: string;
      username: string;
      url: string;
    }>;
  };
  work?: Array<{
    name: string;
    position: string;
    url?: string;
    startDate: string;
    endDate?: string;
    summary: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    url?: string;
    area: string;
    studyType: string;
    startDate?: string;
    endDate?: string;
    courses: string[];
  }>;
  skills: Array<{
    name: string;
    level: string;
    keywords: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    highlights: string[];
    keywords: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
    roles: string[];
    entity?: string;
    type: string;
  }>;
}

function getProjectRole(p: PortfolioProject): string[] {
  if (p.status === "concept") return ["Game Concept Designer"];
  if (p.priority === "flagship") return ["Systems Architecture", "Software Engineer"];
  if (p.category === "data-and-intelligence") return ["Data Pipeline Engineer"];
  return ["Software Engineer"];
}

function getSkillLevel(proficiencyLabel: string): string {
  const lower = proficiencyLabel.toLowerCase();
  if (lower.includes("core")) return "Proficient";
  if (lower.includes("production") || lower.includes("used in")) return "Applied in Projects";
  if (lower.includes("learning")) return "Learning";
  return "Familiarity";
}

export function generateJsonResume(): JsonResumeSchema {
  const projects = getAllProjects();

  // Group skills by category with honest level categorization
  const skillsByCategory: Record<string, { keywords: string[]; levels: Set<string> }> = {};
  for (const s of profileSkills) {
    const cat = s.category.toUpperCase();
    if (!skillsByCategory[cat]) {
      skillsByCategory[cat] = { keywords: [], levels: new Set() };
    }
    skillsByCategory[cat].keywords.push(s.name);
    skillsByCategory[cat].levels.add(getSkillLevel(s.proficiencyLabel));
  }

  return {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: profile.name,
      label: "Computer Engineering Student · Systems & Interactive Worlds",
      url: SITE_CONFIG.url,
      summary:
        "Computer Engineering student building software, games, and interactive systems. Demonstrated experience developing desktop systems with native OS integration, geospatial hydrological telemetry and flood modeling, local-first SQLite persistence, and web-native 3D environments.",
      location: {
        countryCode: "IN",
        city: "Kerala",
        region: "India",
      },
      profiles: profile.links.map((link) => ({
        network: link.label.includes("GitHub") ? "GitHub" : link.label,
        username: "StretchWave",
        url: link.href,
      })),
    },
    education: [
      {
        institution: "APJ Abdul Kalam Technological University",
        area: "Computer Science & Engineering",
        studyType: "Bachelor of Technology (B.Tech)",
        startDate: "2022",
        endDate: "2026 (Expected)",
        courses: [
          "Data Structures & Algorithms",
          "Operating Systems & Systems Programming",
          "Computer Organization & Architecture",
          "Database Management Systems",
          "Computer Networks",
          "Object-Oriented Programming",
        ],
      },
    ],
    skills: Object.entries(skillsByCategory).map(([cat, data]) => ({
      name: cat,
      level: Array.from(data.levels).join(" / "),
      keywords: data.keywords,
    })),
    projects: projects.map((p) => ({
      name: p.name,
      description: p.summary,
      highlights: [
        p.description,
        ...(p.architecture ? [`Architectural layers: ${p.architecture.layers.join(" → ")}`] : []),
        ...(p.architecture?.overview ? [`Technical overview: ${p.architecture.overview}`] : []),
      ],
      keywords: [...p.technologies],
      url: p.links?.[0]?.href,
      roles: getProjectRole(p),
      type: p.status === "concept" ? "concept" : p.status === "prototype" ? "prototype" : "application",
    })),
  };
}

export function generatePlainTextResume(): string {
  const resume = generateJsonResume();

  return `================================================================================
${resume.basics.name.toUpperCase()}
${resume.basics.label}
Website: ${resume.basics.url} | GitHub: https://github.com/StretchWave
Location: ${resume.basics.location.city}, ${resume.basics.location.region}
================================================================================

EXECUTIVE SUMMARY
-----------------
${resume.basics.summary}

CORE TECHNICAL COMPETENCIES
---------------------------
${resume.skills.map((s) => `• ${s.name} (${s.level}): ${s.keywords.join(", ")}`).join("\n")}

SELECTED SYSTEMS ARCHITECTURES & PROJECTS
-----------------------------------------
${resume.projects
  .map(
    (p) => `
[${p.name.toUpperCase()}] (${p.type.toUpperCase()})
Roles: ${p.roles.join(", ")}
Technologies: ${p.keywords.join(", ")}
Summary: ${p.description}
${p.highlights.map((h) => `  - ${h}`).join("\n")}`
  )
  .join("\n")}

EDUCATION
---------
${resume.education[0].studyType} in ${resume.education[0].area}
${resume.education[0].institution} (${resume.education[0].startDate} - ${resume.education[0].endDate})
Relevant Coursework: ${resume.education[0].courses.join(", ")}

================================================================================
Generated from Project Atlas Engineering Dossier (ATS-Friendly Export)
================================================================================`;
}
