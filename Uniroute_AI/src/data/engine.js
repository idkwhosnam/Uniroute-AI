// Engine chấm điểm có trọng số (deterministic rule-based) — KHÔNG phải machine learning.
// Mọi điểm số chỉ là heuristic demo phục vụ việc hỗ trợ ra quyết định.
import { QUESTIONS } from './assessment';
import { FIELDS, MAJORS, UNIVERSITIES, PROGRAMS, SUBJECT_LABELS, COMBOS } from './mockData';
export { COMBOS, SUBJECT_LABELS };

export const DIMS = {
  analysis: { label: 'Phân tích' },
  communication: { label: 'Giao tiếp' },
  creativity: { label: 'Sáng tạo' },
  organization: { label: 'Tổ chức' },
  empathy: { label: 'Thấu hiểu' },
  technology: { label: 'Tư duy công nghệ' },
};

export const ACADEMIC_DIM = {
  analysis: ['toan', 'ly', 'tin'],
  technology: ['tin'],
  communication: ['van', 'anh'],
  creativity: ['van'],
  organization: ['toan', 'kdpl'],
  empathy: ['kdpl'],
};

export const INTEREST_DIM = {
  'Công nghệ': { technology: 1 },
  'Dữ liệu & phân tích': { analysis: 1 },
  'Kinh doanh': { communication: 0.5, organization: 0.5 },
  'Marketing & truyền thông': { communication: 0.5, creativity: 0.5 },
  'Logistics & chuỗi cung ứng': { organization: 1 },
  'Du lịch – nhà hàng – khách sạn': { empathy: 0.6, communication: 0.4 },
  'Sáng tạo nội dung': { creativity: 1 },
  'Tài chính': { analysis: 0.7, organization: 0.3 },
  'Giao tiếp & con người': { communication: 0.6, empathy: 0.4 },
  'Tiếng Anh & giao tiếp quốc tế': { communication: 0.6, empathy: 0.2 },
};

export const INTEREST_TAGS = Object.keys(INTEREST_DIM);

const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, Math.round(v)));
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
export const r1 = (v) => Math.round(v * 10) / 10;

// ---------- Chứng chỉ (thang đo riêng, tách khỏi thang 30 điểm) ----------
export const CERT_TYPES = [
  { type: 'IELTS', min: 0, max: 9, step: 0.5, note: 'Thang band 0–9.0' },
  { type: 'VSTEP', min: 0, max: 10, step: 0.5, note: 'Thang 0–10' },
  { type: 'TOEIC', min: 10, max: 990, step: 5, note: 'Thang 10–990' },
  { type: 'SAT', min: 400, max: 1600, step: 10, note: 'Thang 400–1600' },
];

// Bảng quy đổi chứng chỉ → thang 10 môn Tiếng Anh (demo, tham chiếu quy chế các trường).
const CERT_TO_TEN = {
  IELTS: [[8.5, 10], [7.5, 9.5], [6.5, 9], [5.5, 8.5], [5, 8], [4.5, 7], [4, 6.5]],
  SAT: [[1500, 10], [1400, 9.5], [1300, 9], [1200, 8.5], [1100, 8], [1000, 7.5], [900, 7]],
  TOEIC: [[950, 10], [880, 9.5], [800, 9], [700, 8.5], [600, 8], [500, 7.5]],
  VSTEP: [[8.5, 10], [8, 9.5], [7, 9], [6, 8.5], [5, 8], [4, 7], [3, 6.5]],
};

export function certToTen(type, score) {
  const table = CERT_TO_TEN[type] || CERT_TO_TEN.IELTS;
  return table.find(([min]) => score >= min)?.[1] ?? 6;
}

// ---------- Persona ----------
export function computeDims(st) {
  const ac = st.academic.current;
  const resps = st.assessment.responses;
  const assessAvg = {};
  for (const q of QUESTIONS) {
    (assessAvg[q.dim] = assessAvg[q.dim] || []).push(resps[q.id] ?? 2);
  }
  const interests = st.profile.interests || [];
  const out = {};
  for (const d of Object.keys(DIMS)) {
    const a = ((mean(assessAvg[d] || [2]) - 1) / 3) * 100;
    const subs = (ACADEMIC_DIM[d] || []).filter((k) => ac[k] != null);
    const b = subs.length ? mean(subs.map((k) => ac[k])) * 10 : 60;
    let boost = 0;
    for (const tag of interests) {
      const m = INTEREST_DIM[tag];
      if (m && m[d]) boost += m[d] * 12;
    }
    out[d] = clamp(0.6 * a + 0.25 * b + Math.min(18, boost));
  }
  return out;
}

export function dimLevel(v) {
  return v >= 75 ? 'Cao' : v >= 60 ? 'Khá cao' : v >= 45 ? 'Trung bình' : 'Đang phát triển';
}

