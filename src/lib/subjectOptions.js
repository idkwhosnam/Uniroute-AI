// subjectOptions.js — Nghiệp vụ 02: điểm đầu vào lớp 10, phương án môn học của trường và xếp hạng đề xuất.
import { THPT_ELECTIVES, THPT_CLUSTER_SUBJECTS, thptLabel } from './thptSubjects';
import { SUBJECT_RIASEC } from './subjectEngine';

export const ENTRY_EXAM_LABEL = 'Thi tuyển sinh vào lớp 10';
export const GRADE9_LABEL = 'Lớp 9 cả năm';
export const OPTION_SOURCE_NOTE = 'Nhập từ Tư vấn môn học lớp 10';

export const ENTRY_EXAM_SUBJECTS = [
  { key: 'toan', label: 'Toán' },
  { key: 'van', label: 'Ngữ văn' },
  { key: 'anh', label: 'Tiếng Anh' },
];

export const GRADE9_SUBJECTS = [
  { key: 'toan', label: 'Toán' },
  { key: 'van', label: 'Ngữ văn' },
  { key: 'anh', label: 'Tiếng Anh' },
  { key: 'khtn', label: 'Khoa học tự nhiên' },
  { key: 'khxh', label: 'Khoa học xã hội' },
  { key: 'gdcd', label: 'Giáo dục công dân' },
];

export const OPTION_ELECTIVE_COUNT = 4;
export const OPTION_CLUSTER_COUNT = 3;

export const OPTION_WEIGHTS = { academic_strength: 0.5, holland_fit: 0.35, balance: 0.15 };

export const OPTION_CRITERIA_LABELS = {
  academic_strength: 'Học lực',
  holland_fit: 'Phù hợp Holland',
  balance: 'Cân bằng nhóm môn',
};

const sorted = (arr) => [...(arr || [])].sort();
const signature = (o) => `${sorted(o.electives).join('|')}__${sorted(o.cluster_subjects).join('|')}`;

// Trùng khi trùng cả danh sách môn học lựa chọn và cụm chuyên đề, bất kể thứ tự tích chọn.
export function isDuplicateOption(option, others = []) {
  return others.some((o) => signature(o) === signature(option));
}

export function validateSchoolOption(option, others = []) {
  const errors = [];
  const e = option.electives || [];
  const c = option.cluster_subjects || [];
  if (!(option.name || '').trim()) errors.push('Chưa nhập tên phương án trên phiếu');
  if (e.length !== OPTION_ELECTIVE_COUNT) errors.push(`Cần chọn đúng ${OPTION_ELECTIVE_COUNT} môn học lựa chọn, hiện có ${e.length} môn`);
  else if (e.some((k) => !THPT_ELECTIVES.some((s) => s.key === k))) errors.push('Có môn không thuộc 9 môn học lựa chọn');
  if (c.length !== OPTION_CLUSTER_COUNT) errors.push(`Cần chọn đúng ${OPTION_CLUSTER_COUNT} môn thuộc cụm chuyên đề, hiện có ${c.length} môn`);
  else if (c.some((k) => !THPT_CLUSTER_SUBJECTS.some((s) => s.key === k))) errors.push('Có môn không thuộc 13 môn của cụm chuyên đề');
  if (!errors.length && isDuplicateOption(option, others)) {
    errors.push('Phương án này trùng môn học và cụm chuyên đề với một phương án đã nhập');
  }
  return { valid: errors.length === 0, errors };
}

const SCORE_LABELS = [...ENTRY_EXAM_SUBJECTS, ...GRADE9_SUBJECTS].reduce(
  (m, s) => ({ ...m, [s.key]: s.label }), {},
);

export const scoreLabel = (key) => SCORE_LABELS[key] || thptLabel(key);

// Kiểm tra điểm nhập tay: bắt buộc, số, trong khoảng 0–10
export function validateScoreMap(scores, requiredKeys, scale = 10) {
  const errors = [];
  requiredKeys.forEach((k) => {
    const v = scores[k];
    if (v == null || v === '') errors.push(`Chưa nhập điểm môn ${scoreLabel(k)}`);
    else if (Number.isNaN(Number(v))) errors.push(`Điểm môn ${scoreLabel(k)} không hợp lệ`);
    else if (Number(v) < 0 || Number(v) > scale) errors.push(`Điểm môn ${scoreLabel(k)} phải trong khoảng 0–${scale}`);
  });
  return { valid: errors.length === 0, errors };
}

