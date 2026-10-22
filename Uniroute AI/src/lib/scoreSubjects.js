// scoreSubjects.js — Xác định môn bắt buộc nhập điểm trên trang Cập nhật điểm.
// Bắt buộc = 3 môn bắt buộc THPT (Toán, Ngữ văn, Tiếng Anh) + các môn học sinh đã khai báo
// tại khối "Môn học lựa chọn THPT" ở Hồ sơ (4 môn lựa chọn + 3 môn cụm chuyên đề).

import { thptLabel } from '@/lib/thptSubjects';

export const THPT_COMPULSORY_KEYS = ['toan', 'van', 'anh', 'su'];

const uniq = (arr) => [...new Set(arr)];

export function declaredKeys(profile) {
  if (!profile?.has_thpt_subjects) return [];
  return uniq([...(profile.thpt_electives || []), ...(profile.thpt_cluster_subjects || [])]);
}

export function requiredScoreKeys(profile) {
  return uniq([...THPT_COMPULSORY_KEYS, ...declaredKeys(profile)]);
}

// Chia môn thành 3 cụm: bắt buộc / tự chọn đã khai báo / môn khác
export function scoreSubjectGroups(subjectList = [], profile) {
  const byKey = new Map(subjectList.map((s) => [s.key, s]));
  const electives = profile?.has_thpt_subjects ? profile.thpt_electives || [] : [];
  const clusters = profile?.has_thpt_subjects ? profile.thpt_cluster_subjects || [] : [];

  const itemOf = (key, tag) => ({ key, label: byKey.get(key)?.label || thptLabel(key), tag });

  const compulsory = THPT_COMPULSORY_KEYS.filter((k) => byKey.has(k));
  // Môn trùng giữa bắt buộc / tự chọn / chuyên đề chỉ nhập điểm một lần, ưu tiên cụm trước
  const electiveKeys = electives.filter((k) => byKey.has(k) && !compulsory.includes(k));
  const clusterKeys = clusters.filter((k) => byKey.has(k) && !compulsory.includes(k) && !electiveKeys.includes(k));
  const requiredSet = new Set([...compulsory, ...electiveKeys, ...clusterKeys]);

  return [
    { key: 'compulsory', title: 'Môn bắt buộc', required: true, items: compulsory.map((k) => itemOf(k, '')) },
    {
      key: 'electives',
      title: 'Môn tự chọn đã khai báo ở Hồ sơ',
      required: true,
      items: electiveKeys.map((k) => itemOf(k, 'Môn lựa chọn')),
    },
    {
      key: 'clusters',
      title: 'Môn chuyên đề đã khai báo ở Hồ sơ',
      required: true,
      items: clusterKeys.map((k) => itemOf(k, 'Cụm chuyên đề')),
    },
    {
      key: 'others',
      title: 'Môn khác (không bắt buộc)',
      required: false,
      items: subjectList
        .filter((s) => !requiredSet.has(s.key))
        .map((s) => ({ key: s.key, label: s.label, tag: s.category === 'compulsory' ? 'Bắt buộc' : s.category === 'cluster' ? 'Cụm chuyên đề' : 'Tự chọn' })),
    },
  ].filter((g) => g.items.length > 0);
}

// Các môn bắt buộc còn thiếu điểm trong một thẻ điểm
export function missingRequiredKeys(scores, subjectList, profile) {
  const byKey = new Map((subjectList || []).map((s) => [s.key, s]));
  return requiredScoreKeys(profile)
    .filter((k) => byKey.has(k))
    .filter((k) => scores?.[k] == null || scores[k] === '');
}

export const labelFor = (key, subjectList = []) =>
  subjectList.find((s) => s.key === key)?.label || thptLabel(key);