const ARCH = {
  'creativity+communication': { name: 'Nhà truyền thông sáng tạo', tagline: 'Suy nghĩ bằng hình ảnh, thuyết phục bằng câu chuyện.', description: 'Bạn có xu hướng nổi bật ở khả năng truyền đạt ý tưởng và tạo ra nội dung mới. Dữ liệu tham khảo cho thấy các hướng nghề gắn với truyền thông, marketing và sáng tạo nội dung sẽ phát huy điểm mạnh của bạn.' },
  'technology+analysis': { name: 'Chiến lược dữ liệu công nghệ', tagline: 'Suy nghĩ bằng số liệu, hành động bằng công nghệ.', description: 'Bạn có xu hướng tư duy phân tích mạnh và hứng thú với công nghệ. Các nhóm ngành dữ liệu, hệ thống thông tin và kinh tế số phù hợp với cách bạn tiếp cận vấn đề.' },
  'communication+empathy': { name: 'Người kết nối & phục vụ', tagline: 'Đọc được người khác, kết nối họ lại với nhau.', description: 'Bạn nhạy với cảm xúc của người khác và giao tiếp tốt. Dữ liệu tham khảo cho thấy các lĩnh vực dịch vụ, khách sạn – nhà hàng và kinh doanh sẽ phát huy thế mạnh con người của bạn.' },
  'organization+analysis': { name: 'Người tổ chức & vận hành', tagline: 'Mọi thứ đều có quy trình — và bạn giữ cho nó chạy trơn.', description: 'Bạn có xu hướng làm việc có kế hoạch và suy nghĩ có hệ thống. Các nhóm ngành vận hành, logistics và quản trị quy trình phù hợp với điểm mạnh này.' },
  'technology+creativity': { name: 'Người dựng sản phẩm số', tagline: 'Biến ý tưởng thành thứ chạy được.', description: 'Bạn kết hợp tư duy công nghệ với óc sáng tạo. Các nhóm ngành sản phẩm số, công nghệ và nội dung số phù hợp với cách bạn làm việc.' },
  'communication+analysis': { name: 'Cầu nối phân tích – truyền thông', tagline: 'Hiểu số liệu, kể lại cho người khác hiểu.', description: 'Bạn có thể vừa đọc số liệu vừa truyền đạt lại rõ ràng. Các nhóm ngành tư vấn, phân tích kinh doanh và truyền thông phù hợp với thế mạnh kép này.' },
  'empathy+organization': { name: 'Người điều phối tận tâm', tagline: 'Chăm chỉ giữ mọi việc đúng nhịp vì mọi người.', description: 'Bạn vừa tinh tế với con người vừa có tổ chức. Các nhóm ngành dịch vụ khách hàng, vận hành dịch vụ và quản trị phù hợp với xu hướng này.' },
};

export function personaOf(dims) {
  const sorted = Object.entries(dims).sort((a, b) => b[1] - a[1]);
  const [t1, v1] = sorted[0];
  const [t2, v2] = sorted[1];
  const arch = ARCH[`${t1}+${t2}`] || ARCH[`${t2}+${t1}`] || {
    name: `Hồ sơ nổi bật về ${DIMS[t1].label.toLowerCase()}`,
    tagline: 'Dữ liệu tham khảo từ đánh giá & học lực hiện tại.',
    description: 'Dữ liệu hiện tại cho thấy xu hướng nổi bật nhất của bạn. Kết quả chỉ mang tính tham khảo.',
  };
  const entry = (d) => ({ dim: d, label: DIMS[d].label, value: dims[d], level: dimLevel(dims[d]) });
  const all = Object.keys(DIMS).map(entry);
  return {
    ...arch,
    dims,
    entries: all,
    strengths: [entry(t1), entry(t2)],
    devAreas: [entry(sorted[sorted.length - 1][0]), entry(sorted[sorted.length - 2][0])],
    top: [{ dim: t1, value: v1 }, { dim: t2, value: v2 }],
  };
}

