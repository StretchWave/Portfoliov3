import { profile } from "@/data/profile";
import { profileSkills } from "@/data/skills";
import { getAllProjects } from "@/features/portfolio/project-registry";

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

export function generateJsonResume(): JsonResumeSchema {
  const projects = getAllProjects();

  // Group skills by category
  const skillsByCategory: Record<string, string[]> = {};
  for (const s of profileSkills) {
    const cat = s.category.toUpperCase();
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat].push(s.name);
  }

  return {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: profile.name,
      label: "Computer Engineering Student · Systems & Interactive Worlds",
      url: "https://stretchwave.github.io/Atlas",
      summary:
        "Computer Engineering student building software, games, and interactive systems. Proven track record developing desktop systems with native OS integration, geospatial hydrological predictive telemetry, local-first CRDT synchronization, and high-performance WebGL/3D environments.",
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
    skills: Object.entries(skillsByCategory).map(([cat, keywords]) => ({
      name: cat,
      level: "Advanced / Proficient",
      keywords,
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
      roles: ["Lead Systems Architect", "Software Engineer"],
      type: "application",
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
${resume.skills.map((s) => `• ${s.name}: ${s.keywords.join(", ")}`).join("\n")}

FLAGSHIP SYSTEMS ARCHITECTURES & PROJECTS
-----------------------------------------
${resume.projects
  .map(
    (p) => `
[${p.name.toUpperCase()}]
Technologies: ${p.keywords.join(", ")}
Summary: ${p.description}
${p.highlights.map((h) => `  - ${h}`).join("\n")}`
  )
  .join("\n")}

EDUCATION
---------
${resume.education[0].studyType} in ${resume.education[0].area}
${resume.education[0].institution}
Relevant Coursework: ${resume.education[0].courses.join(", ")}

================================================================================
Generated from Project Atlas Interactive Dossier Engine (ATS-Compliant)
================================================================================`;
}
