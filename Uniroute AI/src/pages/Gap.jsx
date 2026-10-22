import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, AlertTriangle, Loader2, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  useAdmissionTargets, useAcademicRecords, useSubjects, useStudentProfile,
  useStudyPlans, useSaveStudyPlan, useStudyTasks, useSaveStudyTasks, useArchiveStudyTasks,
} from '@/lib/useStudentData';
import { buildStudyPlan, buildSkillPlans, weeksUntilDate, FEASIBILITY_LABELS, PRIORITY_LABELS, PRIORITY_TONES } from '@/lib/studyEngine';
import PageShell from '@/components/journey/PageShell';
import { Card, Chip, PrimaryButton, GhostButton, Meter, DemoBadge } from '@/components/journey/bits';
import ThinkingReveal from '@/components/journey/ThinkingReveal';

export default function Gap() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('tid');

  const { data: targets, isLoading: tLoading } = useAdmissionTargets();
  const { data: academicRecords } = useAcademicRecords();
  const { data: subjects } = useSubjects();
  const { data: profile } = useStudentProfile();
  const { data: existingPlan } = useStudyPlans();
  const { data: studyTasks } = useStudyTasks();
  const savePlanMut = useSaveStudyPlan();
  const saveTasksMut = useSaveStudyTasks();
  const archiveMut = useArchiveStudyTasks();

  const today = new Date().toISOString().slice(0, 10);
  const [examDate, setExamDate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [generating, setGenerating] = useState(false);

  const target = useMemo(() => {
    if (!targets) return null;
    if (targetId) return targets.find((t) => t.id === targetId);
    return targets.find((t) => t.is_primary) || targets[0];
  }, [targets, targetId]);

  const certifications = profile?.certifications || [];

  // Môn (hoặc kỳ thi / chứng chỉ) cần ôn theo phương thức xét tuyển của mục tiêu
  const subjectGaps = useMemo(
    () => buildSkillPlans({ target, academicRecords, certifications, subjects }),
    [target, academicRecords, certifications, subjects]
  );

  const isComboMethod = target?.method === 'thpt' || target?.method === 'combo';

  const overallGap = useMemo(() => {
    const withDiag = subjectGaps.filter((s) => s.hasDiagnostic);
    if (!withDiag.length) return null;
    const avgGap = withDiag.reduce((s, x) => s + x.gap, 0) / withDiag.length;
    return Math.round(avgGap * 10) / 10;
  }, [subjectGaps]);

  const handleGenerate = async () => {
    if (!target) { toast({ title: 'Chưa chọn mục tiêu' }); return; }
    if (!examDate) { toast({ title: 'Chưa nhập ngày thi' }); return; }
    if (!weeklyHours || weeklyHours <= 0) { toast({ title: 'Chưa nhập giờ học/tuần' }); return; }

    setGenerating(true);
    try {
      const plan = buildStudyPlan({
        target,
        academicRecords,
        certifications,
        examDate,
        weeklyHours: Number(weeklyHours),
        subjects,
      });

      if (plan.error) { toast({ title: plan.error }); setGenerating(false); return; }

      // Archive old incomplete tasks for this target (preserve completed)
      const oldTasks = (studyTasks || []).filter((t) => t.target_id === target.id && !t.archived);
      const toArchive = oldTasks.filter((t) => t.status !== 'done');
      if (toArchive.length) {
        await archiveMut.mutateAsync(toArchive.map((t) => t.id));
      }

      // Deactivate old plans (existingPlan là mảng các plan đang active)
      if (Array.isArray(existingPlan) && existingPlan.length) {
        await Promise.all(
          existingPlan.map((p) => savePlanMut.mutateAsync({ id: p.id, data: { is_active: false } }))
        );
      }

      // Create new plan
      const planRecord = await savePlanMut.mutateAsync({
        data: {
          target_id: target.id,
          target_label: plan.target_label,
          exam_date: examDate,
          weekly_hours: Number(weeklyHours),
          total_weeks: plan.total_weeks,
          total_hours_needed: plan.total_hours_needed,
          total_hours_available: plan.total_hours_available,
          feasibility_status: plan.feasibility_status,
          warnings: plan.warnings,
          suggestions: plan.suggestions,
          generated_at: new Date().toISOString(),
          is_active: true,
        },
      });

      // Create tasks with plan_id
      const tasksWithPlan = plan.tasks.map((t) => ({ ...t, plan_id: planRecord.id }));
      if (tasksWithPlan.length) await saveTasksMut.mutateAsync(tasksWithPlan);

      toast({
        title: `Đã tạo kế hoạch ${plan.total_weeks} tuần`,
        description: plan.feasibility_status === 'insufficient'
          ? 'Cảnh báo: thời gian không đủ — xem phương án điều chỉnh.'
          : `${tasksWithPlan.length} nhiệm vụ đã được lưu.`,
      });
      navigate('/roadmap');
    } catch (e) {
      toast({ title: 'Lỗi tạo kế hoạch', description: e.message });
    }
    setGenerating(false);
  };

  if (tLoading) {
    return <PageShell title="Phân tích khoảng cách"><Card className="p-10 text-center"><div className="flex items-center justify-center gap-2 text-[13px] text-[#667085]"><Loader2 className="w-5 h-5 animate-spin" /> Đang tải...</div></Card></PageShell>;
  }

  if (!targets || targets.length === 0) {
    return (
      <PageShell title="Phân tích khoảng cách" subtitle="Cần ít nhất một mục tiêu xét tuyển.">
        <Card className="p-10 text-center">
          <div className="text-[14px] font-semibold text-[#111827]">Chưa có mục tiêu nào</div>
          <p className="text-[12.5px] text-[#667085] mt-1">Tạo mục tiêu trước để hệ thống so sánh điểm hiện tại với ngưỡng mục tiêu.</p>
          <PrimaryButton className="mt-4" onClick={() => navigate('/universities')}>Tạo mục tiêu</PrimaryButton>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Phân tích khoảng cách & Lập kế hoạch ôn"
      subtitle={target ? `Mục tiêu: ${target.university_name} — ${target.major_name} (kỳ ${target.year})` : 'Chọn mục tiêu để phân tích'}
      note="Khoảng cách tính từ học lực mới nhất. Nếu môn chưa có dữ liệu chẩn đoán, hệ thống KHÔNG tự bịa điểm yếu — chỉ đánh dấu 'chưa chẩn đoán'."
    >
      {/* Chọn mục tiêu */}
      {targets.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[12px] font-semibold text-[#344054]">Mục tiêu:</span>
          {targets.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/gap?tid=${t.id}`)}
              className={`px-3 h-8 rounded-full text-[11.5px] font-semibold border transition-colors ${t.id === target?.id ? 'bg-[#253B80] text-white border-[#253B80]' : 'bg-white text-[#344054] border-[#E4E7EC] hover:border-[#253B80]'}`}
            >
              {t.university_name?.split(' ').slice(-1)[0]} · {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Tổng quan khoảng cách */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <Card className="p-5">
          <div className="text-[11.5px] font-semibold text-[#667085]">Điểm mục tiêu</div>
          <div className="text-[32px] font-bold leading-tight mt-1 text-[#253B80]">{target?.target_score}/{target?.target_scale}</div>
          <div className="text-[11px] text-[#98A2B3] mt-0.5">{isComboMethod ? `Tổ hợp ${target?.combination}` : target?.method_label || target?.method}</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11.5px] font-semibold text-[#667085]">Khoảng cách trung bình</div>
          <div className={`text-[32px] font-bold leading-tight mt-1 ${overallGap == null ? 'text-[#98A2B3]' : overallGap > 0 ? 'text-[#B45309]' : 'text-[#0D9488]'}`}>
            {overallGap == null ? '—' : overallGap > 0 ? `+${overallGap}` : 'Đạt'}
          </div>
          <div className="text-[11px] text-[#98A2B3] mt-0.5">{overallGap == null ? 'Chưa có dữ liệu chẩn đoán' : 'Trung bình các môn'}</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11.5px] font-semibold text-[#667085]">Nguồn dữ liệu đã có</div>
          <div className="text-[32px] font-bold leading-tight mt-1 text-[#111827]">
            {subjectGaps.filter((s) => s.hasDiagnostic).length}<span className="text-[16px] text-[#98A2B3]">/{subjectGaps.length}</span>
          </div>
          <div className="text-[11px] text-[#98A2B3] mt-0.5">{isComboMethod ? 'Môn đã có điểm học lực' : 'Chứng chỉ / điểm ĐGNL đã khai báo'}</div>
        </Card>
      </div>

      {/* Khoảng cách theo môn */}
      <Card className="p-5 mb-5">
        <h2 className="text-[14.5px] font-bold text-[#111827] mb-4">
          {isComboMethod ? `Khoảng cách theo môn (tổ hợp ${target?.combination})` : 'Khoảng cách theo phần thi / kỹ năng'}
        </h2>
        <div className="space-y-3">
          {subjectGaps.map((sub, i) => (
            <div key={sub.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#111827]">{sub.label}</span>
                  <Chip tone={PRIORITY_TONES[sub.priority]}>{PRIORITY_LABELS[sub.priority]}</Chip>
                  {sub.note && <Chip tone="blue">{sub.note}</Chip>}
                  {i === 0 && sub.gap > 0 && <Chip tone="amber">Ưu tiên cao nhất</Chip>}
                </div>
                <span className="text-[12px] text-[#667085] tabular-nums">
                  {sub.hasDiagnostic ? (
                    <>{sub.current.toFixed(1)} → <b className="text-[#111827]">{sub.targetScore}</b>
                      <span className={`ml-2 font-bold ${sub.gap > 0 ? 'text-[#B45309]' : 'text-[#0D9488]'}`}>{sub.gap > 0 ? `+${sub.gap}` : 'Đạt'}</span>
                    </>
                  ) : (
                    <span className="text-[#98A2B3]">Chưa có dữ liệu chẩn đoán</span>
                  )}
                </span>
              </div>
              {sub.hasDiagnostic ? (
                <Meter value={100 - Math.min(100, (sub.gap || 0) * 40)} tone={sub.gap > 1 ? '#F59E0B' : sub.gap > 0 ? '#253B80' : '#14B8A6'} />
              ) : (
                <div className="h-1.5 rounded-full bg-[#F2F4F7] border border-dashed border-[#D0D5DD]" />
              )}
            </div>
          ))}
        </div>
        {subjectGaps.some((s) => !s.hasDiagnostic) && (
          <div className="mt-4 p-3 rounded-lg bg-[#EFF4FF] border border-[#D6E0FF] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#253B80] shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-[#253B80] leading-relaxed">
              {isComboMethod
                ? <>Một số môn chưa có dữ liệu học lực — hệ thống không tự giả định điểm yếu. Vào trang <button onClick={() => navigate('/academic')} className="underline font-semibold">Cập nhật điểm</button> để nhận khoảng cách chính xác.</>
                : <>Chưa có chứng chỉ / điểm đánh giá năng lực — hệ thống không tự giả định điểm yếu. Vào trang <button onClick={() => navigate('/academic')} className="underline font-semibold">Cập nhật điểm</button> để khai báo chứng chỉ, sau đó lập kế hoạch chính xác hơn.</>}
            </p>
          </div>
        )}
      </Card>

      {/* Nhập ngày thi & thời gian học */}
      <Card className="p-5 mb-5 border-[#253B80]/30">
        <h2 className="text-[14.5px] font-bold text-[#111827] mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-[#253B80]" /> Lập kế hoạch ôn tập</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-semibold text-[#344054] block mb-1.5">Ngày thi</label>
            <input
              type="date"
              value={examDate}
              min={today}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E7EC] text-[13px] text-[#111827] focus:border-[#253B80] focus:outline-none"
            />
            {examDate && (
              <p className="text-[11px] text-[#667085] mt-1">Còn {weeksUntilDate(examDate)} tuần đến ngày thi</p>
            )}
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[#344054] block mb-1.5">Giờ học/tuần khả dụng</label>
            <input
              type="number"
              value={weeklyHours}
              min={1}
              max={60}
              onChange={(e) => setWeeklyHours(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E7EC] text-[13px] text-[#111827] focus:border-[#253B80] focus:outline-none"
            />
            <p className="text-[11px] text-[#667085] mt-1">Tổng giờ khả dụng: {(Number(weeklyHours) * (examDate ? weeksUntilDate(examDate) : 0))} giờ</p>
          </div>
        </div>
      </Card>

      {/* Preview khả thi */}
      {examDate && weeklyHours > 0 && target && (
        <Card className="p-5 mb-5">
          <ThinkingReveal label="AI UniRoute đang dự toán thời gian & khoảng cách cho mục tiêu của bạn..." deps={[examDate, weeklyHours, target?.id]}>
          {(() => {
            const preview = buildStudyPlan({ target, academicRecords, certifications, examDate, weeklyHours: Number(weeklyHours), subjects });
            if (preview.error) return <p className="text-[12.5px] text-[#B91C1C]">{preview.error}</p>;
            const tone = preview.feasibility_status === 'feasible' ? 'teal' : preview.feasibility_status === 'tight' ? 'amber' : 'rose';
            return (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[#253B80]" />
                  <h3 className="text-[14px] font-bold text-[#111827]">Dự toán tính khả thi</h3>
                  <Chip tone={tone}>{FEASIBILITY_LABELS[preview.feasibility_status]}</Chip>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-[#F7F8FC]">
                    <div className="text-[11px] text-[#667085]">Giờ cần thiết</div>
                    <div className="text-[20px] font-bold text-[#111827]">{preview.total_hours_needed} giờ</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F7F8FC]">
                    <div className="text-[11px] text-[#667085]">Giờ khả dụng</div>
                    <div className="text-[20px] font-bold text-[#111827]">{preview.total_hours_available} giờ</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F7F8FC]">
                    <div className="text-[11px] text-[#667085]">Số nhiệm vụ</div>
                    <div className="text-[20px] font-bold text-[#111827]">{preview.tasks.length}</div>
                  </div>
                </div>
                {preview.warnings.length > 0 && (
                  <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] mb-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                      <span className="text-[12px] font-bold text-[#B45309]">Cảnh báo</span>
                    </div>
                    <ul className="space-y-1">
                      {preview.warnings.map((w, i) => <li key={i} className="text-[12px] text-[#B45309]">· {w}</li>)}
                    </ul>
                  </div>
                )}
                {preview.suggestions.length > 0 && (
                  <div className="p-3 rounded-lg bg-[#F0FDF9] border border-[#CCFBF1]">
                    <div className="text-[12px] font-bold text-[#0D9488] mb-1.5">Phương án điều chỉnh</div>
                    <ul className="space-y-1">
                      {preview.suggestions.map((s, i) => <li key={i} className="text-[12px] text-[#0D9488]">· {s}</li>)}
                    </ul>
                  </div>
                )}
              </>
            );
          })()}
          </ThinkingReveal>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <GhostButton onClick={() => navigate('/target')}>← Về mục tiêu</GhostButton>
        <div className="flex-1" />
        <PrimaryButton onClick={handleGenerate} disabled={generating || !examDate || !weeklyHours}>
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo...</> : <>Tạo kế hoạch ôn tập <ArrowRight className="w-4 h-4" /></>}
        </PrimaryButton>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[11.5px] text-[#98A2B3]">
        <DemoBadge /> Kế hoạch sinh từ quy tắc: khoảng cách môn + độ ưu tiên + tính khả thi thời gian.
      </div>
    </PageShell>
  );
}