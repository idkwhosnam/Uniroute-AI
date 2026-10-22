// admissionEngine.js — Tra cứu tuyển sinh (ngành – trường), so sánh, mục tiêu & lập kế hoạch ôn tập.

export function searchPrograms(programs, filters = {}) {
  const { university, major, year, method, combination, maxTuition, search } = filters;
  return (programs || []).filter((p) => {
    if (university && university !== 'all' && p.university_code !== university) return false;
    if (major && major !== 'all' && p.major_code !== major) return false;
    if (year && year !== 'all' && p.year !== year) return false;
    if (method && method !== 'all' && p.method !== method) return false;
    if (combination && combination !== 'all' && p.combination !== combination) return false;
    if (maxTuition && p.tuition > maxTuition) return false;
    if (search) {
      const s = search.toLowerCase();
      const text = `${p.university_name} ${p.university_code || ''} ${p.major_name} ${p.major_code || ''} ${p.combination || ''} ${p.benchmark_score ?? ''} ${p.method_label || ''}`.toLowerCase();
      if (!text.includes(s)) return false;
    }
    return true;
  });
}

export function comparePrograms(items) {
  const warnings = [];
  if (!items?.length) return { warnings };

  const years = [...new Set(items.map((i) => i.year))];
  if (years.length > 1) {
    warnings.push(`Đang so sánh chương trình khác năm: ${years.join(', ')} — điều kiện tuyển sinh có thể thay đổi theo năm.`);
  }

  const scales = [...new Set(items.map((i) => i.benchmark_scale).filter((s) => s != null))];
  if (scales.length > 1) {
    warnings.push(`Đang so sánh điểm chuẩn khác thang điểm: ${scales.join(' vs ')} — không so sánh trực tiếp được.`);
  }

  const noSource = items.filter((i) => !i.source_name && !i.source_url);
  if (noSource.length) {
    warnings.push(`${noSource.length} chương trình chưa có nguồn dữ liệu — chưa xác minh.`);
  }

  const historical = items.filter((i) => i.benchmark_year && i.benchmark_year < i.year);
  if (historical.length) {
    warnings.push(`${historical.length} chương trình dùng điểm chuẩn lịch sử (năm cũ) — không phải điểm chuẩn hiện tại.`);
  }

  const mockCount = items.filter((i) => i.is_mock || i.data_status === 'MOCK').length;
  if (mockCount === items.length) {
    warnings.push('Tất cả chương trình đang so sánh đều là dữ liệu minh họa (MOCK).');
  }

  return { warnings };
}

export function validateTarget(target, program) {
  const errors = [];
  if (!program) return { valid: false, errors: ['Chưa chọn chương trình'] };
  if (target.target_score == null) errors.push('Chưa nhập điểm mục tiêu');
  if (target.target_score != null && program.benchmark_scale && target.target_scale !== program.benchmark_scale) {
    errors.push(`Thang điểm mục tiêu (${target.target_scale}) khác thang điểm chương trình (${program.benchmark_scale})`);
  }
  if (target.target_score != null && target.target_score < 0) errors.push('Điểm mục tiêu không hợp lệ');
  return { valid: errors.length === 0, errors };
}

export const METHOD_LABELS = {
  thpt: 'Xét kết quả thi tốt nghiệp THPT',
  aptitude: 'Xét kết quả đánh giá năng lực',
  cert: 'Xét chứng chỉ quốc tế',
  combo: 'Xét học bạ / kết hợp',
};

export const METHOD_SHORT = {
  thpt: 'Thi tốt nghiệp THPT',
  aptitude: 'Đánh giá năng lực',
  cert: 'Chứng chỉ quốc tế',
  combo: 'Học bạ / kết hợp',
};

export const METHOD_ORDER = ['thpt', 'aptitude', 'cert', 'combo'];

export const DATA_STATUS_LABELS = {
  MOCK: 'Dữ liệu minh họa',
  UNVERIFIED: 'Chưa xác minh',
  VERIFIED: 'Đã xác minh',
};

export const methodLabel = (method) => METHOD_LABELS[method] || method;

// Tất cả chương trình của một cặp trường × ngành
export function programsForPair(programs, universityCode, majorCode) {
  return (programs || []).filter((p) => p.university_code === universityCode && p.major_code === majorCode);
}

// Mỗi phương thức xét tuyển giữ chương trình của năm mới nhất
export function latestProgramsByMethod(list) {
  const byMethod = new Map();
  (list || []).forEach((p) => {
    const cur = byMethod.get(p.method);
    if (!cur || p.year > cur.year) byMethod.set(p.method, p);
  });
  return METHOD_ORDER.filter((m) => byMethod.has(m)).map((m) => byMethod.get(m));
}

// Điểm chuẩn các năm gần nhất của đúng ngành – trường – phương thức
export function benchmarkHistory(programs, universityCode, majorCode, method) {
  return programsForPair(programs, universityCode, majorCode)
    .filter((p) => p.method === method)
    .sort((a, b) => b.year - a.year)
    .map((p) => ({
      year: p.year,
      score: p.benchmark_score,
      scale: p.benchmark_scale,
      note: p.note || (p.benchmark_score != null ? 'Điểm trúng tuyển mô phỏng' : 'Chưa công bố điểm chuẩn'),
    }));
}

// Bảng tra cứu tuyển sinh: mỗi dòng = một cặp trường × ngành (không kèm phương thức xét tuyển)
export function buildAdmissionRows(programs, filters = {}) {
  const { university, major, search } = filters;
  const keyword = (search || '').trim().toLowerCase();

  const map = new Map();
  (programs || []).forEach((p) => {
    if (university && university !== 'all' && p.university_code !== university) return;
    if (major && major !== 'all' && p.major_code !== major) return;
    if (keyword) {
      const text = `${p.university_name} ${p.university_code || ''} ${p.major_name} ${p.major_code || ''} ${p.combination || ''} ${p.method_label || ''}`.toLowerCase();
      if (!text.includes(keyword)) return;
    }
    const key = `${p.university_code}|${p.major_code}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        university_code: p.university_code,
        university_name: p.university_name,
        major_code: p.major_code,
        major_name: p.major_name,
        combinations: [],
        combinationSubjects: [],
        methods: [],
        years: [],
        programs: [],
        latestProgram: null,
      });
    }
    const row = map.get(key);
    row.programs.push(p);
    if (p.combination && (p.combination_subjects || []).length && !row.combinations.includes(p.combination)) row.combinations.push(p.combination);
    (p.combination_subjects || []).forEach((s) => { if (!row.combinationSubjects.includes(s)) row.combinationSubjects.push(s); });
    if (p.method && !row.methods.includes(p.method)) row.methods.push(p.method);
    if (!row.years.includes(p.year)) row.years.push(p.year);
    if (!row.latestProgram || p.year > row.latestProgram.year) row.latestProgram = p;
  });

  return [...map.values()]
    .map((row) => ({
      ...row,
      combinations: row.combinations.sort(),
      methods: METHOD_ORDER.filter((m) => row.methods.includes(m)),
      years: row.years.sort((a, b) => b - a),
      latestYear: row.latestProgram?.year ?? null,
      tuition: row.latestProgram?.tuition ?? null,
      quota: row.latestProgram?.quota ?? null,
    }))
    .sort((a, b) => a.university_code.localeCompare(b.university_code) || a.major_code.localeCompare(b.major_code));
}