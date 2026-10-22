// subjectEngine.js — Weighted scoring engine for high school subject selection (UC-06/07)
// RIASEC → subject affinity, validation, plan generation, weighted scoring with configurable weights.

export const DEFAULT_WEIGHTS = {
  holland_fit: 0.35,
  academic_strength: 0.30,
  major_group_alignment: 0.25,
  balance: 0.10,
};

// Subject → RIASEC affinity (keys match Subject.key in database)
export const SUBJECT_RIASEC = {
  toan: ['I', 'C'], van: ['A', 'S'], anh: ['A', 'S'],
  ly: ['I', 'R'], hoa: ['I', 'R'], sinh: ['I', 'A'],
  dia: ['I', 'A'], su: ['A', 'S'], gdcg: ['S', 'E'],
  td: ['R'], gdqp: ['R'], cn: ['R', 'I'], tin: ['I', 'C'],
  am_nhac: ['A'], my_thuat: ['A'], kdpl: ['E', 'S'],
};

const SCIENCE = ['toan', 'ly', 'hoa', 'sinh', 'tin'];
const HUMANITIES = ['van', 'su', 'dia', 'gdcg', 'anh', 'kdpl'];
const ARTS = ['am_nhac', 'my_thuat'];
const PHYSICAL = ['td', 'gdqp', 'cn'];

// ============ Validation ============

export function validateSelection(compulsory, electives, clusterCode, rule) {
  const errors = [];
  if (!rule) return { valid: false, errors: ['Chưa có quy chế môn học cho năm này'] };

  const expectedCompulsory = rule.compulsory_subjects || [];
  if (!compulsory || compulsory.length !== expectedCompulsory.length) {
    errors.push(`Cần đủ ${expectedCompulsory.length} môn bắt buộc, đang có ${compulsory?.length || 0}`);
  }

  const expectedElective = rule.elective_count || 4;
  if (!electives || electives.length !== expectedElective) {
    errors.push(`Cần chọn đúng ${expectedElective} môn tự chọn, đang có ${electives?.length || 0}`);
  }

  const pool = rule.elective_subjects || [];
  const invalid = (electives || []).filter((e) => !pool.includes(e));
  if (invalid.length) errors.push(`Môn không thuộc danh sách tự chọn: ${invalid.join(', ')}`);

  if (clusterCode) {
    const cluster = (rule.clusters || []).find((c) => c.code === clusterCode);
    if (!cluster) {
      errors.push(`Cụm chuyên đề không tồn tại: ${clusterCode}`);
    } else {
      // Môn bắt buộc trong cụm tự động thỏa — chỉ kiểm môn tự chọn
      const electiveClusterSubjects = cluster.subjects.filter((s) => !compulsory.includes(s));
      const missing = electiveClusterSubjects.filter((s) => !electives?.includes(s));
      if (missing.length) errors.push(`Cụm ${cluster.name} cần môn ${missing.join(', ')} trong tự chọn`);
    }
  } else {
    errors.push('Chưa chọn cụm chuyên đề');
  }

  return { valid: errors.length === 0, errors };
}

// ============ Plan generation ============

function combinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  if (arr.length === k) return [arr];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map((c) => [first, ...c]);
  const without = combinations(rest, k);
  return [...withFirst, ...without];
}

export function generateValidPlans(rule) {
  if (!rule) return [];
  const plans = [];
  const pool = rule.elective_subjects || [];
  const electiveCount = rule.elective_count || 4;
  const clusters = rule.clusters || [];

  const compulsory = rule.compulsory_subjects || [];
  for (const cluster of clusters) {
    const electiveClusterSubjects = cluster.subjects.filter((s) => !compulsory.includes(s));
    if (!electiveClusterSubjects.every((s) => pool.includes(s))) continue;
    const remaining = pool.filter((s) => !electiveClusterSubjects.includes(s));
    const extraCount = electiveCount - electiveClusterSubjects.length;
    if (extraCount <= 0) {
      plans.push({ id: cluster.code, cluster_code: cluster.code, cluster_name: cluster.name, electives: [...electiveClusterSubjects], compulsory });
      continue;
    }
    for (const extra of combinations(remaining, extraCount)) {
      const electives = [...electiveClusterSubjects, ...extra].sort();
      plans.push({ id: `${cluster.code}_${extra.sort().join('_')}`, cluster_code: cluster.code, cluster_name: cluster.name, electives, compulsory });
    }
  }
  return plans;
}

// ============ Scoring ============

function scoreHollandFit(plan, riasecScores) {
  const all = [...plan.compulsory, ...plan.electives];
  let total = 0, count = 0;
  for (const key of all) {
    const riasec = SUBJECT_RIASEC[key];
    if (!riasec) continue;
    total += Math.max(...riasec.map((r) => riasecScores[r] || 0));
    count++;
  }
  return count > 0 ? Math.round((total / count / 60) * 100) : 50;
}

