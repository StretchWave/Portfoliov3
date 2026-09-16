"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAllProjects } from "@/features/portfolio/project-registry";
import { WORLD_AREAS } from "@/data/world-areas";
import type { WorldAreaId } from "@/types/portfolio";

import { useDiscoveryJournal } from "@/features/portfolio/journal/discovery-journal-context";

interface CommandItem {
  id: string;
  category: "Projects" | "3D Districts" | "Pages";
  title: string;
  subtitle: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  onTravelToArea?: (areaId: WorldAreaId) => void;
}

export function CommandPalette({ onTravelToArea }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { recordDiscovery } = useDiscoveryJournal();

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input on open & lock background scroll
  useEffect(() => {
    if (isOpen) {
      recordDiscovery("sys-command-palette");
      setSearch("");
      setSelectedIndex(0);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Build searchable items index
  const items = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [];

    // Core Site Pages
    list.push(
      {
        id: "page-home",
        category: "Pages",
        title: "Home Overview",
        subtitle: "Main portfolio landing page",
        action: () => router.push("/"),
        keywords: ["hero", "overview", "introduction"],
      },
      {
        id: "page-projects",
        category: "Pages",
        title: "All Projects Catalog",
        subtitle: "Filterable inventory of software, systems, and games",
        action: () => router.push("/projects"),
        keywords: ["catalog", "work", "filter"],
      },
      {
        id: "page-skills",
        category: "Pages",
        title: "Evidence-Based Skills",
        subtitle: "Technical competencies linked directly to project repos",
        action: () => router.push("/skills"),
        keywords: ["languages", "technologies", "expertise", "frameworks"],
      },
      {
        id: "page-about",
        category: "Pages",
        title: "About & Engineering Philosophy",
        subtitle: "Background, career directions, and system design principles",
        action: () => router.push("/about"),
        keywords: ["bio", "biography", "directions", "background"],
      },
      {
        id: "page-sandbox",
        category: "Pages",
        title: "Engineering Algorithm Sandboxes",
        subtitle: "Live DSP audio filter visualizer, hydrological runoff, and combat FSM",
        action: () => router.push("/sandbox"),
        keywords: ["sandbox", "dsp", "audio", "filter", "hydrology", "runoff", "combat", "fsm", "algorithm"],
      },
      {
        id: "page-resume",
        category: "Pages",
        title: "Engineering Dossier & Resume",
        subtitle: "2-page print-optimized resume, JSON Resume export, and ATS plaintext",
        action: () => router.push("/resume"),
        keywords: ["resume", "cv", "dossier", "print", "pdf", "ats", "json", "education"],
      },
      {
        id: "page-interactive",
        category: "Pages",
        title: "Interactive 3D WebGL Hub",
        subtitle: "Enter the real-time spatial exhibition hall",
        action: () => router.push("/interactive"),
        keywords: ["3d", "webgl", "canvas", "explore", "walk"],
      }
    );

    // 3D World Districts
    (Object.keys(WORLD_AREAS) as WorldAreaId[]).forEach((areaId) => {
      const info = WORLD_AREAS[areaId];
      list.push({
        id: `district-${areaId}`,
        category: "3D Districts",
        title: info.name,
        subtitle: `${info.categoryTitle} — ${info.description}`,
        action: () => {
          if (onTravelToArea) {
            onTravelToArea(areaId);
          } else {
            router.push("/interactive");
          }
        },
        keywords: ["teleport", "portal", "district", "world", "area", areaId],
      });
    });

    // Projects
    const projects = getAllProjects();
    projects.forEach((p) => {
      list.push({
        id: `project-${p.id}`,
        category: "Projects",
        title: p.name,
        subtitle: `${p.category.replaceAll("-", " ")} · ${p.technologies.slice(0, 4).join(", ")}`,
        action: () => router.push(`/projects/${p.slug}`),
        keywords: [
          p.summary,
          p.category,
          ...p.technologies,
          ...p.skills,
          p.status,
          p.priority,
        ],
      });
    });

    return list;
  }, [router, onTravelToArea]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      if (item.title.toLowerCase().includes(q)) return true;
      if (item.subtitle.toLowerCase().includes(q)) return true;
      if (item.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [items, search]);

  // Handle keyboard navigation inside the list
  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        selected.action();
        setIsOpen(false);
      }
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(".command-item--active");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <>
      {/* Optional Trigger Pill for Header / Navigation */}
      <button
        type="button"
        className="command-palette-trigger"
        onClick={() => setIsOpen(true)}
        title="Search projects, skills & 3D districts (Ctrl+K)"
        aria-label="Open search command palette"
      >
        <span className="search-icon">🔍</span>
        <span className="search-label">Quick Search...</span>
        <kbd>Ctrl K</kbd>
      </button>

      {isOpen ? (
        <div
          className="command-backdrop"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="command-input"
        >
          <div className="command-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="command-input-bar">
              <span className="command-search-icon">🔍</span>
              <input
                ref={inputRef}
                id="command-input"
                type="text"
                className="command-input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Search projects, skills, technologies, or 3D districts..."
              />
              <button
                type="button"
                className="command-esc-chip"
                onClick={() => setIsOpen(false)}
              >
                ESC
              </button>
            </div>

            <div ref={listRef} className="command-list">
              {filteredItems.length === 0 ? (
                <div className="command-empty">
                  No matching projects, skills, or districts found for &ldquo;{search}&rdquo;
                </div>
              ) : (
                filteredItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`command-item ${idx === selectedIndex ? "command-item--active" : ""}`}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="command-item__left">
                      <span className="command-item__category">{item.category}</span>
                      <strong className="command-item__title">{item.title}</strong>
                      <span className="command-item__subtitle">{item.subtitle}</span>
                    </div>
                    <span className="command-item__arrow">→</span>
                  </div>
                ))
              )}
            </div>

            <div className="command-footer">
              <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
              <span><kbd>↵</kbd> to select</span>
              <span><kbd>esc</kbd> to close</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
