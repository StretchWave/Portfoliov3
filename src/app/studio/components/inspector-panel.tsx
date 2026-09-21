"use client";

import { useState, useMemo } from "react";
import { worldAreaIds, type WorldAreaId } from "@/types/portfolio";
import { getAllProjects } from "@/features/portfolio/project-registry";
import type {
  ArchitectureObject,
  ColliderDefinition,
  ColliderType,
  ImagePlaneObject,
  InteractionAction,
  InteractionCondition,
  InteractionDefinition,
  PointLightObject,
  PortalObject,
  SceneObject,
  Vec3,
} from "@/types/scene";

import { useEditor } from "../state/editor-context";
import { INTERACTION_PRESETS } from "../systems/interaction-presets";
import { BooleanField } from "./inspector-fields/boolean-field";
import { ColorField } from "./inspector-fields/color-field";
import { NumberField } from "./inspector-fields/number-field";
import { SelectField } from "./inspector-fields/select-field";
import { TextField } from "./inspector-fields/text-field";
import { Vec3Field } from "./inspector-fields/vec3-field";

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
  badge,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-800/60 pb-3 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-1 text-left text-xs font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-zinc-500 text-xs">{icon}</span>}
          <span className="font-semibold tracking-wider uppercase text-[10px] text-zinc-400">
            {title}
          </span>
          {badge && (
            <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-px text-[9px] font-mono text-cyan-400">
              {badge}
            </span>
          )}
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">
          {isOpen ? "▼" : "▶"}
        </span>
      </button>

      {isOpen && <div className="space-y-3 pt-2">{children}</div>}
    </div>
  );
}

// ─── Interaction Action Editor Row ──────────────────────────────────────────

const ACTION_TYPE_OPTIONS = [
  { value: "show-project", label: "Show Project" },
  { value: "show-information", label: "Show Information" },
  { value: "teleport-player", label: "Teleport Player" },
  { value: "teleport-to-room", label: "Teleport to Room" },
  { value: "open-district", label: "Open District" },
  { value: "play-sound", label: "Play Sound" },
  { value: "highlight-object", label: "Highlight Object" },
  { value: "open-link", label: "Open Link" },
  { value: "toggle-state", label: "Toggle State" },
];

function InteractionActionRow({
  action,
  index,
  onChange,
  onRemove,
}: {
  action: InteractionAction;
  index: number;
  onChange: (updated: InteractionAction) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded border border-zinc-800/80 bg-zinc-900/50 p-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-500">Action #{index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors"
        >
          Remove
        </button>
      </div>

      <SelectField
        label="Type"
        value={action.type}
        options={ACTION_TYPE_OPTIONS}
        onChange={(type) => onChange({ ...action, type: type as InteractionAction["type"] })}
      />

      {/* Type-specific fields */}
      {action.type === "show-project" && (
        <SelectField
          label="Select Project"
          value={action.projectId ?? ""}
          options={[
            { value: "", label: "-- Choose a Project --" },
            ...getAllProjects().map((p) => ({
              value: p.id,
              label: `${p.name} (${p.category})`,
            })),
          ]}
          onChange={(projectId) => onChange({ ...action, projectId })}
        />
      )}

      {action.type === "show-information" && (
        <>
          <TextField
            label="Title"
            value={action.title ?? ""}
            onChange={(title) => onChange({ ...action, title })}
          />
          <TextField
            label="Description"
            value={action.description ?? ""}
            onChange={(description) => onChange({ ...action, description })}
          />
          <TextField
            label="Category"
            value={action.category ?? ""}
            onChange={(category) => onChange({ ...action, category })}
          />
        </>
      )}

      {(action.type === "teleport-player" || action.type === "teleport-to-room" || action.type === "open-district") && (
        <SelectField
          label="Target District"
          value={action.targetArea ?? ""}
          options={worldAreaIds.map((id) => ({ value: id, label: id }))}
          onChange={(targetArea) => onChange({ ...action, targetArea: targetArea as WorldAreaId })}
        />
      )}

      {(action.type === "teleport-player" || action.type === "teleport-to-room") && (
        <>
          <TextField
            label="Target Room ID (e.g. main-hall, blender-lab)"
            value={action.targetRoomId ?? ""}
            onChange={(targetRoomId) => onChange({ ...action, targetRoomId })}
          />
          <TextField
            label="Target Spawn Point ID (Optional)"
            value={action.targetSpawnPointId ?? action.teleportPointId ?? ""}
            onChange={(targetSpawnPointId) =>
              onChange({
                ...action,
                targetSpawnPointId,
                teleportPointId: targetSpawnPointId,
              })
            }
          />
        </>
      )}

      {action.type === "play-sound" && (
        <SelectField
          label="Sound"
          value={action.soundId ?? "click"}
          options={[
            { value: "click", label: "Tactile Click" },
            { value: "chime", label: "Chime" },
            { value: "modal", label: "Modal Open" },
            { value: "teleport", label: "Warp / Teleport" },
          ]}
          onChange={(soundId) => onChange({ ...action, soundId })}
        />
      )}

      {action.type === "open-link" && (
        <TextField
          label="URL"
          value={action.url ?? ""}
          onChange={(url) => onChange({ ...action, url })}
        />
      )}

      {action.type === "toggle-state" && (
        <>
          <TextField
            label="Variable Key"
            value={action.variable ?? ""}
            onChange={(variable) => onChange({ ...action, variable })}
          />
        </>
      )}
    </div>
  );
}

