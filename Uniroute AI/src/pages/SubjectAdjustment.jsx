import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, SlidersHorizontal } from 'lucide-react';
import {
  useStudentProfile, useAcademicRecords, useLatestHollandResult, useMajorGroups, useMajors,
} from '@/lib/useStudentData';
import { analyzeAdjustment, mergeScoreMap } from '@/lib/adjustmentEngine';
import PageShell from '@/components/journey/PageShell';
import AiThinking from '@/components/journey/AiThinking';
import { Card, GhostButton, PrimaryButton } from '@/components/journey/bits';
import SchoolOptionsEditor from '@/components/subjects/SchoolOptionsEditor';
import CurrentSubjectsCard from '@/components/adjustment/CurrentSubjectsCard';
import AdjustmentResultCard from '@/components/adjustment/AdjustmentResultCard';

// NV03 — Đề xuất điều chỉnh tổ hợp môn học THPT. Hệ thống chỉ tư vấn, không phê duyệt chuyển đổi.
export default function SubjectAdjustment() {
  const navigate = useNavigate();
  const { data: profile, isLoading: loadingProfile } = useStudentProfile();
  const { data: records, isLoading: loadingRecords } = useAcademicRecords();
  const { data: hollandResult } = useLatestHollandResult();
  const { data: majorGroups } = useMajorGroups();
  const { data: majors } = useMajors();

  const [candidates, setCandidates] = useState([]);
  const [seeded, setSeeded] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Điền sẵn danh mục phương án nếu học sinh đã nhập ở bước tư vấn môn học lớp 10.
  useEffect(() => {
    if (seeded || !profile) return;
    setCandidates(profile.school_subject_options || []);
    setSeeded(true);
  }, [profile, seeded]);

  const current = useMemo(
    () => ({ electives: profile?.thpt_electives || [], cluster_subjects: profile?.thpt_cluster_subjects || [] }),
    [profile],
  );
  const scoreMap = useMemo(() => mergeScoreMap(records || []), [records]);
  const hasCurrent = (current.electives.length + current.cluster_subjects.length) > 0;

  const addOption = (o) => setCandidates((list) => [...list, { id: `opt_${Date.now()}`, ...o }]);
  const updateOption = (id, o) => setCandidates((list) => list.map((x) => (x.id === id ? { ...x, ...o } : x)));
  const deleteOption = (id) => setCandidates((list) => list.filter((x) => x.id !== id));

  // Hiệu ứng AI thinking ~1.4s trước khi hiển thị kết quả tư vấn.
  const runAnalysis = () => {
    if (analyzing) return;
    setAnalyzing(true);
    setAnalysis(null);
    window.setTimeout(() => {
      setAnalysis(analyzeAdjustment({
        current,
        candidates,
        scoreMap,
        hollandResult,
        majorGroups: majorGroups || [],
        majors: majors || [],
      }));
      setAnalyzing(false);
    }, 1400);
  };

  if (loadingProfile || loadingRecords) {
    return (
      <PageShell badge="NV03 · Điều chỉnh môn học" title="Đề xuất điều chỉnh tổ hợp môn học">
        <Card className="p-10 text-center">
          <div className="flex items-center justify-center gap-2 text-[13px] text-[#667085]">
            <Loader2 className="w-5 h-5 animate-spin" /> Đang tải dữ liệu...
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      badge="NV03 · Điều chỉnh môn học"
      title="Đề xuất điều chỉnh tổ hợp môn học"
      subtitle="Đánh giá tác động khi thay đổi tổ hợp môn học THPT — hệ thống chỉ tư vấn, không phê duyệt."
      note="Hệ thống đánh giá theo quy tắc có trọng số trên dữ liệu bạn tự khai báo. Việc chuyển đổi chỉ có hiệu lực khi nhà trường xác nhận."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-5">
          <CurrentSubjectsCard profile={profile} onEdit={() => navigate('/profile')} />

          <Card className="p-5">
            <h2 className="text-[15px] font-bold text-[#1E293B] mb-3">2. Phương án muốn chuyển sang</h2>
            <SchoolOptionsEditor
              options={candidates}
              onAdd={addOption}
              onUpdate={updateOption}
              onDelete={deleteOption}
              busy={false}
            />

            {!hasCurrent && (
              <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]">
                <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-[#92400E] leading-relaxed">
                  Chưa có tổ hợp môn hiện tại — hệ thống chưa thể đánh giá tác động chuyển đổi. Hãy khai báo môn học trong Hồ sơ của tôi.
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <PrimaryButton onClick={runAnalysis} disabled={analyzing || (!hasCurrent && !candidates.length)}>
                <SlidersHorizontal className="w-4 h-4" /> Phân tích tác động chuyển đổi
              </PrimaryButton>
              {analysis && <GhostButton onClick={runAnalysis}>Chạy lại phân tích</GhostButton>}
            </div>
            <p className="mt-2 text-[11.5px] text-[#6B7280]">
              Phương án nhập ở đây chỉ dùng cho lần phân tích này, không lưu vào hồ sơ cá nhân.
            </p>
          </Card>
        </div>

        {analyzing ? (
          <AiThinking label="AI UniRoute đang phân tích tác động chuyển đổi tổ hợp môn..." />
        ) : (
          <AdjustmentResultCard analysis={analysis} hasRun={!!analysis} onUpdateProfile={() => navigate('/profile')} />
        )}
      </div>

      <div className="mt-5 flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
        <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0" />
        <p className="flex-1 text-[12px] text-[#92400E] leading-relaxed">
          Không bắt buộc đổi môn THPT nếu bạn chỉ muốn xem tổ hợp xét tuyển đại học.
        </p>
        <GhostButton className="!h-9 !text-[12px]" onClick={() => navigate('/majors')}>Chọn ngành & trường mục tiêu</GhostButton>
      </div>
    </PageShell>
  );
}