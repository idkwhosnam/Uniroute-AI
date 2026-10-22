// thptSubjects.js — Danh mục môn học THPT theo CT GDPT 2018 dùng cho khai báo trong Hồ sơ.
// Nghiệp vụ 01 B3: 9 môn học lựa chọn (chọn 4) + 13 môn cụm chuyên đề học tập (chọn 3).

export const THPT_ELECTIVE_COUNT = 4;
export const THPT_CLUSTER_COUNT = 3;

export const THPT_ELECTIVES = [
  { key: 'ly', label: 'Vật lí' },
  { key: 'hoa', label: 'Hóa học' },
  { key: 'sinh', label: 'Sinh học' },
  { key: 'dia', label: 'Địa lí' },
  { key: 'kdpl', label: 'Giáo dục kinh tế & pháp luật' },
  { key: 'cn', label: 'Công nghệ' },
  { key: 'tin', label: 'Tin học' },
  { key: 'am_nhac', label: 'Âm nhạc' },
  { key: 'my_thuat', label: 'Mĩ thuật' },
];

export const THPT_CLUSTER_SUBJECTS = [
  { key: 'toan', label: 'Toán' },
  { key: 'van', label: 'Ngữ văn' },
  { key: 'anh', label: 'Tiếng Anh' },
  { key: 'su', label: 'Lịch sử' },
  { key: 'ly', label: 'Vật lí' },
  { key: 'hoa', label: 'Hóa học' },
  { key: 'sinh', label: 'Sinh học' },
  { key: 'dia', label: 'Địa lí' },
  { key: 'tin', label: 'Tin học' },
  { key: 'kdpl', label: 'Giáo dục kinh tế & pháp luật' },
  { key: 'cn', label: 'Công nghệ' },
  { key: 'am_nhac', label: 'Âm nhạc' },
  { key: 'my_thuat', label: 'Mĩ thuật' },
];

// Môn nhập điểm kỳ trước: Toán, Ngữ văn, Tiếng Anh, Lịch sử + 4 môn học lựa chọn
export const SCORE_BASE_KEYS = ['toan', 'van', 'anh', 'su'];

export const thptLabel = (key) =>
  THPT_CLUSTER_SUBJECTS.find((s) => s.key === key)?.label ||
  THPT_ELECTIVES.find((s) => s.key === key)?.label ||
  key;

export const scoreableSubjectKeys = (electives = []) => [...SCORE_BASE_KEYS, ...(electives || [])];

// Kiểm tra khai báo: đúng 4 môn lựa chọn + đúng 3 môn cụm chuyên đề, thuộc danh mục cho phép.
export function validateThptDeclaration(electives = [], clusterSubjects = []) {
  const errors = [];
  const e = electives || [];
  const c = clusterSubjects || [];

  if (e.length !== THPT_ELECTIVE_COUNT) {
    errors.push(`Cần chọn đúng ${THPT_ELECTIVE_COUNT} môn học lựa chọn, hiện có ${e.length} môn`);
  }
  const badElectives = e.filter((k) => !THPT_ELECTIVES.some((s) => s.key === k));
  if (badElectives.length) errors.push(`Môn không thuộc danh mục 9 môn lựa chọn: ${badElectives.map(thptLabel).join(', ')}`);

  if (c.length !== THPT_CLUSTER_COUNT) {
    errors.push(`Cần chọn đúng ${THPT_CLUSTER_COUNT} môn thuộc cụm chuyên đề học tập, hiện có ${c.length} môn`);
  }
  const badCluster = c.filter((k) => !THPT_CLUSTER_SUBJECTS.some((s) => s.key === k));
  if (badCluster.length) errors.push(`Môn không thuộc 13 môn của cụm chuyên đề: ${badCluster.map(thptLabel).join(', ')}`);

  return { valid: errors.length === 0, errors };
}