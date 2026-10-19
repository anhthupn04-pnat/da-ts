// Danh mục Tỉnh/Thành phố và các Trường THPT tiêu biểu phục vụ gợi ý tự động cho tuyển sinh

export interface ProvinceSchoolData {
  id: string;
  name: string;
  region: 'Bắc' | 'Trung' | 'Nam' | 'Tây Nguyên';
  schools: string[];
}

export const PROVINCES_AND_SCHOOLS: ProvinceSchoolData[] = [
  {
    id: 'da-nang',
    name: 'Đà Nẵng',
    region: 'Trung',
    schools: [
      'THPT Chuyên Lê Quý Đôn',
      'THPT Phan Châu Trinh',
      'THPT Hoàng Hoa Thám',
      'THPT Hòa Vang',
      'THPT Trần Phú',
      'THPT Nguyễn Trãi',
      'THPT Thái Phiên',
      'THPT Ngô Quyền',
      'THPT Thanh Khê',
      'THPT Cẩm Lệ',
      'THPT Võ Chí Công',
      'THPT Phan Thành Tài',
      'THPT Ông Ích Khiêm',
      'THPT Phạm Phú Thứ',
      'THPT Nguyễn Khuyến',
      'THPT Tôn Thất Tùng',
      'THPT FPT Đà Nẵng',
      'THPT Sky-Line'
    ]
  },
  {
    id: 'quang-nam',
    name: 'Quảng Nam',
    region: 'Trung',
    schools: [
      'THPT Chuyên Nguyễn Bỉnh Khiêm',
      'THPT Chuyên Lê Thánh Tông',
      'THPT Trần Cao Vân',
      'THPT Huỳnh Thúc Kháng',
      'THPT Sào Nam',
      'THPT Nguyễn Duy Hiệu',
      'THPT Phan Bội Châu',
      'THPT Lê Quý Đôn (Quảng Nam)',
      'THPT Tiểu La',
      'THPT Nguyễn Huệ (Quảng Nam)',
      'THPT Núi Thành',
      'THPT Duy Tân',
      'THPT Đỗ Đăng Tuyển',
      'THPT Bắc Trà My',
      'THPT Nam Giang'
    ]
  },
  {
    id: 'thua-thien-hue',
    name: 'Thừa Thiên Huế',
    region: 'Trung',
    schools: [
      'THPT Chuyên Quốc Học Huế',
      'THPT Hai Bà Trưng (Đồng Khánh)',
      'THPT Nguyễn Huệ (Huế)',
      'THPT Gia Hội',
      'THPT Phan Đăng Lưu',
      'THPT Cao Thắng',
      'THPT Nguyễn Chí Thanh',
      'THPT Đặng Huy Trứ',
      'THPT Hương Thủy',
      'THPT Phú Bài',
      'THPT Quảng Điền',
      'THPT Phong Điền'
    ]
  },
  {
    id: 'quang-tri',
    name: 'Quảng Trị',
    region: 'Trung',
    schools: [
      'THPT Chuyên Lê Quý Đôn (Quảng Trị)',
      'THPT Thị xã Quảng Trị',
      'THPT Đông Hà',
      'THPT Lê Lợi',
      'THPT Vĩnh Linh',
      'THPT Gio Linh',
      'THPT Cam Lộ',
      'THPT Triệu Phong',
      'THPT Hải Lăng'
    ]
  },
  {
    id: 'quang-ngai',
    name: 'Quảng Ngãi',
    region: 'Trung',
    schools: [
      'THPT Chuyên Lê Khiết',
      'THPT Trần Quốc Tuấn',
      'THPT Ba Tơ',
      'THPT Bình Sơn',
      'THPT Đức Phổ 1',
      'THPT Mộ Đức 1',
      'THPT Sơn Tịnh 1',
      'THPT Tư Nghĩa 1',
      'THPT Võ Nguyên Giáp (Quảng Ngãi)'
    ]
  },
  {
    id: 'binh-dinh',
    name: 'Bình Định',
    region: 'Trung',
    schools: [
      'THPT Chuyên Lê Quý Đôn (Bình Định)',
      'THPT Chuyên Chu Văn An (Bình Định)',
      'THPT Quốc Học Quy Nhơn',
      'THPT Trưng Vương',
      'THPT Nguyễn Trọng Trì',
      'THPT An Nhơn 1',
      'THPT Hoài Nhơn 1',
      'THPT Phù Cát 1'
    ]
  },
  {
    id: 'dak-lak',
    name: 'Đắk Lắk',
    region: 'Tây Nguyên',
    schools: [
      'THPT Chuyên Nguyễn Du',
      'THPT Buôn Ma Thuột',
      'THPT Lê Quý Đôn (Buôn Ma Thuột)',
      'THPT Hồng Đức',
      'THPT Cư M’gar',
      'THPT Krông Ana',
      'THPT Ea H’leo'
    ]
  },
  {
    id: 'gia-lai',
    name: 'Gia Lai',
    region: 'Tây Nguyên',
    schools: [
      'THPT Chuyên Hùng Vương (Gia Lai)',
      'THPT Pleiku',
      'THPT Phan Bội Châu (Gia Lai)',
      'THPT Lê Lợi (Gia Lai)',
      'THPT Chi Lăng',
      'THPT Nguyễn Trãi (An Khê)'
    ]
  },
  {
    id: 'nghe-an',
    name: 'Nghệ An',
    region: 'Bắc',
    schools: [
      'THPT Chuyên Phan Bội Châu',
      'THPT Huỳnh Thúc Kháng (Vinh)',
      'THPT Hà Huy Tập',
      'THPT Lê Viết Thuật',
      'THPT Đô Lương 1',
      'THPT Diễn Châu 1',
      'THPT Quỳnh Lưu 1',
      'THPT Thanh Chương 1'
    ]
  },
  {
    id: 'ha-tinh',
    name: 'Hà Tĩnh',
    region: 'Bắc',
    schools: [
      'THPT Chuyên Hà Tĩnh',
      'THPT Phan Đình Phùng',
      'THPT Lý Tự Trọng',
      'THPT Hương Sơn',
      'THPT Kỳ Anh',
      'THPT Cẩm Xuyên'
    ]
  },
  {
    id: 'ha-noi',
    name: 'Hà Nội',
    region: 'Bắc',
    schools: [
      'THPT Chuyên Hà Nội - Amsterdam',
      'THPT Chu Văn An',
      'THPT Kim Liên',
      'THPT Thăng Long',
      'THPT Việt Đức',
      'THPT Yên Hòa',
      'THPT Phan Đình Phùng (HN)',
      'THPT Chuyên Ngoại Ngữ'
    ]
  },
  {
    id: 'ho-chi-minh',
    name: 'TP. Hồ Chí Minh',
    region: 'Nam',
    schools: [
      'THPT Chuyên Lê Hồng Phong',
      'THPT Chuyên Trần Đại Nghĩa',
      'THPT Nguyễn Thị Minh Khai',
      'THPT Bùi Thị Xuân',
      'THPT Lê Quý Đôn (TP.HCM)',
      'THPT Gia Định',
      'THPT Mạc Đĩnh Chi',
      'THPT Nguyễn Thượng Hiền'
    ]
  }
];

