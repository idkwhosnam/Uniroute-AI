// methodAdvice.js — NV04: phân loại phương thức xét tuyển của từng trường mục tiêu theo hồ sơ học sinh.
// Rule-based trên dữ liệu hồ sơ + dữ liệu tuyển sinh đã công bố (không phải machine learning).

import { thptLabel } from '@/lib/thptSubjects';
import { THPT_COMPULSORY_KEYS } from '@/lib/scoreSubjects';
import { currentSubjectScores, declaredSubjectKeys } from '@/lib/orientationEngine';
import { certLabel } from '@/lib/certifications';
import { latestProgramsByMethod, METHOD_LABELS } from '@/lib/admissionEngine';

export const ADVICE_GROUPS = {
  fit: {
    key: 'fit',
    label: 'Các PTXT phù hợp sơ bộ',
    subtitle: 'Có dấu hiệu phù hợp với năng lực hoặc môn học đã khai báo. Vẫn cần xác minh điều kiện chính thức.',
    badge: 'bg-[#D1FAE5] text-[#065F46]',
  },
  consider: {
    key: 'consider',
    label: 'Các PTXT có thể cân nhắc',
    subtitle: 'Chưa đủ dữ liệu để kết luận phù hợp — vẫn được tích chọn quan tâm, kèm việc cần bổ sung.',
    badge: 'bg-[#E5E7EB] text-[#374151]',
  },
};

export const LEVEL_LABELS = { fit: 'Phù hợp sơ bộ', consider: 'Có thể cân nhắc' };
export const LEVEL_TONE = { fit: 'teal', consider: 'gray' };

export const METHOD_DOCS = {
  thpt: {
    how: 'Xét điểm thi tốt nghiệp THPT theo tổ hợp trường công bố; áp dụng điều kiện đầu vào và quy tắc quy đổi (nếu có).',
    need: 'Có kết quả thi tốt nghiệp THPT hợp lệ; đạt ngưỡng đầu vào; đáp ứng điều kiện của ngành.',
  },
  aptitude: {
    how: 'Sử dụng điểm bài thi đánh giá năng lực được trường chấp nhận; quy đổi theo quy định của trường (nếu có).',
    need: 'Tham gia đúng kỳ thi được trường chấp nhận, có điểm thi hợp lệ và đáp ứng điều kiện của trường.',
  },
  cert: {
    how: 'Xét chứng chỉ quốc tế (IELTS/SAT/…) kết hợp điều kiện học lực theo quy định của trường.',
    need: 'Có chứng chỉ hợp lệ còn hiệu lực và đạt mức điểm tối thiểu trường yêu cầu.',
  },
  combo: {
    how: 'Kết hợp điểm học bạ/thi tốt nghiệp với chứng chỉ hoặc điểm thi riêng theo tỉ lệ trường quy định.',
    need: 'Đáp ứng đồng thời điều kiện học lực và chứng chỉ/điểm thi riêng theo đề án của trường.',
  },
};

const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, Math.round(v)));
const r1 = (v) => Math.round(v * 10) / 10;

function studentSignals(records = [], profile = null) {
  const scores = currentSubjectScores(records);
  const declared = declaredSubjectKeys(profile);
  const certifications = profile?.certifications || [];
  const certs = certifications.filter((c) => ['ielts', 'sat', 'hsa'].includes(c.type));
  return {
    scores,
    declared,
    certs,
    certText: certs.map((c) => `${certLabel(c.type)} ${c.score}`).join(', '),
    hasTranscript: records.some((r) => r.score_type === 'transcript'),
    hasTrial: records.some((r) => r.score_type === 'trial_exam'),
    hasAptitude: records.some((r) => r.score_type === 'aptitude_test') || certifications.some((c) => c.type === 'hsa'),
  };
}

