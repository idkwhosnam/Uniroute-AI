import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Contact, Sparkles } from 'lucide-react';
import { Card, Chip, PrimaryButton, GhostButton, Meter } from '@/components/journey/bits';
import ThinkingReveal from '@/components/journey/ThinkingReveal';
import { thptLabel } from '@/lib/thptSubjects';
import { OPTION_CRITERIA_LABELS } from '@/lib/subjectOptions';

// Nghiệp vụ 02 B4/B5 — xếp hạng tối đa 3 phương án phù hợp nhất. Kết quả chỉ để tham khảo, không lưu vào hồ sơ.
export default function Step4Top3({ ranked = [], onBack, hollandDone }) {
  const navigate = useNavigate();
  const top = ranked.slice(0, 3);

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h2 className="text-[15px] font-bold text-[#1E293B] mb-1">4. Đề xuất TOP {top.length} phương án môn học</h2>
        <p className="text-[12.5px] text-[#6B7280]">
          Xếp hạng dựa trên điểm đầu vào, điểm lớp 9{hollandDone ? ', kết quả Holland' : ''} và sự cân bằng nhóm môn.
        </p>
      </Card>

      <ThinkingReveal label="AI UniRoute đang đối chiếu điểm đầu vào, học bạ lớp 9 và sở thích nghề nghiệp để xếp hạng phương án...">
        <div className="space-y-3">
          {top.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="text-center shrink-0">
                  <div className="text-[10px] font-bold uppercase text-[#94A3B8]">Đề xuất</div>
                  <div className="text-[24px] font-bold text-[#2563EB] leading-tight">#{o.rank}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[14px] font-bold text-[#1E293B]">{o.name}</h3>
                    <Chip tone="blue">Phù hợp {o.total}/100</Chip>
                  </div>

                  <div className="mt-2 text-[11.5px] font-semibold text-[#6B7280]">Môn học lựa chọn (4)</div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(o.electives || []).map((k) => <Chip key={k} tone="gray">{thptLabel(k)}</Chip>)}
                  </div>
                  <div className="mt-2.5 text-[11.5px] font-semibold text-[#6B7280]">Cụm chuyên đề học tập (3)</div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(o.cluster_subjects || []).map((k) => <Chip key={k} tone="teal">{thptLabel(k)}</Chip>)}
                  </div>

                  <Meter value={o.total} className="mt-3" tone={o.total >= 70 ? '#0F766E' : '#2563EB'} />

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5">
                    {Object.entries(o.breakdown || {}).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[11.5px]">
                        <span className="text-[#6B7280]">{OPTION_CRITERIA_LABELS[k] || k}</span>
                        <span className="font-semibold text-[#1E293B] tabular-nums">{v}/100</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 space-y-0.5">
                    {Object.entries(o.explanations || {}).map(([k, exp]) => (
                      <div key={k} className="text-[11px] text-[#94A3B8]">· {exp}</div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ThinkingReveal>

      <Card className="p-5 bg-[#F0F9FF] border-[#BAE6FD]">
        <div className="flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-[#0369A1] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-[13.5px] font-bold text-[#0C4A6E]">Bước tiếp theo</h3>
            <p className="mt-1 text-[12px] text-[#0C4A6E] leading-relaxed">
              Danh sách đề xuất chỉ mang tính tham khảo. Khi bạn và nhà trường thống nhất phương án, hãy cập nhật lại
              <b> môn học lựa chọn THPT</b> trong Hồ sơ của tôi để hệ thống dùng cho các bước sau.
            </p>
            <PrimaryButton className="mt-3 !h-10 !text-[12.5px]" onClick={() => navigate('/profile')}>
              <Contact className="w-4 h-4" /> Cập nhật trong Hồ sơ của tôi
            </PrimaryButton>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <GhostButton onClick={onBack}><ArrowLeft className="w-4 h-4" /> Sửa phương án đã nhập</GhostButton>
      </div>
    </div>
  );
}