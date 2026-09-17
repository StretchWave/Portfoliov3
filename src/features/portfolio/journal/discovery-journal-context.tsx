"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import { loadDiscovery, saveDiscovery } from "@/lib/storage";

export interface MilestoneItem {
  id: string;
  category: "District" | "Demonstration" | "System";
  title: string;
  description: string;
  href?: string;
}

export const ALL_MILESTONES: MilestoneItem[] = [
  // Districts
  {
    id: "district-atlas-hub",
    category: "District",
    title: "Atlas Central Hub",
    description: "Entered the central reference exhibition hall and spatial portal hub.",
    href: "/interactive",
  },
  {
    id: "district-software-district",
    category: "District",
    title: "Software Systems District",
    description: "Discovered the server architecture and desktop software lab.",
  },
  {
    id: "district-intelligence-observatory",
    category: "District",
    title: "Intelligent Systems Observatory",
    description: "Discovered the telemetry and flood predictive analytics deck.",
  },
  {
    id: "district-creative-workshop",
    category: "District",
    title: "Creative & Interactive Workshop",
    description: "Discovered the combat mechanics arena and interactive media space.",
  },

  // Demonstrations
  {
    id: "demo-lyrune-dsp",
    category: "Demonstration",
    title: "Real-Time Audio DSP Engine",
    description: "Operated the Web Audio API oscillator waveforms, filter cutoff, and FFT visualizer.",
    href: "/projects/lyrune",
  },
  {
    id: "demo-terminal",
    category: "Demonstration",
    title: "Simulated Command Console",
    description: "Ran simulated telemetry commands in Lucida-Sync or RecoverAI.",
    href: "/projects/lucida-sync",
  },
  {
    id: "demo-flood-sim",
    category: "Demonstration",
    title: "Geospatial Inundation Model",
    description: "Simulated precipitation and reservoir capacity in the Kerala Flood Platform.",
    href: "/projects/kerala-flood-risk-platform",
  },
  {
    id: "demo-combat-trainer",
    category: "Demonstration",
    title: "Combat Timing & Stances",
    description: "Tested Parry, Dodge, or Block defense mechanics in Stance Combat PvP.",
    href: "/projects/stance-combat-pvp",
  },

  // Systems
  {
    id: "sys-command-palette",
    category: "System",
    title: "Universal Command Palette",
    description: "Opened the Ctrl+K fuzzy search index and fast-travel palette.",
  },
  {
    id: "sys-spatial-radar",
    category: "System",
    title: "Spatial Radar & Mini-Map",
    description: "Engaged the holographic directional radar HUD (M).",
  },
  {
    id: "sys-procedural-audio",
    category: "System",
    title: "Procedural Audio Synthesizer",
    description: "Activated synthesized sound effects with zero external audio assets.",
  },
  {
    id: "sys-skills-evidence",
    category: "System",
    title: "Evidence-Based Skills Index",
    description: "Explored technical competencies verified against public repositories.",
    href: "/skills",
  },
];

export const VALID_MILESTONE_IDS = new Set<string>(ALL_MILESTONES.map((m) => m.id));

interface DiscoveryToast {
  id: string;
  title: string;
  category: string;
}

interface DiscoveryJournalContextValue {
  discoveredIds: string[];
  totalMilestones: number;
  progressPercent: number;
  activeToast: DiscoveryToast | null;
  recordDiscovery: (id: string, title?: string, category?: string) => void;
  isJournalOpen: boolean;
  setIsJournalOpen: (open: boolean) => void;
}

export function computeDiscoveryProgress(discoveredIds: string[]): { validCount: number; total: number; percent: number } {
  const validIds = new Set(discoveredIds.filter((id) => VALID_MILESTONE_IDS.has(id)));
  const total = ALL_MILESTONES.length;
  const validCount = validIds.size;
  const percent = total > 0 ? Math.min(100, Math.round((validCount / total) * 100)) : 0;
  return { validCount, total, percent };
}

