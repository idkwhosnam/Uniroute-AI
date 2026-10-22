import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useHollandQuestions, useSaveHollandAnswers, useSaveHollandResult, useLatestHollandResult } from '@/lib/useStudentData';
import { computeRiasecScores, hollandCode, topGroups, LIKERT, RIASEC_META } from '@/lib/hollandEngine';
import PageShell from '@/components/journey/PageShell';
import { Card, PrimaryButton, GhostButton, Meter, Chip } from '@/components/journey/bits';
import HollandResultPanel from '@/components/holland/HollandResultPanel';

const PER_PAGE = 5;

export default function Assessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: questions, isLoading, isError } = useHollandQuestions();
  const { data: latestResult, isLoading: loadingLatest } = useLatestHollandResult();
  const saveAnswersMut = useSaveHollandAnswers();
  const saveResultMut = useSaveHollandResult();

  const [mode, setMode] = useState(null); // 'quiz' | 'result'
  const [freshResult, setFreshResult] = useState(null);
  const [page, setPage] = useState(0);
  const [responses, setResponses] = useState({}); // { [question_code]: value }
  const [submitting, setSubmitting] = useState(false);

  // Nếu đã có kết quả Holland → hiển thị kết quả ngay trong trang này
  useEffect(() => {
    if (mode === null && !loadingLatest) setMode(latestResult ? 'result' : 'quiz');
  }, [loadingLatest, latestResult, mode]);

  const qList = questions || [];
  const pages = Math.ceil(qList.length / PER_PAGE) || 1;
  const qs = qList.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const answered = Object.keys(responses).filter((k) => responses[k] != null).length;
  const pageDone = qs.every((q) => responses[q.code] != null);
  const last = page === pages - 1;

  const choose = (code, v) => setResponses((r) => ({ ...r, [code]: v }));

  const finish = async () => {
    if (!qList.length) return;
    setSubmitting(true);
    try {
      const scores = computeRiasecScores(responses, qList);
      const code = hollandCode(scores);
      const top3 = topGroups(scores);
      const sessionId = `holland_${Date.now()}`;

      // Lưu câu trả lời
      const answerRecords = qList.map((q) => ({ session_id: sessionId, question_code: q.code, response: responses[q.code] }));
      await saveAnswersMut.mutateAsync(answerRecords);

      // Lưu kết quả — hiển thị ngay trong trang này
      const saved = await saveResultMut.mutateAsync({
        session_id: sessionId,
        scores,
        holland_code: code,
        top_groups: top3,
        recommended_major_groups: [],
        selected_major_groups: [],
        completed_at: new Date().toISOString(),
        scoring_version: 'v1-2026',
      });

      setFreshResult(saved || null);
      toast({ title: 'Đã lưu kết quả Holland', description: `Mã Holland của bạn: ${code}` });
      setMode('result');
    } catch (e) {
      toast({ title: 'Lỗi lưu kết quả', description: e.message });
    }
    setSubmitting(false);
  };

  const restart = () => {
    setResponses({});
    setPage(0);
    setFreshResult(null);
    setMode('quiz');
  };

  if (isLoading || loadingLatest || mode === null) {
    return (
      <PageShell title="Trắc nghiệm Holland" subtitle="Đang tải...">
        <Card className="p-10 text-center"><div className="flex items-center justify-center gap-2 text-[13px] text-[#667085]"><Loader2 className="w-5 h-5 animate-spin" /> Đang tải...</div></Card>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell title="Trắc nghiệm Holland" subtitle="Không tải được câu hỏi">
        <Card className="p-10 text-center">
          <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto mb-3" />
          <div className="text-[14px] font-semibold text-[#111827]">Lỗi tải câu hỏi</div>
          <p className="text-[12.5px] text-[#667085] mt-1">Vui lòng tải lại trang hoặc thử lại sau.</p>
        </Card>
      </PageShell>
    );
  }

  const result = freshResult || latestResult;
  if (mode === 'result' && result) {
    return (
      <PageShell
        title="Trắc nghiệm Holland (RIASEC)"
        subtitle="Kết quả được lưu và đồng bộ vào Hồ sơ của tôi."
        note="Holland đo sở thích. Điểm học tập và năng lực thực tế có thể khác — hãy kết hợp nhiều nguồn thông tin khi ra quyết định."
      >
        {/* Làm lại trắc nghiệm — nổi bật ở đầu trang */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-xl bg-white border-2 border-[#253B80]/25 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#EFF4FF] flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-[#253B80]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14.5px] font-bold text-[#111827]">Muốn làm lại trắc nghiệm Holland?</div>
          </div>
          <PrimaryButton onClick={restart}><RotateCcw className="w-4 h-4" /> Làm lại trắc nghiệm</PrimaryButton>
        </div>
        <HollandResultPanel result={result} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Trắc nghiệm Holland (RIASEC)"
      subtitle="Chọn mức độ giống bạn với từng câu — kết quả tính 6 nhóm RIASEC."
    >
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-semibold text-[#667085]">Câu {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, qList.length)} / {qList.length}</span>
          <span className="text-[12px] font-semibold text-[#253B80]">{Math.round((answered / qList.length) * 100)}%</span>
        </div>
        <Meter value={(answered / qList.length) * 100} className="mb-6" />

        <div className="space-y-4">
          {qs.map((q) => (
            <Card key={q.code} className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Chip tone={q.riasec === 'R' ? 'gray' : q.riasec === 'I' ? 'blue' : q.riasec === 'A' ? 'gray' : q.riasec === 'S' ? 'amber' : q.riasec === 'E' ? 'rose' : 'teal'}>
                  {q.riasec} – {RIASEC_META[q.riasec]?.vi}
                </Chip>
              </div>
              <div className="text-[14px] font-semibold text-[#111827] mb-3">{q.text}</div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {LIKERT.map((o) => {
                  const on = responses[q.code] === o.v;
                  return (
                    <button key={o.v} onClick={() => choose(q.code, o.v)}
                      className={`p-2.5 rounded-lg border text-[11.5px] font-semibold text-center transition-all ${on ? 'bg-[#253B80] text-white border-[#253B80]' : 'bg-white text-[#344054] border-[#E4E7EC] hover:border-[#253B80]'}`}>
                      {on && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}{o.v}
                    </button>
                  );
                })}
              </div>
              <div className="mt-1.5 text-[10.5px] text-[#98A2B3] text-center">{LIKERT.find((o) => o.v === responses[q.code])?.label || 'Chưa chọn'}</div>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <GhostButton onClick={() => (page === 0 ? navigate('/profile') : setPage(page - 1))}>
            <ArrowLeft className="w-4 h-4" /> {page === 0 ? 'Về hồ sơ' : 'Quay lại'}
          </GhostButton>
          {last ? (
            <PrimaryButton onClick={finish} disabled={!pageDone || submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {submitting ? 'Đang tính điểm...' : 'Hoàn thành & xem kết quả'}
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={() => pageDone && setPage(page + 1)} disabled={!pageDone}>
              Tiếp tục <ArrowRight className="w-4 h-4" />
            </PrimaryButton>
          )}
        </div>
        {!pageDone && <p className="mt-2 text-right text-[11.5px] text-[#98A2B3]">Trả lời đủ {qs.length} câu trên trang để tiếp tục.</p>}
      </div>
    </PageShell>
  );
}