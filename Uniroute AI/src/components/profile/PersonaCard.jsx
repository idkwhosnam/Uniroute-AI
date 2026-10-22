import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ClipboardList, History, BookOpen } from 'lucide-react';
import { useStore } from '@/state/store';
import { computeDims, personaOf } from '@/data/engine';
import { Card, Chip, PrimaryButton, GhostButton, Meter } from '@/components/journey/bits';

const TONE = { 'Cao': 'teal', 'Khá cao': 'blue', 'Trung bình': 'gray', 'Đang phát triển': 'amber' };

export default function PersonaCard() {
  const navigate = useNavigate();
  const { s } = useStore();
  if (!s) return null;

  const completed = s.assessment?.completed;
  const dims = computeDims(s);
  const p = personaOf(dims);
  const versions = s.personaVersions || [];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#253B80]" />
        <h3 className="text-[14px] font-bold text-[#111827]">Persona & hồ sơ năng lực</h3>
      </div>

      {completed ? (
        <>
          <div className="p-4 rounded-xl bg-[#F7F9FF] border border-[#E4E7EC] mb-4">
            <div className="text-[16px] font-bold text-[#253B80]">{p.name}</div>
            <p className="text-[12px] text-[#0D9488] font-semibold mt-0.5">{p.tagline}</p>
            <p className="text-[12.5px] text-[#667085] mt-2 leading-relaxed">{p.description}</p>
          </div>

          <h4 className="text-[12.5px] font-bold text-[#111827] mb-2">Mức độ nổi bật</h4>
          <div className="space-y-2.5 mb-4">
            {p.entries.map((e) => (
              <div key={e.dim}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-[#344054]">{e.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#667085]">{e.value}</span>
                    <Chip tone={TONE[e.level]}>{e.level}</Chip>
                  </div>
                </div>
                <Meter value={e.value} tone={e.value >= 75 ? '#14B8A6' : e.value >= 60 ? '#253B80' : '#D0D5DD'} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-[12.5px] font-bold text-[#111827] mb-2">Điểm mạnh</h4>
              <ul className="space-y-1.5">
                {p.strengths.map((x) => (
                  <li key={x.dim} className="flex items-center gap-2 text-[12px] text-[#344054]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] shrink-0" /> {x.label} — {x.level}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12.5px] font-bold text-[#111827] mb-2">Nên phát triển thêm</h4>
              <ul className="space-y-1.5">
                {p.devAreas.map((x) => (
                  <li key={x.dim} className="flex items-center gap-2 text-[12px] text-[#344054]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" /> {x.label} — {x.level}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {versions.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-3.5 h-3.5 text-[#667085]" />
                <h4 className="text-[12px] font-bold text-[#111827]">Phiên bản Persona ({versions.length})</h4>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {versions.slice().reverse().map((v, i) => (
                  <div key={i} className="px-2.5 py-1.5 rounded-lg bg-[#F7F8FC] border border-[#E4E7EC] flex items-center justify-between">
                    <span className="text-[11.5px] font-semibold text-[#111827] truncate">{v.name}</span>
                    <span className="text-[10px] text-[#98A2B3] shrink-0 ml-2">
                      {new Date(v.at).toLocaleDateString('vi-VN')}{versions.length - i === 1 ? ' · mới nhất' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <PrimaryButton className="!h-10 !text-[12.5px]" onClick={() => navigate('/subject-adjustment')}>
              <BookOpen className="w-4 h-4" /> Đề xuất điều chỉnh tổ hợp môn <ArrowRight className="w-3.5 h-3.5" />
            </PrimaryButton>
            <GhostButton onClick={() => navigate('/assessment')}>Làm lại bài đánh giá</GhostButton>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EFF4FF] mb-3">
            <ClipboardList className="w-6 h-6 text-[#253B80]" />
          </div>
          <h4 className="text-[14px] font-bold text-[#111827] mb-1.5">Chưa có Persona</h4>
          <p className="text-[12.5px] text-[#667085] max-w-sm mx-auto mb-5 leading-relaxed">
            Làm bài đánh giá 12 câu (3–5 phút) để hệ thống tính chân dung năng lực từ học lực, sở thích và câu trả lời của bạn.
          </p>
          <PrimaryButton className="!h-10 !text-[12.5px]" onClick={() => navigate('/assessment')}>
            <ClipboardList className="w-4 h-4" /> Làm bài đánh giá 12 câu
          </PrimaryButton>
        </div>
      )}

      <p className="mt-4 text-[11px] text-[#98A2B3] leading-relaxed">
        Kết quả chỉ mang tính tham khảo về xu hướng — không phải chẩn đoán tâm lý; có thể làm lại bất cứ lúc nào.
      </p>
    </Card>
  );
}