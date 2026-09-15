import type { PortfolioProject } from "@/types/portfolio";

export const keralaFloodRiskPlatformProject = {
  id: "kerala-flood-risk-platform",
  slug: "kerala-flood-risk-platform",
  name: "Kerala Flood Risk Platform",
  category: "data-and-intelligence",
  secondaryCategories: ["software-engineering"],
  status: "in-progress",
  priority: "flagship",
  featured: true,
  summary: "A GPU-accelerated flood-risk and resource-allocation decision-support system for Kerala panchayats.",
  description:
    "The Kerala Flood Risk Platform is a systems-architecture demonstration for disaster-management decision support: it simulates telemetry, runs feature-engineering pipelines across pandas, cuDF, and PySpark, trains an XGBoost flood-risk model, and serves alert levels through a FastAPI. The repository documents the intended Google Cloud blueprint (managed Spark, BigQuery feature store, GKE serving) and positions the platform as the last-mile layer on top of existing river-forecast systems — translating gauge-level forecasts into panchayat-level alerts and resource dispatch.",
  technologies: ["Python", "pandas", "cuDF / RAPIDS", "PySpark", "XGBoost", "BigQuery", "Parquet", "FastAPI", "Google Cloud (blueprint)", "Data simulation"],
  skills: ["Systems thinking", "Data pipeline engineering", "GPU-accelerated ETL", "Machine learning", "Decision-support design", "Cloud architecture"],
  architecture: {
    overview:
      "Simulated raw telemetry is transformed by one of three ETL pipeline variants (pandas, cuDF, or PySpark), aggregated into features, and used to train and serve an XGBoost risk model. Alert levels (Green/Yellow/Orange/Red) are exposed through a FastAPI alongside a decision-support dashboard and an agent-layer concept.",
    layers: [
      "Simulated raw telemetry (Parquet)",
      "ETL variants: pandas / cuDF / PySpark",
      "Feature store (BigQuery blueprint)",
      "Forecasting (BQ ML ARIMA_PLUS / TimesFM)",
      "XGBoost risk model training",
      "FastAPI serving with alert levels",
      "Dashboard & agent concept",
    ],
  },
  caseStudy: {
    problem:
      "River-level forecasts already exist for Kerala, but translating a gauge-level forecast into localized action — which panchayats to alert and where to dispatch resources — remains a separate problem.",
    solution:
      "The platform acts as the last-mile decision-support layer: it simulates panchayat-level telemetry (941 panchayats), engineers rolling rainfall and river-gauge features, trains a risk model, and exposes alert levels through an API with dashboard and agent concepts for resource allocation.",
    features: [
      {
        title: "Simulated data generation",
        description: "A data generator produces hourly telemetry and static panchayat records so the full pipeline is reproducible without live feeds.",
      },
      {
        title: "Three ETL engine variants",
        description: "Feature pipelines are implemented for pandas, cuDF (GPU), and PySpark, with a benchmark report documenting wall-clock results over the synthetic dataset.",
      },
      {
        title: "Risk model and serving API",
        description: "An XGBoost model predicts flood-risk scores, and a FastAPI service maps them to Green/Yellow/Orange/Red alert levels.",
      },
      {
        title: "Decision-support presentation",
        description: "A dashboard and an agent-platform concept surface alerts and resource-allocation outputs for disaster-management staff.",
      },
      {
        title: "Cloud architecture blueprint",
        description: "The repository documents the intended production path: managed Spark ETL, BigQuery feature store, GKE model serving, and enterprise agent tooling.",
      },
    ],
    engineeringDecisions: [
      {
        title: "Simulate instead of guessing live data",
        description: "A data generator makes the architecture testable and reproducible; the README explicitly frames the project as a design/system demonstration.",
      },
      {
        title: "Benchmark before choosing an engine",
        description: "The ETL benchmark report measures the pandas pipeline over 55 million rows and records environment-dependent failures of the GPU/Spark variants rather than claiming unverified speedups.",
      },
    ],
  },
  links: [{ label: "View source on GitHub", href: "https://github.com/StretchWave/kerala_flood_risk" }],
  demonstration: { kind: "flood-risk-simulator", defaultDistrict: "Idukki Reservoir Catchment" },
  exhibit: {
    area: "atlas-hub",
    presentation: "information-display",
    position: [4.2, 0, -2.6],
    accent: "#ffc76b",
    interactionRange: 3.1,
  },
  exhibits: [
    {
      area: "intelligence-observatory",
      presentation: "information-display",
      position: [0, 0, -3.8],
      accent: "#818cf8",
      interactionRange: 2.8,
    },
  ],
} as const satisfies PortfolioProject;