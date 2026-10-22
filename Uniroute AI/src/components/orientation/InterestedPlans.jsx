import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, ArrowRight } from 'lucide-react';
import { Card, Chip, GhostButton } from '@/components/journey/bits';
import ChosenPlanCard from '@/components/orientation/ChosenPlanCard';

// Danh sách ngành – trường học sinh đã chọn (từ tra cứu tuyển sinh hoặc từ gợi ý trường bên dưới).
// Từ đây học sinh chuyển sang trang Tư vấn phương thức xét tuyển.
export default function InterestedPlans({ plans, loading, onAdvise, onScheme, onRemove }) {
  const navigate = useNavigate();

  if (loading) {
    return <Card className="p-5 mb-7 text-[12.5px] text-[#667085]">Đang tải danh sách ngành – trường đã chọn...</Card>;
  }

  if (!plans?.length) {
    return (
      <Card className="p-5 mb-7">
        <div className="flex items-start gap-3">
          <Bookmark className="w-4 h-4 text-[#98A2B3] shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-bold text-[#111827]">Chưa chọn ngành – trường nào</div>
            <GhostButton className="mt-3 !h-9 !text-[11.5px]" onClick={() => navigate('/universities')}>
              Đến tra cứu tuyển sinh <ArrowRight className="w-3.5 h-3.5" />
            </GhostButton>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Chip tone="blue">{plans.length} ngành – trường</Chip>
          <span className="text-[12px] text-[#667085]">Chưa kèm phương thức xét tuyển</span>
        </div>
        <GhostButton className="!h-8 !text-[11.5px]" onClick={() => navigate('/universities')}>
          Thêm từ tra cứu tuyển sinh
        </GhostButton>
      </div>
      <div className="space-y-3">
        {plans.map((plan) => (
          <ChosenPlanCard
            key={plan.id}
            plan={plan}
            onAdvise={onAdvise}
            onScheme={onScheme}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}