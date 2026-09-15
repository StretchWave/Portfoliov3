import type { PortfolioProject } from "@/types/portfolio";

export const scrollbrakeProject = {
  id: "scrollbrake",
  slug: "scrollbrake",
  name: "ScrollBrake",
  category: "web-development",
  secondaryCategories: ["experimental"],
  status: "prototype",
  priority: "experiment",
  featured: false,
  summary: "A privacy-first Chromium extension that uses Gemini AI classification to block doomscrolling.",
  description:
    "ScrollBrake is a Manifest V3 browser extension (Chrome, Brave, Edge, Opera, Vivaldi) that combines Google Gemini video classification with an anti-doomscroll blocker. YouTube standard videos are classified against the user's personal goals (an unclosable 60-second awareness card appears for non-productive content at high confidence), YouTube Shorts trigger an instant confrontation reminder, and Instagram Reels are terminated outright. It auto-discovers free-tier Gemini models from the user's own API key, keeps content scripts scoped per platform, and ships with install scripts and a verification test.",
  technologies: ["JavaScript", "Manifest V3", "Chrome Extensions API", "Google Gemini API", "Content scripts", "Service worker"],
  skills: ["Browser extension development", "Content script architecture", "LLM API integration", "Privacy-conscious design"],
  architecture: {
    overview:
      "A service worker coordinates blocking policy while per-platform content scripts observe and act on YouTube, Shorts, and Instagram feeds. Gemini classification runs from the user's own API key, and popup/options pages configure behavior.",
    layers: ["MV3 service worker", "YouTube content script + Gemini classification", "Shorts & Instagram blockers", "Popup / options UI", "Build & install scripts"],
  },
  caseStudy: {
    problem:
      "Doomscrolling feeds are designed to hold attention; generic blockers either block everything or nothing, and AI-based ones often require paid APIs or central servers.",
    solution:
      "ScrollBrake keeps classification local to the user's own free-tier Gemini key, applies the right friction per platform (awareness card, reminder, or tab termination), and never sends browsing history to a server the user does not control.",
    features: [
      {
        title: "AI video classification",
        description: "YouTube titles, channels, descriptions, tags, and transcripts are classified against personal goals with a 0.80 confidence threshold.",
      },
      {
        title: "Free-tier model discovery",
        description: "The extension auto-discovers active free-tier Gemini generation models from the user's Google AI Studio key.",
      },
      {
        title: "Per-platform blocking",
        description: "Standard videos get friction cards, Shorts get instant reminders, and Instagram Reels are closed outright.",
      },
      {
        title: "Build tooling and tests",
        description: "Release-building and icon-generation scripts plus an extension verification script.",
      },
    ],
  },
  links: [{ label: "View source on GitHub", href: "https://github.com/StretchWave/ScrollBrake" }],
  demonstration: { kind: "information" },
  exhibit: {
    area: "creative-workshop",
    presentation: "terminal",
    position: [4.2, 0, -2.5],
    accent: "#a855f7",
    interactionRange: 2.8,
  },
} as const satisfies PortfolioProject;