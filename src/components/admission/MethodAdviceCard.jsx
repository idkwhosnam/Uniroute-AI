import React from 'react';
import { Check, MapPin, Pin, Target as TargetIcon } from 'lucide-react';
import { Card, Chip, GhostButton } from '@/components/journey/bits';
import { ADVICE_GROUPS } from '@/lib/methodAdvice';
import MethodInfoBox from '@/components/admission/MethodInfoBox';
import BenchmarkHistoryTable from '@/components/admission/BenchmarkHistoryTable';

// Một phương thức xét tuyển được đề xuất: lý do phân loại, việc cần bổ sung, thông tin tuyển sinh, điểm chuẩn các năm
export default function MethodAdviceCard({ insight, interested, busy, onToggleInterest, onSetTarget }) {
  const { program, info, level, levelLabel, score, comboText, reasons, actions, history } = insight;
  const badge = ADVICE_GROUPS[level].badge;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#475569]">
          <MapPin className="w-3.5 h-3.5" />
          {program.university_name} — {program.major_name}
        </span>
        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${badge}`}>{levelLabel}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <h3 className="text-[16px] font-bold text-[#111827]">{info.method_label}</h3>
        <Chip tone="blue">Mức độ phù hợp {score}%</Chip>
      </div>
      <div className="text-[12px] text-[#3B82F6] font-medium mt-1">Tổ hợp áp dụng: {comboText}</div>

      <div className="mt-3">
        <div className="text-[11.5px] font-bold text-[#475569] mb-1.5">Lý do phân loại:</div>
        <ul className="space-y-1.5">
          {reasons.map((text, i) => (
            <li key={i} className="flex items-start gap-2 text-[11.5px] text-[#334155] leading-relaxed">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-[#475569] shrink-0" />{text}
            </li>
          ))}
        </ul>
      </div>

      {actions.length > 0 && (
        <div className="mt-3 p-3.5 rounded-lg bg-[#FFFBEB] border border-[#FCD34D]">
          <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#92400E] mb-1.5">
            <Pin className="w-3.5 h-3.5" /> Học sinh cần bổ sung / chuẩn bị
          </div>
          <ul className="space-y-1.5">
            {actions.map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-[11.5px] text-[#92400E] leading-relaxed">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-[#B45309] shrink-0" />{text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <MethodInfoBox info={info} />
      <BenchmarkHistoryTable history={history} methodLabel={info.method_label} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => onToggleInterest(insight)}
          disabled={busy}
          className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[11.5px] font-bold border transition-colors ${interested ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#1D4ED8]' : 'border-[#E5E7EB] bg-white text-[#475569] hover:border-[#3B82F6]'}`}
        >
          {interested ? <><Check className="w-3.5 h-3.5" /> Đã quan tâm</> : 'Quan tâm phương thức này'}
        </button>
        <GhostButton className="!h-9 !text-[11.5px]" onClick={() => onSetTarget(insight)}>
          <TargetIcon className="w-3.5 h-3.5" /> Đặt làm mục tiêu
        </GhostButton>
      </div>
    </Card>
  );
}