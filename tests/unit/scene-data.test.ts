import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  atlasHubScene,
  creativeWorkshopScene,
  getAllAreaScenes,
  getAreaScene,
  getDefaultAtlasScene,
  getEnvironmentConfig,
  intelligenceObservatoryScene,
  softwareDistrictScene,
} from "../../src/data/scenes";
import { validateScene } from "../../src/lib/scene-validation";

describe("Scene Data Extraction Verification", () => {
  it("extracts valid scene data for all areas with zero validation errors", () => {
    const fullScene = getDefaultAtlasScene();
    const result = validateScene(fullScene);
    const fatalErrors = result.errors.filter((e) => e.severity === "error");
    assert.deepEqual(
      fatalErrors,
      [],
      `Expected zero fatal errors, but got:\n${JSON.stringify(fatalErrors, null, 2)}`,
    );
  });

  it("retrieves each area scene via getAreaScene", () => {
    assert.equal(getAreaScene("atlas-hub").id, "atlas-hub");
    assert.equal(getAreaScene("software-district").id, "software-district");
    assert.equal(getAreaScene("intelligence-observatory").id, "intelligence-observatory");
    assert.equal(getAreaScene("creative-workshop").id, "creative-workshop");
  });

  it("returns 4 registered area scenes in getAllAreaScenes", () => {
    const all = getAllAreaScenes();
    assert.equal(all.length, 4);
    assert.deepEqual(
      all.map((a) => a.id).sort(),
      ["atlas-hub", "creative-workshop", "intelligence-observatory", "software-district"].sort(),
    );
  });

  it("verifies environment config matches expected parameters", () => {
    const env = getEnvironmentConfig();
    assert.equal(env.background, "#07111f");
    assert.equal(env.fog.near, 14);
    assert.equal(env.fog.far, 34);
    assert.equal(env.directionalLight.intensity, 1.15);
    assert.equal(env.ground.size, 26);
  });

  it("verifies portal targets exist in registered world areas", () => {
    const allScenes = [
      atlasHubScene,
      softwareDistrictScene,
      intelligenceObservatoryScene,
      creativeWorkshopScene,
    ];

    for (const scene of allScenes) {
      const portals = scene.objects.filter((o) => o.type === "portal");
      for (const portal of portals) {
        if (portal.type === "portal") {
          assert.doesNotThrow(() => getAreaScene(portal.targetArea));
        }
      }
    }
  });

  it("verifies scene serialization round-trip succeeds", () => {
    const original = getDefaultAtlasScene();
    const json = JSON.stringify(original);
    const parsed = JSON.parse(json);
    const result = validateScene(parsed);

    assert.equal(result.errors.filter((e) => e.severity === "error").length, 0);
    assert.deepEqual(parsed, original);
  });
});
