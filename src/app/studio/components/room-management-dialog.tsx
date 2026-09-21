"use client";

import { useState, useMemo } from "react";
import type { RoomDefinition, SceneObject, SpawnPoint, Vec3 } from "@/types/scene";
import { useEditor } from "../state/editor-context";

interface RoomManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export type RoomTemplate =
  | "empty"
  | "gallery"
  | "exhibition-hall"
  | "workshop"
  | "corridor";

export function RoomManagementDialog({ isOpen, onClose }: RoomManagementDialogProps) {
  const {
    state,
    currentAreaScene,
    addRoom,
    deleteRoom,
    duplicateRoom,
    setActiveRoom,
  } = useEditor();

  const [tab, setTab] = useState<"manage" | "create">("manage");

  // Create form state
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [width, setWidth] = useState(24);
  const [depth, setDepth] = useState(24);
  const [template, setTemplate] = useState<RoomTemplate>("gallery");
  const [inheritEnvironment, setInheritEnvironment] = useState(true);
  const [spawnX, setSpawnX] = useState(0);
  const [spawnZ, setSpawnZ] = useState(6);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rooms = useMemo(() => {
    return currentAreaScene.rooms ?? [
      {
        id: currentAreaScene.defaultRoomId ?? "main",
        name: "Main Room",
        description: currentAreaScene.metadata?.description,
        bounds: currentAreaScene.bounds,
        spawnPoints: [
          {
            id: "default-spawn",
            name: "Default Spawn",
            position: currentAreaScene.spawn.position,
            yaw: currentAreaScene.spawn.yaw,
          },
        ],
        defaultSpawnPointId: "default-spawn",
        objects: [...currentAreaScene.objects],
      },
    ];
  }, [currentAreaScene]);

  // Check portal references before deletion
  const checkPortalsTargetingRoom = (targetRoomId: string): string[] => {
    const refs: string[] = [];
    for (const [areaId, area] of Object.entries(state.scene.areas)) {
      if (!area) continue;
      for (const obj of area.objects) {
        if (obj.type === "portal") {
          const portal = obj as any;
          if (portal.targetRoom === targetRoomId) {
            refs.push(`Portal "${portal.label ?? portal.id}" in area "${areaId}"`);
          }
        }
      }
    }
    return refs;
  };

  const handleDeleteRoom = (targetRoomId: string) => {
    const referencingPortals = checkPortalsTargetingRoom(targetRoomId);
    if (referencingPortals.length > 0) {
      setErrorMsg(
        `Cannot delete room "${targetRoomId}". It is targeted by: ${referencingPortals.join(
          ", ",
        )}. Please repoint these portals first.`,
      );
      return;
    }

    if (rooms.length <= 1) {
      setErrorMsg("Cannot delete the only room in this district.");
      return;
    }

    setErrorMsg(null);
    deleteRoom(state.activeAreaId, targetRoomId);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = (roomId || roomName.toLowerCase().replace(/\s+/g, "-")).trim();

    if (!cleanId) {
      setErrorMsg("Please specify a Room ID or Name.");
      return;
    }

    if (rooms.some((r) => r.id === cleanId)) {
      setErrorMsg(`A room with ID "${cleanId}" already exists in this area.`);
      return;
    }

    setErrorMsg(null);

    // Compute bounds from width/depth centered at origin
    const halfW = width / 2;
    const halfD = depth / 2;
    const bounds = {
      minX: -halfW,
      maxX: halfW,
      minZ: -halfD,
      maxZ: halfD,
    };

    const initialSpawn: SpawnPoint = {
      id: "spawn-entrance",
      name: "Entrance Spawn",
      position: [spawnX, 1.7, spawnZ],
      yaw: 0,
      tags: ["entrance"],
    };

    // Instantiate template objects
    const objects: SceneObject[] = [];
    const timestamp = Date.now().toString(36).slice(-4);

    if (template === "gallery" || template === "exhibition-hall") {
      // Add floor
      objects.push({
        id: `${cleanId}-floor-${timestamp}`,
        type: "architecture",
        label: "Room Floor",
        moduleType: "mesh-primitive",
        props: {
          geometry: "box",
          args: [width, 0.2, depth],
          material: "floor",
          receiveShadow: true,
        },
        transform: { position: [0, -0.1, 0] },
      });

      // Add ambient point lights
      objects.push({
        id: `${cleanId}-light-center-${timestamp}`,
        type: "point-light",
        label: "Center Gallery Light",
        color: "#68e4ff",
        intensity: 10,
        distance: halfW * 1.2,
        transform: { position: [0, 3.6, 0] },
      });

      // Add info terminal exhibit anchor
      objects.push({
        id: `${cleanId}-terminal-${timestamp}`,
        type: "info-display",
        label: "Room Information Terminal",
        title: roomName || cleanId,
        description: roomDescription || "Exhibition Gallery",
        transform: { position: [0, 1.2, 0] },
        interaction: {
          enabled: true,
          trigger: "click",
          prompt: "View Room Details",
          feedback: "highlight",
          actions: [
            {
              type: "show-information",
              title: roomName,
              description: roomDescription,
            },
          ],
        },
      });
    } else if (template === "workshop") {
      // Add workshop floor
      objects.push({
        id: `${cleanId}-floor-${timestamp}`,
        type: "architecture",
        label: "Workshop Floor",
        moduleType: "mesh-primitive",
        props: {
          geometry: "box",
          args: [width, 0.2, depth],
          material: "structural",
          receiveShadow: true,
        },
        transform: { position: [0, -0.1, 0] },
      });
      // Work light
      objects.push({
        id: `${cleanId}-light-amber-${timestamp}`,
        type: "point-light",
        label: "Workbench Amber Light",
        color: "#f59e0b",
        intensity: 12,
        distance: 8,
        transform: { position: [0, 3.2, 0] },
      });
    }

    const newRoom: RoomDefinition = {
      id: cleanId,
      name: roomName || cleanId,
      description: roomDescription,
      bounds,
      spawnPoints: [initialSpawn],
      defaultSpawnPointId: initialSpawn.id,
      objects,
      enabled: true,
      environment: inheritEnvironment ? undefined : {},
    };

    addRoom(state.activeAreaId, newRoom);
    setActiveRoom(cleanId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-400">
              🏛️
            </span>
            <h2 className="text-sm font-semibold text-zinc-100 tracking-wide">
              Room Management — {currentAreaScene.metadata?.name ?? state.activeAreaId}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-800/80 mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setTab("manage");
              setErrorMsg(null);
            }}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              tab === "manage"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Manage Rooms ({rooms.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("create");
              setErrorMsg(null);
            }}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              tab === "create"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            + Create New Room
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded border border-rose-500/40 bg-rose-950/30 p-2.5 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Manage Tab */}
        {tab === "manage" && (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {rooms.map((room) => {
              const isActive = room.id === state.activeRoomId;
              const isDefault =
                room.id === (currentAreaScene.defaultRoomId ?? rooms[0]?.id);

              return (
                <div
                  key={room.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    isActive
                      ? "border-cyan-500/50 bg-cyan-950/20"
                      : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">
                        {room.name}
                      </span>
                      {isDefault && (
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400">
                          DEFAULT
                        </span>
                      )}
                      {isActive && (
                        <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.5 text-[9px] font-mono font-bold text-cyan-300">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">
                      ID: {room.id} · {room.objects?.length ?? 0} objects · Bounds [
                      {room.bounds?.minX}m to {room.bounds?.maxX}m]
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRoom(room.id);
                          onClose();
                        }}
                        className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                      >
                        Switch To
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => duplicateRoom(state.activeAreaId, room.id)}
                      className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:text-white transition-colors"
                      title="Duplicate room and all its objects"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room.id)}
                      disabled={rooms.length <= 1}
                      className="rounded border border-rose-900/50 bg-rose-950/20 px-2 py-1 text-xs text-rose-400 hover:bg-rose-900/30 disabled:opacity-30 transition-colors"
                      title="Delete room"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Tab */}
        {tab === "create" && (
          <form onSubmit={handleCreateRoom} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Project Gallery"
                  className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Room ID (slug)
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="auto-generated if empty"
                  className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Description
              </label>
              <input
                type="text"
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                placeholder="Optional description..."
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Width (X Axis)
                </label>
                <input
                  type="number"
                  min={6}
                  max={100}
                  step={2}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Depth (Z Axis)
                </label>
                <input
                  type="number"
                  min={6}
                  max={100}
                  step={2}
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Template */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Template Preset
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as RoomTemplate)}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-zinc-100 focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                <option value="gallery">Gallery (Floor + Ambient Light + Info Terminal)</option>
                <option value="exhibition-hall">Exhibition Hall (Spacious + Multi-light)</option>
                <option value="workshop">Workshop (Industrial Floor + Work Light)</option>
                <option value="corridor">Corridor (Narrow + Wayfinding)</option>
                <option value="empty">Empty Room (Spawn Point Only)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="inherit-env"
                checked={inheritEnvironment}
                onChange={(e) => setInheritEnvironment(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
              />
              <label htmlFor="inherit-env" className="text-zinc-300 select-none cursor-pointer">
                Inherit District Environment & Sky Lighting
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setTab("manage")}
                className="rounded border border-zinc-800 px-3 py-1.5 text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-cyan-500 px-4 py-1.5 font-semibold text-zinc-950 hover:bg-cyan-400 transition-colors shadow-xs"
              >
                Create Room
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
