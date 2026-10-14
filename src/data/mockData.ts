import { Lead, ConsultationHistory, MarketingCampaign, ContentItem, UserProfile } from '@/types';

export const INITIAL_STAFF: UserProfile[] = [
  {
    id: 'usr-admin-1',
    email: 'admin.tuyensinh@dtu.edu.vn',
    fullName: 'ThS. Nguyễn Văn Hải',
    role: 'admin',
    department: 'Ban Giám đốc Trung tâm Tư vấn',
    phone: '0905123456'
  },
  {
    id: 'usr-counselor-1',
    email: 'lan.tuyensinh@dtu.edu.vn',
    fullName: 'Trần Thị Mai Lan',
    role: 'counselor',
    department: 'Bộ phận Tư vấn Trực tiếp & Hotline',
    phone: '0979407340'
  },
  {
    id: 'usr-counselor-2',
    email: 'tuan.cmu@dtu.edu.vn',
    fullName: 'Lê Hoàng Anh Tuấn',
    role: 'counselor',
    department: 'Bộ phận Tư vấn Khối Công nghệ CMU',
    phone: '0888414141'
  },
  {
    id: 'usr-marketer-1',
    email: 'phuong.mkt@dtu.edu.vn',
    fullName: 'Phạm Minh Phương',
    role: 'marketer',
    department: 'Phòng Truyền thông & Tuyển sinh Số',
    phone: '0912345678'
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    fullName: 'Nguyễn Đăng Khôi',
    phone: '0981234567',
    email: 'dangkhoi2008@gmail.com',
    highSchool: 'THPT Chuyên Lê Quý Đôn',
    province: 'Đà Nẵng',
    graduationYear: 2026,
    programId: 'cmu-se',
    programName: 'Công nghệ Phần mềm chuẩn CMU',
    source: 'website',
    status: 'consulting',
    priority: 'high',
    assignedTo: 'usr-counselor-2',
    assignedToName: 'Lê Hoàng Anh Tuấn',
    scoreThpt: 26.5,
    notes: 'Thí sinh đạt giải Nhì Tin học cấp Tỉnh, muốn nộp hồ sơ xét học bổng 100% CMU.',
    createdAt: '2026-10-10T08:30:00Z',
    updatedAt: '2026-10-12T14:20:00Z'
  },
  {
    id: 'lead-2',
    fullName: 'Trần Bảo Ngọc',
    phone: '0918765432',
    email: 'baongoc.tran08@gmail.com',
    highSchool: 'THPT Phan Châu Trinh',
    province: 'Đà Nẵng',
    graduationYear: 2026,
    programId: 'troy-ba',
    programName: 'Quản trị Kinh doanh TROY (Mỹ)',
    source: 'facebook',
    status: 'registered',
    priority: 'high',
    assignedTo: 'usr-counselor-1',
    assignedToName: 'Trần Thị Mai Lan',
    scoreThpt: 25.0,
    notes: 'Đã có chứng chỉ IELTS 6.5, quan tâm học bổng Quỹ Troy 13 tỷ đồng.',
    createdAt: '2026-10-11T09:15:00Z',
    updatedAt: '2026-10-13T10:00:00Z'
  },
  {
    id: 'lead-3',
    fullName: 'Phạm Gia Huy',
    phone: '0934567890',
    email: 'giahuy.pham@outlook.com',
    highSchool: 'THPT Quốc Học Huế',
    province: 'Thừa Thiên Huế',
    graduationYear: 2026,
    programId: 'cmu-is',
    programName: 'An ninh Mạng chuẩn CMU',
    source: 'tiktok',
    status: 'new',
    priority: 'medium',
    assignedTo: 'usr-counselor-2',
    assignedToName: 'Lê Hoàng Anh Tuấn',
    scoreThpt: 24.2,
    notes: 'Thấy video review Tòa G và phòng Lab an ninh mạng trên TikTok.',
    createdAt: '2026-10-13T16:45:00Z',
    updatedAt: '2026-10-13T16:45:00Z'
  },
  {
    id: 'lead-4',
    fullName: 'Võ Thảo My',
    phone: '0903112233',
    email: 'thaomy.vo@gmail.com',
    highSchool: 'THPT Chuyên Nguyễn Bỉnh Khiêm',
    province: 'Quảng Nam',
    graduationYear: 2026,
    programId: 'psu-fintech',
    programName: 'Công nghệ Tài chính (FinTech) chuẩn PSU',
    source: 'event',
    status: 'contacted',
    priority: 'high',
    assignedTo: 'usr-counselor-1',
    assignedToName: 'Trần Thị Mai Lan',
    scoreThpt: 27.0,
    notes: 'Gặp tại Ngày hội Tư vấn Tuyển sinh & Hướng nghiệp 2026.',
    createdAt: '2026-10-09T11:00:00Z',
    updatedAt: '2026-10-11T15:30:00Z'
  },
  {
    id: 'lead-5',
    fullName: 'Đỗ Hoàng Nam',
    phone: '0945998877',
    email: 'hoangnam.do@gmail.com',
    highSchool: 'THPT Huỳnh Thúc Kháng',
    province: 'Nghệ An',
    graduationYear: 2026,
    programId: 'csu-arch',
    programName: 'Kiến trúc Công trình chuẩn CSU',
    source: 'referral',
    status: 'enrolled',
    priority: 'high',
    assignedTo: 'usr-counselor-1',
    assignedToName: 'Trần Thị Mai Lan',
    scoreThpt: 26.0,
    notes: 'Anh trai là cựu sinh viên K26 CSU Kiến trúc giới thiệu. Đã nộp bản vẽ năng khiếu.',
    createdAt: '2026-10-05T14:10:00Z',
    updatedAt: '2026-10-14T09:00:00Z'
  },
  {
    id: 'lead-6',
    fullName: 'Hoàng Kim Chi',
    phone: '0977889900',
    email: 'kimchi.hoang@gmail.com',
    highSchool: 'THPT Trần Phú',
    province: 'Đà Nẵng',
    graduationYear: 2026,
    programId: 'troy-thm',
    programName: 'Quản trị Du lịch & Khách sạn TROY (Mỹ)',
    source: 'website',
    status: 'new',
    priority: 'medium',
    assignedTo: 'usr-counselor-1',
    assignedToName: 'Trần Thị Mai Lan',
    scoreThpt: 22.5,
    notes: 'Đăng ký tư vấn trực tuyến qua trang web về kỳ thực tập tại resort 5 sao.',
    createdAt: '2026-10-14T11:20:00Z',
    updatedAt: '2026-10-14T11:20:00Z'
  },
  {
    id: 'lead-7',
    fullName: 'Ngô Thanh Sơn',
    phone: '0966554433',
    email: 'thanhson.ngo@yahoo.com',
    highSchool: 'THPT Nguyễn Trãi',
    province: 'Đà Nẵng',
    graduationYear: 2026,
    programId: 'psu-ib',
    programName: 'Kinh doanh Quốc tế chuẩn PSU',
    source: 'hotline',
    status: 'consulting',
    priority: 'medium',
    assignedTo: 'usr-counselor-1',
    assignedToName: 'Trần Thị Mai Lan',
    scoreThpt: 23.0,
    notes: 'Phụ huynh gọi hotline hỏi về học phí và chính sách trả góp.',
    createdAt: '2026-10-12T10:00:00Z',
    updatedAt: '2026-10-13T14:00:00Z'
  }
];

