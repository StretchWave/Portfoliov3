import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateScene, validateAreaScene_standalone } from "../../src/lib/scene-validation";
import type { AtlasSceneDefinition, AreaSceneDefinition, EnvironmentConfig } from "../../src/types/scene";

// ─── Test Fixtures ───────────────────────────────────────────────────────────

const VALID_ENVIRONMENT: EnvironmentConfig = {
  background: "#07111f",
  fog: { color: "#07111f", near: 14, far: 34 },
  hemisphereLight: { skyColor: "#9fd8ff", groundColor: "#0a1830", intensity: 0.55 },
  directionalLight: {
    intensity: 1.15,
    position: [6, 9, 4],
    shadow: {
      mapSize: 1024,
      camera: { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 30 },
      bias: -0.0004,
    },
  },
  ground: { size: 26 },
  grid: {
    size: [24, 24],
    cellSize: 1,
    cellThickness: 0.4,
    cellColor: "#16355a",
    sectionSize: 4,
    sectionThickness: 0.8,
    sectionColor: "#1f4d7d",
    fadeDistance: 21,
    fadeStrength: 1.4,
  },
};

const VALID_AREA: AreaSceneDefinition = {
  id: "atlas-hub",
  version: 1,
  metadata: {
    name: "Atlas Central Hub",
    categoryTitle: "Systems Exhibition Hall",
    description: "The primary reference environment.",
    accent: "#68e4ff",
  },
  bounds: { minX: -8.4, maxX: 8.4, minZ: -8.4, maxZ: 7 },
  spawn: { position: [0, 1.7, 5.8], yaw: 0 },
  atmosphere: { particleColor: "#68e4ff" },
  objects: [
    {
      id: "light:hub-accent-1",
      type: "point-light",
      label: "Hub Accent Light 1",
      transform: { position: [0, 2.8, 5.6] },
      color: "#ffc76b",
      intensity: 12,
      distance: 7,
    },
    {
      id: "portal:software-district",
      type: "portal",
      label: "Software District Portal",
      transform: { position: [-7.2, 0, 1.8], rotation: [0, Math.PI / 2, 0] },
      targetArea: "software-district",
      targetLabel: "Software District",
      subtitle: "Systems & Tooling",
      accent: "#38bdf8",
    },
  ],
};

const VALID_SCENE: AtlasSceneDefinition = {
  version: 1,
  environment: VALID_ENVIRONMENT,
  areas: { "atlas-hub": VALID_AREA },
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Scene Validation", () => {
  it("accepts a valid scene definition", () => {
    const result = validateScene(VALID_SCENE);
    assert.ok(result.valid, `Expected valid, got errors: ${JSON.stringify(result.errors)}`);
    // May have warnings but no errors
    const errors = result.errors.filter((e) => e.severity === "error");
    assert.equal(errors.length, 0, `Unexpected errors: ${JSON.stringify(errors)}`);
  });

  it("rejects scene with invalid version", () => {
    const scene: AtlasSceneDefinition = { ...VALID_SCENE, version: 0 };
    const result = validateScene(scene);
    assert.ok(result.errors.some((e) => e.code === "INVALID_VERSION"));
  });

  it("rejects scene with missing environment", () => {
    const scene = { ...VALID_SCENE, environment: undefined } as unknown as AtlasSceneDefinition;
    const result = validateScene(scene);
    assert.ok(result.errors.some((e) => e.code === "MISSING_REQUIRED_FIELD" && e.field === "environment"));
  });

  it("rejects invalid background color", () => {
    const scene: AtlasSceneDefinition = {
      ...VALID_SCENE,
      environment: { ...VALID_ENVIRONMENT, background: "not-a-color" },
    };
    const result = validateScene(scene);
    assert.ok(result.errors.some((e) => e.code === "INVALID_COLOR" && e.field === "environment.background"));
  });

  it("rejects fog with near >= far", () => {
    const scene: AtlasSceneDefinition = {
      ...VALID_SCENE,
      environment: { ...VALID_ENVIRONMENT, fog: { color: "#000000", near: 40, far: 10 } },
    };
    const result = validateScene(scene);
    assert.ok(result.errors.some((e) => e.code === "INVALID_FOG"));
  });
});

