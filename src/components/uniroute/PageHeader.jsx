import React from "react";
import { ChevronRight } from "lucide-react";

export default function PageHeader({ crumb, title, subtitle, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 text-[12px] font-medium">
        <span className="text-[#94A3B8]">Tổng quan</span>
        <ChevronRight className="w-3 h-3 text-[#CBD5E1]" />
        <span className="text-[#475569]">{crumb}</span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-display text-[24px] font-semibold text-[#0F172A]">{title}</h1>
          {subtitle && <p className="text-[13px] text-[#475569] mt-1 max-w-2xl">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}