// admissionPlanMock.js — Mock data cho đề án tuyển sinh (UC-08 mở rộng)

export const QUYCHE = {
  thpt:
    'Trường xét tuyển dựa trên kết quả thi tốt nghiệp THPT năm 2026. Thí sinh được đăng ký không giới hạn nguyện vọng. Điểm xét tuyển = tổng điểm 3 môn trong tổ hợp xét tuyển (thang điểm 30) + điểm ưu tiên khu vực/đối tượng (nếu có).',
  utxt:
    'Trường ưu tiên xét tuyển thí sinh đạt giải trong các kỳ thi học sinh giỏi quốc gia, quốc tế; thí sinh thuộc diện ưu tiên xét tuyển theo quy định của Bộ GD&ĐT. Thí sinh được xét tuyển thẳng hoặc ưu tiên xét tuyển tùy theo loại giải thưởng.',
  ketHop:
    'Trường xét tuyển kết hợp giữa kết quả học tập THPT, điểm thi tốt nghiệp, chứng chỉ quốc tế và điểm đánh giá năng lực/tư duy của các trường đại học. Thí sinh có thể sử dụng nhiều phương thức kết hợp khác nhau.',
};

export const QUY_DOI_TABLE = [
  { ielts: '8.0+', toefl_ibt: '110+', toeic: '900+/9.0', diem: '10.0' },
  { ielts: '7.5', toefl_ibt: '102', toeic: '880/8.0', diem: '9.5' },
  { ielts: '7.0', toefl_ibt: '94', toeic: '800/7.0', diem: '9.0' },
  { ielts: '6.5', toefl_ibt: '79', toeic: '750/6.5', diem: '8.0' },
  { ielts: '6.0', toefl_ibt: '60', toeic: '700/6.0', diem: '7.0' },
  { ielts: '5.5', toefl_ibt: '46', toeic: '650/5.5', diem: '6.0' },
  { ielts: '5.0', toefl_ibt: '35', toeic: '600/5.0', diem: '5.0' },
];

export const KET_HOP_METHODS = [
  {
    id: 'sat-act',
    title: 'Thí sinh có chứng chỉ SAT, ACT',
    desc: 'Thí sinh có chứng chỉ SAT ≥ 1200 hoặc ACT ≥ 25 được xét tuyển kết hợp với điểm học bạ THPT hoặc điểm thi tốt nghiệp.',
  },
  {
    id: 'ccta-dgnl',
    title: 'CCTA Quốc tế kết hợp điểm thi tốt nghiệp',
    desc: 'Thí sinh có chứng chỉ tiếng Anh quốc tế (IELTS, TOEFL, TOEIC) kết hợp với điểm thi tốt nghiệp THPT theo tỷ lệ quy đổi.',
  },
  {
    id: 'hsa',
    title: 'Điểm ĐGNL HSA',
    desc: 'Trường công nhận kết quả thi Đánh giá năng lực (HSA) do ĐHQG Hà Nội tổ chức. Điểm xét tuyển = điểm HSA + điểm ưu tiên.',
  },
  {
    id: 'vact',
    title: 'Điểm ĐGNL V-ACT',
    desc: 'Trường công nhận kết quả thi Đánh giá năng lực (V-ACT) do ĐHQG TP.HCM tổ chức. Điểm xét tuyển = điểm V-ACT + điểm ưu tiên.',
  },
  {
    id: 'tsa',
    title: 'Điểm Đánh giá Tư duy',
    desc: 'Trường công nhận kết quả thi Đánh giá Tư duy (TSA) do ĐH Bách Khoa Hà Nội tổ chức.',
  },
  {
    id: 'hsa-ccta',
    title: 'Kết hợp HSA với CCTAQT',
    desc: 'Thí sinh có kết hợp điểm HSA và chứng chỉ tiếng Anh quốc tế. Điểm xét tuyển = điểm HSA × 0.7 + điểm quy đổi CCTAQT × 0.3.',
  },
  {
    id: 'vact-ccta',
    title: 'Kết hợp V-ACT với CCTAQT',
    desc: 'Thí sinh có kết hợp điểm V-ACT và chứng chỉ tiếng Anh quốc tế. Điểm xét tuyển = điểm V-ACT × 0.7 + điểm quy đổi CCTAQT × 0.3.',
  },
  {
    id: 'tsa-ccta',
    title: 'Kết hợp TSA với CCTAQT',
    desc: 'Thí sinh có kết hợp điểm TSA và chứng chỉ tiếng Anh quốc tế. Điểm xét tuyển = điểm TSA × 0.7 + điểm quy đổi CCTAQT × 0.3.',
  },
];

export const Utxt_CATEGORIES = [
  'Thí sinh đạt giải Nhất, Nhì, Ba trong kỳ thi chọn học sinh giỏi quốc gia',
  'Thí sinh đạt giải Nhất, Nhì, Ba trong kỳ thi khoa học kỹ thuật quốc gia',
  'Thí sinh đạt giải trong các kỳ thi quốc tế được Bộ GD&ĐT công nhận',
  'Thí sinh thuộc diện ưu tiên xét tuyển theo quy định của Bộ GD&ĐT',
];