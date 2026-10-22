import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Lightbulb, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useStore } from '@/state/store';
import { recommendMajors } from '@/data/engine';
import { FIELDS } from '@/data/mockData';
import {
  useAdmissionPrograms, useUniversities, useMajors, useMajorGroups,
  useAcademicRecords, useStudentProfile, useLatestHollandResult,
  useAdmissionInterests, useSaveAdmissionInterest, useDeleteAdmissionInterest,
} from '@/lib/useStudentData';
import { currentSubjectScores, declaredSubjectKeys, personalizationGaps, suggestUniversitiesForMajor } from '@/lib/orientationEngine';
import { pairInterestPayload, pairKey } from '@/lib/targetBuilder';
import PageShell from '@/components/journey/PageShell';
import { Card, Chip, PrimaryButton, ScoreRing } from '@/components/journey/bits';
import ThinkingReveal from '@/components/journey/ThinkingReveal';
import ProfileGapsNotice from '@/components/orientation/ProfileGapsNotice';
import UniversitySuggestions from '@/components/orientation/UniversitySuggestions';
import InterestedPlans from '@/components/orientation/InterestedPlans';
import SchoolCompareDialog from '@/components/orientation/SchoolCompareDialog';
import SchemeDialog from '@/components/lookup/SchemeDialog';

const PARTS = [
  ['academic', 'Học lực', 30],
  ['interest', 'Sở thích', 25],
  ['competency', 'Năng lực', 20],
  ['alignment', 'Gắn nghề nghiệp', 15],
  ['market', 'Liên quan thị trường', 10],
];