function scoreAcademicStrength(plan, academicRecords) {
  const all = [...plan.compulsory, ...plan.electives];
  const subjectScores = {};
  for (const rec of academicRecords) {
    if (!rec.scores) continue;
    for (const [key, val] of Object.entries(rec.scores)) {
      if (!subjectScores[key]) subjectScores[key] = [];
      subjectScores[key].push(Number(val));
    }
  }
  let total = 0, count = 0;
  for (const key of all) {
    if (subjectScores[key]?.length) {
      total += subjectScores[key].reduce((a, b) => a + b, 0) / subjectScores[key].length;
      count++;
    }
  }
  if (count === 0) return 50;
  const scale = academicRecords[0]?.scale || 10;
  return Math.round((total / count / scale) * 100);
}

function scoreMajorGroupAlignment(plan, selectedMajorGroups, majorGroups) {
  const selected = majorGroups.filter((g) => selectedMajorGroups.includes(g.code));
  if (!selected.length) return 50;
  const all = [...plan.compulsory, ...plan.electives];
  let total = 0;
  for (const key of all) {
    const riasec = SUBJECT_RIASEC[key] || [];
    for (const group of selected) {
      if ((group.riasec_codes || []).some((r) => riasec.includes(r))) total++;
    }
  }
  const max = all.length * selected.length;
  return max > 0 ? Math.round((total / max) * 100) : 50;
}

function scoreBalance(plan) {
  const all = [...plan.compulsory, ...plan.electives];
  const cats = { science: 0, humanities: 0, arts: 0, physical: 0 };
  for (const key of all) {
    if (SCIENCE.includes(key)) cats.science++;
    else if (HUMANITIES.includes(key)) cats.humanities++;
    else if (ARTS.includes(key)) cats.arts++;
    else if (PHYSICAL.includes(key)) cats.physical++;
  }
  return Math.round((Object.values(cats).filter((v) => v > 0).length / 4) * 100);
}

export function scorePlan(plan, ctx, weights = DEFAULT_WEIGHTS) {
  const { hollandResult, academicRecords, selectedMajorGroups, majorGroups } = ctx;
  const breakdown = {};
  const explanations = {};
  const usedWeights = {};
  let totalWeight = 0;

  if (hollandResult?.scores) {
    breakdown.holland_fit = scoreHollandFit(plan, hollandResult.scores);
    explanations.holland_fit = `Khớp RIASEC với mã Holland ${hollandResult.holland_code || ''}`;
    usedWeights.holland_fit = weights.holland_fit;
    totalWeight += weights.holland_fit;
  } else {
    explanations.holland_fit = 'Chưa làm trắc nghiệm Holland — bỏ qua tiêu chí này';
  }

  if (academicRecords?.length) {
    breakdown.academic_strength = scoreAcademicStrength(plan, academicRecords);
    explanations.academic_strength = 'Học lực trung bình các môn đã chọn';
    usedWeights.academic_strength = weights.academic_strength;
    totalWeight += weights.academic_strength;
  } else {
    explanations.academic_strength = 'Chưa có điểm học tập — bỏ qua tiêu chí này';
  }

  if (selectedMajorGroups?.length && majorGroups?.length) {
    breakdown.major_group_alignment = scoreMajorGroupAlignment(plan, selectedMajorGroups, majorGroups);
    explanations.major_group_alignment = `Khớp ${selectedMajorGroups.length} nhóm ngành đã chọn`;
    usedWeights.major_group_alignment = weights.major_group_alignment;
    totalWeight += weights.major_group_alignment;
  } else {
    explanations.major_group_alignment = 'Chưa chọn nhóm ngành — bỏ qua tiêu chí này';
  }

  breakdown.balance = scoreBalance(plan);
  explanations.balance = 'Đa dạng nhóm môn (KHTN/KHXH/Nghệ thuật/Thể chất)';
  usedWeights.balance = weights.balance;
  totalWeight += weights.balance;

  let total = 0;
  for (const key of Object.keys(usedWeights)) {
    total += (breakdown[key] / 100) * (usedWeights[key] / totalWeight) * 100;
  }

  return { total: Math.round(total), breakdown, explanations, usedWeights };
}

// ============ Ranking ============

export function rankPlans(plans, ctx, weights = DEFAULT_WEIGHTS) {
  const scored = plans.map((p) => ({ ...p, ...scorePlan(p, ctx, weights) }));
  scored.sort((a, b) => b.total - a.total);

  let rank = 0, prevScore = -1;
  scored.forEach((p, i) => {
    if (p.total !== prevScore) { rank = i + 1; prevScore = p.total; }
    p.rank = rank;
  });
  return scored;
}

export const CRITERIA_LABELS = {
  holland_fit: 'Phù hợp Holland',
  academic_strength: 'Học lực',
  major_group_alignment: 'Nhóm ngành',
  balance: 'Cân bằng',
};