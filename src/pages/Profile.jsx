import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotebookPen, BookOpen, Building2, Route as RouteIcon, ArrowRight } from 'lucide-react';
import { useStudentProfile, useLatestHollandResult, useAcademicRecords } from '@/lib/useStudentData';
import PageShell from '@/components/journey/PageShell';
import { Card, Chip, GhostButton } from '@/components/journey/bits';
import PersonalInfoCard from '@/components/profile/PersonalInfoCard';
import InterestsCard from '@/components/profile/InterestsCard';
import HollandSummaryCard from '@/components/profile/HollandSummaryCard';
import SubjectDeclarationCard from '@/components/profile/SubjectDeclarationCard';
import CertificatesSummary from '@/components/profile/CertificatesSummary';

export default function Profile() {
  const navigate = useNavigate();
  const { data: profile } = useStudentProfile();
  const { data: hollandResult } = useLatestHollandResult();
  const { data: academicRecords } = useAcademicRecords();

  const p = profile || {};
  const initials = (p.full_name || 'HS').trim().split(/\s+/).map((w) => w[0]).slice(-2).join('').toUpperCase() || 'HS';
  const hasHolland = !!hollandResult;
  const certCount = (p.certifications || []).length;

  const quickLinks = [
    { icon: NotebookPen, title: 'Cập nhật điểm', desc: (academicRecords || []).length || certCount ? `${(academicRecords || []).length} thẻ điểm · ${certCount} chứng chỉ` : 'Chưa có điểm', path: '/academic' },
    { icon: BookOpen, title: 'Điều chỉnh tổ hợp môn', desc: 'Đánh giá tác động khi đổi môn học THPT', path: '/subject-adjustment' },
    { icon: Building2, title: 'Mục tiêu xét tuyển', desc: '0 mục tiêu', path: '/target' },
    { icon: RouteIcon, title: 'Lộ trình 12 tuần', desc: 'Chưa tạo', path: '/roadmap' },
  ];

  return (
    <PageShell
      title="Hồ sơ của tôi"
      subtitle="Thông tin cá nhân, sở thích và kết quả Holland."
    >
      <Card className="p-6 mb-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full bg-[#253B80] flex items-center justify-center text-white font-bold text-[16px] shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[18px] font-bold text-[#111827] truncate">{p.full_name || 'Chưa cập nhật tên'}</div>
            <div className="text-[12.5px] text-[#667085]">
              {p.grade ? `Lớp ${p.grade}` : 'Chưa cập nhật khối lớp'}{p.school ? ` · ${p.school}` : ''}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {hasHolland ? <Chip tone="teal">Đã có kết quả Holland</Chip> : <Chip tone="amber">Chưa làm Holland</Chip>}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <PersonalInfoCard />
          <InterestsCard />
          <SubjectDeclarationCard />
        </div>
        <div className="space-y-4">
          <HollandSummaryCard />
          <CertificatesSummary />
        </div>
      </div>

      <h3 className="text-[13px] font-bold uppercase tracking-wide text-[#98A2B3] mt-6 mb-3">Phần khác của hồ sơ</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickLinks.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="p-5 flex flex-col">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#253B80]" />
                </div>
                <h4 className="text-[13.5px] font-bold text-[#111827]">{c.title}</h4>
              </div>
              <p className="text-[12px] text-[#667085] flex-1">{c.desc}</p>
              <GhostButton className="self-start mt-3 !h-9 !text-[12px]" onClick={() => navigate(c.path)}>
                Mở <ArrowRight className="w-3.5 h-3.5" />
              </GhostButton>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}