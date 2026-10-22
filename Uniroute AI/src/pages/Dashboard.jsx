import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, Contact, ClipboardList, NotebookPen, Compass, BookOpen,
  GraduationCap, Building2, FileCheck, Target as TargetIcon, ArrowLeftRight,
  Route as RouteIcon, TrendingUp, Sparkles,
} from 'lucide-react';
import { useStore } from '@/state/store';
import { nextAction } from '@/data/engine';
import { useAdmissionPrograms, useUniversities } from '@/lib/useStudentData';
import PageShell from '@/components/journey/PageShell';
import { Card, Chip, PrimaryButton } from '@/components/journey/bits';

const FEATURE_GROUPS = [
  {
    group: 'Hồ sơ & Định hướng',
    items: [
      { label: 'Hồ sơ của tôi', path: '/profile', icon: Contact, desc: 'Thông tin cá nhân, sở thích và định hướng Holland.' },
      { label: 'Trắc nghiệm Holland', path: '/assessment', icon: ClipboardList, desc: 'Làm bài RIASEC, xem và lưu kết quả ngay tại đây.' },
      { label: 'Cập nhật điểm', path: '/academic', icon: NotebookPen, desc: 'Nhập điểm học bạ, thi thử và chứng chỉ IELTS/SAT/HSA.' },
    ],
  },
  {
    group: 'Chọn ngành & môn',
    items: [
      { label: 'Điều chỉnh tổ hợp môn', path: '/subject-adjustment', icon: Compass, desc: 'Đánh giá có nên điều chỉnh tổ hợp môn THPT và cần bổ sung môn gì.' },
      { label: 'Tư vấn môn học lớp 10', path: '/subjects', icon: BookOpen, desc: 'Xem xếp hạng phương án môn học lớp 10 phù hợp với bạn.' },
    ],
  },
  {
    group: 'Tra cứu & xét tuyển',
    items: [
      { label: 'Tra cứu tuyển sinh', path: '/universities', icon: Building2, desc: 'Tìm trường, ngành, tổ hợp và điểm chuẩn.' },
      { label: 'Định hướng ngành & trường', path: '/majors', icon: GraduationCap, desc: 'Gợi ý ngành phù hợp và trường đại học đào tạo ngành bạn chọn.' },
      { label: 'Tư vấn phương thức xét tuyển', path: '/admission', icon: FileCheck, desc: 'Phân loại PTXT phù hợp sơ bộ và có thể cân nhắc cho trường mục tiêu.' },
      { label: 'Mục tiêu xét tuyển', path: '/target', icon: TargetIcon, desc: 'Quản lý mục tiêu Dream / Match / Safe.' },
      { label: 'Phân tích khoảng cách', path: '/gap', icon: ArrowLeftRight, desc: 'So sánh điểm hiện tại với ngưỡng mục tiêu.' },
    ],
  },
  {
    group: 'Lộ trình học',
    items: [
      { label: 'Lộ trình ôn tập', path: '/roadmap', icon: RouteIcon, desc: 'Kế hoạch ôn theo tuần và tiến độ từng môn.' },
      { label: 'Tiến độ', path: '/progress', icon: TrendingUp, desc: 'Theo dõi hoàn thành và điểm kiểm tra.' },
    ],
  },
];

