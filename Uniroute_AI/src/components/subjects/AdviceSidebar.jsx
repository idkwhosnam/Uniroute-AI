import React from 'react';
import { Check, Info } from 'lucide-react';
import { Card } from '@/components/journey/bits';

const DATA_ITEMS = [
  { key: 'entry', title: 'Điểm thi tuyển sinh lớp 10', desc: 'Toán · Ngữ văn · Tiếng Anh' },
  { key: 'grade9', title: 'Điểm trung bình cả năm lớp 9', desc: 'Toán, Ngữ văn, Tiếng Anh, KHTN, KHXH, GDCD' },
  { key: 'holland', title: 'Trắc nghiệm Holland', desc: 'Nhóm sở thích nghề nghiệp' },
  { key: 'interests', title: 'Sở thích, định hướng', desc: 'Không bắt buộc; có thể để trống' },
  { key: 'options', title: 'Phiếu lựa chọn môn của trường', desc: 'Từng phương án: 4 môn lựa chọn + 3 môn chuyên đề' },
];

export default function AdviceSidebar({ doneKeys = [] }) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="text-[13.5px] font-bold text-[#1E293B] mb-3">Dữ liệu dùng để tư vấn</h3>
        <div className="space-y-3">
          {DATA_ITEMS.map((item, i) => {
            const done = doneKeys.includes(item.key);
            return (
              <div key={item.key} className="flex items-start gap-2.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 mt-0.5 ${done ? 'bg-[#CCFBF1] text-[#0F766E]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                  {done ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold text-[#1E293B]">{item.title}</div>
                  <div className="text-[11.5px] text-[#6B7280]">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
        <Info className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-[#92400E] leading-relaxed">
          Các phương án do học sinh nhập là dữ liệu tự khai báo từ phiếu trường. Kết quả tư vấn chỉ mang tính tham khảo,
          không thay thế quyết định của trường.
        </p>
      </div>
    </div>
  );
}