// ---------- Lĩnh vực (Field Fit Score: học lực 30% + sở thích 30% + tính cách 20% + nguyện vọng nêu ra 20%) ----------
export function recommendFields(st) {
  const dims = computeDims(st);
  const ac = st.academic.current;
  const interests = st.profile.interests || [];
  const declared = st.profile.declared || [];
  return FIELDS.map((f) => {
    const subs = f.subs.filter((k) => ac[k] != null);
    const academicFit = subs.length ? mean(subs.map((k) => ac[k])) * 10 : 50;
    const matchedI = f.tags.filter((t) => interests.includes(t)).length;
    const interestFit = 40 + (matchedI / Math.max(1, f.tags.length)) * 60;
    const wsum = Object.values(f.dims).reduce((s, v) => s + v, 0);
    const personalityFit = Object.entries(f.dims).reduce((s, [d, w]) => s + w * dims[d], 0) / wsum;
    const matchedD = f.tags.filter((t) => declared.includes(t)).length;
    const statedPref = declared.length === 0 ? 50 : 40 + (matchedD / Math.max(1, f.tags.length)) * 60;
    const score = clamp(0.3 * academicFit + 0.3 * interestFit + 0.2 * personalityFit + 0.2 * statedPref);
    const level = score >= 80 ? 'high' : score >= 65 ? 'mid' : 'low';
    const levelLabel = level === 'high' ? 'Mức độ phù hợp cao' : level === 'mid' ? 'Đáng cân nhắc' : 'Cần cân nhắc thêm';
    const subsText = subs.map((k) => SUBJECT_LABELS[k]).join(', ');
    const matchedTags = f.tags.filter((t) => interests.includes(t));
    const topDim = Object.entries(f.dims).sort((a, b) => b[1] - a[1])[0][0];
    const reasons = [
      subs.length
        ? `Dữ liệu hiện tại cho thấy điểm ${subsText} trung bình ${r1(mean(subs.map((k) => ac[k])))}/10 — nền tảng học lực tốt cho nhóm ngành này.`
        : 'Chưa có dữ liệu học lực rõ ràng cho nhóm môn của lĩnh vực này.',
      `Mức độ nổi bật "${DIMS[topDim].label}" (${dimLevel(dims[topDim]).toLowerCase()}) khớp với đặc trưng công việc của lĩnh vực.`,
      matchedTags.length
        ? `Sở thích đã chọn (${matchedTags.join(', ')}) trùng với hướng nội dung của lĩnh vực.`
        : 'Bạn chưa chọn sở thích liên quan — có thể cập nhật lại trong hồ sơ để gợi ý sát hơn.',
    ];
    return { field: f, score, level, levelLabel, reasons, academicFit: Math.round(academicFit), interestFit: Math.round(interestFit), personalityFit: Math.round(personalityFit), statedPref: Math.round(statedPref) };
  }).sort((a, b) => b.score - a.score);
}

// ---------- Phương án môn học THPT (khác với tổ hợp xét tuyển đại học) ----------
const CANDIDATE_PLANS = [
  { id: 'p_tat', subjects: ['toan', 'anh', 'tin'], name: 'Toán · Tiếng Anh · Tin học' },
  { id: 'p_tva', subjects: ['toan', 'van', 'anh'], name: 'Toán · Ngữ văn · Tiếng Anh' },
  { id: 'p_tak', subjects: ['toan', 'anh', 'kdpl'], name: 'Toán · Tiếng Anh · Kinh tế & Pháp luật' },
  { id: 'p_tvh', subjects: ['toan', 'van', 'hoa'], name: 'Toán · Ngữ văn · Hóa học' },
];

export function recommendSubjectPlans(st) {
  const ac = st.academic.current;
  const sel = st.selectedFields.map((id) => FIELDS.find((f) => f.id === id)).filter(Boolean);
  const want = new Set(sel.flatMap((f) => f.subs));
  return CANDIDATE_PLANS.map((p) => {
    const acad = mean(p.subjects.map((k) => ac[k] ?? 6)) * 10;
    const overlap = p.subjects.filter((k) => want.has(k)).length / p.subjects.length;
    const score = clamp(0.65 * acad + 0.35 * overlap * 100);
    const relFields = FIELDS.filter((f) => f.subs.some((k) => p.subjects.includes(k))).map((f) => f.name).slice(0, 4);
    const strongSubs = p.subjects.filter((k) => (ac[k] ?? 0) >= 8).map((k) => SUBJECT_LABELS[k]);
    const weakest = p.subjects.slice().sort((a, b) => (ac[a] ?? 10) - (ac[b] ?? 10))[0];
    return {
      ...p,
      score,
      labels: p.subjects.map((k) => SUBJECT_LABELS[k]),
      relatedFields: relFields,
      why: `Phương án phủ ${Math.round(overlap * 100)}% nhu cầu môn học của ${sel.length} lĩnh vực bạn chọn, gồm ${strongSubs.length} môn bạn đang có điểm từ 8.0.`,
      strengths: strongSubs.length ? strongSubs : ['Cân bằng giữa các khối môn'],
      tradeOffs: [
        `${SUBJECT_LABELS[weakest]} hiện ${(ac[weakest] ?? 6).toFixed(1)}/10 — môn cần đầu tư thời gian nhiều nhất trong phương án này.`,
        'Đây là gợi ý môn học trên lớp, khác với tổ hợp xét tuyển đại học về sau.',
      ],
    };
  }).sort((a, b) => b.score - a.score).slice(0, 3);
}

