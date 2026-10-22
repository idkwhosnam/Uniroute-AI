import React, { useState } from 'react';
import { Award, Plus, Trash2, Save, X, Loader2, Pencil } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useStudentProfile, useSaveStudentProfile } from '@/lib/useStudentData';
import { CERT_TYPES, certMeta } from '@/lib/certifications';
import { Card, Chip, PrimaryButton, GhostButton } from '@/components/journey/bits';

// Nhập điểm chứng chỉ IELTS / SAT / HSA — lưu vào Hồ sơ của tôi (StudentProfile).
export default function CertificationForm({ className = '' }) {
  const { toast } = useToast();
  const { data: profile, isLoading } = useStudentProfile();
  const saveMut = useSaveStudentProfile();
  const [form, setForm] = useState(null);

  const list = profile?.certifications || [];

  const openAdd = (type = 'ielts') => {
    const m = certMeta(type);
    setForm({ idx: null, type, score: '', scale: m.scale, date: '', note: '' });
  };

  const openEdit = (cert, idx) => {
    const m = certMeta(cert.type);
    setForm({ idx, type: cert.type, score: cert.score, scale: cert.scale || m.scale, date: cert.date || '', note: cert.note || '' });
  };

  const save = async () => {
    if (!profile) { toast({ title: 'Chưa có hồ sơ', description: 'Hoàn tất Hồ sơ của tôi trước khi lưu điểm chứng chỉ.' }); return; }
    const m = certMeta(form.type);
    const num = Number(form.score);
    if (form.score === '' || Number.isNaN(num)) { toast({ title: 'Nhập điểm chứng chỉ' }); return; }
    if (num < m.min || num > m.scale) { toast({ title: 'Điểm không hợp lệ', description: `${m.label}: ${m.hint}.` }); return; }

    const entry = {
      type: form.type,
      label: m.label,
      score: num,
      scale: Number(form.scale),
      date: form.date || null,
      note: form.note || null,
    };
    // Mỗi loại chứng chỉ lưu một mức điểm mới nhất
    const next = form.idx == null
      ? [...list.filter((c) => c.type !== form.type), entry]
      : list.map((c, i) => (i === form.idx ? entry : c));

    try {
      await saveMut.mutateAsync({ id: profile.id, data: { certifications: next } });
      toast({ title: 'Đã lưu điểm chứng chỉ', description: `Đồng bộ vào Hồ sơ của tôi: ${m.label} ${num}.` });
      setForm(null);
    } catch (e) {
      toast({ title: 'Lỗi lưu', description: e.message });
    }
  };

  const remove = async (idx) => {
    if (!profile) return;
    try {
      await saveMut.mutateAsync({ id: profile.id, data: { certifications: list.filter((_, i) => i !== idx) } });
      toast({ title: 'Đã xóa chứng chỉ' });
    } catch (e) {
      toast({ title: 'Lỗi xóa', description: e.message });
    }
  };

  const m = form ? certMeta(form.type) : null;

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-[14.5px] font-bold text-[#111827] flex items-center gap-2">
          <Award className="w-4 h-4 text-[#253B80]" /> Chứng chỉ ngoại ngữ & đánh giá năng lực
        </h2>
        {!form && (
          <PrimaryButton className="!h-9 !px-3.5 !text-[12px]" onClick={() => openAdd('ielts')}>
            <Plus className="w-4 h-4" /> Thêm chứng chỉ
          </PrimaryButton>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-[12.5px] text-[#667085] py-2"><Loader2 className="w-4 h-4 animate-spin" /> Đang tải...</div>
      ) : list.length === 0 ? (
        <p className="text-[12.5px] text-[#667085]">Chưa có chứng chỉ nào. Nhập IELTS, SAT hoặc điểm đánh giá năng lực (HSA/TSA) để dùng cho phương thức xét tuyển chứng chỉ.</p>
      ) : (
        <div className="space-y-2">
          {list.map((cert, i) => (
            <div key={`${cert.type}-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-[#F7F8FC] border border-[#E4E7EC]">
              <Chip tone="teal">{certMeta(cert.type).label}</Chip>
              <span className="text-[13px] font-bold text-[#111827] tabular-nums">
                {cert.score}<span className="text-[11px] text-[#98A2B3] font-medium">/{cert.scale || certMeta(cert.type).scale}</span>
              </span>
              {cert.date && <span className="text-[11.5px] text-[#667085]">{new Date(cert.date).toLocaleDateString('vi-VN')}</span>}
              {cert.note && <span className="text-[11.5px] text-[#98A2B3] truncate">{cert.note}</span>}
              <span className="flex-1" />
              <button onClick={() => openEdit(cert, i)} className="w-8 h-8 rounded-lg bg-white border border-[#E4E7EC] flex items-center justify-center text-[#667085] hover:bg-[#EFF4FF]" title="Sửa">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => remove(i)} className="w-8 h-8 rounded-lg bg-white border border-[#E4E7EC] flex items-center justify-center text-[#B91C1C] hover:bg-[#FEF2F2]" title="Xóa">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="mt-4 p-4 rounded-xl border border-[#253B80]/30 bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-bold text-[#111827]">{form.idx == null ? 'Thêm chứng chỉ' : 'Sửa điểm chứng chỉ'}</span>
            <button onClick={() => setForm(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#667085] hover:bg-[#F7F8FC]"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#344054] mb-1.5">Loại chứng chỉ</label>
              <select
                className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] focus:outline-none focus:border-[#253B80]"
                value={form.type}
                onChange={(e) => { const nt = certMeta(e.target.value); setForm({ ...form, type: e.target.value, scale: nt.scale }); }}
              >
                {CERT_TYPES.map((c) => <option key={c.key} value={c.key}>{c.label} ({c.hint})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#344054] mb-1.5">Điểm</label>
              <input
                type="number" min={m.min} max={m.scale} step={m.step}
                className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] tabular-nums focus:outline-none focus:border-[#253B80]"
                value={form.score} placeholder={m.hint}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#344054] mb-1.5">Ngày thi</label>
              <input type="date" className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] focus:outline-none focus:border-[#253B80]"
                value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#344054] mb-1.5">Ghi chú</label>
              <input className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] focus:outline-none focus:border-[#253B80]"
                value={form.note} placeholder="Ví dụ: thi tại BC" onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton className="!h-9 !px-3.5 !text-[12px]" onClick={save} disabled={saveMut.isPending}>
              <Save className="w-4 h-4" /> Lưu & đồng bộ hồ sơ
            </PrimaryButton>
            <GhostButton className="!h-9 !px-3.5 !text-[12px]" onClick={() => setForm(null)}>Hủy</GhostButton>
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] text-[#98A2B3]">Điểm chứng chỉ được lưu trong <b>Hồ sơ của tôi</b> và dùng cho phương thức xét tuyển bằng chứng chỉ (IELTS/SAT/ĐGNL). Mỗi loại chứng chỉ lưu một mức điểm mới nhất.</p>
    </Card>
  );
}