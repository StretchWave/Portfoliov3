"use client";

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] font-medium text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.startsWith("#") ? value.slice(0, 7) : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border border-slate-700 bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
