import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSubjects, useStudentProfile, useAcademicRecords, useSaveAcademicRecord, useDeleteAcademicRecord } from '@/lib/useStudentData';
import { labelFor, missingRequiredKeys } from '@/lib/scoreSubjects';
import PageShell from '@/components/journey/PageShell';
import { Card, Chip, PrimaryButton, GhostButton, DemoBadge } from '@/components/journey/bits';
import CertificationForm from '@/components/certificates/CertificationForm';
import ScoreSubjectGroups from '@/components/academic/ScoreSubjectGroups';
import MissingSubjectsNotice from '@/components/academic/MissingSubjectsNotice';

const LABEL_SEQ = ['Lớp 9', 'Lớp 10 Kỳ 1', 'Lớp 10 Kỳ 2', 'Lớp 11 Kỳ 1', 'Lớp 11 Kỳ 2', 'Lớp 12 Kỳ 1', 'Lớp 12 Kỳ 2'];
const SCORE_TYPES = [
  { key: 'transcript', label: 'Học bạ', scale: 10 },
  { key: 'aptitude_test', label: 'Kiểm tra năng lực', scale: 30 },
  { key: 'trial_exam', label: 'Thi thử', scale: 30 },
];

const r1 = (v) => Math.round(v * 10) / 10;
const avgOf = (scores) => {
  const vals = Object.values(scores || {}).filter((v) => v != null);
  return vals.length ? r1(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
};

export default function Academic() {
  const { toast } = useToast();
  const { data: subjects, isLoading: loadingSubjects } = useSubjects();
  const { data: records, isLoading: loadingRecords } = useAcademicRecords();
  const { data: profile, isLoading: loadingProfile } = useStudentProfile();
  const saveMut = useSaveAcademicRecord();
  const deleteMut = useDeleteAcademicRecord();

  const [form, setForm] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const subjectList = subjects || [];
  const recordList = records || [];
  const nextLabel = LABEL_SEQ.find((l) => !recordList.some((r) => r.label === l)) || 'Kỳ học mới';

  const incompleteCards = recordList
    .map((rec) => ({
      id: rec.id,
      label: rec.label,
      labels: missingRequiredKeys(rec.scores, subjectList, profile).map((k) => labelFor(k, subjectList)),
    }))
    .filter((it) => it.labels.length > 0);

  const openAdd = () => setForm({ editingId: null, label: nextLabel, grade_level: 10, term: '1', score_type: 'transcript', scale: 10, scores: {}, recorded_date: '', note: '' });
  const openEdit = (rec) => setForm({ editingId: rec.id, label: rec.label, grade_level: rec.grade_level || 10, term: rec.term || '1', score_type: rec.score_type, scale: rec.scale || 10, scores: { ...rec.scores }, recorded_date: rec.recorded_date || '', note: rec.note || '' });

  const onScoreTypeChange = (key) => {
    const st = SCORE_TYPES.find((s) => s.key === key);
    setForm((f) => ({ ...f, score_type: key, scale: st?.scale || 10 }));
  };

  const save = async () => {
    const label = (form.label || '').trim();
    if (!label) { toast({ title: 'Nhập tên kỳ học' }); return; }
    const clean = {};
    for (const sub of subjectList) {
      if (form.scores[sub.key] != null && form.scores[sub.key] !== '') clean[sub.key] = Number(form.scores[sub.key]);
    }
    const missing = missingRequiredKeys(form.scores, subjectList, profile);
    if (missing.length) {
      toast({ title: 'Thiếu điểm môn bắt buộc', description: `Cần nhập: ${missing.map((k) => labelFor(k, subjectList)).join(', ')}.` });
      return;
    }
    if (Object.keys(clean).length === 0) { toast({ title: 'Nhập ít nhất 1 môn', description: 'Cần ít nhất một môn có điểm.' }); return; }
    // Validate range
    for (const [k, v] of Object.entries(clean)) {
      if (v < 0 || v > form.scale) { toast({ title: 'Điểm không hợp lệ', description: `Điểm phải trong khoảng 0–${form.scale}.` }); return; }
    }
    if (!form.editingId && recordList.some((r) => r.label === label)) { toast({ title: 'Đã có thẻ với tên này', description: 'Chọn tên khác hoặc sửa thẻ cũ.' }); return; }
    try {
      await saveMut.mutateAsync({ id: form.editingId, data: { label, grade_level: Number(form.grade_level), term: form.term, score_type: form.score_type, scale: Number(form.scale), scores: clean, recorded_date: form.recorded_date || null, note: form.note || null } });
      toast({ title: form.editingId ? 'Đã cập nhật thẻ điểm' : 'Đã thêm thẻ điểm mới' });
      setForm(null);
    } catch (e) {
      toast({ title: 'Lỗi lưu', description: e.message });
    }
  };

  const doDelete = async (rec) => {
    try {
      await deleteMut.mutateAsync(rec.id);
      toast({ title: 'Đã xóa thẻ điểm' });
      setConfirmDelete(null);
    } catch (e) {
      toast({ title: 'Lỗi xóa', description: e.message });
    }
  };

  const isLoading = loadingSubjects || loadingRecords || loadingProfile;

  return (
    <PageShell
      title="Cập nhật điểm"
      subtitle="Điểm học tập theo kỳ (học bạ, kiểm tra năng lực, thi thử) và chứng chỉ (IELTS, SAT, HSA)."
      note="Điểm học tập chỉ là thông tin bổ trợ cho đề xuất. Kết quả Holland (sở thích) là cơ sở chính cho định hướng ngành."
    >
      <MissingSubjectsNotice items={incompleteCards} />

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-[#98A2B3]">Thẻ điểm ({recordList.length})</h3>
        <PrimaryButton className="!h-9 !px-3.5 !text-[12px]" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Thêm thẻ điểm
        </PrimaryButton>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center mb-6"><div className="flex items-center justify-center gap-2 text-[13px] text-[#667085]"><Loader2 className="w-5 h-5 animate-spin" /> Đang tải dữ liệu...</div></Card>
      ) : recordList.length === 0 ? (
        <Card className="p-8 text-center mb-6">
          <div className="text-[14px] font-semibold text-[#111827]">Chưa có thẻ điểm nào</div>
          <PrimaryButton className="mt-4 !h-10" onClick={openAdd}><Plus className="w-4 h-4" /> Thêm thẻ điểm đầu tiên</PrimaryButton>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {recordList.map((rec, i) => {
            const isLatest = i === 0;
            const avg = avgOf(rec.scores);
            const stMeta = SCORE_TYPES.find((s) => s.key === rec.score_type);
            const entered = Object.keys(rec.scores || {}).length;
            const missingKeys = missingRequiredKeys(rec.scores, subjectList, profile);
            return (
              <Card key={rec.id} className={`p-5 ${isLatest ? 'border-[#253B80]/40' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-[14px] font-bold text-[#111827]">{rec.label}</div>
                    <div className="text-[11px] text-[#98A2B3]">{rec.recorded_date ? new Date(rec.recorded_date).toLocaleDateString('vi-VN') : 'Chưa có ngày'}</div>
                  </div>
                  {isLatest && <Chip tone="blue">Mới nhất</Chip>}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Chip tone={rec.score_type === 'transcript' ? 'teal' : rec.score_type === 'aptitude_test' ? 'blue' : 'amber'}>{stMeta?.label || rec.score_type}</Chip>
                  <span className="text-[11px] text-[#98A2B3]">Thang {rec.scale}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-[24px] font-bold text-[#253B80] leading-tight">{avg != null ? avg.toFixed(1) : '—'}</span>
                  <span className="text-[11px] text-[#98A2B3]">điểm TB · {entered} môn</span>
                </div>
                {missingKeys.length > 0 && (
                  <div className="mb-3 flex items-start gap-2 p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] shrink-0 mt-0.5" />
                    <span className="text-[11px] font-semibold text-[#B45309] leading-relaxed">
                      Thiếu điểm môn bắt buộc: {missingKeys.map((k) => labelFor(k, subjectList)).join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <GhostButton className="!h-8 !px-3 !text-[11.5px]" onClick={() => openEdit(rec)}><Pencil className="w-3.5 h-3.5" /> Sửa</GhostButton>
                  {confirmDelete === rec.id ? (
                    <GhostButton className="!h-8 !px-3 !text-[11.5px] !text-[#B91C1C] !border-[#FECACA]" onClick={() => doDelete(rec)}>Xác nhận xóa?</GhostButton>
                  ) : (
                    <GhostButton className="!h-8 !px-3 !text-[11.5px]" onClick={() => setConfirmDelete(rec.id)}><Trash2 className="w-3.5 h-3.5" /> Xóa</GhostButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CertificationForm className="mb-6" />

      {form && (
        <Card className="p-6 max-w-2xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-[#111827]">{form.editingId ? 'Sửa thẻ điểm' : 'Thêm thẻ điểm mới'}</h3>
            <button onClick={() => setForm(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#667085] hover:bg-[#F7F8FC]"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Tên kỳ học</label>
              <input className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] focus:outline-none focus:border-[#253B80]" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Ví dụ: Lớp 10 Kỳ 1" />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Loại điểm</label>
              <select className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] focus:outline-none focus:border-[#253B80]" value={form.score_type} onChange={(e) => onScoreTypeChange(e.target.value)}>
                {SCORE_TYPES.map((s) => <option key={s.key} value={s.key}>{s.label} (thang {s.scale})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Khối lớp</label>
              <select className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px]" value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: Number(e.target.value) })}>
                {[9, 10, 11, 12].map((g) => <option key={g} value={g}>Lớp {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Ngày ghi nhận</label>
              <input type="date" className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px]" value={form.recorded_date} onChange={(e) => setForm({ ...form, recorded_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-[12.5px] font-semibold text-[#344054]">Điểm các môn (thang {form.scale})</div>
            <ScoreSubjectGroups
              subjectList={subjectList}
              profile={profile}
              scale={form.scale}
              scores={form.scores}
              onChange={(key, value) => setForm((f) => ({ ...f, scores: { ...f.scores, [key]: value } }))}
            />
          </div>
          <div className="mt-5 flex items-center gap-2">
            <PrimaryButton onClick={save} disabled={saveMut.isPending}><Save className="w-4 h-4" /> {form.editingId ? 'Lưu thay đổi' : 'Thêm thẻ điểm'}</PrimaryButton>
            <GhostButton onClick={() => setForm(null)}>Hủy</GhostButton>
          </div>
        </Card>
      )}

      <div className="mt-4 flex items-center gap-2 text-[11.5px] text-[#98A2B3]">
        <DemoBadge /> Điểm học tập là thông tin bạn tự nhập — dùng làm bổ trợ, không thay thế kết quả Holland.
      </div>
    </PageShell>
  );
}