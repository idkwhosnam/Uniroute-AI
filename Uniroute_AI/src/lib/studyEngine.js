// studyEngine.js — UC-11 to UC-14: Study planning engine
// Nguyên tắc: KHÔNG tự bịa điểm yếu khi chưa có dữ liệu chẩn đoán.
// Nếu chưa có học lực cho môn nào, đánh priority = 'unknown' và gap = null.

// Chủ đề ôn theo môn (template chung, không phụ thuộc điểm yếu)
const TOPIC_TEMPLATES = {
  toan: [
    { topic: 'Hàm số, đồ thị & đạo hàm', prereq: [] },
    { topic: 'Lượng giác & phương trình lượng giác', prereq: ['Hàm số, đồ thị & đạo hàm'] },
    { topic: 'Số phức', prereq: ['Lượng giác & phương trình lượng giác'] },
    { topic: 'Tổ hợp xác suất & thống kê', prereq: [] },
    { topic: 'Khối đa diện & hình không gian', prereq: [] },
    { topic: 'Oxy trong không gian & giải tích', prereq: ['Hàm số, đồ thị & đạo hàm'] },
  ],
  van: [
    { topic: 'Nghị luận xã hội — luận điểm & dẫn chứng', prereq: [] },
    { topic: 'Nghị luận văn học — phân tích tác phẩm', prereq: ['Nghị luận xã hội — luận điểm & dẫn chứng'] },
    { topic: 'Thơ Đường luật & thể thơ khác', prereq: [] },
    { topic: 'Truyện ngắn & tiểu thuyết', prereq: ['Nghị luận văn học — phân tích tác phẩm'] },
    { topic: 'Hàn quốc văn học & so sánh', prereq: ['Truyện ngắn & tiểu thuyết'] },
  ],
  anh: [
    { topic: 'Ngữ pháp cơ bản & thì động từ', prereq: [] },
    { topic: 'Đọc hiểu & từ vựng học thuật', prereq: ['Ngữ pháp cơ bản & thì động từ'] },
    { topic: 'Viết luận & cấu trúc đoạn văn', prereq: ['Đọc hiểu & từ vựng học thuật'] },
    { topic: 'Nghe & nói phản xạ', prereq: [] },
    { topic: 'Đề thi thử & quản lý thời gian', prereq: ['Viết luận & cấu trúc đoạn văn'] },
  ],
  ly: [
    { topic: 'Cơ học & chuyển động', prereq: [] },
    { topic: 'Điện học & mạch điện', prereq: [] },
    { topic: 'Từ trường & cảm ứng điện từ', prereq: ['Điện học & mạch điện'] },
    { topic: 'Quang học & sóng', prereq: [] },
    { topic: 'Vật lý hạt nhân & lượng tử', prereq: ['Quang học & sóng'] },
  ],
  hoa: [
    { topic: 'Cấu tạo nguyên tử & liên kết', prereq: [] },
    { topic: 'Đại cương kim loại & phi kim', prereq: ['Cấu tạo nguyên tử & liên kết'] },
    { topic: 'Hóa hữu cơ — ankan, anken, ankin', prereq: ['Đại cương kim loại & phi kim'] },
    { topic: 'Este, lipit & amino axit', prereq: ['Hóa hữu cơ — ankan, anken, ankin'] },
    { topic: 'Polime & vật liệu', prereq: ['Este, lipit & amino axit'] },
  ],
  sinh: [
    { topic: 'Sinh học tế bào & phân tử', prereq: [] },
    { topic: 'Di truyền & biến dị', prereq: ['Sinh học tế bào & phân tử'] },
    { topic: 'Sinh thái học & quần thể', prereq: [] },
    { topic: 'Tiến hóa & nguồn gốc sự sống', prereq: ['Di truyền & biến dị'] },
    { topic: 'Sinh học ứng dụng & công nghệ', prereq: ['Tiến hóa & nguồn gốc sự sống'] },
  ],
  su: [
    { topic: 'Thế giới & VN sau CTTG II', prereq: [] },
    { topic: 'VN từ 1975 đến nay', prereq: ['Thế giới & VN sau CTTG II'] },
    { topic: 'Lịch sử kinh tế & xã hội', prereq: [] },
  ],
  dia: [
    { topic: 'Địa lý kinh tế & xã hội VN', prereq: [] },
    { topic: 'Địa lý khu vực & thế giới', prereq: ['Địa lý kinh tế & xã hội VN'] },
    { topic: 'Môi trường & phát triển bền vững', prereq: [] },
  ],
  gdcg: [
    { topic: 'Pháp luật & quyền công dân', prereq: [] },
    { topic: 'Kinh tế & tài chính cá nhân', prereq: [] },
    { topic: 'Văn hóa & lối sống', prereq: [] },
  ],
  cn: [
    { topic: 'Công nghệ & đời sống', prereq: [] },
    { topic: 'Công nghệ thông tin & truyền thông', prereq: ['Công nghệ & đời sống'] },
  ],
  // Chứng chỉ quốc tế
  cert_nghe: [
    { topic: 'Nghe chép chính tả & nhận dạng dạng câu hỏi', prereq: [] },
    { topic: 'Luyện đề Listening theo chủ đề', prereq: ['Nghe chép chính tả & nhận dạng dạng câu hỏi'] },
    { topic: 'Quản lý thời gian khi làm bài Nghe', prereq: ['Luyện đề Listening theo chủ đề'] },
  ],
  cert_noi: [
    { topic: 'Phát âm, trọng âm & ngữ điệu', prereq: [] },
    { topic: 'Trả lời Part 1–2 theo chủ đề quen thuộc', prereq: ['Phát âm, trọng âm & ngữ điệu'] },
    { topic: 'Phát triển ý Part 3 & mô phỏng phòng thi', prereq: ['Trả lời Part 1–2 theo chủ đề quen thuộc'] },
  ],
  cert_doc: [
    { topic: 'Skimming, scanning & đọc theo cụm', prereq: [] },
    { topic: 'Dạng câu hỏi True/False/Not Given, Matching', prereq: ['Skimming, scanning & đọc theo cụm'] },
    { topic: 'Luyện đề Reading học thuật', prereq: ['Dạng câu hỏi True/False/Not Given, Matching'] },
  ],
  cert_viet: [
    { topic: 'Phân tích biểu đồ & quy trình (Task 1)', prereq: [] },
    { topic: 'Cấu trúc & từ vựng học thuật (Task 2)', prereq: [] },
    { topic: 'Viết bài hoàn chỉnh & tự chấm theo tiêu chí', prereq: ['Phân tích biểu đồ & quy trình (Task 1)', 'Cấu trúc & từ vựng học thuật (Task 2)'] },
  ],
  cert_sat_toan: [
    { topic: 'Đại số & hệ phương trình', prereq: [] },
    { topic: 'Phân tích dữ liệu & bài toán thực tế', prereq: [] },
    { topic: 'Luyện đề Math có giới hạn thời gian', prereq: ['Đại số & hệ phương trình', 'Phân tích dữ liệu & bài toán thực tế'] },
  ],
  cert_sat_docviet: [
    { topic: 'Đọc hiểu đoạn văn dài', prereq: [] },
    { topic: 'Ngữ pháp & sửa lỗi câu', prereq: [] },
    { topic: 'Luyện đề Reading & Writing', prereq: ['Đọc hiểu đoạn văn dài', 'Ngữ pháp & sửa lỗi câu'] },
  ],
  cert_tonghop: [
    { topic: 'Xác định chứng chỉ & mức điểm cần đạt', prereq: [] },
    { topic: 'Luyện đề tổng hợp theo cấu trúc bài thi', prereq: ['Xác định chứng chỉ & mức điểm cần đạt'] },
    { topic: 'Thi thử & rà soát điểm yếu', prereq: ['Luyện đề tổng hợp theo cấu trúc bài thi'] },
  ],
  // Đánh giá năng lực
  apt_dinhluong: [
    { topic: 'Toán cơ bản & tư duy logic', prereq: [] },
    { topic: 'Bài toán thực tế & phân tích số liệu', prereq: ['Toán cơ bản & tư duy logic'] },
    { topic: 'Luyện đề định lượng có giới hạn thời gian', prereq: ['Bài toán thực tế & phân tích số liệu'] },
  ],
  apt_dinhtinh: [
    { topic: 'Đọc hiểu & phân tích ngôn ngữ', prereq: [] },
    { topic: 'Suy luận logic – ngôn ngữ', prereq: ['Đọc hiểu & phân tích ngôn ngữ'] },
    { topic: 'Luyện đề định tính', prereq: ['Suy luận logic – ngôn ngữ'] },
  ],
  apt_khoahoc: [
    { topic: 'Lý – Hóa – Sinh theo chủ đề ĐGNL', prereq: [] },
    { topic: 'Đọc dữ liệu & suy luận khoa học', prereq: [] },
    { topic: 'Luyện đề khoa học tổng hợp', prereq: ['Lý – Hóa – Sinh theo chủ đề ĐGNL'] },
  ],
  apt_anh: [
    { topic: 'Ngữ pháp & từ vựng cốt lõi', prereq: [] },
    { topic: 'Đọc hiểu tiếng Anh', prereq: ['Ngữ pháp & từ vựng cốt lõi'] },
    { topic: 'Luyện đề tiếng Anh', prereq: ['Đọc hiểu tiếng Anh'] },
  ],
};

