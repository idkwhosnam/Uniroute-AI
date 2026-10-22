import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

const STEPS = [
  { n: 1, label: 'Quan tâm ngành' },
  { n: 2, label: 'So sánh & chọn 2–3 trường' },
  { n: 3, label: 'Phân loại & xem PTXT' },
  { n: 4, label: 'Đánh dấu quan tâm' },
];

// Tiến trình 4 bước của luồng tư vấn phương thức xét tuyển
export default function AdviceStepper({ current = 3 }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {STEPS.map((s, i) => {
        const done = s.n < current;
        const isCurrent = s.n === current;
        const style = done
          ? 'bg-[#DCFCE7] text-[#065F46]'
          : isCurrent
            ? 'bg-[#E0E7FF] text-[#1E3A8A] font-bold'
            : 'bg-[#F3F4F6] text-[#6B7280]';
        return (
          <React.Fragment key={s.n}>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold ${style}`}>
              {done ? <Check className="w-3 h-3" /> : <span>{s.n}</span>}
              {s.label}
            </span>
            {i < STEPS.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-[#CBD5E1]" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}