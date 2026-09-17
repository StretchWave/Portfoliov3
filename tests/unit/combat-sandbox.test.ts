import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  COMBAT_ACTIONS,
  getPhaseForFrame,
} from "../../src/features/portfolio/sandbox/combat-fsm-sandbox";
import type { CombatActionType } from "../../src/features/portfolio/sandbox/combat-fsm-sandbox";

describe("Combat Sandbox FSM & Frame Progression", () => {
  it("defines deterministic frame timing for all combat actions", () => {
    const actionKeys = Object.keys(COMBAT_ACTIONS) as CombatActionType[];
    assert.ok(actionKeys.length >= 5);

    for (const key of actionKeys) {
      const act = COMBAT_ACTIONS[key];
      assert.ok(act.totalFrames > 0);
      assert.ok(act.startup >= 0);
      assert.ok(act.active >= 0);
      assert.ok(act.recovery >= 0);
    }
  });

  it("evaluates frame 0 as neutral", () => {
    for (const key of Object.keys(COMBAT_ACTIONS) as CombatActionType[]) {
      const act = COMBAT_ACTIONS[key];
      assert.equal(getPhaseForFrame(0, act), "neutral");
    }
  });

  it("tracks startup, active, and recovery phases for Light Thrust", () => {
    const light = COMBAT_ACTIONS.light_jab; // startup: 3, active: 2, recovery: 7, total: 12
    // Frame 1-3 = startup
    assert.equal(getPhaseForFrame(1, light), "startup");
    assert.equal(getPhaseForFrame(3, light), "startup");
    // Frame 4-5 = active
    assert.equal(getPhaseForFrame(4, light), "active");
    assert.equal(getPhaseForFrame(5, light), "active");
    // Frame 6-12 = recovery
    assert.equal(getPhaseForFrame(6, light), "recovery");
    assert.equal(getPhaseForFrame(12, light), "recovery");
  });

  it("accurately detects invulnerability frames (I-frames) for Evasive Roll", () => {
    const roll = COMBAT_ACTIONS.dodge_roll; // startup: 2, iframes: 3 to 13
    assert.equal(getPhaseForFrame(1, roll), "startup");
    assert.equal(getPhaseForFrame(2, roll), "startup");
    assert.equal(getPhaseForFrame(3, roll), "iframe");
    assert.equal(getPhaseForFrame(8, roll), "iframe");
    assert.equal(getPhaseForFrame(13, roll), "iframe");
    assert.equal(getPhaseForFrame(14, roll), "recovery");
  });

  it("handles poise break as continuous hitstun", () => {
    const stagger = COMBAT_ACTIONS.poise_break;
    assert.equal(getPhaseForFrame(1, stagger), "hitstun");
    assert.equal(getPhaseForFrame(20, stagger), "hitstun");
    assert.equal(getPhaseForFrame(42, stagger), "hitstun");
  });
});