// Lấy template chủ đề cho môn, fallback generic
function getTopics(subjectKey, subjectLabel) {
  const templates = TOPIC_TEMPLATES[subjectKey];
  if (templates && Array.isArray(templates)) return templates;
  return [
    { topic: `Ôn tổng hợp ${subjectLabel}`, prereq: [] },
    { topic: `Luyện đề ${subjectLabel}`, prereq: [`Ôn tổng hợp ${subjectLabel}`] },
  ];
}

// Lấy điểm hiện tại mới nhất cho mỗi môn từ AcademicRecord
export function getLatestScores(academicRecords) {
  const subjectScores = {};
  for (const rec of academicRecords || []) {
    if (!rec.scores) continue;
    const date = rec.recorded_date || rec.created_date;
    for (const [key, val] of Object.entries(rec.scores)) {
      if (subjectScores[key] == null || new Date(date) > new Date(subjectScores[key].date)) {
        subjectScores[key] = { score: Number(val), date, scale: rec.scale || 10 };
      }
    }
  }
  return subjectScores;
}

// ===== Kỹ năng / kỳ thi cần ôn theo phương thức xét tuyển =====

// ĐGNL: các phần thi của bài đánh giá năng lực
const APTITUDE_SECTIONS = [
  { key: 'apt_dinhluong', label: 'Tư duy định lượng', subjects: ['toan'] },
  { key: 'apt_dinhtinh', label: 'Tư duy định tính', subjects: ['van'] },
  { key: 'apt_khoahoc', label: 'Khoa học (Lý – Hóa – Sinh)', subjects: ['ly', 'hoa', 'sinh'] },
  { key: 'apt_anh', label: 'Tiếng Anh', subjects: ['anh'] },
];

