import type { PortfolioProject } from "@/types/portfolio";

export const lucidaSyncProject = {
  id: "lucida-sync",
  slug: "lucida-sync",
  name: "Lucida-Sync",
  category: "developer-tools",
  secondaryCategories: ["automation"],
  status: "completed",
  priority: "supporting",
  featured: false,
  summary: "A Python CLI and FastAPI REST API for searching and downloading music through the Lucida.to service.",
  description:
    "Lucida-Sync provides a command-line tool and a REST API for searching and downloading high-quality music (FLAC, MP3, AAC) through Lucida.to's web interface, with Amazon Music as the default service and fallback support for others. No service credentials are required — the client manages HTTP sessions, rate limiting, and Playwright-driven downloads. The codebase is a maintained Python implementation derived from the MIT-licensed lucida-flow project, extended here with setup tooling, rate-limiting documentation, and download tests.",
  technologies: ["Python", "FastAPI", "Playwright", "Rich", "Web scraping", "Rate limiting", "MIT License"],
  skills: ["CLI tooling", "REST API design", "Browser automation", "Web scraping", "HTTP session management", "Fork maintenance"],
  architecture: {
    overview:
      "A session-managed web client wraps Lucida.to's search, metadata, and download flows. Two front ends consume it: a Rich-formatted CLI and a FastAPI server exposing search, info, and download endpoints with CORS and health checks.",
    layers: ["Lucida.to web client (session + rate limiting)", "Search / metadata / download flows", "CLI with Rich output", "FastAPI REST API", "Setup & rate-limit tooling"],
  },
  caseStudy: {
    problem:
      "Downloading high-quality music from streaming services usually requires credentials, paid accounts, or brittle browser sessions.",
    solution:
      "Lucida-Sync works directly against Lucida.to's web interface with no service credentials: a CLI covers interactive use and a FastAPI layer exposes the same flows as REST endpoints for integration.",
    features: [
      {
        title: "CLI commands",
        description: "Search, download, track info, service listing, and configuration commands with colored Rich terminal output.",
      },
      {
        title: "REST API",
        description: "FastAPI endpoints for health, service listing, search, track info, and download/file streaming, with auto-generated docs.",
      },
      {
        title: "Rate limiting and session management",
        description: "The client manages HTTP sessions and rate limits (documented in RATE_LIMITING.md) to stay polite to the upstream service.",
      },
      {
        title: "Setup tooling",
        description: "Setup scripts, split CLI/API dependency manifests, example configuration, and documentation for GitHub deployment.",
      },
    ],
  },
  links: [{ label: "View source on GitHub", href: "https://github.com/StretchWave/lucida-sync" }],
  demonstration: {
    kind: "interactive-terminal",
    initialCommand: "lucida --help",
    availableCommands: {
      "lucida --help": "Lucida-Sync CLI v1.2.0\nUsage: lucida [OPTIONS] COMMAND [ARGS]...\n\nCommands:\n  search    Search across supported streaming sources\n  download  Fetch lossless audio tracks with metadata\n  status    Check API gateway and scraper session pool\n  health    Run healthcheck across worker nodes",
      "lucida search 'Aether'": "Searching Lucida streaming catalog...\n[200 OK] Found 3 tracks:\n  1. Aether - Luminescence [FLAC 24-bit/96kHz]\n  2. Aether - Drifting [FLAC 16-bit/44.1kHz]\n  3. Aether - Void Reverie [MP3 320kbps]",
      "lucida status": "Session Pool: Healthy\nActive Proxies: 4/4\nRate Limit Status: 18 req/min (Normal)\nUpstream Latency: 112ms",
      "lucida download --track 1": "Initiating download session...\nResolving upstream stream tokens...\nFetching Aether - Luminescence.flac [68.4 MB]\nProgress: [========================================] 100%\nMetadata tag injection: COMPLETE\nSaved to ./downloads/Aether - Luminescence.flac",
    },
  },
  exhibit: {
    area: "software-district",
    presentation: "terminal",
    position: [4.0, 0, -2.5],
    accent: "#38bdf8",
    interactionRange: 2.8,
  },
} as const satisfies PortfolioProject;