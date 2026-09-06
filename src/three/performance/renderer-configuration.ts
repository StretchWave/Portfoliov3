/**
 * Conservative defaults for the foundation. Raise quality only after profiling
 * representative hardware and a real asset budget.
 */
export const BASELINE_RENDERER_OPTIONS = {
  antialias: false,
  alpha: false,
  powerPreference: "high-performance" as const,
};

export function getSafeDevicePixelRatio(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, 1.5);
}
