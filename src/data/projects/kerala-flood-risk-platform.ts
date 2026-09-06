import type { PortfolioProject } from "@/types/portfolio";

export const keralaFloodRiskPlatformProject = {
  id: "kerala-flood-risk-platform",
  slug: "kerala-flood-risk-platform",
  name: "Kerala Flood Risk Platform",
  category: "data-and-intelligence",
  status: "in-progress",
  featured: true,
  summary: "A decision-support concept for flood-risk forecasting and resource allocation.",
  description:
    "The Kerala Flood Risk Platform explores how data engineering, forecasting, risk analysis, and resource allocation can support disaster-management decisions. Its future exhibit is intended to make the system pipeline legible: from raw data through processing and forecasting to an actionable decision-support view.",
  technologies: ["Data engineering", "GPU acceleration", "Machine learning", "Forecasting", "APIs", "Cloud architecture"],
  skills: ["Systems thinking", "Decision-support design", "Data pipelines", "Technical visualization"],
  architecture: {
    overview:
      "The intended architecture separates ingestion and processing from forecasting and risk services, then presents resource-allocation outputs through a decision-support layer.",
    layers: ["Raw data", "Processing", "Forecasting", "Risk analysis", "Resource allocation", "Decision support"],
  },
  demonstration: { kind: "information" },
  exhibit: {
    area: "prototype-hub",
    presentation: "information-display",
    position: [4.2, 0, -2.6],
    accent: "#ffc76b",
    interactionRange: 3.1,
  },
} as const satisfies PortfolioProject;
