import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { matchesProjectSearch } from "../../src/features/portfolio/project-search";
import { getAllProjects } from "../../src/features/portfolio/project-registry";
import type { PortfolioProject } from "../../src/types/portfolio";

describe("Project Search & Filter Utility", () => {
  const projects = getAllProjects();

  it("returns true for empty query", () => {
    for (const p of projects) {
      assert.equal(matchesProjectSearch(p, ""), true);
      assert.equal(matchesProjectSearch(p, "   "), true);
    }
  });

  it("matches query against project title case-insensitively", () => {
    const lucida = projects.find((p) => p.id === "lucida-sync");
    assert.ok(lucida);
    assert.equal(matchesProjectSearch(lucida, "lucida"), true);
    assert.equal(matchesProjectSearch(lucida, "LUCIDA"), true);
    assert.equal(matchesProjectSearch(lucida, "LuCiDa"), true);
  });

  it("matches query against technologies", () => {
    const lyrune = projects.find((p) => p.id === "lyrune");
    assert.ok(lyrune);
    assert.equal(matchesProjectSearch(lyrune, "Web Audio API"), true);
    assert.equal(matchesProjectSearch(lyrune, "audio"), true);
  });

  it("matches query against skills", () => {
    const flood = projects.find((p) => p.id === "kerala-flood-risk-platform");
    assert.ok(flood);
    assert.equal(matchesProjectSearch(flood, "pipeline"), true);
    assert.equal(matchesProjectSearch(flood, "Machine Learning"), true);
  });

  it("returns false for non-matching queries", () => {
    const project = projects[0];
    assert.equal(matchesProjectSearch(project, "xyznonexistentquery999"), false);
  });
});
