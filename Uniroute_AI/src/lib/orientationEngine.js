// orientationEngine.js — NV03 (B2–B3): gợi ý trường đại học theo ngành học sinh đã chọn.
// Chấm điểm có trọng số trên dữ liệu hồ sơ học sinh + dữ liệu tuyển sinh đã công bố (rule-based, không phải machine learning).

import { thptLabel } from '@/lib/thptSubjects';
import { THPT_COMPULSORY_KEYS } from '@/lib/scoreSubjects';

export const RIASEC_LABELS = { R: 'Kỹ thuật', I: 'Nghiên cứu', A: 'Sáng tạo', S: 'Xã hội', E: 'Kinh doanh', C: 'Tổ chức' };

// Trọng số mức độ phù hợp của trường với hồ sơ học sinh (tổng 100)
export const FIT_WEIGHTS = { academic: 45, subjects: 25, holland: 20, cost: 10 };

export const FIT_LABELS = {
  high: 'Mức độ phù hợp cao',
  mid: 'Đáng cân nhắc',
  low: 'Cần cân nhắc thêm',
};

const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, Math.round(v)));
const r1 = (v) => Math.round(v * 10) / 10;

// Điểm các môn học sinh đã ghi nhận (quy về thang 10) — lấy mức cao nhất đã nhập.
export function currentSubjectScores(records = []) {
  const out = {};
  for (const rec of records) {
    const scale = Number(rec.scale) || 10;
    for (const [key, value] of Object.entries(rec.scores || {})) {
      if (value == null || value === '') continue;
      const ten = r1(scale === 10 ? Number(value) : (Number(value) / scale) * 10);
      if (out[key] == null || ten > out[key]) out[key] = ten;
    }
  }
  return out;
}

// Các môn học lựa chọn THPT học sinh đã khai báo ở Hồ sơ (4 môn lựa chọn + môn cụm chuyên đề)
export function declaredSubjectKeys(profile) {
  if (!profile?.has_thpt_subjects) return [];
  return [...new Set([...(profile.thpt_electives || []), ...(profile.thpt_cluster_subjects || [])])];
}

// Hồ sơ còn thiếu gì để cá nhân hóa tư vấn (NV03 – B2)
export function personalizationGaps({ scores, declared, hollandTop }) {
  const gaps = [];
  if (!Object.keys(scores || {}).length) gaps.push({ label: 'Kết quả học tập', desc: 'nhập điểm học bạ / thi thử để đối chiếu điểm chuẩn', path: '/academic' });
  if (!(declared || []).length) gaps.push({ label: 'Môn học lựa chọn THPT', desc: 'khai báo môn học tại Hồ sơ để kiểm tra tổ hợp xét tuyển', path: '/profile' });
  if (!(hollandTop || []).length) gaps.push({ label: 'Kết quả Holland', desc: 'làm trắc nghiệm Holland để đối chiếu sở thích với ngành', path: '/assessment' });
  return gaps;
}

