import React from 'react';
import { AlertTriangle, Pencil } from 'lucide-react';
import { Card, Chip, GhostButton, PrimaryButton } from '@/components/journey/bits';
import { SCORE_BASE_KEYS, thptLabel } from '@/lib/thptSubjects';

function Group({ label, tone, keys }) {
  return (
    <div>
      <div className="text-[10.5px] font-bold uppercase tracking-wide text-[#94A3B8] mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {keys.map((k) => <Chip key={k} tone={tone}>{thptLabel(k)}</Chip>)}
      </div>
    </div>
  );
}

// NV03 — Mục 1: tổ hợp môn học sinh đã/đang theo học (4 bắt buộc + 4 lựa chọn + 3 chuyên đề).
export default function CurrentSubjectsCard({ profile, onEdit }) {
  const electives = profile?.thpt_electives || [];
  const cluster = profile?.thpt_cluster_subjects || [];
  const declared = !!profile?.has_thpt_subjects && electives.length === 4 && cluster.length === 3;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-[15px] font-bold text-[#1E293B]">1. Môn học đã/đang theo học</h2>
        {declared && (
          <GhostButton className="!h-8 !px-3 !text-[11.5px]" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" /> Sửa trong Hồ sơ
          </GhostButton>
        )}
      </div>

      {declared ? (
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] space-y-3.5">
          <Group label="Môn học bắt buộc (4)" tone="navy" keys={SCORE_BASE_KEYS} />
          <Group label="Môn học lựa chọn (4)" tone="blue" keys={electives} />
          <Group label="Cụm chuyên đề học tập (3)" tone="teal" keys={cluster} />
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
          <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] text-[#92400E] leading-relaxed">
              Bạn chưa khai báo môn học lựa chọn THPT trong hồ sơ. Hãy khai báo trước để hệ thống biết tổ hợp môn hiện tại
              và đánh giá được tác động khi chuyển đổi.
            </p>
            <PrimaryButton className="mt-3 !h-9 !text-[12px]" onClick={onEdit}>
              Khai báo môn học trong Hồ sơ
            </PrimaryButton>
          </div>
        </div>
      )}
    </Card>
  );
}