export const EXAM_BLOCKS = [
  { code: 'A00', subjects: 'Toán, Vật lý, Hóa học' },
  { code: 'A01', subjects: 'Toán, Vật lý, Tiếng Anh' },
  { code: 'D01', subjects: 'Toán, Ngữ văn, Tiếng Anh' },
  { code: 'D07', subjects: 'Toán, Hóa học, Tiếng Anh' },
  { code: 'B00', subjects: 'Toán, Hóa học, Sinh học' },
  { code: 'C00', subjects: 'Ngữ văn, Lịch sử, Địa lý' },
  { code: 'V00', subjects: 'Toán, Vật lý, Vẽ Mỹ thuật' },
  { code: 'V01', subjects: 'Toán, Ngữ văn, Vẽ Mỹ thuật' }
];

export const LEAD_SOURCES_CONFIG = [
  { id: 'website', name: 'Website Đăng Ký Trực Tuyến (Website_Form)', icon: 'Globe' },
  { id: 'facebook', name: 'Facebook Fanpage & Ads', icon: 'Facebook' },
  { id: 'tiktok', name: 'TikTok Video & Ads', icon: 'Video' },
  { id: 'event', name: 'Ngày Hội Open Day & Triển Lãm', icon: 'Calendar' },
  { id: 'high_school_tour', name: 'Tour Tuyển Sinh Tại Trường THPT', icon: 'School' },
  { id: 'hotline', name: 'Tổng Đài Hotline & Zalo Tuyển Sinh', icon: 'Phone' },
  { id: 'referral', name: 'Người Thân / Cựu Sinh Viên Giới Thiệu', icon: 'UserCheck' },
  { id: 'other', name: 'Nguồn Khác', icon: 'MoreHorizontal' }
];
