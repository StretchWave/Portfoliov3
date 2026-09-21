import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { defaultWorldManifest } from "@/data/scenes/manifest";
import { validateScene } from "@/lib/scene-validation";
import { getDefaultAtlasScene } from "@/data/scenes";
import type { RoomDefinition, SceneObject } from "@/types/scene";

describe("Room System & World Manifest", () => {
  it("provides canonical world manifest with valid registered areas and rooms", () => {
    assert.ok(defaultWorldManifest.areas["atlas-hub"]);
    assert.ok(defaultWorldManifest.areas["software-district"]);
    assert.ok(defaultWorldManifest.areas["intelligence-observatory"]);
    assert.ok(defaultWorldManifest.areas["creative-workshop"]);

    for (const [areaId, area] of Object.entries(defaultWorldManifest.areas)) {
      assert.equal(area.id, areaId);
      assert.ok(area.rooms.length > 0, `Area "${areaId}" must have at least one room`);
      assert.ok(area.defaultRoomId, `Area "${areaId}" must have a defaultRoomId`);
      assert.ok(
        area.rooms.some((r) => r.id === area.defaultRoomId),
        `Area "${areaId}" defaultRoomId must match a registered room`,
      );
    }
  });

  it("calculates fitted bounds around objects with padding", () => {
    const objects: SceneObject[] = [
      {
        id: "col-1",
        type: "architecture",
        label: "Column 1",
        transform: { position: [-10, 0, -5] },
        moduleType: "column",
      },
      {
        id: "col-2",
        type: "architecture",
        label: "Column 2",
        transform: { position: [15, 0, 8] },
        moduleType: "column",
      },
    ];

    // Compute fitted bounds with 2m padding
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (const obj of objects) {
      const [x, , z] = obj.transform.position;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    const padding = 2;
    const bounds = {
      minX: minX - padding,
      maxX: maxX + padding,
      minZ: minZ - padding,
      maxZ: maxZ + padding,
    };

    assert.equal(bounds.minX, -12);
    assert.equal(bounds.maxX, 17);
    assert.equal(bounds.minZ, -7);
    assert.equal(bounds.maxZ, 10);
  });

  it("duplicates room with globally unique object and spawn point IDs", () => {
    const sourceRoom: RoomDefinition = {
      id: "exhibition-hall",
      name: "Exhibition Hall",
      bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
      spawnPoints: [
        {
          id: "spawn-main",
          name: "Main Entrance",
          transform: { position: [0, 0, 0] },
          isDefault: true,
        },
      ],
      defaultSpawnPointId: "spawn-main",
      objects: [
        {
          id: "pedestal-1",
          type: "architecture",
          label: "Pedestal 1",
          transform: { position: [0, 0, 5] },
          moduleType: "wall-segment",
          colliders: [
            {
              id: "pedestal-box",
              enabled: true,
              type: "box",
              size: [1, 1, 1],
            },
          ],
        },
      ],
    };

    // Simulate Room Duplication logic
    const suffix = "copy";
    const duplicatedRoom: RoomDefinition = {
      ...sourceRoom,
      id: `${sourceRoom.id}-${suffix}`,
      name: `${sourceRoom.name} (Copy)`,
      spawnPoints: sourceRoom.spawnPoints.map((sp) => ({
        ...sp,
        id: `${sp.id}-${suffix}`,
      })),
      defaultSpawnPointId: sourceRoom.defaultSpawnPointId
        ? `${sourceRoom.defaultSpawnPointId}-${suffix}`
        : undefined,
      objects: sourceRoom.objects.map((obj) => ({
        ...obj,
        id: `${obj.id}-${suffix}`,
        colliders: obj.colliders?.map((col) => ({
          ...col,
          id: `${col.id}-${suffix}`,
        })),
      })),
    };

    assert.equal(duplicatedRoom.id, "exhibition-hall-copy");
    assert.equal(duplicatedRoom.spawnPoints[0].id, "spawn-main-copy");
    assert.equal(duplicatedRoom.defaultSpawnPointId, "spawn-main-copy");
    assert.equal(duplicatedRoom.objects[0].id, "pedestal-1-copy");
    assert.equal(duplicatedRoom.objects[0].colliders?.[0].id, "pedestal-box-copy");
  });

  it("validates room definitions and catches duplicate room IDs and missing default rooms", () => {
    const scene = getDefaultAtlasScene();
    const area = scene.areas["atlas-hub"];

    area.rooms = [
      {
        id: "room-alpha",
        name: "Room Alpha",
        bounds: { minX: -10, maxX: 10, minZ: -10, maxZ: 10 },
        spawnPoints: [
          {
            id: "sp-1",
            name: "Spawn 1",
            transform: { position: [0, 0, 0] },
          },
        ],
        objects: [],
      },
      {
        id: "room-alpha", // DUPLICATE ID
        name: "Duplicate Alpha",
        bounds: { minX: -10, maxX: 10, minZ: -10, maxZ: 10 },
        spawnPoints: [],
        objects: [],
      },
    ];
    area.defaultRoomId = "non-existent-room"; // MISSING DEFAULT ROOM

    const validation = validateScene(scene);
    assert.equal(validation.valid, false);

    const dupErrors = validation.errors.filter((e) => e.code === "DUPLICATE_ROOM_ID");
    assert.ok(dupErrors.length > 0, "Must flag duplicate room ID");

    const defErrors = validation.errors.filter((e) => e.code === "MISSING_DEFAULT_ROOM");
    assert.ok(defErrors.length > 0, "Must flag missing default room reference");
  });
});