export default function Majors() {
  const navigate = useNavigate();
  const { s, patch, addLog } = useStore();
  const { toast } = useToast();

  const { data: programs } = useAdmissionPrograms();
  const { data: universities } = useUniversities();
  const { data: majorCatalog } = useMajors();
  const { data: majorGroups } = useMajorGroups();
  const { data: records } = useAcademicRecords();
  const { data: profile } = useStudentProfile();
  const { data: holland } = useLatestHollandResult();
  const { data: interests, isLoading: interestsLoading } = useAdmissionInterests();
  const saveInterestMut = useSaveAdmissionInterest();
  const deleteInterestMut = useDeleteAdmissionInterest();
  const [schemeCode, setSchemeCode] = useState(null);
  const [busyKey, setBusyKey] = useState(null);
  const [compare, setCompare] = useState(null);
  const [pickCode, setPickCode] = useState(null);
  const [showMajorRecs, setShowMajorRecs] = useState(false);

  const selected = s?.selectedMajors || [];
  const recs = useMemo(() => (s ? recommendMajors(s) : []), [s]);
  const scores = useMemo(() => currentSubjectScores(records || []), [records]);
  const declared = useMemo(() => declaredSubjectKeys(profile), [profile]);
  const hollandTop = useMemo(() => holland?.top_groups || [], [holland]);
  const gaps = useMemo(() => personalizationGaps({ scores, declared, hollandTop }), [scores, declared, hollandTop]);

  // Danh sách ngành – trường đã chọn (không kèm phương thức xét tuyển)
  const pairPlans = useMemo(() => (interests || []).filter((i) => !i.method), [interests]);
  const chosenKeys = useMemo(() => new Set(pairPlans.map(pairKey)), [pairPlans]);

  const chosen = useMemo(
    () => recs.filter((r) => selected.includes(r.major.id)).map((r) => r.major),
    [recs, selected],
  );
  const suggestions = useMemo(
    () => chosen.map((major) => ({
      major,
      data: suggestUniversitiesForMajor({ major, programs, universities, majors: majorCatalog, majorGroups, scores, declared, hollandTop }),
    })),
    [chosen, programs, universities, majorCatalog, majorGroups, scores, declared, hollandTop],
  );

  if (!s) return null;

  const goAdvise = (majorCode, uniCodes) => navigate(`/admission?major=${majorCode}&unis=${uniCodes.join(',')}`);

  const openCompare = (major, items, durationYears) => {
    setPickCode(items[0]?.university_code || null);
    setCompare({ major, items, durationYears });
  };

  const adviseFromCompare = () => {
    const item = (compare?.items || []).find((it) => it.university_code === pickCode);
    if (!item) return;
    const majorCode = item.best.program.major_code;
    setCompare(null);
    goAdvise(majorCode, [item.university_code]);
  };

  const toggleMajor = (major) => {
    if (selected.includes(major.id)) {
      patch((st) => ({ ...st, selectedMajors: st.selectedMajors.filter((x) => x !== major.id) }));
      return;
    }
    if (selected.length >= 2) {
      toast({ title: 'Tối đa 2 ngành', description: 'Bạn đã chọn đủ 2 ngành — bỏ một ngành trước khi chọn ngành khác.' });
      return;
    }
    patch((st) => ({ ...st, selectedMajors: [...st.selectedMajors, major.id] }));
    addLog('majors', `Đã đánh dấu quan tâm ngành: ${major.name}`);
  };

  const toggleChoose = async (item) => {
    const key = `${item.university_code}|${item.best.program.major_code}`;
    const existing = pairPlans.find((i) => pairKey(i) === key);
    if (!existing && pairPlans.filter((p) => p.major_code === item.best.program.major_code).length >= 3) {
      toast({ title: 'Tối đa 3 trường để so sánh', description: `Bỏ chọn một trường của ngành ${item.best.program.major_name} trước khi chọn trường khác.` });
      return;
    }
    setBusyKey(key);
    try {
      if (existing) {
        await deleteInterestMut.mutateAsync(existing.id);
        toast({ title: 'Đã bỏ chọn trường mục tiêu', description: `${item.university_name} — ${item.best.program.major_name}` });
      } else {
        await saveInterestMut.mutateAsync(pairInterestPayload({
          university_code: item.university_code,
          university_name: item.university_name,
          major_code: item.best.program.major_code,
          major_name: item.best.program.major_name,
          latestProgram: item.best.program,
        }, 'orientation'));
        toast({ title: 'Đã chọn làm trường mục tiêu', description: 'Trường này đã được thêm vào danh sách ngành – trường phía trên.' });
      }
    } catch (e) {
      toast({ title: 'Lỗi lưu', description: e.message });
    }
    setBusyKey(null);
  };

  const removeInterest = async (plan) => {
    try {
      await deleteInterestMut.mutateAsync(plan.id);
      toast({ title: 'Đã xóa khỏi danh sách', description: `${plan.major_name} — ${plan.university_name}` });
    } catch (e) {
      toast({ title: 'Lỗi xóa', description: e.message });
    }
  };

  const scrollToSuggestions = () => document.getElementById('goi-y-truong')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <PageShell
      title="Định hướng ngành & trường"
      subtitle="Chọn ngành, so sánh 2–3 trường rồi chốt 1 phương án ngành – trường để tư vấn phương thức xét tuyển."
      note="Điểm ngành = Học lực 30% + Sở thích 25% + Năng lực 20% + Gắn nghề 15% + Thị trường 10%. Điểm phù hợp trường = Học lực 45% + Tổ hợp môn 25% + Holland 20% + Học phí 10%. Đề xuất mang tính tham khảo, không phải cam kết."
    >
      {/* 1. Ngành – trường đã chọn */}
      <div className="flex items-center gap-2 mb-3">
        <Chip tone="navy">Đã chọn</Chip>
        <span className="text-[13px] font-bold text-[#111827]">Ngành & trường của bạn</span>
      </div>
      <InterestedPlans
        plans={pairPlans}
        loading={interestsLoading}
        onAdvise={(plan) => goAdvise(plan.major_code, [plan.university_code])}
        onScheme={setSchemeCode}
        onRemove={removeInterest}
      />

      {/* 2. Đề xuất trường cho ngành đã chọn */}
      <div className="flex items-center gap-2 mb-1.5">
        <Chip tone="gray">Chưa có định hướng</Chip>
        <span className="text-[13px] font-bold text-[#111827]">Gợi ý ngành & trường theo hồ sơ của bạn</span>
      </div>

      <ProfileGapsNotice gaps={gaps} />

      <div className="flex items-center gap-2 mb-3">
        <Chip tone="navy">Bước 1</Chip>
        <span className="text-[13px] font-bold text-[#111827]">Chọn ngành học bạn quan tâm</span>
      </div>

      {!showMajorRecs ? (
        <Card className="p-6 text-center mb-6">
          <div className="mx-auto w-11 h-11 rounded-xl bg-[#EFF4FF] flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-[#253B80]" />
          </div>
          <PrimaryButton onClick={() => setShowMajorRecs(true)}>
            <Sparkles className="w-4 h-4" /> Xem gợi ý ngành học
          </PrimaryButton>
        </Card>
      ) : (
        <ThinkingReveal
          label="AI UniRoute đang phân tích hồ sơ để gợi ý ngành học..."
          deps={[showMajorRecs, String(recs.length)]}
        >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {recs.map((r) => {
          const isSel = selected.includes(r.major.id);
          const f = FIELDS.find((x) => x.id === r.major.fieldId);
          return (
            <Card key={r.major.id} className={`p-5 ${isSel ? 'ring-2 ring-[#14B8A6]/40' : ''}`}>
              <div className="flex items-start gap-4">
                <ScoreRing value={r.score} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-bold text-[#111827]">{r.major.name}</h3>
                    {f && <Chip tone="gray">{f.name}</Chip>}
                    <Chip tone={r.level === 'high' ? 'teal' : r.level === 'mid' ? 'blue' : 'gray'}>
                      {r.level === 'high' ? 'Mức độ phù hợp cao' : r.level === 'mid' ? 'Đáng cân nhắc' : 'Cần cân nhắc thêm'}
                    </Chip>
                  </div>
                  <p className="text-[12.5px] text-[#344054] mt-2 leading-relaxed">{r.why}</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mt-4">
                {PARTS.map(([k, label, w]) => (
                  <div key={k} className="text-center">
                    <div className="text-[13px] font-bold text-[#111827]">{r.parts[k]}</div>
                    <div className="text-[9.5px] text-[#98A2B3] leading-tight mt-0.5">{label}<br />{w}%</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-2 p-2.5 rounded-lg bg-[#EFF4FF] border border-[#D6E0FF]">
                <Lightbulb className="w-3.5 h-3.5 text-[#253B80] shrink-0 mt-0.5" />
                <span className="text-[11.5px] text-[#253B80]"><span className="font-semibold">Nên phát triển:</span> {r.devArea}</span>
              </div>

              <button
                onClick={() => toggleMajor(r.major)}
                className={`mt-4 w-full h-10 rounded-lg text-[12.5px] font-semibold transition-colors ${isSel ? 'bg-[#14B8A6] text-white hover:bg-[#0D9488]' : 'bg-white border border-[#E4E7EC] text-[#344054] hover:border-[#253B80]'}`}
              >
                {isSel ? <><Check className="w-4 h-4 inline mr-1" /> Đã đánh dấu quan tâm</> : 'Đánh dấu quan tâm'}
              </button>
            </Card>
          );
        })}
      </div>
        </ThinkingReveal>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-xl bg-white border border-[#E4E7EC]">
        <div className="flex-1 text-[12.5px] text-[#667085]">
          Đã đánh dấu <span className="font-bold text-[#111827]">{selected.length}</span>/2 ngành quan tâm
        </div>
        <PrimaryButton onClick={scrollToSuggestions} disabled={!selected.length}>
          Xem gợi ý trường đại học <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
      </div>

      {chosen.length > 0 && (
        <div id="goi-y-truong" className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Chip tone="navy">Bước 2</Chip>
            <span className="text-[13px] font-bold text-[#111827]">Chọn 2–3 trường để so sánh cho ngành đã chọn</span>
          </div>

          <ThinkingReveal
            label="AI UniRoute đang đối chiếu hồ sơ của bạn với dữ liệu tuyển sinh..."
            deps={[selected.join('|'), declared.join('|'), String(Object.keys(scores).length), hollandTop.join('')]}
          >
            {suggestions.map(({ major, data }) => (
              <UniversitySuggestions
                key={major.id}
                major={major}
                data={data}
                chosenKeys={chosenKeys}
                hasDeclared={declared.length > 0}
                busyKey={busyKey}
                onToggleChoose={toggleChoose}
                onAdvise={(item) => goAdvise(item.best.program.major_code, [item.university_code])}
                onCompare={(items) => openCompare(major, items, data.durationYears)}
                onOpenScheme={setSchemeCode}
              />
            ))}
          </ThinkingReveal>
        </div>
      )}

      {schemeCode && (
        <SchemeDialog university={(universities || []).find((u) => u.code === schemeCode)} programs={programs} onClose={() => setSchemeCode(null)} />
      )}

      {compare && (
        <SchoolCompareDialog
          major={compare.major}
          items={compare.items}
          durationYears={compare.durationYears}
          hasDeclared={declared.length > 0}
          pickCode={pickCode}
          onPick={setPickCode}
          onAdvise={adviseFromCompare}
          onOpenScheme={(code) => { setCompare(null); setSchemeCode(code); }}
          onClose={() => setCompare(null)}
        />
      )}
    </PageShell>
  );
}