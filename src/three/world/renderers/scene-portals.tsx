"use client";

import type { PortalObject } from "@/types/scene";

import { PortalGateway } from "../environment/portal-gateway";

export interface ScenePortalsProps {
  portals: readonly PortalObject[];
  onSelect?: (id: string) => void;
  onContextMenu?: (id: string, clientX: number, clientY: number) => void;
}

/**
 * Data-driven portal gateway renderer.
 * Renders spatial portals for navigating between world areas.
 */
export function ScenePortals({
  portals,
  onSelect,
  onContextMenu,
}: ScenePortalsProps) {
  return (
    <group name="scene-portals">
      {portals.map((portal) => {
        if (portal.visible === false) return null;

        return (
          <group
            key={portal.id}
            onClick={(e) => {
              if (onSelect) {
                e.stopPropagation();
                onSelect(portal.id);
              }
            }}
            onContextMenu={(e) => {
              if (onContextMenu) {
                e.stopPropagation();
                onContextMenu(portal.id, e.nativeEvent.clientX, e.nativeEvent.clientY);
              }
            }}
          >
            <PortalGateway
              targetArea={portal.targetArea}
              targetLabel={portal.targetLabel}
              subtitle={portal.subtitle}
              position={portal.transform.position}
              rotation={
                portal.transform.rotation
                  ? [
                      portal.transform.rotation[0],
                      portal.transform.rotation[1],
                      portal.transform.rotation[2],
                    ]
                  : undefined
              }
              accent={portal.accent}
            />
          </group>
        );
      })}
    </group>
  );
}
