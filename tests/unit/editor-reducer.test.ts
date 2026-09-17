import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { getDefaultAtlasScene } from "../../src/data/scenes";
import {
  createInitialEditorState,
  editorReducer,
} from "../../src/app/studio/state/editor-reducer";
import type { PointLightObject } from "../../src/types/scene";

describe("Editor Reducer", () => {
  it("initializes state correctly with atlas-hub active", () => {
    const scene = getDefaultAtlasScene();
    const state = createInitialEditorState(scene);

    assert.equal(state.activeAreaId, "atlas-hub");
    assert.equal(state.selectedObjectId, null);
    assert.equal(state.editorMode, "edit");
    assert.equal(state.transformMode, "translate");
    assert.equal(state.isDirty, false);
  });

  it("handles SELECT_OBJECT and SET_ACTIVE_AREA", () => {
    const scene = getDefaultAtlasScene();
    let state = createInitialEditorState(scene);

    state = editorReducer(state, { type: "SELECT_OBJECT", objectId: "hub-light-entrance" });
    assert.equal(state.selectedObjectId, "hub-light-entrance");

    state = editorReducer(state, { type: "SET_ACTIVE_AREA", areaId: "software-district" });
    assert.equal(state.activeAreaId, "software-district");
    assert.equal(state.selectedObjectId, null);
  });

  it("handles UPDATE_OBJECT and records history with label", () => {
    const scene = getDefaultAtlasScene();
    let state = createInitialEditorState(scene);

    state = editorReducer(state, {
      type: "UPDATE_OBJECT",
      objectId: "hub-light-entrance",
      patch: { intensity: 99 },
      historyLabel: "Set Light Intensity",
    });

    const area = state.scene.areas["atlas-hub"]!;
    const obj = area.objects.find((o) => o.id === "hub-light-entrance") as PointLightObject;
    assert.equal(obj.intensity, 99);
    assert.equal(state.isDirty, true);
    assert.equal(state.history.entries.length, 2);

    // Undo
    state = editorReducer(state, { type: "UNDO" });
    const undoneArea = state.scene.areas["atlas-hub"]!;
    const undoneObj = undoneArea.objects.find((o) => o.id === "hub-light-entrance") as PointLightObject;
    assert.equal(undoneObj.intensity, 12);
  });

  it("handles ADD_OBJECT, DELETE_OBJECT, and DUPLICATE_OBJECT", () => {
    const scene = getDefaultAtlasScene();
    let state = createInitialEditorState(scene);

    const newLight: PointLightObject = {
      id: "test-new-light",
      type: "point-light",
      label: "Test Light",
      transform: { position: [1, 2, 3] },
      color: "#ffffff",
      intensity: 5,
      distance: 10,
    };

    // Add
    state = editorReducer(state, { type: "ADD_OBJECT", object: newLight });
    assert.equal(state.selectedObjectId, "test-new-light");
    assert.ok(state.scene.areas["atlas-hub"]!.objects.some((o) => o.id === "test-new-light"));

    // Duplicate
    state = editorReducer(state, { type: "DUPLICATE_OBJECT", objectId: "test-new-light" });
    assert.ok(state.selectedObjectId?.startsWith("test-new-light-copy-"));

    // Delete
    const copyId = state.selectedObjectId!;
    state = editorReducer(state, { type: "DELETE_OBJECT", objectId: copyId });
    assert.ok(!state.scene.areas["atlas-hub"]!.objects.some((o) => o.id === copyId));
  });

  it("handles UPDATE_ENVIRONMENT and UPDATE_AREA_CONFIG", () => {
    const scene = getDefaultAtlasScene();
    let state = createInitialEditorState(scene);

    state = editorReducer(state, {
      type: "UPDATE_ENVIRONMENT",
      patch: { background: "#123456" },
    });
    assert.equal(state.scene.environment.background, "#123456");

    state = editorReducer(state, {
      type: "UPDATE_AREA_CONFIG",
      areaId: "atlas-hub",
      patch: { bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 } },
    });
    assert.equal(state.scene.areas["atlas-hub"]!.bounds.minX, -20);
  });
});
