import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, TriangleAlert, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  useAdmissionPrograms, useUniversities, useMajors, useMajorGroups,
  useAcademicRecords, useStudentProfile, useLatestHollandResult,
  useAdmissionInterests, useSaveAdmissionInterest, useDeleteAdmissionInterest,
} from '@/lib/useStudentData';
import { currentSubjectScores } from '@/lib/orientationEngine';
import { adviseSelection, ADVICE_GROUPS } from '@/lib/methodAdvice';
import { interestPayloadFromProgram, planKey } from '@/lib/targetBuilder';
import { METHOD_LABELS } from '@/lib/admissionEngine';
import PageShell from '@/components/journey/PageShell';
import { Card, Chip, GhostButton, PrimaryButton } from '@/components/journey/bits';
import ThinkingReveal from '@/components/journey/ThinkingReveal';
import AdviceStepper from '@/components/admission/AdviceStepper';
import MethodAdviceCard from '@/components/admission/MethodAdviceCard';
import AddToTargetDialog from '@/components/orientation/AddToTargetDialog';

function StatusTag({ children, tone = 'green' }) {
  const styles = tone === 'green' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#E5E7EB] text-[#6B7280]';
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${styles}`}>{children}</span>;
}

export default function Admission() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [targetInsight, setTargetInsight] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const { data: programs, isLoading } = useAdmissionPrograms();
  const { data: universities } = useUniversities();
  const { data: majors } = useMajors();
  const { data: majorGroups } = useMajorGroups();
  const { data: records } = useAcademicRecords();
  const { data: profile } = useStudentProfile();
  const { data: holland } = useLatestHollandResult();
  const { data: interests } = useAdmissionInterests();
  const saveInterestMut = useSaveAdmissionInterest();
  const deleteInterestMut = useDeleteAdmissionInterest();

  // Ngành + trường mục tiêu: từ trang định hướng (?major=&unis=), hoặc từ liên kết cũ (?pid=)
  const pid = searchParams.get('pid');
  const legacy = useMemo(() => (programs || []).find((p) => p.id === pid), [programs, pid]);
  const majorCode = searchParams.get('major') || legacy?.major_code || '';
  const uniCodes = useMemo(() => {
    const raw = searchParams.get('unis') || searchParams.get('uni') || legacy?.university_code || '';
    return [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))];
  }, [searchParams, legacy]);

  const majorRec = useMemo(() => (majors || []).find((m) => m.code === majorCode) || null, [majors, majorCode]);
  const group = useMemo(() => (majorGroups || []).find((g) => g.code === majorRec?.major_group_code) || null, [majorGroups, majorRec]);
  const majorName = majorRec?.name || legacy?.major_name || 'Ngành đang xét';
  const riasecCodes = majorRec?.riasec_codes?.length ? majorRec.riasec_codes : group?.riasec_codes || [];
  const hollandTop = useMemo(() => holland?.top_groups || [], [holland]);
  const scores = useMemo(() => currentSubjectScores(records || []), [records]);

  const advice = useMemo(
    () => (majorCode && uniCodes.length
      ? adviseSelection({ majorCode, universityCodes: uniCodes, programs, records, profile, hollandTop, riasecCodes, groupName: group?.name || '' })
      : { items: [], fit: [], consider: [], counts: { fit: 0, consider: 0, total: 0 } }),
    [majorCode, uniCodes, programs, records, profile, hollandTop, riasecCodes, group],
  );

  const schools = useMemo(() => uniCodes.map((code) => {
    const uni = (universities || []).find((u) => u.code === code);
    return { code, name: uni?.name || (programs || []).find((p) => p.university_code === code)?.university_name || code };
  }), [uniCodes, universities, programs]);

  const methodInterests = useMemo(() => (interests || []).filter((i) => i.method), [interests]);
  const interestedKeys = useMemo(() => new Set(methodInterests.map(planKey)), [methodInterests]);
  const interestedForMajor = methodInterests.filter((i) => i.major_code === majorCode).length;

  const toggleInterest = async (insight) => {
    const p = insight.program;
    const existing = methodInterests.find((i) => planKey(i) === planKey(p));
    setBusyId(p.id);
    try {
      if (existing) {
        await deleteInterestMut.mutateAsync(existing.id);
        toast({ title: 'Đã bỏ quan tâm', description: `${METHOD_LABELS[p.method]} — ${p.university_name}` });
      } else {
        await saveInterestMut.mutateAsync(interestPayloadFromProgram(p, 'advice'));
        toast({ title: 'Đã quan tâm phương thức này', description: `${METHOD_LABELS[p.method]} — ${p.university_name}` });
      }
    } catch (e) {
      toast({ title: 'Lỗi lưu', description: e.message });
    }
    setBusyId(null);
  };

  const directionTag = profile?.declared_direction
    || (profile?.interests?.length ? `Sở thích: ${profile.interests.slice(0, 2).join(', ')}` : 'Chưa có sở thích / định hướng');

  if (isLoading) {
    return (
      <PageShell title="Tư vấn phương thức xét tuyển" subtitle="Đang tải...">
        <Card className="p-10 text-center"><div className="flex items-center justify-center gap-2 text-[13px] text-[#667085]"><Loader2 className="w-5 h-5 animate-spin" /> Đang tải dữ liệu tuyển sinh...</div></Card>
      </PageShell>
    );
  }

  if (!majorCode || !uniCodes.length) {
    return (
      <PageShell badge="NV04 · Tư vấn phương thức xét tuyển" title="Phương thức xét tuyển cho trường mục tiêu">
        <Card className="p-10 text-center">
          <div className="text-[14px] font-semibold text-[#111827]">Chưa có trường mục tiêu</div>
          <div className="mt-4 flex justify-center gap-2">
            <GhostButton onClick={() => navigate('/universities')}>Tra cứu tuyển sinh</GhostButton>
            <PrimaryButton onClick={() => navigate('/majors')}>Định hướng ngành & trường</PrimaryButton>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      badge="NV04 · Tư vấn phương thức xét tuyển"
      title="Phương thức xét tuyển cho trường mục tiêu"
      subtitle="Phương thức xét tuyển của ngành – trường mục tiêu, chia thành hai nhóm theo hồ sơ của bạn."
      note="Điểm chuẩn, chỉ tiêu và điều kiện trong dữ liệu là dữ liệu mẫu — cần đối chiếu đề án tuyển sinh chính thức của trường trước khi quyết định."
    >
      <AdviceStepper current={3} />

      <Card className="p-6 mb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-block px-2 py-0.5 rounded bg-[#E5E7EB] text-[10px] font-bold uppercase tracking-wide text-[#374151]">Ngành đang xét</span>
            <h2 className="text-[20px] font-bold text-[#111827] mt-2">{majorName}</h2>
            <div className="text-[12.5px] text-[#6B7280] mt-1">
              {schools.length} trường mục tiêu: {schools.map((s) => s.name).join(' · ')}
            </div>
          </div>
          <GhostButton className="!h-9 !text-[11.5px]" onClick={() => navigate('/majors')}>← Sửa trường mục tiêu</GhostButton>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <StatusTag>{Object.keys(scores).length} môn có điểm</StatusTag>
          <StatusTag tone={hollandTop.length ? 'green' : 'gray'}>
            {hollandTop.length ? `Holland: ${hollandTop.join(', ')}` : 'Chưa có kết quả Holland'}
          </StatusTag>
          <StatusTag tone={profile?.declared_direction || profile?.interests?.length ? 'green' : 'gray'}>{directionTag}</StatusTag>
        </div>

        <div className="mt-3 p-3 rounded-lg bg-[#FFFBEB] border border-[#FCD34D] text-[11.5px] text-[#92400E]">
          <span className="font-bold">Lưu ý:</span> “Phù hợp sơ bộ” không có nghĩa đã đủ điều kiện trúng tuyển.
        </div>
      </Card>

      <ThinkingReveal
        label="AI UniRoute đang phân loại phương thức xét tuyển theo hồ sơ của bạn..."
        deps={[majorCode, uniCodes.join(','), String(Object.keys(scores).length), hollandTop.join('')]}
      >
        <Card className="p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E7EB]">
          <div className="px-2 py-2 text-center">
            <div className="text-[22px] font-bold text-[#111827]">{advice.counts.fit}</div>
            <div className="text-[11.5px] text-[#6B7280]">Phù hợp sơ bộ</div>
          </div>
          <div className="px-2 py-2 text-center">
            <div className="text-[22px] font-bold text-[#111827]">{advice.counts.consider}</div>
            <div className="text-[11.5px] text-[#6B7280]">Có thể cân nhắc</div>
          </div>
          <div className="px-2 py-2 text-center">
            <div className="text-[22px] font-bold text-[#111827]">{interestedForMajor}</div>
            <div className="text-[11.5px] text-[#6B7280]">Đã quan tâm (ngành này)</div>
          </div>
        </Card>

        {['fit', 'consider'].map((key) => {
          const group = ADVICE_GROUPS[key];
          const items = key === 'fit' ? advice.fit : advice.consider;
          return (
            <div key={key} className="mt-7">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {key === 'fit'
                    ? <Check className="w-4 h-4 text-[#065F46]" />
                    : <TriangleAlert className="w-4 h-4 text-[#6B7280]" />}
                  <h2 className="text-[15px] font-bold text-[#111827]">{group.label}</h2>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${group.badge}`}>{items.length} phương thức</span>
              </div>
              <p className="text-[12px] text-[#667085] mb-3 max-w-3xl leading-relaxed">{group.subtitle}</p>

              {items.length ? (
                <div className="space-y-4">
                  {items.map((insight) => (
                    <MethodAdviceCard
                      key={insight.program.id}
                      insight={insight}
                      interested={interestedKeys.has(planKey(insight.program))}
                      busy={busyId === insight.program.id}
                      onToggleInterest={toggleInterest}
                      onSetTarget={setTargetInsight}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-5 text-[12.5px] text-[#667085]">Không có phương thức xét tuyển nào ở nhóm này.</Card>
              )}
            </div>
          );
        })}

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3 p-4 rounded-xl bg-white border border-[#E5E7EB]">
          <PrimaryButton className="!h-9 !text-[11.5px]" onClick={() => navigate('/target')}>Xem mục tiêu xét tuyển</PrimaryButton>
        </div>
      </ThinkingReveal>

      {targetInsight && (
        <AddToTargetDialog
          plan={{ ...targetInsight.program, program_id: targetInsight.program.id, method_label: targetInsight.info.method_label }}
          onClose={() => setTargetInsight(null)}
        />
      )}
    </PageShell>
  );
}