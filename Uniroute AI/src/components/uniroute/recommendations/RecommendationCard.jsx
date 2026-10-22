import React from "react";
import { Plus, Check } from "lucide-react";

const TAG_STYLES = {
  safe: { label: "An toàn", cls: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]", bar: "#10B981" },
  balanced: { label: "Cân bằng", cls: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]", bar: "#F59E0B" },
  challenge: { label: "Thách thức", cls: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]", bar: "#EF4444" },
};

export default function RecommendationCard({ rec, rank, isAdded, onAdd }) {
  const tag = TAG_STYLES[rec.tag];
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.06)] hover:border-[#C7D2FE] transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[13px] font-bold text-[#1E3A8A] shrink-0">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-[#0F172A]">{rec.major}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${tag.cls}`}>{tag.label}</span>
          </div>
          <div className="text-[12.5px] text-[#475569] mt-0.5">
            {rec.school} · <span className="text-[#6366F1] font-medium">{rec.method}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[20px] font-bold leading-none" style={{ color: tag.bar }}>
            {rec.match}%
          </div>
          <div className="text-[10.5px] font-medium text-[#94A3B8] mt-1">Phù hợp</div>
        </div>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rec.match}%`, backgroundColor: tag.bar }} />
      </div>

      <ul className="mt-3 space-y-1.5">
        {rec.reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[12px] text-[#475569]">
            <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
            {r}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onAdd(rec)}
        disabled={isAdded}
        className={`mt-3.5 w-full flex items-center justify-center gap-1.5 h-9 rounded-lg text-[12.5px] font-semibold transition-colors ${
          isAdded
            ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] cursor-default"
            : "bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] hover:bg-[#DBEAFE]"
        }`}
      >
        {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {isAdded ? "Đã có trong danh sách nguyện vọng" : "Thêm vào danh sách nguyện vọng"}
      </button>
    </div>
  );
}