"use client";

import { useEditor } from "../state/editor-context";
import { ColorField } from "./inspector-fields/color-field";
import { NumberField } from "./inspector-fields/number-field";
import { Vec3Field } from "./inspector-fields/vec3-field";

export function EnvironmentEditor() {
  const { state, updateEnvironment } = useEditor();
  const env = state.scene.environment;

  return (
    <div className="flex h-full w-full flex-col bg-transparent select-none overflow-hidden">
      <div className="border-b border-zinc-800/80 p-3 bg-zinc-900/40">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Global Environment Config
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Background & Fog */}
        <section className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Atmosphere & Fog
          </span>
          <ColorField
            label="Background Color"
            value={env.background}
            onChange={(background) => updateEnvironment({ background })}
          />
          <ColorField
            label="Fog Color"
            value={env.fog.color}
            onChange={(color) => updateEnvironment({ fog: { ...env.fog, color } })}
          />
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Fog Near"
              value={env.fog.near}
              min={1}
              max={50}
              step={1}
              onChange={(near) => updateEnvironment({ fog: { ...env.fog, near } })}
            />
            <NumberField
              label="Fog Far"
              value={env.fog.far}
              min={5}
              max={100}
              step={1}
              onChange={(far) => updateEnvironment({ fog: { ...env.fog, far } })}
            />
          </div>
        </section>

        {/* Lighting */}
        <section className="space-y-2 border-t border-slate-800 pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Global Illumination
          </span>
          <ColorField
            label="Sky Ambient Color"
            value={env.hemisphereLight.skyColor}
            onChange={(skyColor) =>
              updateEnvironment({
                hemisphereLight: { ...env.hemisphereLight, skyColor },
              })
            }
          />
          <ColorField
            label="Ground Ambient Color"
            value={env.hemisphereLight.groundColor}
            onChange={(groundColor) =>
              updateEnvironment({
                hemisphereLight: { ...env.hemisphereLight, groundColor },
              })
            }
          />
          <NumberField
            label="Hemisphere Intensity"
            value={env.hemisphereLight.intensity}
            min={0}
            max={2}
            step={0.05}
            onChange={(intensity) =>
              updateEnvironment({
                hemisphereLight: { ...env.hemisphereLight, intensity },
              })
            }
          />

          <NumberField
            label="Sun Directional Intensity"
            value={env.directionalLight.intensity}
            min={0}
            max={3}
            step={0.05}
            onChange={(intensity) =>
              updateEnvironment({
                directionalLight: { ...env.directionalLight, intensity },
              })
            }
          />
          <Vec3Field
            label="Sun Position"
            value={env.directionalLight.position}
            onChange={(position) =>
              updateEnvironment({
                directionalLight: { ...env.directionalLight, position },
              })
            }
          />
        </section>

        {/* Technical Grid & Floor */}
        <section className="space-y-2 border-t border-slate-800 pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Floor & Grid
          </span>
          <NumberField
            label="Ground Plane Size"
            value={env.ground.size}
            min={10}
            max={100}
            step={2}
            onChange={(size) => updateEnvironment({ ground: { size } })}
          />
          <ColorField
            label="Grid Cell Color"
            value={env.grid.cellColor}
            onChange={(cellColor) =>
              updateEnvironment({ grid: { ...env.grid, cellColor } })
            }
          />
          <ColorField
            label="Grid Section Color"
            value={env.grid.sectionColor}
            onChange={(sectionColor) =>
              updateEnvironment({ grid: { ...env.grid, sectionColor } })
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Cell Size"
              value={env.grid.cellSize}
              min={0.5}
              max={5}
              step={0.5}
              onChange={(cellSize) =>
                updateEnvironment({ grid: { ...env.grid, cellSize } })
              }
            />
            <NumberField
              label="Section Size"
              value={env.grid.sectionSize}
              min={1}
              max={10}
              step={1}
              onChange={(sectionSize) =>
                updateEnvironment({ grid: { ...env.grid, sectionSize } })
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}