function FeatureCard({ item, onOpen }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onOpen}
      className="group text-left bg-white border border-[#E4E7EC] rounded-xl p-4 transition-all duration-200 hover:border-[#253B80] hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:border-[#253B80]"
    >
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-lg bg-[#EFF4FF] flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#253B80]">
          <Icon className="w-5 h-5 text-[#253B80] transition-colors group-hover:text-white" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-bold text-[#111827]">{item.label}</span>
          <span className="block text-[11.5px] text-[#667085] mt-0.5 leading-relaxed">{item.desc}</span>
        </span>
        <ArrowRight className="w-4 h-4 text-[#D0D5DD] shrink-0 mt-0.5 transition-colors group-hover:text-[#253B80]" />
      </div>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { s } = useStore();
  const [term, setTerm] = useState('');
  const [focused, setFocused] = useState(false);
  const { data: programs } = useAdmissionPrograms();
  const { data: universities } = useUniversities();

  const suggestions = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    const out = [];
    (universities || []).forEach((u) => {
      if (`${u.name} ${u.short_name || ''} ${u.code}`.toLowerCase().includes(q)) {
        out.push({ kind: 'Trường', key: `u-${u.code}`, title: u.short_name || u.name, sub: u.name, q: u.short_name || u.name });
      }
    });
    const majors = new Map();
    (programs || []).forEach((p) => { if (p.major_code && !majors.has(p.major_code)) majors.set(p.major_code, p.major_name); });
    majors.forEach((name, code) => {
      if (`${name} ${code}`.toLowerCase().includes(q)) out.push({ kind: 'Ngành', key: `m-${code}`, title: name, sub: `Mã ngành ${code}`, q: name });
    });
    return out.slice(0, 6);
  }, [term, programs, universities]);

  const goSearch = (value) => {
    const q = (value != null ? value : term).trim();
    if (!q) return;
    navigate(`/universities?q=${encodeURIComponent(q)}`);
  };

  const name = s?.profile?.name || '';
  const grade = s?.profile?.grade;
  const na = s ? nextAction(s) : null;

  return (
    <PageShell
      title={`Chào ${name.split(' ').slice(-2).join(' ') || 'bạn'}${grade ? `, lớp ${grade}` : ''} 👋`}
    >
      {/* Thanh tìm kiếm ngành/trường */}
      <Card className="p-5 mb-5 border-[#253B80]/30 bg-gradient-to-r from-[#F7F9FF] to-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-3">
            <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-[#0D9488]">
              <Sparkles className="w-3.5 h-3.5" /> Tìm nhanh
            </div>
            <h2 className="text-[17px] font-bold text-[#111827] mt-1">Bạn muốn tìm ngành hay trường nào?</h2>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); goSearch(); }} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3]" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Nhập tên trường, mã trường, ngành học, tổ hợp môn..."
              className="w-full h-11 pl-10 pr-24 rounded-xl bg-white border border-[#E4E7EC] text-[13px] focus:outline-none focus:border-[#253B80]"
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3.5 rounded-lg bg-[#253B80] text-white text-[12px] font-semibold hover:bg-[#172554] transition-colors">
              Tìm
            </button>
            {focused && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E4E7EC] rounded-xl shadow-lg overflow-hidden z-20">
                {suggestions.map((sg) => (
                  <button key={sg.key} type="button" onClick={() => goSearch(sg.q)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F7F8FC] border-b border-[#F2F4F7] last:border-0">
                    <Chip tone={sg.kind === 'Trường' ? 'blue' : 'teal'}>{sg.kind}</Chip>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-semibold text-[#111827] truncate">{sg.title}</span>
                      <span className="block text-[11px] text-[#98A2B3] truncate">{sg.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      </Card>

      {/* Việc nên làm tiếp theo */}
      {na && (
        <Card className="p-4 mb-6 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="w-4 h-4 text-[#14B8A6]" />
            <span className="text-[11.5px] font-bold uppercase tracking-wide text-[#0D9488]">Việc nên làm tiếp theo</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-bold text-[#111827]">{na.title}</div>
            <p className="text-[12px] text-[#667085]">{na.desc}</p>
          </div>
          <PrimaryButton className="!h-9 !text-[12px] shrink-0" onClick={() => navigate(na.path)}>
            {na.cta} <ArrowRight className="w-3.5 h-3.5" />
          </PrimaryButton>
        </Card>
      )}

      {/* Lưới thẻ tính năng */}
      <div className="space-y-6">
        {FEATURE_GROUPS.map((g) => (
          <div key={g.group}>
            <h3 className="text-[12px] font-bold uppercase tracking-wide text-[#98A2B3] mb-2.5">{g.group}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {g.items.map((it) => <FeatureCard key={it.path} item={it} onOpen={() => navigate(it.path)} />)}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}