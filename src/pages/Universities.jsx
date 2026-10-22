import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAdmissionPrograms, useAdmissionInterests, useUniversities, useSaveAdmissionInterest, useDeleteAdmissionInterest } from '@/lib/useStudentData';
import { buildAdmissionRows } from '@/lib/admissionEngine';
import { pairInterestPayload, pairKey } from '@/lib/targetBuilder';
import PageShell from '@/components/journey/PageShell';
import { Card } from '@/components/journey/bits';
import LookupFilters from '@/components/lookup/LookupFilters';
import AdmissionLookupTable from '@/components/lookup/AdmissionLookupTable';
import SchemeDialog from '@/components/lookup/SchemeDialog';

export default function Universities() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [university, setUniversity] = useState('all');
  const [major, setMajor] = useState('all');
  const [schemeCode, setSchemeCode] = useState(null);
  const [busyKey, setBusyKey] = useState(null);

  const { data: programs, isLoading } = useAdmissionPrograms();
  const { data: universities } = useUniversities();
  const { data: interests } = useAdmissionInterests();
  const saveInterestMut = useSaveAdmissionInterest();
  const deleteInterestMut = useDeleteAdmissionInterest();

  const uniList = universities || [];
  const uniMap = useMemo(() => Object.fromEntries((universities || []).map((u) => [u.code, u])), [universities]);
  const majorList = useMemo(() => {
    const map = new Map();
    (programs || []).forEach((p) => { if (!map.has(p.major_code)) map.set(p.major_code, { code: p.major_code, name: p.major_name }); });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [programs]);

  const rows = useMemo(() => buildAdmissionRows(programs, { university, major, search }), [programs, university, major, search]);
  const hasQuery = search.trim().length > 0 || university !== 'all' || major !== 'all';

  // Danh sách ngành – trường đã quan tâm (chưa kèm phương thức xét tuyển)
  const pairInterests = useMemo(() => (interests || []).filter((i) => !i.method), [interests]);
  const chosenKeys = useMemo(() => new Set(pairInterests.map(pairKey)), [pairInterests]);

  const toggleInterest = async (row) => {
    const existing = pairInterests.find((i) => pairKey(i) === pairKey(row));
    setBusyKey(row.key);
    try {
      if (existing) {
        await deleteInterestMut.mutateAsync(existing.id);
        toast({ title: 'Đã bỏ quan tâm', description: `${row.major_name} — ${row.university_name}` });
      } else {
        await saveInterestMut.mutateAsync(pairInterestPayload(row, 'lookup'));
        toast({ title: 'Đã lưu ngành – trường quan tâm', description: 'Mở trang Định hướng ngành & trường để đề xuất phương thức xét tuyển phù hợp.' });
      }
    } catch (e) {
      toast({ title: 'Lỗi lưu', description: e.message });
    }
    setBusyKey(null);
  };

  if (isLoading) {
    return (
      <PageShell title="Tra cứu tuyển sinh" subtitle="Đang tải...">
        <Card className="p-10 text-center"><div className="flex items-center justify-center gap-2 text-[13px] text-[#667085]"><Loader2 className="w-5 h-5 animate-spin" /> Đang tải dữ liệu tuyển sinh...</div></Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Tra cứu tuyển sinh"
      subtitle="Bảng tổng hợp ngành – trường, tổ hợp môn, lưu quan tâm và xem đề án tuyển sinh của trường."
      note="Bảng tổng hợp chỉ hiển thị sau khi bạn tra cứu. Điểm chuẩn, điều kiện và phân loại phương thức xét tuyển nằm trong trang Tư vấn phương thức xét tuyển."
    >
      <LookupFilters
        title="Bảng tổng hợp ngành – trường"
        subtitle="STT, mã trường, mã ngành, tên ngành, tổ hợp môn và hành động."
        search={search}
        onSearch={setSearch}
        university={university}
        onUniversity={setUniversity}
        major={major}
        onMajor={setMajor}
        uniList={uniList}
        majorList={majorList}
      />

      {hasQuery ? (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12.5px] font-semibold text-[#344054]">
              {rows.length} ngành – trường phù hợp · {pairInterests.length} đã quan tâm
            </div>
          </div>

          <AdmissionLookupTable
            rows={rows}
            uniMap={uniMap}
            chosenKeys={chosenKeys}
            busyKey={busyKey}
            onToggleInterest={toggleInterest}
            onOpenScheme={setSchemeCode}
          />

          <p className="mt-3 text-[11.5px] text-[#D97706] text-center">
            Dữ liệu tuyển sinh hiện là dữ liệu minh họa — học sinh cần tra cứu tại cổng tuyển sinh chính thức của trường.
          </p>
        </>
      ) : (
        <Card className="p-8 text-center">
          <div className="mx-auto w-11 h-11 rounded-xl bg-[#EFF4FF] flex items-center justify-center mb-3">
            <Search className="w-5 h-5 text-[#253B80]" />
          </div>
          <div className="text-[14.5px] font-bold text-[#111827]">Bắt đầu tra cứu ngành – trường bạn quan tâm</div>
          <p className="text-[12.5px] text-[#667085] mt-1.5">Nhập từ khóa hoặc chọn một trường / một ngành để xem bảng tổng hợp.</p>
          {pairInterests.length > 0 && (
            <p className="text-[12px] font-semibold text-[#0D9488] mt-3">
              Bạn đã quan tâm {pairInterests.length} ngành – trường — xem và tư vấn phương thức ở trang Định hướng ngành &amp; trường.
            </p>
          )}
        </Card>
      )}

      {schemeCode && (
        <SchemeDialog
          university={uniMap[schemeCode]}
          programs={programs}
          onClose={() => setSchemeCode(null)}
        />
      )}
    </PageShell>
  );
}