export const INITIAL_CONSULTATION_LOGS: ConsultationHistory[] = [
  {
    id: 'log-1',
    leadId: 'lead-1',
    staffId: 'usr-counselor-2',
    staffName: 'Lê Hoàng Anh Tuấn',
    contactMethod: 'call',
    content: 'Tư vấn chi tiết chương trình CMU Software Engineering đạt chuẩn ABET, thông báo điều kiện hồ sơ học bổng 25 điểm trở lên.',
    outcome: 'Thí sinh rất hào hứng, xin gửi tài liệu PDF K32 qua Zalo để trao đổi với bố mẹ.',
    nextFollowUpDate: '2026-10-16',
    createdAt: '2026-10-12T14:20:00Z'
  },
  {
    id: 'log-2',
    leadId: 'lead-2',
    staffId: 'usr-counselor-1',
    staffName: 'Trần Thị Mai Lan',
    contactMethod: 'meeting',
    content: 'Đón tiếp phụ huynh và em Ngọc trực tiếp tại Tòa G - 120 Hoàng Minh Thảo. Giới thiệu lộ trình 4 năm nhận bằng Cử nhân Mỹ từ Đại học Troy.',
    outcome: 'Phụ huynh đã đặt cọc giữ chỗ và hoàn thành phiếu đăng ký xét tuyển đợt 1.',
    nextFollowUpDate: '2026-10-20',
    createdAt: '2026-10-13T10:00:00Z'
  },
  {
    id: 'log-3',
    leadId: 'lead-4',
    staffId: 'usr-counselor-1',
    staffName: 'Trần Thị Mai Lan',
    contactMethod: 'zalo',
    content: 'Gửi bảng học phí FinTech PSU, giải thích cơ hội việc làm liên kết với các ngân hàng MB, Vietinbank và các công ty công nghệ thanh toán.',
    outcome: 'Em My hẹn cuối tuần lên tham quan trường.',
    nextFollowUpDate: '2026-10-18',
    createdAt: '2026-10-11T15:30:00Z'
  }
];

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'camp-1',
    title: 'Chiến dịch Tuyển sinh K32: Nắm Bắt Tương Lai Chuẩn Mỹ',
    channel: 'facebook',
    targetAudience: 'Học sinh lớp 12 & Phụ huynh tại Đà Nẵng, Quảng Nam, Thừa Thiên Huế, Quảng Ngãi',
    budget: 35000000,
    spent: 18500000,
    leadsGenerated: 142,
    status: 'active',
    startDate: '2026-09-15',
    endDate: '2026-11-30',
    notes: 'Quảng bá video giới thiệu Tòa G và 55 suất học bổng toàn phần CMU/PSU/CSU.'
  },
  {
    id: 'camp-2',
    title: 'Series Video TikTok: Một ngày làm sinh viên Troy & CMU',
    channel: 'tiktok',
    targetAudience: 'Gen Z đam mê Công nghệ & Du lịch quốc tế',
    budget: 15000000,
    spent: 8200000,
    leadsGenerated: 89,
    status: 'active',
    startDate: '2026-10-01',
    endDate: '2026-11-15',
    notes: 'Viral clip thang máy trong suốt view đắt giá Tòa G đạt 450K view.'
  },
  {
    id: 'camp-3',
    title: 'Ngày hội Open Day & Trải Nghiệm Học Thử VN-US K32',
    channel: 'event',
    targetAudience: 'Học sinh các trường THPT Chuyên Miền Trung',
    budget: 50000000,
    spent: 45000000,
    leadsGenerated: 215,
    status: 'completed',
    startDate: '2026-09-20',
    endDate: '2026-10-05',
    notes: 'Sự kiện trực tiếp tại Cơ sở 120 Hoàng Minh Thảo với sự tham gia của 600 học sinh.'
  }
];

