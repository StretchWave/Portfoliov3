import { NextResponse } from "next/server";
import { getStorageStatus } from "@/lib/scene-storage-server";

export async function GET() {
  try {
    const status = getStorageStatus();
    return NextResponse.json(status, { status: 200 });
  } catch (err) {
    console.error("[GET /api/studio/status] Error reading status:", err);
    return NextResponse.json(
      {
        error: `Failed to retrieve studio storage status: ${String(err)}`,
      },
      { status: 500 },
    );
  }
}