// Chứng chỉ quốc tế: kỹ năng ôn theo từng loại chứng chỉ
const CERT_SKILLS = {
  ielts: [
    { key: 'cert_nghe', label: 'IELTS — Nghe' },
    { key: 'cert_noi', label: 'IELTS — Nói' },
    { key: 'cert_doc', label: 'IELTS — Đọc' },
    { key: 'cert_viet', label: 'IELTS — Viết' },
  ],
  sat: [
    { key: 'cert_sat_toan', label: 'SAT — Toán' },
    { key: 'cert_sat_docviet', label: 'SAT — Đọc & Viết' },
  ],
};
const DEFAULT_CERT_SKILLS = [{ key: 'cert_tonghop', label: 'Chứng chỉ quốc tế' }];

// Chứng chỉ tốt nhất theo loại (quy về tỉ lệ để so sánh các thang điểm khác nhau)
function bestCert(certifications, type) {
  const list = (certifications || []).filter((c) => c && c.type === type && c.score != null);
  if (!list.length) return null;
  return list.reduce((a, b) => (b.score / (b.scale || 1) > a.score / (a.scale || 1) ? b : a));
}

// Quy điểm chứng chỉ về thang điểm của mục tiêu
const scaleCertScore = (cert, targetScale) =>
  Math.round((Number(cert.score) / (cert.scale || 1)) * targetScale * 10) / 10;

function makePlanRow(skill, current, targetScore, priorityOf, note) {
  const hasDiagnostic = current != null && !Number.isNaN(current);
  const roundedTarget = Math.round(targetScore * 10) / 10;
  const gap = hasDiagnostic ? Math.round((roundedTarget - current) * 10) / 10 : null;
  return {
    key: skill.key,
    label: skill.label,
    current,
    targetScore: roundedTarget,
    gap,
    hasDiagnostic,
    priority: hasDiagnostic ? priorityOf(gap) : 'unknown',
    note,
  };
}

