import React from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { computeChances, chanceLevel } from "@/components/uniroute/data";

function chanceColor(chance) {
  if (chance >= 85) return { text: "#047857", bar: "#10B981" };
  if (chance >= 75) return { text: "#B45309", bar: "#F59E0B" };
  return { text: "#B91C1C", bar: "#EF4444" };
}

function ScoreInputTile({ label, value, onChange, step, min, max, suffix }) {
  return (
    <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#6366F1] focus-within:bg-white transition-colors">
      <label className="text-[11px] font-medium text-[#94A3B8]">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const num = parseFloat(e.target.value);
          if (!isNaN(num)) onChange(Math.max(min, Math.min(max, num)));
          else if (e.target.value === "") onChange(e.target.value);
        }}
        className="w-full bg-transparent text-[20px] font-bold text-[#1E3A8A] mt-0.5 leading-tight outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && <div className="text-[10px] text-[#94A3B8]">{suffix}</div>}
    </div>
  );
}

export default function ScoreSimulator({ scores, onScoreChange }) {
  const results = computeChances({ ielts: scores.ielts, gpa: scores.gpa, tsa: scores.tsa });

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
            <Calculator className="w-[18px] h-[18px] text-[#6366F1]" />
          </div>
          <div>
            <h2 className="text-[16px] font-medium text-[#0F172A]">Mô phỏng Điểm Xét tuyển Đa phương thức</h2>
            <p className="text-[12px] text-[#94A3B8]">Trường tại Hà Nội · Thay đổi điểm để xem cơ hội tức thì</p>
          </div>
        </div>
      </div>

      {/* Editable inputs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <ScoreInputTile
          label="IELTS"
          value={scores.ielts}
          onChange={(v) => onScoreChange("ielts", v)}
          step={0.5}
          min={0}
          max={9}
        />
        <ScoreInputTile
          label="GPA 5HK"
          value={scores.gpa}
          onChange={(v) => onScoreChange("gpa", v)}
          step={0.1}
          min={0}
          max={10}
        />
        <ScoreInputTile
          label="TSA Thi thử"
          value={scores.tsa}
          onChange={(v) => onScoreChange("tsa", v)}
          step={1}
          min={0}
          max={100}
          suffix="Thang điểm 100"
        />
      </div>

      {/* Results */}
      <div className="space-y-2.5">
        {results.map((r, i) => {
          const c = chanceColor(r.chance);
          return (
            <div key={i} className="p-3.5 rounded-lg border border-[#E2E8F0] hover:border-[#C7D2FE] transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold text-[#0F172A] truncate">{r.school}</div>
                  <div className="text-[11.5px] text-[#475569]">{r.major} · {r.score}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[18px] font-bold leading-none transition-all" style={{ color: c.text }}>{r.chance}%</div>
                  <div className="text-[10.5px] font-semibold mt-0.5" style={{ color: c.text }}>{chanceLevel(r.chance)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${r.chance}%`, backgroundColor: c.bar }}
                  />
                </div>
                <span className="flex items-center gap-1 text-[10.5px] font-medium text-[#94A3B8]">
                  <TrendingUp className="w-3 h-3" />
                  Cơ hội
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}