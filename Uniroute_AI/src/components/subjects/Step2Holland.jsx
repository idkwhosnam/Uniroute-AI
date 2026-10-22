import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ClipboardList, Info, RotateCcw } from 'lucide-react';
import { Card, Chip, PrimaryButton, GhostButton } from '@/components/journey/bits';
import { RIASEC_META } from '@/lib/hollandEngine';

// Nghiệp vụ 02 B4 — dùng kết quả Holland nếu đã có, cho phép bỏ qua nếu chưa làm.
export default function Step2Holland({ result, onSkip, onBack }) {
  const navigate = useNavigate();

  if (result) {
    const top3 = result.top_groups?.length ? result.top_groups : [];
    return (
      <div className="max-w-3xl space-y-5">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-[15px] font-bold text-[#1E293B]">3. Kết quả trắc nghiệm Holland của bạn</h2>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <div className="text-center">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-[#6B7280]">Mã Holland</div>
              <div className="text-[34px] font-bold text-[#1E293B] leading-tight">{result.holland_code}</div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="text-[11.5px] font-semibold text-[#6B7280] mb-1.5">Nhóm nổi bật</div>
              <div className="flex flex-wrap gap-1.5">
                {top3.map((c, i) => <Chip key={c} tone={i === 0 ? 'teal' : 'blue'}>{c} – {RIASEC_META[c]?.vi}</Chip>)}
              </div>
              <p className="mt-2 text-[11.5px] text-[#6B7280] leading-relaxed">
                Hệ thống dùng kết quả này cùng điểm học tập để đánh giá mức độ phù hợp của từng phương án môn học.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <GhostButton onClick={onBack}><ArrowLeft className="w-4 h-4" /> Quay lại điểm đầu vào</GhostButton>
          <GhostButton onClick={() => navigate('/assessment')}><RotateCcw className="w-4 h-4" /> Làm lại trắc nghiệm</GhostButton>
          <div className="flex-1" />
          <PrimaryButton onClick={onSkip}>Tiếp tục nhập phương án <ArrowRight className="w-4 h-4" /></PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-[15px] font-bold text-[#1E293B]">3. Bạn chưa có kết quả trắc nghiệm Holland</h2>
        </div>
        <p className="text-[12.5px] text-[#6B7280] leading-relaxed">
          Kết quả Holland giúp hệ thống đánh giá phương án môn học sát với sở thích nghề nghiệp của bạn hơn.
        </p>
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0]">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <span className="text-[11.5px] text-[#1E293B]">Bài trắc nghiệm gồm 30 câu, khoảng 5–7 phút. Kết quả được lưu vào hồ sơ của bạn.</span>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <GhostButton onClick={onBack}><ArrowLeft className="w-4 h-4" /> Quay lại điểm đầu vào</GhostButton>
        <GhostButton onClick={onSkip}>Bỏ qua, nhập phương án trường</GhostButton>
        <PrimaryButton onClick={() => navigate('/assessment')}>Làm trắc nghiệm Holland <ArrowRight className="w-4 h-4" /></PrimaryButton>
      </div>
    </div>
  );
}