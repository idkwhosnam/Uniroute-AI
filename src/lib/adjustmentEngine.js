// adjustmentEngine.js — Nghiệp vụ 03: đánh giá tác động khi học sinh muốn điều chỉnh tổ hợp môn học THPT.
// Hệ thống CHỈ tư vấn — không xác nhận phương án chuyển đổi có được nhà trường cho phép hay không.
import { thptLabel } from './thptSubjects';
import { SUBJECT_RIASEC } from './subjectEngine';
import { RIASEC_KEYS, RIASEC_META, topGroups } from './hollandEngine';
import { rankSchoolOptions } from './subjectOptions';

export const CURRENT_OPTION_ID = '__current__';

export const subjectsOf = (option) => [
  ...new Set([...(option?.electives || []), ...(option?.cluster_subjects || [])]),
];

// Gộp điểm từ mọi thẻ điểm đã ghi nhận (học bạ, thi thử, năng lực) thành map môn -> điểm mới nhất.
export function mergeScoreMap(records = []) {
  const out = {};
  [...records]
    .sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0))
    .forEach((r) => {
      Object.entries(r.scores || {}).forEach(([k, v]) => {
        const n = Number(v);
        if (!Number.isNaN(n)) out[k] = n;
      });
    });
  return out;
}

// Hồ sơ RIASEC suy ra từ tập môn của một phương án (thang 0–60 để so sánh với điểm Holland).
export function subjectAffinity(keys = []) {
  const raw = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  keys.forEach((k) => {
    const codes = SUBJECT_RIASEC[k];
    if (!codes) return;
    codes.forEach((c, i) => { raw[c] += i === 0 ? 2 : 1; });
  });
  const max = Math.max(1, ...Object.values(raw));
  return Object.fromEntries(RIASEC_KEYS.map((k) => [k, Math.round((raw[k] / max) * 60)]));
}

