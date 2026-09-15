import type { PortfolioProject } from "@/types/portfolio";

export const neeradStoreProject = {
  id: "neerad-store",
  slug: "neerad-store",
  name: "Neerad Store",
  category: "desktop-application",
  secondaryCategories: ["mobile-development"],
  status: "in-progress",
  priority: "featured",
  featured: true,
  summary: "A Flutter store-management application with inventory, billing, sales, and settings screens.",
  description:
    "Neerad Store is a Flutter application for managing a store's day-to-day operations: product and sale data models, a local database service, billing and inventory screens, sales tracking, and settings with persistent provider state. The codebase includes custom styling, a sidebar layout, multi-platform Flutter targets (desktop and mobile), and a Python migration tool for importing product data.",
  technologies: ["Dart", "Flutter", "Local database service", "Python migration tooling", "Multi-platform targets"],
  skills: ["Desktop application development", "Data modeling", "CRUD application design", "State management", "Migration tooling"],
  architecture: {
    overview:
      "The app separates data models (product, sale) and a local database service from screen-level presentation, with settings and providers managing application state. A Python migration script handles product data import.",
    layers: ["Product & sale data models", "Local database service", "Billing / inventory / sales screens", "Settings & providers", "Product migration tooling (Python)"],
  },
  links: [{ label: "View source on GitHub", href: "https://github.com/StretchWave/neerad_store" }],
  demonstration: { kind: "information" },
  exhibit: {
    area: "creative-workshop",
    presentation: "information-display",
    position: [-4.2, 0, 1.8],
    accent: "#10b981",
    interactionRange: 2.8,
  },
} as const satisfies PortfolioProject;