// Danh sách môn / kỹ năng cần ôn cho một mục tiêu — dùng chung cho phân tích khoảng cách và lập kế hoạch
export function buildSkillPlans({ target, academicRecords, certifications, subjects }) {
  if (!target) return [];
  const targetScale = target.target_scale || 30;
  const latest = getLatestScores(academicRecords);
  const relativePriority = (gap) => (gap > target.target_score * 0.08 ? 'high' : gap > target.target_score * 0.03 ? 'medium' : 'low');

  // Xét chứng chỉ ngoại ngữ / chứng chỉ quốc tế
  if (target.method === 'cert') {
    const cert = bestCert(certifications, 'ielts') || bestCert(certifications, 'sat');
    const skills = CERT_SKILLS[cert?.type] || DEFAULT_CERT_SKILLS;
    const current = cert ? scaleCertScore(cert, targetScale) : null;
    return skills.map((skill) => makePlanRow(skill, current, target.target_score, relativePriority, cert ? 'Điểm chứng chỉ đã khai báo' : null));
  }

  // Xét kết quả đánh giá năng lực
  if (target.method === 'aptitude') {
    const cert = bestCert(certifications, 'hsa');
    return APTITUDE_SECTIONS.map((section) => {
      if (cert) {
        return makePlanRow(section, scaleCertScore(cert, targetScale), target.target_score, relativePriority, 'Điểm ĐGNL đã khai báo');
      }
      const scores = section.subjects.map((key) => latest[key]?.score).filter((v) => v != null);
      if (!scores.length) return makePlanRow(section, null, target.target_score, relativePriority, null);
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      return makePlanRow(section, Math.round((avg / 10) * targetScale * 10) / 10, target.target_score, relativePriority, 'Từ học lực môn liên quan');
    });
  }

  // Xét kết quả thi tốt nghiệp / học bạ: theo tổ hợp môn
  const keys = target.combination_subjects || [];
  if (!keys.length) return [];
  const perSubjectTarget = target.target_score / keys.length;
  const absolutePriority = (gap) => (gap > 2 ? 'high' : gap > 1 ? 'medium' : 'low');
  return keys.map((key) => {
    const subject = (subjects || []).find((s) => s.key === key);
    const score = latest[key];
    return makePlanRow({ key, label: subject?.label || key }, score ? score.score : null, perSubjectTarget, absolutePriority, null);
  });
}

// Tính số tuần từ hôm nay đến ngày thi
export function weeksUntilDate(dateStr) {
  if (!dateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - today) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diff);
}

// Kiểm tra tính khả thi
export function checkFeasibility(totalNeeded, totalAvailable, weeklyHours) {
  if (!weeklyHours || weeklyHours <= 0) {
    return {
      status: 'insufficient',
      warnings: ['Chưa nhập thời gian học khả dụng — không thể đánh giá tính khả thi.'],
      suggestions: ['Nhập số giờ/tuần bạn có thể học để hệ thống kiểm tra.'],
    };
  }
  if (totalAvailable <= 0) {
    return {
      status: 'insufficient',
      warnings: ['Ngày thi đã qua hoặc quá gần — không đủ thời gian để lập kế hoạch.'],
      suggestions: ['Chọn ngày thi xa hơn, hoặc giảm số chủ đề cần ôn.'],
    };
  }
  if (totalNeeded > totalAvailable) {
    const extra = Math.ceil(totalNeeded - totalAvailable);
    const weeks = Math.max(1, Math.round(totalAvailable / weeklyHours));
    const extraPerWeek = Math.ceil(extra / weeks);
    return {
      status: 'insufficient',
      warnings: [
        `Cần ${totalNeeded} giờ nhưng chỉ có ${totalAvailable} giờ (thiếu ${extra} giờ).`,
        `Tương đương cần thêm ${extraPerWeek} giờ/tuần để kịp.`,
      ],
      suggestions: [
        `Tăng giờ học lên ${weeklyHours + extraPerWeek} giờ/tuần.`,
        'Giảm số môn ưu tiên — tập trung vào 2-3 môn có khoảng cách lớn nhất.',
        'Gia hạn ngày thi nếu có thể.',
      ],
    };
  }
  if (totalNeeded > totalAvailable * 0.85) {
    return {
      status: 'tight',
      warnings: [`Khả dụng sát mức cần (${totalNeeded}/${totalAvailable} giờ) — nên dự phòng.`],
      suggestions: ['Tăng 1-2 giờ/tuần để có vùng đệm cho tuần ôn đề.'],
    };
  }
  return {
    status: 'feasible',
    warnings: [],
    suggestions: [],
  };
}