describe("Area Scene Validation", () => {
  it("accepts a valid area scene", () => {
    const result = validateAreaScene_standalone(VALID_AREA);
    const errors = result.errors.filter((e) => e.severity === "error");
    assert.equal(errors.length, 0, `Unexpected errors: ${JSON.stringify(errors)}`);
  });

  it("rejects area with invalid ID", () => {
    const area: AreaSceneDefinition = { ...VALID_AREA, id: "nonexistent-area" as never };
    const result = validateAreaScene_standalone(area);
    assert.ok(result.errors.some((e) => e.code === "INVALID_AREA_ID"));
  });

  it("rejects area with invalid bounds (minX >= maxX)", () => {
    const area: AreaSceneDefinition = {
      ...VALID_AREA,
      bounds: { minX: 10, maxX: -10, minZ: -8, maxZ: 7 },
    };
    const result = validateAreaScene_standalone(area);
    assert.ok(result.errors.some((e) => e.code === "INVALID_BOUNDS"));
  });

  it("rejects area with invalid bounds (minZ >= maxZ)", () => {
    const area: AreaSceneDefinition = {
      ...VALID_AREA,
      bounds: { minX: -8, maxX: 8, minZ: 10, maxZ: -5 },
    };
    const result = validateAreaScene_standalone(area);
    assert.ok(result.errors.some((e) => e.code === "INVALID_BOUNDS"));
  });

  it("warns when spawn is outside bounds", () => {
    const area: AreaSceneDefinition = {
      ...VALID_AREA,
      spawn: { position: [100, 1.7, 100], yaw: 0 },
    };
    const result = validateAreaScene_standalone(area);
    assert.ok(result.errors.some((e) => e.code === "SPAWN_OUTSIDE_BOUNDS"));
  });

  it("rejects duplicate object IDs within area", () => {
    const area: AreaSceneDefinition = {
      ...VALID_AREA,
      objects: [
        {
          id: "duplicate-id",
          type: "point-light",
          transform: { position: [0, 0, 0] },
          color: "#ffffff",
          intensity: 8,
          distance: 6,
        },
        {
          id: "duplicate-id",
          type: "point-light",
          transform: { position: [1, 1, 1] },
          color: "#ff0000",
          intensity: 4,
          distance: 3,
        },
      ],
    };
    const result = validateAreaScene_standalone(area);
    assert.ok(result.errors.some((e) => e.code === "DUPLICATE_ID"));
  });

  it("rejects portal with invalid target area", () => {
    const area: AreaSceneDefinition = {
      ...VALID_AREA,
      objects: [
        {
          id: "portal:bad-target",
          type: "portal",
          transform: { position: [0, 0, 0] },
          targetArea: "nonexistent-area" as never,
          targetLabel: "Bad Portal",
          accent: "#ff0000",
        },
      ],
    };
    const result = validateAreaScene_standalone(area);
    assert.ok(result.errors.some((e) => e.code === "INVALID_PORTAL_TARGET"));
  });

  it("rejects point light with invalid color", () => {
    const area: AreaSceneDefinition = {
      ...VALID_AREA,
      objects: [
        {
          id: "light:bad-color",
          type: "point-light",
          transform: { position: [0, 2, 0] },
          color: "not-a-color",
          intensity: 8,
          distance: 6,
        },
      ],
    };
    const result = validateAreaScene_standalone(area);
    assert.ok(result.errors.some((e) => e.code === "INVALID_COLOR"));
  });

  it("rejects point light with invalid intensity", () => {
    const area: AreaSceneDefinition = {
      ...VALID_AREA,
      objects: [
        {
          id: "light:bad-intensity",
          type: "point-light",
          transform: { position: [0, 2, 0] },
          color: "#ffffff",
          intensity: -5,
          distance: 6,
        },
      ],
    };
    const result = validateAreaScene_standalone(area);
    assert.ok(result.errors.some((e) => e.code === "INVALID_INTENSITY"));
  });

  it("warns when light budget is exceeded", () => {
    const manyLights = Array.from({ length: 8 }, (_, i) => ({
      id: `light:test-${i}`,
      type: "point-light" as const,
      transform: { position: [i, 2, 0] as const },
      color: "#ffffff",
      intensity: 5,
      distance: 4,
    }));

    const area: AreaSceneDefinition = { ...VALID_AREA, objects: manyLights };
    const result = validateAreaScene_standalone(area);
    assert.ok(result.errors.some((e) => e.code === "LIGHT_BUDGET_EXCEEDED"));
  });

  it("rejects architecture object with unknown module type", () => {
    const area: AreaSceneDefinition = {
      ...VALID_AREA,
      objects: [
        {
          id: "arch:bad-module",
          type: "architecture",
          transform: { position: [0, 0, 0] },
          moduleType: "unknown-module" as never,
          props: {},
        },
      ],
    };
    const result = validateAreaScene_standalone(area);
    assert.ok(result.errors.some((e) => e.code === "INVALID_MODULE_TYPE"));
  });

  it("rejects object with empty ID", () => {
    const area: AreaSceneDefinition = {
      ...VALID_AREA,
      objects: [
        {
          id: "",
          type: "point-light",
          transform: { position: [0, 2, 0] },
          color: "#ffffff",
          intensity: 8,
          distance: 6,
        },
      ],
    };
    const result = validateAreaScene_standalone(area);
    assert.ok(result.errors.some((e) => e.code === "MISSING_ID"));
  });

  it("rejects area with missing metadata name", () => {
    const area: AreaSceneDefinition = {
      ...VALID_AREA,
      metadata: { ...VALID_AREA.metadata, name: "" },
    };
    const result = validateAreaScene_standalone(area);
    assert.ok(result.errors.some((e) => e.code === "MISSING_REQUIRED_FIELD" && e.field === "metadata.name"));
  });
});

