import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, ClipboardCheck, Crosshair, Gauge, CheckCircle2, Clock } from 'lucide-react';
import {
  useStudyPlans, useStudyTasks, useAdmissionTargets,
} from '@/lib/useStudentData';
import { PRIORITY_LABELS, PRIORITY_TONES } from '@/lib/studyEngine';
import PageShell from '@/components/journey/PageShell';
import { Card, Chip, PrimaryButton, GhostButton, Meter, DemoBadge } from '@/components/journey/bits';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

export default function Progress() {
  const navigate = useNavigate();
  const { data: plans } = useStudyPlans();
  const { data: tasks } = useStudyTasks();
  const { data: targets } = useAdmissionTargets();

  const plan = plans?.[0];
  const planTasks = useMemo(() => (tasks || []).filter((t) => plan && t.plan_id === plan.id), [tasks, plan]);
  const target = useMemo(() => (targets || []).find((t) => t.id === plan?.target_id), [targets, plan]);

  const doneTasks = planTasks.filter((t) => t.status === 'done').length;
  const totalTasks = planTasks.length;
  const completionPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Tiến độ theo môn
  const bySubject = useMemo(() => {
    const map = {};
    for (const t of planTasks) {
      if (!map[t.subject_key]) map[t.subject_key] = { label: t.subject_label, total: 0, done: 0, hours: 0, testScores: [] };
      map[t.subject_key].total++;
      if (t.status === 'done') map[t.subject_key].done++;
      map[t.subject_key].hours += t.duration_hours || 0;
      if (t.test_score != null) map[t.subject_key].testScores.push({ date: t.test_date, score: t.test_score });
    }
    return Object.values(map).map((s) => ({ ...s, pct: s.total ? Math.round((s.done / s.total) * 100) : 0 }));
  }, [planTasks]);

  // Xu hướng điểm kiểm tra
  const trendData = useMemo(() => {
    const allScores = planTasks
      .filter((t) => t.test_score != null && t.test_date)
      .sort((a, b) => new Date(a.test_date) - new Date(b.test_date))
      .map((t, i) => ({ name: t.test_date, score: t.test_score, subject: t.subject_label }));
    return allScores;
  }, [planTasks]);

  const subjectChartData = bySubject.map((s) => ({
    name: s.label,
    'Hoàn thành': s.pct,
    'Giờ dự kiến': s.hours,
  }));

  if (!plan) {
    return (
      <PageShell title="Tiến độ học tập" subtitle="Theo dõi hoàn thành nhiệm vụ và xu hướng điểm.">
        <Card className="p-10 text-center">
          <div className="text-[14px] font-semibold text-[#111827]">Chưa có kế hoạch ôn tập</div>
          <p className="text-[12.5px] text-[#667085] mt-1">Tạo kế hoạch từ trang phân tích khoảng cách.</p>
          <PrimaryButton className="mt-4" onClick={() => navigate('/gap')}>Đến phân tích khoảng cách</PrimaryButton>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Tiến độ học tập"
      subtitle="Hoàn thành nhiệm vụ, xu hướng điểm kiểm tra và khoảng cách mục tiêu."
      note="Hệ thống chỉ theo dõi tiến độ so với mục tiêu bạn tự đặt — không dự đoán kết quả trúng tuyển."
    >
      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[11.5px] font-semibold text-[#667085] mb-1"><Gauge className="w-3.5 h-3.5" /> Hoàn thành</div>
          <div className="text-[28px] font-bold text-[#111827] leading-tight">{completionPct}%</div>
          <Meter value={completionPct} tone="#14B8A6" className="mt-2" />
          <div className="text-[11px] text-[#98A2B3] mt-1">{doneTasks}/{totalTasks} nhiệm vụ</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[11.5px] font-semibold text-[#667085] mb-1"><ClipboardCheck className="w-3.5 h-3.5" /> Giờ đã học</div>
          <div className="text-[28px] font-bold text-[#111827] leading-tight">{planTasks.filter((t) => t.status === 'done').reduce((s, t) => s + (t.duration_hours || 0), 0)}<span className="text-[14px] text-[#98A2B3]">/{plan.total_hours_needed}</span></div>
          <div className="text-[11px] text-[#98A2B3] mt-0.5">giờ</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[11.5px] font-semibold text-[#667085] mb-1"><Clock className="w-3.5 h-3.5" /> Còn lại</div>
          <div className="text-[28px] font-bold text-[#111827] leading-tight">{plan.total_weeks}<span className="text-[14px] text-[#98A2B3]"> tuần</span></div>
          <div className="text-[11px] text-[#98A2B3] mt-0.5">Thi {plan.exam_date}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[11.5px] font-semibold text-[#667085] mb-1"><Crosshair className="w-3.5 h-3.5" /> Mục tiêu</div>
          <div className="text-[14px] font-bold text-[#111827] leading-tight mt-1">{target?.university_name}</div>
          <div className="text-[11px] text-[#667085] mt-0.5">{target?.major_name}</div>
        </Card>
      </div>

      {/* Tiến độ theo môn */}
      <Card className="p-5 mb-5">
        <h2 className="text-[14px] font-bold text-[#111827] mb-4">Tiến độ theo môn</h2>
        <div className="space-y-3">
          {bySubject.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-semibold text-[#111827]">{s.label}</span>
                <span className="text-[12px] text-[#667085] tabular-nums">{s.done}/{s.total} · {s.hours} giờ · {s.pct}%</span>
              </div>
              <Meter value={s.pct} tone={s.pct >= 80 ? '#14B8A6' : s.pct >= 50 ? '#253B80' : '#F59E0B'} />
            </div>
          ))}
        </div>
      </Card>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <h2 className="text-[14px] font-bold text-[#111827] mb-4">Xu hướng điểm kiểm tra</h2>
          {trendData.length > 0 ? (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top: 5, right: 12, bottom: 5, left: -18 }}>
                  <CartesianGrid stroke="#F2F4F7" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#667085' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#667085' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#253B80" strokeWidth={2.5} dot={{ r: 3.5, fill: '#253B80' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-[12px] text-[#98A2B3]">
              Chưa có điểm kiểm tra — cập nhật ở trang Lộ trình ôn tập.
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="text-[14px] font-bold text-[#111827] mb-4">Hoàn thành & thời lượng theo môn</h2>
          {subjectChartData.length > 0 ? (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={subjectChartData} margin={{ top: 5, right: 12, bottom: 5, left: -18 }}>
                  <CartesianGrid stroke="#F2F4F7" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#667085' }} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#667085' }} />
                  <Tooltip />
                  <Bar dataKey="Hoàn thành" fill="#14B8A6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Giờ dự kiến" fill="#D0D5DD" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-[12px] text-[#98A2B3]">Chưa có dữ liệu</div>
          )}
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <GhostButton onClick={() => navigate('/roadmap')}>← Về lộ trình</GhostButton>
        <div className="flex-1" />
        <GhostButton onClick={() => navigate('/academic')}>Cập nhật điểm</GhostButton>
        <PrimaryButton onClick={() => navigate('/dashboard')}>Về tổng quan <ArrowRight className="w-4 h-4" /></PrimaryButton>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[11.5px] text-[#98A2B3]">
        <DemoBadge /> Tiến độ theo dõi từ nhiệm vụ đã lưu — không hiển thị "khả năng trúng tuyển %".
      </div>
    </PageShell>
  );
}