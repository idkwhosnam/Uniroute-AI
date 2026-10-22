import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, Chip } from '@/components/journey/bits';

export default function MissingSubjectsNotice({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <Card className="p-4 mb-6 !bg-[#FFFBEB] !border-[#FDE68A]">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
        <div>
          <div className="text-[13px] font-bold text-[#B45309]">
            {items.length} thẻ điểm cần cập nhật điểm các môn bắt buộc
          </div>
          <p className="text-[12px] text-[#92400E] mt-1 leading-relaxed">
            Môn bắt buộc và môn đã khai báo ở khối Môn học lựa chọn THPT cần có điểm.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {items.map((it) => (
              <Chip key={it.id} tone="amber">{it.label}: thiếu {it.labels.join(', ')}</Chip>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}