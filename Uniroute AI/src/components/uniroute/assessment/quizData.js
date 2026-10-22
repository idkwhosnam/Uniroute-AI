// Bộ câu hỏi & kết quả Persona cho trang Đánh giá Năng lực

export const PERSONAS = {
  innovator: {
    name: "Kỹ sư Sáng tạo Công nghệ",
    color: "#6366F1",
    desc: "Bạn yêu thích việc xây dựng và tối ưu hệ thống, có tư duy logic mạnh và luôn hướng đến giải pháp. Công nghệ là nơi bạn phát huy tốt nhất năng lực của mình.",
    strengths: ["Tư duy logic", "Giải quyết vấn đề", "Làm việc độc lập", "Học công nghệ nhanh"],
    majors: [
      { major: "Công nghệ Thông tin", schools: "ĐH Bách Khoa · Thủy Lợi · Công nghiệp HN", method: "TSA / Học bạ" },
      { major: "Khoa học Máy tính (VNU-IS)", schools: "ĐH Quốc gia Hà Nội", method: "HSA" },
      { major: "An toàn Thông tin", schools: "PTIT · ĐH FPT", method: "Điểm thi THPT / Học bạ" },
    ],
  },
  strategist: {
    name: "Nhà Chiến lược Kinh doanh",
    color: "#1E3A8A",
    desc: "Bạn có tầm nhìn về số liệu, chi phí và cơ hội. Việc phân tích thị trường, dẫn dắt đội nhóm và ra quyết định là điểm mạnh tự nhiên của bạn.",
    strengths: ["Phân tích thị trường", "Lãnh đạo đội nhóm", "Đàm phán", "Quản trị rủi ro"],
    majors: [
      { major: "Quản trị Kinh doanh", schools: "ĐH Kinh tế Quốc dân", method: "Xét tuyển kết hợp" },
      { major: "Kinh tế Quốc tế", schools: "ĐH Ngoại Thương", method: "Học bạ" },
      { major: "Tài chính — Ngân hàng", schools: "Học viện Tài chính", method: "Xét tuyển kết hợp" },
    ],
  },
  analyst: {
    name: "Nhà Khoa học Dữ liệu",
    color: "#10B981",
    desc: "Bạn kiên trì, chú ý chi tiết và có tư duy phản biện tốt. Bạn thích khám phá quy luật ẩn sau các con số và dữ liệu.",
    strengths: ["Suy luận logic", "Kiên trì", "Chú ý chi tiết", "Tư duy phản biện"],
    majors: [
      { major: "AI & Khoa học Dữ liệu", schools: "ĐH FPT", method: "Học bạ" },
      { major: "Kỹ thuật Máy tính", schools: "ĐH Thủy Lợi", method: "Học bạ" },
      { major: "Toán — Tin học", schools: "ĐH Khoa học Tự nhiên (VNU)", method: "Điểm thi THPT" },
    ],
  },
  humanist: {
    name: "Nhà Nhân văn Truyền thông",
    color: "#F59E0B",
    desc: "Bạn nhạy cảm với ngôn từ, con người và văn hóa. Kỹ năng thuyết trình và sáng tạo nội dung là vũ khí mạnh nhất của bạn.",
    strengths: ["Kỹ năng ngôn ngữ", "Thấu hiểu con người", "Thuyết trình", "Sáng tạo nội dung"],
    majors: [
      { major: "Truyền thông Quốc tế", schools: "ĐH KHXH&NV (VNU)", method: "Điểm thi THPT" },
      { major: "Ngôn ngữ Anh", schools: "ĐH Ngoại ngữ (ULIS)", method: "Học bạ" },
      { major: "Quan hệ Quốc tế", schools: "Học viện Ngoại giao", method: "Học bạ" },
    ],
  },
};

export const QUESTIONS = [
  {
    id: 1,
    q: "Bạn thích môn học nào nhất ở trường?",
    options: [
      { label: "Toán, Vật lý, Tin học", persona: "innovator" },
      { label: "Kinh tế, Giáo dục công dân", persona: "strategist" },
      { label: "Hóa, Sinh — thích làm thí nghiệm", persona: "analyst" },
      { label: "Văn, Sử, Ngoại ngữ", persona: "humanist" },
    ],
  },
  {
    id: 2,
    q: "Trong thời gian rảnh, bạn thường làm gì?",
    options: [
      { label: "Tìm hiểu công nghệ, thử lập trình nhỏ", persona: "innovator" },
      { label: "Đọc sách kinh doanh, theo dõi thị trường", persona: "strategist" },
      { label: "Xem tài liệu khoa học, giải câu đố logic", persona: "analyst" },
      { label: "Viết lách, vẽ, làm nội dung sáng tạo", persona: "humanist" },
    ],
  },
  {
    id: 3,
    q: "Trong một dự án nhóm, bạn thường là người...",
    options: [
      { label: "Thực hiện phần kỹ thuật khó nhất", persona: "innovator" },
      { label: "Lên kế hoạch và phân công công việc", persona: "strategist" },
      { label: "Phân tích dữ liệu, kiểm chứng số liệu", persona: "analyst" },
      { label: "Thuyết trình và kết nối mọi người", persona: "humanist" },
    ],
  },
  {
    id: 4,
    q: "Bạn muốn công việc tương lai của mình...",
    options: [
      { label: "Xây dựng các sản phẩm công nghệ mới", persona: "innovator" },
      { label: "Đàm phán, quản lý và ra quyết định", persona: "strategist" },
      { label: "Nghiên cứu, tìm quy luật từ dữ liệu", persona: "analyst" },
      { label: "Làm việc với con người, ngôn từ, văn hóa", persona: "humanist" },
    ],
  },
  {
    id: 5,
    q: "Khi xử lý một vấn đề khó, bạn thường...",
    options: [
      { label: "Tìm cách làm mới, không theo lối mòn", persona: "innovator" },
      { label: "Đánh giá chi phí — lợi ích trước khi làm", persona: "strategist" },
      { label: "Chuẩn bị đầy đủ dữ liệu rồi mới hành động", persona: "analyst" },
      { label: "Trao đổi với người khác để có góc nhìn đa chiều", persona: "humanist" },
    ],
  },
  {
    id: 6,
    q: "Điều gì khiến bạn tự hào nhất?",
    options: [
      { label: "Giải được một bài toán hóc búa", persona: "innovator" },
      { label: "Dẫn dắt đội nhóm đạt được mục tiêu", persona: "strategist" },
      { label: "Phát hiện ra điều người khác bỏ qua", persona: "analyst" },
      { label: "Tác động tích cực đến cảm xúc của mọi người", persona: "humanist" },
    ],
  },
];

export function computePersona(answers) {
  const counts = { innovator: 0, strategist: 0, analyst: 0, humanist: 0 };
  answers.forEach((a) => {
    if (a) counts[a]++;
  });
  const order = ["innovator", "strategist", "analyst", "humanist"];
  let best = "innovator";
  order.forEach((k) => {
    if (counts[k] > counts[best]) best = k;
  });
  return { persona: best, counts };
}