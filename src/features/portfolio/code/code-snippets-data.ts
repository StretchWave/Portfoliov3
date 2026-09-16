export interface CodeSnippetItem {
  id: string;
  projectId: string;
  title: string;
  filePath: string;
  language: "dart" | "python" | "typescript";
  complexity: string;
  description: string;
  code: string;
  highlights?: string[];
}

export const PROJECT_CODE_SNIPPETS: Record<string, CodeSnippetItem[]> = {
  sonara: [
    {
      id: "sonara-provider-chain",
      projectId: "sonara",
      title: "Resilient Provider Chain Resolver",
      filePath: "lib/services/resolvers/provider_chain.dart",
      language: "dart",
      complexity: "O(k) where k = active fallback providers",
      description:
        "Sequential fallback provider chain resolving lossless music streams and playlist URLs without persisting user API credentials.",
      code: `class ProviderChainResolver {
  final List<StreamProvider> _providers;
  final CacheService _cache;

  ProviderChainResolver({
    required List<StreamProvider> providers,
    required CacheService cache,
  }) : _providers = providers,
       _cache = cache;

  Future<PlaybackStream> resolveStream(TrackMetadata track) async {
    // 1. Check local offline memory/disk cache first
    final cached = await _cache.getStreamCache(track.id);
    if (cached != null && !cached.isExpired) {
      return cached.toPlaybackStream();
    }

    // 2. Cascade through providers (Qobuz -> Tidal -> YouTube Music fallback)
    List<String> errors = [];
    for (final provider in _providers) {
      if (!provider.isAvailable) continue;

      try {
        final stream = await provider.fetchAudioStream(
          trackQuery: "\${track.title} \${track.artist}",
          durationSeconds: track.duration,
          bitrateTarget: BitrateTarget.high,
        );

        if (stream.isValid) {
          // Warm cache for subsequent playback
          await _cache.storeStream(track.id, stream);
          return stream;
        }
      } catch (e) {
        errors.add("\${provider.name}: \${e.toString()}");
        continue; // Fall through to next available resolver
      }
    }

    throw StreamResolutionException(
      "All providers failed to resolve stream for '\${track.title}'. Log: \${errors.join('; ')}"
    );
  }
}`,
    },
  ],

  lyrune: [
    {
      id: "lyrune-fft-bins",
      projectId: "lyrune",
      title: "Logarithmic FFT Spectrum Binning",
      filePath: "src/audio/fft_visualizer.py",
      language: "python",
      complexity: "O(N log N) FFT + O(B) logarithmic bin aggregation",
      description:
        "Performs fast Fourier transform over WASAPI loopback audio buffers, grouping frequencies into perceptually spaced logarithmic bands.",
      code: `import numpy as np
from PyQt6.QtCore import QObject, pyqtSignal

class SpectralAnalyzer(QObject):
    spectrum_ready = pyqtSignal(np.ndarray)

    def __init__(self, sample_rate: int = 44100, fft_size: int = 2048, num_bands: int = 32):
        super().__init__()
        self.sample_rate = sample_rate
        self.fft_size = fft_size
        self.num_bands = num_bands
        self.window = np.hanning(fft_size)
        
        # Precompute logarithmic band boundary indices (20 Hz - 20,000 Hz)
        freqs = np.fft.rfftfreq(fft_size, 1.0 / sample_rate)
        log_edges = np.logspace(np.log10(20), np.log10(sample_rate / 2), num_bands + 1)
        self.band_indices = np.digitize(freqs, log_edges) - 1

    def process_buffer(self, raw_samples: np.ndarray) -> np.ndarray:
        if len(raw_samples) < self.fft_size:
            return np.zeros(self.num_bands)

        # Apply Hanning window to prevent spectral leakage
        windowed = raw_samples[-self.fft_size:] * self.window
        fft_complex = np.fft.rfft(windowed)
        magnitudes = np.abs(fft_complex) / (self.fft_size / 2)

        # Vectorized aggregation across precomputed logarithmic bins
        bands = np.zeros(self.num_bands, dtype=np.float32)
        for i in range(self.num_bands):
            mask = (self.band_indices == i)
            if np.any(mask):
                bands[i] = np.mean(magnitudes[mask])

        # Smooth and normalize decibel scale
        db_scaled = 20 * np.log10(np.maximum(bands, 1e-5))
        normalized = np.clip((db_scaled + 60) / 60.0, 0.0, 1.0)
        
        self.spectrum_ready.emit(normalized)
        return normalized`,
    },
  ],

  "kerala-flood-risk-platform": [
    {
      id: "kerala-runoff-calc",
      projectId: "kerala-flood-risk-platform",
      title: "Antecedent Precipitation & Runoff Differential",
      filePath: "src/hydrology/runoff_engine.py",
      language: "python",
      complexity: "O(P × T) where P = 941 panchayats, T = 72 rolling hours",
      description:
        "Calculates the cumulative Antecedent Precipitation Index (API) with soil saturation decay constants across 941 local governance panchayats.",
      code: `import numpy as np
import pandas as pd

class HydrologicalRunoffEngine:
    def __init__(self, decay_coefficient: float = 0.88):
        # alpha factor represents 24h soil moisture retention decay
        self.decay_coefficient = decay_coefficient

    def compute_antecedent_precipitation_index(
        self, hourly_rainfall_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Calculates API_t = sum_{i=1}^N (R_{t-i} * alpha^i)
        rolling over past 72 hours per panchayat station.
        """
        api_matrix = pd.DataFrame(index=hourly_rainfall_df.index)

        for col in hourly_rainfall_df.columns:
            series = hourly_rainfall_df[col].values
            n_hours = len(series)
            api_values = np.zeros(n_hours, dtype=np.float64)

            # Exponential convolution kernel for 72-hour memory
            decay_weights = self.decay_coefficient ** np.arange(1, 73)

            for t in range(72, n_hours):
                window = series[t-72:t]
                # Inverted window dot-product with decay weights
                api_values[t] = np.dot(window[::-1], decay_weights)

            api_matrix[col] = api_values

        return api_matrix

    def evaluate_risk_tier(self, api_score: float, river_gauge_m: float, elevation_m: float) -> str:
        # Combined localized hydrostatic vulnerability index
        hydro_index = (api_score * 0.55) + ((river_gauge_m / max(1.0, elevation_m)) * 45.0)
        
        if hydro_index > 85.0:
            return "RED_CRITICAL"
        elif hydro_index > 60.0:
            return "ORANGE_ALERT"
        elif hydro_index > 35.0:
            return "YELLOW_WARNING"
        return "GREEN_NORMAL"`,
    },
  ],

  recoverai: [
    {
      id: "recoverai-policy-eval",
      projectId: "recoverai",
      title: "Deterministic Guardrail Policy Evaluator",
      filePath: "src/policy/guardrail_engine.py",
      language: "python",
      complexity: "O(R) where R = safety compliance ruleset",
      description:
        "Deterministic rule-based safety evaluation preventing non-compliant recovery actions and enforcing credit network cooling periods.",
      code: `from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

class RecoveryActionType(Enum):
    SOFT_EMAIL = "soft_email"
    SMS_REMINDER = "sms_reminder"
    VOICE_ESCALATION = "voice_escalation"
    SUPPRESS_ACTION = "suppress_action"

@dataclass
class TransactionAccount:
    account_id: str
    outstanding_cents: int
    days_overdue: int
    last_contact_at: Optional[datetime]
    promise_to_pay_active: bool
    retry_attempts_24h: int

class GuardrailPolicyEngine:
    MAX_RETRIES_24H = 3
    PROMISE_GRACE_PERIOD_DAYS = 5

    def evaluate_action(self, account: TransactionAccount) -> RecoveryActionType:
        # Rule R-101: Never escalate if promise-to-pay commitment is active
        if account.promise_to_pay_active:
            return RecoveryActionType.SUPPRESS_ACTION

        # Rule R-102: Strict card-network compliance limit on daily retries
        if account.retry_attempts_24h >= self.MAX_RETRIES_24H:
            return RecoveryActionType.SUPPRESS_ACTION

        # Rule R-103: Early checkout abandonment (< 3 days overdue)
        if account.days_overdue <= 3:
            return RecoveryActionType.SOFT_EMAIL

        # Rule R-104: Moderate delinquency (4 - 14 days)
        if 4 <= account.days_overdue <= 14:
            return RecoveryActionType.SMS_REMINDER

        # Rule R-105: Extended delinquency (> 14 days) -> human escalation
        return RecoveryActionType.VOICE_ESCALATION`,
    },
  ],

  "lucida-sync": [
    {
      id: "lucida-rate-limiter",
      projectId: "lucida-sync",
      title: "Async Token Bucket Rate Limiter",
      filePath: "src/network/rate_limiter.py",
      language: "python",
      complexity: "O(1) amortized lock acquisition",
      description:
        "High-performance token-bucket rate limiter with exponential jitter backoff for high-throughput media ingestion.",
      code: `import asyncio
import time
import random

class AsyncTokenBucket:
    def __init__(self, rate_per_second: float = 4.0, capacity: float = 8.0):
        self.rate = rate_per_second
        self.capacity = capacity
        self.tokens = capacity
        self.last_update = time.monotonic()
        self._lock = asyncio.Lock()

    async def acquire(self, tokens_needed: float = 1.0) -> None:
        async with self._lock:
            while True:
                now = time.monotonic()
                elapsed = now - self.last_update
                self.last_update = now
                self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)

                if self.tokens >= tokens_needed:
                    self.tokens -= tokens_needed
                    return

                # Calculate required sleep with gentle randomized jitter
                wait_time = (tokens_needed - self.tokens) / self.rate
                jitter = random.uniform(0.02, 0.08)
                await asyncio.sleep(wait_time + jitter)`,
    },
  ],

  "neerad-store": [
    {
      id: "neerad-db-transaction",
      projectId: "neerad-store",
      title: "ACID Transaction & WAL Journal Manager",
      filePath: "src/database/transaction_manager.py",
      language: "python",
      complexity: "O(1) transactional commit with atomic rollback",
      description:
        "Local-first SQLite connection manager enforcing Write-Ahead Logging (WAL) and atomic inventory mutation rollbacks during POS sales.",
      code: `import sqlite3
from contextlib import contextmanager
from typing import Generator

class DatabaseService:
    def __init__(self, db_path: str = "neerad_store.db"):
        self.db_path = db_path
        self._initialize_wal_mode()

    def _initialize_wal_mode(self) -> None:
        with sqlite3.connect(self.db_path) as conn:
            # Enable WAL mode for concurrent readers and zero-block writes
            conn.execute("PRAGMA journal_mode = WAL;")
            conn.execute("PRAGMA synchronous = NORMAL;")
            conn.execute("PRAGMA foreign_keys = ON;")

    @contextmanager
    def atomic_transaction(self) -> Generator[sqlite3.Cursor, None, None]:
        conn = sqlite3.connect(self.db_path)
        conn.isolation_level = None # Explicit transaction management
        cursor = conn.cursor()
        try:
            cursor.execute("BEGIN IMMEDIATE;")
            yield cursor
            cursor.execute("COMMIT;")
        except Exception as exc:
            cursor.execute("ROLLBACK;")
            raise DatabaseTransactionError(f"Transaction aborted: {exc}") from exc
        finally:
            conn.close()`,
    },
  ],

  scrollbrake: [
    {
      id: "scrollbrake-dom-observer",
      projectId: "scrollbrake",
      title: "DOM Mutation Feed Culling & Classification",
      filePath: "src/content/content_guard.ts",
      language: "typescript",
      complexity: "O(M) where M = mutated DOM node subtrees",
      description:
        "High-performance MutationObserver inspecting feed additions and dispatching content to Gemini on-device classification before layout rendering.",
      code: `class FeedMutationInterceptor {
  private observer: MutationObserver;
  private processedIds: Set<string> = new Set();

  constructor() {
    this.observer = new MutationObserver(this.handleMutations.bind(this));
  }

  public attach(): void {
    const target = document.querySelector("#contents") || document.body;
    this.observer.observe(target, { childList: true, subtree: true });
  }

  private handleMutations(mutations: MutationRecord[]): void {
    for (const record of mutations) {
      for (const node of Array.from(record.addedNodes)) {
        if (!(node instanceof HTMLElement)) continue;

        const shortsElement = node.matches("ytd-reel-shelf-renderer")
          ? node
          : node.querySelector("ytd-reel-shelf-renderer");

        if (shortsElement && shortsElement instanceof HTMLElement) {
          this.cullDistractionNode(shortsElement);
        }
      }
    }
  }

  private cullDistractionNode(el: HTMLElement): void {
    // Intercept display before layout paint
    el.style.display = "none";
    el.setAttribute("data-scrollbrake-blocked", "true");
    chrome.runtime.sendMessage({ type: "SHORT_BLOCKED", timestamp: Date.now() });
  }
}`,
    },
  ],

  "stance-combat-pvp": [
    {
      id: "pvp-state-machine",
      projectId: "stance-combat-pvp",
      title: "Discrete Frame Buffer State Machine",
      filePath: "src/gameplay/stance_engine.ts",
      language: "typescript",
      complexity: "O(1) deterministic transition per simulation tick (60Hz)",
      description:
        "Fixed-tick combat state machine executing priority queues for parrying, stance breaks, and counter-attacks.",
      code: `export type CombatStance = "High" | "Mid" | "Low";
export type ActionState = "Idle" | "Startup" | "Active" | "Recovery" | "Parrying";

export class StanceStateMachine {
  public stance: CombatStance = "Mid";
  public state: ActionState = "Idle";
  public currentFrame: number = 0;
  public totalActionFrames: number = 0;

  public transitionStance(newStance: CombatStance): boolean {
    // Cannot shift stance while committed to active attack frames
    if (this.state === "Active" || this.state === "Startup") {
      return false;
    }
    this.stance = newStance;
    return true;
  }

  public registerInput(input: "light" | "heavy" | "parry", targetStance: CombatStance): void {
    if (this.state !== "Idle") return;

    if (input === "parry") {
      this.state = "Parrying";
      this.totalActionFrames = 12; // 12-frame active parry window
      this.currentFrame = 0;
    } else {
      this.state = "Startup";
      this.totalActionFrames = input === "light" ? 18 : 34;
      this.currentFrame = 0;
    }
  }

  public tick(): void {
    if (this.state === "Idle") return;

    this.currentFrame++;
    if (this.currentFrame >= this.totalActionFrames) {
      this.state = "Idle";
      this.currentFrame = 0;
    }
  }
}`,
    },
  ],
};
