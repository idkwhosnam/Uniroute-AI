import React from "react";
import { Plus, Check, MapPin, Wallet, CalendarClock } from "lucide-react";

export default function ProgramCard({ program, isAdded, onAdd }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.06)] hover:border-[#C7D2FE] transition-colors flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10.5px] font-bold uppercase tracking-wide text-[#94A3B8]">{program.short}</div>
          <div className="text-[14px] font-semibold text-[#0F172A] leading-snug">{program.school}</div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#4338CA] text-[11px] font-semibold">
          {program.major}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] text-[11px] font-semibold">
          {program.method}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-semibold">
          {program.benchmark}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] text-[11px] font-medium">
          {program.combo}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 text-[12px] text-[#475569]">
        <div className="flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          {program.tuition}
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarClock className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          {program.note}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
          <MapPin className="w-3.5 h-3.5" />
          Hà Nội
        </span>
        <button
          onClick={() => onAdd(program)}
          disabled={isAdded}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors ${
            isAdded
              ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] cursor-default"
              : "bg-[#1E3A8A] text-white hover:bg-[#1E293B]"
          }`}
        >
          {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {isAdded ? "Đã thêm" : "Thêm NV"}
        </button>
      </div>
    </div>
  );
}