"use client";

import { useState, useRef, useEffect } from "react";
import type { ImagePlaneObject } from "@/types/scene";
import { useEditor } from "../state/editor-context";

interface ImportImagePlaneDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportImagePlaneDialog({
  isOpen,
  onClose,
}: ImportImagePlaneDialogProps) {
  const { addObject, state } = useEditor();

  const [imageUrl, setImageUrl] = useState("");
  const [label, setLabel] = useState("Image Plane");
  const [width, setWidth] = useState(3.0);
  const [height, setHeight] = useState(2.0);
  const [aspectRatio, setAspectRatio] = useState(1.5);
  const [lockAspect, setLockAspect] = useState(true);
  const [orientation, setOrientation] = useState<"standing" | "flat">("standing");
  const [doubleSided, setDoubleSided] = useState(true);
  const [transparent, setTransparent] = useState(true);
  const [emissive, setEmissive] = useState(false);
  const [emissiveIntensity, setEmissiveIntensity] = useState(0.2);
  const [previewError, setPreviewError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect aspect ratio when image URL changes
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setPreviewError(false);
      const ratio = img.naturalWidth / Math.max(img.naturalHeight, 1);
      setAspectRatio(ratio);
      if (lockAspect) {
        setHeight(Number((width / ratio).toFixed(2)));
      }
    };
    img.onerror = () => {
      setPreviewError(true);
    };
    img.src = imageUrl;
  }, [imageUrl, width, lockAspect]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setLabel(fileName.charAt(0).toUpperCase() + fileName.slice(1));

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && aspectRatio > 0) {
      setHeight(Number((val / aspectRatio).toFixed(2)));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && aspectRatio > 0) {
      setWidth(Number((val * aspectRatio).toFixed(2)));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    const suffix = Date.now().toString(36).slice(-4);
    const id = `image-plane-${suffix}`;

    // Place at cursor or default position
    const posX = state.cursor3D[0] || 0;
    const posY = orientation === "standing"
      ? (state.cursor3D[1] || 0) + height / 2
      : (state.cursor3D[1] || 0) + 0.05;
    const posZ = state.cursor3D[2] || 0;

    const rotX = orientation === "flat" ? -Math.PI / 2 : 0;

    const newObj: ImagePlaneObject = {
      id,
      type: "image-plane",
      label: label.trim() || `Image Plane ${suffix}`,
      transform: {
        position: [posX, Number(posY.toFixed(3)), posZ],
        rotation: [rotX, 0, 0],
        scale: [1, 1, 1],
      },
      imageUrl,
      aspectRatio,
      width,
      height,
      doubleSided,
      transparent,
      emissive,
      emissiveIntensity,
    };

    addObject(newObj, undefined, `Add Image Plane ${newObj.label}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl space-y-4 animate-in">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">🖼️</span>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Import Image as Plane</h2>
              <p className="text-[11px] text-zinc-500">Add a textured 3D plane for artwork, diagrams, or posters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-xs px-1 py-0.5 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-3.5 text-xs font-sans">
          {/* File Picker or URL Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-zinc-300">Image Source</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-950/30 px-3 py-1.5 font-medium text-cyan-300 hover:bg-cyan-900/40 hover:text-cyan-100 transition-colors cursor-pointer text-xs"
              >
                <span>📁</span>
                <span>Choose Local File...</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-zinc-500">or URL:</span>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or /images/..."
                className="flex-1 rounded border border-zinc-800 bg-zinc-900/80 px-2 py-1 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative rounded border border-zinc-800 bg-zinc-900/40 p-2 flex items-center justify-center min-h-[100px] max-h-[160px] overflow-hidden">
              {previewError ? (
                <div className="text-[11px] text-rose-400">Failed to preview image URL</div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-[140px] max-w-full object-contain rounded"
                />
              )}
            </div>
          )}

          {/* Label */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-300">Object Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded border border-zinc-800 bg-zinc-900/80 px-2 py-1 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300">Width (m)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={width}
                onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 1)}
                className="w-full rounded border border-zinc-800 bg-zinc-900/80 px-2 py-1 text-xs font-mono text-zinc-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300">Height (m)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={height}
                onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 1)}
                className="w-full rounded border border-zinc-800 bg-zinc-900/80 px-2 py-1 text-xs font-mono text-zinc-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="lock-aspect"
              checked={lockAspect}
              onChange={(e) => setLockAspect(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
            />
            <label htmlFor="lock-aspect" className="text-[11px] text-zinc-400 cursor-pointer">
              Lock Aspect Ratio ({aspectRatio.toFixed(2)}:1)
            </label>
          </div>

          {/* Orientation */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-300">Orientation</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrientation("standing")}
                className={`rounded border px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                  orientation === "standing"
                    ? "border-cyan-500/50 bg-cyan-950/40 text-cyan-300 font-medium"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Standing (Wall / Billboard)
              </button>
              <button
                type="button"
                onClick={() => setOrientation("flat")}
                className={`rounded border px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                  orientation === "flat"
                    ? "border-cyan-500/50 bg-cyan-950/40 text-cyan-300 font-medium"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Flat (Floor / Table)
              </button>
            </div>
          </div>

          {/* Material Options */}
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={doubleSided}
                onChange={(e) => setDoubleSided(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
              />
              <span>Double-Sided</span>
            </label>

            <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
              />
              <span>Transparency (Alpha)</span>
            </label>

            <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={emissive}
                onChange={(e) => setEmissive(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
              />
              <span>Emissive Glow</span>
            </label>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-zinc-800/80 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!imageUrl.trim()}
              className="rounded border border-cyan-500/50 bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-cyan-500 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Add to Scene
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
