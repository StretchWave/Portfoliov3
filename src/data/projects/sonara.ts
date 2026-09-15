import type { PortfolioProject } from "@/types/portfolio";

export const sonaraProject = {
  id: "sonara",
  slug: "sonara",
  name: "Sonara",
  category: "mobile-development",
  secondaryCategories: ["desktop-application"],
  status: "active",
  priority: "flagship",
  featured: true,
  summary: "A cross-platform Flutter music streaming app for Android, Windows, and Linux with optional lossless sources.",
  description:
    "Sonara is a Flutter music streaming app (Android, Windows, Linux) built as a fork of the open-source Harmony Music project and extended with the owner's own systems: a Dart playlist-resolver backend that imports public Spotify playlists without a Spotify Developer App, optional Qobuz/Tidal FLAC sources through user-configured resolvers, Last.fm scrobbling, listening statistics, metadata enrichment (MusicBrainz, LRCLIB, Spotify oEmbed), playlist export, and localization across 50+ languages. It is licensed GPL-3.0, including the upstream fork conditions.",
  technologies: ["Dart", "Flutter", "YouTube / YouTube Music streaming", "Dart backend (Spotify resolver)", "Qobuz / Tidal resolvers", "Last.fm", "LRCLIB", "MusicBrainz", "GitHub Actions", "GPL-3.0"],
  skills: ["Cross-platform mobile/desktop development", "Background media playback", "API integration", "Localization", "CI/CD and packaging", "Fork maintenance"],
  architecture: {
    overview:
      "The Flutter app streams from YouTube by default with automatic fallback, and can use community/self-hosted resolver instances for Qobuz/Tidal lossless sources without storing credentials in the app. A separate Dart backend resolves Spotify playlist URLs through a provider chain (cache → anonymous web-player token → scraper → official API) and returns normalized metadata.",
    layers: ["Streaming sources (YouTube / resolvers)", "Playback engine", "Spotify playlist resolver backend (Dart)", "Metadata enrichment", "Last.fm scrobbling & statistics", "Localization (50+ languages)"],
  },
  caseStudy: {
    problem:
      "Streaming apps typically require logins, credentials, or developer accounts, and high-quality (lossless) sources are usually locked behind paid services.",
    solution:
      "Sonara offers a no-login, ad-free app with YouTube as the automatic source, user-configured resolvers for Qobuz/Tidal lossless playback, and a bundled Dart backend that resolves public Spotify playlists without the user creating a Spotify Developer App.",
    features: [
      {
        title: "Multi-source playback",
        description: "YouTube/YouTube Music by default, with optional Qobuz and Tidal FLAC/MP3 sources through resolver instances and automatic fallback when none are reachable.",
      },
      {
        title: "Spotify playlist import without developer credentials",
        description: "A bundled Dart resolver backend normalizes public Spotify playlist URLs through a provider chain: cache, anonymous web-player token, scraper, then official API.",
      },
      {
        title: "Listening history features",
        description: "Last.fm scrobbling and in-app listening statistics keep the listening history portable.",
      },
      {
        title: "Metadata enrichment",
        description: "Imported playlists are enriched with MusicBrainz, LRCLIB, and Spotify oEmbed metadata, with manual match correction.",
      },
      {
        title: "Localization and packaging",
        description: "50+ language translations with a code-generation toolchain, plus GitHub Actions workflows including Windows EXE builds.",
      },
      {
        title: "Playback tools",
        description: "Song downloading (including external storage on Android), sleep timer, equalizer support on Android, Android Auto support, and synced lyrics.",
      },
    ],
    engineeringDecisions: [
      {
        title: "Keep credentials out of the app",
        description: "Lossless sources are accessed through user-configured resolver instances, so the app never stores provider credentials.",
      },
      {
        title: "Provider chain for playlist resolution",
        description: "The resolver backend tries cache, an anonymous web-player token path, a scraper, then the official Spotify API, so imports work without a developer app.",
      },
    ],
  },
  links: [{ label: "View Sonara source on GitHub", href: "https://github.com/StretchWave/Sonara" }],
  demonstration: { kind: "information" },
  exhibit: {
    area: "atlas-hub",
    presentation: "information-display",
    position: [0, 0, -4.8],
    accent: "#f472d0",
    interactionRange: 3.1,
  },
} as const satisfies PortfolioProject;