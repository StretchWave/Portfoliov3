import type { AreaBounds, ColliderDefinition, Transform, Vec3 } from "@/types/scene";

export interface RegisteredCollider {
  objectId: string;
  collider: ColliderDefinition;
  worldCenter: Vec3;
  worldSize: Vec3;
  worldRadius: number;
  worldHeight: number;
  isTrigger: boolean;
}

export interface RaycastHit {
  objectId: string;
  colliderId: string;
  point: Vec3;
  distance: number;
  normal: Vec3;
}

export interface OverlapResult {
  objectId: string;
  colliderId: string;
  isTrigger: boolean;
}

/**
 * Lightweight, deterministic collision world for Project Atlas.
 * Resolves player sliding movement against physical colliders and
 * tracks overlaps with trigger colliders.
 */
export class CollisionWorld {
  private colliders = new Map<string, RegisteredCollider>();

  private makeKey(objectId: string, colliderId: string): string {
    return `${objectId}::${colliderId}`;
  }

  public registerCollider(
    objectId: string,
    parentTransform: Transform,
    collider: ColliderDefinition,
  ): void {
    if (!collider.enabled) {
      this.removeCollider(objectId, collider.id);
      return;
    }

    const pos = parentTransform.position;
    const scl = parentTransform.scale ?? [1, 1, 1];
    const offset = collider.center ?? [0, 0, 0];

    // Compute world center
    const worldCenter: Vec3 = [
      pos[0] + offset[0] * scl[0],
      pos[1] + offset[1] * scl[1],
      pos[2] + offset[2] * scl[2],
    ];

    const size = collider.size ?? [1, 1, 1];
    const worldSize: Vec3 = [
      size[0] * scl[0],
      size[1] * scl[1],
      size[2] * scl[2],
    ];

    const radius = (collider.radius ?? 0.5) * Math.max(scl[0], scl[2]);
    const height = (collider.height ?? 1.0) * scl[1];

    this.colliders.set(this.makeKey(objectId, collider.id), {
      objectId,
      collider,
      worldCenter,
      worldSize,
      worldRadius: radius,
      worldHeight: height,
      isTrigger: Boolean(collider.isTrigger),
    });
  }

  public updateCollider(
    objectId: string,
    parentTransform: Transform,
    collider: ColliderDefinition,
  ): void {
    this.registerCollider(objectId, parentTransform, collider);
  }

  public removeCollider(objectId: string, colliderId?: string): void {
    if (colliderId) {
      this.colliders.delete(this.makeKey(objectId, colliderId));
    } else {
      for (const [key, item] of this.colliders.entries()) {
        if (item.objectId === objectId) {
          this.colliders.delete(key);
        }
      }
    }
  }

  public clear(): void {
    this.colliders.clear();
  }

  public getColliders(): RegisteredCollider[] {
    return Array.from(this.colliders.values());
  }

  public getColliderCount(): number {
    return this.colliders.size;
  }

  /**
   * Resolves desired player movement against all physical colliders using
   * axis-separated sliding resolution.
   */
  public queryMovement(
    currentPos: Vec3,
    desiredMovement: Vec3,
    playerRadius = 0.35,
    bounds?: AreaBounds,
  ): Vec3 {
    let newX = currentPos[0] + desiredMovement[0];
    let newY = currentPos[1] + desiredMovement[1];
    let newZ = currentPos[2] + desiredMovement[2];

    const physicalColliders = Array.from(this.colliders.values()).filter(
      (c) => !c.isTrigger && c.collider.enabled,
    );

    // 1. Resolve X movement
    for (const c of physicalColliders) {
      if (this.checkCollision([newX, currentPos[1], currentPos[2]], playerRadius, c)) {
        newX = currentPos[0]; // Slide along YZ plane
        break;
      }
    }

    // 2. Resolve Z movement
    for (const c of physicalColliders) {
      if (this.checkCollision([newX, currentPos[1], newZ], playerRadius, c)) {
        newZ = currentPos[2]; // Slide along XY plane
        break;
      }
    }

    // 3. Safety Clamp against Area Bounds if provided
    if (bounds) {
      newX = Math.max(bounds.minX + playerRadius, Math.min(bounds.maxX - playerRadius, newX));
      newZ = Math.max(bounds.minZ + playerRadius, Math.min(bounds.maxZ - playerRadius, newZ));
    }

    return [newX, newY, newZ];
  }

