import React, { useState } from 'react';
import { Info, Pencil, Plus, Trash2 } from 'lucide-react';
import { Chip, GhostButton } from '@/components/journey/bits';
import SchoolOptionForm from './SchoolOptionForm';
import { thptLabel } from '@/lib/thptSubjects';
import { OPTION_ELECTIVE_COUNT, OPTION_CLUSTER_COUNT } from '@/lib/subjectOptions';

// Danh mục phương án môn học do trường cung cấp — dùng chung cho NV02 (tư vấn lớp 10) và NV03 (điều chỉnh).
export default function SchoolOptionsEditor({ options = [], onAdd, onUpdate, onDelete, busy }) {
  const [formMode, setFormMode] = useState(null); // null | 'new' | id đang sửa
  const [confirmId, setConfirmId] = useState(null);
  const editing = formMode && formMode !== 'new' ? options.find((o) => o.id === formMode) : null;
  const closeForm = () => setFormMode(null);

  const handleSubmit = async (data) => {
    if (editing) await onUpdate(editing.id, data);
    else await onAdd(data);
    closeForm();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="text-[13.5px] font-bold text-[#1E293B]">Các phương án do trường cung cấp</h3>
        <span className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-[11px] font-bold">{options.length} phương án</span>
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] mb-4">
        <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-[#1E293B] leading-relaxed">
          Mỗi phương án gồm {OPTION_ELECTIVE_COUNT} môn học lựa chọn và {OPTION_CLUSTER_COUNT} môn thuộc cụm chuyên đề học tập.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((o, i) => (
          editing?.id === o.id ? (
            <SchoolOptionForm
              key={o.id}
              initial={editing}
              others={options.filter((x) => x.id !== o.id)}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              busy={busy}
            />
          ) : (
            <div key={o.id} className="p-4 rounded-xl bg-white border border-[#E2E8F0]">
              <div className="flex items-start justify-between gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-[10.5px] font-bold uppercase tracking-wide text-[#6B7280]">
                  Phương án {i + 1}
                </span>
                <div className="flex items-center gap-2">
                  <GhostButton className="!h-8 !px-3 !text-[11.5px]" onClick={() => { setConfirmId(null); setFormMode(o.id); }}>
                    <Pencil className="w-3.5 h-3.5" /> Sửa
                  </GhostButton>
                  {confirmId === o.id ? (
                    <GhostButton className="!h-8 !px-3 !text-[11.5px] !text-[#B91C1C] !border-[#FECACA]" onClick={() => { onDelete(o.id); setConfirmId(null); }}>
                      Xác nhận xóa?
                    </GhostButton>
                  ) : (
                    <GhostButton className="!h-8 !px-3 !text-[11.5px] !text-[#B91C1C]" onClick={() => setConfirmId(o.id)}>
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </GhostButton>
                  )}
                </div>
              </div>
              <div className="mt-3 text-[14px] font-bold text-[#1E293B]">{o.name}</div>
              <div className="mt-2 text-[11.5px] font-semibold text-[#6B7280]">Môn học lựa chọn ({OPTION_ELECTIVE_COUNT}):</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(o.electives || []).map((k) => <Chip key={k} tone="gray">{thptLabel(k)}</Chip>)}
              </div>
              <div className="mt-2.5 text-[11.5px] font-semibold text-[#6B7280]">Cụm chuyên đề học tập ({OPTION_CLUSTER_COUNT}):</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(o.cluster_subjects || []).map((k) => <Chip key={k} tone="teal">{thptLabel(k)}</Chip>)}
              </div>
            </div>
          )
        ))}

        {formMode === 'new' ? (
          <SchoolOptionForm others={options} onSubmit={handleSubmit} onCancel={closeForm} busy={busy} />
        ) : (
          <button
            onClick={() => { setConfirmId(null); setFormMode('new'); }}
            className="w-full h-12 rounded-xl border-2 border-dashed border-[#CBD5E1] text-[13px] font-semibold text-[#2563EB] hover:bg-[#F8FAFC] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Thêm mới danh mục phương án môn học
          </button>
        )}
      </div>
    </div>
  );
}