import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ClipboardList, BookOpen } from 'lucide-react';
import { useLatestHollandResult } from '@/lib/useStudentData';
import { RIASEC_KEYS, RIASEC_META, hollandCode } from '@/lib/hollandEngine';
import { Card, Chip, PrimaryButton, GhostButton, Meter } from '@/components/journey/bits';

export default function HollandSummaryCard() {
  const navigate = useNavigate();
  const { data: result, isLoading } = useLatestHollandResult();

  if (isLoading) return <Card className="p-6"><div className="text-[12px] text-[#98A2B3] py-4">Đang tải kết quả Holland...</div></Card>;

  if (!result) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#253B80]" />
          <h3 className="text-[14px] font-bold text-[#111827]">Kết quả định hướng Holland</h3>
        </div>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EFF4FF] mb-3">
            <ClipboardList className="w-6 h-6 text-[#253B80]" />
          </div>
          <h4 className="text-[14px] font-bold text-[#111827] mb-1.5">Chưa có kết quả Holland</h4>
          <p className="text-[12.5px] text-[#667085] max-w-sm mx-auto mb-5 leading-relaxed">
            Làm trắc nghiệm Holland (30 câu, khoảng 5–8 phút) để hệ thống tính 6 nhóm RIASEC và đề xuất nhóm ngành phù hợp.
          </p>
          <PrimaryButton className="!h-10 !text-[12.5px]" onClick={() => navigate('/assessment')}>
            <ClipboardList className="w-4 h-4" /> Làm trắc nghiệm Holland
          </PrimaryButton>
        </div>
        <p className="mt-4 text-[11px] text-[#98A2B3] leading-relaxed">
          Holland phản ánh sở thích — không đảm bảo năng lực hay thành công nghề nghiệp. Kết quả chỉ mang tính tham khảo.
        </p>
      </Card>
    );
  }

  const scores = result.scores || {};
  const code = result.holland_code || hollandCode(scores);
  const sorted = RIASEC_KEYS.map((k) => ({ k, v: scores[k] || 0 })).sort((a, b) => b.v - a.v);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#253B80]" />
        <h3 className="text-[14px] font-bold text-[#111827]">Kết quả định hướng Holland</h3>
      </div>
      <div className="p-4 rounded-xl bg-[#F7F9FF] border border-[#E4E7EC] mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#667085] uppercase tracking-wide">Mã Holland của bạn</div>
            <div className="text-[28px] font-bold text-[#253B80] leading-tight">{code}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-[#98A2B3]">Hoàn thành</div>
            <div className="text-[12px] font-semibold text-[#344054]">{result.completed_at ? new Date(result.completed_at).toLocaleDateString('vi-VN') : '—'}</div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {code.split('').map((c, i) => (
            <Chip key={i} tone={i === 0 ? 'teal' : i === 1 ? 'blue' : 'gray'}>
              {c} – {RIASEC_META[c]?.vi || c}
            </Chip>
          ))}
        </div>
      </div>

      <h4 className="text-[12.5px] font-bold text-[#111827] mb-2">Điểm 6 nhóm RIASEC</h4>
      <div className="space-y-2.5 mb-4">
        {sorted.map(({ k, v }) => (
          <div key={k}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[#344054]">{k} – {RIASEC_META[k].vi}</span>
              <span className="text-[11px] text-[#667085] tabular-nums">{v}/60</span>
            </div>
            <Meter value={(v / 60) * 100} tone={RIASEC_META[k].color} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <PrimaryButton className="!h-10 !text-[12.5px]" onClick={() => navigate('/assessment')}>
          <BookOpen className="w-4 h-4" /> Xem đề xuất nhóm ngành <ArrowRight className="w-3.5 h-3.5" />
        </PrimaryButton>
        <GhostButton onClick={() => navigate('/assessment')}>Làm lại trắc nghiệm</GhostButton>
      </div>
      <p className="mt-4 text-[11px] text-[#98A2B3] leading-relaxed">
        Holland phản ánh sở thích — không đảm bảo năng lực hay thành công nghề nghiệp. Kết quả chỉ mang tính tham khảo.
      </p>
    </Card>
  );
}