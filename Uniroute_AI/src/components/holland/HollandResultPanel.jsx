import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Contact, Info, SlidersHorizontal } from 'lucide-react';
import { RIASEC_KEYS, RIASEC_META, hollandCode, topGroups } from '@/lib/hollandEngine';
import { Card, Chip, PrimaryButton, GhostButton, Meter } from '@/components/journey/bits';

// Kết quả Holland hiển thị & lưu ngay trong trang Trắc nghiệm Holland.
export default function HollandResultPanel({ result }) {
  const navigate = useNavigate();

  const scores = result.scores || {};
  const code = result.holland_code || hollandCode(scores);
  const top3 = result.top_groups?.length ? result.top_groups : topGroups(scores);
  const sorted = RIASEC_KEYS.map((k) => ({ k, v: scores[k] || 0 })).sort((a, b) => b.v - a.v);

  return (
    <div>
      {/* Mã Holland + điểm */}
      <Card className="p-6 mb-5">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="text-center">
            <div className="text-[11px] font-semibold text-[#667085] uppercase tracking-wide">Mã Holland</div>
            <div className="text-[40px] font-bold text-[#253B80] leading-tight">{code}</div>
          </div>
          <div className="flex-1 space-y-2.5">
            {sorted.map(({ k, v }) => (
              <div key={k}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12.5px] font-medium text-[#344054]">{k} – {RIASEC_META[k].vi}</span>
                  <span className="text-[11px] text-[#667085] tabular-nums">{v}/60</span>
                </div>
                <Meter value={(v / 60) * 100} tone={RIASEC_META[k].color} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[#F7F9FF] border border-[#E4E7EC]">
          <div className="text-[11.5px] font-bold uppercase tracking-wide text-[#98A2B3] mb-1.5">3 nhóm nổi bật</div>
          <div className="flex flex-wrap gap-2">
            {top3.map((c, i) => (
              <Chip key={c} tone={i === 0 ? 'teal' : i === 1 ? 'blue' : 'gray'}>{c} – {RIASEC_META[c]?.vi}</Chip>
            ))}
          </div>
          <div className="mt-2 text-[12px] text-[#344054] leading-relaxed">
            {RIASEC_META[top3[0]]?.desc} {RIASEC_META[top3[1]]?.desc}
          </div>
        </div>
      </Card>

      {/* Giới hạn của kết quả */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] mb-6">
        <Info className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#92400E] leading-relaxed">
          <span className="font-semibold">Giới hạn của kết quả:</span> Holland phản ánh sở thích — không đo năng lực, tính cách hay kỹ năng.
          Điểm học tập thấp không loại trừ nhóm ngành; điểm cao cũng không đảm bảo phù hợp. Hãy kết hợp kết quả Holland với học lực,
          điều kiện thực tế và tìm hiểu thêm trước khi quyết định.
        </p>
      </div>

      {/* Bước tiếp theo */}
      <Card className="p-5 bg-[#F8FAFC]">
        <h2 className="text-[15px] font-bold text-[#111827] mb-1">Bước tiếp theo</h2>
        <p className="text-[12.5px] text-[#667085] leading-relaxed">
          Kết quả Holland được hệ thống dùng để tư vấn môn học THPT và đánh giá tác động khi điều chỉnh tổ hợp môn — không thay thế việc chọn ngành, trường.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PrimaryButton onClick={() => navigate('/subjects')}>
            <BookOpen className="w-4 h-4" /> Tư vấn môn học lớp 10 <ArrowRight className="w-4 h-4" />
          </PrimaryButton>
          <GhostButton onClick={() => navigate('/subject-adjustment')}>
            <SlidersHorizontal className="w-4 h-4" /> Đề xuất điều chỉnh tổ hợp môn
          </GhostButton>
          <GhostButton onClick={() => navigate('/profile')}>
            <Contact className="w-4 h-4" /> Về Hồ sơ của tôi
          </GhostButton>
        </div>
      </Card>
    </div>
  );
}