describe("Cross-Area Validation", () => {
  it("warns about duplicate object IDs across areas", () => {
    const area2: AreaSceneDefinition = {
      ...VALID_AREA,
      id: "software-district",
      metadata: { ...VALID_AREA.metadata, name: "Software District" },
      objects: [
        {
          id: "light:hub-accent-1", // Same ID as in atlas-hub
          type: "point-light",
          transform: { position: [0, 2, 0] },
          color: "#ffffff",
          intensity: 8,
          distance: 6,
        },
      ],
    };

    const scene: AtlasSceneDefinition = {
      ...VALID_SCENE,
      areas: {
        "atlas-hub": VALID_AREA,
        "software-district": area2,
      },
    };

    const result = validateScene(scene);
    assert.ok(result.errors.some((e) => e.code === "CROSS_AREA_DUPLICATE_ID"));
  });
});

describe("Serialization Round-Trip", () => {
  it("scene survives JSON round-trip without data loss", () => {
    const json = JSON.stringify(VALID_SCENE);
    const restored = JSON.parse(json) as AtlasSceneDefinition;
    const result = validateScene(restored);

    const errors = result.errors.filter((e) => e.severity === "error");
    assert.equal(errors.length, 0, `Round-tripped scene has errors: ${JSON.stringify(errors)}`);

    // Verify key values survived
    const restoredArea = restored.areas["atlas-hub"]!;
    assert.equal(restoredArea.id, "atlas-hub");
    assert.equal(restoredArea.metadata.name, "Atlas Central Hub");
    assert.deepEqual(restoredArea.bounds, { minX: -8.4, maxX: 8.4, minZ: -8.4, maxZ: 7 });
    assert.deepEqual(restoredArea.spawn.position, [0, 1.7, 5.8]);
    assert.equal(restoredArea.objects.length, 2);
  });
});
