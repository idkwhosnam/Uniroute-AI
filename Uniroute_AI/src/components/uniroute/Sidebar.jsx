import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Sparkles, LayoutDashboard, UserRound, ClipboardList, NotebookPen, Contact,
  Compass, BookOpen, Building2, FileCheck, Target as TargetIcon,
  ArrowLeftRight, Route, TrendingUp, ChevronDown, RotateCcw,
} from 'lucide-react';
import { useStore } from '@/state/store';
import { useToast } from '@/components/ui/use-toast';
import { useResetStudentData } from '@/lib/useStudentData';

const NAV = [
  { group: null, items: [{ label: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard }] },
  {
    group: 'Hồ sơ & Định hướng',
    items: [
      { label: 'Hồ sơ của tôi', path: '/profile', icon: Contact },
      { label: 'Trắc nghiệm Holland', path: '/assessment', icon: ClipboardList },
      { label: 'Cập nhật điểm', path: '/academic', icon: NotebookPen },
    ],
  },
  {
    group: 'Chọn ngành & môn',
    items: [
      { label: 'Điều chỉnh tổ hợp môn', path: '/subject-adjustment', icon: Compass },
      { label: 'Tư vấn môn học lớp 10', path: '/subjects', icon: BookOpen },
    ],
  },
  {
    group: 'Tra cứu & xét tuyển',
    items: [
      { label: 'Tra cứu tuyển sinh', path: '/universities', icon: Building2 },
      { label: 'Định hướng ngành & trường', path: '/majors', icon: GraduationCap },
      { label: 'Tư vấn phương thức xét tuyển', path: '/admission', icon: FileCheck },
      { label: 'Mục tiêu xét tuyển', path: '/target', icon: TargetIcon },
      { label: 'Phân tích khoảng cách', path: '/gap', icon: ArrowLeftRight },
    ],
  },
  {
    group: 'Lộ trình học',
    items: [
      { label: 'Lộ trình ôn tập', path: '/roadmap', icon: Route },
      { label: 'Tiến độ', path: '/progress', icon: TrendingUp },
    ],
  },
];

export default function Sidebar() {
  const [gradeOpen, setGradeOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { s, patch, resetStudent } = useStore();
  const { toast } = useToast();
  const resetDataMut = useResetStudentData();
  const [resetting, setResetting] = useState(false);
  const grade = s?.profile.grade || 12;

  const handleResetData = async () => {
    if (resetting) return;
    if (!window.confirm('Đặt lại toàn bộ dữ liệu học sinh (hồ sơ, điểm, Holland, mục tiêu, kế hoạch ôn)? Hành động này không thể hoàn tác.')) return;
    setResetting(true);
    try {
      await resetDataMut.mutateAsync();
      try { sessionStorage.removeItem('uniroute_pending_profile'); } catch (e) { /* ignore */ }
      resetStudent();
      toast({ title: 'Đã đặt lại dữ liệu', description: 'Bạn có thể bắt đầu hành trình mới từ Hồ sơ của tôi.' });
      navigate('/profile');
    } catch (e) {
      toast({ title: 'Lỗi đặt lại dữ liệu', description: e.message });
    }
    setResetting(false);
  };

  return (
    <aside className="hidden lg:flex w-[264px] shrink-0 flex-col bg-white border-r border-[#E4E7EC] h-screen sticky top-0">
      {/* Brand */}
      <button onClick={() => navigate('/')} className="flex items-center gap-2.5 px-5 h-[64px] border-b border-[#E4E7EC] text-left">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#253B80]">
          <GraduationCap className="w-5 h-5 text-white" />
          <Sparkles className="w-3 h-3 text-[#14B8A6] absolute -top-1 -right-1" />
        </div>
        <div className="leading-tight">
          <div className="font-bold text-[14.5px] text-[#111827]">UniRoute <span className="text-[#14B8A6]">AI</span></div>
          <div className="text-[10.5px] text-[#98A2B3] font-medium">Từ mơ hồ đến mục tiêu cụ thể</div>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV.map((section, i) => (
          <div key={i}>
            {section.group && (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">{section.group}</div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] transition-all ${isActive ? 'bg-[#EFF4FF] text-[#253B80] font-bold' : 'text-[#344054] font-medium hover:bg-[#F7F8FC]'}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#253B80]' : 'text-[#98A2B3]'}`} />
                    <span className="text-left leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#E4E7EC] space-y-2">
        <div className="relative">
          <button
            onClick={() => setGradeOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#F7F8FC] border border-[#E4E7EC] text-[12px] font-medium text-[#344054] hover:bg-[#EFF4FF] transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6]" /> Đang học: Lớp {grade}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#98A2B3]" />
          </button>
          {gradeOpen && (
            <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-[#E4E7EC] rounded-lg shadow-lg overflow-hidden z-10">
              {[10, 11, 12].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGradeOpen(false);
                    if (s) patch((st) => ({ ...st, profile: { ...st.profile, grade: g } }));
                  }}
                  className={`w-full px-3 py-2 text-left text-[12px] hover:bg-[#F7F8FC] ${g === grade ? 'font-bold text-[#253B80]' : 'text-[#344054]'}`}
                >
                  Lớp {g}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleResetData}
          disabled={resetting}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-semibold text-[#667085] hover:bg-[#F7F8FC] transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} /> {resetting ? 'Đang đặt lại...' : 'Đặt lại dữ liệu của tôi'}
        </button>
      </div>
    </aside>
  );
}