import { NextResponse } from "next/server";
import { saveSceneToProjectSource } from "@/lib/scene-storage-server";
import type { AtlasSceneDefinition } from "@/types/scene";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body. Expected JSON object with scene definition.",
          code: "INVALID_REQUEST",
        },
        { status: 400 },
      );
    }

    const { scene, clientRevision, activeAreaId } = body as {
      scene: AtlasSceneDefinition;
      clientRevision?: number;
      activeAreaId?: string;
    };

    if (!scene || typeof scene !== "object" || !scene.areas) {
      return NextResponse.json(
        {
          success: false,
          error: "Malformed scene payload. 'scene.areas' is required.",
          code: "INVALID_SCENE_PAYLOAD",
        },
        { status: 400 },
      );
    }

    const result = saveSceneToProjectSource(scene, {
      expectedRevision: clientRevision,
      targetAreaId: activeAreaId as any,
    });

    if (!result.success) {
      const status =
        result.code === "REVISION_CONFLICT"
          ? 409
          : result.code === "VALIDATION_FAILED"
            ? 400
            : 500;

      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[POST /api/studio/save] Error saving scene:", err);
    return NextResponse.json(
      {
        success: false,
        error: `Internal server error during scene save: ${String(err)}`,
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
