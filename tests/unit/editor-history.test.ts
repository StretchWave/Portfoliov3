import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { getDefaultAtlasScene } from "../../src/data/scenes";
import {
  canRedo,
  canUndo,
  createHistoryStack,
  pushHistory,
  redo,
  undo,
} from "../../src/app/studio/state/history";

describe("Editor History Manager", () => {
  it("initializes with initial scene and cannot undo or redo", () => {
    const scene = getDefaultAtlasScene();
    const stack = createHistoryStack(scene);

    assert.equal(stack.entries.length, 1);
    assert.equal(stack.currentIndex, 0);
    assert.equal(canUndo(stack), false);
    assert.equal(canRedo(stack), false);
  });

  it("pushes a new history entry and enables undo", () => {
    const scene = getDefaultAtlasScene();
    const stack = createHistoryStack(scene);

    const modifiedScene = {
      ...scene,
      environment: {
        ...scene.environment,
        background: "#ff0000",
      },
    };

    const nextStack = pushHistory(stack, "Change Background", modifiedScene);
    assert.equal(nextStack.entries.length, 2);
    assert.equal(nextStack.currentIndex, 1);
    assert.equal(canUndo(nextStack), true);
    assert.equal(canRedo(nextStack), false);
  });

  it("undoes to previous snapshot and can redo back", () => {
    const scene = getDefaultAtlasScene();
    const stack = createHistoryStack(scene);

    const modifiedScene = {
      ...scene,
      environment: {
        ...scene.environment,
        background: "#00ff00",
      },
    };

    const stackWithEdit = pushHistory(stack, "Change Background", modifiedScene);
    const undoResult = undo(stackWithEdit);

    assert.ok(undoResult);
    assert.equal(undoResult.snapshot.environment.background, scene.environment.background);
    assert.equal(canUndo(undoResult.stack), false);
    assert.equal(canRedo(undoResult.stack), true);

    const redoResult = redo(undoResult.stack);
    assert.ok(redoResult);
    assert.equal(redoResult.snapshot.environment.background, "#00ff00");
    assert.equal(canUndo(redoResult.stack), true);
    assert.equal(canRedo(redoResult.stack), false);
  });

  it("truncates redo history when new action is pushed after undo", () => {
    const scene = getDefaultAtlasScene();
    const stack = createHistoryStack(scene);

    const edit1 = { ...scene, environment: { ...scene.environment, background: "#111111" } };
    const edit2 = { ...scene, environment: { ...scene.environment, background: "#222222" } };

    let s = pushHistory(stack, "Edit 1", edit1);
    s = pushHistory(s, "Edit 2", edit2);
    assert.equal(s.entries.length, 3);

    // Undo Edit 2
    const u1 = undo(s);
    assert.ok(u1);
    assert.equal(u1.stack.currentIndex, 1);

    // Push new edit
    const edit3 = { ...scene, environment: { ...scene.environment, background: "#333333" } };
    const branchStack = pushHistory(u1.stack, "Edit 3", edit3);

    assert.equal(branchStack.entries.length, 3);
    assert.equal(branchStack.entries[2].label, "Edit 3");
    assert.equal(canRedo(branchStack), false);
  });
});
