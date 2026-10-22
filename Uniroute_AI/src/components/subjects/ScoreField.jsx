import React from 'react';

export default function ScoreField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
        {label} <span className="text-[#DC2626]">*</span>
      </label>
      <input
        type="number"
        min="0"
        max="10"
        step="0.1"
        inputMode="decimal"
        placeholder="0 – 10"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 rounded-lg bg-white border border-[#E2E8F0] text-[13px] tabular-nums text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
      />
      <div className="mt-1 text-[10.5px] text-[#6B7280]">Thang điểm 10</div>
    </div>
  );
}