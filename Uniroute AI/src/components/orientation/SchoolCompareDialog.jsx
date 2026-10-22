import React from 'react';
import { MapPin, Check, FileText, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { GhostButton, PrimaryButton } from '@/components/journey/bits';
import { METHOD_SHORT } from '@/lib/admissionEngine';
import { FIT_LABELS } from '@/lib/orientationEngine';

// So sánh các trường đào tạo cùng một ngành (không so sánh phương thức xét tuyển).
// Học sinh chốt 1 phương án ngành – trường rồi chuyển sang trang Tư vấn phương thức xét tuyển.
export default function SchoolCompareDialog({
  major, items, durationYears, hasDeclared, pickCode, onPick, onAdvise, onOpenScheme, onClose,
}) {
  const list = items || [];

  const rows = [
    { label: 'Ngành đào tạo', value: () => major?.name || '—' },
    {
      label: 'Điểm chuẩn gần nhất',
      value: (it) => (it.best.program.benchmark_score != null
        ? `${it.best.program.benchmark_score}/${it.best.program.benchmark_scale || 30} · năm ${it.best.program.benchmark_year || it.best.program.year}`
        : 'Chưa công bố'),
    },
    { label: 'Học phí', value: (it) => (it.best.program.tuition != null ? `${it.best.program.tuition} triệu/năm` : 'Chưa công bố') },
    { label: 'Thời gian đào tạo', value: () => `${durationYears || 4} năm` },
    {
      label: 'Tổ hợp xét tuyển',
      value: (it) => {
        const combos = [...it.matchedCombos, ...it.otherCombos];
        return combos.length ? combos.join(', ') : 'Không dùng tổ hợp cố định';
      },
    },
    {
      label: 'Đối chiếu môn THPT của bạn',
      value: (it) => (it.matchedCombos.length
        ? `Trùng môn đã khai báo: ${it.matchedCombos.join(', ')}`
        : hasDeclared
          ? 'Chưa có tổ hợp nào trùng hoàn toàn môn đã khai báo'
          : 'Chưa khai báo môn học lựa chọn THPT'),
    },
    {
      label: 'Phương thức xét tuyển hiện có',
      value: (it) => it.programs.map((e) => METHOD_SHORT[e.program.method] || e.program.method_label || e.program.method).join(' · '),
    },
    {
      label: 'Mức độ phù hợp với hồ sơ',
      value: (it) => `${it.best.score}/100 — ${FIT_LABELS[it.best.level] || ''}`,
    },
    { label: 'Địa điểm', value: (it) => it.university?.district || 'Chưa có địa điểm' },
  ];

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>So sánh trường — {major?.name || 'ngành đã chọn'}</DialogTitle>
          <DialogDescription>
            Đối chiếu {list.length} trường đào tạo ngành này theo điểm chuẩn, học phí, tổ hợp môn và mức độ phù hợp với hồ sơ của bạn.
            Phương thức xét tuyển chi tiết được tư vấn ở bước tiếp theo.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-[#E4E7EC] overflow-x-auto">
          <table className="w-full text-[11.5px] table-fixed">
            <thead>
              <tr className="bg-[#EFF4FF] text-left align-top">
                <th className="px-3 py-2.5 w-[140px] font-semibold text-[#344054]">Tiêu chí</th>
                {list.map((it) => {
                  const picked = it.university_code === pickCode;
                  return (
                    <th key={it.university_code} className={`px-3 py-2.5 align-top ${picked ? 'bg-[#E0E7FF]' : ''}`}>
                      <div className="text-[12.5px] font-bold text-[#111827] leading-tight">{it.university_name}</div>
                      <div className="flex items-center gap-1 text-[10.5px] text-[#667085] mt-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">Mã {String(it.university_code).toUpperCase()}</span>
                      </div>
                      <button
                        onClick={() => onPick(it.university_code)}
                        className={`mt-2 w-full h-8 rounded-lg text-[10.5px] font-semibold transition-colors ${picked ? 'bg-[#253B80] text-white' : 'bg-white border border-[#C7D2FE] text-[#253B80] hover:bg-[#F5F7FF]'}`}
                      >
                        {picked ? <><Check className="w-3 h-3 inline mr-1" />Đã chọn phương án này</> : 'Chọn phương án này'}
                      </button>
                      <button
                        onClick={() => onOpenScheme(it.university_code)}
                        className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#253B80] hover:underline"
                      >
                        <FileText className="w-3 h-3" /> Đề án tuyển sinh
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-[#E4E7EC] align-top">
                  <td className="px-3 py-2.5 font-semibold text-[#344054] bg-[#FAFBFC]">{r.label}</td>
                  {list.map((it) => (
                    <td key={it.university_code} className={`px-3 py-2.5 leading-relaxed text-[#424242] ${it.university_code === pickCode ? 'bg-[#F8FAFF]' : ''}`}>
                      {r.value(it)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter className="flex flex-wrap items-center justify-between gap-2 sm:justify-between">
          <span className="text-[11.5px] text-[#667085]">Chọn 1 phương án ngành – trường để chuyển sang tư vấn phương thức xét tuyển.</span>
          <div className="flex items-center gap-2">
            <GhostButton onClick={onClose}>Đóng</GhostButton>
            <PrimaryButton disabled={!pickCode} onClick={() => onAdvise(pickCode)}>
              Tư vấn phương thức xét tuyển <ArrowRight className="w-3.5 h-3.5" />
            </PrimaryButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}