// Nhóm ngành / ngành học liên quan tới một tập môn (không dùng điểm Holland của học sinh).
export function relatedMajors(keys = [], majorGroups = [], majors = [], limit = 8) {
  const affinity = subjectAffinity(keys);
  const topLetters = topGroups(affinity);
  const topSet = new Set(topLetters);

  const groups = majorGroups
    .map((g) => {
      const codes = g.riasec_codes || [];
      const weight = codes.reduce((s, c) => {
        const pos = topLetters.indexOf(c);
        return s + (pos >= 0 ? 3 - pos : 0);
      }, 0);
      const max = codes.length * 3 || 1;
      return { group: g, score: Math.round((weight / max) * 100), matched: codes.filter((c) => topSet.has(c)) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const groupCodes = new Set(groups.map((g) => g.group.code));
  const list = majors.filter((m) => groupCodes.has(m.major_group_code)).slice(0, limit);

  return { affinity, topLetters, groups, majors: list };
}

function catchUpOf(additions, scoreMap) {
  return additions.map((k) => {
    const sc = scoreMap[k];
    if (sc == null) {
      return { key: k, label: thptLabel(k), score: null, level: 'unknown', note: 'Chưa có dữ liệu điểm lớp 9 — cần kiểm tra kiến thức nền trước khi chuyển.' };
    }
    const n = Number(sc);
    if (n >= 7) return { key: k, label: thptLabel(k), score: n, level: 'ok', note: `Điểm lớp 9 ${n}/10 — nền tảng tốt, chỉ cần học theo phương án mới.` };
    if (n >= 5) return { key: k, label: thptLabel(k), score: n, level: 'medium', note: `Điểm lớp 9 ${n}/10 — cần ôn bổ sung trước khi vào chương trình.` };
    return { key: k, label: thptLabel(k), score: n, level: 'high', note: `Điểm lớp 9 ${n}/10 — cần học bổ sung nghiêm túc trước khi chuyển.` };
  });
}

export function analyzeAdjustment({
  current = {}, candidates = [], scoreMap = {}, hollandResult, majorGroups = [], majors = [],
}) {
  const currentSet = subjectsOf(current);
  const hasCurrent = currentSet.length > 0;

  const evaluated = candidates.map((c) => {
    const set = subjectsOf(c);
    return {
      ...c,
      set,
      additions: set.filter((k) => !currentSet.includes(k)),
      removed: currentSet.filter((k) => !set.includes(k)),
      retained: set.filter((k) => currentSet.includes(k)),
    };
  });

  // Xếp hạng cả "môn học hiện tại" như một phương án để so sánh trực tiếp.
  const currentOption = hasCurrent
    ? { id: CURRENT_OPTION_ID, name: 'Môn học hiện tại', electives: current.electives || [], cluster_subjects: current.cluster_subjects || [] }
    : null;
  const ranked = rankSchoolOptions([...(currentOption ? [currentOption] : []), ...evaluated], { scoreMap, hollandResult });
  const byId = Object.fromEntries(ranked.map((o) => [o.id, o]));
  const currentScored = currentOption ? byId[CURRENT_OPTION_ID] : null;
  const rankedCandidates = ranked
    .filter((o) => o.id !== CURRENT_OPTION_ID)
    .map((o) => ({ ...o, catchUp: catchUpOf(o.additions, scoreMap), related: relatedMajors(o.set, majorGroups, majors) }));

  const best = rankedCandidates[0] || null;
  const bestGap = best && currentScored ? best.total - currentScored.total : null;

  let verdict;
  if (!hasCurrent) {
    verdict = {
      level: 'missing',
      tone: 'amber',
      title: 'Chưa có môn học THPT hiện tại',
      summary: 'Hệ thống chưa biết tổ hợp môn bạn đang theo học nên không thể đánh giá tác động chuyển đổi. Hãy khai báo môn học lựa chọn THPT trong Hồ sơ của tôi, sau đó quay lại phân tích.',
    };
  } else if (!candidates.length) {
    verdict = {
      level: 'orient',
      tone: 'blue',
      title: 'Chỉ đánh giá định hướng',
      summary: 'Bạn chưa nhập phương án được nhà trường cho phép xem xét. Hệ thống chỉ đánh giá định hướng của tổ hợp môn hiện tại và gợi ý ngành liên quan — không xác nhận việc chuyển đổi có thể thực hiện tại trường.',
    };
  } else if (bestGap >= 8) {
    verdict = {
      level: 'change',
      tone: 'teal',
      title: `Nên cân nhắc chuyển sang ${best.name}`,
      summary: `Phương án "${best.name}" phù hợp hơn môn học hiện tại ${bestGap} điểm (${best.total}/100 so với ${currentScored.total}/100) theo học lực và xu hướng sở thích của bạn.`,
    };
  } else if (bestGap >= 3) {
    verdict = {
      level: 'consider',
      tone: 'amber',
      title: `Có thể cân nhắc ${best.name}`,
      summary: `Phương án "${best.name}" nhỉnh hơn môn học hiện tại ${bestGap} điểm (${best.total}/100 so với ${currentScored.total}/100) — mức chênh chưa lớn, nên cân nhắc thêm điều kiện học bổ sung và xác nhận của trường.`,
    };
  } else {
    verdict = {
      level: 'keep',
      tone: 'gray',
      title: 'Nên giữ nguyên môn học hiện tại',
      summary: `Không phương án nào vượt trội rõ rệt so với môn học hiện tại${best ? ` (chênh ${bestGap} điểm)` : ''}. Việc chuyển đổi chỉ nên thực hiện khi bạn có lý do rõ ràng về định hướng ngành.`,
    };
  }

  return {
    hasCurrent,
    currentSet,
    currentScored,
    candidates: rankedCandidates,
    best,
    bestGap,
    verdict,
    orientation: relatedMajors(currentSet, majorGroups, majors),
    riasecLabels: RIASEC_META,
  };
}