// Phân loại một phương thức xét tuyển của một trường: lý do, mức độ phù hợp, việc cần bổ sung, thông tin tuyển sinh
export function adviseProgram({ program, siblings = [], records = [], profile = null, hollandTop = [], riasecCodes = [], groupName = '' }) {
  const sig = studentSignals(records, profile);
  const combo = program.combination_subjects || [];
  const comboLabels = combo.map(thptLabel);
  const comboText = combo.length ? comboLabels.join(', ') : program.combination || 'Theo bài thi hoặc điều kiện riêng';
  const known = combo.filter((k) => sig.scores[k] != null);
  const complete = combo.length > 0 && known.length === combo.length;
  const comboScore30 = complete ? r1(known.reduce((n, k) => n + sig.scores[k], 0) * 3) : null;
  const bench30 = program.benchmark_score == null ? null : program.benchmark_scale === 10 ? r1(program.benchmark_score * 3) : program.benchmark_score;
  const gap = comboScore30 != null && bench30 != null ? r1(bench30 - comboScore30) : null;
  const benchYear = program.benchmark_year || program.year;
  const covered = combo.filter((k) => sig.declared.includes(k) || THPT_COMPULSORY_KEYS.includes(k));
  const coveredAll = combo.length > 0 && covered.length === combo.length;
  const missing = combo.filter((k) => !sig.declared.includes(k) && !THPT_COMPULSORY_KEYS.includes(k));

  const reasons = [];
  const actions = [];
  let level = 'consider';

  if (program.method === 'thpt') {
    if (!sig.declared.length) {
      reasons.push('Chưa khai báo môn học lựa chọn THPT ở Hồ sơ nên chưa đối chiếu được tổ hợp xét tuyển.');
    } else if (missing.length) {
      reasons.push(`Bạn chưa học tại THPT các môn ${missing.map(thptLabel).join(', ')} của tổ hợp ${program.combination || ''}.`);
    } else if (combo.length) {
      reasons.push(`Các môn đã khai báo phù hợp tổ hợp ${program.combination || ''}.`);
    }
    if (comboScore30 != null && bench30 != null) {
      reasons.push(gap <= 0
        ? `Điểm tổ hợp hiện tại ${comboScore30}/30 đã đạt mức điểm chuẩn ${bench30} (năm ${benchYear}).`
        : `Điểm tổ hợp hiện tại ${comboScore30}/30 còn cách điểm chuẩn ${bench30} (năm ${benchYear}) khoảng ${gap} điểm.`);
    } else {
      reasons.push('Chưa có điểm thi tốt nghiệp để đối chiếu ngưỡng và điểm chuẩn; đánh giá hiện chỉ là định hướng.');
    }
    if (missing.length) actions.push(`Cân nhắc tự ôn các môn chưa học tại THPT: ${missing.map(thptLabel).join(', ')}.`);
    if (comboScore30 == null) actions.push('Nhập điểm học bạ hoặc điểm thi thử ở trang Cập nhật điểm để đối chiếu điểm chuẩn.');
    actions.push('Xác minh ngưỡng đầu vào và quy tắc quy đổi của trường trong năm tuyển sinh.');
    if (coveredAll && sig.declared.length && (gap == null || gap <= 3)) level = 'fit';
  } else if (program.method === 'aptitude') {
    if (sig.hasAptitude) {
      reasons.push(`Hồ sơ đã có kết quả đánh giá năng lực${sig.certText ? ` (${sig.certText})` : ''}.`);
      level = 'fit';
    } else {
      reasons.push('Chưa có kết quả kỳ thi đánh giá năng lực.');
    }
    if (sig.declared.length && combo.length) {
      reasons.push(`Tổ hợp ${program.combination || ''} gồm ${comboLabels.join(', ')} — bạn đã học ${covered.length}/${combo.length} môn này tại THPT.`);
    }
    actions.push('Đăng ký dự thi kỳ đánh giá năng lực mà trường chấp nhận và bổ sung kết quả.');
    actions.push('Xác minh kỳ thi, ngưỡng điểm và cách quy đổi của trường trong năm tuyển sinh.');
  } else if (program.method === 'cert') {
    if (sig.certs.length) {
      reasons.push(`Hồ sơ đã có ${sig.certText}.`);
      level = 'fit';
    } else {
      reasons.push('Chưa có chứng chỉ quốc tế (IELTS/SAT/ĐGNL) trong hồ sơ.');
    }
    if (sig.hasTranscript) reasons.push('Đã có điểm học tập để đối chiếu điều kiện học lực kèm theo của phương thức.');
    actions.push('Bổ sung chứng chỉ quốc tế (IELTS/SAT/…) nếu muốn theo phương thức này.');
    actions.push('Xác minh mức điểm chứng chỉ tối thiểu và thời hạn hiệu lực theo đề án của trường.');
  } else if (program.method === 'combo') {
    const ready = sig.certs.length && (sig.hasTrial || sig.hasAptitude || sig.hasTranscript);
    if (ready) {
      reasons.push(`Hồ sơ đã có điểm học tập/thi và ${sig.certText}.`);
      level = 'fit';
    } else {
      reasons.push('Phương thức này cần đồng thời điểm học tập/thi và chứng chỉ — hồ sơ hiện chưa đủ.');
    }
    actions.push('Hoàn thiện đồng thời điểm học tập/thi và chứng chỉ theo yêu cầu của đề án.');
    actions.push('Xác minh tỉ lệ kết hợp và điều kiện kèm theo trong đề án chính thức.');
  }

  const hits = riasecCodes.filter((c) => hollandTop.includes(c));
  if (hollandTop.length && riasecCodes.length) {
    reasons.push(hits.length
      ? `Mã Holland ${hollandTop.join('')} khớp ${hits.join('')} với mã ngành ${riasecCodes.join('')}${groupName ? ` (${groupName})` : ''}.`
      : `Mã Holland ${hollandTop.join('')} chưa khớp mã ngành ${riasecCodes.join('')} — nên cân nhắc thêm sở thích cá nhân.`);
  } else if (!hollandTop.length) {
    reasons.push('Chưa có kết quả Holland — mức phù hợp tính cách chưa được tính vào điểm đề xuất.');
  }

  const readiness = level === 'fit'
    ? (program.method === 'thpt' && comboScore30 != null ? (gap <= 0 ? 95 : clamp(95 - gap * 6)) : 88)
    : 52;
  const subjectPart = combo.length ? clamp((covered.length / combo.length) * 100) : 70;
  const weighted = [{ v: readiness, w: 0.6 }, { v: subjectPart, w: 0.25 }];
  if (hollandTop.length && riasecCodes.length) {
    weighted.push({ v: hits.length >= 2 ? 95 : hits.length === 1 ? 72 : 45, w: 0.15 });
  }
  const wsum = weighted.reduce((n, x) => n + x.w, 0);
  const score = clamp(weighted.reduce((n, x) => n + x.v * x.w, 0) / wsum);

  const history = (siblings || [])
    .filter((p) => p.method === program.method)
    .sort((a, b) => b.year - a.year)
    .map((p) => ({
      year: p.year,
      score: p.benchmark_score,
      scale: p.benchmark_scale,
      note: p.note || (p.benchmark_score != null ? 'Điểm trúng tuyển mô phỏng' : 'Chưa công bố điểm chuẩn'),
    }));

  const doc = METHOD_DOCS[program.method] || METHOD_DOCS.thpt;

  return {
    program,
    level,
    levelLabel: LEVEL_LABELS[level],
    score,
    comboText,
    comboLabels,
    comboScore30,
    bench30,
    gap,
    benchYear,
    reasons,
    actions: level === 'fit' ? [] : actions,
    history,
    info: {
      year: program.year,
      university_name: program.university_name,
      major_name: program.major_name,
      method_label: program.method_label || METHOD_LABELS[program.method] || program.method,
      combination: combo.length ? (program.combination || '') : 'Không dùng tổ hợp cố định',
      combinationLabels: comboLabels.length ? comboLabels.join(', ') : 'Theo bài thi hoặc điều kiện riêng',
      how: doc.how,
      conditions: program.conditions || doc.need,
      quota: program.quota,
      tuition: program.tuition,
      source_name: program.source_name,
      deadline: 'Thời hạn, chỉ tiêu và hồ sơ chưa có dữ liệu xác thực trong prototype — cần xem thông báo tuyển sinh chính thức của trường.',
    },
  };
}

// Tư vấn toàn bộ phương thức của (các) trường mục tiêu cho một ngành
export function adviseSelection({ majorCode, universityCodes = [], programs = [], records = [], profile = null, hollandTop = [], riasecCodes = [], groupName = '' }) {
  const items = [];
  universityCodes.forEach((code) => {
    const pair = programs.filter((p) => p.university_code === code && p.major_code === majorCode);
    latestProgramsByMethod(pair).forEach((program) => {
      items.push(adviseProgram({ program, siblings: pair, records, profile, hollandTop, riasecCodes, groupName }));
    });
  });

  const fit = items.filter((i) => i.level === 'fit').sort((a, b) => b.score - a.score);
  const consider = items.filter((i) => i.level === 'consider').sort((a, b) => b.score - a.score);

  return { items, fit, consider, counts: { fit: fit.length, consider: consider.length, total: items.length } };
}