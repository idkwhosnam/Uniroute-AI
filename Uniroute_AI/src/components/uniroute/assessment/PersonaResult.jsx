import React from "react";
import { Link } from "react-router-dom";
import { Cpu, Briefcase, FlaskConical, BookOpen, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { PERSONAS } from "@/components/uniroute/assessment/quizData";

const ICONS = { innovator: Cpu, strategist: Briefcase, analyst: FlaskConical, humanist: BookOpen };

export default function PersonaResult({ result, onRetake }) {
  const p = PERSONAS[result.persona];
  const Icon = ICONS[result.persona];
  const total = Object.values(result.counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Persona card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E3A8A] via-[#2545B5] to-[#3B82F6] p-6 text-white shadow-sm">
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0"
            style={{ border: `1px solid ${p.color}` }}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FCD34D]" />
              Kết quả Persona của bạn
            </div>
            <h2 className="font-display text-[24px] font-semibold leading-tight">{p.name}</h2>
            <p className="text-[13.5px] text-white/85 mt-1.5 max-w-2xl">{p.desc}</p>
          </div>
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white/15 border border-white/20 text-[12px] font-semibold text-white hover:bg-white/25 transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths + distribution */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.06)]">
          <h3 className="text-[15px] font-semibold text-[#0F172A] mb-3">Điểm mạnh nổi bật</h3>
          <div className="flex flex-wrap gap-2">
            {p.strengths.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] text-[12px] font-semibold"
              >
                {s}
              </span>
            ))}
          </div>

          <h3 className="text-[15px] font-semibold text-[#0F172A] mt-5 mb-3">Phân bố xu hướng</h3>
          <div className="space-y-2.5">
            {Object.entries(PERSONAS).map(([key, meta]) => {
              const pct = Math.round((result.counts[key] / total) * 100);
              const isTop = key === result.persona;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className={`w-[140px] text-[12px] font-medium truncate ${isTop ? "text-[#0F172A] font-semibold" : "text-[#475569]"}`}>
                    {meta.name}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: meta.color }}
                    />
                  </div>
                  <span className="w-9 text-right text-[11.5px] font-semibold text-[#475569]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggested majors */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.06)]">
          <h3 className="text-[15px] font-semibold text-[#0F172A] mb-3">Nhóm ngành & trường phù hợp</h3>
          <div className="space-y-2.5">
            {p.majors.map((m, i) => (
              <div key={i} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[13px] font-semibold text-[#0F172A]">{m.major}</div>
                <div className="text-[12px] text-[#475569] mt-0.5">{m.schools}</div>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#4338CA] text-[10.5px] font-semibold border border-[#C7D2FE]">
                  {m.method}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2.5">
            <Link
              to="/recommendations"
              className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg bg-[#1E3A8A] text-white text-[12.5px] font-semibold hover:bg-[#1E293B] transition-colors"
            >
              Xem đề xuất ngành & trường
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/lookup"
              className="flex items-center justify-center h-10 px-4 rounded-lg bg-[#EFF6FF] text-[#1E3A8A] text-[12.5px] font-semibold border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-colors"
            >
              Tra cứu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}