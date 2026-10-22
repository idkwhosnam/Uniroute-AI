import React from 'react';
import { Check } from 'lucide-react';
import { useStore } from '@/state/store';
import { journey } from '@/data/engine';

const STEPS = [
  { n: '01', label: 'Hiểu bản thân' },
  { n: '02', label: 'Xác định hướng đi' },
  { n: '03', label: 'Chuẩn bị mục tiêu' },
];

export default function JourneyBar() {
  const { s } = useStore();
  if (!s) return null;
  const j = journey(s);
  const dones = [j.done1, j.done2, j.done3];
  const currentIdx = dones.findIndex((d) => !d);
  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      {STEPS.map((st, i) => {
        const done = dones[i];
        const current = i === currentIdx;
        return (
          <div key={st.n} className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${done ? 'bg-[#14B8A6] text-white' : current ? 'bg-[#253B80] text-white' : 'bg-[#F2F4F7] text-[#667085]'}`}>
              {done ? <Check className="w-3.5 h-3.5" /> : st.n}
            </span>
            <span className={`text-[12.5px] ${done || current ? 'font-semibold text-[#111827]' : 'text-[#667085]'}`}>{st.label}</span>
          </div>
        );
      })}
      <div className="ml-auto flex items-center gap-3">
        <div className="w-28 h-1.5 rounded-full bg-[#F2F4F7] overflow-hidden">
          <div className="h-full bg-[#253B80] rounded-full transition-all duration-500" style={{ width: `${j.percent}%` }} />
        </div>
        <span className="text-[11px] font-semibold text-[#667085] w-9 text-right">{j.percent}%</span>
      </div>
    </div>
  );
}