"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAllProjects } from "@/features/portfolio/project-registry";
import { WORLD_AREAS } from "@/data/world-areas";
import type { WorldAreaId } from "@/types/portfolio";
import { useDiscoveryJournal } from "@/features/portfolio/journal/discovery-journal-context";
import { useModalFocusTrap } from "@/lib/modal-accessibility";
import { soundManager } from "@/lib/audio-synthesizer";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const { recordDiscovery } = useDiscoveryJournal();

  const handleOpen = useCallback(() => {
    setSearch("");
    setSelectedIndex(0);
    setIsOpen(true);
    soundManager.playBlip();
    recordDiscovery("sys-command-palette");
  }, [recordDiscovery]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearch("");
    setSelectedIndex(0);
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        } else {
          handleOpen();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleOpen, handleClose]);

  // Focus trap and Escape key listener
  useModalFocusTrap(isOpen, dialogRef, handleClose);

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
        subtitle: "Print-optimized resume, JSON Resume export, and ATS-friendly plaintext",
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
          ...(p.skills || []),
          ...(p.secondaryCategories || []),
        ],
      });
    });

    return list;
  }, [router, onTravelToArea]);

  // Filter items based on user query
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    const terms = q.split(/\s+/).filter(Boolean);

    return items.filter((item) => {
      const matchCorpus = [
        item.title,
        item.subtitle,
        item.category,
        ...(item.keywords || []),
      ]
        .join(" ")
        .toLowerCase();

      return terms.every((term) => matchCorpus.includes(term));
    });
  }, [items, search]);

  const activeItem = filteredItems[selectedIndex];

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>("[aria-selected='true']");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
        soundManager.playTactileClick();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
        soundManager.playTactileClick();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeItem) {
        soundManager.playChime();
        activeItem.action();
        handleClose();
      }
    }
  }

  return (
    <>
      {/* Trigger Pill for Header / Navigation */}
      <button
        type="button"
        className="command-palette-trigger"
        onClick={handleOpen}
        title="Search projects, skills & 3D districts (Ctrl+K)"
        aria-label="Open search command palette (Ctrl+K)"
      >
        <span className="search-icon" aria-hidden="true">🔍</span>
        <span className="search-label">Quick Search...</span>
        <kbd>Ctrl K</kbd>
      </button>

      {isOpen ? (
        <div
          className="command-backdrop"
          onClick={handleClose}
          role="presentation"
        >
          <div
            ref={dialogRef}
            className="command-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette Quick Search"
          >
            <div className="command-input-bar">
              <span className="command-search-icon" aria-hidden="true">🔍</span>
              <input
                ref={inputRef}
                id="command-input"
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls="command-results-list"
                aria-activedescendant={activeItem ? activeItem.id : undefined}
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
                onClick={handleClose}
                aria-label="Close command palette (Escape)"
              >
                ESC
              </button>
            </div>

            <ul
              ref={listRef}
              id="command-results-list"
              role="listbox"
              aria-label="Search results"
              className="command-list"
            >
              {filteredItems.length === 0 ? (
                <li className="command-empty" role="status">
                  No matching projects, skills, or districts found for &ldquo;{search}&rdquo;
                </li>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <li
                      key={item.id}
                      id={item.id}
                      role="option"
                      aria-selected={isSelected}
                      className={`command-item-wrapper ${isSelected ? "command-item--active" : ""}`}
                    >
                      <button
                        type="button"
                        className="command-item"
                        onClick={() => {
                          soundManager.playChime();
                          item.action();
                          handleClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <div className="command-item__left">
                          <span className="command-item__category">{item.category}</span>
                          <strong className="command-item__title">{item.title}</strong>
                          <span className="command-item__subtitle">{item.subtitle}</span>
                        </div>
                        <span className="command-item__arrow" aria-hidden="true">→</span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>

            <div className="command-footer" aria-hidden="true">
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
