import React, { useState } from 'react';
import { AlertCircle, Check, Loader2, Plus, Save, X } from 'lucide-react';
import { Card, PrimaryButton, GhostButton } from '@/components/journey/bits';
import { THPT_ELECTIVES, THPT_CLUSTER_SUBJECTS, thptLabel } from '@/lib/thptSubjects';
import { validateSchoolOption, OPTION_ELECTIVE_COUNT, OPTION_CLUSTER_COUNT } from '@/lib/subjectOptions';

function CheckRow({ label, on, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-colors ${on ? 'bg-[#F1F5F9] border-[#2563EB]' : 'bg-white border-[#E2E8F0] hover:border-[#2563EB]'}`}
    >
      <span className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 ${on ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-white border-[#E2E8F0]'}`}>
        {on && <Check className="w-3 h-3 text-white" />}
      </span>
      <span className={`text-[12px] text-[#1E293B] ${on ? 'font-semibold' : ''}`}>{label}</span>
    </button>
  );
}

// Thẻ nhập/sửa một phương án môn học trên phiếu của trường (4/9 môn lựa chọn + 3/13 môn chuyên đề).
export default function SchoolOptionForm({ initial, others = [], onSubmit, onCancel, busy }) {
  const [name, setName] = useState(initial?.name || '');
  const [electives, setElectives] = useState(initial?.electives || []);
  const [cluster, setCluster] = useState(initial?.cluster_subjects || []);
  const [errors, setErrors] = useState([]);

  const toggle = (list, setList, key) =>
    setList(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);

  const submit = () => {
    const candidate = { name, electives, cluster_subjects: cluster };
    const v = validateSchoolOption(candidate, others);
    setErrors(v.errors);
    if (!v.valid) return;
    onSubmit({ name: name.trim(), electives, cluster_subjects: cluster });
  };

  return (
    <Card className="p-5 border-dashed border-2 border-[#E2E8F0]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-[13.5px] font-bold text-[#1E293B]">{initial ? 'Sửa phương án' : '+ Thêm thẻ phương án mới'}</h3>
        {initial && (
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#F1F5F9]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-[12.5px] font-semibold text-[#1E293B] mb-1.5">Tên phương án trên phiếu <span className="text-[#DC2626]">*</span></label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tổ hợp 2"
          className="w-full max-w-sm h-11 px-3 rounded-lg bg-white border border-[#E2E8F0] text-[13px] text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
        />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12.5px] font-semibold text-[#1E293B]">Môn học lựa chọn <span className="text-[#DC2626]">*</span></span>
          <span className={`text-[12px] font-bold tabular-nums ${electives.length === OPTION_ELECTIVE_COUNT ? 'text-[#0F766E]' : 'text-[#DC2626]'}`}>{electives.length}/{OPTION_ELECTIVE_COUNT} môn</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {THPT_ELECTIVES.map((s) => (
            <CheckRow key={s.key} label={thptLabel(s.key)} on={electives.includes(s.key)} onClick={() => toggle(electives, setElectives, s.key)} />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12.5px] font-semibold text-[#1E293B]">Cụm chuyên đề học tập <span className="text-[#DC2626]">*</span></span>
          <span className={`text-[12px] font-bold tabular-nums ${cluster.length === OPTION_CLUSTER_COUNT ? 'text-[#0F766E]' : 'text-[#DC2626]'}`}>{cluster.length}/{OPTION_CLUSTER_COUNT} môn</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {THPT_CLUSTER_SUBJECTS.map((s) => (
            <CheckRow key={s.key} label={thptLabel(s.key)} on={cluster.includes(s.key)} onClick={() => toggle(cluster, setCluster, s.key)} />
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 flex items-start gap-3 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
          <ul className="space-y-0.5">
            {errors.map((e, i) => <li key={i} className="text-[11.5px] font-semibold text-[#B91C1C]">· {e}</li>)}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-2">
        <PrimaryButton onClick={submit} disabled={busy}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : initial ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {initial ? 'Lưu thay đổi' : 'Thêm phương án'}
        </PrimaryButton>
        {initial && <GhostButton onClick={onCancel}>Hủy</GhostButton>}
      </div>
    </Card>
  );
}