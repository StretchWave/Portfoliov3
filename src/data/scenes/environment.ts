import type { EnvironmentConfig } from "@/types/scene";

/**
 * Global default environment configuration for Project Atlas.
 * Defines background, fog, lighting, ground plane, and grid parameters.
 */
export const defaultEnvironmentConfig: EnvironmentConfig = {
  "background": "#07111f",
  "fog": {
    "color": "#07111f",
    "near": 14,
    "far": 34
  },
  "hemisphereLight": {
    "skyColor": "#9fd8ff",
    "groundColor": "#0a1830",
    "intensity": 0.55
  },
  "directionalLight": {
    "intensity": 1.15,
    "position": [
      6,
      9,
      4
    ],
    "shadow": {
      "mapSize": 1024,
      "camera": {
        "left": -13,
        "right": 13,
        "top": 13,
        "bottom": -13,
        "near": 1,
        "far": 30
      },
      "bias": -0.0004
    }
  },
  "ground": {
    "size": 26
  },
  "grid": {
    "size": [
      24,
      24
    ],
    "cellSize": 1,
    "cellThickness": 0.4,
    "cellColor": "#16355a",
    "sectionSize": 4,
    "sectionThickness": 0.8,
    "sectionColor": "#1f4d7d",
    "fadeDistance": 21,
    "fadeStrength": 1.4
  }
} as const satisfies EnvironmentConfig;
