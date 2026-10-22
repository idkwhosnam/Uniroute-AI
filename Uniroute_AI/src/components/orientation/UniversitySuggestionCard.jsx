import React from 'react';
import { MapPin, Check, FileText, ArrowRight } from 'lucide-react';
import { Card, GhostButton, PrimaryButton } from '@/components/journey/bits';
import { METHOD_SHORT } from '@/lib/admissionEngine';

const GREEN_BADGE = 'bg-[#E0F2F1] text-[#00695C]';
const BLUE_PILL = 'bg-[#E3F2FD] text-[#1565C0]';

// Thẻ trường đại học có đào tạo ngành đang xét (tham chiếu thiết kế danh sách trường)
export default function UniversitySuggestionCard({ item, durationYears, hasDeclared, chosen, onToggleChoose, onAdvise, onOpenScheme }) {
  const { university, best, programs, matchedCombos = [], otherCombos = [] } = item;
  if (!best) return null;

  const p = best.program;
  const isMock = programs.some((x) => x.program.is_mock || x.program.data_status === 'MOCK');
  const combos = [...matchedCombos, ...otherCombos];
  const tuition = p.tuition != null ? `${p.tuition} triệu/năm` : 'chưa công bố';
  const bench = p.benchmark_score != null ? `${p.benchmark_score}/${p.benchmark_scale || 30}` : '—';

  return (
    <Card className="p-5 flex flex-col">
      <div className={`inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold ${GREEN_BADGE}`}>
        <Check className="w-3 h-3" /> Có đào tạo ngành này{isMock ? ' · dữ liệu mẫu' : ''}
      </div>

      <h4 className="text-[15.5px] font-bold text-[#212121] mt-2.5">{best.program.university_name}</h4>
      <div className="flex items-center gap-1.5 text-[11.5px] text-[#757575] mt-1">
        <MapPin className="w-3.5 h-3.5" />
        <span>{university?.district || 'Chưa có địa điểm'} · Mã trường: {String(item.university_code).toUpperCase()}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {programs.map((entry) => (
          <span key={entry.program.id} className={`px-2 py-1 rounded-md text-[10.5px] font-semibold ${BLUE_PILL}`}>
            {METHOD_SHORT[entry.program.method] || entry.program.method_label || entry.program.method}
          </span>
        ))}
      </div>

      <div className="mt-3.5 space-y-1.5 text-[11.5px] text-[#424242] leading-relaxed">
        <div>
          <span className="font-semibold">Tổ hợp được minh họa:</span> {combos.length ? combos.join(', ') : 'Không dùng tổ hợp cố định'}
        </div>
        <div>
          <span className="font-semibold">Đối chiếu môn THPT: </span>
          {matchedCombos.length
            ? <>Có tổ hợp trùng môn đã khai báo: {matchedCombos.join(', ')}. Điều này không xác nhận đủ điều kiện xét tuyển.</>
            : hasDeclared
              ? 'Chưa có tổ hợp nào trùng hoàn toàn với môn đã khai báo ở hồ sơ.'
              : 'Chưa khai báo môn học lựa chọn THPT ở Hồ sơ nên chưa đối chiếu được.'}
        </div>
        <div>
          <span className="font-semibold">So sánh nhanh:</span> Điểm chuẩn {p.benchmark_year || p.year}: {bench} · Học phí: {tuition} · Đào tạo: {durationYears} năm
        </div>
      </div>

      <label className={`mt-4 flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${chosen ? 'border-[#9FA8DA] bg-[#F5F6FC]' : 'border-[#E0E4EB] bg-[#F8F9FB] hover:border-[#9FA8DA]'}`}>
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 accent-[#2962FF]"
          checked={chosen}
          onChange={() => onToggleChoose(item)}
        />
        <span className="min-w-0">
          <span className="block text-[12px] font-bold text-[#212121]">{chosen ? '✓ Đã chọn để so sánh' : 'Chọn để so sánh'}</span>
          <span className="block text-[10.5px] text-[#616161] mt-0.5">Chọn tối đa 3 trường để so sánh.</span>
        </span>
      </label>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <GhostButton className="!h-9 !text-[11.5px]" onClick={() => onOpenScheme(item.university_code)}>
          <FileText className="w-3.5 h-3.5" /> Xem thông tin tuyển sinh
        </GhostButton>
        <PrimaryButton className="!h-9 !px-3.5 !text-[11.5px]" onClick={() => onAdvise(item)}>
          Chọn phương án này &amp; tư vấn phương thức <ArrowRight className="w-3.5 h-3.5" />
        </PrimaryButton>
      </div>
    </Card>
  );
}