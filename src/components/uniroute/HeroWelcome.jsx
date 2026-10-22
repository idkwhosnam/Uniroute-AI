import React from "react";
import { Target, Sparkles } from "lucide-react";

function FeasibilityGauge({ value, color }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative w-[140px] h-[140px] shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out, stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[34px] font-bold text-white leading-none">{value}%</span>
        <span className="text-[11px] font-medium text-white/80 mt-1">Khả thi</span>
      </div>
    </div>
  );
}

export default function HeroWelcome({ feasibility, mode, onModeChange, grade }) {
  const gaugeColor = feasibility >= 80 ? "#10B981" : feasibility >= 60 ? "#F59E0B" : "#EF4444";
  const level = feasibility >= 80 ? "CAO" : feasibility >= 60 ? "TRUNG BÌNH" : "THẤP";
  const levelColor = feasibility >= 80 ? "#6EE7B7" : feasibility >= 60 ? "#FCD34D" : "#FDA4AF";
  const isPrimary = mode === "primary";

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E3A8A] via-[#2545B5] to-[#3B82F6] p-6 shadow-sm">
      <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-56 h-56 rounded-full bg-[#6366F1]/30 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[11px] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FCD34D]" />
            {isPrimary
              ? `Lộ trình Lớp ${grade} · Mức an toàn ${feasibility >= 80 ? "CAO" : "CẦN CHÚ Ý"}`
              : "Backup Roadmap · Chế độ dự phòng đang kích hoạt"}
          </div>
          <h1 className="font-display text-[26px] lg:text-[28px] font-semibold text-white leading-tight">
            Xin chào, Nguyễn Văn A!
          </h1>
          <p className="text-[14px] text-white/85 mt-1.5 max-w-lg">
            {isPrimary
              ? `Lộ trình Lớp ${grade} của bạn đang đạt mức an toàn ${feasibility >= 80 ? "cao" : "trung bình"}. Tiếp tục duy trì để giữ vững vị thế trúng tuyển NV1.`
              : "Hệ thống đang ưu tiên phương thức HSA (ĐHQGHN) và Học bạ. Cập nhật điểm thi thử để hệ thống cân nhắc chuyển lại lộ trình chính."}
          </p>

          <div className="mt-4 inline-flex items-start gap-2.5 max-w-xl p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-white/15 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="leading-snug">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Mục tiêu NV1</div>
              <div className="text-[13px] font-semibold text-white">
                Công nghệ Thông tin — Đại học Bách Khoa Hà Nội
              </div>
              <div className="text-[11.5px] text-white/75 mt-0.5">Tổ hợp K01 · HSA · IELTS</div>
            </div>
          </div>
        </div>

        {/* Right: gauge */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <FeasibilityGauge value={feasibility} color={gaugeColor} />
          <div className="text-center">
            <div className="text-[13px] font-semibold text-white">Chỉ số Khả thi Trúng tuyển</div>
            <div className="text-[12px] font-semibold" style={{ color: levelColor }}>{level}</div>
          </div>
        </div>
      </div>

      {/* Toggle roadmap mode */}
      <div className="relative mt-5 inline-flex p-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15">
        <button
          onClick={() => onModeChange("primary")}
          className={`px-3.5 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
            isPrimary ? "bg-white text-[#1E3A8A] shadow-sm" : "text-white/80 hover:text-white"
          }`}
        >
          Primary Roadmap (Tối ưu)
        </button>
        <button
          onClick={() => onModeChange("backup")}
          className={`px-3.5 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
            !isPrimary ? "bg-white text-[#1E3A8A] shadow-sm" : "text-white/80 hover:text-white"
          }`}
        >
          Backup Roadmap (Dự phòng)
        </button>
      </div>
    </div>
  );
}