// ---------- Ngành (Major Fit Score: học lực 30% + sở thích 25% + năng lực 20% + gắn nghề 15% + thị trường 10%) ----------
export function recommendMajors(st) {
  const dims = computeDims(st);
  const fieldsRec = recommendFields(st);
  const fieldScore = Object.fromEntries(fieldsRec.map((f) => [f.field.id, f.score]));
  const selFields = st.selectedFields.length ? st.selectedFields : fieldsRec.slice(0, 3).map((f) => f.field.id);
  const pool = MAJORS.filter((m) => selFields.includes(m.fieldId));
  MAJORS.forEach((m) => {
    if (!pool.includes(m) && (fieldScore[m.fieldId] ?? 0) >= 70) pool.push(m);
  });
  return pool.map((m) => {
    const f = FIELDS.find((x) => x.id === m.fieldId);
    const subs = m.subs.filter((k) => st.academic.current[k] != null);
    const academic = subs.length ? mean(subs.map((k) => st.academic.current[k])) * 10 : 50;
    const tags = f ? f.tags : [];
    const matchedI = tags.filter((t) => (st.profile.interests || []).includes(t)).length;
    const interest = 40 + (matchedI / Math.max(1, tags.length)) * 60;
    const wsum = Object.values(m.dims).reduce((s, v) => s + v, 0);
    const competency = Object.entries(m.dims).reduce((s, [d, w]) => s + w * dims[d], 0) / wsum;
    const alignment = clamp(0.6 * (fieldScore[m.fieldId] ?? 50) + 0.4 * competency);
    const score = clamp(0.3 * academic + 0.25 * interest + 0.2 * competency + 0.15 * alignment + 0.1 * m.market);
    const topDims = Object.entries(m.dims).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([d]) => DIMS[d].label);
    const why = `Hệ thống đề xuất vì mức độ nổi bật "${topDims.join('" & "')}" khớp với yêu cầu ngành, và dữ liệu học lực nhóm ${subs.map((k) => SUBJECT_LABELS[k]).join(', ') || 'chưa rõ'} đang ${academic >= 75 ? 'ổn định' : 'cần cải thiện'}.`;
    return {
      major: m, score,
      level: score >= 80 ? 'high' : score >= 65 ? 'mid' : 'low',
      parts: { academic: Math.round(academic), interest: Math.round(interest), competency: Math.round(competency), alignment, market: m.market },
      why, devArea: m.devArea,
    };
  }).sort((a, b) => b.score - a.score).slice(0, 5);
}

// ---------- Điều kiện xét tuyển (demo, year-aware) ----------
export function comboScore(st, subjectKeys) {
  const ac = st.academic.current;
  const vals = subjectKeys.map((k) => ac[k] ?? 5);
  return r1(Math.min(30, mean(vals) * 3));
}

const STATUS_RANK = { ok: 0, partial: 1, no: 2 };

