"use client";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly (string | SelectOption)[];
  onChange: (value: string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] font-medium text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
      >
        {options.map((opt) => {
          const optValue = typeof opt === "string" ? opt : opt.value;
          const optLabel = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}
