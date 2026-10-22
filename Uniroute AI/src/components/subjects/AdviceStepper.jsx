import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

export const ADVICE_STEPS = [
  '9 điểm đầu vào',
  'Holland & định hướng',
  'Nhập phương án trường',
  'Top 3 đề xuất',
];

export default function AdviceStepper({ current }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {ADVICE_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg border text-[12px] font-semibold ${active ? 'bg-[#2563EB] text-white border-[#2563EB]' : done ? 'bg-white text-[#0F766E] border-[#0F766E]/40' : 'bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-bold ${active ? 'bg-white/25 text-white' : done ? 'bg-[#CCFBF1] text-[#0F766E]' : 'bg-white text-[#94A3B8]'}`}>
                {done ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              <span className="whitespace-nowrap">{label}</span>
            </div>
            {i < ADVICE_STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-[#CBD5E1] shrink-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}