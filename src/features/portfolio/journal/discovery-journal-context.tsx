"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

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
    description: "Discovered the high-density server lab and architecture zone.",
  },
  {
    id: "district-intelligence-observatory",
    category: "District",
    title: "Intelligent Systems Observatory",
    description: "Discovered the panoramic telemetry and flood predictive analytics deck.",
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
    title: "Interactive Terminal Runner",
    description: "Executed bash telemetry commands in Lucida-Sync or RecoverAI.",
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
    description: "Engaged the 60fps holographic directional radar HUD (M).",
  },
  {
    id: "sys-procedural-audio",
    category: "System",
    title: "Procedural Audio Synthesizer",
    description: "Activated synthesized sound effects with zero external asset overhead.",
  },
  {
    id: "sys-skills-evidence",
    category: "System",
    title: "Evidence-Based Skills Index",
    description: "Explored technical competencies verified against public repositories.",
    href: "/skills",
  },
];

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

const DiscoveryJournalContext = createContext<DiscoveryJournalContextValue | null>(null);

const STORAGE_KEY = "atlas-discovery-log";

export function DiscoveryJournalProvider({ children }: { children: ReactNode }) {
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [activeToast, setActiveToast] = useState<DiscoveryToast | null>(null);
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  // Load initial progress from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDiscoveredIds(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

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

  const recordDiscovery = useCallback((id: string, title?: string, category?: string) => {
    setDiscoveredIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }

      // Find metadata for toast
      const meta = ALL_MILESTONES.find((m) => m.id === id);
      const toastTitle = title || meta?.title || id;
      const toastCat = category || meta?.category || "Discovery";

      setActiveToast({ id, title: toastTitle, category: toastCat });
      setTimeout(() => {
        setActiveToast((current) => (current?.id === id ? null : current));
      }, 4500);

      return updated;
    });
  }, []);

  const progressPercent = Math.round((discoveredIds.length / ALL_MILESTONES.length) * 100);

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
            <span className="discovery-toast__eyebrow">{activeToast.category.toUpperCase()} UNLOCKED</span>
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
