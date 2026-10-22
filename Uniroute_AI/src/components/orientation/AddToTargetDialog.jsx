import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useSaveAdmissionTarget } from '@/lib/useStudentData';
import { validateTarget, METHOD_LABELS } from '@/lib/admissionEngine';
import { targetPayloadFromPlan } from '@/lib/targetBuilder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { GhostButton, PrimaryButton } from '@/components/journey/bits';

export default function AddToTargetDialog({ plan, onClose, onSaved }) {
  const { toast } = useToast();
  const saveTargetMut = useSaveAdmissionTarget();
  const [label, setLabel] = useState('Match');
  const [score, setScore] = useState(String(plan.benchmark_score ?? ''));

  const save = async () => {
    const payload = targetPayloadFromPlan(plan, { label, targetScore: score });
    const { valid, errors } = validateTarget(payload, plan);
    if (!valid) { toast({ title: 'Mục tiêu không hợp lệ', description: errors.join('; ') }); return; }
    try {
      await saveTargetMut.mutateAsync(payload);
      toast({ title: 'Đã thêm vào mục tiêu xét tuyển' });
      onSaved?.();
      onClose();
    } catch (e) {
      toast({ title: 'Lỗi lưu', description: e.message });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo mục tiêu xét tuyển</DialogTitle>
          <DialogDescription>
            {plan.university_name} — {plan.major_name} · {plan.method_label || METHOD_LABELS[plan.method]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Nhãn mục tiêu</label>
            <div className="flex gap-2">
              {['Dream', 'Match', 'Safe'].map((l) => (
                <button key={l} onClick={() => setLabel(l)} className={`flex-1 h-10 rounded-lg text-[12.5px] font-semibold border transition-colors ${label === l ? 'bg-[#253B80] text-white border-[#253B80]' : 'bg-white text-[#344054] border-[#E4E7EC] hover:border-[#253B80]'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Điểm mục tiêu (thang {plan.benchmark_scale || 30})</label>
            <input type="number" min="0" max={plan.benchmark_scale || 30} step="0.25" className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] tabular-nums" value={score} onChange={(e) => setScore(e.target.value)} />
            <p className="text-[11px] text-[#98A2B3] mt-1">Điểm chuẩn tham khảo: {plan.benchmark_score}/{plan.benchmark_scale} (năm {plan.benchmark_year || plan.year})</p>
          </div>
          <div className="p-2.5 rounded-lg bg-[#EFF4FF] border border-[#D6E0FF] text-[11.5px] text-[#253B80]">
            Sau khi lưu, mục tiêu dùng cho phân tích khoảng cách và lập kế hoạch ôn tập.
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <GhostButton onClick={onClose}>Hủy</GhostButton>
          <PrimaryButton onClick={save} disabled={saveTargetMut.isPending}>
            {saveTargetMut.isPending ? 'Đang lưu...' : 'Lưu mục tiêu'}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}