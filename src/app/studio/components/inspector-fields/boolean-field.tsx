"use client";

interface BooleanFieldProps {
  label: string;
  value?: boolean;
  onChange: (value: boolean) => void;
}

export function BooleanField({ label, value = false, onChange }: BooleanFieldProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1">
      <span className="text-[11px] font-medium text-slate-400">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 accent-cyan-500 cursor-pointer"
      />
    </label>
  );
}
