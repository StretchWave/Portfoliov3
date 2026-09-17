import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAllProjects,
  validateProjectRegistry,
  getVerifiedProjects,
  getProjectCount,
  getVerifiedProjectCount,
  getVerifiedSkills,
  getProjectTechnologies,
} from "../../src/features/portfolio/project-registry";

describe("Project Registry & Referential Integrity", () => {
  it("passes comprehensive referential integrity validation", () => {
    assert.doesNotThrow(() => {
      validateProjectRegistry();
    });
  });

  it("contains no duplicate project IDs", () => {
    const projects = getAllProjects();
    const ids = projects.map((p) => p.id);
    const uniqueIds = new Set(ids);
    assert.equal(ids.length, uniqueIds.size, `Duplicate IDs found: ${ids.length} vs ${uniqueIds.size}`);
  });

  it("contains no duplicate project slugs", () => {
    const projects = getAllProjects();
    const slugs = projects.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);
    assert.equal(slugs.length, uniqueSlugs.size, `Duplicate slugs found: ${slugs.length} vs ${uniqueSlugs.size}`);
  });

  it("ensures all related project references point to existing project IDs", () => {
    const projects = getAllProjects();
    const projectIds = new Set(projects.map((p) => p.id));
    for (const project of projects) {
      if (project.relatedProjectIds) {
        for (const relId of project.relatedProjectIds) {
          assert.ok(
            projectIds.has(relId),
            `Project ${project.id} references non-existent related project: ${relId}`
          );
        }
      }
    }
  });

  it("derives verified projects accurately without concepts or unverified projects", () => {
    const totalProjects = getAllProjects();
    const verified = getVerifiedProjects();
    assert.ok(verified.length > 0, "Verified projects list must not be empty");
    assert.equal(verified.length, getVerifiedProjectCount());
    assert.equal(totalProjects.length, getProjectCount());
    assert.ok(verified.length < totalProjects.length, "Conceptual projects should be excluded from verified count");

    for (const p of verified) {
      assert.notEqual(p.status, "concept", `Project ${p.id} has status concept but is in verified list`);
      assert.notEqual(p.evidenceLevel, "conceptual", `Project ${p.id} has evidenceLevel conceptual but is in verified list`);
    }
  });

  it("extracts unique technologies and verified skills", () => {
    const techs = getProjectTechnologies();
    assert.ok(techs.length > 0);
    const uniqueTechs = new Set(techs);
    assert.equal(techs.length, uniqueTechs.size);

    const skills = getVerifiedSkills();
    assert.ok(skills.length > 0);
    const uniqueSkills = new Set(skills);
    assert.equal(skills.length, uniqueSkills.size);
  });
});