export function eligibility(st, m, year = 2026) {
  const bench = (m.benchmarks?.[year] ?? m.benchmark) || 24;
  if (m.id === 'thpt') {
    const cur = comboScore(st, COMBOS[m.combo || 'A01'].subjects);
    const gap = r1(bench - cur);
    if (gap <= 1) return { status: 'ok', note: `Điểm quy đổi hiện tại ${cur} đã đạt ngưỡng ${bench} (demo).`, current: cur, gap: Math.min(0, gap) };
    if (gap <= 3) return { status: 'partial', note: `Còn thiếu ${gap} điểm so với ngưỡng ${bench} (demo).`, current: cur, gap };
    return { status: 'no', note: `Thiếu ${gap} điểm so với ngưỡng ${bench} (demo) — nên cân nhắc phương thức khác.`, current: cur, gap };
  }
  if (m.id === 'hba') {
    const gpa = r1(mean(Object.values(st.academic.current)));
    if (gpa >= bench) return { status: 'ok', note: `GPA học bạ hiện tại ${gpa} đạt ngưỡng ${bench} (demo).` };
    if (gpa >= bench - 0.3) return { status: 'partial', note: `GPA ${gpa} — cần nâng thêm ${(bench - gpa).toFixed(1)} điểm (demo).` };
    return { status: 'no', note: `GPA ${gpa} dưới ngưỡng học bạ ${bench} (demo).` };
  }
  if (m.id === 'kthop') {
    const certs = (st.certificates || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const lang = certs.find((c) => ['IELTS', 'VSTEP', 'TOEIC'].includes(c.type));
    if (lang && lang.score >= bench) return { status: 'ok', note: `${lang.type} ${lang.score} (mới nhất) đạt yêu cầu của phương thức (demo).` };
    if (lang && lang.score >= bench - 0.5) return { status: 'partial', note: `${lang.type} ${lang.score} — còn thiếu ${(bench - lang.score).toFixed(1)} điểm; lộ trình sẽ ưu tiên luyện chứng chỉ (demo).` };
    if (lang) return { status: 'no', note: `${lang.type} ${lang.score} (mới nhất) chưa đạt ngưỡng ${bench} của phương thức (demo).` };
    if (st.profile.ielts && st.profile.ielts >= bench) return { status: 'ok', note: `IELTS ${st.profile.ielts} đạt yêu cầu của phương thức (demo).` };
    if ((st.academic.current.anh ?? 0) >= 8) return { status: 'partial', note: 'Chưa có điểm chứng chỉ — nhập IELTS/SAT/HSA ở trang Cập nhật điểm.' };
    return { status: 'no', note: 'Chưa có chứng chỉ ngoại ngữ theo yêu cầu của phương thức (demo).' };
  }
  return { status: 'partial', note: 'Phương thức demo — dữ liệu tham khảo.' };
}

// ---------- Trường (University Fit Score: khớp ngành 35% + tương thích XT 25% + học lực mục tiêu 20% + vị trí 10% + chi phí 10%) ----------
export function recommendUniversities(st, majorId, filters = {}) {
  if (!majorId) return [];
  const combo = comboScore(st, COMBOS.A01.subjects);
  const year = filters.year || 2026;
  let progs = PROGRAMS.filter((p) => p.majorId === majorId);
  if (filters.maxTuition) progs = progs.filter((p) => p.tuition <= filters.maxTuition);
  if (filters.district && filters.district !== 'Tất cả') progs = progs.filter((p) => UNIVERSITIES.find((u) => u.id === p.uniId).district === filters.district);
  return progs.map((p) => {
    const uni = UNIVERSITIES.find((u) => u.id === p.uniId);
    const methods = (p.methods || defaultMethods(p)).map((m) => ({ m, e: eligibility(st, m, year) }));
    const best = methods.slice().sort((a, b) => STATUS_RANK[a.e.status] - STATUS_RANK[b.e.status])[0];
    const compat = best.e.status === 'ok' ? 100 : best.e.status === 'partial' ? 60 : 25;
    const bench = p.benchmark[year]?.score ?? p.benchmark[2026].score;
    const targetFit = clamp(100 - Math.max(0, bench - combo) * 14);
    const loc = clamp(100 - p.distance * 4, 25);
    const cost = clamp(100 - Math.max(0, p.tuition - 15) * 5, 25);
    const match = clamp(60 + UNIVERSITIES.find((u) => u.id === p.uniId).strengthScore * 1);
    const score = clamp(0.35 * match + 0.25 * compat + 0.2 * targetFit + 0.1 * loc + 0.1 * cost);
    const why = [
      best.e.note,
      `Cách nhà ${p.distance} km so với khu vực bạn đang ở (demo).`,
      `Học phí demo ${p.tuition} triệu/năm ${p.tuition <= 18 ? '— thấp hơn mặt bằng' : '— cần cân nhắc ngân sách gia đình'}.`,
      uni.note,
    ];
    return { program: p, uni, score, status: best.e.status, why, bench, combo, methods };
  }).filter((r) => (filters.onlyCompatible ? r.status !== 'no' : true))
    .sort((a, b) => b.score - a.score);
}

function defaultMethods(p) {
  return [
    { id: 'thpt', label: 'Điểm thi THPT', combo: 'A01', benchmark: p.benchmark[2026].score, benchmarks: { 2026: p.benchmark[2026].score, 2025: p.benchmark[2025].score } },
    { id: 'hba', label: 'Xét học bạ', benchmarks: { 2026: 8.5, 2025: 8.5 }, demo: true },
    { id: 'kthop', label: 'Xét tuyển kết hợp (chứng chỉ)', benchmarks: { 2026: 5.5, 2025: 5.5 }, demo: true },
  ];
}

// ---------- Gap analysis ----------
// Mục tiêu xét kết hợp (chứng chỉ) tách 2 tiêu chuẩn: chứng chỉ (band riêng) & điểm văn hóa quy đổi /30 —
// tránh lệch thang đo (band IELTS đứng cạnh thang 30 điểm).
export function gapFor(st, target) {
  const comboKeys = COMBOS[target.combo || 'A01'].subjects;
  if (target.methodId === 'kthop') {
    const certs = (st.certificates || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const cert = certs.find((c) => c.type === (target.certType || 'IELTS')) || certs.find((c) => CERT_TO_TEN[c.type]) || null;
    const certType = cert?.type || target.certType || 'IELTS';
    const certTarget = target.certScore ?? target.benchmark ?? 5.5;
    const certCurrent = cert ? cert.score : null;
    const anhCurrent = certCurrent != null ? certToTen(certType, certCurrent) : (st.academic.current.anh ?? 0);
    const anhTarget = certToTen(certType, certTarget);
    const subjects = comboKeys.map((k) => {
      const cur = k === 'anh' ? anhCurrent : (st.academic.current[k] ?? 0);
      const t = k === 'anh' ? anhTarget : (target.cultureScores?.[k] ?? r1((target.targetScore ?? 24) / 3));
      return { key: k, label: `${SUBJECT_LABELS[k]}${k === 'anh' ? ` (quy đổi từ ${certType})` : ''}`, current: cur, targetScore: t, gap: r1(Math.max(0, t - cur)) };
    }).sort((a, b) => b.gap - a.gap);
    const current = r1(subjects.reduce((n, x) => n + x.current, 0));
    const tgt = r1(subjects.reduce((n, x) => n + x.targetScore, 0));
    return {
      mode: 'cert', certType, certCurrent, certTarget,
      certGap: certCurrent != null ? r1(Math.max(0, certTarget - certCurrent)) : null,
      anhCurrentConverted: anhCurrent, anhTargetConverted: anhTarget,
      current, target: tgt, gap: r1(Math.max(0, tgt - current)), subjects,
    };
  }
  const current = comboScore(st, comboKeys);
  const subjects = comboKeys.map((k) => {
    const cur = st.academic.current[k] ?? 0;
    const t = r1(target.targetScore / 3);
    return { key: k, label: SUBJECT_LABELS[k], current: cur, targetScore: t, gap: r1(Math.max(0, t - cur)) };
  }).sort((a, b) => b.gap - a.gap);
  return { mode: target.methodId === 'hba' ? 'gpa' : 'thpt', current, target: target.targetScore, gap: r1(Math.max(0, target.targetScore - current)), subjects };
}

// ---------- Lộ trình 12 tuần ----------
const POOL = {
  toan: ['Hàm số & đồ thị', 'Hệ thức lượng trong tam giác', 'Xác suất & thống kê cơ bản', 'Luyện đề Toán dạng cơ bản', 'Rèn tốc độ làm bài 90 phút'],
  anh: ['Từ vựng học thuật theo chủ đề', 'Ngữ pháp điểm cao', 'Chiến lược đọc hiểu', 'Luyện đề Tiếng Anh chuẩn cấu trúc', 'Phần speaking & viết cơ bản'],
  van: ['Nghị luận xã hội – dựng khung nhanh', 'Phân tích tác phẩm', 'Viết trong 50 phút – luyện nhịp', 'Mở bài & luận điểm mẫu'],
  ly: ['Cơ học nền tảng', 'Điện & mạch điện', 'Luyện đề Vật lý theo chuyên đề'],
  tin: ['Excel/Sheets – xử lý dữ liệu', 'Tư duy thuật toán cơ bản', 'SQL & truy vấn cơ sở dữ liệu', 'Làm quen công cụ AI hỗ trợ học'],
  kdpl: ['Nội dung trọng tâm lớp 11–12', 'Luyện đề Kinh tế & Pháp luật', 'Tình huống thực tế doanh nghiệp'],
  hoa: ['Cấu tạo nguyên tử & liên kết', 'Luyện đề Hóa theo chuyên đề'],
};

const CERT_POOL = {
  IELTS: ['Từ vựng học thuật theo chủ đề & collocation', 'Listening – luyện nghe chi tiết', 'Reading – skimming & scanning', 'Writing Task 1 & 2 – khung bài viết', 'Speaking Part 1–3 – luyện phản xạ', 'Luyện đề IELTS full 2h45'],
  VSTEP: ['Từ vựng & ngữ pháp bám khung năng lực', 'Luyện đọc hiểu 4 phần', 'Luyện nghe tình huống giao tiếp', 'Viết – mẫu bài & luyện nhịp', 'Speaking – trả lời & thảo luận', 'Luyện đề VSTEP chuẩn cấu trúc'],
  TOEIC: ['Từ vựng TOEIC theo chủ đề công việc', 'Part 1–2 – nghe hội thoại ngắn', 'Part 3–4 – nghe bài dài', 'Part 5–7 – ngữ pháp & đọc hiểu', 'Luyện đề TOEIC full 2 giờ'],
  SAT: ['Toán SAT – không dùng máy tính', 'Reading – Evidence-based', 'Writing & Language – ngữ pháp', 'Luyện đề SAT theo module', 'Chiến lược quản lý thời gian'],
};

// Lộ trình tùy biến theo phương thức xét tuyển của mục tiêu:
// - kthop (chứng chỉ): luyện chứng chỉ theo điểm mới nhất + xen nhiệm vụ môn tổ hợp
// - hba (học bạ): trọng tâm bài kiểm tra trên lớp để nâng GPA
// - thpt: ôn theo khoảng cách từng môn trong tổ hợp
export function buildRoadmap(st, gap, target) {
  const methodId = target.methodId || 'thpt';
  const certMode = methodId === 'kthop';
  const hbaMode = methodId === 'hba';

  if (certMode) {
    const certs = (st.certificates || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const cert = certs.find((c) => c.type === (target.certType || 'IELTS')) || certs.find((c) => CERT_POOL[c.type]) || null;
    const type = cert ? cert.type : (target.certType || 'IELTS');
    const required = target.certScore ?? target.benchmark ?? 5.5;
    const currentCert = cert ? cert.score : 0;
    const certGap = r1(Math.max(0, required - currentCert));
    const topics = CERT_POOL[type];
    const weakKeys = gap.subjects.filter((x) => x.gap > 0).map((x) => x.key);
    for (const k of ['toan', 'anh', 'van']) {
      if (weakKeys.length >= 2) break;
      if (!weakKeys.includes(k)) weakKeys.push(k);
    }
    const weeks = [];
    for (let i = 1; i <= 12; i++) {
      const support = i % 4 === 0; // tuần 4/8/12: xen nhiệm vụ môn trong tổ hợp
      const sKey = weakKeys[(Math.ceil(i / 4) - 1) % weakKeys.length];
      const sLabel = SUBJECT_LABELS[sKey];
      const topic = support ? `Ôn ${sLabel} — nền tảng cho tổ hợp ${target.combo}` : topics[(i - 1) % topics.length];
      const certF = clamp(certGap * 120, 25, 100);
      const gapSub = gap.subjects.find((x) => x.key === sKey);
      const gapF = support ? clamp((gapSub?.gap ?? 0.5) * 60, 20, 100) : 30;
      const goal = 70;
      const urgency = clamp(30 + i * 3, 30, 70);
      const priority = clamp(0.5 * (support ? gapF : certF) + 0.3 * goal + 0.2 * urgency);
      const checkpoint = i === 4 ? `Mini-test ${sLabel} — kiểm tra nền tảng` : i === 8 ? `Thi thử ${type} — đo điểm hiện tại` : i === 12 ? 'Thi thật & cập nhật điểm chứng chỉ mới nhất' : null;
      weeks.push({
        id: `w${i}`,
        theme: support ? `Hỗ trợ tổ hợp ${target.combo}: ${sLabel}` : `${type} · ${topics[(i - 1) % topics.length]}`,
        subjectKey: support ? sKey : 'cert', label: support ? sLabel : type, topics: [topic],
        tasks: support
          ? [`Hoàn thành bài ôn "${topic}"`, `Luyện 1 đề/chuyên đề ${sLabel} (45–60 phút)`]
          : [`Hoàn thành bài luyện "${topic}"`, `Luyện kỹ năng với đề ${type} (45–60 phút)`],
        effort: '8–10 giờ/tuần',
        checkpoint,
        factors: { gap: support ? gapF : certF, goal, urgency }, priority,
      });
    }
    return {
      generatedAt: new Date().toISOString(), targetId: target.id, targetLabel: `${target.uniShort} — ${target.majorName}`,
      methodId, methodLabel: target.methodLabel || 'Xét kết hợp (chứng chỉ)', mode: 'cert', certType: type, certCurrent: currentCert, certRequired: required,
      weeks, done: {}, tasksDone: {},
    };
  }

  const order = gap.subjects.filter((s) => s.gap > 0).map((s) => s.key);
  const pad = hbaMode ? ['toan', 'van', 'anh', 'ly', 'hoa', 'tin', 'kdpl'] : ['toan', 'anh', 'van', 'tin', 'kdpl', 'ly'];
  for (const k of pad) {
    if (order.length >= (hbaMode ? 4 : 3)) break;
    if (!order.includes(k)) order.push(k);
  }
  const weeks = [];
  for (let i = 1; i <= 12; i++) {
    const key = order[(i - 1) % order.length];
    const label = SUBJECT_LABELS[key];
    const topics = hbaMode
      ? [`Chuyên đề ${label} trọng tâm chương trình`, `Bài kiểm tra trên lớp — luyện đề ${label}`].slice(0, 1 + (i % 2))
      : POOL[key].slice(0, 2 + (i % 2));
    const gapSub = gap.subjects.find((s) => s.key === key);
    const gapF = gapSub ? clamp(gapSub.gap * 60, 20, 100) : 40;
    const goal = 70;
    const urgency = clamp(30 + i * 3, 30, 70);
    const factors = { gap: gapF, goal, urgency };
    const priority = clamp(0.5 * gapF + 0.3 * goal + 0.2 * urgency);
    const checkpoint = i === 4
      ? (hbaMode ? `Bài kiểm tra trên lớp ${label} — đạt mục tiêu cột điểm` : `Mini-test ${label} — kiểm tra tiến độ`)
      : i === 8
        ? (hbaMode ? 'Rà soát GPA học bạ kỳ hiện tại' : 'Thi thử chuẩn hóa theo cấu trúc đề')
        : i === 12
          ? (hbaMode ? 'Tổng kết GPA học bạ 12 tuần' : 'Tổng kết 12 tuần & tái đánh giá khoảng cách')
          : null;
    const taskVerb = hbaMode ? 'bài kiểm tra trên lớp' : 'đề/chuyên đề';
    weeks.push({
      id: `w${i}`, theme: hbaMode ? `GPA học bạ: ${label}` : `${label}: ${topics[0]}`, subjectKey: key, label, topics,
      tasks: topics.map((t) => `Hoàn thành bài ôn "${t}" — ${label}`).concat([`Luyện 1 ${taskVerb} ${label} (45–60 phút)`]),
      effort: i <= 4 ? '9–10 giờ/tuần' : '8–9 giờ/tuần',
      checkpoint, factors, priority,
    });
  }
  return {
    generatedAt: new Date().toISOString(), targetId: target.id, targetLabel: `${target.uniShort} — ${target.majorName}`,
    methodId, methodLabel: target.methodLabel || (hbaMode ? 'Xét học bạ' : 'Điểm thi THPT'), mode: hbaMode ? 'gpa' : 'thpt',
    weeks, done: {}, tasksDone: {},
  };
}

// ---------- Hành trình ----------
export function journey(st) {
  const checks = [
    st.assessment.completed,
    st.selectedFields.length >= 3,
    !!st.subjectPlan,
    st.selectedMajors.length >= 1,
    st.shortlist.length >= 1,
    st.targets.length >= 1,
    !!st.roadmap,
  ];
  const percent = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return { done1: checks[0], done2: checks.slice(1, 5).every(Boolean), done3: checks[5] && checks[6], percent, checks };
}

export function nextAction(st) {
  const doneWeeks = st.roadmap ? st.roadmap.weeks.filter((w) => st.roadmap.done[w.id]).length : 0;
  if (!st.assessment.completed) return { path: '/assessment', title: 'Hoàn thành bài đánh giá 12 câu', desc: 'Chỉ mất 3–5 phút để hệ thống hiểu xu hướng của bạn.', cta: 'Làm bài đánh giá' };
  if (!st.subjectPlan) return { path: '/subjects', title: 'Chọn phương án môn học cho năm học này', desc: 'Gợi ý 3 phương án môn học dựa trên học lực và lĩnh vực bạn đã chọn.', cta: 'Xem phương án môn học' };
  if (!st.selectedMajors.length) return { path: '/majors', title: 'Chọn 1–2 ngành học mục tiêu', desc: 'Dữ liệu hiện tại cho thấy một số ngành phù hợp — hãy chọn để tiếp tục.', cta: 'Xem ngành đề xuất' };
  if (!st.shortlist.length) return { path: '/universities', title: 'Lưu danh sách trường phù hợp', desc: 'Lọc theo ngành, học phí, khu vực và khả năng xét tuyển.', cta: 'Xem trường đề xuất' };
  if (!st.targets.length) return { path: '/admission', title: 'Tạo mục tiêu xét tuyển đầu tiên', desc: 'Chọn trường – ngành – phương thức và đặt điểm mục tiêu.', cta: 'Chọn phương thức xét tuyển' };
  const needsCert = st.targets.some((t) => t.methodId === 'kthop');
  if (needsCert && !(st.certificates || []).length) return { path: '/academic', title: 'Thêm điểm chứng chỉ ngoại ngữ', desc: 'Mục tiêu của bạn dùng phương thức xét kết hợp — cần điểm chứng chỉ để lộ trình bám đúng phương án.', cta: 'Nhập điểm chứng chỉ' };
  if (!st.roadmap) return { path: '/gap', title: 'Phân tích khoảng cách & tạo lộ trình', desc: 'So sánh điểm hiện tại với mục tiêu để biết cần cải thiện môn nào.', cta: 'Xem phân tích khoảng cách' };
  if (doneWeeks < 12) return { path: '/roadmap', title: 'Tiếp tục lộ trình 12 tuần', desc: `Bạn đã hoàn thành ${doneWeeks}/12 tuần — tiếp tục duy trì nhịp học.`, cta: 'Mở lộ trình' };
  return { path: '/progress', title: 'Xem lại tiến độ tổng thể', desc: 'Bạn đã hoàn thành lộ trình demo — xem lại xu hướng điểm và điều chỉnh.', cta: 'Xem tiến độ' };
}