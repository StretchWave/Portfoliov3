"use client";

import Link from "next/link";
import { useDiscoveryJournal, ALL_MILESTONES } from "./discovery-journal-context";

export function DiscoveryJournalModal() {
  const { isJournalOpen, setIsJournalOpen, discoveredIds, totalMilestones, progressPercent } =
    useDiscoveryJournal();

  if (!isJournalOpen) return null;

  function getRank(percent: number): string {
    if (percent >= 100) return "Master Systems Architect";
    if (percent >= 75) return "Senior Architecture Auditor";
    if (percent >= 40) return "Systems Investigator";
    return "Curious Explorer";
  }

  const categories = ["District", "Demonstration", "System"] as const;

  return (
    <div
      className="controls-modal-backdrop"
      onClick={() => setIsJournalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-modal-title"
    >
      <div className="discovery-journal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="discovery-journal-modal__header">
          <div>
            <span className="discovery-journal-modal__eyebrow">PORTFOLIO DISCOVERY LOG</span>
            <h3 id="journal-modal-title">Exploration Telemetry</h3>
          </div>
          <button
            type="button"
            className="controls-modal__close"
            onClick={() => setIsJournalOpen(false)}
            aria-label="Close discovery journal"
          >
            ×
          </button>
        </div>

        {/* Progress Card */}
        <div className="discovery-progress-card">
          <div className="discovery-progress-header">
            <div>
              <span className="discovery-rank-title">{getRank(progressPercent)}</span>
              <span className="discovery-count">
                {discoveredIds.length} / {totalMilestones} Milestones Unlocked
              </span>
            </div>
            <strong className="discovery-percentage">{progressPercent}%</strong>
          </div>
          <div className="discovery-progress-track">
            <div
              className="discovery-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Categorized Milestones List */}
        <div className="discovery-categories-container">
          {categories.map((cat) => {
            const items = ALL_MILESTONES.filter((m) => m.category === cat);
            const unlockedCount = items.filter((m) => discoveredIds.includes(m.id)).length;

            return (
              <div key={cat} className="discovery-category-section">
                <div className="discovery-category-header">
                  <span className="discovery-category-name">{cat}s</span>
                  <span className="discovery-category-count">
                    {unlockedCount} / {items.length}
                  </span>
                </div>

                <div className="discovery-items-grid">
                  {items.map((item) => {
                    const isUnlocked = discoveredIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`discovery-item ${
                          isUnlocked ? "discovery-item--unlocked" : "discovery-item--locked"
                        }`}
                      >
                        <div className="discovery-item__icon">
                          {isUnlocked ? "✓" : "○"}
                        </div>
                        <div className="discovery-item__info">
                          <strong className="discovery-item__title">{item.title}</strong>
                          <p className="discovery-item__desc">{item.description}</p>
                          {item.href && !isUnlocked ? (
                            <Link
                              href={item.href}
                              className="discovery-item__link"
                              onClick={() => setIsJournalOpen(false)}
                            >
                              Explore here →
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="discovery-journal-modal__footer">
          <span>Press <kbd>J</kbd> anytime to toggle exploration log</span>
          <button
            type="button"
            className="button button--compact"
            onClick={() => setIsJournalOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
