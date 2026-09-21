import type { SceneObject, Vec3 } from "@/types/scene";

/**
 * Calculates the bounding vertical half-extent of an object based on its type and props.
 */
export function getObjectHalfHeight(obj: SceneObject): number {
  const scaleY = obj.transform.scale ? obj.transform.scale[1] : 1;

  if (obj.type === "architecture") {
    if (obj.moduleType === "column") {
      return ((obj.props.height ?? 4) * scaleY) / 2;
    }
    if (obj.moduleType === "wall-segment") {
      return ((obj.props.height ?? 3) * scaleY) / 2;
    }
    if (obj.moduleType === "frame-rib") {
      return ((obj.props.height ?? 4) * scaleY) / 2;
    }
    if (obj.moduleType === "mesh-primitive") {
      const args = obj.props.args;
      if (obj.props.geometry === "box" && args && args[1] !== undefined) {
        return (args[1] * scaleY) / 2;
      }
      if (obj.props.geometry === "cylinder" && args && args[2] !== undefined) {
        return (args[2] * scaleY) / 2;
      }
      if (obj.props.geometry === "sphere" && args && args[0] !== undefined) {
        return args[0] * scaleY;
      }
    }
  }

  if (obj.type === "trigger-volume") {
    return ((obj.dimensions[1] ?? 2) * scaleY) / 2;
  }

  // Default half-height estimation
  return 0.5 * scaleY;
}

/**
 * Finds the highest surface (floor, platform, wall top) beneath the given (x, z) coordinates.
 */
export function findSurfaceHeightBeneath(
  x: number,
  z: number,
  currentY: number,
  sceneObjects: readonly SceneObject[],
  ignoreObjectId?: string,
): number {
  let highestSurfaceY = 0; // Default world floor is Y = 0

  for (const obj of sceneObjects) {
    if (ignoreObjectId && obj.id === ignoreObjectId) continue;
    if (obj.visible === false) continue;

    const [ox, oy, oz] = obj.transform.position;
    const [sx, sy, sz] = obj.transform.scale ?? [1, 1, 1];

    let width = 2 * sx;
    let depth = 2 * sz;
    let topY = oy;

    if (obj.type === "architecture") {
      if (obj.moduleType === "wall-segment") {
        const w = (obj.props.width ?? 4) * sx;
        const t = (obj.props.thickness ?? 0.4) * sz;
        const h = (obj.props.height ?? 3) * sy;
        if (obj.props.axis === "x") {
          width = w;
          depth = t;
        } else {
          width = t;
          depth = w;
        }
        topY = oy + h / 2;
      } else if (obj.moduleType === "column") {
        const size = (obj.props.size ?? 0.8) * Math.max(sx, sz);
        const h = (obj.props.height ?? 4) * sy;
        width = size;
        depth = size;
        topY = oy + h / 2;
      } else if (obj.moduleType === "mesh-primitive") {
        const args = obj.props.args;
        if (obj.props.geometry === "box" && args) {
          width = (args[0] ?? 1) * sx;
          const h = (args[1] ?? 1) * sy;
          depth = (args[2] ?? 1) * sz;
          topY = oy + h / 2;
        } else if (obj.props.geometry === "cylinder" && args) {
          const r = Math.max(args[0] ?? 1, args[1] ?? 1) * Math.max(sx, sz);
          const h = (args[2] ?? 1) * sy;
          width = r * 2;
          depth = r * 2;
          topY = oy + h / 2;
        }
      }
    }

    // Check if (x, z) falls within the horizontal AABB
    const minX = ox - width / 2;
    const maxX = ox + width / 2;
    const minZ = oz - depth / 2;
    const maxZ = oz + depth / 2;

    if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
      // Must be below current object's position (with slight threshold)
      if (topY <= currentY + 0.5 && topY > highestSurfaceY) {
        highestSurfaceY = topY;
      }
    }
  }

  return highestSurfaceY;
}

/**
 * Calculates a dropped position for an object flush with the surface below it.
 */
export function calculateDroppedPosition(
  obj: SceneObject,
  sceneObjects: readonly SceneObject[],
  padding = 0,
): Vec3 {
  const [x, currentY, z] = obj.transform.position;
  const surfaceY = findSurfaceHeightBeneath(x, z, currentY, sceneObjects, obj.id);
  const halfHeight = getObjectHalfHeight(obj);
  const newY = surfaceY + halfHeight + padding;

  return [x, Number(newY.toFixed(3)), z];
}
