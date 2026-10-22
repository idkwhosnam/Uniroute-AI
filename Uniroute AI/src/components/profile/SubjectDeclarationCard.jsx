import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertTriangle, Info, Save, Loader2, BookOpen, Pencil, X, NotebookPen } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSubjects, useStudentProfile, useSaveStudentProfile } from '@/lib/useStudentData';
import {
  THPT_ELECTIVES, THPT_CLUSTER_SUBJECTS, THPT_ELECTIVE_COUNT, THPT_CLUSTER_COUNT,
  validateThptDeclaration, thptLabel,
} from '@/lib/thptSubjects';
import { Card, Chip, PrimaryButton, GhostButton } from '@/components/journey/bits';

// Nghiệp vụ 01 B3 — Khai báo môn học THPT trong Hồ sơ của tôi (hiển thị gọn, có nút Chỉnh sửa).
export default function SubjectDeclarationCard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: profile, isLoading } = useStudentProfile();
  const { data: subjects } = useSubjects();
  const saveMut = useSaveStudentProfile();

  const [editing, setEditing] = useState(false);
  const [hasSubjects, setHasSubjects] = useState(false);
  const [electives, setElectives] = useState([]);
  const [clusterSubjects, setClusterSubjects] = useState([]);
  const [showErrors, setShowErrors] = useState(false);

  const subjectMap = useMemo(() => Object.fromEntries((subjects || []).map((s) => [s.key, s])), [subjects]);
  const labelOf = (key) => subjectMap[key]?.label || thptLabel(key);

  useEffect(() => {
    if (!profile) return;
    setHasSubjects(!!profile.has_thpt_subjects);
    setElectives(profile.thpt_electives || []);
    setClusterSubjects(profile.thpt_cluster_subjects || []);
    setShowErrors(false);
  }, [profile]);

  const toggle = (list, setList, key) =>
    setList(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);

  const declaredElectives = profile?.thpt_electives || [];
  const declaredCluster = profile?.thpt_cluster_subjects || [];
  const isDeclared = !!profile?.has_thpt_subjects && declaredElectives.length > 0;

  const save = async () => {
    if (!profile) {
      toast({ title: 'Chưa có hồ sơ', description: 'Hoàn tất thông tin cá nhân bên trên trước khi lưu môn học.' });
      return;
    }
    if (hasSubjects) {
      const v = validateThptDeclaration(electives, clusterSubjects);
      if (!v.valid) {
        setShowErrors(true);
        toast({ title: 'Chưa đủ môn học theo quy định', description: v.errors[0] });
        return;
      }
    }
    try {
      await saveMut.mutateAsync({
        id: profile.id,
        data: hasSubjects
          ? { has_thpt_subjects: true, thpt_electives: electives, thpt_cluster_subjects: clusterSubjects }
          : { has_thpt_subjects: false, thpt_electives: [], thpt_cluster_subjects: [] },
      });
      setEditing(false);
      if (hasSubjects) {
        setShowErrors(false);
        toast({ title: 'Đã lưu môn học vào hồ sơ', description: `${electives.length} môn học lựa chọn + ${clusterSubjects.length} môn cụm chuyên đề.` });
      } else {
        setElectives([]);
        setClusterSubjects([]);
        setShowErrors(false);
        toast({ title: 'Đã lưu trạng thái hồ sơ', description: 'Bạn chưa có môn học THPT — dùng Tư vấn môn học lớp 10 khi cần.' });
      }
    } catch (e) {
      toast({ title: 'Lỗi lưu', description: e.message });
    }
  };

  if (isLoading) {
    return <Card className="p-5"><div className="flex items-center gap-2 text-[12.5px] text-[#636E72]"><Loader2 className="w-4 h-4 animate-spin" /> Đang tải hồ sơ...</div></Card>;
  }

  // ===== Chế độ gọn: đã khai báo hoặc chưa khai báo =====
  if (!editing) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[14.5px] font-bold text-[#111827]">Môn học lựa chọn THPT</h3>
          <GhostButton className="!h-8 !px-3 !text-[11.5px]" onClick={() => setEditing(true)}>
            <Pencil className="w-3.5 h-3.5" /> {isDeclared ? 'Chỉnh sửa' : 'Khai báo'}
          </GhostButton>
        </div>
        {isDeclared ? (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#F7F8FC] border border-[#E4E7EC]">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-[#98A2B3] mb-1.5">4 môn học lựa chọn</div>
              <div className="flex flex-wrap gap-1.5">
                {declaredElectives.map((k) => <Chip key={k} tone="blue">{labelOf(k)}</Chip>)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#F7F8FC] border border-[#E4E7EC]">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-[#98A2B3] mb-1.5">3 môn cụm chuyên đề</div>
              <div className="flex flex-wrap gap-1.5">
                {declaredCluster.map((k) => <Chip key={k} tone="teal">{labelOf(k)}</Chip>)}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-[12px] text-[#667085] leading-relaxed">
            Bạn chưa có môn học lựa chọn tại THPT. Các thông tin khác trong hồ sơ vẫn được giữ nguyên.
            Bấm <b>Khai báo</b> nếu bạn đã có môn học, hoặc dùng <button onClick={() => navigate('/subjects')} className="underline font-semibold text-[#253B80]">Tư vấn môn học lớp 10</button> khi cần chọn môn.
          </p>
        )}
      </Card>
    );
  }

  // ===== Chế độ khai báo =====
  const electiveMsg = electives.length === THPT_ELECTIVE_COUNT ? null
    : electives.length > THPT_ELECTIVE_COUNT
      ? `Bạn đã chọn ${electives.length} môn — vượt ${electives.length - THPT_ELECTIVE_COUNT} môn. Vui lòng bỏ chọn để đúng 4 môn.`
      : `Bạn mới chọn ${electives.length}/4 môn — vui lòng chọn thêm ${THPT_ELECTIVE_COUNT - electives.length} môn.`;

  const clusterMsg = clusterSubjects.length === THPT_CLUSTER_COUNT ? null
    : clusterSubjects.length > THPT_CLUSTER_COUNT
      ? `Bạn đã chọn ${clusterSubjects.length} môn — vượt ${clusterSubjects.length - THPT_CLUSTER_COUNT} môn. Vui lòng bỏ chọn để đúng 3 môn.`
      : `Bạn mới chọn ${clusterSubjects.length}/3 môn — vui lòng chọn thêm ${THPT_CLUSTER_COUNT - clusterSubjects.length} môn.`;

  const showElectiveMsg = electiveMsg && (showErrors || electives.length > THPT_ELECTIVE_COUNT);
  const showClusterMsg = clusterMsg && (showErrors || clusterSubjects.length > THPT_CLUSTER_COUNT);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-[15px] font-bold text-[#2D3446]">Tình trạng môn học lựa chọn THPT</h3>
        <button onClick={() => setEditing(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#667085] hover:bg-[#F7F8FC]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <label className="flex items-start gap-3 p-4 rounded-xl bg-[#F0F4FF] border border-[#D6E0FF] cursor-pointer">
        <input
          type="checkbox"
          checked={hasSubjects}
          onChange={(e) => setHasSubjects(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#375DFC] shrink-0"
        />
        <span>
          <span className="block text-[13px] font-semibold text-[#2D3446]">Tôi đã có các môn học lựa chọn tại THPT</span>
          <span className="block text-[11.5px] text-[#636E72] mt-0.5 leading-relaxed">
            Chỉ tích nếu bạn đã có môn học THPT. Nếu chưa có, bỏ chọn và có thể sử dụng Tư vấn môn học lớp 10 khi cần.
          </span>
        </span>
      </label>

      {hasSubjects ? (
        <div className="mt-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[13.5px] font-bold text-[#2D3446]">Chọn đúng {THPT_ELECTIVE_COUNT} môn học lựa chọn <span className="text-[#E5484D]">*</span></h4>
              <span className={`text-[12px] font-bold tabular-nums ${electives.length === THPT_ELECTIVE_COUNT ? 'text-[#12A594]' : 'text-[#E5484D]'}`}>{electives.length}/{THPT_ELECTIVE_COUNT}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {THPT_ELECTIVES.map((s) => {
                const on = electives.includes(s.key);
                return (
                  <button
                    key={s.key}
                    onClick={() => toggle(electives, setElectives, s.key)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-colors ${on ? 'bg-[#F0F4FF] border-[#375DFC]' : 'bg-white border-[#DFE6E9] hover:border-[#375DFC]'}`}
                  >
                    <span className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 ${on ? 'bg-[#375DFC] border-[#375DFC]' : 'bg-white border-[#DFE6E9]'}`}>
                      {on && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className={`text-[12.5px] text-[#2D3446] ${on ? 'font-semibold' : ''}`}>{labelOf(s.key)}</span>
                  </button>
                );
              })}
            </div>
            {showElectiveMsg && (
              <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg bg-[#FFF4ED] border border-[#FFDCC7]">
                <AlertTriangle className="w-4 h-4 text-[#C4552A] shrink-0 mt-0.5" />
                <span className="text-[11.5px] font-semibold text-[#C4552A]">{electiveMsg}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[13.5px] font-bold text-[#2D3446]">Chọn {THPT_CLUSTER_COUNT} môn thuộc cụm chuyên đề học tập <span className="text-[#E5484D]">*</span></h4>
              <span className={`text-[12px] font-bold tabular-nums ${clusterSubjects.length === THPT_CLUSTER_COUNT ? 'text-[#12A594]' : 'text-[#E5484D]'}`}>{clusterSubjects.length}/{THPT_CLUSTER_COUNT}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {THPT_CLUSTER_SUBJECTS.map((s) => {
                const on = clusterSubjects.includes(s.key);
                return (
                  <button
                    key={s.key}
                    onClick={() => toggle(clusterSubjects, setClusterSubjects, s.key)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-colors ${on ? 'bg-[#F0F4FF] border-[#375DFC]' : 'bg-white border-[#DFE6E9] hover:border-[#375DFC]'}`}
                  >
                    <span className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 ${on ? 'bg-[#375DFC] border-[#375DFC]' : 'bg-white border-[#DFE6E9]'}`}>
                      {on && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className={`text-[12.5px] text-[#2D3446] ${on ? 'font-semibold' : ''}`}>{labelOf(s.key)}</span>
                  </button>
                );
              })}
            </div>
            {showClusterMsg && (
              <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg bg-[#FFF4ED] border border-[#FFDCC7]">
                <AlertTriangle className="w-4 h-4 text-[#C4552A] shrink-0 mt-0.5" />
                <span className="text-[11.5px] font-semibold text-[#C4552A]">{clusterMsg}</span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F0F4FF] border border-[#D6E0FF]">
            <Info className="w-4 h-4 text-[#375DFC] shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-[#2D3446] leading-relaxed">
              Bộ môn học để nhập điểm kỳ trước: <b>Toán, Ngữ văn, Tiếng Anh, Lịch sử + 4 môn lựa chọn</b>. Môn chuyên đề lưu riêng, không thay thế môn học lựa chọn.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F0F4FF] border border-[#D6E0FF]">
            <Info className="w-4 h-4 text-[#375DFC] shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-[#2D3446] leading-relaxed">
              Bạn chưa có môn học lựa chọn tại THPT. Các thông tin khác trong hồ sơ vẫn được giữ nguyên và lưu lại.
              Khi cần chọn môn, hãy dùng <b>Tư vấn môn học lớp 10</b> để xem các phương án phù hợp.
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <PrimaryButton className="!h-10 !text-[12.5px]" onClick={save} disabled={saveMut.isPending}>
          {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu thông tin
        </PrimaryButton>
        {!hasSubjects && (
          <GhostButton className="!h-10 !text-[12.5px]" onClick={() => navigate('/subjects')}>
            <BookOpen className="w-4 h-4" /> Tư vấn môn học lớp 10
          </GhostButton>
        )}
        <GhostButton className="!h-10 !text-[12.5px]" onClick={() => navigate('/academic')}>
          <NotebookPen className="w-4 h-4" /> Cập nhật điểm
        </GhostButton>
      </div>
    </Card>
  );
}