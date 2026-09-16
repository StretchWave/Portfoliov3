export interface ProjectArchitectureSpec {
  projectId: string;
  name: string;
  categoryTitle: string;
  paradigm: string;
  latencyBudget: string;
  stateStrategy: string;
  failureMode: string;
  concurrencyModel: string;
  primaryTradeoff: {
    chosen: string;
    rejected: string;
    rationale: string;
  };
  metrics: {
    responsiveness: number; // 1-10: How fast user actions yield feedback
    complexity: number;     // 1-10: Number of interacting subsystems & algorithms
    resilience: number;     // 1-10: Ability to handle degraded network / data loss
    throughput: number;     // 1-10: Volume of data processed per unit time
    autonomy: number;       // 1-10: Independence from external cloud infra / accounts
  };
  accentColor: string;
}

export interface ComparisonPreset {
  id: string;
  title: string;
  badge: string;
  description: string;
  projectIds: string[];
}

export const COMPARISON_SPECS: Record<string, ProjectArchitectureSpec> = {
  sonara: {
    projectId: "sonara",
    name: "Sonara",
    categoryTitle: "Flagship Streaming Audio Client",
    paradigm: "Event-Driven Audio Pipeline + Resolver Chain",
    latencyBudget: "< 120ms initial stream buffer / zero-stutter playback",
    stateStrategy: "Reactive Rx/StreamControllers + SQLite offline cache",
    failureMode: "Automatic resolver fallback (Lossless -> YouTube -> Local cache)",
    concurrencyModel: "Multi-threaded Dart isolates for byte demuxing & metadata sync",
    primaryTradeoff: {
      chosen: "Zero-credential resolver architecture & client-side parsing",
      rejected: "Centralized proxy backend with stored user API keys",
      rationale:
        "Guarantees privacy and zero user account friction; eliminates single-point-of-failure servers while keeping lossless streaming functional.",
    },
    metrics: {
      responsiveness: 9,
      complexity: 8,
      resilience: 9,
      throughput: 8,
      autonomy: 10,
    },
    accentColor: "#f472d0",
  },

  lyrune: {
    projectId: "lyrune",
    name: "Lyrune",
    categoryTitle: "Flagship Desktop Media & DSP Overlay",
    paradigm: "Asynchronous Desktop IPC + Dual-Loop DSP Engine",
    latencyBudget: "< 16ms frame budget (60 FPS) & < 50ms timestamp sync",
    stateStrategy: "Thread-isolated in-memory cache + disk LRCLIB catalog",
    failureMode: "Logarithmic fallbacks to window-title heuristics & cached LRC",
    concurrencyModel: "QThread COM/asyncio isolation separate from Qt GUI render loop",
    primaryTradeoff: {
      chosen: "Binary-search bisect lyric indexing with dedicated WinRT worker thread",
      rejected: "Linear scan on GUI timer thread with synchronous media querying",
      rationale:
        "Prevents desktop frame drops and GUI stuttering even during heavy audio FFT spectrum visualization.",
    },
    metrics: {
      responsiveness: 10,
      complexity: 9,
      resilience: 8,
      throughput: 7,
      autonomy: 9,
    },
    accentColor: "#38bdf8",
  },

  "kerala-flood-risk-platform": {
    projectId: "kerala-flood-risk-platform",
    name: "Kerala Flood Risk Platform",
    categoryTitle: "Flagship Geospatial Decision Support",
    paradigm: "Tri-Engine ETL Pipeline + XGBoost Risk Inference",
    latencyBudget: "Hourly batch telemetry aggregation / sub-second API queries",
    stateStrategy: "Parquet telemetry lakehouse + BigQuery feature store",
    failureMode: "Synthetic historical fallback data generator for reproducible tests",
    concurrencyModel: "GPU-accelerated cuDF kernels & distributed PySpark feature jobs",
    primaryTradeoff: {
      chosen: "Panchayat-level granular decision-support over basin-level forecasting",
      rejected: "Monolithic raw river-gauge threshold alerting",
      rationale:
        "Raw gauge river heights fail to inform local disaster relief teams which specific villages will flood; localized risk models turn telemetry into action.",
    },
    metrics: {
      responsiveness: 7,
      complexity: 10,
      resilience: 9,
      throughput: 10,
      autonomy: 7,
    },
    accentColor: "#34d399",
  },

  recoverai: {
    projectId: "recoverai",
    name: "RecoverAI",
    categoryTitle: "Deterministic Policy Engine & Guardrails",
    paradigm: "Deterministic Guardrail Pipeline & State Gates",
    latencyBudget: "< 85ms policy evaluation per transaction event",
    stateStrategy: "PostgreSQL transactional state machine + audit trail ledger",
    failureMode: "Fail-safe suppression: suppress aggressive collection if uncertain",
    concurrencyModel: "Async FastAPI coroutines with bounded safety-gate execution",
    primaryTradeoff: {
      chosen: "Deterministic rule gates & simulation verification before actions",
      rejected: "Unconstrained LLM agent autonomous retry loops",
      rationale:
        "Card networks impose strict penalty fines for aggressive or non-compliant retries; deterministic boundaries prevent harassment violations.",
    },
    metrics: {
      responsiveness: 8,
      complexity: 8,
      resilience: 10,
      throughput: 8,
      autonomy: 8,
    },
    accentColor: "#06b6d4",
  },

  "lucida-sync": {
    projectId: "lucida-sync",
    name: "Lucida-Sync",
    categoryTitle: "Rate-Limited Media Pipeline & CLI",
    paradigm: "Bounded Concurrency Queue + Resilient Session Scraping",
    latencyBudget: "Adaptive exponential backoff respecting upstream rate quotas",
    stateStrategy: "Local session cookies + resumable multi-part download registry",
    failureMode: "Dynamic session re-negotiation and exponential jitter backoff",
    concurrencyModel: "Asyncio semaphore-throttled connection pool",
    primaryTradeoff: {
      chosen: "Token bucket rate limiting with Rich terminal visualizer",
      rejected: "Unbounded parallel HTTP GET threads",
      rationale:
        "Protects user IP from rate-limiting bans while maximizing sustained download throughput across high-fidelity media.",
    },
    metrics: {
      responsiveness: 8,
      complexity: 7,
      resilience: 9,
      throughput: 9,
      autonomy: 9,
    },
    accentColor: "#fbbf24",
  },

  "neerad-store": {
    projectId: "neerad-store",
    name: "Neerad Store",
    categoryTitle: "Local-First Commercial ERP Engine",
    paradigm: "Local-First Desktop Database with Transactional ACID Guarantees",
    latencyBudget: "< 5ms local transaction commit and barcode scanner response",
    stateStrategy: "ACID SQLite embedded engine with WAL journaling & auto-backups",
    failureMode: "Crash-safe WAL journal rollback and daily snapshot rotation",
    concurrencyModel: "Single-writer multi-reader SQLite locking pattern",
    primaryTradeoff: {
      chosen: "Embedded SQLite zero-cloud local-first desktop application",
      rejected: "SaaS cloud-hosted database with monthly subscription",
      rationale:
        "Retail stores cannot afford internet outage downtime during peak checkout rushes; local-first ensures zero latency and uninterrupted sales.",
    },
    metrics: {
      responsiveness: 9,
      complexity: 7,
      resilience: 10,
      throughput: 7,
      autonomy: 10,
    },
    accentColor: "#a78bfa",
  },

  scrollbrake: {
    projectId: "scrollbrake",
    name: "ScrollBrake",
    categoryTitle: "Browser Extension AI Behavioral Guardrail",
    paradigm: "MV3 Service Worker + On-Device DOM Guardrail",
    latencyBudget: "< 35ms content script DOM injection before feed rendering",
    stateStrategy: "Chrome sync storage + local rule cache",
    failureMode: "Passive pass-through if Gemini classification API times out",
    concurrencyModel: "Manifest V3 event-driven ephemeral background service worker",
    primaryTradeoff: {
      chosen: "Ephemeral MV3 background worker with client-side DOM culling",
      rejected: "Persistent background script (deprecated) or proxy server",
      rationale:
        "Eliminates memory overhead when browser tabs are idle; ensures strict user privacy without routing web traffic through external proxies.",
    },
    metrics: {
      responsiveness: 9,
      complexity: 7,
      resilience: 8,
      throughput: 6,
      autonomy: 9,
    },
    accentColor: "#f87171",
  },

  "stance-combat-pvp": {
    projectId: "stance-combat-pvp",
    name: "Stance Combat PvP",
    categoryTitle: "Deterministic Deterministic Combat State Machine",
    paradigm: "Discrete Frame-Buffer Stance State Machine",
    latencyBudget: "Sub-frame 16ms window for parry/block reaction frames",
    stateStrategy: "Transient frame buffer state machine with deterministic frames",
    failureMode: "Whiff punishment state transition on mistimed inputs",
    concurrencyModel: "Fixed-tick game simulation loop independent of display refresh",
    primaryTradeoff: {
      chosen: "Strict frame-data priority and commitment windows",
      rejected: "Floating-point animation blending without priority states",
      rationale:
        "Competitive melee combat requires absolute frame-perfect predictability for parrying, stance breaks, and counter-attacks.",
    },
    metrics: {
      responsiveness: 10,
      complexity: 8,
      resilience: 8,
      throughput: 6,
      autonomy: 10,
    },
    accentColor: "#f97316",
  },
};

