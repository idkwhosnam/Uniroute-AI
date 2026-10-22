import React from 'react';
import { Building2 } from 'lucide-react';
import { Card, Chip, PrimaryButton } from '@/components/journey/bits';
import UniversitySuggestionCard from '@/components/orientation/UniversitySuggestionCard';

// Đề xuất trường đại học có đào tạo ngành học sinh đã chọn.
// Học sinh tích 2–3 trường để so sánh bằng bảng đối chiếu, rồi chốt 1 phương án ngành – trường
// để chuyển sang trang Tư vấn phương thức xét tuyển.
export default function UniversitySuggestions({ major, data, chosenKeys, hasDeclared, onToggleChoose, onAdvise, onCompare, onOpenScheme }) {
  const items = data.items || [];
  const selected = items.filter((it) => chosenKeys.has(`${it.university_code}|${it.best?.program?.major_code}`));

  return (
    <div className="mb-7">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-[#253B80] shrink-0" />
          <h3 className="text-[14px] font-bold text-[#111827] truncate">{major.name}</h3>
          <Chip tone="blue">{items.length} trường có tuyển sinh</Chip>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="text-[13.5px] font-semibold text-[#111827]">Chưa có dữ liệu tuyển sinh cho ngành này</div>
          <p className="text-[12.5px] text-[#667085] mt-1 leading-relaxed">
            Hệ thống chưa ghi nhận trường nào công bố tuyển sinh ngành {major.name} trong dữ liệu hiện có.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((it) => (
              <UniversitySuggestionCard
                key={it.university_code}
                item={it}
                durationYears={data.durationYears}
                hasDeclared={hasDeclared}
                chosen={chosenKeys.has(`${it.university_code}|${it.best?.program?.major_code}`)}
                onToggleChoose={onToggleChoose}
                onAdvise={onAdvise}
                onOpenScheme={onOpenScheme}
              />
            ))}
          </div>

          {selected.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-[#E0E4EB]">
              <div className="text-[12.5px] text-[#667085]">
                Đã chọn <span className="font-bold text-[#111827]">{selected.length}</span> trường cho ngành {major.name}.
              </div>
              <PrimaryButton className="!h-10 !text-[12px]" onClick={() => onCompare(selected)}>
                So sánh {selected.length} trường đã chọn
              </PrimaryButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}