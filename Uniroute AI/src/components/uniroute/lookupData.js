// Dữ liệu tra cứu tuyển sinh các trường ĐH tại Hà Nội (dành cho trang Tra cứu & trang Nguyện vọng)

export const PROGRAMS = [
  {
    id: "bk-ict", school: "ĐH Bách Khoa Hà Nội", short: "HUST",
    major: "Công nghệ Thông tin", code: "QTD", method: "TSA + IELTS",
    benchmark: "TSA ≥ 70", combo: "Đánh giá tư duy TSA", tuition: "~34 triệu/năm",
    note: "Hạn đăng ký thi TSA đợt 1: 25/03/2026",
  },
  {
    id: "bk-ee", school: "ĐH Bách Khoa Hà Nội", short: "HUST",
    major: "Kỹ thuật Điện — Điện tử", code: "BKA", method: "Điểm thi THPT",
    benchmark: "26.1 (2025)", combo: "A00 · A01", tuition: "~32 triệu/năm",
    note: "Xét theo điểm thi THPT Quốc gia",
  },
  {
    id: "vnu-is", school: "ĐH Quốc gia Hà Nội — VNU-IS", short: "VNU",
    major: "Khoa học Máy tính", code: "QKH", method: "HSA",
    benchmark: "HSA ≥ 80", combo: "Đánh giá năng lực HSA", tuition: "~50 triệu/năm",
    note: "Cổng thi HSA mở đợt 402 từ 15/04/2026",
  },
  {
    id: "neu", school: "ĐH Kinh tế Quốc dân", short: "NEU",
    major: "Quản trị Kinh doanh", code: "QTKD", method: "Xét tuyển kết hợp",
    benchmark: "27.5 (2025)", combo: "A01 · D01", tuition: "~25 triệu/năm",
    note: "Ưu tiên hồ sơ có IELTS 6.5+",
  },
  {
    id: "ftu", school: "ĐH Ngoại Thương", short: "FTU",
    major: "Kinh tế Quốc tế", code: "KTQT", method: "Học bạ",
    benchmark: "GPA 5HK ≥ 9.0", combo: "A01 · D01", tuition: "~30 triệu/năm",
    note: "Hạn nộp hồ sơ xét sớm: 03/04/2026",
  },
  {
    id: "tlu", school: "ĐH Thủy Lợi", short: "TLU",
    major: "Kỹ thuật Máy tính", code: "KTMT", method: "Học bạ",
    benchmark: "GPA 5HK ≥ 8.5", combo: "A00 · A01", tuition: "~24 triệu/năm",
    note: "Xét học bạ + chứng chỉ tiếng Anh",
  },
  {
    id: "haui", school: "ĐH Công nghiệp Hà Nội", short: "HaUI",
    major: "Công nghệ Thông tin", code: "CNTT", method: "Học bạ",
    benchmark: "GPA 5HK ≥ 8.0", combo: "A00 · A01", tuition: "~21 triệu/năm",
    note: "Chỉ tiêu học bạ lớn, cơ hội cao",
  },
  {
    id: "utc", school: "ĐH Giao thông Vận tải", short: "UTCO",
    major: "Logistics & Chuỗi cung ứng", code: "LOG", method: "Điểm thi THPT",
    benchmark: "24.8 (2025)", combo: "A01 · D01", tuition: "~20 triệu/năm",
    note: "Ngành hot, điểm chuẩn tăng nhẹ mỗi năm",
  },
  {
    id: "hnu", school: "ĐH Sư phạm Hà Nội", short: "HNUE",
    major: "Sư phạm Toán học", code: "SPT", method: "Điểm thi THPT",
    benchmark: "26.3 (2025)", combo: "A00", tuition: "~12 triệu/năm",
    note: "Học bổng nhà nước cho ngành sư phạm",
  },
  {
    id: "fpt", school: "ĐH FPT", short: "FPT",
    major: "AI & Khoa học Dữ liệu", code: "AID", method: "Học bạ",
    benchmark: "GPA ≥ 8.0 + Tiếng Anh", combo: "A00 · A01", tuition: "~40 triệu/năm",
    note: "Chương trình tiếng Anh 100%",
  },
  {
    id: "ptit", school: "Học viện Công nghệ Bưu chính Viễn thông", short: "PTIT",
    major: "An toàn Thông tin", code: "ATT", method: "Điểm thi THPT",
    benchmark: "26.5 (2025)", combo: "A00 · A01", tuition: "~22 triệu/năm",
    note: "Ngành ATS, nhu cầu tuyển dụng cao",
  },
  {
    id: "aft", school: "Học viện Tài chính", short: "AFT",
    major: "Tài chính — Ngân hàng", code: "TCNH", method: "Xét tuyển kết hợp",
    benchmark: "27.0 (2025)", combo: "A01 · D01", tuition: "~18 triệu/năm",
    note: "Cân nhắc thêm chứng chỉ toeic 600+",
  },
];

export const METHOD_FILTERS = ["Tất cả", ...new Set(PROGRAMS.map((p) => p.method))];