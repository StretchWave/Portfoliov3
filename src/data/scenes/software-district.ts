import type { AreaSceneDefinition } from "@/types/scene";

/**
 * Software Systems District Scene Definition.
 * Canonical data representation.
 */
export const softwareDistrictScene: AreaSceneDefinition = {
  "id": "software-district",
  "version": 1,
  "metadata": {
    "name": "Software Systems District",
    "categoryTitle": "Server Lab & Architecture",
    "description": "Desktop platforms, audio DSP visualizers, automation tooling, and deterministic policy engines.",
    "accent": "#38bdf8"
  },
  "bounds": {
    "minX": -7.6,
    "maxX": 7.6,
    "minZ": -7.8,
    "maxZ": 6.8
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
    "particleColor": "#38bdf8",
    "particleCount": 60
  },
  "objects": [
    {
      "id": "soft-light-primary",
      "type": "point-light",
      "label": "North Cyan Accent Light",
      "transform": {
        "position": [
          0,
          3.2,
          -4.5
        ]
      },
      "color": "#38bdf8",
      "intensity": 12,
      "distance": 8
    },
    {
      "id": "soft-light-secondary",
      "type": "point-light",
      "label": "South Deep Sky Light",
      "transform": {
        "position": [
          0,
          2.8,
          4.2
        ]
      },
      "color": "#0284c7",
      "intensity": 8,
      "distance": 7
    },
    {
      "id": "soft-portal-hub",
      "type": "portal",
      "label": "Atlas Central Hub Return Portal",
      "transform": {
        "position": [
          0,
          0,
          6.4
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
      "id": "soft-wall-back",
      "type": "architecture",
      "label": "Back Wall",
      "moduleType": "wall-segment",
      "transform": {
        "position": [
          0,
          2.2,
          -8.6
        ]
      },
      "props": {
        "width": 17.2,
        "axis": "x",
        "railSide": 1
      }
    },
    {
      "id": "soft-wall-left",
      "type": "architecture",
      "label": "Left Wall",
      "moduleType": "wall-segment",
      "transform": {
        "position": [
          -8.6,
          2.2,
          -0.7
        ]
      },
      "props": {
        "width": 16,
        "axis": "z",
        "railSide": 1
      }
    },
    {
      "id": "soft-wall-right",
      "type": "architecture",
      "label": "Right Wall",
      "moduleType": "wall-segment",
      "transform": {
        "position": [
          8.6,
          2.2,
          -0.7
        ]
      },
      "props": {
        "width": 16,
        "axis": "z",
        "railSide": -1
      }
    },
    {
      "id": "soft-wall-front-left",
      "type": "architecture",
      "label": "Front Left Wall",
      "moduleType": "wall-segment",
      "transform": {
        "position": [
          -5.8,
          2.2,
          7.2
        ]
      },
      "props": {
        "width": 5.6,
        "axis": "x",
        "railSide": -1
      }
    },
    {
      "id": "soft-wall-front-right",
      "type": "architecture",
      "label": "Front Right Wall",
      "moduleType": "wall-segment",
      "transform": {
        "position": [
          5.8,
          2.2,
          7.2
        ]
      },
      "props": {
        "width": 5.6,
        "axis": "x",
        "railSide": -1
      }
    },
    {
      "id": "soft-rib-l-1",
      "type": "architecture",
      "label": "Left Rib 1",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          -8.75,
          2.2,
          -7.8
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "soft-rib-l-2",
      "type": "architecture",
      "label": "Left Rib 2",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          -8.75,
          2.2,
          -4.2
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "soft-rib-l-3",
      "type": "architecture",
      "label": "Left Rib 3",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          -8.75,
          2.2,
          -0.6
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "soft-rib-l-4",
      "type": "architecture",
      "label": "Left Rib 4",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          -8.75,
          2.2,
          3
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "soft-rib-l-5",
      "type": "architecture",
      "label": "Left Rib 5",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          -8.75,
          2.2,
          6.2
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "soft-rib-r-1",
      "type": "architecture",
      "label": "Right Rib 1",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          8.75,
          2.2,
          -7.8
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "soft-rib-r-2",
      "type": "architecture",
      "label": "Right Rib 2",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          8.75,
          2.2,
          -4.2
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "soft-rib-r-3",
      "type": "architecture",
      "label": "Right Rib 3",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          8.75,
          2.2,
          -0.6
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "soft-rib-r-4",
      "type": "architecture",
      "label": "Right Rib 4",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          8.75,
          2.2,
          3
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "soft-rib-r-5",
      "type": "architecture",
      "label": "Right Rib 5",
      "moduleType": "frame-rib",
      "transform": {
        "position": [
          8.75,
          2.2,
          6.2
        ]
      },
      "props": {
        "axis": "z"
      }
    },
    {
      "id": "soft-rack-l-1",
      "type": "decoration",
      "label": "Server Rack Left 1",
      "moduleType": "server-rack",
      "transform": {
        "position": [
          -7.4,
          1.6,
          -6
        ]
      },
      "props": {
        "side": "left"
      }
    },
    {
      "id": "soft-rack-l-2",
      "type": "decoration",
      "label": "Server Rack Left 2",
      "moduleType": "server-rack",
      "transform": {
        "position": [
          -7.4,
          1.6,
          -3.5
        ]
      },
      "props": {
        "side": "left"
      }
    },
    {
      "id": "soft-rack-l-3",
      "type": "decoration",
      "label": "Server Rack Left 3",
      "moduleType": "server-rack",
      "transform": {
        "position": [
          -7.4,
          1.6,
          -1
        ]
      },
      "props": {
        "side": "left"
      }
    },
    {
      "id": "soft-rack-l-4",
      "type": "decoration",
      "label": "Server Rack Left 4",
      "moduleType": "server-rack",
      "transform": {
        "position": [
          -7.4,
          1.6,
          1.5
        ]
      },
      "props": {
        "side": "left"
      }
    },
    {
      "id": "soft-rack-l-5",
      "type": "decoration",
      "label": "Server Rack Left 5",
      "moduleType": "server-rack",
      "transform": {
        "position": [
          -7.4,
          1.6,
          4
        ]
      },
      "props": {
        "side": "left"
      }
    },
    {
      "id": "soft-rack-r-1",
      "type": "decoration",
      "label": "Server Rack Right 1",
      "moduleType": "server-rack",
      "transform": {
        "position": [
          7.4,
          1.6,
          -6
        ]
      },
      "props": {
        "side": "right"
      }
    },
    {
      "id": "soft-rack-r-2",
      "type": "decoration",
      "label": "Server Rack Right 2",
      "moduleType": "server-rack",
      "transform": {
        "position": [
          7.4,
          1.6,
          -3.5
        ]
      },
      "props": {
        "side": "right"
      }
    },
    {
      "id": "soft-rack-r-3",
      "type": "decoration",
      "label": "Server Rack Right 3",
      "moduleType": "server-rack",
      "transform": {
        "position": [
          7.4,
          1.6,
          -1
        ]
      },
      "props": {
        "side": "right"
      }
    },
    {
      "id": "soft-rack-r-4",
      "type": "decoration",
      "label": "Server Rack Right 4",
      "moduleType": "server-rack",
      "transform": {
        "position": [
          7.4,
          1.6,
          1.5
        ]
      },
      "props": {
        "side": "right"
      }
    },
    {
      "id": "soft-rack-r-5",
      "type": "decoration",
      "label": "Server Rack Right 5",
      "moduleType": "server-rack",
      "transform": {
        "position": [
          7.4,
          1.6,
          4
        ]
      },
      "props": {
        "side": "right"
      }
    },
    {
      "id": "soft-core-block",
      "type": "architecture",
      "label": "Central Server Core Block",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          2.3,
          -8.4
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          6.2,
          2.4,
          0.4
        ],
        "material": "structural"
      }
    },
    {
      "id": "soft-core-matrix",
      "type": "architecture",
      "label": "Back Wall Data Status Matrix",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          2.3,
          -8.18
        ]
      },
      "props": {
        "geometry": "plane",
        "args": [
          5.8,
          2
        ],
        "material": {
          "color": "#0c253d",
          "basicMaterial": true
        }
      }
    },
    {
      "id": "soft-core-telemetry",
      "type": "architecture",
      "label": "Emissive Telemetry Line",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          2.3,
          -8.16
        ]
      },
      "props": {
        "geometry": "plane",
        "args": [
          5.2,
          0.04
        ],
        "material": {
          "color": "#38bdf8",
          "basicMaterial": true
        }
      }
    },
    {
      "id": "soft-gantry-1",
      "type": "architecture",
      "label": "Overhead Gantry Tray North",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          4.1,
          -4.5
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          16.8,
          0.2,
          0.6
        ],
        "material": "structural",
        "castShadow": true
      }
    },
    {
      "id": "soft-ceiling-light-1",
      "type": "architecture",
      "label": "Ceiling Panel Light North",
      "moduleType": "ceiling-panel-light",
      "transform": {
        "position": [
          0,
          3.99,
          -4.5
        ]
      },
      "props": {
        "width": 5,
        "depth": 0.4
      }
    },
    {
      "id": "soft-gantry-2",
      "type": "architecture",
      "label": "Overhead Gantry Tray Center",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          4.1,
          0
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          16.8,
          0.2,
          0.6
        ],
        "material": "structural",
        "castShadow": true
      }
    },
    {
      "id": "soft-ceiling-light-2",
      "type": "architecture",
      "label": "Ceiling Panel Light Center",
      "moduleType": "ceiling-panel-light",
      "transform": {
        "position": [
          0,
          3.99,
          0
        ]
      },
      "props": {
        "width": 5,
        "depth": 0.4
      }
    },
    {
      "id": "soft-gantry-3",
      "type": "architecture",
      "label": "Overhead Gantry Tray South",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          4.1,
          4.5
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          16.8,
          0.2,
          0.6
        ],
        "material": "structural",
        "castShadow": true
      }
    },
    {
      "id": "soft-ceiling-light-3",
      "type": "architecture",
      "label": "Ceiling Panel Light South",
      "moduleType": "ceiling-panel-light",
      "transform": {
        "position": [
          0,
          3.99,
          4.5
        ]
      },
      "props": {
        "width": 5,
        "depth": 0.4
      }
    },
    {
      "id": "soft-data-spine-light",
      "type": "architecture",
      "label": "Longitudinal Data Spine Light",
      "moduleType": "light-ribbon",
      "transform": {
        "position": [
          0,
          4,
          -0.6
        ]
      },
      "props": {
        "length": 15.2,
        "axis": "z",
        "color": "#38bdf8"
      }
    },
    {
      "id": "soft-col-entrance-l",
      "type": "architecture",
      "label": "Entrance Column Left",
      "moduleType": "column",
      "transform": {
        "position": [
          -2.6,
          0,
          7.2
        ]
      },
      "props": {
        "accentCaps": true
      }
    },
    {
      "id": "soft-col-entrance-r",
      "type": "architecture",
      "label": "Entrance Column Right",
      "moduleType": "column",
      "transform": {
        "position": [
          2.6,
          0,
          7.2
        ]
      },
      "props": {
        "accentCaps": true
      }
    },
    {
      "id": "soft-conduit-kinetic",
      "type": "decoration",
      "label": "Kinetic Data Packet Conduit",
      "moduleType": "server-data-conduit",
      "transform": {
        "position": [
          0,
          0,
          0
        ]
      }
    }
  ]
};
