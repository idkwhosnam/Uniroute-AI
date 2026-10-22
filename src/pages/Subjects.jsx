import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  useStudentProfile, useSaveStudentProfile, useAcademicRecords, useSaveAcademicRecord, useLatestHollandResult,
} from '@/lib/useStudentData';
import {
  ENTRY_EXAM_LABEL, GRADE9_LABEL, OPTION_SOURCE_NOTE,
  ENTRY_EXAM_SUBJECTS, GRADE9_SUBJECTS, rankSchoolOptions,
} from '@/lib/subjectOptions';
import PageShell from '@/components/journey/PageShell';
import { Card } from '@/components/journey/bits';
import AdviceStepper from '@/components/subjects/AdviceStepper';
import Step1Scores from '@/components/subjects/Step1Scores';
import Step2Holland from '@/components/subjects/Step2Holland';
import Step3Options from '@/components/subjects/Step3Options';
import Step4Top3 from '@/components/subjects/Step4Top3';

const STEP_KEY = 'uniAdviceStep';
const TODAY = () => new Date().toISOString().slice(0, 10);

// Nghiệp vụ 02 — Tư vấn lựa chọn môn học THPT theo quy trình 4 bước (kết quả không lưu vào hồ sơ).
export default function Subjects() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: profile, isLoading: loadingProfile } = useStudentProfile();
  const { data: academicRecords, isLoading: loadingRecords } = useAcademicRecords();
  const { data: hollandResult } = useLatestHollandResult();
  const saveProfileMut = useSaveStudentProfile();
  const saveRecordMut = useSaveAcademicRecord();

  const [step, setStep] = useState(null);
  const [busy, setBusy] = useState(false);

  const records = academicRecords || [];
  const entryRecord = records.find((r) => r.label === ENTRY_EXAM_LABEL);
  const grade9Record = records.find((r) => r.label === GRADE9_LABEL);
  const schoolOptions = profile?.school_subject_options || [];

  const scoreMap = useMemo(
    () => ({ ...(entryRecord?.scores || {}), ...(grade9Record?.scores || {}) }),
    [entryRecord, grade9Record],
  );

  const ranked = useMemo(
    () => rankSchoolOptions(schoolOptions, { scoreMap, hollandResult }),
    [schoolOptions, scoreMap, hollandResult],
  );

  useEffect(() => {
    if (step !== null || loadingProfile) return;
    const raw = Number(sessionStorage.getItem(STEP_KEY));
    setStep(Number.isInteger(raw) && raw >= 0 && raw <= 3 ? raw : 0);
  }, [step, loadingProfile]);

  const goStep = (n) => {
    setStep(n);
    sessionStorage.setItem(STEP_KEY, String(n));
  };

  const confirmScores = async ({ entry, grade9 }) => {
    if (!profile) { toast({ title: 'Chưa có hồ sơ', description: 'Hoàn tất thông tin cá nhân trong Hồ sơ của tôi trước.' }); return; }
    setBusy(true);
    try {
      const nums = (obj, keys) => Object.fromEntries(keys.map((k) => [k, Number(obj[k])]));
      await saveRecordMut.mutateAsync({
        id: entryRecord?.id,
        data: {
          label: ENTRY_EXAM_LABEL, grade_level: 9, term: 'full', score_type: 'aptitude_test', scale: 10,
          scores: nums(entry, ENTRY_EXAM_SUBJECTS.map((s) => s.key)), recorded_date: TODAY(), note: OPTION_SOURCE_NOTE,
        },
      });
      await saveRecordMut.mutateAsync({
        id: grade9Record?.id,
        data: {
          label: GRADE9_LABEL, grade_level: 9, term: 'full', score_type: 'transcript', scale: 10,
          scores: nums(grade9, GRADE9_SUBJECTS.map((s) => s.key)), recorded_date: TODAY(), note: OPTION_SOURCE_NOTE,
        },
      });
      toast({ title: 'Đã lưu 9 điểm đầu vào', description: 'Điểm được đồng bộ sang trang Cập nhật điểm.' });
      goStep(1);
    } catch (e) {
      toast({ title: 'Lỗi lưu điểm', description: e.message });
    }
    setBusy(false);
  };

  const persistOptions = async (next) => {
    if (!profile) return;
    setBusy(true);
    try {
      await saveProfileMut.mutateAsync({ id: profile.id, data: { school_subject_options: next } });
    } catch (e) {
      toast({ title: 'Lỗi lưu phương án', description: e.message });
    }
    setBusy(false);
  };

  const addOption = (o) => persistOptions([...schoolOptions, { id: `opt_${Date.now()}`, ...o }]);
  const updateOption = (id, o) => persistOptions(schoolOptions.map((x) => (x.id === id ? { ...x, ...o } : x)));
  const deleteOption = (id) => persistOptions(schoolOptions.filter((x) => x.id !== id));

  const doneKeys = [
    entryRecord && grade9Record ? 'entry' : null,
    entryRecord && grade9Record ? 'grade9' : null,
    hollandResult ? 'holland' : null,
    (profile?.interests || []).length || profile?.declared_direction ? 'interests' : null,
    schoolOptions.length ? 'options' : null,
  ].filter(Boolean);

  if (loadingProfile || loadingRecords || step === null) {
    return (
      <PageShell title="Tư vấn tổ hợp môn học và cụm chuyên đề" subtitle="Đang tải...">
        <Card className="p-10 text-center"><div className="flex items-center justify-center gap-2 text-[13px] text-[#667085]"><Loader2 className="w-5 h-5 animate-spin" /> Đang tải...</div></Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      badge="NV02 · Tư vấn môn học lớp 10"
      title="Tư vấn tổ hợp môn học và cụm chuyên đề"
      subtitle="Đề xuất tổ hợp môn lớp 10 từ điểm đầu vào, học lực lớp 9 và các phương án môn học của trường."
      note="Kết quả tư vấn dựa trên dữ liệu bạn tự khai báo, chỉ mang tính tham khảo — không thay thế quyết định của nhà trường."
    >
      <AdviceStepper current={step} />

      {step === 0 && (
        <Step1Scores
          initialEntry={entryRecord?.scores || {}}
          initialGrade9={grade9Record?.scores || {}}
          onConfirm={confirmScores}
          saving={busy}
          doneKeys={doneKeys}
        />
      )}
      {step === 1 && (
        <Step2Holland result={hollandResult} onSkip={() => goStep(2)} onBack={() => goStep(0)} />
      )}
      {step === 2 && (
        <Step3Options
          options={schoolOptions}
          hollandDone={!!hollandResult}
          busy={busy}
          onAdd={addOption}
          onUpdate={updateOption}
          onDelete={deleteOption}
          onAnalyze={() => goStep(3)}
          onBackToHolland={() => navigate('/assessment')}
          onBack={() => goStep(1)}
        />
      )}
      {step === 3 && (
        <Step4Top3 ranked={ranked} hollandDone={!!hollandResult} onBack={() => goStep(2)} />
      )}
    </PageShell>
  );
}