export const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: "desktop-ipc",
    title: "Desktop Performance & IPC",
    badge: "DESKTOP ARCHITECTURE",
    description: "Compare Sonara's streaming audio architecture with Lyrune's low-latency PyQt6 DSP engine.",
    projectIds: ["sonara", "lyrune"],
  },
  {
    id: "governance-resilience",
    title: "Governance & Bounded Execution",
    badge: "SAFETY & RELIABILITY",
    description: "Compare RecoverAI's deterministic policy guardrails against Lucida-Sync's adaptive rate-limiting engine.",
    projectIds: ["recoverai", "lucida-sync"],
  },
  {
    id: "geospatial-vs-local",
    title: "Big Data vs Local-First Autonomy",
    badge: "DATA ARCHITECTURE",
    description: "Contrast Kerala Flood Risk's GPU ETL lakehouse with Neerad Store's zero-cloud ACID persistence.",
    projectIds: ["kerala-flood-risk-platform", "neerad-store"],
  },
  {
    id: "flagship-triad",
    title: "The Flagship Triad",
    badge: "FULL-SPECTRUM ARCHITECTURE",
    description: "Simultaneous 3-way comparison across all three primary flagships in the Atlas ecosystem.",
    projectIds: ["sonara", "lyrune", "kerala-flood-risk-platform"],
  },
];
