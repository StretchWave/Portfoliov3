import { soundManager } from "@/lib/audio-synthesizer";

/**
 * High-resolution WebGL Viewport Screenshot Capture with Cybernetic Watermark.
 * Uses WebGL canvas with preserveDrawingBuffer enabled.
 */
export async function captureViewportScreenshot(areaName: string = "Central Hub"): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const canvas = document.querySelector(".portfolio-canvas canvas") as HTMLCanvasElement | null;
  if (!canvas) {
    console.warn("Atlas capture: WebGL canvas element not found.");
    return false;
  }

  // Play mechanical camera shutter audio
  soundManager.playCameraShutter();

  try {
    const width = canvas.width;
    const height = canvas.height;

    // Create offscreen canvas to composite watermark
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return false;

    // Draw the WebGL scene
    ctx.drawImage(canvas, 0, 0);

    // Composite cybernetic watermark banner
    const pad = Math.max(16, Math.round(width * 0.02));
    const bannerW = Math.min(360, width - pad * 2);
    const bannerH = 48;
    const bx = width - bannerW - pad;
    const by = height - bannerH - pad;

    // Banner glass background
    ctx.fillStyle = "rgba(4, 10, 22, 0.82)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 1.5;

    // Rounded rectangle
    const radius = 6;
    ctx.beginPath();
    ctx.moveTo(bx + radius, by);
    ctx.lineTo(bx + bannerW - radius, by);
    ctx.quadraticCurveTo(bx + bannerW, by, bx + bannerW, by + radius);
    ctx.lineTo(bx + bannerW, by + bannerH - radius);
    ctx.quadraticCurveTo(bx + bannerW, by + bannerH, bx + bannerW - radius, by + bannerH);
    ctx.lineTo(bx + radius, by + bannerH);
    ctx.quadraticCurveTo(bx, by + bannerH, bx, by + bannerH - radius);
    ctx.lineTo(bx, by + radius);
    ctx.quadraticCurveTo(bx, by, bx + radius, by);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Watermark text
    ctx.font = "bold 13px monospace, monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`◆ PROJECT ATLAS // ${areaName.toUpperCase()}`, bx + 14, by + 20);

    ctx.font = "10px monospace, monospace";
    ctx.fillStyle = "#94a3b8";
    const dateStr = new Date().toISOString().slice(0, 19).replace("T", " ");
    ctx.fillText(`${dateStr} UTC // REAL-TIME WEBGL VIEWPORT`, bx + 14, by + 36);

    // Export to PNG blob
    return new Promise<boolean>((resolve) => {
      offscreen.toBlob((blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const cleanName = areaName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        a.href = url;
        a.download = `atlas-${cleanName}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve(true);
      }, "image/png");
    });
  } catch (err) {
    console.error("Atlas capture failed:", err);
    return false;
  }
}