const EMPTY_DISCOVERY_IDS: string[] = [];
let cachedIds: string[] = [];
let cachedRaw = "";
const discoveryListeners = new Set<() => void>();

function subscribeDiscovery(listener: () => void): () => void {
  discoveryListeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    discoveryListeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

function notifyDiscoveryChange(): void {
  for (const listener of discoveryListeners) {
    listener();
  }
}

function getDiscoverySnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY_DISCOVERY_IDS;
  try {
    const raw = window.localStorage.getItem("atlas-discovery-v1") || "";
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      const data = loadDiscovery();
      cachedIds = data.discoveredIds.filter((id) => VALID_MILESTONE_IDS.has(id));
    }
    return cachedIds;
  } catch {
    return EMPTY_DISCOVERY_IDS;
  }
}

function getDiscoveryServerSnapshot(): string[] {
  return EMPTY_DISCOVERY_IDS;
}

const DiscoveryJournalContext = createContext<DiscoveryJournalContextValue | null>(null);

export function DiscoveryJournalProvider({ children }: { children: ReactNode }) {
  const discoveredIds = useSyncExternalStore(
    subscribeDiscovery,
    getDiscoverySnapshot,
    getDiscoveryServerSnapshot
  );

  const [activeToast, setActiveToast] = useState<DiscoveryToast | null>(null);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for 'J' key to toggle journal and Escape to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLElement &&
        (e.target.closest("input, textarea, select") ||
          e.target.closest(".command-backdrop"))
      ) {
        return;
      }
      if (e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsJournalOpen((prev) => !prev);
      } else if (e.key === "Escape" && isJournalOpen) {
        setIsJournalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isJournalOpen]);

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const recordDiscovery = useCallback((id: string, title?: string, category?: string) => {
    if (!VALID_MILESTONE_IDS.has(id)) return;

    const current = getDiscoverySnapshot();
    if (!current.includes(id)) {
      const updated = [...current, id];
      saveDiscovery(updated);
      if (typeof window !== "undefined") {
        cachedRaw = window.localStorage.getItem("atlas-discovery-v1") || "";
      }
      cachedIds = updated;
      notifyDiscoveryChange();
    }

    const meta = ALL_MILESTONES.find((m) => m.id === id);
    const toastTitle = title || meta?.title || id;
    const toastCat = category || meta?.category || "Discovery";

    setActiveToast({ id, title: toastTitle, category: toastCat });

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 4500);
  }, []);

  // Strict bounded progress calculation (cannot exceed 100%)
  const progressData = useMemo(() => {
    return computeDiscoveryProgress(discoveredIds);
  }, [discoveredIds]);

  const progressPercent = progressData.percent;

  const value = useMemo<DiscoveryJournalContextValue>(
    () => ({
      discoveredIds,
      totalMilestones: ALL_MILESTONES.length,
      progressPercent,
      activeToast,
      recordDiscovery,
      isJournalOpen,
      setIsJournalOpen,
    }),
    [discoveredIds, progressPercent, activeToast, recordDiscovery, isJournalOpen]
  );

  return (
    <DiscoveryJournalContext.Provider value={value}>
      {children}
      {/* Micro-Toast in Bottom-Left */}
      {activeToast ? (
        <div className="discovery-toast" role="status" aria-live="polite">
          <div className="discovery-toast__icon">✦</div>
          <div className="discovery-toast__content">
            <span className="discovery-toast__eyebrow">
              {activeToast.category.toUpperCase()} UNLOCKED
            </span>
            <strong className="discovery-toast__title">{activeToast.title}</strong>
          </div>
        </div>
      ) : null}
    </DiscoveryJournalContext.Provider>
  );
}

export function useDiscoveryJournal(): DiscoveryJournalContextValue {
  const context = useContext(DiscoveryJournalContext);
  if (!context) {
    throw new Error("useDiscoveryJournal must be used within DiscoveryJournalProvider");
  }
  return context;
}
