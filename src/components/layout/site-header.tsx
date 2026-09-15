"use client";

import Link from "next/link";
import { CommandPalette } from "@/components/ui/command-palette";
import { useDiscoveryJournal } from "@/features/portfolio/journal/discovery-journal-context";

const navigationItems = [
  { href: "/", label: "Overview" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/interactive", label: "Interactive hub" },
] as const;

export function SiteHeader() {
  const { setIsJournalOpen, discoveredIds, totalMilestones } = useDiscoveryJournal();

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Atlas home">
        <span aria-hidden="true">◆</span> ATLAS
      </Link>
      <div className="site-header__actions">
        <button
          type="button"
          className="journal-trigger-pill"
          onClick={() => setIsJournalOpen(true)}
          title="Open Portfolio Exploration Journal (J)"
          aria-label="Open exploration journal"
        >
          <span className="journal-star">✦</span>
          <span>{discoveredIds.length}/{totalMilestones}</span>
          <kbd>J</kbd>
        </button>
        <CommandPalette />
        <nav aria-label="Primary navigation">
          <ul className="site-nav">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
