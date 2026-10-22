import React from "react";
import { CalendarClock, AlertCircle, Info, X } from "lucide-react";

const STYLES = {
  urgent: { bg: "#FEF2F2", border: "#FECACA", accent: "#EF4444", icon: AlertCircle },
  warning: { bg: "#FFFBEB", border: "#FDE68A", accent: "#F59E0B", icon: CalendarClock },
  info: { bg: "#EFF6FF", border: "#BFDBFE", accent: "#3B82F6", icon: Info },
};

export default function DeadlineAlerts({ alerts, onDismiss }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
            <CalendarClock className="w-[18px] h-[18px] text-[#EF4444]" />
          </div>
          <h2 className="text-[16px] font-medium text-[#0F172A]">Cảnh báo Deadline Quan trọng</h2>
        </div>
        {alerts.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[#EF4444] text-white text-[10.5px] font-semibold">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#ECFDF5] flex items-center justify-center mb-2">
            <CalendarClock className="w-5 h-5 text-[#10B981]" />
          </div>
          <div className="text-[13px] font-semibold text-[#0F172A]">Bạn đã xử lý hết các deadline</div>
          <div className="text-[12px] text-[#94A3B8] mt-0.5">Hệ thống sẽ cập nhật khi có lịch mới</div>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const s = STYLES[a.type];
            const Icon = s.icon;
            return (
              <div key={a.id} className="group p-3 rounded-lg border relative" style={{ backgroundColor: s.bg, borderColor: s.border }}>
                <button
                  onClick={() => onDismiss(a.id)}
                  title="Đánh dấu đã xử lý"
                  className="absolute top-2 right-2 w-5 h-5 rounded-full hidden group-hover:flex items-center justify-center bg-white/80 hover:bg-white text-[#475569] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="flex items-start gap-2.5 pr-5">
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: s.accent }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold text-[#0F172A] leading-snug">{a.title}</div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold" style={{ backgroundColor: s.accent, color: "#fff" }}>
                        {a.countdown}
                      </span>
                      <span className="text-[11px] text-[#475569]">{a.deadline}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}