// Xây dựng kế hoạch ôn tập
// target: AdmissionTarget (có combination_subjects, target_score, target_scale)
// academicRecords: AcademicRecord[]
// examDate: 'YYYY-MM-DD'
// weeklyHours: số giờ/tuần
// subjects: Subject[]
export function buildStudyPlan({ target, academicRecords, certifications, examDate, weeklyHours, subjects }) {
  if (!target) {
    return { error: 'Chưa chọn mục tiêu' };
  }
  if (!examDate || weeklyHours == null) {
    return { error: 'Thiếu ngày thi hoặc thời gian học khả dụng' };
  }

  // Môn / kỹ năng cần ôn theo phương thức xét tuyển của mục tiêu
  const subjectPlans = buildSkillPlans({ target, academicRecords, certifications, subjects });
  if (!subjectPlans.length) {
    return { error: 'Mục tiêu chưa có môn học hoặc kỳ thi để lập kế hoạch' };
  }

  const weeks = weeksUntilDate(examDate);

  // Sắp xếp: high → unknown → medium → low
  const orderMap = { high: 0, unknown: 1, medium: 2, low: 3 };
  const sorted = [...subjectPlans].sort((a, b) => (orderMap[a.priority] ?? 2) - (orderMap[b.priority] ?? 2));

  // Sinh tasks: phân bổ chủ đề theo tuần
  const tasks = [];
  let weekCounter = 1;
  for (const sp of sorted) {
    const topics = getTopics(sp.key, sp.label);
    const durationPerTopic = sp.priority === 'high' ? 4 : sp.priority === 'medium' ? 3 : 2;
    for (const t of topics) {
      tasks.push({
        target_id: target.id,
        subject_key: sp.key,
        subject_label: sp.label,
        week_number: ((weekCounter - 1) % weeks) + 1,
        topic: t.topic,
        prerequisites: t.prereq || [],
        duration_hours: durationPerTopic,
        current_score: sp.current,
        target_score: sp.targetScore,
        gap: sp.gap,
        has_diagnostic: sp.hasDiagnostic,
        priority: sp.priority,
        ...(sp.note ? { note: sp.note } : {}),
        status: 'todo',
      });
      weekCounter++;
    }
  }

  // Tính khả thi
  const totalNeeded = tasks.reduce((s, t) => s + t.duration_hours, 0);
  const totalAvailable = weeklyHours * weeks;
  const feasibility = checkFeasibility(totalNeeded, totalAvailable, weeklyHours);

  return {
    target_id: target.id,
    target_label: `${target.university_name} — ${target.major_name}`,
    exam_date: examDate,
    weekly_hours: weeklyHours,
    total_weeks: weeks,
    tasks,
    subject_plans: subjectPlans,
    total_hours_needed: totalNeeded,
    total_hours_available: totalAvailable,
    feasibility_status: feasibility.status,
    warnings: feasibility.warnings,
    suggestions: feasibility.suggestions,
  };
}

// Tạo lại kế hoạch khi đổi mục tiêu — bảo toàn nhiệm vụ đã hoàn thành
// oldTasks: StudyTask[] (từ DB)
// newPlanTasks: task[] (từ buildStudyPlan)
// Trả về { preserved, toArchive, toCreate, affectedCount }
export function regeneratePlan(oldTasks, newPlanTasks) {
  const completed = (oldTasks || []).filter((t) => t.status === 'done' && !t.archived);
  const incomplete = (oldTasks || []).filter((t) => t.status !== 'done' && !t.archived);

  // Nhiệm vụ mới: trùng subject+topic với completed → giữ completed (không tạo lại)
  const toCreate = newPlanTasks.filter((nt) =>
    !completed.some((ct) => ct.subject_key === nt.subject_key && ct.topic === nt.topic)
  );

  return {
    preserved: completed,
    toArchive: incomplete,
    toCreate,
    affectedCount: incomplete.length + toCreate.length,
  };
}

// Nhận diện nhiệm vụ bị ảnh hưởng khi đổi mục tiêu
export function identifyAffectedTasks(oldTasks, oldTargetId, newTargetId) {
  const linkedToOld = (oldTasks || []).filter((t) => t.target_id === oldTargetId);
  const completed = linkedToOld.filter((t) => t.status === 'done');
  const incomplete = linkedToOld.filter((t) => t.status !== 'done');
  return {
    totalAffected: linkedToOld.length,
    willPreserve: completed.length,
    willArchive: incomplete.length,
    preserved: completed,
    toArchive: incomplete,
  };
}

export const PRIORITY_LABELS = {
  high: 'Ưu tiên cao',
  medium: 'Ưu tiên trung',
  low: 'Ưu tiên thấp',
  unknown: 'Chưa chẩn đoán',
};

export const PRIORITY_TONES = {
  high: 'rose',
  medium: 'amber',
  low: 'gray',
  unknown: 'blue',
};

export const FEASIBILITY_LABELS = {
  feasible: 'Khả thi',
  tight: 'Sát mức',
  insufficient: 'Không đủ thời gian',
};