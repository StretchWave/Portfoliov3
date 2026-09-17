import type { AreaSceneDefinition } from "@/types/scene";

/**
 * Intelligent Systems Observatory Scene Definition.
 * Canonical data representation.
 */
export const intelligenceObservatoryScene: AreaSceneDefinition = {
  "id": "intelligence-observatory",
  "version": 1,
  "metadata": {
    "name": "Intelligent Systems Observatory",
    "categoryTitle": "Decision-Support & Telemetry",
    "description": "Large-scale geospatial flood risk modeling, data pipelines, and predictive analytics.",
    "accent": "#818cf8"
  },
  "bounds": {
    "minX": -8,
    "maxX": 8,
    "minZ": -8,
    "maxZ": 7
  },
  "spawn": {
    "position": [
      0,
      1.7,
      5.2
    ],
    "yaw": 0
  },
  "atmosphere": {
    "particleColor": "#818cf8",
    "particleCount": 60
  },
  "objects": [
    {
      "id": "obs-light-primary",
      "type": "point-light",
      "label": "North Observatory Indigo Light",
      "transform": {
        "position": [
          0,
          3.6,
          -3.5
        ]
      },
      "color": "#818cf8",
      "intensity": 10,
      "distance": 9
    },
    {
      "id": "obs-light-secondary",
      "type": "point-light",
      "label": "South Deep Indigo Fill",
      "transform": {
        "position": [
          0,
          2.6,
          4.5
        ]
      },
      "color": "#4338ca",
      "intensity": 7,
      "distance": 8
    },
    {
      "id": "obs-portal-hub",
      "type": "portal",
      "label": "Atlas Central Hub Return Portal",
      "transform": {
        "position": [
          0,
          0,
          6.5
        ],
        "rotation": [
          0,
          3.141592653589793,
          0
        ]
      },
      "targetArea": "atlas-hub",
      "targetLabel": "Atlas Central Hub",
      "subtitle": "Return Portal",
      "accent": "#ffc76b"
    },
    {
      "id": "obs-wall-back",
      "type": "architecture",
      "label": "Back Wall",
      "moduleType": "wall-segment",
      "transform": {
        "position": [
          0,
          2.4,
          -9
        ]
      },
      "props": {
        "width": 18,
        "axis": "x",
        "railSide": 1
      }
    },
    {
      "id": "obs-wall-left",
      "type": "architecture",
      "label": "Left Wall",
      "moduleType": "wall-segment",
      "transform": {
        "position": [
          -9,
          2.4,
          -0.8
        ]
      },
      "props": {
        "width": 16.4,
        "axis": "z",
        "railSide": 1
      }
    },
    {
      "id": "obs-wall-right",
      "type": "architecture",
      "label": "Right Wall",
      "moduleType": "wall-segment",
      "transform": {
        "position": [
          9,
          2.4,
          -0.8
        ]
      },
      "props": {
        "width": 16.4,
        "axis": "z",
        "railSide": -1
      }
    },
    {
      "id": "obs-wall-front-left",
      "type": "architecture",
      "label": "Front Left Wall",
      "moduleType": "wall-segment",
      "transform": {
        "position": [
          -6,
          2.4,
          7.4
        ]
      },
      "props": {
        "width": 6,
        "axis": "x",
        "railSide": -1
      }
    },
    {
      "id": "obs-wall-front-right",
      "type": "architecture",
      "label": "Front Right Wall",
      "moduleType": "wall-segment",
      "transform": {
        "position": [
          6,
          2.4,
          7.4
        ]
      },
      "props": {
        "width": 6,
        "axis": "x",
        "railSide": -1
      }
    },
    {
      "id": "obs-rib-l-1",
      "type": "architecture",
      "label": "Left Rib 1",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          -9.15,
          2.4,
          -8
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "obs-rib-l-2",
      "type": "architecture",
      "label": "Left Rib 2",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          -9.15,
          2.4,
          -4
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "obs-rib-l-3",
      "type": "architecture",
      "label": "Left Rib 3",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          -9.15,
          2.4,
          0
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "obs-rib-l-4",
      "type": "architecture",
      "label": "Left Rib 4",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          -9.15,
          2.4,
          4
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "obs-rib-l-5",
      "type": "architecture",
      "label": "Left Rib 5",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          -9.15,
          2.4,
          7
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "obs-rib-r-1",
      "type": "architecture",
      "label": "Right Rib 1",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          9.15,
          2.4,
          -8
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "obs-rib-r-2",
      "type": "architecture",
      "label": "Right Rib 2",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          9.15,
          2.4,
          -4
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "obs-rib-r-3",
      "type": "architecture",
      "label": "Right Rib 3",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          9.15,
          2.4,
          0
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "obs-rib-r-4",
      "type": "architecture",
      "label": "Right Rib 4",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          9.15,
          2.4,
          4
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "obs-rib-r-5",
      "type": "architecture",
      "label": "Right Rib 5",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          9.15,
          2.4,
          7
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "obs-telemetry-frame",
      "type": "architecture",
      "label": "Observation Deck Panoramic Glass Frame",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          2.6,
          -8.7
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          11.5,
          3.2,
          0.4
        ],
        "material": "displayGlass"
      }
    },
    {
      "id": "obs-screen-surface",
      "type": "architecture",
      "label": "Primary Data Screen Surface",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          2.6,
          -8.48
        ]
      },
      "props": {
        "geometry": "plane",
        "args": [
          10.8,
          2.8
        ],
        "material": {
          "color": "#0f172a",
          "roughness": 0.2,
          "metalness": 0.6
        }
      }
    },
    {
      "id": "obs-scanline-bottom",
      "type": "architecture",
      "label": "Data Scanline Bottom",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          1.8,
          -8.46
        ]
      },
      "props": {
        "geometry": "plane",
        "args": [
          10.2,
          0.03
        ],
        "material": {
          "color": "#818cf8",
          "basicMaterial": true
        }
      }
    },
    {
      "id": "obs-scanline-center",
      "type": "architecture",
      "label": "Data Scanline Center",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          2.6,
          -8.46
        ]
      },
      "props": {
        "geometry": "plane",
        "args": [
          10.2,
          0.03
        ],
        "material": {
          "color": "#818cf8",
          "basicMaterial": true
        }
      }
    },
    {
      "id": "obs-scanline-top",
      "type": "architecture",
      "label": "Data Scanline Top",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          3.4,
          -8.46
        ]
      },
      "props": {
        "geometry": "plane",
        "args": [
          10.2,
          0.03
        ],
        "material": {
          "color": "#818cf8",
          "basicMaterial": true
        }
      }
    },
    {
      "id": "obs-terminal-left",
      "type": "decoration",
      "label": "Left Telemetry Terminal",
      "moduleType": "data-terminal",
      "transform": {
        "position": [
          -5.8,
          1.2,
          -4.5
        ],
        "rotation": [
          0,
          0.5235987755982988,
          0
        ]
      },
      "props": {
        "side": "left"
      }
    },
    {
      "id": "obs-terminal-right",
      "type": "decoration",
      "label": "Right Telemetry Terminal",
      "moduleType": "data-terminal",
      "transform": {
        "position": [
          5.8,
          1.2,
          -4.5
        ],
        "rotation": [
          0,
          -0.5235987755982988,
          0
        ]
      },
      "props": {
        "side": "right"
      }
    },
    {
      "id": "obs-col-inner-l",
      "type": "architecture",
      "label": "Inner Column Left",
      "moduleType": "column",
      "transform": {
        "position": [
          -3.8,
          0,
          1.5
        ]
      },
      "props": {
        "accentCaps": true
      }
    },
    {
      "id": "obs-col-inner-r",
      "type": "architecture",
      "label": "Inner Column Right",
      "moduleType": "column",
      "transform": {
        "position": [
          3.8,
          0,
          1.5
        ]
      },
      "props": {
        "accentCaps": true
      }
    },
    {
      "id": "obs-col-entrance-l",
      "type": "architecture",
      "label": "Entrance Column Left",
      "moduleType": "column",
      "transform": {
        "position": [
          -2.8,
          0,
          7.4
        ]
      },
      "props": {
        "accentCaps": true
      }
    },
    {
      "id": "obs-col-entrance-r",
      "type": "architecture",
      "label": "Entrance Column Right",
      "moduleType": "column",
      "transform": {
        "position": [
          2.8,
          0,
          7.4
        ]
      },
      "props": {
        "accentCaps": true
      }
    },
    {
      "id": "obs-overhead-halo",
      "type": "architecture",
      "label": "Overhead Indigo Halo Ring",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          4.4,
          -2.5
        ],
        "rotation": [
          1.5707963267948966,
          0,
          0
        ]
      },
      "props": {
        "geometry": "torus",
        "args": [
          3.2,
          0.06,
          8,
          32
        ],
        "material": {
          "color": "#818cf8",
          "basicMaterial": true
        }
      }
    },
    {
      "id": "obs-ceiling-light-center",
      "type": "architecture",
      "label": "Overhead Central Panel Light",
      "moduleType": "ceiling-panel-light",
      "transform": {
        "position": [
          0,
          4.3,
          2
        ]
      },
      "props": {
        "width": 4.2,
        "depth": 0.6
      }
    },
    {
      "id": "obs-topographic-grid",
      "type": "decoration",
      "label": "Topographic Elevation Contour Grid",
      "moduleType": "topographic-contour-grid",
      "transform": {
        "position": [
          0,
          2.6,
          -8.35
        ]
      }
    }
  ]
};
