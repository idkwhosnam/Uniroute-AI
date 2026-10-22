import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp, CheckCircle2, RotateCcw, AlertTriangle, Clock, Link2, Loader2, Pencil } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  useStudyPlans, useStudyTasks, useUpdateStudyTask, useAdmissionTargets,
  useAcademicRecords, useSubjects, useStudentProfile, useSaveStudyPlan, useSaveStudyTasks, useArchiveStudyTasks,
} from '@/lib/useStudentData';
import { buildStudyPlan, regeneratePlan, FEASIBILITY_LABELS, PRIORITY_LABELS, PRIORITY_TONES } from '@/lib/studyEngine';
import PageShell from '@/components/journey/PageShell';
import { Card, Chip, PrimaryButton, GhostButton, Meter, DemoBadge } from '@/components/journey/bits';
import ThinkingReveal from '@/components/journey/ThinkingReveal';
import CertificationForm from '@/components/certificates/CertificationForm';

export default function Roadmap() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: plans, isLoading } = useStudyPlans();
  const { data: tasks } = useStudyTasks();
  const { data: targets } = useAdmissionTargets();
  const { data: academicRecords } = useAcademicRecords();
  const { data: subjects } = useSubjects();
  const { data: profile } = useStudentProfile();
  const updateTaskMut = useUpdateStudyTask();
  const savePlanMut = useSaveStudyPlan();
  const saveTasksMut = useSaveStudyTasks();
  const archiveMut = useArchiveStudyTasks();

  const [openWeek, setOpenWeek] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  const plan = plans?.[0];
  const planTasks = useMemo(() => (tasks || []).filter((t) => plan && t.plan_id === plan.id), [tasks, plan]);

  const weeks = useMemo(() => {
    if (!planTasks.length) return [];
    const maxWeek = Math.max(...planTasks.map((t) => t.week_number || 1));
    const result = [];
    for (let w = 1; w <= maxWeek; w++) {
      result.push({
        id: `week-${w}`,
        number: w,
        tasks: planTasks.filter((t) => t.week_number === w),
      });
    }
    return result;
  }, [planTasks]);

  const doneTasks = planTasks.filter((t) => t.status === 'done').length;
  const totalTasks = planTasks.length;

  const toggleTask = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const data = newStatus === 'done'
      ? { status: 'done', completed_at: new Date().toISOString().slice(0, 10) }
      : { status: 'todo', completed_at: null };
    try {
      await updateTaskMut.mutateAsync({ id: task.id, data });
    } catch (e) { toast({ title: 'Lỗi', description: e.message }); }
  };

  const saveTestScore = async (taskId, testScore, testDate) => {
    try {
      await updateTaskMut.mutateAsync({ id: taskId, data: { test_score: Number(testScore), test_date: testDate } });
      toast({ title: 'Đã lưu điểm kiểm tra' });
      setEditingTask(null);
    } catch (e) { toast({ title: 'Lỗi', description: e.message }); }
  };

  const handleRegenerate = async () => {
    if (!plan) return;
    const target = (targets || []).find((t) => t.id === plan.target_id);
    if (!target) { toast({ title: 'Không tìm thấy mục tiêu' }); return; }

    setRegenerating(true);
    try {
      const newPlan = buildStudyPlan({
        target,
        academicRecords,
        certifications: profile?.certifications || [],
        examDate: plan.exam_date,
        weeklyHours: plan.weekly_hours,
        subjects,
      });
      if (newPlan.error) { toast({ title: newPlan.error }); setRegenerating(false); return; }

      // Bảo toàn completed, archive incomplete, tạo mới
      const result = regeneratePlan(planTasks, newPlan.tasks);
      if (result.toArchive.length) {
        await archiveMut.mutateAsync(result.toArchive.map((t) => t.id));
      }
      const tasksWithPlan = result.toCreate.map((t) => ({ ...t, plan_id: plan.id }));
      if (tasksWithPlan.length) await saveTasksMut.mutateAsync(tasksWithPlan);

      // Cập nhật plan meta
      await savePlanMut.mutateAsync({
        id: plan.id,
        data: {
          total_hours_needed: newPlan.total_hours_needed,
          total_hours_available: newPlan.total_hours_available,
          feasibility_status: newPlan.feasibility_status,
          warnings: newPlan.warnings,
          suggestions: newPlan.suggestions,
          generated_at: new Date().toISOString(),
        },
      });

      toast({
        title: 'Đã tạo lại kế hoạch',
        description: `Bảo toàn ${result.preserved.length} nhiệm vụ đã xong, tạo ${tasksWithPlan.length} nhiệm vụ mới.`,
      });
    } catch (e) { toast({ title: 'Lỗi', description: e.message }); }
    setRegenerating(false);
  };

  if (isLoading) {
    return <PageShell title="Lộ trình ôn tập"><Card className="p-10 text-center"><div className="flex items-center justify-center gap-2 text-[13px] text-[#667085]"><Loader2 className="w-5 h-5 animate-spin" /> Đang tải...</div></Card></PageShell>;
  }

  if (!plan || !planTasks.length) {
    return (
      <PageShell title="Lộ trình ôn tập" subtitle="Lộ trình được sinh từ phân tích khoảng cách của mục tiêu hiện tại.">
        <Card className="p-10 text-center">
          <div className="text-[14px] font-semibold text-[#111827]">Chưa có lộ trình</div>
          <p className="text-[12.5px] text-[#667085] mt-1">Hãy tạo mục tiêu và phân tích khoảng cách để sinh lộ trình.</p>
          <PrimaryButton className="mt-4" onClick={() => navigate(targets?.length ? '/gap' : '/universities')}>
            {targets?.length ? 'Đến phân tích khoảng cách' : 'Tạo mục tiêu trước'}
          </PrimaryButton>
        </Card>
        <CertificationForm className="mt-5" />
      </PageShell>
    );
  }

  const feasibilityTone = plan.feasibility_status === 'feasible' ? 'teal' : plan.feasibility_status === 'tight' ? 'amber' : 'rose';

  return (
    <PageShell
      title="Lộ trình ôn tập"
      subtitle={`${plan.target_label} — ${plan.total_weeks} tuần, ${plan.weekly_hours} giờ/tuần. Thi ngày ${plan.exam_date}.`}
      note="Mỗi nhiệm vụ có chủ đề, mức ưu tiên, thời lượng và điều kiện tiên quyết. Đánh dấu hoàn thành hoặc cập nhật điểm kiểm tra."
    >
      {/* Tổng quan */}
      <ThinkingReveal label="AI UniRoute đang dựng lộ trình ôn tập từ khoảng cách điểm của bạn..." deps={[plan.id]}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Card className="p-5">
          <div className="text-[11.5px] font-semibold text-[#667085]">Hoàn thành</div>
          <div className="text-[28px] font-bold text-[#111827] leading-tight">{Math.round((doneTasks / totalTasks) * 100)}%</div>
          <div className="text-[11px] text-[#98A2B3] mt-0.5">{doneTasks}/{totalTasks} nhiệm vụ</div>
          <Meter value={totalTasks ? (doneTasks / totalTasks) * 100 : 0} tone="#14B8A6" className="mt-2" />
        </Card>
        <Card className="p-5">
          <div className="text-[11.5px] font-semibold text-[#667085]">Giờ cần / khả dụng</div>
          <div className="text-[20px] font-bold text-[#111827] leading-tight mt-1">{plan.total_hours_needed} / {plan.total_hours_available}</div>
          <div className="text-[11px] text-[#98A2B3] mt-0.5">giờ</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11.5px] font-semibold text-[#667085]">Tính khả thi</div>
          <div className="mt-1.5"><Chip tone={feasibilityTone}>{FEASIBILITY_LABELS[plan.feasibility_status]}</Chip></div>
        </Card>
        <Card className="p-5 flex flex-col justify-center">
          <PrimaryButton className="!h-10 mb-2" onClick={() => navigate('/progress')}>Xem tiến độ <ArrowRight className="w-4 h-4" /></PrimaryButton>
          <GhostButton className="!h-10" onClick={handleRegenerate} disabled={regenerating}>
            {regenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo lại...</> : <><RotateCcw className="w-4 h-4" /> Tạo lại kế hoạch</>}
          </GhostButton>
        </Card>
      </div>
      </ThinkingReveal>

      {/* Cảnh báo khả thi */}
      {plan.warnings?.length > 0 && (
        <Card className="p-4 mb-5 border-[#FDE68A] bg-[#FFFBEB]">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4 text-[#B45309]" />
            <span className="text-[12.5px] font-bold text-[#B45309]">Cảnh báo thời gian</span>
          </div>
          <ul className="space-y-1 mb-2">
            {plan.warnings.map((w, i) => <li key={i} className="text-[12px] text-[#B45309]">· {w}</li>)}
          </ul>
          {plan.suggestions?.length > 0 && (
            <>
              <div className="text-[12px] font-bold text-[#0D9488] mt-2 mb-1">Phương án điều chỉnh:</div>
              <ul className="space-y-1">
                {plan.suggestions.map((s, i) => <li key={i} className="text-[12px] text-[#0D9488]">· {s}</li>)}
              </ul>
            </>
          )}
        </Card>
      )}

      {/* Tuần */}
      <div className="space-y-3">
        {weeks.map((week) => {
          const weekDone = week.tasks.filter((t) => t.status === 'done').length;
          const isOpen = openWeek === week.id;
          return (
            <Card key={week.id} className="overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 bg-[#EFF4FF] text-[#253B80]">
                  T{week.number}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-[#111827]">Tuần {week.number}</h3>
                  <div className="text-[11.5px] text-[#667085] mt-0.5">{week.tasks.length} nhiệm vụ ({weekDone} xong) · {week.tasks.reduce((s, t) => s + (t.duration_hours || 0), 0)} giờ</div>
                </div>
                <Meter value={week.tasks.length ? (weekDone / week.tasks.length) * 100 : 0} tone="#14B8A6" className="w-24" />
                <button onClick={() => setOpenWeek(isOpen ? null : week.id)} className="w-9 h-9 rounded-lg bg-white border border-[#E4E7EC] flex items-center justify-center text-[#667085] hover:bg-[#F7F8FC]">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-[#F2F4F7] space-y-3">
                  {week.tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(task)}
                      onEdit={() => setEditingTask(task)}
                      editing={editingTask?.id === task.id}
                      onSaveScore={saveTestScore}
                    />
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <CertificationForm />
      </div>

      <div className="mt-5 flex items-center gap-2 text-[11.5px] text-[#98A2B3]">
        <DemoBadge /> Kế hoạch ôn tập sinh từ quy tắc ưu tiên — bảo toàn nhiệm vụ đã hoàn thành khi tạo lại.
      </div>
    </PageShell>
  );
}

function TaskRow({ task, onToggle, onEdit, editing, onSaveScore }) {
  const [testScore, setTestScore] = useState(task.test_score || '');
  const [testDate, setTestDate] = useState(task.test_date || '');
  const isDone = task.status === 'done';
  return (
    <div className={`p-3 rounded-lg border ${isDone ? 'border-[#CCFBF1] bg-[#FDFEFE]' : 'border-[#E4E7EC] bg-white'}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isDone}
          onChange={onToggle}
          className="mt-1 accent-[#14B8A6] w-4 h-4"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[13px] font-semibold ${isDone ? 'text-[#98A2B3] line-through' : 'text-[#111827]'}`}>{task.topic}</span>
            <Chip tone={PRIORITY_TONES[task.priority]}>{PRIORITY_LABELS[task.priority]}</Chip>
            <Chip tone="gray"><Clock className="w-3 h-3" /> {task.duration_hours} giờ</Chip>
          </div>
          <div className="text-[11.5px] text-[#667085]">
            {task.subject_label}
            {task.has_diagnostic ? ` · Hiện ${task.current_score?.toFixed(1)} → mục tiêu ${task.target_score}` : ' · Chưa có dữ liệu chẩn đoán'}
            {task.prerequisites?.length > 0 && (
              <span className="ml-2 flex items-center gap-1 inline-flex"><Link2 className="w-3 h-3" /> Tiên quyết: {task.prerequisites.join(', ')}</span>
            )}
          </div>
          {task.test_score != null && (
            <div className="text-[11.5px] text-[#0D9488] mt-1 font-medium">Điểm kiểm tra: {task.test_score} ({task.test_date})</div>
          )}
          {editing && (
            <div className="mt-2 flex flex-wrap items-center gap-2 p-2 rounded-lg bg-[#F7F8FC]">
              <input
                type="number"
                step="0.1"
                placeholder="Điểm kiểm tra"
                value={testScore}
                onChange={(e) => setTestScore(e.target.value)}
                className="h-8 w-28 px-2 rounded border border-[#E4E7EC] text-[12px]"
              />
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="h-8 px-2 rounded border border-[#E4E7EC] text-[12px]"
              />
              <GhostButton className="!h-8 !px-3 !text-[11px]" onClick={() => onSaveScore(task.id, testScore, testDate)}>Lưu</GhostButton>
              <GhostButton className="!h-8 !px-3 !text-[11px]" onClick={onEdit}>Hủy</GhostButton>
            </div>
          )}
        </div>
        {!editing && (
          <button onClick={onEdit} className="w-8 h-8 rounded-lg bg-white border border-[#E4E7EC] flex items-center justify-center text-[#667085] hover:bg-[#F7F8FC]" title="Cập nhật điểm kiểm tra">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}