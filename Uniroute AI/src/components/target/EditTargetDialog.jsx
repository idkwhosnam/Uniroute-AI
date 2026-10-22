import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { SUBJECT_LABELS, CERT_TYPES, certToTen, r1 } from '@/data/engine';
import { PrimaryButton, GhostButton } from '@/components/journey/bits';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// Chỉnh sửa mục tiêu: nhãn Dream/Match/Safe + điểm mục tiêu theo đúng thang đo của phương thức.
export default function EditTargetDialog({ target, onClose, patch, addLog }) {
  const { toast } = useToast();
  const [label, setLabel] = useState(target.label);
  const isCert = target.methodId === 'kthop';
  const [score, setScore] = useState(String(target.targetScore));
  const [certScore, setCertScore] = useState(isCert ? String(target.certScore ?? target.benchmark ?? 5.5) : '');
  const [cultureScores, setCultureScores] = useState({ ...(target.cultureScores || {}) });
  const certMeta = CERT_TYPES.find((x) => x.type === (target.certType || 'IELTS'));

  const floor = target.benchmark ?? 5.5;
  const belowFloor = isCert && certScore !== '' && Number(certScore) < floor;
  const previewTotal = isCert
    ? r1(Object.values(cultureScores).reduce((n, v) => n + (Number(v) || 0), 0) + certToTen(certMeta.type, Number(certScore) || 0))
    : null;

  const save = () => {
    if (isCert) {
      let cert = Number(certScore);
      if (certScore === '' || Number.isNaN(cert)) cert = floor;
      if (cert < certMeta.min || cert > certMeta.max) {
        toast({ title: `Điểm ${certMeta.type} chưa hợp lệ`, description: certMeta.note });
        return;
      }
      let adjusted = false;
      if (cert < floor) { cert = floor; adjusted = true; }
      const culture = Object.entries(cultureScores).filter(([, v]) => Number(v) > 0 && Number(v) <= 10);
      if (!culture.length) {
        toast({ title: 'Nhập điểm mục tiêu môn văn hóa', description: 'Phương thức kết hợp yêu cầu điểm các môn văn hóa (thang 10).' });
        return;
      }
      const converted = r1(culture.reduce((n, [, v]) => n + Number(v), 0) + certToTen(certMeta.type, cert));
      patch((st) => ({
        ...st,
        targets: st.targets.map((t) => t.id === target.id
          ? { ...t, label, certScore: cert, cultureScores: Object.fromEntries(culture.map(([k, v]) => [k, Number(v)])), targetScore: converted }
          : t),
      }));
      toast(adjusted
        ? { title: `Đã tự điều chỉnh chứng chỉ lên ${floor}`, description: 'Mục tiêu không được thấp hơn điều kiện sàn của phương thức.' }
        : { title: 'Đã cập nhật mục tiêu' });
    } else {
      const v = Number(score);
      if (!v || v <= 0 || v > 30) {
        toast({ title: 'Điểm mục tiêu chưa hợp lệ', description: 'Nhập trong khoảng 1–30.' });
        return;
      }
      patch((st) => ({ ...st, targets: st.targets.map((t) => t.id === target.id ? { ...t, label, targetScore: r1(v) } : t) }));
      toast({ title: 'Đã cập nhật mục tiêu' });
    }
    addLog('target', `Chỉnh sửa mục tiêu ${target.uniShort} — ${target.majorName}`);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa mục tiêu xét tuyển</DialogTitle>
          <DialogDescription>
            {target.uniName} — {target.majorName} · {target.methodLabel}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Nhãn mục tiêu</label>
            <div className="flex gap-2">
              {['Dream', 'Match', 'Safe'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLabel(l)}
                  className={`flex-1 h-10 rounded-lg text-[12.5px] font-semibold border transition-colors ${label === l ? 'bg-[#253B80] text-white border-[#253B80]' : 'bg-white text-[#344054] border-[#E4E7EC] hover:border-[#253B80]'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          {isCert ? (
            <>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Mục tiêu chứng chỉ ({certMeta.type})</label>
                <input
                  type="number" min={certMeta.min} max={certMeta.max} step={certMeta.step}
                  value={certScore}
                  onChange={(e) => setCertScore(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] tabular-nums focus:outline-none focus:border-[#253B80]"
                />
                {belowFloor && (
                  <p className="mt-2 p-2 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[11.5px] font-medium text-[#B91C1C]">
                    ⚠️ Dưới điều kiện sàn: trường yêu cầu tối thiểu {floor} {certMeta.type} — hệ thống sẽ tự điều chỉnh lên {floor}.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Điểm môn văn hóa (thang 10)</label>
                <div className="space-y-2">
                  {Object.entries(cultureScores).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4">
                      <span className="text-[12.5px] text-[#344054]">{SUBJECT_LABELS[k]}</span>
                      <input
                        type="number" min="0" max="10" step="0.25"
                        value={v}
                        onChange={(e) => setCultureScores({ ...cultureScores, [k]: Number(e.target.value) })}
                        className="w-20 h-9 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] tabular-nums focus:outline-none focus:border-[#253B80]"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] text-[12px] font-medium text-[#4338CA]">
                {certMeta.type} {certScore || floor} ➔ Quy đổi {certToTen(certMeta.type, Number(certScore) || floor)}/10 môn Tiếng Anh · Tổng quy đổi mới: <b>{previewTotal}/30</b>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Điểm mục tiêu tổng (demo, 0–30)</label>
              <input
                type="number" min="1" max="30" step="0.25"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] tabular-nums focus:outline-none focus:border-[#253B80]"
              />
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <GhostButton onClick={onClose}>Hủy</GhostButton>
          <PrimaryButton onClick={save}>Lưu thay đổi</PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}