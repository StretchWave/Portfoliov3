import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CollisionWorld } from "@/lib/collision-world";
import { validateScene } from "@/lib/scene-validation";
import { getDefaultAtlasScene } from "@/data/scenes";
import type { SceneObject } from "@/types/scene";

describe("CollisionWorld & Collider System", () => {
  it("registers and queries box colliders for sliding movement", () => {
    const world = new CollisionWorld();

    // Register an obstacle at [5, 0, 0] with size [2, 2, 2]
    world.registerCollider(
      "wall-1",
      { position: [5, 0, 0] },
      {
        id: "wall-1-box",
        type: "box",
        enabled: true,
        isTrigger: false,
        center: [0, 0, 0],
        size: [2, 2, 2],
      },
    );

    // Case 1: Moving from [2, 0, 0] by delta [2.5, 0, 0] targets [4.5, 0, 0] (hits box wall spanning [4, 6])
    const resolved = world.queryMovement([2, 0, 0], [2.5, 0, 0], 0.4);
    assert.equal(resolved[0], 2, "Player should be blocked on X and remain at 2");
    assert.equal(resolved[1], 0);
    assert.equal(resolved[2], 0);

    // Case 2: Moving from [2, 0, 0] by delta [0, 0, 5] (parallel to wall) slides along Z freely
    const sliding = world.queryMovement([2, 0, 0], [0, 0, 5], 0.4);
    assert.equal(sliding[0], 2);
    assert.equal(sliding[2], 5);
  });

  it("detects trigger overlaps without blocking movement", () => {
    const world = new CollisionWorld();

    // Register a trigger volume at [0, 0, 5] with sphere radius 2
    world.registerCollider(
      "teleport-pad",
      { position: [0, 0, 5] },
      {
        id: "teleport-trigger",
        type: "sphere",
        enabled: true,
        isTrigger: true,
        center: [0, 0, 0],
        radius: 2,
      },
    );

    // Query movement right through the trigger: delta [0, 0, 10] should NOT be blocked
    const resolved = world.queryMovement([0, 0, 0], [0, 0, 10], 0.4);
    assert.equal(resolved[2], 10, "Trigger must not block movement");

    // Overlap query when inside trigger radius:
    const overlapsInside = world.queryOverlap([0, 0, 5.5], 0.4);
    assert.equal(overlapsInside.length, 1);
    assert.equal(overlapsInside[0].colliderId, "teleport-trigger");
    assert.equal(overlapsInside[0].objectId, "teleport-pad");

    // Overlap query when outside trigger radius:
    const overlapsOutside = world.queryOverlap([0, 0, 15], 0.4);
    assert.equal(overlapsOutside.length, 0);
  });

  it("supports multiple colliders per scene object (physical + trigger)", () => {
    const world = new CollisionWorld();

    // Wall with both a physical box collider and a trigger proximity sensor
    world.registerCollider(
      "door-1",
      { position: [10, 0, 0] },
      {
        id: "door-physical",
        type: "box",
        enabled: true,
        isTrigger: false,
        center: [0, 0, 0],
        size: [1, 3, 2],
      },
    );

    world.registerCollider(
      "door-1",
      { position: [10, 0, 0] },
      {
        id: "door-proximity-trigger",
        type: "sphere",
        enabled: true,
        isTrigger: true,
        center: [0, 0, 0],
        radius: 4,
      },
    );

    // Player approaching at [8, 0, 0] is inside the proximity trigger
    const overlaps = world.queryOverlap([8, 0, 0], 0.4);
    assert.equal(overlaps.length, 1);
    assert.equal(overlaps[0].colliderId, "door-proximity-trigger");
    assert.equal(overlaps[0].objectId, "door-1");

    // Player walking into the door by delta [2, 0, 0] is blocked on X
    const move = world.queryMovement([8, 0, 0], [2, 0, 0], 0.4);
    assert.equal(move[0], 8, "Physical collider must block player movement");
  });

  it("removes colliders cleanly on object deletion or unmount", () => {
    const world = new CollisionWorld();

    world.registerCollider(
      "rock-1",
      { position: [0, 0, 5] },
      {
        id: "rock-collider",
        type: "box",
        enabled: true,
        isTrigger: false,
        center: [0, 0, 0],
        size: [2, 2, 2],
      },
    );

    assert.equal(world.getColliderCount(), 1);

    // Remove collider
    world.removeCollider("rock-1", "rock-collider");
    assert.equal(world.getColliderCount(), 0);

    // Movement through previously blocked space should now be unimpeded
    const move = world.queryMovement([0, 0, 0], [0, 0, 6], 0.4);
    assert.equal(move[2], 6);
  });

  it("validates collider definitions and rejects invalid dimensions or types", () => {
    const scene = getDefaultAtlasScene();
    const area = scene.areas["atlas-hub"];

    const objWithColliders: SceneObject = {
      id: "test-collider-obj",
      type: "architecture",
      label: "Test Colliders",
      transform: { position: [0, 0, 0] },
      moduleType: "wall-segment",
      colliders: [
        {
          id: "valid-box",
          enabled: true,
          type: "box",
          size: [2, 2, 2],
        },
        {
          id: "invalid-type",
          enabled: true,
          type: "donut" as any,
        },
        {
          id: "invalid-box-size",
          enabled: true,
          type: "box",
          size: [-1, 0, 2],
        },
      ],
    };

    area.objects = [...area.objects, objWithColliders];
    const validation = validateScene(scene);

    assert.equal(validation.valid, false);
    const errors = validation.errors.filter((e) => e.objectId === "test-collider-obj");
    assert.ok(errors.some((e) => e.code === "INVALID_COLLIDER_TYPE"));
    assert.ok(errors.some((e) => e.code === "INVALID_DIMENSIONS"));
  });
});
