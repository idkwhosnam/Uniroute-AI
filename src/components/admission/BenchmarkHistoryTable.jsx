import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Bảng điểm chuẩn các năm gần nhất của đúng ngành – trường – phương thức xét tuyển
export default function BenchmarkHistoryTable({ history, methodLabel }) {
  const [open, setOpen] = useState(false);
  if (!history?.length) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#1D4ED8] hover:underline"
      >
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {open ? 'Thu gọn điểm chuẩn các năm' : 'Xem điểm chuẩn các năm gần nhất của đúng ngành - trường - PTXT'}
      </button>

      {open && (
        <div className="mt-2.5">
          <div className="text-[11px] text-[#64748B] mb-1.5">{methodLabel}</div>
          <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="bg-[#F1F5F9] text-left text-[#334155]">
                  <th className="px-3 py-2 font-semibold w-[70px]">Năm</th>
                  <th className="px-3 py-2 font-semibold w-[132px]">Điểm chuẩn / trạng thái</th>
                  <th className="px-3 py-2 font-semibold w-[92px]">Thang điểm</th>
                  <th className="px-3 py-2 font-semibold">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.year} className="border-t border-[#E2E8F0] text-[#334155]">
                    <td className="px-3 py-2 font-semibold text-[#111827]">{h.year}</td>
                    <td className="px-3 py-2">{h.score != null ? h.score : 'Chưa công bố'}</td>
                    <td className="px-3 py-2">{h.scale ? `Điểm / ${h.scale}` : '—'}</td>
                    <td className="px-3 py-2 text-[#64748B]">{h.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-1.5 text-[10.5px] text-[#94A3B8] leading-relaxed">
            Dữ liệu điểm chuẩn trong bảng là dữ liệu mô phỏng, không phải điểm trúng tuyển thật. Một số phương thức có thể không có điểm chuẩn riêng hoặc dùng thang điểm khác — cần kiểm tra đề án chính thức của trường.
          </p>
        </div>
      )}
    </div>
  );
}