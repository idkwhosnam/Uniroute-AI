import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { useUniversities, useAdmissionPrograms, useSubjects } from '@/lib/useStudentData';
import PageShell from '@/components/journey/PageShell';
import { Card, Chip, DemoBadge } from '@/components/journey/bits';
import { QUYCHE, QUY_DOI_TABLE, KET_HOP_METHODS, Utxt_CATEGORIES } from '@/data/admissionPlanMock';

function getMainSubjectNote(program, subjectMap) {
  if (program.conditions) return program.conditions;
  const subs = program.combination_subjects || [];
  if (!subs.length) return '';
  const label = subjectMap[subs[0]] || subs[0];
  return `Môn chính: ${label}`;
}

export default function AdmissionPlan() {
  const { uniCode } = useParams();
  const [majorSearch, setMajorSearch] = useState('');

  const { data: universities } = useUniversities();
  const { data: programs, isLoading } = useAdmissionPrograms();
  const { data: subjects } = useSubjects();

  const university = useMemo(() => (universities || []).find((u) => u.code === uniCode), [universities, uniCode]);
  const uniPrograms = useMemo(() => (programs || []).filter((p) => p.university_code === uniCode), [programs, uniCode]);

  const subjectMap = useMemo(() => {
    const m = {};
    (subjects || []).forEach((s) => { m[s.key] = s.label; });
    return m;
  }, [subjects]);

  const filtered = useMemo(() => {
    if (!majorSearch) return uniPrograms;
    const s = majorSearch.toLowerCase();
    return uniPrograms.filter((p) => `${p.major_name} ${p.major_code} ${p.combination || ''}`.toLowerCase().includes(s));
  }, [uniPrograms, majorSearch]);

  const byMethod = useMemo(() => {
    const g = { thpt: [], aptitude: [], cert: [], combo: [] };
    filtered.forEach((p) => { if (g[p.method]) g[p.method].push(p); });
    return g;
  }, [filtered]);

  const renderTable = (items) => {
    if (!items.length) return <p className="text-[12px] text-[#667085] italic px-1">Chưa có dữ liệu ngành cho phương thức này.</p>;
    return (
      <div className="overflow-x-auto rounded-lg border border-[#E4E7EC]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#F7F8FC] text-[#667085] text-left">
              <th className="px-3 py-2 font-semibold w-12">STT</th>
              <th className="px-3 py-2 font-semibold">Mã ngành</th>
              <th className="px-3 py-2 font-semibold">Tên ngành</th>
              <th className="px-3 py-2 font-semibold">Tổ hợp</th>
              <th className="px-3 py-2 font-semibold">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p, i) => (
              <tr key={p.id} className="border-t border-[#E4E7EC]">
                <td className="px-3 py-2 text-[#667085]">{i + 1}</td>
                <td className="px-3 py-2 font-mono text-[#111827]">{p.major_code}</td>
                <td className="px-3 py-2 text-[#111827]">{p.major_name}</td>
                <td className="px-3 py-2">{p.combination ? <Chip tone="blue">{p.combination}</Chip> : '—'}</td>
                <td className="px-3 py-2 text-[#667085]">{getMainSubjectNote(p, subjectMap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoading) {
    return <PageShell title="Đề án tuyển sinh"><Card className="p-10 text-center"><div className="flex items-center justify-center gap-2 text-[13px] text-[#667085]"><Loader2 className="w-5 h-5 animate-spin" /> Đang tải...</div></Card></PageShell>;
  }

  if (!university) {
    return <PageShell title="Đề án tuyển sinh"><Card className="p-10 text-center"><p className="text-[13px] text-[#667085]">Không tìm thấy trường.</p><Link to="/universities" className="text-[#253B80] text-[12px] mt-2 inline-block">← Quay lại tra cứu</Link></Card></PageShell>;
  }

  const toc = [
    { id: 'thong-tin-chinh', label: 'Thông tin chính' },
    { id: 'phuong-an-tuyen-sinh', label: 'Phương án tuyển sinh' },
    { id: 'diem-thi-thpt', label: '— Điểm thi THPT' },
    { id: 'utxt-thang', label: '— ƯTXT, XT thẳng' },
    { id: 'xet-tuyen-ket-hop', label: '— Điểm xét tuyển kết hợp' },
    { id: 'danh-sach-nganh', label: 'Danh sách ngành đào tạo' },
  ];

  return (
    <PageShell
      title={`Đề án tuyển sinh — ${university.short_name || university.name}`}
      subtitle="Thông tin đề án tuyển sinh năm 2026"
    >
      <Link to="/universities" className="inline-flex items-center gap-1 text-[12px] text-[#253B80] hover:underline mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại tra cứu tuyển sinh
      </Link>

      {/* Thanh search nhỏ trong trang chi tiết */}
      <Card className="p-3 mb-5">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3]" />
          <input
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-[#E4E7EC] text-[12.5px] focus:outline-none focus:border-[#253B80]"
            placeholder="Tra cứu tên ngành / mã ngành của trường..."
            value={majorSearch}
            onChange={(e) => setMajorSearch(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6">
        {/* Phụ lục — hyperlink các phần quan trọng */}
        <aside className="lg:sticky lg:top-4 self-start">
          <Card className="p-4">
            <div className="text-[11px] font-semibold text-[#98A2B3] uppercase tracking-wide mb-2">Phụ lục</div>
            <nav className="space-y-0.5">
              {toc.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="block text-[12px] text-[#344054] hover:text-[#253B80] hover:bg-[#F7F8FC] rounded px-2 py-1.5 transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>
          </Card>
        </aside>

        {/* Nội dung đề án */}
        <div className="space-y-5">
          {/* Thông tin chính */}
          <section id="thong-tin-chinh" className="scroll-mt-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[15px] font-bold text-[#111827]">Thông tin chính</h2>
                <DemoBadge />
              </div>
              <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                <div><span className="text-[#667085]">Mã trường:</span> <b className="text-[#111827]">{university.code}</b></div>
                <div><span className="text-[#667085]">Tên trường:</span> <b className="text-[#111827]">{university.name}</b></div>
                {university.district && <div><span className="text-[#667085]">Khu vực:</span> <b className="text-[#111827]">{university.district}</b></div>}
                {university.website && <div><a href={university.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#253B80] hover:underline">{university.website} <ExternalLink className="w-3 h-3" /></a></div>}
              </div>
              <p className="text-[12px] text-[#667085] mt-3 leading-relaxed">
                Năm tuyển sinh: 2026. Thời gian nhận hồ sơ dự kiến từ 01/7/2026 đến 30/7/2026. Thí sinh đăng ký xét tuyển qua cổng thông tin của Bộ GD&ĐT hoặc trực tiếp tại trường.
              </p>
            </Card>
          </section>

          {/* Phương án tuyển sinh */}
          <section id="phuong-an-tuyen-sinh" className="scroll-mt-4">
            <h2 className="text-[15px] font-bold text-[#111827] mb-3">Phương án tuyển sinh</h2>

            {/* 1. Điểm thi THPT */}
            <Card className="p-5 mb-4" id="diem-thi-thpt">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13.5px] font-bold text-[#111827]">1. Điểm thi THPT</h3>
                <Chip tone="blue">{byMethod.thpt.length} ngành</Chip>
              </div>
              <div className="bg-[#F0FDF9] border border-[#CCFBF1] rounded-lg p-3 mb-3">
                <div className="text-[11px] font-semibold text-[#0D9488] mb-1">Quy chế</div>
                <p className="text-[12px] text-[#344054] leading-relaxed">{QUYCHE.thpt}</p>
              </div>
              {renderTable(byMethod.thpt)}
            </Card>

            {/* 2. ƯTXT, XT thẳng */}
            <Card className="p-5 mb-4" id="utxt-thang">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13.5px] font-bold text-[#111827]">2. Ưu tiên xét tuyển (ƯTXT), Xét tuyển thẳng</h3>
                <Chip tone="amber">{Utxt_CATEGORIES.length} diện</Chip>
              </div>
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3 mb-3">
                <div className="text-[11px] font-semibold text-[#B45309] mb-1">Quy chế</div>
                <p className="text-[12px] text-[#344054] leading-relaxed">{QUYCHE.utxt}</p>
              </div>
              <ul className="space-y-1.5">
                {Utxt_CATEGORIES.map((cat, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-[#344054]">
                    <span className="text-[#253B80] font-semibold mt-0.5">{i + 1}.</span> {cat}
                  </li>
                ))}
              </ul>
            </Card>

            {/* 3. Điểm xét tuyển kết hợp */}
            <Card className="p-5" id="xet-tuyen-ket-hop">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13.5px] font-bold text-[#111827]">3. Điểm xét tuyển kết hợp</h3>
                <Chip tone="teal">{KET_HOP_METHODS.length} phương thức</Chip>
              </div>
              <div className="bg-[#EFF4FF] border border-[#D6E0FF] rounded-lg p-3 mb-4">
                <div className="text-[11px] font-semibold text-[#253B80] mb-1">Quy chế</div>
                <p className="text-[12px] text-[#344054] leading-relaxed">{QUYCHE.ketHop}</p>
              </div>

              {/* Bảng quy đổi */}
              <div className="mb-4">
                <div className="text-[12px] font-semibold text-[#111827] mb-2">Bảng quy đổi chứng chỉ tiếng Anh quốc tế</div>
                <div className="overflow-x-auto rounded-lg border border-[#E4E7EC]">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-[#F7F8FC] text-[#667085] text-left">
                        <th className="px-3 py-2 font-semibold">IELTS</th>
                        <th className="px-3 py-2 font-semibold">TOEFL iBT</th>
                        <th className="px-3 py-2 font-semibold">TOEIC (L&R/S/W)</th>
                        <th className="px-3 py-2 font-semibold">Điểm quy đổi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {QUY_DOI_TABLE.map((row, i) => (
                        <tr key={i} className="border-t border-[#E4E7EC]">
                          <td className="px-3 py-2">{row.ielts}</td>
                          <td className="px-3 py-2">{row.toefl_ibt}</td>
                          <td className="px-3 py-2">{row.toeic}</td>
                          <td className="px-3 py-2 font-bold text-[#253B80]">{row.diem}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Các phương thức kết hợp */}
              <div className="space-y-2 mb-4">
                {KET_HOP_METHODS.map((m, i) => (
                  <div key={m.id} className="border border-[#E4E7EC] rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-[#253B80] font-bold text-[12px] mt-0.5">{i + 1}.</span>
                      <div>
                        <div className="text-[12.5px] font-semibold text-[#111827]">{m.title}</div>
                        <p className="text-[11.5px] text-[#667085] mt-0.5 leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bảng ngành theo phương thức kết hợp */}
              {(byMethod.combo.length > 0 || byMethod.aptitude.length > 0 || byMethod.cert.length > 0) && (
                <div>
                  <div className="text-[12px] font-semibold text-[#111827] mb-2">Danh sách ngành theo phương thức kết hợp</div>
                  {renderTable([...byMethod.combo, ...byMethod.aptitude, ...byMethod.cert])}
                </div>
              )}
            </Card>
          </section>

          {/* Danh sách ngành đào tạo */}
          <section id="danh-sach-nganh" className="scroll-mt-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-[#111827]">Danh sách ngành đào tạo</h2>
                <Chip tone="gray">{filtered.length} ngành</Chip>
              </div>
              {renderTable(filtered)}
            </Card>
          </section>
        </div>
      </div>
    </PageShell>
  );
}