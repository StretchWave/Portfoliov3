import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ALL_MILESTONES,
  VALID_MILESTONE_IDS,
  computeDiscoveryProgress,
} from "../../src/features/portfolio/journal/discovery-journal-context";

describe("Discovery Journal & Progress Bounds", () => {
  it("contains unique valid milestone IDs", () => {
    assert.equal(ALL_MILESTONES.length, VALID_MILESTONE_IDS.size);
  });

  it("calculates 0% progress for empty discovery list", () => {
    const res = computeDiscoveryProgress([]);
    assert.equal(res.validCount, 0);
    assert.equal(res.percent, 0);
    assert.equal(res.total, ALL_MILESTONES.length);
  });

  it("discards invalid milestone IDs and does not inflate progress", () => {
    const invalidIds = ["fake-id-1", "unregistered-milestone", "exploit-attempt"];
    const res = computeDiscoveryProgress(invalidIds);
    assert.equal(res.validCount, 0);
    assert.equal(res.percent, 0);
  });

  it("calculates accurate percentage for valid milestones", () => {
    const sampleIds = ALL_MILESTONES.slice(0, 3).map((m) => m.id);
    const res = computeDiscoveryProgress(sampleIds);
    assert.equal(res.validCount, 3);
    const expectedPercent = Math.round((3 / ALL_MILESTONES.length) * 100);
    assert.equal(res.percent, expectedPercent);
  });

  it("deduplicates repeated milestone entries", () => {
    const firstId = ALL_MILESTONES[0].id;
    const repeated = [firstId, firstId, firstId];
    const res = computeDiscoveryProgress(repeated);
    assert.equal(res.validCount, 1);
  });

  it("strictly bounds progress to 100% maximum even if excess IDs are passed", () => {
    const allIds = ALL_MILESTONES.map((m) => m.id);
    const extraIds = [...allIds, "extra-1", "extra-2", "extra-3"];
    const res = computeDiscoveryProgress(extraIds);
    assert.equal(res.validCount, ALL_MILESTONES.length);
    assert.equal(res.percent, 100);
  });
});
