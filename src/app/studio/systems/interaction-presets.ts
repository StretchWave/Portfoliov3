import type { InteractionDefinition } from "@/types/scene";
import type { WorldAreaId } from "@/types/portfolio";

export interface InteractionPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  createDefinition: (params?: Record<string, any>) => InteractionDefinition;
}

export const INTERACTION_PRESETS: InteractionPreset[] = [
  {
    id: "project-exhibit",
    name: "Project Exhibit",
    category: "Portfolio",
    description: "Opens the project modal and highlights the exhibit on click",
    createDefinition: (params) => ({
      enabled: true,
      trigger: "click",
      prompt: "Inspect Project",
      feedback: "highlight",
      priority: 10,
      range: 4.5,
      actions: [
        { type: "play-sound", soundId: "modal" },
        { type: "highlight-object" },
        { type: "show-project", projectId: params?.projectId ?? "sonara" },
      ],
    }),
  },
  {
    id: "portal-gateway",
    name: "District Portal",
    category: "World Wayfinding",
    description: "Transfers the visitor to another district on click or entry",
    createDefinition: (params) => ({
      enabled: true,
      trigger: "click",
      prompt: "Enter Portal",
      feedback: "pulse",
      priority: 20,
      range: 3.5,
      actions: [
        { type: "play-sound", soundId: "teleport" },
        { type: "open-district", targetArea: (params?.targetArea as WorldAreaId) ?? "software-district" },
      ],
    }),
  },
  {
    id: "teleport-pad",
    name: "Teleport Pad",
    category: "Navigation",
    description: "Instantaneous teleportation between coordinates or pads",
    createDefinition: (params) => ({
      enabled: true,
      trigger: "proximity",
      prompt: "Teleport",
      feedback: "halo",
      priority: 15,
      range: 2.0,
      actions: [
        { type: "play-sound", soundId: "teleport" },
        { type: "teleport-player", targetArea: params?.targetArea, teleportPointId: params?.pointId },
      ],
    }),
  },
  {
    id: "info-terminal",
    name: "Information Terminal",
    category: "Content",
    description: "Displays rich architectural or contextual information",
    createDefinition: (params) => ({
      enabled: true,
      trigger: "click",
      prompt: "Read Documentation",
      feedback: "tooltip",
      priority: 5,
      range: 3.0,
      actions: [
        { type: "play-sound", soundId: "click" },
        {
          type: "show-information",
          title: params?.title ?? "Terminal Information",
          description: params?.description ?? "Architectural system overview and specifications.",
          category: params?.category ?? "System Archive",
        },
      ],
    }),
  },
  {
    id: "audio-source",
    name: "Spatial Audio Source",
    category: "Atmosphere",
    description: "Plays positional soundscape when player approaches",
    createDefinition: (params) => ({
      enabled: true,
      trigger: "proximity",
      priority: 1,
      range: params?.range ?? 6.0,
      actions: [
        { type: "play-sound", soundId: params?.soundId ?? "click" },
      ],
    }),
  },
];

export function getPresetById(id: string): InteractionPreset | undefined {
  return INTERACTION_PRESETS.find((p) => p.id === id);
}
