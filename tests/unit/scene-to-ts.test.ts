import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { getDefaultAtlasScene } from "../../src/data/scenes";
import { validateScene } from "../../src/lib/scene-validation";

describe("Scene to TypeScript CLI Pipeline", () => {
  it("verifies scene JSON snapshot can be serialized, validated, and parsed", () => {
    const defaultScene = getDefaultAtlasScene();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-studio-test-"));
    const jsonPath = path.join(tempDir, "scene.json");

    fs.writeFileSync(jsonPath, JSON.stringify(defaultScene, null, 2), "utf-8");

    const readBack = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const validation = validateScene(readBack);

    assert.equal(validation.valid, true);
    assert.deepEqual(readBack, defaultScene);

    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
