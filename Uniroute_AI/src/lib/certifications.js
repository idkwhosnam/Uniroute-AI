// certifications.js — Định nghĩa loại chứng chỉ ngoại ngữ / đánh giá năng lực

export const CERT_TYPES = [
  { key: 'ielts', label: 'IELTS', min: 0, scale: 9, step: 0.5, hint: 'Thang 0–9' },
  { key: 'sat', label: 'SAT', min: 400, scale: 1600, step: 10, hint: 'Thang 400–1600' },
  { key: 'hsa', label: 'ĐGNL (HSA/TSA)', min: 0, scale: 150, step: 1, hint: 'Thang 0–150' },
  { key: 'other', label: 'Chứng chỉ khác', min: 0, scale: 100, step: 1, hint: 'Thang 0–100' },
];

export const certMeta = (type) => CERT_TYPES.find((c) => c.key === type) || CERT_TYPES[3];

export const certLabel = (type) => certMeta(type).label;

export const formatCert = (cert) => `${certLabel(cert.type)} ${cert.score}${cert.scale ? `/${cert.scale}` : ''}`;