import React from 'react';
import { Trash2, ArrowRight, FileText } from 'lucide-react';
import { Card, Chip, GhostButton, PrimaryButton } from '@/components/journey/bits';

// Một cặp ngành – trường đã quan tâm (chưa kèm phương thức xét tuyển)
export default function ChosenPlanCard({ plan, onAdvise, onScheme, onRemove }) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14.5px] font-bold text-[#111827]">{plan.university_name}</span>
            <Chip tone="gray">Mã trường: {String(plan.university_code || '').toUpperCase()}</Chip>
            {plan.year && <Chip tone="blue">Năm {plan.year}</Chip>}
          </div>
          <div className="text-[12.5px] text-[#667085] mt-1">
            {plan.major_name}
            {plan.combination ? ` · Tổ hợp ${plan.combination}` : ''}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <GhostButton className="!h-9 !text-[11.5px]" onClick={() => onScheme(plan.university_code)}>
            <FileText className="w-3.5 h-3.5" /> Đề án
          </GhostButton>
          <PrimaryButton className="!h-9 !px-3.5 !text-[11.5px]" onClick={() => onAdvise(plan)}>
            Đề xuất phương thức xét tuyển <ArrowRight className="w-3.5 h-3.5" />
          </PrimaryButton>
          <button
            onClick={() => onRemove(plan)}
            className="w-9 h-9 rounded-lg bg-white border border-[#FECACA] flex items-center justify-center text-[#DC2626] hover:bg-[#FEF2F2]"
            title="Xóa khỏi danh sách quan tâm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}