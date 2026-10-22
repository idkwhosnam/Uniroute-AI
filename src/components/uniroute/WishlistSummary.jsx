import React, { useState } from "react";
import { ListOrdered, Shield, ChevronUp, ChevronDown, Trash2, Check } from "lucide-react";

export default function WishlistSummary({ wishes, onReorder, onRemove }) {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
          <ListOrdered className="w-[18px] h-[18px] text-[#1E3A8A]" />
        </div>
        <div>
          <h2 className="text-[16px] font-medium text-[#0F172A]">Danh sách Nguyện vọng</h2>
          <p className="text-[12px] text-[#94A3B8]">{wishes.length} nguyện vọng · Kéo lên/xuống để sắp xếp</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {wishes.map((w, i) => (
          <div
            key={w.id}
            className={`relative p-3 rounded-lg border ${
              w.primary ? "border-[#E2E8F0] bg-[#F8FAFC]" : "border-dashed border-[#FDE68A] bg-[#FFFBEB]"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                w.primary ? "bg-[#1E3A8A] text-white" : "bg-[#F59E0B] text-white"
              }`}>
                {w.tag}
              </span>
              <span className="text-[10.5px] font-semibold text-[#94A3B8]">{w.rank}</span>
              {!w.primary && (
                <span className="ml-auto flex items-center gap-1 text-[10.5px] font-medium text-[#B45309]">
                  <Shield className="w-3 h-3" /> Dự phòng
                </span>
              )}
              {editMode && (
                <div className={`flex items-center gap-1 ${w.primary ? "ml-auto" : ""}`}>
                  <button
                    onClick={() => onReorder(i, -1)}
                    disabled={i === 0}
                    className="w-6 h-6 rounded-md bg-white border border-[#E2E8F0] flex items-center justify-center text-[#475569] hover:bg-[#EFF6FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Chuyển lên"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onReorder(i, 1)}
                    disabled={i === wishes.length - 1}
                    className="w-6 h-6 rounded-md bg-white border border-[#E2E8F0] flex items-center justify-center text-[#475569] hover:bg-[#EFF6FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Chuyển xuống"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemove(w.id)}
                    className="w-6 h-6 rounded-md bg-white border border-[#FECACA] flex items-center justify-center text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                    title="Xóa nguyện vọng"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="text-[13px] font-semibold text-[#0F172A]">{w.school}</div>
            <div className="text-[11.5px] text-[#475569]">{w.major}</div>
            <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full bg-white border border-[#E2E8F0] text-[10.5px] font-medium text-[#6366F1]">
              {w.method}
            </div>
          </div>
        ))}
        {wishes.length === 0 && (
          <div className="py-6 text-center text-[12.5px] text-[#94A3B8]">
            Chưa có nguyện vọng. Tìm kiếm trường ở thanh trên để thêm NV mới.
          </div>
        )}
      </div>

      <button
        onClick={() => setEditMode((e) => !e)}
        className={`mt-4 w-full flex items-center justify-center gap-2 h-10 rounded-lg text-[13px] font-semibold transition-colors ${
          editMode
            ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] hover:bg-[#D1FAE5]"
            : "bg-[#1E3A8A] text-white hover:bg-[#1E293B]"
        }`}
      >
        {editMode ? (
          <>
            <Check className="w-4 h-4" />
            Hoàn tất sắp xếp
          </>
        ) : (
          <>
            <ListOrdered className="w-4 h-4" />
            Sắp xếp & Cấu trúc lại Nguyện vọng
          </>
        )}
      </button>
    </div>
  );
}