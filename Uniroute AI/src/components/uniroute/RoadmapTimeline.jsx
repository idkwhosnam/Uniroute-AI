import React from "react";
import { CheckCircle2, Circle, Clock, AlertTriangle, Pencil } from "lucide-react";

const STATUS_STYLES = {
  completed: { ring: "border-[#10B981] bg-[#10B981]", icon: CheckCircle2, text: "text-[#10B981]", chip: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]" },
  active: { ring: "border-[#6366F1] bg-[#6366F1]", icon: Clock, text: "text-[#6366F1]", chip: "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]" },
  upcoming: { ring: "border-[#E2E8F0] bg-white", icon: Circle, text: "text-[#94A3B8]", chip: "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]" },
};

export default function RoadmapTimeline({ roadmap, scores, onOpenTrialDialog }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[18px] font-medium text-[#0F172A]">{roadmap.name}</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Cập nhật tự động theo kết quả thi thử</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#4338CA] text-[11px] font-semibold border border-[#C7D2FE]">
          {roadmap.nodes.length} cột mốc
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[#E2E8F0]" />
        <div className="space-y-5">
          {roadmap.nodes.map((node, i) => {
            const s = STATUS_STYLES[node.status];
            const Icon = s.icon;
            const currentScore = node.actionType === "tsa" ? scores.tsa : node.actionType === "hsa" ? scores.hsa : null;
            const examLabel = node.actionType === "tsa" ? "TSA" : "HSA";
            return (
              <div key={i} className="relative flex gap-4">
                <div className={`relative z-10 shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white ${s.ring}`}>
                  <Icon className={`w-4 h-4 ${node.status === "upcoming" ? "text-[#94A3B8]" : "text-white"}`} />
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-semibold ${s.text}`}>{node.date}</span>
                    {node.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${s.chip}`}>
                        {node.badge}
                      </span>
                    )}
                    {node.status === "active" && (
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold border bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]">
                        Đang diễn ra
                      </span>
                    )}
                  </div>
                  <div className="text-[14px] font-semibold text-[#0F172A] mt-1">{node.title}</div>
                  <div className="text-[12.5px] text-[#475569] mt-0.5">
                    {node.detail}
                    {currentScore !== null && (
                      <span className="text-[#1E3A8A] font-semibold"> · Thi thử: {currentScore}/100</span>
                    )}
                  </div>
                  {node.actionType && (
                    <button
                      onClick={() => onOpenTrialDialog(node.actionType)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#1E3A8A] text-[12px] font-semibold border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Cập nhật điểm thi thử {examLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adaptive alert */}
      <div className="mt-5 flex items-start gap-3 p-3.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]">
        <div className="w-8 h-8 shrink-0 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-[#D97706]" />
        </div>
        <div className="leading-snug">
          <div className="text-[12.5px] font-semibold text-[#92400E]">Cảnh báo thích ứng (Adaptive)</div>
          <p className="text-[12px] text-[#78350F] mt-0.5">{roadmap.alert}</p>
        </div>
      </div>
    </div>
  );
}