// Shared data & computation helpers for UniRoute AI dashboard

export const UNIVERSITIES = [
  { id: "bk", name: "ĐH Bách Khoa Hà Nội", major: "Công nghệ Thông tin", method: "TSA + IELTS" },
  { id: "vnu", name: "ĐH Quốc gia Hà Nội (VNU-IS)", major: "Khoa học Máy tính", method: "HSA" },
  { id: "neu", name: "ĐH Kinh tế Quốc dân", major: "Quản trị Kinh doanh", method: "Xét tuyển kết hợp" },
  { id: "ftu", name: "ĐH Ngoại Thương", major: "Kinh tế Quốc tế", method: "Học bạ" },
  { id: "tlu", name: "ĐH Thủy Lợi", major: "Kỹ thuật Máy tính", method: "Học bạ" },
  { id: "haui", name: "ĐH Công nghiệp Hà Nội", major: "Công nghệ Thông tin", method: "Học bạ" },
  { id: "utc", name: "ĐH Giao thông Vận tải", major: "Logistics", method: "Điểm thi THPT" },
  { id: "hnu", name: "ĐH Sư phạm Hà Nội", major: "Sư phạm Toán", method: "Điểm thi THPT" },
];

export const INITIAL_WISHES = [
  { id: "w1", tag: "NV1", rank: "Top 1", school: "ĐH Bách Khoa", major: "Khoa học Máy tính", method: "TSA + IELTS", primary: true },
  { id: "w2", tag: "NV2", rank: "Top 2", school: "ĐH Quốc gia Hà Nội", major: "CNTT", method: "HSA", primary: true },
  { id: "w3", tag: "NV3", rank: "Backup", school: "ĐH Công nghiệp Hà Nội", major: "CNTT", method: "Học bạ", primary: false },
];

export const INITIAL_ALERTS = [
  { id: "a1", type: "urgent", title: "Hạn đóng cổng đăng ký thi TSA Bách Khoa đợt 1", countdown: "Còn 3 ngày", deadline: "Hạn: 25/03/2026" },
  { id: "a2", type: "warning", title: "Hạn nộp hồ sơ xét tuyển sớm ĐH Ngoại Thương", countdown: "Còn 12 ngày", deadline: "Hạn: 03/04/2026" },
  { id: "a3", type: "info", title: "Lịch mở cổng thi HSA ĐHQGHN đợt 402", countdown: "Sắp mở", deadline: "Từ 15/04/2026" },
];

export const ROADMAPS = {
  primary: {
    name: "Lộ trình Xét tuyển Thích ứng (Grade 12 Roadmap)",
    alert: "Nếu kết quả TSA đạt dưới 70 điểm, hệ thống sẽ tự động chuyển hướng ưu tiên sang phương thức HSA (ĐHQGHN) hoặc Học bạ ĐH Thủy Lợi.",
    nodes: [
      { status: "completed", date: "Tháng 10/2025", title: "Thi IELTS đạt 6.5", detail: "Mục tiêu: 6.5", badge: "Đạt" },
      { status: "active", date: "Tháng 03/2026", title: "Kỳ thi Đánh giá tư duy TSA Bách Khoa", detail: "Mục tiêu: 75/100", actionType: "tsa" },
      { status: "upcoming", date: "Tháng 05/2026", title: "Nộp hồ sơ Xét tuyển sớm", detail: "IELTS + Học bạ" },
      { status: "upcoming", date: "Tháng 07/2026", title: "Thi THPT Quốc gia & Đăng ký NV chính thức", detail: "Kỳ thi tốt nghiệp THPT" },
    ],
  },
  backup: {
    name: "Lộ trình Dự phòng (Backup Roadmap)",
    alert: "Nếu điểm HSA đạt trên 80, hệ thống sẽ đề xuất chuyển lại lộ trình chính (TSA Bách Khoa) để tối ưu cơ hội NV1.",
    nodes: [
      { status: "completed", date: "Tháng 10/2025", title: "Thi IELTS đạt 6.5", detail: "Mục tiêu: 6.5", badge: "Đạt" },
      { status: "active", date: "Tháng 04/2026", title: "Kỳ thi Đánh giá năng lực HSA (ĐHQGHN)", detail: "Mục tiêu: 80/100", actionType: "hsa" },
      { status: "upcoming", date: "Tháng 05/2026", title: "Nộp hồ sơ Học bạ ĐH Thủy Lợi", detail: "GPA 5HK + IELTS" },
      { status: "upcoming", date: "Tháng 07/2026", title: "Thi THPT Quốc gia & Đăng ký NV chính thức", detail: "Kỳ thi tốt nghiệp THPT" },
    ],
  },
};

export function computeFeasibility(mode, { ielts, gpa, tsa, hsa }) {
  const raw =
    mode === "backup"
      ? 85 + (hsa - 78) * 0.5 + (ielts - 6.5) * 2 + (gpa - 8.8) * 1.5
      : 85 + (tsa - 72) * 0.5 + (ielts - 6.5) * 3 + (gpa - 8.8) * 1.5;
  return Math.max(5, Math.min(98, Math.round(raw)));
}

export function computeChances({ ielts, gpa, tsa }) {
  const clamp = (v) => Math.max(5, Math.min(99, Math.round(v)));
  return [
    {
      school: "ĐH Bách Khoa Hà Nội",
      major: "Ngành CNTT",
      score: "26.5 / 27.0",
      chance: clamp(82 + (tsa - 72) * 1.2 + (ielts - 6.5) * 4 + (gpa - 8.8) * 2),
    },
    {
      school: "ĐH Quốc gia Hà Nội",
      major: "VNU-IS",
      score: `Quy đổi IELTS ${ielts} = ${ielts >= 6.5 ? "10.0" : "9.0"} môn Anh`,
      chance: clamp(94 + (ielts - 6.5) * 5 + (gpa - 8.8) * 1.5),
    },
    {
      school: "ĐH Kinh tế Quốc dân",
      major: "NEU",
      score: "Xét tuyển kết hợp nhóm 2",
      chance: clamp(78 + (gpa - 8.8) * 3 + (ielts - 6.5) * 2),
    },
  ];
}

export function chanceLevel(chance) {
  if (chance >= 90) return "Rất cao";
  if (chance >= 80) return "An toàn";
  if (chance >= 70) return "Khá";
  return "Cần nỗ lực";
}