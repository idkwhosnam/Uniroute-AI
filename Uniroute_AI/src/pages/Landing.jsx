import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Sparkles, ArrowRight, Compass, Target, Route, ShieldCheck } from 'lucide-react';
import { Card, PrimaryButton, GhostButton } from '@/components/journey/bits';

const WORKFLOWS = [
  { n: '01', icon: Compass, title: 'Hiểu bản thân', desc: 'Hồ sơ học lực + trắc nghiệm Holland → tư vấn tổ hợp môn học và đề xuất điều chỉnh môn.', path: '/subjects' },
  { n: '02', icon: Target, title: 'Xác định hướng đi', desc: 'Chọn ngành – trường, so sánh các phương án tại Hà Nội và lưu danh sách mục tiêu.', path: '/universities' },
  { n: '03', icon: Route, title: 'Chuẩn bị mục tiêu', desc: 'Phân tích khoảng cách điểm số và nhận lộ trình 12 tuần có theo dõi tiến độ.', path: '/roadmap' },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="w-full max-w-[1180px] mx-auto px-6 lg:px-8 py-10">
      <Card className="relative overflow-hidden p-10 lg:p-14 mb-6">
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-[#EFF4FF] pointer-events-none" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0FDF9] border border-[#CCFBF1] text-[#0D9488] text-[11.5px] font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Bản demo MVP · Dữ liệu minh họa
          </div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#253B80]">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[18px] text-[#111827]">UniRoute <span className="text-[#14B8A6]">AI</span></span>
          </div>
          <h1 className="text-[34px] leading-[1.2] font-bold text-[#111827] tracking-tight">
            Từ mơ hồ đến một mục tiêu đại học cụ thể và lộ trình học rõ ràng.
          </h1>
          <p className="text-[15px] text-[#667085] mt-4 leading-relaxed">
            UniRoute AI giúp học sinh THPT tại Hà Nội hiểu bản thân, khám phá lĩnh vực — ngành — trường,
            chọn phương thức xét tuyển và theo dõi lộ trình 12 tuần. Toàn bộ gợi ý chỉ mang tính
            <span className="font-semibold text-[#111827]"> hỗ trợ ra quyết định</span> — không phải cam kết trúng tuyển.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <PrimaryButton onClick={() => navigate('/register')}>
              Tạo tài khoản & bắt đầu <ArrowRight className="w-4 h-4" />
            </PrimaryButton>
            <GhostButton onClick={() => navigate('/login')}>Đăng nhập</GhostButton>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {WORKFLOWS.map((w) => {
          const Icon = w.icon;
          return (
            <Card key={w.n} className="p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#253B80]" />
                </div>
                <span className="text-[22px] font-bold text-[#E4E7EC]">{w.n}</span>
              </div>
              <h3 className="text-[15.5px] font-bold text-[#111827]">{w.title}</h3>
              <p className="text-[12.5px] text-[#667085] mt-2 leading-relaxed flex-1">{w.desc}</p>
              <button
                onClick={() => navigate(w.path)}
                className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#253B80] hover:gap-2.5 transition-all"
              >
                Mở quy trình <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Card>
          );
        })}
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
        <ShieldCheck className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#92400E] leading-relaxed">
          UniRoute AI là công cụ hỗ trợ ra quyết định. Điểm phù hợp và lộ trình đều là kết quả quy tắc có trọng số trên
          dữ liệu minh họa — không phải cam kết trúng tuyển, không phải chẩn đoán tâm lý. Bạn có thể thay đổi lựa chọn ở bất kỳ bước nào.
        </p>
      </div>
    </div>
  );
}