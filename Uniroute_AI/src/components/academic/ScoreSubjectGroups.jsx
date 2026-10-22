import React from 'react';
import { scoreSubjectGroups } from '@/lib/scoreSubjects';

export default function ScoreSubjectGroups({ subjectList, profile, scale, scores, onChange }) {
  const groups = scoreSubjectGroups(subjectList, profile);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.key} className={`p-3.5 rounded-xl border ${group.required ? 'bg-[#F7F8FC] border-[#D6E0FF]' : 'bg-white border-[#E4E7EC]'}`}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[11.5px] font-bold uppercase tracking-wide text-[#344054]">{group.title}</div>
            {group.required && (
              <span className="text-[10.5px] font-bold text-[#B45309]">Bắt buộc nhập</span>
            )}
          </div>
          <div className="space-y-2.5">
            {group.items.map((item) => {
              const isMissing = group.required && (scores?.[item.key] == null || scores[item.key] === '');
              return (
                <div key={item.key} className="flex items-center justify-between gap-4">
                  <span className="text-[13px] font-medium text-[#344054]">
                    {item.label}
                    {group.required && <span className="text-[#DC2626]"> *</span>}
                    {item.tag && <span className="ml-1.5 text-[10px] text-[#98A2B3]">({item.tag})</span>}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={scale}
                    step="0.1"
                    placeholder={group.required ? 'Cần nhập' : '—'}
                    className={`w-24 h-9 px-3 rounded-lg bg-white border text-[13px] tabular-nums focus:outline-none focus:border-[#253B80] ${isMissing ? 'border-[#F59E0B]' : 'border-[#E4E7EC]'}`}
                    value={scores?.[item.key] ?? ''}
                    onChange={(e) => onChange(item.key, e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-[11px] text-[#667085] leading-relaxed">
        Môn có dấu <span className="text-[#DC2626] font-bold">*</span> là môn bắt buộc theo môn học lựa chọn THPT bạn đã khai báo ở Hồ sơ.
      </p>
    </div>
  );
}