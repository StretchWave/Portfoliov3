import type { PortfolioProject } from "@/types/portfolio";

export const recoveraiProject = {
  id: "recoverai",
  slug: "recoverai",
  name: "RecoverAI",
  category: "software-engineering",
  secondaryCategories: ["automation"],
  status: "prototype",
  priority: "supporting",
  featured: false,
  summary: "A full-stack prototype for autonomous recovery of failed transactions, abandoned checkouts, and overdue receivables.",
  description:
    "RecoverAI is a full-stack prototype of a financial-recovery loop: a FastAPI backend diagnoses transaction failures, evaluates deterministic enterprise guardrails, and executes bounded recovery actions (payment declines, abandoned checkouts, overdue receivables), paired with a React/TypeScript 'mission control' frontend. The repository includes a backend test suite covering the policy engine, safety gates, checkout abandonment, receivables promises, and net-recovery simulation. It is an experimental prototype (MIT licensed), not a deployed service.",
  technologies: ["Python", "FastAPI", "React", "TypeScript", "Vite", "Tailwind CSS", "MIT License"],
  skills: ["Full-stack development", "Policy/rule-engine design", "Test-driven prototyping", "Simulation design", "API design"],
  architecture: {
    overview:
      "The backend exposes FastAPI endpoints over a database-backed domain model; a policy engine evaluates guardrails before any recovery action, safety gates bound the actions, and a net-recovery simulation measures the loop. The React frontend presents the mission-control view.",
    layers: ["Transaction diagnostics", "Guardrail / policy engine", "Safety gates", "Recovery action executor", "Net-recovery simulation", "Mission-control frontend (React)"],
  },
  caseStudy: {
    problem:
      "Merchants lose revenue to silent transaction failures, abandoned checkouts, and unpaid invoices — and naive retry strategies burn margins while violating card-network rules.",
    solution:
      "RecoverAI models the recovery loop as a controlled system: diagnose the failure, evaluate guardrails deterministically, execute only bounded recovery actions, and measure the outcome through simulation before any real-world deployment.",
    features: [
      {
        title: "Policy engine with compliance tests",
        description: "Guardrail evaluation is deterministic and covered by dedicated tests (e.g. card-network retry limits).",
      },
      {
        title: "Safety gates",
        description: "Recovery actions are bounded by explicit safety-gate tests rather than open-ended retries.",
      },
      {
        title: "Scenario coverage",
        description: "Tests cover checkout abandonment, receivables promises, and a net-recovery simulation harness.",
      },
      {
        title: "Mission-control frontend",
        description: "A React 19 + TypeScript + Tailwind interface presents the recovery platform's state.",
      },
    ],
  },
  links: [{ label: "View source on GitHub", href: "https://github.com/StretchWave/RecoverAI" }],
  demonstration: {
    kind: "interactive-terminal",
    initialCommand: "recoverai policy eval",
    availableCommands: {
      "recoverai policy eval": "Executing deterministic policy engine...\nRule [R-101]: Checkout abandonment < 24h -> Soft reminder email dispatched\nRule [R-102]: Promise-to-pay active -> Safety gate: SUPPRESS escalation\nRule [R-103]: Payment overdue > 14d -> Escalation review queued\nResult: 100% COMPLIANT (0 harassment/safety violations)",
      "recoverai test": "Running pytest suite for policy engine...\ntests/test_policy_engine.py::test_compliance PASSED\ntests/test_safety_gates.py::test_no_harassment PASSED\ntests/test_simulation.py::test_net_recovery PASSED\n10 passed in 0.38s",
      "recoverai sim --days 30": "Simulating 30-day net recovery yield...\nCohort Size: 1,500 accounts\nProjected Recovered Capital: $42,850.00 (+14.2% vs baseline)\nCustomer Churn Rate: 1.8% (Historical min: 2.1%)",
    },
  },
  exhibit: {
    area: "software-district",
    presentation: "information-display",
    position: [0, 0, -5.2],
    accent: "#06b6d4",
    interactionRange: 2.8,
  },
} as const satisfies PortfolioProject;