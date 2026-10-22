// Engine tính điểm Holland RIASEC — quy tắc xác định, KHÔNG phải machine learning.
// Kết quả chỉ mang tính tham khảo về xu hướng sở thích, không đảm bảo năng lực hay thành công nghề nghiệp.

export const RIASEC_KEYS = ['R', 'I', 'A', 'S', 'E', 'C'];

export const RIASEC_META = {
  R: { label: 'Realistic', vi: 'Thực tế', color: '#16A34A', desc: 'Thích làm việc với tay chân, máy móc, công cụ, hoạt động ngoài trời.' },
  I: { label: 'Investigative', vi: 'Nghiên cứu', color: '#2563EB', desc: 'Thích phân tích, nghiên cứu, giải quyết vấn đề bằng tư duy logic và bằng chứng.' },
  A: { label: 'Artistic', vi: 'Nghệ thuật', color: '#9333EA', desc: 'Thích sáng tạo, biểu diễn, viết lách, thiết kế và tự do thể hiện.' },
  S: { label: 'Social', vi: 'Xã hội', color: '#EA580C', desc: 'Thích giúp đỡ, dạy dỗ, chăm sóc và làm việc với con người.' },
  E: { label: 'Enterprising', vi: 'Quản lý', color: '#DC2626', desc: 'Thích thuyết phục, lãnh đạo, bán hàng, tổ chức và đạt mục tiêu.' },
  C: { label: 'Conventional', vi: 'Quy ước', color: '#0891B2', desc: 'Thích tổ chức, ghi chép, dữ liệu, làm việc theo quy trình và chi tiết.' },
};

export const LIKERT = [
  { v: 1, label: 'Rất không giống tôi' },
  { v: 2, label: 'Không giống tôi' },
  { v: 3, label: 'Trung lập' },
  { v: 4, label: 'Khá giống tôi' },
  { v: 5, label: 'Rất giống tôi' },
];

// Tính điểm 6 nhóm RIASEC từ câu trả lời.
// answers: { [question_code]: response(1-5) } hoặc mảng { question_code, response }
// questions: mảng { code, riasec }
// Trả về { R, I, A, S, E, C } trên thang 0–60 (chuẩn hóa).
export function computeRiasecScores(answers, questions) {
  const answerMap = Array.isArray(answers)
    ? Object.fromEntries(answers.map((a) => [a.question_code, a.response]))
    : (answers || {});
  const sums = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  for (const q of questions) {
    const resp = answerMap[q.code];
    if (resp != null && RIASEC_KEYS.includes(q.riasec)) {
      sums[q.riasec] += Number(resp);
      counts[q.riasec] += 1;
    }
  }
  const scores = {};
  for (const k of RIASEC_KEYS) {
    if (counts[k] > 0) {
      const max = counts[k] * 5;
      const min = counts[k] * 1;
      const range = max - min || 1;
      scores[k] = Math.round(((sums[k] - min) / range) * 60);
    } else {
      scores[k] = 0;
    }
  }
  return scores;
}

// Lấy mã Holland 3 chữ cái (top 3 nhóm theo điểm giảm dần).
// Khi điểm bằng nhau, giữ thứ tự RIASEC chuẩn để kết quả xác định.
export function hollandCode(scores) {
  return RIASEC_KEYS
    .map((k) => ({ k, v: scores[k] || 0 }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 3)
    .map((x) => x.k)
    .join('');
}

export function topGroups(scores) {
  return RIASEC_KEYS
    .map((k) => ({ k, v: scores[k] || 0 }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 3)
    .map((x) => x.k);
}

// Đề xuất nhóm ngành dựa trên mã Holland.
// Trả về mảng { group, score, matchCount, matchedCodes, reasons } sắp xếp giảm dần.
export function recommendMajorGroups(scores, majorGroups) {
  const top3 = topGroups(scores);
  const topSet = new Set(top3);
  return majorGroups.map((g) => {
    const groupCodes = g.riasec_codes || [];
    const matchedCodes = groupCodes.filter((c) => topSet.has(c));
    // Trọng số: vị trí 1 = 3 điểm, vị trí 2 = 2, vị trí 3 = 1
    const weight = groupCodes.reduce((s, c) => {
      const pos = top3.indexOf(c);
      return s + (pos >= 0 ? 3 - pos : 0);
    }, 0);
    const maxWeight = groupCodes.length * 3;
    const score = maxWeight > 0 ? Math.round((weight / maxWeight) * 100) : 0;

    const reasons = [];
    if (matchedCodes.length > 0) {
      reasons.push(`Nhóm ngành phù hợp ${matchedCodes.length} nhóm RIASEC nổi bật của bạn (${matchedCodes.map((c) => `${c} – ${RIASEC_META[c].vi}`).join('; ')}).`);
    } else {
      reasons.push('Nhóm ngành này chưa trùng trực tiếp với 3 nhóm RIASEC nổi bật nhất của bạn — vẫn có thể khám phá nếu bạn quan tâm.');
    }
    if (g.watch_out) reasons.push(`Lưu ý: ${g.watch_out}`);

    return { group: g, score, matchCount: matchedCodes.length, matchedCodes, reasons };
  }).sort((a, b) => b.score - a.score);
}

// Kiểm tra đã trả lời đủ câu hỏi chưa
export function isComplete(answers, questions) {
  const answerMap = Array.isArray(answers)
    ? Object.fromEntries(answers.map((a) => [a.question_code, a.response]))
    : (answers || {});
  return questions.every((q) => answerMap[q.code] != null);
}