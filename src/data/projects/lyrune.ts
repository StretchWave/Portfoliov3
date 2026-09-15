import type { PortfolioProject } from "@/types/portfolio";

export const lyruneProject = {
  id: "lyrune",
  slug: "lyrune",
  name: "Lyrune",
  category: "software-engineering",
  secondaryCategories: ["desktop-application", "interactive-systems"],
  status: "active",
  priority: "flagship",
  featured: true,
  summary: "A cross-platform desktop lyrics overlay and audio visualizer for Spotify and supported web media players.",
  description:
    "Lyrune is an open-source Python desktop application that detects active playback (Spotify and web media players on Windows and Linux), retrieves synchronized lyrics from LRCLIB, and renders them in a configurable frameless overlay. It also includes a standalone floating audio visualizer with WASAPI loopback DSP analysis, overlay presets, click-through behavior, screen-capture exclusion, and full packaging: PyInstaller builds, an Inno Setup installer, and tagged release artifacts from GitHub Actions.",
  technologies: ["Python", "PyQt6", "LRCLIB", "Windows GSMTC", "MPRIS / D-Bus", "WASAPI loopback", "NumPy FFT", "PyInstaller", "Inno Setup", "GitHub Actions"],
  skills: ["Cross-platform desktop integration", "Asynchronous UI design", "Timestamped data lookup", "Audio DSP visualization", "Desktop packaging", "Release automation"],
  architecture: {
    overview:
      "Playback information is collected through platform-specific backends (WinRT GSMTC on Windows, MPRIS over D-Bus on Linux), then normalized into track metadata for LRCLIB lookup and LRC timestamp parsing before the overlay renders the active lyric context. The visualizer captures audio through WASAPI loopback and performs NumPy FFT spectral analysis in logarithmic bins.",
    layers: ["Playback detection", "Track identification", "LRCLIB lookup and cache", "LRC parsing", "Timestamp synchronization", "PyQt6 overlay rendering", "Audio capture & spectral visualization"],
  },
  caseStudy: {
    problem:
      "Lyrune is designed to keep synchronized lyrics visible alongside active playback, without requiring the listener to leave the desktop application or web player already in use.",
    solution:
      "The application combines platform-aware playback detection, LRCLIB retrieval, LRC timestamp parsing, and a customizable PyQt6 overlay, plus a decoupled audio visualizer that captures system audio directly. The result is a desktop-native presentation layer that stays connected to the active track and its lyric timing.",
    features: [
      {
        title: "Platform-aware playback detection",
        description: "Windows uses Global System Media Transport Controls with a window-title fallback, while Linux supports MPRIS through D-Bus, Gio, or playerctl backends.",
      },
      {
        title: "Synchronized LRC lyrics",
        description: "Timestamped LRC data is parsed into ordered lyric lines, letting the application resolve the active line and nearby context as playback advances.",
      },
      {
        title: "Configurable desktop overlay",
        description: "The frameless overlay supports visual presets (Spotify Dark, Cinematic Cyan, Neon Pink, High Contrast), typography and alignment controls, click-through mode, pause-aware hiding, and screen-capture exclusion on Windows.",
      },
      {
        title: "Standalone audio visualizer",
        description: "A decoupled floating visualizer captures system audio via WASAPI loopback and renders live FFT spectral analysis with logarithmic frequency grouping.",
      },
      {
        title: "Correction and caching paths",
        description: "Lyrics can be searched manually through LRCLIB, and fetched results are cached in memory and on disk for later use.",
      },
      {
        title: "Packaging and release builds",
        description: "PyInstaller configurations support Windows and Linux artifacts, an Inno Setup installer is provided for Windows, and a GitHub Actions workflow builds release artifacts from version tags.",
      },
    ],
    engineeringDecisions: [
      {
        title: "Keep WinRT calls off the Qt UI path",
        description: "Windows media queries run on a dedicated QThread with its own COM and asyncio lifecycle, avoiding synchronous media work on the GUI thread.",
      },
      {
        title: "Use binary search for active lyric lookup",
        description: "The LRC parser keeps sorted timestamps and resolves the active line with bisect, rather than scanning every lyric line on each update.",
      },
      {
        title: "Fetch lyrics asynchronously",
        description: "The overlay uses a background worker for lyric retrieval so network work does not block the interactive desktop window.",
      },
      {
        title: "Separate audio capture from the UI thread",
        description: "The visualizer's WASAPI loopback capture and DSP run outside the Qt render path, with attack/decay envelope smoothing applied to the spectral bins.",
      },
    ],
  },
  links: [{ label: "View Lyrune source on GitHub", href: "https://github.com/StretchWave/Lyrune" }],
  demonstration: { kind: "information" },
  exhibit: {
    area: "atlas-hub",
    presentation: "terminal",
    position: [-4.2, 0, -2.6],
    accent: "#68e4ff",
    interactionRange: 3.1,
  },
} as const satisfies PortfolioProject;