// ─── Main Interaction Section ───────────────────────────────────────────────

function InteractionSection({
  selectedObject,
  updateObject,
}: {
  selectedObject: SceneObject;
  updateObject: (id: string, patch: Partial<SceneObject>, historyLabel?: string) => void;
}) {
  const interaction = selectedObject.interaction;
  const hasInteraction = Boolean(interaction?.enabled);

  const handleToggleInteraction = (enabled: boolean) => {
    if (enabled && !interaction) {
      // Create default interaction definition
      updateObject(
        selectedObject.id,
        {
          interaction: {
            enabled: true,
            trigger: "click",
            prompt: "Interact",
            feedback: "highlight",
            actions: [],
          },
        },
        `Enable Interaction on ${selectedObject.label ?? selectedObject.id}`,
      );
    } else {
      updateObject(
        selectedObject.id,
        {
          interaction: interaction
            ? { ...interaction, enabled }
            : { enabled, trigger: "click", actions: [] },
        },
        `${enabled ? "Enable" : "Disable"} Interaction on ${selectedObject.label ?? selectedObject.id}`,
      );
    }
  };

  const handleUpdateInteraction = (patch: Partial<InteractionDefinition>) => {
    if (!interaction) return;
    updateObject(
      selectedObject.id,
      {
        interaction: { ...interaction, ...patch },
      },
      `Update Interaction on ${selectedObject.label ?? selectedObject.id}`,
    );
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = INTERACTION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const def = preset.createDefinition();
    updateObject(
      selectedObject.id,
      { interaction: def },
      `Apply Preset "${preset.name}" to ${selectedObject.label ?? selectedObject.id}`,
    );
  };

  const handleAddAction = () => {
    if (!interaction) return;
    const newAction: InteractionAction = { type: "play-sound", soundId: "click" };
    handleUpdateInteraction({
      actions: [...interaction.actions, newAction],
    });
  };

  const handleUpdateAction = (index: number, updated: InteractionAction) => {
    if (!interaction) return;
    const newActions = [...interaction.actions];
    newActions[index] = updated;
    handleUpdateInteraction({ actions: newActions });
  };

  const handleRemoveAction = (index: number) => {
    if (!interaction) return;
    const newActions = interaction.actions.filter((_, i) => i !== index);
    handleUpdateInteraction({ actions: newActions });
  };

  return (
    <CollapsibleSection
      title="Interaction"
      icon="🎯"
      defaultOpen={hasInteraction}
      badge={hasInteraction ? `${interaction!.actions.length} Action${interaction!.actions.length !== 1 ? "s" : ""}` : undefined}
    >
      {/* Enable Toggle */}
      <BooleanField
        label="Enable Interaction"
        value={hasInteraction}
        onChange={handleToggleInteraction}
      />

      {hasInteraction && interaction && (
        <div className="space-y-3 pt-1">
          {/* Preset Loader */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Apply Preset
            </label>
            <div className="flex flex-wrap gap-1">
              {INTERACTION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className="rounded border border-zinc-700/80 bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-cyan-950/20 transition-all"
                  title={preset.description}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Type */}
          <SelectField
            label="Trigger"
            value={interaction.trigger}
            options={[
              { value: "click", label: "Click" },
              { value: "double-click", label: "Double Click" },
              { value: "hover", label: "Hover" },
              { value: "proximity", label: "Proximity" },
              { value: "interact-key", label: "Interact Key (E)" },
              { value: "tap", label: "Tap (Touch)" },
            ]}
            onChange={(trigger) =>
              handleUpdateInteraction({
                trigger: trigger as InteractionDefinition["trigger"],
              })
            }
          />

          {/* Prompt */}
          <TextField
            label="Prompt Text"
            value={interaction.prompt ?? ""}
            onChange={(prompt) => handleUpdateInteraction({ prompt })}
          />

          {/* Feedback Style */}
          <SelectField
            label="Feedback"
            value={interaction.feedback ?? "highlight"}
            options={[
              { value: "highlight", label: "Highlight" },
              { value: "tooltip", label: "Tooltip" },
              { value: "halo", label: "Halo" },
              { value: "pulse", label: "Pulse" },
            ]}
            onChange={(feedback) =>
              handleUpdateInteraction({
                feedback: feedback as InteractionDefinition["feedback"],
              })
            }
          />

          {/* Range */}
          <NumberField
            label="Interaction Range"
            value={interaction.range ?? 3.0}
            min={0.5}
            max={20}
            step={0.5}
            onChange={(range) => handleUpdateInteraction({ range })}
          />

          {/* Priority */}
          <NumberField
            label="Priority"
            value={interaction.priority ?? 5}
            min={0}
            max={100}
            step={1}
            onChange={(priority) => handleUpdateInteraction({ priority })}
          />

          {/* Actions List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Actions ({interaction.actions.length})
              </label>
              <button
                type="button"
                onClick={handleAddAction}
                className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-colors"
              >
                + Add Action
              </button>
            </div>

            {interaction.actions.length === 0 ? (
              <div className="rounded border border-dashed border-zinc-800 p-2 text-center text-[10px] text-zinc-500">
                No actions configured. Add an action or apply a preset.
              </div>
            ) : (
              <div className="space-y-1.5">
                {interaction.actions.map((action, idx) => (
                  <InteractionActionRow
                    key={`action-${idx}`}
                    action={action}
                    index={idx}
                    onChange={(updated) => handleUpdateAction(idx, updated)}
                    onRemove={() => handleRemoveAction(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}

// ─── Collision Authoring Section ──────────────────────────────────────────

function CollisionSection({
  selectedObject,
  addCollider,
  updateCollider,
  deleteCollider,
  duplicateCollider,
  fitCollider,
}: {
  selectedObject: SceneObject;
  addCollider: (objectId: string, collider: ColliderDefinition) => void;
  updateCollider: (objectId: string, colliderId: string, patch: Partial<ColliderDefinition>) => void;
  deleteCollider: (objectId: string, colliderId: string) => void;
  duplicateCollider: (objectId: string, colliderId: string) => void;
  fitCollider: (objectId: string, colliderId: string) => void;
}) {
  const colliders = selectedObject.colliders ?? [];

  const handleAdd = (type: ColliderType) => {
    const newCol: ColliderDefinition = {
      id: `col-${Date.now().toString(36).slice(-4)}`,
      enabled: true,
      type,
      center: [0, 0, 0],
      size: [2, 2, 2],
      radius: 1,
      height: 2,
      rotation: [0, 0, 0],
      isTrigger: false,
    };
    addCollider(selectedObject.id, newCol);
  };

  return (
    <CollapsibleSection
      title="Collision"
      icon="🛡️"
      badge={colliders.length > 0 ? `${colliders.length}` : undefined}
      defaultOpen={colliders.length > 0}
    >
      <div className="space-y-3">
        {/* Add Collider Buttons */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Colliders ({colliders.length})
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleAdd("box")}
              className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-colors"
              title="Add Box Collider"
            >
              + Box
            </button>
            <button
              type="button"
              onClick={() => handleAdd("sphere")}
              className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-colors"
              title="Add Sphere Collider"
            >
              + Sphere
            </button>
            <button
              type="button"
              onClick={() => handleAdd("capsule")}
              className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-colors"
              title="Add Capsule Collider"
            >
              + Capsule
            </button>
          </div>
        </div>

        {colliders.length === 0 ? (
          <div className="rounded border border-dashed border-zinc-800 p-2.5 text-center text-[10px] text-zinc-500">
            No colliders attached. Click a button above to add a physical or trigger collider.
          </div>
        ) : (
          <div className="space-y-2.5">
            {colliders.map((col) => (
              <div
                key={col.id}
                className="rounded border border-zinc-800/90 bg-zinc-900/60 p-2.5 space-y-2"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase text-cyan-400">
                      {col.type}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[110px]">
                      {col.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => fitCollider(selectedObject.id, col.id)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      title="Fit collider dimensions to object"
                    >
                      Fit
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateCollider(selectedObject.id, col.id)}
                      className="text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                      title="Duplicate collider"
                    >
                      Dup
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCollider(selectedObject.id, col.id)}
                      className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                      title="Delete collider"
                    >
                      Del
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/50">
                  <BooleanField
                    label="Enabled"
                    value={col.enabled}
                    onChange={(enabled) =>
                      updateCollider(selectedObject.id, col.id, { enabled })
                    }
                  />
                  <BooleanField
                    label="Trigger Only"
                    value={Boolean(col.isTrigger)}
                    onChange={(isTrigger) =>
                      updateCollider(selectedObject.id, col.id, { isTrigger })
                    }
                  />
                </div>

                {/* Center offset */}
                <Vec3Field
                  label="Local Center"
                  value={col.center ?? [0, 0, 0]}
                  onChange={(center) =>
                    updateCollider(selectedObject.id, col.id, { center })
                  }
                  defaultValue={[0, 0, 0]}
                />

                {/* Dimensions */}
                {col.type === "box" && (
                  <Vec3Field
                    label="Size (W, H, D)"
                    value={col.size ?? [1, 1, 1]}
                    onChange={(size) =>
                      updateCollider(selectedObject.id, col.id, { size })
                    }
                    defaultValue={[1, 1, 1]}
                  />
                )}

                {(col.type === "sphere" || col.type === "capsule" || col.type === "cylinder") && (
                  <NumberField
                    label="Radius"
                    value={col.radius ?? 0.5}
                    min={0.05}
                    max={50}
                    step={0.1}
                    onChange={(radius) =>
                      updateCollider(selectedObject.id, col.id, { radius })
                    }
                  />
                )}

                {(col.type === "capsule" || col.type === "cylinder") && (
                  <NumberField
                    label="Height"
                    value={col.height ?? 1.0}
                    min={0.1}
                    max={50}
                    step={0.1}
                    onChange={(height) =>
                      updateCollider(selectedObject.id, col.id, { height })
                    }
                  />
                )}

                {/* Rotation */}
                <Vec3Field
                  label="Rotation"
                  value={col.rotation ?? [0, 0, 0]}
                  onChange={(rotation) =>
                    updateCollider(selectedObject.id, col.id, { rotation })
                  }
                  defaultValue={[0, 0, 0]}
                  step={0.05}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}

// ─── Main Inspector Panel ───────────────────────────────────────────────────

export function InspectorPanel() {
  const {
    selectedObject,
    selectedObjects,
    currentAreaScene,
    updateObject,
    deleteObject,
    duplicateObject,
    addCollider,
    updateCollider,
    deleteCollider,
    duplicateCollider,
    fitCollider,
  } = useEditor();

  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1500);
  };

  const handleFocus = () => {
    window.dispatchEvent(new CustomEvent("studio:focus-selected"));
  };

  // Multi-selection state (no single object selected)
  if (selectedObjects.length > 1 && !selectedObject) {
    return (
      <aside className="flex h-full w-full flex-col bg-zinc-950/90 text-zinc-200 backdrop-blur-md select-none overflow-hidden border-l border-zinc-800/80 font-sans">
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center text-zinc-400">
          <div className="rounded-full bg-cyan-900/30 border border-cyan-500/20 p-3.5 mb-3 text-cyan-400 shadow-inner">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <h3 className="text-xs font-semibold text-zinc-200 mb-1">
            {selectedObjects.length} Objects Selected
          </h3>
          <p className="text-[11px] text-zinc-500 max-w-[210px] leading-relaxed">
            Multi-selection active. Use <kbd className="text-zinc-300">G</kbd> / <kbd className="text-zinc-300">R</kbd> / <kbd className="text-zinc-300">S</kbd> to transform all objects together.
          </p>
        </div>
      </aside>
    );
  }

  // Empty State when no object is selected
  if (!selectedObject) {
    return (
      <aside className="flex h-full w-full flex-col bg-zinc-950/90 text-zinc-200 backdrop-blur-md select-none overflow-hidden border-l border-zinc-800/80 font-sans">
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center text-zinc-400">
          <div className="rounded-full bg-zinc-900/80 border border-zinc-800 p-3.5 mb-3 text-zinc-500 shadow-inner">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
          </div>
          <h3 className="text-xs font-semibold text-zinc-200 mb-1">No Object Selected</h3>
          <p className="text-[11px] text-zinc-500 max-w-[210px] leading-relaxed mb-4">
            Select an object in the 3D viewport or hierarchy tree to inspect and edit its properties.
          </p>
          <div className="text-[10px] text-zinc-500 border border-zinc-800/80 rounded bg-zinc-900/60 px-2.5 py-1">
            Active District:{" "}
            <span className="text-cyan-400 font-medium">
              {currentAreaScene.metadata.name}
            </span>
          </div>
        </div>
      </aside>
    );
  }

  // Object Inspector
  const handleTransformChange = (
    key: "position" | "rotation" | "scale",
    vec: Vec3,
  ) => {
    updateObject(
      selectedObject.id,
      {
        transform: {
          ...selectedObject.transform,
          [key]: vec,
        },
      },
      `Change ${selectedObject.label ?? selectedObject.id} ${key}`,
    );
  };

  const handleResetTransform = () => {
    updateObject(
      selectedObject.id,
      {
        transform: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
      },
      `Reset Transform ${selectedObject.label ?? selectedObject.id}`,
    );
  };

  return (
    <aside className="flex h-full w-full flex-col bg-zinc-950/90 text-zinc-200 backdrop-blur-md select-none overflow-hidden border-l border-zinc-800/80 font-sans">
      {/* Object Header */}
      <div className="border-b border-zinc-800/80 p-2.5 bg-zinc-900/40">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider text-cyan-400">
              {selectedObject.type}
            </span>
          </div>

          {/* Quick Object Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleFocus}
              className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[11px] text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
              title="Focus camera on object (F)"
            >
              Focus
            </button>
            <button
              type="button"
              onClick={() => duplicateObject(selectedObject.id)}
              className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[11px] text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
              title="Duplicate object (Shift+D)"
            >
              Duplicate
            </button>
            <button
              type="button"
              onClick={() => deleteObject(selectedObject.id)}
              className="rounded border border-rose-900/40 bg-rose-950/20 px-1.5 py-0.5 text-[11px] text-rose-400 hover:border-rose-800 hover:text-rose-300 transition-colors"
              title="Delete object (X)"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Editable Name & Monospace ID */}
        <div className="space-y-0.5">
          <input
            type="text"
            value={selectedObject.label ?? selectedObject.id}
            onChange={(e) => updateObject(selectedObject.id, { label: e.target.value })}
            className="w-full rounded border border-transparent hover:border-zinc-700 focus:border-cyan-500 bg-transparent px-1 py-0.5 text-xs font-semibold text-zinc-100 focus:bg-zinc-900 focus:outline-none transition-colors"
            placeholder="Object Label..."
          />
          <div className="flex items-center justify-between px-1 text-[10px] font-mono text-zinc-500">
            <span className="truncate">ID: {selectedObject.id}</span>
            <button
              type="button"
              onClick={() => handleCopyId(selectedObject.id)}
              className="text-[10px] text-zinc-400 hover:text-cyan-400 transition-colors"
            >
              {copiedId ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields Accordion (Scrolls independently) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs font-sans">
        {/* Transform Section */}
        <CollapsibleSection title="Transform" icon="🧭">
          <Vec3Field
            label="Position"
            value={selectedObject.transform.position}
            onChange={(vec) => handleTransformChange("position", vec)}
            defaultValue={[0, 0, 0]}
          />
          <Vec3Field
            label="Rotation (Radians)"
            value={selectedObject.transform.rotation ?? [0, 0, 0]}
            onChange={(vec) => handleTransformChange("rotation", vec)}
            defaultValue={[0, 0, 0]}
            step={0.05}
          />
          <Vec3Field
            label="Scale"
            value={selectedObject.transform.scale ?? [1, 1, 1]}
            onChange={(vec) => handleTransformChange("scale", vec)}
            defaultValue={[1, 1, 1]}
            step={0.1}
          />
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={handleResetTransform}
              className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Reset Transform (Alt+G)
            </button>
          </div>
        </CollapsibleSection>

        {/* Appearance / Contextual Properties */}
        <CollapsibleSection title="Properties" icon="🎨">
          {/* Point Light Fields */}
          {selectedObject.type === "point-light" && (
            <>
              <ColorField
                label="Light Color"
                value={(selectedObject as PointLightObject).color}
                onChange={(color) => updateObject(selectedObject.id, { color })}
              />
              <NumberField
                label="Intensity"
                value={(selectedObject as PointLightObject).intensity}
                min={0}
                max={50}
                step={0.5}
                onChange={(intensity) => updateObject(selectedObject.id, { intensity })}
              />
              <NumberField
                label="Distance (Range)"
                value={(selectedObject as PointLightObject).distance ?? 10}
                min={1}
                max={50}
                step={1}
                onChange={(distance) => updateObject(selectedObject.id, { distance })}
              />
              <BooleanField
                label="Cast Shadow"
                value={(selectedObject as PointLightObject).castShadow !== false}
                onChange={(castShadow) => updateObject(selectedObject.id, { castShadow })}
              />
            </>
          )}

          {/* Architecture Fields */}
          {selectedObject.type === "architecture" && (
            <>
              <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2 text-xs space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Architecture Module:</span>
                  <span className="font-mono text-cyan-300 font-semibold">
                    {(selectedObject as ArchitectureObject).moduleType}
                  </span>
                </div>
              </div>

              {/* Wall Segment props */}
              {(selectedObject as ArchitectureObject).moduleType === "wall-segment" && (
                <div className="space-y-2">
                  <NumberField
                    label="Wall Width"
                    value={((selectedObject as ArchitectureObject).props as any).width ?? 4}
                    step={0.5}
                    onChange={(width) =>
                      updateObject(selectedObject.id, {
                        props: { ...((selectedObject as ArchitectureObject).props as any), width },
                      } as any)
                    }
                  />
                  <SelectField
                    label="Wall Axis"
                    value={((selectedObject as ArchitectureObject).props as any).axis ?? "x"}
                    options={[
                      { value: "x", label: "X-Axis" },
                      { value: "z", label: "Z-Axis" },
                    ]}
                    onChange={(axis) =>
                      updateObject(selectedObject.id, {
                        props: { ...((selectedObject as ArchitectureObject).props as any), axis },
                      } as any)
                    }
                  />
                  <NumberField
                    label="Wall Height"
                    value={((selectedObject as ArchitectureObject).props as any).height ?? 3}
                    step={0.5}
                    onChange={(height) =>
                      updateObject(selectedObject.id, {
                        props: { ...((selectedObject as ArchitectureObject).props as any), height },
                      } as any)
                    }
                  />
                </div>
              )}

              {/* Column props */}
              {(selectedObject as ArchitectureObject).moduleType === "column" && (
                <div className="space-y-2">
                  <NumberField
                    label="Column Height"
                    value={((selectedObject as ArchitectureObject).props as any).height ?? 4}
                    step={0.5}
                    onChange={(height) =>
                      updateObject(selectedObject.id, {
                        props: { ...((selectedObject as ArchitectureObject).props as any), height },
                      } as any)
                    }
                  />
                  <NumberField
                    label="Column Size"
                    value={((selectedObject as ArchitectureObject).props as any).size ?? 0.8}
                    step={0.1}
                    onChange={(size) =>
                      updateObject(selectedObject.id, {
                        props: { ...((selectedObject as ArchitectureObject).props as any), size },
                      } as any)
                    }
                  />
                </div>
              )}

              {/* Mesh Primitive props */}
              {(selectedObject as ArchitectureObject).moduleType === "mesh-primitive" && (
                <div className="space-y-2">
                  <div className="text-zinc-400">
                    Geometry:{" "}
                    <strong className="text-zinc-200 font-mono">
                      {((selectedObject as ArchitectureObject).props as any).geometry}
                    </strong>
                  </div>
                  <BooleanField
                    label="Receive Shadow"
                    value={((selectedObject as ArchitectureObject).props as any).receiveShadow !== false}
                    onChange={(receiveShadow) =>
                      updateObject(selectedObject.id, {
                        props: { ...((selectedObject as ArchitectureObject).props as any), receiveShadow },
                      } as any)
                    }
                  />
                  <BooleanField
                    label="Cast Shadow"
                    value={Boolean(((selectedObject as ArchitectureObject).props as any).castShadow)}
                    onChange={(castShadow) =>
                      updateObject(selectedObject.id, {
                        props: { ...((selectedObject as ArchitectureObject).props as any), castShadow },
                      } as any)
                    }
                  />
                </div>
              )}
            </>
          )}

          {/* Portal Fields */}
          {selectedObject.type === "portal" && (
            <>
              <SelectField
                label="Destination District"
                value={(selectedObject as PortalObject).targetArea}
                options={worldAreaIds.map((id) => ({ value: id, label: id }))}
                onChange={(targetArea) =>
                  updateObject(selectedObject.id, { targetArea: targetArea as WorldAreaId })
                }
              />
              <TextField
                label="Target Display Label"
                value={(selectedObject as PortalObject).targetLabel}
                onChange={(targetLabel) => updateObject(selectedObject.id, { targetLabel })}
              />
              <ColorField
                label="Portal Accent Color"
                value={(selectedObject as PortalObject).accent}
                onChange={(accent) => updateObject(selectedObject.id, { accent })}
              />
              <TextField
                label="Subtitle"
                value={(selectedObject as PortalObject).subtitle ?? ""}
                onChange={(subtitle) => updateObject(selectedObject.id, { subtitle })}
              />
            </>
          )}

          {/* Decoration Fields */}
          {selectedObject.type === "decoration" && (
            <>
              <TextField
                label="Decoration Module Type"
                value={(selectedObject as any).moduleType ?? "generic"}
                onChange={(moduleType) => updateObject(selectedObject.id, { moduleType } as any)}
              />
              {((selectedObject as any).props?.color !== undefined || true) && (
                <ColorField
                  label="Color"
                  value={((selectedObject as any).props?.color as string) ?? "#06b6d4"}
                  onChange={(color) =>
                    updateObject(selectedObject.id, {
                      props: { ...((selectedObject as any).props ?? {}), color },
                    } as any)
                  }
                />
              )}
            </>
          )}

          {/* Image Plane Fields */}
          {selectedObject.type === "image-plane" && (
            <div className="space-y-3">
              {(selectedObject as ImagePlaneObject).imageUrl && (
                <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2 flex items-center justify-center max-h-[140px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(selectedObject as ImagePlaneObject).imageUrl}
                    alt={selectedObject.label ?? "Image Plane"}
                    className="max-h-[120px] max-w-full object-contain rounded"
                  />
                </div>
              )}
              <TextField
                label="Image URL / Data URI"
                value={(selectedObject as ImagePlaneObject).imageUrl ?? ""}
                onChange={(imageUrl) => updateObject(selectedObject.id, { imageUrl } as any)}
              />
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="Width (m)"
                  value={(selectedObject as ImagePlaneObject).width}
                  step={0.1}
                  min={0.1}
                  onChange={(width) => updateObject(selectedObject.id, { width } as any)}
                />
                <NumberField
                  label="Height (m)"
                  value={(selectedObject as ImagePlaneObject).height}
                  step={0.1}
                  min={0.1}
                  onChange={(height) => updateObject(selectedObject.id, { height } as any)}
                />
              </div>
              <BooleanField
                label="Double Sided"
                value={(selectedObject as ImagePlaneObject).doubleSided !== false}
                onChange={(doubleSided) => updateObject(selectedObject.id, { doubleSided } as any)}
              />
              <BooleanField
                label="Transparent (Alpha Cutout)"
                value={(selectedObject as ImagePlaneObject).transparent !== false}
                onChange={(transparent) => updateObject(selectedObject.id, { transparent } as any)}
              />
              <BooleanField
                label="Emissive Glow"
                value={Boolean((selectedObject as ImagePlaneObject).emissive)}
                onChange={(emissive) => updateObject(selectedObject.id, { emissive } as any)}
              />
              {(selectedObject as ImagePlaneObject).emissive && (
                <NumberField
                  label="Glow Intensity"
                  value={(selectedObject as ImagePlaneObject).emissiveIntensity ?? 0.2}
                  step={0.1}
                  min={0}
                  max={5}
                  onChange={(emissiveIntensity) => updateObject(selectedObject.id, { emissiveIntensity } as any)}
                />
              )}
            </div>
          )}
        </CollapsibleSection>

        {/* ─── Interaction Authoring Section ────────────────────────────────── */}
        <InteractionSection
          selectedObject={selectedObject}
          updateObject={updateObject}
        />

        {/* ─── Collision Authoring Section ────────────────────────────────── */}
        <CollisionSection
          selectedObject={selectedObject}
          addCollider={addCollider}
          updateCollider={updateCollider}
          deleteCollider={deleteCollider}
          duplicateCollider={duplicateCollider}
          fitCollider={fitCollider}
        />

        {/* Visibility & Runtime */}
        <CollapsibleSection title="Runtime & Visibility" icon="⚡">
          <BooleanField
            label="Visible in Runtime"
            value={selectedObject.visible !== false}
            onChange={(visible) => updateObject(selectedObject.id, { visible })}
          />
        </CollapsibleSection>
      </div>
    </aside>
  );
}

