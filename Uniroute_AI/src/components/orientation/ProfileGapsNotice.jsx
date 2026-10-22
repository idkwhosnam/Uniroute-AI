import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/journey/bits';

// NV03 – B2: hồ sơ chưa đủ dữ liệu để cá nhân hóa tư vấn → yêu cầu học sinh bổ sung.
export default function ProfileGapsNotice({ gaps }) {
  const navigate = useNavigate();
  if (!gaps?.length) return null;

  return (
    <Card className="p-4 mb-5 bg-[#FFFBEB] border-[#FDE68A]">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-[#92400E]">Hồ sơ còn thiếu thông tin để cá nhân hóa gợi ý</div>
          <p className="text-[12px] text-[#92400E] mt-0.5">Bổ sung các mục sau để mức độ phù hợp sát với bạn hơn:</p>
          <div className="flex flex-wrap gap-2 mt-2.5">
            {gaps.map((g) => (
              <button
                key={g.label}
                onClick={() => navigate(g.path)}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#FDE68A] text-[11.5px] text-[#92400E] hover:bg-[#FEF3C7] transition-colors"
              >
                <span className="font-bold">{g.label}</span> — {g.desc}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}