// ============ Xếp hạng phương án ============

const SCIENCE = ['toan', 'ly', 'hoa', 'sinh', 'tin', 'khtn'];
const SOCIAL = ['van', 'su', 'dia', 'anh', 'gdcd', 'khxh', 'kdpl'];
const ARTS = ['am_nhac', 'my_thuat'];
const TECH = ['cn'];

const groupNames = (keys) => {
  const g = [];
  if (keys.some((k) => SCIENCE.includes(k))) g.push('KHTN');
  if (keys.some((k) => SOCIAL.includes(k))) g.push('KHXH');
  if (keys.some((k) => ARTS.includes(k))) g.push('Nghệ thuật');
  if (keys.some((k) => TECH.includes(k))) g.push('Công nghệ');
  return g;
};

function scoreAcademic(option, scoreMap) {
  const keys = [...new Set([...(option.electives || []), ...(option.cluster_subjects || [])])];
  const vals = keys.map((k) => Number(scoreMap[k])).filter((v) => !Number.isNaN(v) && v > 0);
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return {
    value: Math.round(Math.min(100, (avg / 10) * 100)),
    avg: Math.round(avg * 100) / 100,
    count: vals.length,
  };
}

function scoreHolland(option, riasecScores) {
  if (!riasecScores) return null;
  const keys = [...new Set([...(option.electives || []), ...(option.cluster_subjects || [])])];
  let total = 0, count = 0;
  keys.forEach((k) => {
    const codes = SUBJECT_RIASEC[k];
    if (!codes) return;
    total += Math.max(...codes.map((r) => riasecScores[r] || 0));
    count++;
  });
  if (!count) return null;
  return { value: Math.round(Math.min(100, (total / count / 60) * 100)), count };
}

function scoreBalance(option) {
  const keys = [...(option.electives || []), ...(option.cluster_subjects || [])];
  return { value: Math.round((groupNames(keys).length / 4) * 100), groups: groupNames(keys) };
}

export function scoreSchoolOption(option, ctx = {}) {
  const breakdown = {};
  const explanations = {};
  const used = {};

  const academic = scoreAcademic(option, ctx.scoreMap || {});
  if (academic) {
    breakdown.academic_strength = academic.value;
    used.academic_strength = OPTION_WEIGHTS.academic_strength;
    explanations.academic_strength = `Điểm các môn trong phương án: ${academic.avg}/10 (${academic.count} môn có điểm)`;
  } else {
    explanations.academic_strength = 'Chưa có điểm học tập cho các môn trong phương án';
  }

  const holland = scoreHolland(option, ctx.hollandResult?.scores);
  if (holland) {
    breakdown.holland_fit = holland.value;
    used.holland_fit = OPTION_WEIGHTS.holland_fit;
    explanations.holland_fit = `Khớp với mã Holland ${ctx.hollandResult?.holland_code || ''}`;
  } else {
    explanations.holland_fit = 'Chưa có kết quả Holland — bỏ qua tiêu chí này';
  }

  const balance = scoreBalance(option);
  breakdown.balance = balance.value;
  used.balance = OPTION_WEIGHTS.balance;
  explanations.balance = balance.groups.length ? `Đa dạng nhóm môn: ${balance.groups.join(' + ')}` : 'Các môn cùng nhóm';

  const totalWeight = Object.values(used).reduce((a, b) => a + b, 0);
  let total = 0;
  Object.keys(used).forEach((k) => {
    total += (breakdown[k] / 100) * (used[k] / totalWeight) * 100;
  });

  return { total: Math.round(total), breakdown, explanations, usedWeights: used };
}

export function rankSchoolOptions(options = [], ctx = {}) {
  const scored = options.map((o) => ({ ...o, ...scoreSchoolOption(o, ctx) }));
  scored.sort((a, b) => b.total - a.total);
  let rank = 0, prev = -1;
  scored.forEach((o, i) => {
    if (o.total !== prev) { rank = i + 1; prev = o.total; }
    o.rank = rank;
  });
  return scored;
}