import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  GRID_SIZE,
  generateTerrain,
} from "../../src/features/portfolio/sandbox/hydrology-runoff-sandbox";
import type { TerrainPreset } from "../../src/features/portfolio/sandbox/hydrology-runoff-sandbox";

describe("Hydrology Sandbox & Terrain Calculations", () => {
  it("generates deterministic elevation grid of exact size GRID_SIZE * GRID_SIZE", () => {
    const presets: TerrainPreset[] = ["valley", "basin", "coastal", "plain"];
    for (const preset of presets) {
      const elev1 = generateTerrain(preset);
      const elev2 = generateTerrain(preset);
      assert.equal(elev1.length, GRID_SIZE * GRID_SIZE);
      assert.equal(elev2.length, GRID_SIZE * GRID_SIZE);

      // Verify deterministic identity
      for (let i = 0; i < elev1.length; i++) {
        assert.equal(elev1[i], elev2[i]);
        assert.ok(!Number.isNaN(elev1[i]), `NaN found at index ${i} in ${preset}`);
        assert.ok(Number.isFinite(elev1[i]), `Infinite value found at index ${i} in ${preset}`);
      }
    }
  });

  it("ensures terrain elevation values stay within physical boundaries (>= 0m and <= 250m)", () => {
    const presets: TerrainPreset[] = ["valley", "basin", "coastal", "plain"];
    for (const preset of presets) {
      const elev = generateTerrain(preset);
      for (let i = 0; i < elev.length; i++) {
        assert.ok(elev[i] >= 0, `Elevation negative (${elev[i]}) at index ${i} in ${preset}`);
        assert.ok(elev[i] <= 250, `Elevation exceeds peak bound (${elev[i]}) at index ${i} in ${preset}`);
      }
    }
  });

  it("verifies basin preset has lowest elevation in center compared to rim", () => {
    const basin = generateTerrain("basin");
    const centerIdx = Math.floor(GRID_SIZE / 2) * GRID_SIZE + Math.floor(GRID_SIZE / 2);
    const cornerIdx = 0; // Top-left corner rim
    assert.ok(basin[centerIdx] < basin[cornerIdx], "Basin center must be lower than rim");
  });
});
