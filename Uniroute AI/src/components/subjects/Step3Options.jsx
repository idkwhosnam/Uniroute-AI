import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, Chip, PrimaryButton, GhostButton } from '@/components/journey/bits';
import SchoolOptionsEditor from './SchoolOptionsEditor';
import { SCORE_BASE_KEYS, thptLabel } from '@/lib/thptSubjects';

// Nghiệp vụ 02 B3 — nhập các phương án môn học trên phiếu của trường.
export default function Step3Options({ options = [], hollandDone, busy, onAdd, onUpdate, onDelete, onAnalyze, onBackToHolland, onBack }) {
  return (
    <div className="space-y-5">
      {/* Môn bắt buộc — cố định cho mọi phương án */}
      <Card className="p-5 bg-[#F8FAFC]">
        <h3 className="text-[13.5px] font-bold text-[#1E293B] mb-2">Môn học bắt buộc (cố định cho mọi phương án)</h3>
        <div className="flex flex-wrap gap-1.5">
          {SCORE_BASE_KEYS.map((k) => <Chip key={k} tone="navy">{thptLabel(k)}</Chip>)}
        </div>
        <p className="mt-2.5 text-[11.5px] text-[#6B7280] leading-relaxed">
          Bốn môn này có trong mọi phương án nên không cần nhập. Bạn chỉ nhập 4 môn học lựa chọn và 3 môn thuộc cụm chuyên đề học tập của từng phương án.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="text-[15px] font-bold text-[#1E293B] mb-3">3. Nhập các phương án trên phiếu của trường</h2>
        <SchoolOptionsEditor options={options} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} busy={busy} />
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <GhostButton onClick={onBack}><ArrowLeft className="w-4 h-4" /> Quay lại Holland & định hướng</GhostButton>
        {!hollandDone && <GhostButton onClick={onBackToHolland}>Bổ sung trắc nghiệm Holland</GhostButton>}
        <div className="flex-1" />
        <PrimaryButton onClick={onAnalyze} disabled={!options.length || busy}>
          Phân tích và đề xuất TOP 3 <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
      </div>
      <p className="text-[11.5px] text-[#6B7280]">
        Nếu trường có ít hơn 3 phương án, hệ thống sẽ đề xuất số phương án thực tế đã nhập.
      </p>
    </div>
  );
}