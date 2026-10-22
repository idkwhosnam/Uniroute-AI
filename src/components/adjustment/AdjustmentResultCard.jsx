import React from 'react';
import { AlertTriangle, ClipboardCheck, Contact, GraduationCap, Info, PlusCircle } from 'lucide-react';
import { Card, Chip, PrimaryButton } from '@/components/journey/bits';
import { thptLabel } from '@/lib/thptSubjects';
import { OPTION_CRITERIA_LABELS } from '@/lib/subjectOptions';
import { RIASEC_META } from '@/lib/hollandEngine';

const VERDICT_TONE = {
  teal: 'bg-[#F0FDF9] border-[#CCFBF1]',
  amber: 'bg-[#FFFBEB] border-[#FDE68A]',
  blue: 'bg-[#EFF6FF] border-[#BFDBFE]',
  gray: 'bg-[#F8FAFC] border-[#E4E7EC]',
};
const VERDICT_TEXT = { teal: '#0F766E', amber: '#92400E', blue: '#1D4ED8', gray: '#344054' };

const CATCHUP_TONE = { ok: 'teal', medium: 'amber', high: 'rose', unknown: 'gray' };

function SubjectChips({ keys, tone = 'gray' }) {
  if (!keys?.length) return <span className="text-[11.5px] text-[#94A3B8]">Không có</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {keys.map((k) => <Chip key={k} tone={tone}>{thptLabel(k)}</Chip>)}
    </div>
  );
}

// NV03 — Mục kết quả tư vấn: có nên đổi, nên chọn phương án nào, cần bổ sung gì, ngành liên quan.
export default function AdjustmentResultCard({ analysis, hasRun, onUpdateProfile }) {
  return (
    <Card className="p-5 lg:sticky lg:top-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-[15px] font-bold text-[#1E293B]">Kết quả tư vấn</h2>
        <Chip tone="amber">Cần nhà trường xác nhận</Chip>
      </div>

      {!hasRun ? (
        <div className="py-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EFF6FF] mb-3">
            <ClipboardCheck className="w-6 h-6 text-[#2563EB]" />
          </div>
          <p className="text-[12.5px] text-[#6B7280]">Chưa có kết quả phân tích.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Kết luận */}
          <div className={`p-4 rounded-xl border ${VERDICT_TONE[analysis.verdict.tone]}`}>
            <div className="text-[13.5px] font-bold" style={{ color: VERDICT_TEXT[analysis.verdict.tone] }}>{analysis.verdict.title}</div>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: VERDICT_TEXT[analysis.verdict.tone] }}>{analysis.verdict.summary}</p>
            {analysis.currentScored && analysis.best && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11.5px]" style={{ color: VERDICT_TEXT[analysis.verdict.tone] }}>
                <span className="px-2 py-0.5 rounded-md bg-white/70 border border-white">
                  Môn hiện tại: <b>{analysis.currentScored.total}/100</b>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/70 border border-white">
                  {analysis.best.name}: <b>{analysis.best.total}/100</b>
                </span>
              </div>
            )}
          </div>

          {analysis.best ? (
            <>
              {/* Nên chọn phương án nào */}
              <div>
                <div className="text-[11.5px] font-bold uppercase tracking-wide text-[#94A3B8] mb-2">Phương án nên chọn</div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC]">
                  <div className="text-[13.5px] font-bold text-[#1E293B]">{analysis.best.name}</div>
                  <div className="mt-2 space-y-1.5">
                    {Object.entries(analysis.best.breakdown || {}).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[11.5px]">
                        <span className="text-[#6B7280]">{OPTION_CRITERIA_LABELS[k] || k}</span>
                        <span className="font-semibold text-[#1E293B] tabular-nums">{v}/100</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 space-y-0.5">
                    {Object.entries(analysis.best.explanations || {}).map(([k, exp]) => (
                      <div key={k} className="text-[11px] text-[#94A3B8]">· {exp}</div>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <div>
                      <div className="text-[11px] font-semibold text-[#6B7280] mb-1">Môn mới so với hiện tại</div>
                      <SubjectChips keys={analysis.best.additions} tone="blue" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-[#6B7280] mb-1">Môn không còn trong phương án</div>
                      <SubjectChips keys={analysis.best.removed} tone="gray" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cần bổ sung gì */}
              <div>
                <div className="text-[11.5px] font-bold uppercase tracking-wide text-[#94A3B8] mb-2 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" /> Nếu chuyển sang, cần bổ sung gì
                </div>
                {analysis.best.catchUp.length ? (
                  <div className="space-y-2">
                    {analysis.best.catchUp.map((c) => (
                      <div key={c.key} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-[#E4E7EC]">
                        <Chip tone={CATCHUP_TONE[c.level]}>{c.label}</Chip>
                        <span className="text-[11.5px] text-[#344054] leading-relaxed flex-1">{c.note}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#6B7280]">Không phát sinh môn học mới so với tổ hợp hiện tại — chỉ thay đổi cụm chuyên đề học tập.</p>
                )}
              </div>

              {/* Ngành liên quan */}
              <div>
                <div className="text-[11.5px] font-bold uppercase tracking-wide text-[#94A3B8] mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Ngành liên quan với phương án này
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {analysis.best.related.topLetters.map((c) => (
                    <Chip key={c} tone="blue">{c} – {RIASEC_META[c]?.vi}</Chip>
                  ))}
                </div>
                <div className="space-y-2">
                  {analysis.best.related.groups.map((g) => (
                    <div key={g.group.code}>
                      <div className="text-[12px] font-semibold text-[#1E293B]">{g.group.name}</div>
                      <div className="text-[11px] text-[#6B7280]">
                        {analysis.best.related.majors.filter((m) => m.major_group_code === g.group.code).map((m) => m.name).join(' · ') || 'Chưa có ngành trong nhóm này'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          ) : (
            <div>
              <div className="text-[11.5px] font-bold uppercase tracking-wide text-[#94A3B8] mb-2">Định hướng từ tổ hợp môn hiện tại</div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {analysis.orientation.topLetters.map((c) => <Chip key={c} tone="blue">{c} – {RIASEC_META[c]?.vi}</Chip>)}
              </div>
              <div className="space-y-2">
                {analysis.orientation.groups.map((g) => (
                  <div key={g.group.code}>
                    <div className="text-[12px] font-semibold text-[#1E293B]">{g.group.name}</div>
                    <div className="text-[11px] text-[#6B7280]">
                      {analysis.orientation.majors.filter((m) => m.major_group_code === g.group.code).map((m) => m.name).join(' · ') || 'Chưa có ngành trong nhóm này'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kết luận giới hạn + cập nhật hồ sơ */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]">
            <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-[#92400E] leading-relaxed">
              Kết quả không đồng nghĩa được phép chuyển. Hãy xác minh với nhà trường về phương án được tổ chức, thời điểm chuyển,
              việc học bổ sung và đánh giá kiến thức.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD]">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#0369A1] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[11.5px] text-[#0C4A6E] leading-relaxed">
                  Sau khi nhà trường xác nhận, hãy cập nhật lại <b>môn học lựa chọn THPT</b> trong Hồ sơ của tôi để hệ thống dùng cho các bước sau.
                </p>
                <PrimaryButton className="mt-2.5 !h-9 !text-[12px]" onClick={onUpdateProfile}>
                  <Contact className="w-4 h-4" /> Cập nhật trong Hồ sơ của tôi
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}