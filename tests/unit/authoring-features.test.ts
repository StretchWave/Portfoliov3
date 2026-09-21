import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateScene } from "../../src/lib/scene-validation";
import { getDefaultAtlasScene } from "../../src/data/scenes";
import { calculateDroppedPosition } from "../../src/app/studio/systems/surface-snapping";
import { editorReducer, createInitialEditorState } from "../../src/app/studio/state/editor-reducer";
import type { ImagePlaneObject, SceneObject } from "../../src/types/scene";

describe("Authoring Features: Image Planes, Surface Snapping & Interaction Actions", () => {
  it("validates valid ImagePlaneObject without errors", () => {
    const scene = getDefaultAtlasScene();
    const validImagePlane: ImagePlaneObject = {
      id: "img-test-1",
      type: "image-plane",
      label: "Test Poster",
      transform: { position: [0, 1.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      width: 2.0,
      height: 1.5,
      doubleSided: true,
      transparent: true,
      emissive: false,
    };

    scene.areas["atlas-hub"].objects = [...scene.areas["atlas-hub"].objects, validImagePlane];
    const res = validateScene(scene);
    const planeErrors = res.errors.filter((e) => e.objectId === "img-test-1");
    assert.equal(planeErrors.length, 0, "Valid image plane should have zero validation errors");
  });

  it("rejects image plane with missing imageUrl or zero width", () => {
    const scene = getDefaultAtlasScene();
    const badImagePlane: ImagePlaneObject = {
      id: "img-bad-1",
      type: "image-plane",
      transform: { position: [0, 1.5, 0] },
      imageUrl: "",
      width: 0,
      height: 1.5,
    };

    scene.areas["atlas-hub"].objects = [...scene.areas["atlas-hub"].objects, badImagePlane];
    const res = validateScene(scene);
    const planeErrors = res.errors.filter((e) => e.objectId === "img-bad-1");
    assert.ok(planeErrors.length >= 2, "Should catch missing imageUrl and invalid width");
    assert.ok(planeErrors.some((e) => e.field === "imageUrl"));
    assert.ok(planeErrors.some((e) => e.field === "width"));
  });

  it("validates teleport-to-room and open-link interaction actions", () => {
    const scene = getDefaultAtlasScene();
    const interactiveObj: SceneObject = {
      id: "inter-test-1",
      type: "info-display",
      transform: { position: [0, 1, 0] },
      interaction: {
        enabled: true,
        trigger: "click",
        actions: [
          {
            type: "teleport-to-room",
            targetArea: "software-district",
            targetRoomId: "blender-lab",
            targetSpawnPointId: "spawn-lab-1",
          },
          {
            type: "open-link",
            url: "https://example.com/project-demo",
          },
        ],
      },
    };

    scene.areas["atlas-hub"].objects = [...scene.areas["atlas-hub"].objects, interactiveObj];
    const res = validateScene(scene);
    const objErrors = res.errors.filter((e) => e.objectId === "inter-test-1");
    assert.equal(objErrors.length, 0, "Valid actions should pass validation cleanly");
  });

  it("correctly computes surface snapping height above scene platform", () => {
    const targetCube: SceneObject = {
      id: "target-cube",
      type: "architecture",
      moduleType: "mesh-primitive",
      transform: { position: [0, 5.0, 0] }, // floating 5m in air
      props: {
        geometry: "box",
        args: [1, 2, 1], // height = 2, halfHeight = 1
      },
    };

    const objects: SceneObject[] = [
      {
        id: "floor-platform",
        type: "architecture",
        moduleType: "mesh-primitive",
        transform: { position: [0, 0.2, 0] },
        props: {
          geometry: "box",
          args: [10, 0.4, 10], // top surface is y = 0.2 + 0.2 = 0.4
        },
      },
      targetCube,
    ];

    const snappedPos = calculateDroppedPosition(targetCube, objects, 0);
    // Top of platform = 0.4. Cube half height = 1.0. New center Y = 0.4 + 1.0 = 1.4.
    assert.equal(snappedPos[1], 1.4, "Cube should snap exactly flush on top of floor platform");
  });

  it("handles DROP_TO_SURFACE in editorReducer with undo history", () => {
    const initialScene = getDefaultAtlasScene();
    const state = createInitialEditorState(initialScene);

    // Add a floating cube and select it
    const cube: SceneObject = {
      id: "floating-cube",
      type: "architecture",
      moduleType: "mesh-primitive",
      transform: { position: [0, 10, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      props: { geometry: "box", args: [1, 1, 1] },
    };

    const stateWithCube = editorReducer(state, { type: "ADD_OBJECT", object: cube });
    const selectedState = editorReducer(stateWithCube, { type: "SELECT_OBJECT", objectId: "floating-cube" });

    // Dispatch DROP_TO_SURFACE
    const droppedState = editorReducer(selectedState, { type: "DROP_TO_SURFACE" });
    const droppedCube = droppedState.scene.areas["atlas-hub"].objects.find((o) => o.id === "floating-cube");

    assert.ok(droppedCube, "Cube must still exist");
    assert.ok(droppedCube!.transform.position[1] < 10, "Y position should have been lowered to ground surface");
    assert.ok(droppedState.history.currentIndex > 0, "Drop action must record an undo history snapshot");
  });

  it("handles SET_SNAP_ROTATION_STEP and SET_SNAP_SCALE_STEP in editorReducer", () => {
    const initialScene = getDefaultAtlasScene();
    const state = createInitialEditorState(initialScene);

    const s1 = editorReducer(state, { type: "SET_SNAP_ROTATION_STEP", step: 30 });
    assert.equal(s1.snapRotationStep, 30);

    const s2 = editorReducer(s1, { type: "SET_SNAP_SCALE_STEP", step: 0.5 });
    assert.equal(s2.snapScaleStep, 0.5);
  });
});
