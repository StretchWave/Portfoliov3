import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SETTINGS,
  DEFAULT_DISCOVERY,
  parseSettings,
  parseDiscovery,
} from "../../src/lib/storage";

describe("Storage Schema & Fault-Tolerant Parsing", () => {
  it("returns default settings when passed null, undefined, or non-object", () => {
    assert.deepEqual(parseSettings(null), DEFAULT_SETTINGS);
    assert.deepEqual(parseSettings(undefined), DEFAULT_SETTINGS);
    assert.deepEqual(parseSettings("invalid string"), DEFAULT_SETTINGS);
    assert.deepEqual(parseSettings(12345), DEFAULT_SETTINGS);
  });

  it("safely handles corrupted settings types and clamps numerical volumes", () => {
    const corrupted = {
      soundEnabled: "yes", // should convert to boolean true
      masterVolume: 999, // should clamp to 1.0
      ambientVolume: -5, // should clamp to 0.0
      effectsVolume: "not-a-number", // fallback to default
      soundProfile: "invalid-preset", // fallback to cybernetic
      spatialEnabled: false,
      hapticsEnabled: false,
    };

    const parsed = parseSettings(corrupted);
    assert.equal(parsed.version, 1);
    assert.equal(parsed.soundEnabled, true);
    assert.equal(parsed.masterVolume, 1.0);
    assert.equal(parsed.ambientVolume, 0.0);
    assert.equal(parsed.effectsVolume, DEFAULT_SETTINGS.effectsVolume);
    assert.equal(parsed.soundProfile, "cybernetic");
    assert.equal(parsed.spatialEnabled, false);
    assert.equal(parsed.hapticsEnabled, false);
  });

  it("preserves valid custom sound settings", () => {
    const valid = {
      soundEnabled: true,
      masterVolume: 0.8,
      ambientVolume: 0.25,
      effectsVolume: 0.6,
      soundProfile: "harmonic",
      spatialEnabled: true,
      hapticsEnabled: true,
    };

    const parsed = parseSettings(valid);
    assert.equal(parsed.masterVolume, 0.8);
    assert.equal(parsed.soundProfile, "harmonic");
  });

  it("returns default discovery when passed non-object", () => {
    const parsed = parseDiscovery(null);
    assert.equal(parsed.version, 1);
    assert.deepEqual(parsed.discoveredIds, []);
  });

  it("filters non-string items out of corrupted discovery IDs array", () => {
    const corrupted = {
      discoveredIds: ["district-hub", 123, null, { id: "bad" }, "demo-combat"],
      updatedAt: 1700000000000,
    };

    const parsed = parseDiscovery(corrupted);
    assert.deepEqual(parsed.discoveredIds, ["district-hub", "demo-combat"]);
    assert.equal(parsed.updatedAt, 1700000000000);
  });
});
