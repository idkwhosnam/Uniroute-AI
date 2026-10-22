import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trash2, Crown, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAdmissionTargets, useDeleteAdmissionTarget, useUpdateAdmissionTarget } from '@/lib/useStudentData';
import { METHOD_LABELS, DATA_STATUS_LABELS } from '@/lib/admissionEngine';
import PageShell from '@/components/journey/PageShell';
import { Card, Chip, PrimaryButton, GhostButton, DemoBadge } from '@/components/journey/bits';

const LABEL_TONE = { Dream: 'amber', Match: 'teal', Safe: 'gray' };

export default function Target() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: targets, isLoading } = useAdmissionTargets();
  const deleteMut = useDeleteAdmissionTarget();
  const updateMut = useUpdateAdmissionTarget();

  const sorted = (targets || []).slice().sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

  const setPrimary = async (id) => {
    try {
      // Unset all, then set the chosen one
      await Promise.all((targets || []).map((t) => {
        if (t.id === id) return updateMut.mutateAsync({ id: t.id, data: { is_primary: true } });
        if (t.is_primary) return updateMut.mutateAsync({ id: t.id, data: { is_primary: false } });
        return null;
      }).filter(Boolean));
      toast({ title: 'Đã đặt làm NV1 — Mục tiêu chính' });
    } catch (e) { toast({ title: 'Lỗi', description: e.message }); }
  };

  const remove = async (id) => {
    try { await deleteMut.mutateAsync(id); toast({ title: 'Đã xóa mục tiêu' }); }
    catch (e) { toast({ title: 'Lỗi', description: e.message }); }
  };

  if (isLoading) {
    return <PageShell title="Mục tiêu xét tuyển" subtitle="Đang tải..."><Card className="p-10 text-center"><div className="flex items-center justify-center gap-2 text-[13px] text-[#667085]"><Loader2 className="w-5 h-5 animate-spin" /> Đang tải...</div></Card></PageShell>;
  }

  return (
    <PageShell
      title="Mục tiêu xét tuyển"
      subtitle="Mục tiêu đã lưu — NV1 là mục tiêu chính dùng cho phân tích khoảng cách và lập kế hoạch ôn tập."
      note="Điểm mục tiêu và điểm chuẩn đều là dữ liệu tham khảo — kiểm chứng theo thông báo tuyển sinh chính thức."
    >
      {(!targets || targets.length === 0) ? (
        <Card className="p-10 text-center">
          <div className="text-[14px] font-semibold text-[#111827]">Chưa có mục tiêu nào</div>
          <p className="text-[12.5px] text-[#667085] mt-1">Tạo mục tiêu từ trang tra cứu tuyển sinh.</p>
          <PrimaryButton className="mt-4" onClick={() => navigate('/universities')}>Đến tra cứu tuyển sinh</PrimaryButton>
        </Card>
      ) : (
        <div className="space-y-3 mb-6">
          {sorted.map((t, i) => {
            const isPrimary = t.is_primary || i === 0;
            const isMock = t.data_status === 'MOCK';
            const historicalBenchmark = t.benchmark_year && t.benchmark_year < t.year;
            const hasSource = !!(t.source_name || t.source_url);
            return (
              <Card key={t.id} className="p-5">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Chip tone={isPrimary ? 'navy' : 'gray'}>{isPrimary ? 'NV1 · Mục tiêu chính' : `NV${i + 1}`}</Chip>
                  <Chip tone={LABEL_TONE[t.label]}>{t.label}</Chip>
                  <Chip tone="gray">{METHOD_LABELS[t.method] || t.method}</Chip>
                  <Chip tone="gray">Năm {t.year}</Chip>
                  {isMock ? <DemoBadge /> : <Chip tone="teal">{DATA_STATUS_LABELS[t.data_status]}</Chip>}
                </div>
                <div className="text-[15px] font-bold text-[#111827]">{t.university_name}</div>
                <div className="text-[12.5px] text-[#667085] mt-0.5">{t.major_name} · Tổ hợp {t.combination || '—'}</div>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px]">
                  <span className="text-[#344054]">Điểm mục tiêu: <b className="text-[#111827]">{t.target_score}</b>/{t.target_scale}</span>
                  <span className="text-[#344054]">Điểm chuẩn: <b className="text-[#111827]">{t.benchmark_score}</b>/{t.benchmark_scale}</span>
                  {historicalBenchmark && <span className="text-[#B45309] font-medium">⚠ Điểm chuẩn năm {t.benchmark_year} (cũ)</span>}
                </div>

                {t.conditions && <p className="text-[12px] text-[#667085] mt-1.5">{t.conditions}</p>}

                {/* Source */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                  <span className="font-semibold text-[#344054]">Nguồn:</span>
                  {hasSource ? <span className="text-[#667085]">{t.source_name}</span> : <span className="text-[#B45309]">Chưa có nguồn</span>}
                </div>

                {/* Actions */}
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  {!isPrimary && <GhostButton className="!h-8 !px-3 !text-[11.5px]" onClick={() => setPrimary(t.id)}><Crown className="w-3.5 h-3.5" /> Đặt làm NV1</GhostButton>}
                  <GhostButton className="!h-8 !px-3 !text-[11.5px]" onClick={() => navigate(`/gap?tid=${t.id}`)}><ArrowRight className="w-3.5 h-3.5" /> Phân tích khoảng cách</GhostButton>
                  <div className="flex-1" />
                  <button onClick={() => remove(t.id)} className="w-8 h-8 rounded-lg bg-white border border-[#FECACA] flex items-center justify-center text-[#DC2626] hover:bg-[#FEF2F2]"><Trash2 className="w-4 h-4" /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {targets?.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 text-[12.5px] text-[#667085]">NV1 dùng cho phân tích khoảng cách và sinh lộ trình ôn tập.</div>
          <div className="flex gap-2">
            <GhostButton onClick={() => navigate('/universities')}>Thêm mục tiêu khác</GhostButton>
            <PrimaryButton onClick={() => navigate(`/gap?tid=${sorted[0]?.id}`)}>Phân tích khoảng cách NV1 <ArrowRight className="w-4 h-4" /></PrimaryButton>
          </div>
        </div>
      )}
    </PageShell>
  );
}