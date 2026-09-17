import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateBiquadCoefficients,
  MIN_FREQ,
  MAX_FREQ,
  SAMPLE_RATE,
} from "../../src/features/portfolio/sandbox/dsp-filter-sandbox";
import type { BiquadFilterType } from "../../src/features/portfolio/sandbox/dsp-filter-sandbox";

describe("DSP Sandbox & Biquad Filter Coefficients", () => {
  const filterTypes: BiquadFilterType[] = ["lowpass", "highpass", "bandpass", "notch", "peaking"];

  it("calculates finite, non-NaN coefficients for all filter types across standard cutoffs", () => {
    const testFrequencies = [MIN_FREQ, 250, 1000, 5000, MAX_FREQ - 500];

    for (const type of filterTypes) {
      for (const cutoff of testFrequencies) {
        const coeffs = calculateBiquadCoefficients({
          type,
          cutoff,
          q: 1.414,
          gain: 3,
        });

        const keys = ["b0", "b1", "b2", "a1", "a2"] as const;
        for (const k of keys) {
          assert.ok(Number.isFinite(coeffs[k]), `Non-finite coefficient ${k} in ${type} at ${cutoff}Hz`);
          assert.ok(!Number.isNaN(coeffs[k]), `NaN coefficient ${k} in ${type} at ${cutoff}Hz`);
        }
      }
    }
  });

  it("produces symmetric bandpass filter coefficients", () => {
    const coeffs = calculateBiquadCoefficients({
      type: "bandpass",
      cutoff: 1000,
      q: 2.0,
      gain: 0,
    });

    // In RBJ cookbook, bandpass b1 is 0 and b0 = -b2
    assert.equal(coeffs.b1, 0);
    assert.ok(Math.abs(coeffs.b0 + coeffs.b2) < 1e-6, "Bandpass b0 and b2 must be negatives of each other");
  });

  it("produces lowpass filter coefficients with unit gain at DC (0 Hz)", () => {
    const coeffs = calculateBiquadCoefficients({
      type: "lowpass",
      cutoff: 2000,
      q: 0.707,
      gain: 0,
    });

    // DC gain: H(0) = (b0 + b1 + b2) / (1 + a1 + a2)
    const num = coeffs.b0 + coeffs.b1 + coeffs.b2;
    const den = 1 + coeffs.a1 + coeffs.a2;
    const dcGain = num / den;
    assert.ok(Math.abs(dcGain - 1.0) < 1e-4, `Lowpass DC gain must be ~1.0, got ${dcGain}`);
  });
});
