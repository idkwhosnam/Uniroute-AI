import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Card, PrimaryButton } from '@/components/journey/bits';
import ScoreField from './ScoreField';
import AdviceSidebar from './AdviceSidebar';
import { ENTRY_EXAM_SUBJECTS, GRADE9_SUBJECTS, validateScoreMap } from '@/lib/subjectOptions';

// Nghiệp vụ 02 B2 — nhập điểm thi tuyển sinh lớp 10 và điểm trung bình cả năm lớp 9.
export default function Step1Scores({ initialEntry = {}, initialGrade9 = {}, onConfirm, saving, doneKeys = [] }) {
  const [entry, setEntry] = useState(() => ({ ...initialEntry }));
  const [grade9, setGrade9] = useState(() => ({ ...initialGrade9 }));
  const [errors, setErrors] = useState([]);

  const submit = () => {
    const e1 = validateScoreMap(entry, ENTRY_EXAM_SUBJECTS.map((s) => s.key));
    const e2 = validateScoreMap(grade9, GRADE9_SUBJECTS.map((s) => s.key));
    const all = [...e1.errors, ...e2.errors];
    setErrors(all);
    if (all.length) return;
    onConfirm({ entry, grade9 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h2 className="text-[15px] font-bold text-[#1E293B]">1. Điểm thi tuyển sinh vào lớp 10</h2>
            <span className="px-2.5 py-1 rounded-full bg-[#FEF2F2] text-[#B91C1C] text-[10.5px] font-bold uppercase tracking-wide">3 điểm bắt buộc</span>
          </div>
          <p className="text-[12px] text-[#6B7280] mb-4">Điểm thi tuyển sinh là dữ liệu riêng, không thay thế điểm trung bình lớp 9.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ENTRY_EXAM_SUBJECTS.map((s) => (
              <ScoreField key={s.key} label={s.label} value={entry[s.key]} onChange={(v) => setEntry((p) => ({ ...p, [s.key]: v }))} />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h2 className="text-[15px] font-bold text-[#1E293B]">2. Điểm trung bình cả năm lớp 9</h2>
            <span className="px-2.5 py-1 rounded-full bg-[#FEF2F2] text-[#B91C1C] text-[10.5px] font-bold uppercase tracking-wide">6 điểm bắt buộc</span>
          </div>
          <p className="text-[12px] text-[#6B7280] mb-4">Dữ liệu đã có trong hồ sơ sẽ được điền sẵn. Kiểm tra và bổ sung đủ sáu môn.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GRADE9_SUBJECTS.map((s) => (
              <ScoreField key={s.key} label={s.label} value={grade9[s.key]} onChange={(v) => setGrade9((p) => ({ ...p, [s.key]: v }))} />
            ))}
          </div>
        </Card>

        {errors.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <div className="text-[12.5px] font-bold text-[#B91C1C]">Vui lòng kiểm tra lại {errors.length} điểm chưa hợp lệ</div>
              <ul className="mt-1 space-y-0.5">
                {errors.map((e, i) => <li key={i} className="text-[11.5px] text-[#B91C1C]">· {e}</li>)}
              </ul>
            </div>
          </div>
        )}

        <PrimaryButton onClick={submit} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Xác nhận 9 điểm và tiếp tục <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
        <p className="text-[11.5px] text-[#6B7280]">Điểm sau khi xác nhận được lưu vào hồ sơ và đồng bộ sang trang Cập nhật điểm.</p>
      </div>

      <AdviceSidebar doneKeys={doneKeys} />
    </div>
  );
}