  /**
   * Checks if player at pos with playerRadius collides with a registered collider.
   */
  private checkCollision(
    playerPos: Vec3,
    playerRadius: number,
    col: RegisteredCollider,
  ): boolean {
    const [px, py, pz] = playerPos;
    const [cx, cy, cz] = col.worldCenter;

    if (col.collider.type === "sphere") {
      const dx = px - cx;
      const dy = py - cy;
      const dz = pz - cz;
      const distSq = dx * dx + dy * dy + dz * dz;
      const totalR = playerRadius + col.worldRadius;
      return distSq < totalR * totalR;
    }

    if (col.collider.type === "box") {
      const halfW = col.worldSize[0] / 2;
      const halfH = col.worldSize[1] / 2;
      const halfD = col.worldSize[2] / 2;

      // Closest point on box to sphere center
      const closestX = Math.max(cx - halfW, Math.min(cx + halfW, px));
      const closestY = Math.max(cy - halfH, Math.min(cy + halfH, py));
      const closestZ = Math.max(cz - halfD, Math.min(cz + halfD, pz));

      const dx = px - closestX;
      const dy = py - closestY;
      const dz = pz - closestZ;

      return dx * dx + dy * dy + dz * dz < playerRadius * playerRadius;
    }

    if (col.collider.type === "cylinder" || col.collider.type === "capsule") {
      const halfH = col.worldHeight / 2;
      // Height clamp along Y
      const clampedY = Math.max(cy - halfH, Math.min(cy + halfH, py));
      const dx = px - cx;
      const dy = py - clampedY;
      const dz = pz - cz;
      const totalR = playerRadius + col.worldRadius;
      return dx * dx + dy * dy + dz * dz < totalR * totalR;
    }

    return false;
  }

  /**
   * Queries which trigger colliders currently overlap the player.
   */
  public queryOverlap(playerPos: Vec3, playerRadius = 0.4): OverlapResult[] {
    const hits: OverlapResult[] = [];
    for (const c of this.colliders.values()) {
      if (!c.collider.enabled) continue;
      if (this.checkCollision(playerPos, playerRadius, c)) {
        hits.push({
          objectId: c.objectId,
          colliderId: c.collider.id,
          isTrigger: c.isTrigger,
        });
      }
    }
    return hits;
  }

  /**
   * Simple raycast query for raycast hit detection.
   */
  public queryRaycast(
    origin: Vec3,
    direction: Vec3,
    maxDistance = 100,
  ): RaycastHit | null {
    let closestHit: RaycastHit | null = null;
    let closestDist = maxDistance;

    for (const c of this.colliders.values()) {
      if (!c.collider.enabled || c.isTrigger) continue;

      // Ray-Sphere test approximation for fast queries
      const [ox, oy, oz] = origin;
      const [dx, dy, dz] = direction;
      const [cx, cy, cz] = colCenter(c);

      const vx = cx - ox;
      const vy = cy - oy;
      const vz = cz - oz;

      const tca = vx * dx + vy * dy + vz * dz;
      if (tca < 0) continue;

      const d2 = vx * vx + vy * vy + vz * vz - tca * tca;
      const radius = Math.max(c.worldSize[0], c.worldSize[1], c.worldSize[2]) / 2;
      if (d2 > radius * radius) continue;

      const thc = Math.sqrt(radius * radius - d2);
      const t0 = tca - thc;
      if (t0 > 0 && t0 < closestDist) {
        closestDist = t0;
        closestHit = {
          objectId: c.objectId,
          colliderId: c.collider.id,
          point: [ox + dx * t0, oy + dy * t0, oz + dz * t0],
          distance: t0,
          normal: [0, 1, 0],
        };
      }
    }

    return closestHit;
  }
}

function colCenter(c: RegisteredCollider): Vec3 {
  return c.worldCenter;
}

/**
 * Shared singleton collision world for runtime experiences.
 */
export const globalCollisionWorld = new CollisionWorld();
