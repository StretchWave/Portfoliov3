"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PanelResizerProps {
  side: "left" | "right";
  onResize: (newWidth: number) => void;
  currentWidth: number;
  minWidth?: number;
  maxWidth?: number;
  onResetDefault?: () => void;
  disabled?: boolean;
}

export function PanelResizer({
  side,
  onResize,
  currentWidth,
  minWidth = 200,
  maxWidth = 500,
  onResetDefault,
  disabled = false,
}: PanelResizerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef<number>(0);
  const startWidthRef = useRef<number>(currentWidth);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);
      startPosRef.current = e.clientX;
      startWidthRef.current = currentWidth;
    },
    [currentWidth, disabled],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPosRef.current;
      const proposedWidth =
        side === "left"
          ? startWidthRef.current + deltaX
          : startWidthRef.current - deltaX;

      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, proposedWidth));
      onResize(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Set cursor and unselectable on body during drag
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, side, minWidth, maxWidth, onResize]);

  if (disabled) return null;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${side} panel`}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onDoubleClick={onResetDefault}
      className={`group relative z-20 flex w-2 shrink-0 cursor-col-resize items-center justify-center transition-colors ${
        isDragging ? "bg-cyan-500/20" : "hover:bg-cyan-500/10"
      }`}
      title={`Drag to resize ${side} panel (Double-click to reset)`}
    >
      {/* Visual divider line */}
      <div
        className={`h-full w-[1px] transition-colors duration-150 ${
          isDragging
            ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            : "bg-zinc-800/80 group-hover:bg-cyan-500/50"
        }`}
      />
      {/* Central handle pip */}
      <div
        className={`absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded-full transition-colors ${
          isDragging
            ? "bg-cyan-400"
            : "bg-transparent group-hover:bg-cyan-500/60"
        }`}
      />
    </div>
  );
}
