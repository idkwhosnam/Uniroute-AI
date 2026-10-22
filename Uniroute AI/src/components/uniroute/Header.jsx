import React, { useState } from "react";
import { Search, Bell, ChevronDown, ShieldCheck, Plus, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { UNIVERSITIES } from "@/components/uniroute/data";

const ALERT_STYLES = {
  urgent: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
};

export default function Header({ grade, onGradeChange, alerts, notifRead, onMarkRead, onAddWish }) {
  const [query, setQuery] = useState("");
  const results =
    query.trim().length >= 2
      ? UNIVERSITIES.filter((u) =>
          `${u.name} ${u.major} ${u.method}`.toLowerCase().includes(query.trim().toLowerCase())
        )
      : [];

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 h-[64px] px-6 bg-white border-b border-[#E2E8F0]">
      {/* Breadcrumb */}
      <div className="hidden md:flex items-center gap-2 text-[13px] shrink-0">
        <span className="text-[#94A3B8] font-medium">Tổng quan</span>
        <span className="text-[#CBD5E1]">/</span>
        <span className="text-[#0F172A] font-semibold">Lộ trình Xét tuyển Lớp {grade}</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] z-10" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm ngành, trường ĐH tại Hà Nội (Ví dụ: Bách Khoa, CNTT, IELTS)..."
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:bg-white focus:ring-2 focus:ring-[#6366F1]/10 transition-all"
        />
        {results.length > 0 && (
          <div className="absolute top-12 left-0 right-0 z-40 bg-white rounded-xl border border-[#E2E8F0] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden">
            {results.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-[#0F172A] truncate">{u.name}</div>
                  <div className="text-[11.5px] text-[#475569] truncate">
                    {u.major} · <span className="text-[#6366F1] font-medium">{u.method}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-[11px] font-semibold text-[#1E3A8A] border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE] shrink-0"
                  onClick={() => {
                    onAddWish(u);
                    setQuery("");
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm NV
                </Button>
              </div>
            ))}
          </div>
        )}
        {query.trim().length >= 2 && results.length === 0 && (
          <div className="absolute top-12 left-0 right-0 z-40 bg-white rounded-xl border border-[#E2E8F0] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] px-4 py-3 text-[12.5px] text-[#94A3B8]">
            Không tìm thấy trường hoặc ngành phù hợp.
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[12.5px] font-medium text-[#475569] hover:bg-[#EFF6FF] transition-colors">
              Đổi Khối Lớp: Lớp {grade}
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {[10, 11, 12].map((g) => (
              <DropdownMenuItem
                key={g}
                onClick={() => onGradeChange(g)}
                className={`text-[13px] ${g === grade ? "font-semibold text-[#1E3A8A]" : ""}`}
              >
                Lớp {g}
                {g === grade && <CheckCheck className="w-4 h-4 ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] hover:bg-[#EFF6FF] transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              {!notifRead && alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold ring-2 ring-white">
                  {alerts.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#0F172A]">Thông báo ({alerts.length})</span>
              <button
                onClick={onMarkRead}
                className="flex items-center gap-1 text-[11.5px] font-semibold text-[#1E3A8A] hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Đánh dấu đã đọc
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alerts.length === 0 && (
                <div className="px-4 py-6 text-center text-[12.5px] text-[#94A3B8]">Không có thông báo mới</div>
              )}
              {alerts.map((a) => (
                <div key={a.id} className="px-4 py-2.5 border-b border-[#F1F5F9] last:border-0">
                  <div className="flex items-start gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: ALERT_STYLES[a.type] }}
                    />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium text-[#0F172A] leading-snug">{a.title}</div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5">{a.countdown} · {a.deadline}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[12px] font-semibold text-[#047857]">
          <ShieldCheck className="w-4 h-4" />
          Đã kết nối với Phụ huynh
        </div>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] flex items-center justify-center text-white font-semibold text-sm">
          NA
        </div>
      </div>
    </header>
  );
}