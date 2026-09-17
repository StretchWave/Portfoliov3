"use client";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
}: NumberFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
        <span>{label}</span>
        <span className="font-mono text-slate-300">{Number(value).toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-2">
        {min !== undefined && max !== undefined && (
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="flex-1 accent-cyan-400"
          />
        )}
        <input
          type="number"
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) onChange(val);
          }}
          className="w-20 rounded border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
