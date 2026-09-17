/**
 * Canonical scene data types for Project Atlas.
 *
 * This file defines the serializable vocabulary for world scene definitions.
 * It is intentionally independent from React and Three.js so that the same
 * types can be consumed by:
 *   - The runtime renderer (src/three/world/)
 *   - Atlas Studio editor (src/app/studio/)
 *   - Validation logic (src/lib/scene-validation.ts)
 *   - Import/export tooling (scripts/)
 *   - A future CMS adapter
 *
 * Keep this file free of framework imports. All types must be JSON-serializable.
 */

import type { WorldAreaId } from "./portfolio";

// ─── Primitives ───────────────────────────────────────────────────────────────

/** A three-component vector: [x, y, z]. */
export type Vec3 = readonly [number, number, number];

/** A CSS hex color string (e.g. "#68e4ff"). */
export type Color = string;

// ─── Transform ────────────────────────────────────────────────────────────────

export interface Transform {
  position: Vec3;
  /** Euler angles in radians (YXZ order, matching Three.js convention). */
  rotation?: Vec3;
  /** Defaults to [1, 1, 1] when omitted. */
  scale?: Vec3;
}

// ─── Runtime Settings & Interaction Definition ────────────────────────────────

export interface RuntimeSettings {
  visibleInRuntime?: boolean;
  selectableInEditor?: boolean;
  interactable?: boolean;
  collisionEnabled?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface InteractionAction {
  type:
    | "show-project"
    | "show-information"
    | "teleport-player"
    | "open-district"
    | "play-sound"
    | "play-animation"
    | "highlight-object"
    | "open-modal"
    | "open-link"
    | "toggle-state";
  projectId?: string;
  title?: string;
  description?: string;
  category?: string;
  targetArea?: WorldAreaId;
  teleportPointId?: string;
  soundId?: string;
  animationName?: string;
  url?: string;
  variable?: string;
  value?: unknown;
}

export interface InteractionCondition {
  type: "discovered-milestone" | "variable-equals" | "district-active";
  key: string;
  value?: unknown;
}

export interface InteractionDefinition {
  enabled: boolean;
  trigger: "click" | "double-click" | "hover" | "proximity" | "interact-key" | "tap";
  prompt?: string;
  feedback?: "highlight" | "tooltip" | "halo" | "pulse";
  priority?: number;
  range?: number;
  conditions?: InteractionCondition[];
  actions: InteractionAction[];
}

// ─── Scene Object Base ────────────────────────────────────────────────────────

/** Shared fields for every object in a scene. */
export interface SceneObjectBase {
  /** Stable unique identifier within the area scene. */
  id: string;
  /** Discriminator — determines the object's concrete type. */
  type: string;
  /** Human-readable name for the editor hierarchy and tooltips. */
  label?: string;
  /** When false, the object is hidden in the runtime. Defaults to true. */
  visible?: boolean;
  /** When true, the object cannot be moved or edited in the Studio. */
  editorLocked?: boolean;
  /** Free-form notes for the scene author (not displayed in runtime). */
  editorNotes?: string;
  /** Runtime behavior and rendering flags */
  runtime?: RuntimeSettings;
  /** Interactive behavior definition */
  interaction?: InteractionDefinition;
}

// ─── Point Light ──────────────────────────────────────────────────────────────

export interface PointLightObject extends SceneObjectBase {
  type: "point-light";
  transform: Transform;
  color: Color;
  intensity: number;
  distance: number;
  castShadow?: boolean;
}

// ─── Portal ───────────────────────────────────────────────────────────────────

export interface PortalObject extends SceneObjectBase {
  type: "portal";
  transform: Transform;
  targetArea: WorldAreaId;
  targetLabel: string;
  subtitle?: string;
  accent: Color;
  /** Defaults to 2.8 when omitted. */
  interactionRange?: number;
}

// ─── Architecture Object ─────────────────────────────────────────────────────

/**
 * The set of reusable architectural module components.
 * Each maps 1:1 to a React component in src/three/world/environment/.
 */
export type ArchitectureModuleType =
  | "wall-segment"
  | "column"
  | "frame-rib"
  | "ceiling-panel-light"
  | "light-ribbon"
  | "mesh-primitive";

// ── Module-specific prop interfaces ──

export interface WallSegmentProps {
  width: number;
  axis: "x" | "z";
  height?: number;
  thickness?: number;
  rail?: boolean;
  railSide?: -1 | 1;
}

export interface ColumnProps {
  height?: number;
  size?: number;
  accentCaps?: boolean;
}

export interface FrameRibProps {
  height?: number;
  axis: "x" | "z";
  thickness?: number;
}

export interface CeilingPanelLightProps {
  width: number;
  depth: number;
}

export interface LightRibbonProps {
  length: number;
  axis: "x" | "z";
  color?: Color;
}

export interface MeshPrimitiveProps {
  geometry: "box" | "plane" | "cylinder" | "sphere" | "cone" | "torus" | "ring";
  args: readonly number[];
  material:
    | "structural"
    | "wallPanel"
    | "floor"
    | "displayGlass"
    | "trim"
    | "fixtureLight"
    | "marker"
    | { color: Color; emissive?: Color; emissiveIntensity?: number; roughness?: number; metalness?: number; transparent?: boolean; opacity?: number; basicMaterial?: boolean };
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export type ArchitectureModuleProps =
  | { moduleType: "wall-segment"; props: WallSegmentProps }
  | { moduleType: "column"; props: ColumnProps }
  | { moduleType: "frame-rib"; props: FrameRibProps }
  | { moduleType: "ceiling-panel-light"; props: CeilingPanelLightProps }
  | { moduleType: "light-ribbon"; props: LightRibbonProps }
  | { moduleType: "mesh-primitive"; props: MeshPrimitiveProps };

export type ArchitectureObject = SceneObjectBase & {
  type: "architecture";
  transform: Transform;
} & ArchitectureModuleProps;

// ─── Decoration Object ───────────────────────────────────────────────────────

/**
 * Non-structural, area-specific decorative elements (e.g. data conduits,
 * topographic grids, holographic rings). These are rendered by dedicated
 * area-specific components referenced by moduleType.
 */
export interface DecorationObject extends SceneObjectBase {
  type: "decoration";
  /** Identifies the decoration renderer component. */
  moduleType: string;
  transform: Transform;
  props?: Record<string, unknown>;
}

// ─── Semantic Object Types ──────────────────────────────────────────────────

export interface TeleportPointObject extends SceneObjectBase {
  type: "teleport-point";
  transform: Transform;
  targetArea?: WorldAreaId;
  spawnYaw?: number;
}

export interface TriggerVolumeObject extends SceneObjectBase {
  type: "trigger-volume";
  transform: Transform;
  dimensions: Vec3;
}

export interface AudioSourceObject extends SceneObjectBase {
  type: "audio-source";
  transform: Transform;
  soundId: string;
  volume: number;
  loop?: boolean;
  range?: number;
}

export interface InfoDisplayObject extends SceneObjectBase {
  type: "info-display";
  transform: Transform;
  title: string;
  description?: string;
  category?: string;
  projectId?: string;
}

// ─── Scene Object Union ──────────────────────────────────────────────────────

export type SceneObject =
  | PointLightObject
  | PortalObject
  | ArchitectureObject
  | DecorationObject
  | TeleportPointObject
  | TriggerVolumeObject
  | AudioSourceObject
  | InfoDisplayObject;

// ─── Atmosphere ──────────────────────────────────────────────────────────────

export interface AtmosphereConfig {
  particleColor?: Color;
  particleCount?: number;
}

// ─── Area Bounds ─────────────────────────────────────────────────────────────

export interface AreaBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// ─── Spawn ───────────────────────────────────────────────────────────────────

export interface SpawnConfig {
  position: Vec3;
  /** Initial camera yaw in radians. */
  yaw: number;
}

// ─── Area Metadata ───────────────────────────────────────────────────────────

export interface AreaMetadata {
  name: string;
  categoryTitle: string;
  description: string;
  accent: Color;
}

// ─── Area Scene Definition ───────────────────────────────────────────────────

export interface AreaSceneDefinition {
  /** Must match a registered WorldAreaId. */
  id: WorldAreaId;
  /** Schema version for future migration. */
  version: number;
  metadata: AreaMetadata;
  bounds: AreaBounds;
  spawn: SpawnConfig;
  atmosphere: AtmosphereConfig;
  objects: readonly SceneObject[];
}

// ─── Environment Configuration ───────────────────────────────────────────────

export interface FogConfig {
  color: Color;
  near: number;
  far: number;
}

export interface HemisphereLightConfig {
  skyColor: Color;
  groundColor: Color;
  intensity: number;
}

export interface ShadowCameraConfig {
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
}

export interface DirectionalLightConfig {
  intensity: number;
  position: Vec3;
  shadow: {
    mapSize: number;
    camera: ShadowCameraConfig;
    bias: number;
  };
}

export interface GroundConfig {
  size: number;
}

export interface GridConfig {
  size: readonly [number, number];
  cellSize: number;
  cellThickness: number;
  cellColor: Color;
  sectionSize: number;
  sectionThickness: number;
  sectionColor: Color;
  fadeDistance: number;
  fadeStrength: number;
}

export interface EnvironmentConfig {
  background: Color;
  fog: FogConfig;
  hemisphereLight: HemisphereLightConfig;
  directionalLight: DirectionalLightConfig;
  ground: GroundConfig;
  grid: GridConfig;
}

// ─── Global Scene Definition ─────────────────────────────────────────────────

export interface AtlasSceneDefinition {
  /** Schema version for the overall scene document. */
  version: number;
  environment: EnvironmentConfig;
  areas: Partial<Record<WorldAreaId, AreaSceneDefinition>>;
}

// ─── Asset Reference ─────────────────────────────────────────────────────────

export interface AssetReference {
  /** Path relative to /public (e.g. "models/atlas-hub/portal.glb"). */
  path: string;
  type: "model" | "texture" | "image";
  format?: "glb" | "gltf" | "ktx2" | "png" | "jpg" | "webp";
}
