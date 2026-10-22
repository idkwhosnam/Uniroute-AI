import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Chip, GhostButton } from '@/components/journey/bits';
import { METHOD_LABELS, METHOD_ORDER } from '@/lib/admissionEngine';

// Đề án tuyển sinh của một trường: ngành đào tạo, phương thức xét tuyển, chỉ tiêu, học phí, điểm chuẩn tham khảo
export default function SchemeDialog({ university, programs, onClose }) {
  const navigate = useNavigate();
  const uniPrograms = useMemo(
    () => (programs || []).filter((p) => p.university_code === university?.code),
    [programs, university],
  );

  const majors = useMemo(() => {
    const map = new Map();
    uniPrograms.forEach((p) => {
      const cur = map.get(p.major_code) || { code: p.major_code, name: p.major_name, combinations: [], methods: [], benchmark: null, year: null };
      if (p.combination && (p.combination_subjects || []).length && !cur.combinations.includes(p.combination)) cur.combinations.push(p.combination);
      if (!cur.methods.includes(p.method)) cur.methods.push(p.method);
      if (!cur.year || p.year > cur.year) { cur.year = p.year; cur.benchmark = p.benchmark_score != null ? `${p.benchmark_score}/${p.benchmark_scale}` : '—'; }
      map.set(p.major_code, cur);
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [uniPrograms]);

  const methods = useMemo(() => METHOD_ORDER
    .map((m) => {
      const list = uniPrograms.filter((p) => p.method === m);
      if (!list.length) return null;
      const latest = list.reduce((acc, p) => (!acc || p.year > acc.year ? p : acc), null);
      return {
        key: m,
        label: METHOD_LABELS[m],
        majorCount: new Set(list.map((p) => p.major_code)).size,
        combination: latest?.combination || '—',
        note: latest?.conditions || '',
      };
    })
    .filter(Boolean), [uniPrograms]);

  const quota = uniPrograms.reduce((max, p) => Math.max(max, p.quota || 0), 0);
  const tuitions = uniPrograms.map((p) => p.tuition).filter((t) => t != null);
  const tuitionText = tuitions.length ? `${Math.min(...tuitions)}–${Math.max(...tuitions)} triệu/năm` : 'Chưa công bố';
  const source = uniPrograms.find((p) => p.source_name)?.source_name;
  const years = [...new Set(uniPrograms.map((p) => p.year))].sort((a, b) => b - a);

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đề án tuyển sinh — {university?.name || 'Trường đại học'}</DialogTitle>
          <DialogDescription>
            Mã trường {university?.code?.toUpperCase()} · {university?.district || 'Chưa có địa điểm'} · Năm {years[0] || '—'}
            {university?.website && (
              <a href={university.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[#253B80] hover:underline ml-2">
                Website trường <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-[11.5px] font-bold uppercase tracking-wide text-[#98A2B3] mb-2">Phương thức xét tuyển ({methods.length})</div>
            <div className="space-y-2">
              {methods.map((m) => (
                <div key={m.key} className="p-3 rounded-lg border border-[#E4E7EC] bg-[#F9FAFB]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[12.5px] font-bold text-[#111827]">{m.label}</span>
                    <Chip tone="gray">{m.majorCount} ngành</Chip>
                    <Chip tone="blue">Tổ hợp {m.combination}</Chip>
                  </div>
                  {m.note && <p className="text-[11.5px] text-[#667085] mt-1 leading-relaxed">{m.note}</p>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11.5px] font-bold uppercase tracking-wide text-[#98A2B3] mb-2">Ngành đào tạo ({majors.length})</div>
            <div className="rounded-lg border border-[#E4E7EC] divide-y divide-[#E4E7EC]">
              {majors.map((mj) => (
                <div key={mj.code} className="px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] text-[#667085] uppercase">{mj.code}</span>
                    <span className="text-[12.5px] font-semibold text-[#111827] ml-2">{mj.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#667085]">
                    {mj.combinations.length > 0 && <span>Tổ hợp {mj.combinations.join(', ')}</span>}
                    <span>· Điểm chuẩn {mj.year}: {mj.benchmark}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-[#E4E7EC] bg-white">
              <div className="text-[11.5px] font-bold uppercase tracking-wide text-[#98A2B3] mb-1">Chỉ tiêu & học phí</div>
              <div className="text-[12.5px] text-[#344054]">Chỉ tiêu cao nhất: <b className="text-[#111827]">{quota || '—'}</b></div>
              <div className="text-[12.5px] text-[#344054]">Học phí: <b className="text-[#111827]">{tuitionText}</b></div>
            </div>
            <div className="p-3 rounded-lg border border-[#E4E7EC] bg-white">
              <div className="text-[11.5px] font-bold uppercase tracking-wide text-[#98A2B3] mb-1">Nguồn dữ liệu</div>
              <div className="text-[12.5px] text-[#344054]">{source || 'Chưa có nguồn xác thực'}</div>
              <div className="text-[11px] text-[#98A2B3] mt-0.5">Năm dữ liệu: {years.join(', ') || '—'}</div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]">
            <Info className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
            <span className="text-[11.5px] text-[#92400E] leading-relaxed">
              Đề án trong prototype là dữ liệu minh họa, không thay thế đề án chính thức. Học sinh cần đối chiếu điều kiện, chỉ tiêu và thời hạn trên cổng tuyển sinh của trường.
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-wrap gap-2">
          <GhostButton onClick={onClose}>Đóng</GhostButton>
          <GhostButton onClick={() => navigate(`/admission-plan/${university?.code}`)}>
            Xem đề án chi tiết <ExternalLink className="w-3.5 h-3.5" />
          </GhostButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}