export const INITIAL_CONTENT_CALENDAR: ContentItem[] = [
  {
    id: 'cnt-1',
    title: 'Tòa G - Biểu tượng mới của không gian học tập hiện đại tại Đà Nẵng',
    campaignId: 'camp-1',
    campaignTitle: 'Nắm Bắt Tương Lai Chuẩn Mỹ',
    platform: 'facebook',
    status: 'published',
    author: 'Phạm Minh Phương',
    scheduledAt: '2026-10-08',
    publishUrl: 'https://facebook.com/vnus.dtu/posts/10293847',
    contentSnippet: 'Với thiết kế kính tinh tế, view bầu trời xanh mát cùng hệ thống hơn 184 phòng học, Tòa G 120 Hoàng Minh Thảo đã sẵn sàng đón chào K32...'
  },
  {
    id: 'cnt-2',
    title: 'Học bổng 13 Tỷ Đồng Đại học Troy (Mỹ) cấp tại Việt Nam cần điều kiện gì?',
    campaignId: 'camp-1',
    campaignTitle: 'Nắm Bắt Tương Lai Chuẩn Mỹ',
    platform: 'website',
    status: 'published',
    author: 'Phạm Minh Phương',
    scheduledAt: '2026-10-11',
    publishUrl: 'https://troy.edu.vn/tin-tuc/hoc-bong-k32',
    contentSnippet: 'Chi tiết 3 điều kiện nhận học bổng Quỹ Troy lên đến 100% học phí với điểm THPT từ 23-26đ hoặc IELTS 5.5...'
  },
  {
    id: 'cnt-3',
    title: 'Review chân thực ngành An ninh mạng CMU đạt kiểm định ABET danh giá',
    campaignId: 'camp-2',
    campaignTitle: 'Một ngày làm sinh viên Troy & CMU',
    platform: 'tiktok',
    status: 'pending_review',
    author: 'Lê Hoàng Anh Tuấn',
    scheduledAt: '2026-10-18',
    contentSnippet: 'Kịch bản video 60s phỏng vấn sinh viên năm 3 thực chiến diễn tập phòng thủ không gian mạng tại Lab CMU...'
  },
  {
    id: 'cnt-4',
    title: 'Top 5 lý do bạn nên chọn ngành Kiến trúc Công trình chuẩn Cal Poly (CSU)',
    campaignId: 'camp-1',
    campaignTitle: 'Nắm Bắt Tương Lai Chuẩn Mỹ',
    platform: 'facebook',
    status: 'draft',
    author: 'Phạm Minh Phương',
    scheduledAt: '2026-10-22',
    contentSnippet: 'Đào tạo chuẩn công nghệ BIM, nhận 20 suất học bổng toàn phần dành riêng cho tân sinh viên Kiến trúc Xây dựng...'
  }
];
