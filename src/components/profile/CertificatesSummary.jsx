import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';
import { useStudentProfile } from '@/lib/useStudentData';
import { certMeta } from '@/lib/certifications';
import { Card, Chip, GhostButton } from '@/components/journey/bits';

// Bản tóm tắt chứng chỉ đã đồng bộ trong Hồ sơ (chỉ đọc).
export default function CertificatesSummary() {
  const navigate = useNavigate();
  const { data: profile } = useStudentProfile();
  const list = profile?.certifications || [];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-[13.5px] font-bold text-[#111827] flex items-center gap-2">
          <Award className="w-4 h-4 text-[#253B80]" /> Chứng chỉ đã lưu
          <span className="text-[11.5px] font-medium text-[#98A2B3]">({list.length})</span>
        </h3>
        <GhostButton className="!h-8 !px-3 !text-[11.5px]" onClick={() => navigate('/academic')}>
          Cập nhật <ArrowRight className="w-3.5 h-3.5" />
        </GhostButton>
      </div>
      {list.length === 0 ? (
        <p className="text-[12px] text-[#667085]">Chưa có chứng chỉ nào. Nhập IELTS / SAT / HSA ở <button onClick={() => navigate('/academic')} className="underline font-semibold">Cập nhật điểm</button> hoặc <button onClick={() => navigate('/roadmap')} className="underline font-semibold">Lộ trình ôn tập</button>.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {list.map((cert, i) => (
            <Chip key={`${cert.type}-${i}`} tone="teal">
              {certMeta(cert.type).label}: {cert.score}/{cert.scale || certMeta(cert.type).scale}
              {cert.date ? ` · ${new Date(cert.date).toLocaleDateString('vi-VN')}` : ''}
            </Chip>
          ))}
        </div>
      )}
    </Card>
  );
}