"use client";

import { useCallback } from "react";
import type { Vec3 } from "@/types/scene";

interface Vec3FieldProps {
  label: string;
  value?: Vec3;
  onChange: (value: Vec3) => void;
  step?: number;
  defaultValue?: Vec3;
  onReset?: () => void;
}

export function Vec3Field({
  label,
  value = [0, 0, 0],
  onChange,
  step = 0.1,
  defaultValue,
  onReset,
}: Vec3FieldProps) {
  const handleChange = useCallback(
    (index: 0 | 1 | 2, valStr: string) => {
      const val = parseFloat(valStr);
      if (isNaN(val)) return;
      const next: [number, number, number] = [value[0], value[1], value[2]];
      next[index] = Number(val.toFixed(3));
      onChange(next);
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (index: 0 | 1 | 2, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        let delta = step;
        if (e.shiftKey) delta = step * 10;
        else if (e.ctrlKey || e.altKey) delta = step * 0.1;

        if (e.key === "ArrowDown") delta = -delta;

        const currentVal = value[index];
        const nextVal = Number((currentVal + delta).toFixed(3));
        const next: [number, number, number] = [value[0], value[1], value[2]];
        next[index] = nextVal;
        onChange(next);
      }
    },
    [value, onChange, step],
  );

  const handleDefaultReset = () => {
    if (onReset) {
      onReset();
    } else if (defaultValue) {
      onChange(defaultValue);
    }
  };

  return (
    <div className="space-y-1.5 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
        {(onReset || defaultValue) && (
          <button
            type="button"
            onClick={handleDefaultReset}
            className="text-[10px] text-zinc-500 hover:text-cyan-400 font-mono transition-colors cursor-pointer"
            title="Reset to default"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1 font-mono text-xs">
        {/* X Axis */}
        <div className="flex items-center rounded border border-zinc-800/90 bg-zinc-900/80 px-1.5 py-1 focus-within:border-rose-500/80 focus-within:ring-1 focus-within:ring-rose-500/20 transition-all">
          <span className="mr-1 rounded px-1 py-0.2 text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 select-none">
            X
          </span>
          <input
            type="number"
            step={step}
            value={value[0]}
            onChange={(e) => handleChange(0, e.target.value)}
            onKeyDown={(e) => handleKeyDown(0, e)}
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-600 focus:outline-none text-right font-mono text-xs"
            title="X (ArrowUp/Down to increment, Shift: ×10, Ctrl: ÷10)"
          />
        </div>

        {/* Y Axis */}
        <div className="flex items-center rounded border border-zinc-800/90 bg-zinc-900/80 px-1.5 py-1 focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
          <span className="mr-1 rounded px-1 py-0.2 text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 select-none">
            Y
          </span>
          <input
            type="number"
            step={step}
            value={value[1]}
            onChange={(e) => handleChange(1, e.target.value)}
            onKeyDown={(e) => handleKeyDown(1, e)}
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-600 focus:outline-none text-right font-mono text-xs"
            title="Y (ArrowUp/Down to increment, Shift: ×10, Ctrl: ÷10)"
          />
        </div>

        {/* Z Axis */}
        <div className="flex items-center rounded border border-zinc-800/90 bg-zinc-900/80 px-1.5 py-1 focus-within:border-cyan-500/80 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
          <span className="mr-1 rounded px-1 py-0.2 text-[9px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 select-none">
            Z
          </span>
          <input
            type="number"
            step={step}
            value={value[2]}
            onChange={(e) => handleChange(2, e.target.value)}
            onKeyDown={(e) => handleKeyDown(2, e)}
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-600 focus:outline-none text-right font-mono text-xs"
            title="Z (ArrowUp/Down to increment, Shift: ×10, Ctrl: ÷10)"
          />
        </div>
      </div>
    </div>
  );
}
