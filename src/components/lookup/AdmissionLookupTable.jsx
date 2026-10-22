import React from 'react';
import { Check } from 'lucide-react';
import { Card } from '@/components/journey/bits';
import { pairKey } from '@/lib/targetBuilder';

function ActionButton({ children, onClick, tone = 'primary', icon: Icon }) {
  const styles = tone === 'primary'
    ? 'bg-[#253B80] text-white hover:bg-[#172554]'
    : tone === 'saved'
      ? 'bg-[#F0FDF9] text-[#0D9488] border border-[#CCFBF1] hover:bg-[#E6FBF6]'
      : 'bg-white text-[#344054] border border-[#E4E7EC] hover:bg-[#F7F8FC]';
  return (
    <button onClick={onClick} className={`inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-lg text-[11px] font-semibold transition-colors ${styles}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </button>
  );
}

export default function AdmissionLookupTable({ rows, uniMap, chosenKeys, busyKey, onToggleInterest, onOpenScheme }) {
  if (!rows.length) {
    return (
      <Card className="p-10 text-center">
        <div className="text-[14px] font-semibold text-[#111827]">Không tìm thấy ngành nào phù hợp</div>
        <p className="text-[12.5px] text-[#667085] mt-1">Thử đổi từ khóa hoặc bộ lọc trường/ngành.</p>
      </Card>
    );
  }

  return (
    <div className="rounded-xl border border-[#E4E7EC] bg-white overflow-hidden">
      <table className="w-full text-[12px] table-fixed">
        <thead>
          <tr className="bg-[#D1EAFE] text-[#1F2A37] text-left">
            <th className="px-3 py-2.5 font-semibold w-[46px]">STT</th>
            <th className="px-3 py-2.5 font-semibold w-[132px]">Mã trường</th>
            <th className="px-3 py-2.5 font-semibold w-[104px]">Mã ngành</th>
            <th className="px-3 py-2.5 font-semibold">Tên ngành</th>
            <th className="px-3 py-2.5 font-semibold w-[186px]">Tổ hợp môn</th>
            <th className="px-3 py-2.5 font-semibold w-[104px]">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const uni = uniMap[row.university_code];
            const saved = chosenKeys.has(pairKey(row));
            return (
              <tr key={row.key} className="border-t border-[#E4E7EC] align-top hover:bg-[#FAFBFC]">
                <td className="px-3 py-3 text-[#667085]">{i + 1}</td>
                <td className="px-3 py-3">
                  <div className="font-mono font-semibold text-[#111827] uppercase break-words">{row.university_code}</div>
                  <div className="text-[10.5px] text-[#98A2B3] leading-tight mt-0.5">{uni?.short_name || row.university_name}</div>
                </td>
                <td className="px-3 py-3 font-mono text-[#111827] break-words">{row.major_code}</td>
                <td className="px-3 py-3 text-[#111827] leading-relaxed">{row.major_name}</td>
                <td className="px-3 py-3">
                  {row.combinations.length ? (
                    <div className="flex flex-wrap gap-1">
                      {row.combinations.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-[#EFF4FF] text-[10.5px] font-semibold text-[#253B80] whitespace-nowrap">{c}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#667085]">Theo bài thi / điều kiện riêng của trường</span>
                  )}
                  <div className="text-[10.5px] text-[#98A2B3] mt-1">{row.methods.length} phương thức · năm {row.years.join(', ')}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1.5">
                    <ActionButton
                      tone={saved ? 'saved' : 'primary'}
                      icon={saved ? Check : undefined}
                      onClick={() => onToggleInterest(row)}
                    >
                      {busyKey === row.key ? 'Đang lưu...' : saved ? 'Đã quan tâm' : 'Quan tâm'}
                    </ActionButton>
                    <ActionButton tone="ghost" onClick={() => onOpenScheme(row.university_code)}>Đề án</ActionButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}