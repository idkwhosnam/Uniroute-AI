import React from 'react';
import { Sparkles } from 'lucide-react';

// Hiệu ứng "AI đang phân tích" — hiển thị 1.2–1.5s trước khi fade-in kết quả.
export default function AiThinking({ label = 'AI UniRoute đang phân tích phổ điểm & quy chế xét tuyển 2026...' }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#6366F1]/50 bg-[#EEF2FF]/50 p-5">
      <div className="flex items-center gap-2.5">
        <Sparkles className="w-4.5 w-5 h-5 text-[#6366F1] animate-pulse shrink-0" />
        <span className="text-[13px] font-semibold text-[#4338CA]">{label}</span>
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="h-2.5 rounded-full bg-[#C7D2FE]/70 animate-pulse" style={{ width: '88%' }} />
        <div className="h-2.5 rounded-full bg-[#C7D2FE]/50 animate-pulse" style={{ width: '64%', animationDelay: '150ms' }} />
        <div className="h-2.5 rounded-full bg-[#C7D2FE]/30 animate-pulse" style={{ width: '40%', animationDelay: '300ms' }} />
      </div>
    </div>
  );
}