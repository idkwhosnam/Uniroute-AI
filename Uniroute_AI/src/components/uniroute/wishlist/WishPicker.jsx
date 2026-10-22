import React, { useState } from "react";
import { Search, Plus, Check } from "lucide-react";
import { PROGRAMS } from "@/components/uniroute/lookupData";

export default function WishPicker({ addedIds, onAdd }) {
  const [query, setQuery] = useState("");
  const results = query.trim().length >= 2
    ? PROGRAMS.filter((p) =>
        `${p.school} ${p.major} ${p.method}`.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.06)]">
      <h2 className="text-[16px] font-medium text-[#0F172A]">Thêm nguyện vọng mới</h2>
      <p className="text-[12px] text-[#94A3B8] mt-0.5">Tìm theo tên trường, ngành hoặc phương thức xét tuyển</p>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] z-10" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ví dụ: Bách Khoa, CNTT, Học bạ..."
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:bg-white focus:ring-2 focus:ring-[#6366F1]/10 transition-all"
        />
      </div>

      <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto">
        {query.trim().length >= 2 && results.length === 0 && (
          <div className="py-6 text-center text-[12.5px] text-[#94A3B8]">Không tìm thấy trường hoặc ngành phù hợp.</div>
        )}
        {query.trim().length < 2 && (
          <div className="py-6 text-center text-[12.5px] text-[#94A3B8]">Nhập ít nhất 2 ký tự để tìm kiếm.</div>
        )}
        {results.map((p) => {
          const added = addedIds.includes(p.id);
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-[#E2E8F0] hover:border-[#C7D2FE] hover:bg-[#F8FAFC] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-[#0F172A] truncate">{p.school}</div>
                <div className="text-[11.5px] text-[#475569] truncate">
                  {p.major} · <span className="text-[#6366F1] font-medium">{p.method}</span>
                </div>
              </div>
              <button
                onClick={() => onAdd(p)}
                disabled={added}
                className={`flex items-center gap-1 h-8 px-2.5 rounded-lg text-[11.5px] font-semibold shrink-0 transition-colors ${
                  added
                    ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] cursor-default"
                    : "bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] hover:bg-[#DBEAFE]"
                }`}
              >
                {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {added ? "Đã có" : "Thêm"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}