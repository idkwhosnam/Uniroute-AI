import React from 'react';
import { FileText } from 'lucide-react';

// Khối "Thông tin tuyển sinh" của một phương thức xét tuyển
export default function MethodInfoBox({ info }) {
  const rows = [
    ['Ngành', info.major_name],
    ['Tổ hợp', info.combination],
    ['Cách xét', info.how],
    ['Điều kiện', info.conditions],
    ['Chỉ tiêu & học phí', `${info.quota ?? '—'} chỉ tiêu · ${info.tuition ?? '—'} triệu/năm`],
    ['Thời hạn, hồ sơ', info.deadline],
  ];

  return (
    <div className="mt-3.5 p-4 rounded-xl border border-[#E2E8F0] bg-[#F9FAFB]">
      <div className="flex items-start gap-2 mb-2.5">
        <FileText className="w-4 h-4 text-[#475569] shrink-0 mt-0.5" />
        <div className="text-[12px] font-bold text-[#1E293B]">
          Thông tin tuyển sinh {info.year} — {info.university_name}
          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#E5E7EB] text-[9.5px] font-bold text-[#6B7280] uppercase tracking-wide">Dữ liệu mẫu</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="text-[11.5px] leading-relaxed text-[#334155]">
            <span className="font-semibold text-[#1E293B]">{label}: </span>
            {value}
          </div>
        ))}
      </div>
      {info.source_name && (
        <div className="mt-2 text-[10.5px] text-[#94A3B8]">Nguồn: {info.source_name}</div>
      )}
    </div>
  );
}