function scoreProgram({ program, university, scores, declared, hollandTop, riasecCodes, groupName }) {
  const combo = program.combination_subjects || [];
  const comboLabels = combo.map((k) => thptLabel(k));
  const known = combo.filter((k) => scores[k] != null);
  const comboScore = known.length ? r1(known.reduce((n, k) => n + scores[k], 0)) : null;
  const bench30 = program.benchmark_score == null ? null : program.benchmark_scale === 10 ? r1(program.benchmark_score * 3) : program.benchmark_score;
  const gap = comboScore != null && bench30 != null ? r1(bench30 - comboScore) : null;
  const benchYear = program.benchmark_year || program.year;

  const academic = comboScore == null || bench30 == null ? null : clamp(gap <= 0 ? 90 + Math.min(10, -gap * 3) : 90 - gap * 8);
  const covered = combo.filter((k) => declared.includes(k) || THPT_COMPULSORY_KEYS.includes(k));
  const subjects = combo.length ? clamp((covered.length / combo.length) * 100) : null;
  const hollandHits = riasecCodes.filter((c) => hollandTop.includes(c));
  const holland = !riasecCodes.length || !hollandTop.length ? null : hollandHits.length >= 2 ? 95 : hollandHits.length === 1 ? 72 : 38;
  const cost = program.tuition == null ? null : clamp(100 - Math.max(0, program.tuition - 18) * 3.5, 30);

  const parts = { academic, subjects, holland, cost };
  const used = Object.entries(parts).filter(([, v]) => v != null);
  const wsum = used.reduce((n, [k]) => n + FIT_WEIGHTS[k], 0);
  const score = used.length ? clamp(used.reduce((n, [k, v]) => n + FIT_WEIGHTS[k] * v, 0) / wsum) : 0;

  const reasons = [];
  if (comboScore != null && bench30 != null) {
    reasons.push(gap <= 0
      ? `Điểm tổ hợp ${program.combination || ''} hiện tại ${comboScore}/30 đã đạt mức điểm chuẩn ${bench30} (năm ${benchYear}).`
      : `Điểm tổ hợp ${program.combination || ''} hiện tại ${comboScore}/30 còn cách điểm chuẩn ${bench30} (năm ${benchYear}) khoảng ${gap} điểm.`);
  } else {
    reasons.push(`Chưa đủ điểm các môn trong tổ hợp ${program.combination || ''} để đối chiếu điểm chuẩn ${bench30 ?? '—'} (năm ${benchYear}).`);
  }
  if (combo.length) {
    reasons.push(declared.length
      ? `Tổ hợp gồm ${comboLabels.join(', ')} — bạn đã học ${covered.length}/${combo.length} môn này tại THPT.`
      : `Tổ hợp gồm ${comboLabels.join(', ')} — chưa khai báo môn học THPT nên chưa đối chiếu được.`);
  }
  if (hollandTop.length && riasecCodes.length) {
    reasons.push(hollandHits.length
      ? `Mã Holland ${hollandTop.join('')} khớp ${hollandHits.join('')} với mã ngành ${riasecCodes.join('')}${groupName ? ` (${groupName})` : ''}.`
      : `Mã Holland ${hollandTop.join('')} chưa khớp mã ngành ${riasecCodes.join('')} — nên cân nhắc thêm sở thích cá nhân.`);
  } else if (!hollandTop.length) {
    reasons.push('Chưa có kết quả Holland — mức phù hợp tính cách chưa được tính vào điểm gợi ý.');
  }
  if (program.tuition != null) {
    reasons.push(`Học phí công bố ${program.tuition} triệu/năm (${program.method_label || program.method}, năm ${program.year}).`);
  }

  return {
    program, university, score,
    level: score >= 80 ? 'high' : score >= 65 ? 'mid' : 'low',
    parts, comboLabels, comboScore, bench30, gap, reasons,
    comboCount: combo.length,
    coveredCount: covered.length,
    coveredAll: combo.length > 0 && covered.length === combo.length,
  };
}

// Gợi ý trường có đào tạo ngành học sinh đã đánh dấu quan tâm (mỗi trường giữ chương trình mới nhất)
export function suggestUniversitiesForMajor({ major, programs = [], universities = [], majors = [], majorGroups = [], scores = {}, declared = [], hollandTop = [] }) {
  const codes = new Set([major.id]);
  const catalogRec = majors.find((m) => m.code === major.id) || majors.find((m) => m.name === major.name) || null;
  if (catalogRec) codes.add(catalogRec.code);

  const uniByCode = Object.fromEntries(universities.map((u) => [u.code, u]));
  const group = majorGroups.find((g) => g.code === catalogRec?.major_group_code) || null;
  const riasecCodes = catalogRec?.riasec_codes?.length ? catalogRec.riasec_codes : group?.riasec_codes || [];
  const groupName = group?.name || (catalogRec ? 'nhóm ngành của bạn' : '');

  const rows = programs.filter((p) => codes.has(p.major_code));

  // Nhóm theo trường; mỗi phương thức xét tuyển giữ chương trình của năm mới nhất
  const byUni = new Map();
  rows.forEach((p) => {
    const code = p.university_code;
    if (!byUni.has(code)) byUni.set(code, { university_code: code, university_name: p.university_name, university: uniByCode[code] || null, byMethod: new Map() });
    const group = byUni.get(code);
    const cur = group.byMethod.get(p.method);
    if (!cur || p.year > cur.year) group.byMethod.set(p.method, p);
  });

  const items = [...byUni.values()].map((group) => {
    const scored = [...group.byMethod.values()]
      .map((p) => scoreProgram({ program: p, university: group.university, scores, declared, hollandTop, riasecCodes, groupName }))
      .sort((a, b) => b.score - a.score);
    const matchedCombos = [...new Set(scored.filter((s) => s.coveredAll).map((s) => s.program.combination).filter(Boolean))];
    const otherCombos = [...new Set(scored.map((s) => s.program.combination).filter((c) => c && !matchedCombos.includes(c)))];
    return {
      university_code: group.university_code,
      university_name: group.university_name,
      university: group.university,
      programs: scored,
      best: scored[0],
      matchedCombos,
      otherCombos,
    };
  }).sort((a, b) => b.best.score - a.best.score);

  return {
    items,
    riasecCodes,
    programCount: rows.length,
    durationYears: catalogRec?.duration_years ?? 4,
  };
}