import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { atlasHubScene, defaultEnvironmentConfig } from "../../src/data/scenes";
import {
  serializeAreaScene,
  serializeEnvironmentConfig,
  AREA_VARIABLE_NAMES,
} from "../../src/lib/scene-serializer";

describe("Scene Serializer Unit Tests", () => {
  it("serializes AreaSceneDefinition into valid TypeScript source", () => {
    const code = serializeAreaScene(atlasHubScene);

    assert.match(code, /import type \{ AreaSceneDefinition \} from "@\/types\/scene";/);
    assert.match(code, /export const atlasHubScene: AreaSceneDefinition =/);
    assert.match(code, /"id": "atlas-hub"/);
    assert.match(code, /"id": "hub-light-entrance"/);
    assert.match(code, /"id": "hub-portal-software"/);
  });

  it("serializes EnvironmentConfig into valid TypeScript source", () => {
    const code = serializeEnvironmentConfig(defaultEnvironmentConfig);

    assert.match(code, /import type \{ EnvironmentConfig \} from "@\/types\/scene";/);
    assert.match(code, /export const defaultEnvironmentConfig: EnvironmentConfig =/);
    assert.match(code, /as const satisfies EnvironmentConfig;/);
    assert.match(code, /"background": "#07111f"/);
  });

  it("correctly maps all 4 world area variable names", () => {
    assert.equal(AREA_VARIABLE_NAMES["atlas-hub"], "atlasHubScene");
    assert.equal(AREA_VARIABLE_NAMES["software-district"], "softwareDistrictScene");
    assert.equal(AREA_VARIABLE_NAMES["intelligence-observatory"], "intelligenceObservatoryScene");
    assert.equal(AREA_VARIABLE_NAMES["creative-workshop"], "creativeWorkshopScene");
  });
});
