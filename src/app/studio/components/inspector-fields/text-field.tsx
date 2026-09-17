"use client";

interface TextFieldProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextField({ label, value = "", onChange, placeholder }: TextFieldProps) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] font-medium text-slate-400">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
      />
    </div>
  );
}
