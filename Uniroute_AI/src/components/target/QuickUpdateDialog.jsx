import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SUBJECTS } from '@/data/mockData';
import { CERT_TYPES } from '@/data/engine';
import { PrimaryButton, GhostButton } from '@/components/journey/bits';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// Widget cập nhật nhanh điểm chứng chỉ + điểm thi thử ngay trên trang Mục tiêu.
// Sau khi lưu, AI tính lại khoảng cách của toàn bộ mục tiêu và lộ trình 12 tuần.
export default function QuickUpdateDialog({ open, onClose, patch, addLog, onSaved }) {
  const { toast } = useToast();
  const [certType, setCertType] = useState('IELTS');
  const [certScore, setCertScore] = useState('');
  const [mockScores, setMockScores] = useState({});
  const certMeta = CERT_TYPES.find((x) => x.type === certType);

  const save = () => {
    const hasCert = certScore !== '' && !Number.isNaN(Number(certScore));
    const cleanMock = {};
    SUBJECTS.forEach((sub) => {
      const v = mockScores[sub.key];
      if (v !== '' && v != null && !Number.isNaN(Number(v))) cleanMock[sub.key] = Number(v);
    });
    const hasMock = Object.keys(cleanMock).length > 0;
    if (!hasCert && !hasMock) {
      toast({ title: 'Chưa nhập giá trị nào', description: 'Nhập điểm chứng chỉ hoặc điểm thi thử để cập nhật.' });
      return;
    }
    if (hasCert && (Number(certScore) < certMeta.min || Number(certScore) > certMeta.max)) {
      toast({ title: `Điểm ${certType} chưa hợp lệ`, description: certMeta.note });
      return;
    }
    patch((st) => {
      let certificates = st.certificates || [];
      if (hasCert) certificates = [...certificates, { id: `cert_${Date.now()}`, type: certType, score: Number(certScore), date: new Date().toISOString() }];
      let academic = st.academic;
      if (hasMock) {
        const cards = (st.academic.cards || []).slice();
        if (cards.length) {
          cards[cards.length - 1] = { ...cards[cards.length - 1], scores: { ...cards[cards.length - 1].scores, ...cleanMock }, savedAt: new Date().toISOString() };
        } else {
          cards.push({ id: `c_${Date.now()}`, label: 'Điểm thi thử mới nhất', scores: cleanMock, savedAt: new Date().toISOString() });
        }
        const latest = cards[cards.length - 1];
        academic = { ...st.academic, cards, current: latest.scores, previous: cards.length > 1 ? cards[cards.length - 2].scores : {} };
      }
      return { ...st, certificates, academic };
    });
    addLog('quickupdate', hasCert && hasMock
      ? `Cập nhật nhanh: ${certType} ${certScore} + điểm thi thử`
      : hasCert ? `Cập nhật nhanh: ${certType} ${certScore}` : 'Cập nhật nhanh điểm thi thử');
    setCertScore('');
    setMockScores({});
    onClose();
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>⚡ Cập nhật nhanh Điểm & Chứng chỉ hiện tại</DialogTitle>
          <DialogDescription>
            Nhập điểm chứng chỉ mới nhất hoặc điểm thi thử — AI sẽ tính lại khoảng cách của toàn bộ mục tiêu và lộ trình 12 tuần ngay sau đó.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Chứng chỉ mới nhất</label>
            <div className="flex gap-2">
              <select
                value={certType}
                onChange={(e) => { setCertType(e.target.value); setCertScore(''); }}
                className="flex-1 h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] focus:outline-none focus:border-[#253B80]"
              >
                {CERT_TYPES.map((x) => <option key={x.type} value={x.type}>{x.type}</option>)}
              </select>
              <input
                type="number" min={certMeta.min} max={certMeta.max} step={certMeta.step} placeholder="Điểm"
                value={certScore}
                onChange={(e) => setCertScore(e.target.value)}
                className="w-24 h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] tabular-nums focus:outline-none focus:border-[#253B80]"
              />
            </div>
            <p className="text-[11px] text-[#98A2B3] mt-1">{certMeta.note} · để trống nếu không cập nhật</p>
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Điểm thi thử mới nhất (thang 10)</label>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map((sub) => (
                <div key={sub.key} className="flex items-center gap-2">
                  <span className="text-[12px] text-[#667085] w-24 shrink-0 truncate">{sub.label}</span>
                  <input
                    type="number" min="0" max="10" step="0.1"
                    value={mockScores[sub.key] ?? ''}
                    onChange={(e) => setMockScores({ ...mockScores, [sub.key]: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-lg bg-white border border-[#E4E7EC] text-[12.5px] tabular-nums focus:outline-none focus:border-[#253B80]"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#98A2B3] mt-1">Chỉ nhập các môn có bài thi thử — còn lại để trống.</p>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <GhostButton onClick={onClose}>Đóng</GhostButton>
          <PrimaryButton onClick={save}><Zap className="w-4 h-4" /> Lưu &amp; tính lại bằng AI</PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}