import type { AreaSceneDefinition } from "@/types/scene";

/**
 * Creative & Interactive Workshop Scene Definition.
 * Canonical data representation.
 */
export const creativeWorkshopScene: AreaSceneDefinition = {
  "id": "creative-workshop",
  "version": 1,
  "metadata": {
    "name": "Creative & Interactive Workshop",
    "categoryTitle": "Interaction Arena & Mechanics",
    "description": "Combat timing mechanics, mobile client streaming, and browser-native experimentation.",
    "accent": "#f472d0"
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
    "particleColor": "#f472d0",
    "particleCount": 60
  },
  "objects": [
    {
      "id": "work-light-primary",
      "type": "point-light",
      "label": "North Magenta Accent Light",
      "transform": {
        "position": [
          0,
          3.4,
          -2.5
        ]
      },
      "color": "#f472d0",
      "intensity": 12,
      "distance": 8
    },
    {
      "id": "work-light-secondary",
      "type": "point-light",
      "label": "South Rose Accent Light",
      "transform": {
        "position": [
          0,
          2.8,
          4.5
        ]
      },
      "color": "#fb7185",
      "intensity": 8,
      "distance": 7
    },
    {
      "id": "work-portal-hub",
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
      "id": "work-wall-back",
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
      "id": "work-wall-left",
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
      "id": "work-wall-right",
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
      "id": "work-wall-front-left",
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
      "id": "work-wall-front-right",
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
      "id": "work-rib-l-1",
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
      "id": "work-rib-l-2",
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
      "id": "work-rib-l-3",
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
      "id": "work-rib-l-4",
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
      "id": "work-rib-l-5",
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
      "id": "work-rib-r-1",
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
      "id": "work-rib-r-2",
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
      "id": "work-rib-r-3",
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
      "id": "work-rib-r-4",
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
      "id": "work-rib-r-5",
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
      "id": "work-floor-ring-outer",
      "type": "architecture",
      "label": "Combat Floor Outer Ring",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          0.02,
          -1.8
        ],
        "rotation": [
          -1.5707963267948966,
          0,
          0
        ]
      },
      "props": {
        "geometry": "ring",
        "args": [
          3.2,
          3.28,
          32
        ],
        "material": {
          "color": "#f472d0",
          "basicMaterial": true
        }
      }
    },
    {
      "id": "work-floor-ring-inner",
      "type": "architecture",
      "label": "Combat Floor Inner Ring",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          0.02,
          -1.8
        ],
        "rotation": [
          -1.5707963267948966,
          0,
          0
        ]
      },
      "props": {
        "geometry": "ring",
        "args": [
          1.8,
          1.86,
          32
        ],
        "material": {
          "color": "#f43f5e",
          "basicMaterial": true
        }
      }
    },
    {
      "id": "work-staging-bay-frame",
      "type": "architecture",
      "label": "Workshop Staging Bay Glass Frame",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          2.2,
          -8.7
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          8.4,
          1.8,
          0.3
        ],
        "material": "displayGlass"
      }
    },
    {
      "id": "work-staging-bay-screen",
      "type": "architecture",
      "label": "Workshop Staging Bay Screen",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          2.2,
          -8.52
        ]
      },
      "props": {
        "geometry": "plane",
        "args": [
          8,
          1.4
        ],
        "material": {
          "color": "#2a0d24",
          "basicMaterial": true
        }
      }
    },
    {
      "id": "work-staging-bay-accent",
      "type": "architecture",
      "label": "Workshop Staging Bay Accent Strip",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          3.15,
          -8.5
        ]
      },
      "props": {
        "geometry": "plane",
        "args": [
          8,
          0.05
        ],
        "material": {
          "color": "#f472d0",
          "basicMaterial": true
        }
      }
    },
    {
      "id": "work-truss-beam-north",
      "type": "architecture",
      "label": "Truss Beam North",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          4.3,
          -4
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          17.4,
          0.24,
          0.5
        ],
        "material": "structural",
        "castShadow": true
      }
    },
    {
      "id": "work-truss-brace-n-1",
      "type": "architecture",
      "label": "Truss Brace North 1",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          -6,
          4,
          -4
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          0.12,
          0.5,
          0.12
        ],
        "material": "structural"
      }
    },
    {
      "id": "work-truss-brace-n-2",
      "type": "architecture",
      "label": "Truss Brace North 2",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          -3,
          4,
          -4
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          0.12,
          0.5,
          0.12
        ],
        "material": "structural"
      }
    },
    {
      "id": "work-truss-brace-n-3",
      "type": "architecture",
      "label": "Truss Brace North 3",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          4,
          -4
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          0.12,
          0.5,
          0.12
        ],
        "material": "structural"
      }
    },
    {
      "id": "work-truss-brace-n-4",
      "type": "architecture",
      "label": "Truss Brace North 4",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          3,
          4,
          -4
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          0.12,
          0.5,
          0.12
        ],
        "material": "structural"
      }
    },
    {
      "id": "work-truss-brace-n-5",
      "type": "architecture",
      "label": "Truss Brace North 5",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          6,
          4,
          -4
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          0.12,
          0.5,
          0.12
        ],
        "material": "structural"
      }
    },
    {
      "id": "work-ceiling-light-north",
      "type": "architecture",
      "label": "Truss Ceiling Light North",
      "moduleType": "ceiling-panel-light",
      "transform": {
        "position": [
          0,
          4.17,
          -4
        ]
      },
      "props": {
        "width": 6,
        "depth": 0.4
      }
    },
    {
      "id": "work-truss-beam-south",
      "type": "architecture",
      "label": "Truss Beam South",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          4.3,
          1
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          17.4,
          0.24,
          0.5
        ],
        "material": "structural",
        "castShadow": true
      }
    },
    {
      "id": "work-truss-brace-s-1",
      "type": "architecture",
      "label": "Truss Brace South 1",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          -6,
          4,
          1
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          0.12,
          0.5,
          0.12
        ],
        "material": "structural"
      }
    },
    {
      "id": "work-truss-brace-s-2",
      "type": "architecture",
      "label": "Truss Brace South 2",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          -3,
          4,
          1
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          0.12,
          0.5,
          0.12
        ],
        "material": "structural"
      }
    },
    {
      "id": "work-truss-brace-s-3",
      "type": "architecture",
      "label": "Truss Brace South 3",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          0,
          4,
          1
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          0.12,
          0.5,
          0.12
        ],
        "material": "structural"
      }
    },
    {
      "id": "work-truss-brace-s-4",
      "type": "architecture",
      "label": "Truss Brace South 4",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          3,
          4,
          1
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          0.12,
          0.5,
          0.12
        ],
        "material": "structural"
      }
    },
    {
      "id": "work-truss-brace-s-5",
      "type": "architecture",
      "label": "Truss Brace South 5",
      "moduleType": "mesh-primitive",
      "transform": {
        "position": [
          6,
          4,
          1
        ]
      },
      "props": {
        "geometry": "box",
        "args": [
          0.12,
          0.5,
          0.12
        ],
        "material": "structural"
      }
    },
    {
      "id": "work-ceiling-light-south",
      "type": "architecture",
      "label": "Truss Ceiling Light South",
      "moduleType": "ceiling-panel-light",
      "transform": {
        "position": [
          0,
          4.17,
          1
        ]
      },
      "props": {
        "width": 6,
        "depth": 0.4
      }
    },
    {
      "id": "work-neon-spine",
      "type": "architecture",
      "label": "Longitudinal Magenta Neon Spine",
      "moduleType": "light-ribbon",
      "transform": {
        "position": [
          0,
          4.2,
          -0.75
        ]
      },
      "props": {
        "length": 15.5,
        "axis": "z",
        "color": "#f472d0"
      }
    },
    {
      "id": "work-col-entrance-l",
      "type": "architecture",
      "label": "Entrance Column Left",
      "moduleType": "column",
      "transform": {
        "position": [
          -3.2,
          0,
          7.4
        ]
      },
      "props": {
        "accentCaps": true
      }
    },
    {
      "id": "work-col-entrance-r",
      "type": "architecture",
      "label": "Entrance Column Right",
      "moduleType": "column",
      "transform": {
        "position": [
          3.2,
          0,
          7.4
        ]
      },
      "props": {
        "accentCaps": true
      }
    },
    {
      "id": "work-col-flank-l",
      "type": "architecture",
      "label": "Flank Column Left",
      "moduleType": "column",
      "transform": {
        "position": [
          -7.5,
          0,
          -1.8
        ]
      },
      "props": {
        "accentCaps": true
      }
    },
    {
      "id": "work-col-flank-r",
      "type": "architecture",
      "label": "Flank Column Right",
      "moduleType": "column",
      "transform": {
        "position": [
          7.5,
          0,
          -1.8
        ]
      },
      "props": {
        "accentCaps": true
      }
    },
    {
      "id": "work-stance-rings",
      "type": "decoration",
      "label": "Counter-Rotating Holographic Stance Rings",
      "moduleType": "holographic-stance-rings",
      "transform": {
        "position": [
          0,
          0.4,
          -1.8
        ]
      }
    }
  ]
};
