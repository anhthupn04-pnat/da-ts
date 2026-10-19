import {
  Lead,
  ConsultationHistory,
  MarketingCampaign,
  ContentItem,
  UserProfile,
  AuditLog,
  ImportBatch,
  ZnsSmsLog
} from '@/types';

// Danh sách cán bộ & chuyên viên đại diện 5 nhóm quyền cốt lõi
export const INITIAL_STAFF: UserProfile[] = [
  {
    id: 'usr-admin-1',
    email: 'admin.tuyensinh@dtu.edu.vn',
    fullName: 'ThS. Nguyễn Văn Hải',
    role: 'admin',
    department: 'Ban Giám đốc & Quản trị Hệ thống',
    phone: '0905123456',
    status: 'active',
    assignedRegion: 'Toàn quốc',
    targetQuota: 200
  },
  {
    id: 'usr-manager-1',
    email: 'manager.tuyensinh@dtu.edu.vn',
    fullName: 'TS. Đặng Thanh Bình',
    role: 'manager',
    department: 'Ban Lãnh đạo Tuyển sinh (Trưởng Ban)',
    phone: '0905999888',
    status: 'active',
    assignedRegion: 'Toàn quốc',
    targetQuota: 150
  },
  {
    id: 'usr-counselor-1',
    email: 'lan.tuyensinh@dtu.edu.vn',
    fullName: 'Trần Thị Mai Lan',
    role: 'counselor',
    department: 'Bộ phận Tư vấn Tuyển sinh & Hotline',
    phone: '0979407340',
    status: 'active',
    assignedRegion: 'Đà Nẵng & Quảng Nam',
    targetQuota: 80
  },
  {
    id: 'usr-counselor-2',
    email: 'tuan.cmu@dtu.edu.vn',
    fullName: 'Lê Hoàng Anh Tuấn',
    role: 'counselor',
    department: 'Bộ phận Tư vấn Khối Công nghệ CMU',
    phone: '0888414141',
    status: 'active',
    assignedRegion: 'Thừa Thiên Huế & Bắc Trung Bộ',
    targetQuota: 80
  },
  {
    id: 'usr-marketer-1',
    email: 'phuong.mkt@dtu.edu.vn',
    fullName: 'Phạm Minh Phương',
    role: 'marketer',
    department: 'Phòng Truyền thông & Tuyển sinh Số',
    phone: '0912345678',
    status: 'active',
    assignedRegion: 'Toàn quốc',
    targetQuota: 0
  },
  {
    id: 'usr-verifier-1',
    email: 'ngoc.verify@dtu.edu.vn',
    fullName: 'ThS. Hoàng Thị Bích Ngọc',
    role: 'verifier',
    department: 'Tổ Hậu kiểm & Thẩm định Hồ sơ Xét tuyển',
    phone: '0935112233',
    status: 'active',
    assignedRegion: 'Toàn quốc',
    targetQuota: 0
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'TS-2026-1001',
    fullName: 'Nguyễn Đăng Khôi',
    phone: '0981234567',
    idCardNumber: '048208001234',
    email: 'dangkhoi2008@gmail.com',
    highSchool: 'THPT Chuyên Lê Quý Đôn',
    province: 'Đà Nẵng',
    graduationYear: 2026,
    programId: 'cmu-se',
    programName: 'Kỹ nghệ Phần mềm chuẩn CMU',
    secondaryProgramId: 'cmu-is',
    secondaryProgramName: 'An toàn Thông tin chuẩn CMU',
    examBlock: 'A00',
    estimatedScore: 26.5,
    source: 'website',
    utmCampaign: 'CAMP_VNUS_DIGITAL',
    status: 'consulted_1',
    priority: 'high',
    assignedTo: 'usr-counselor-2',
    assignedToName: 'Lê Hoàng Anh Tuấn',
    paymentStatus: 'unpaid',
    notes: 'Thí sinh đạt giải Nhì Tin học cấp Tỉnh, muốn nộp hồ sơ xét học bổng 100% CMU.',
    createdAt: '2026-10-10T08:30:00Z',
    updatedAt: '2026-10-12T14:20:00Z'
  },
  {
    id: 'TS-2026-1002',
    fullName: 'Trần Bảo Ngọc',
    phone: '0918765432',
    idCardNumber: '048308005678',
    email: 'baongoc.tran08@gmail.com',
    highSchool: 'THPT Phan Châu Trinh',
    province: 'Đà Nẵng',
    graduationYear: 2026,
    programId: 'troy-ba',
    programName: 'Quản trị Kinh doanh Đại học TROY (Mỹ cấp bằng)',
    secondaryProgramId: 'psu-ba',
    secondaryProgramName: 'Quản trị Kinh doanh chuẩn PSU',
    examBlock: 'D01',
    estimatedScore: 25.0,
    source: 'facebook',
    utmCampaign: 'CAMP_TROY_SCHOLARSHIP',
    status: 'submitted_app',
    priority: 'high',
    assignedTo: 'usr-counselor-1',
    assignedToName: 'Trần Thị Mai Lan',
    paymentStatus: 'deposit_paid',
    feePaidAmount: 50000,
    paymentTransactionId: 'VNPAY_TS2026_048308',
    paymentDate: '2026-10-13T10:15:00Z',
    documents: {
      transcriptPhotos: [
        'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
      ],
      idCardFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      idCardBack: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      priorityCert: 'Chứng chỉ IELTS 6.5 Academic cấp ngày 15/08/2026',
      verificationStatus: 'pending',
      verifiedScoreMath: 8.5,
      verifiedScoreLiterature: 8.0,
      verifiedScoreEnglish: 8.5,
      verificationNotes: 'Điểm học bạ 3 kỳ: Toán 8.5, Văn 8.0, Anh 8.5. Hồ sơ hợp lệ chờ duyệt chính thức.'
    },
    notes: 'Đã có chứng chỉ IELTS 6.5, quan tâm học bổng Quỹ Troy 13 tỷ đồng.',
    createdAt: '2026-10-11T09:15:00Z',
    updatedAt: '2026-10-13T10:00:00Z'
  },
  {
    id: 'TS-2026-1003',
    fullName: 'Phạm Gia Huy',
    phone: '0934567890',
    idCardNumber: '046209009876',
    email: 'giahuy.pham@outlook.com',
    highSchool: 'THPT Chuyên Quốc Học Huế',
    province: 'Thừa Thiên Huế',
    graduationYear: 2026,
    programId: 'cmu-is',
    programName: 'An toàn Thông tin chuẩn CMU',
    secondaryProgramId: 'cmu-se',
    secondaryProgramName: 'Kỹ nghệ Phần mềm chuẩn CMU',
    examBlock: 'A01',
    estimatedScore: 24.2,
    source: 'tiktok',
    utmCampaign: 'TIKTOK_TOA_G_CAMP',
    status: 'new',
    priority: 'medium',
    assignedTo: 'usr-counselor-2',
    assignedToName: 'Lê Hoàng Anh Tuấn',
    paymentStatus: 'unpaid',
    notes: 'Thấy video review Tòa G và phòng Lab an ninh mạng trên TikTok.',
    createdAt: '2026-10-13T16:45:00Z',
    updatedAt: '2026-10-13T16:45:00Z'
  },
  {
    id: 'TS-2026-1004',
    fullName: 'Võ Thảo My',
    phone: '0903112233',
    idCardNumber: '049307003456',
    email: 'thaomy.vo@gmail.com',
    highSchool: 'THPT Chuyên Nguyễn Bỉnh Khiêm',
    province: 'Quảng Nam',
    graduationYear: 2026,
    programId: 'psu-fintech',
    programName: 'Công nghệ Tài chính (FinTech) chuẩn PSU',
    secondaryProgramId: 'psu-ba',
    secondaryProgramName: 'Quản trị Kinh doanh chuẩn PSU',
    examBlock: 'D01',
    estimatedScore: 27.0,
    source: 'event',
    utmCampaign: 'OPENDAY_OCTOBER',
    status: 'hot_lead',
    priority: 'high',
    assignedTo: 'usr-counselor-1',
    assignedToName: 'Trần Thị Mai Lan',
    paymentStatus: 'unpaid',
    notes: 'Gặp tại Ngày hội Tư vấn Tuyển sinh & Hướng nghiệp. Điểm học bạ xuất sắc 9.0 cả năm.',
    createdAt: '2026-10-09T11:00:00Z',
    updatedAt: '2026-10-11T15:30:00Z'
  },
  {
    id: 'TS-2026-1005',
    fullName: 'Đỗ Hoàng Nam',
    phone: '0945998877',
    idCardNumber: '040206007788',
    email: 'hoangnam.do@gmail.com',
    highSchool: 'THPT Huỳnh Thúc Kháng (Vinh)',
    province: 'Nghệ An',
    graduationYear: 2026,
    programId: 'csu-arch',
    programName: 'Kiến trúc Công trình chuẩn CSU',
    examBlock: 'V00',
    estimatedScore: 26.0,
    source: 'referral',
    status: 'tuition_paid',
    priority: 'high',
    assignedTo: 'usr-counselor-1',
    assignedToName: 'Trần Thị Mai Lan',
    paymentStatus: 'tuition_paid',
    feePaidAmount: 5000000,
    paymentTransactionId: 'VIETQR_VNUS_040206',
    paymentDate: '2026-10-14T09:00:00Z',
    documents: {
      transcriptPhotos: [
        'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80'
      ],
      idCardFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      idCardBack: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      verificationStatus: 'verified',
      verifiedScoreMath: 8.8,
      verifiedScoreLiterature: 8.2,
      verifiedScoreEnglish: 8.0,
      verificationNotes: 'Đã hậu kiểm đầy đủ. Đã nộp bản vẽ năng khiếu đạt 9.0 điểm.',
      verifiedAt: '2026-10-14T08:45:00Z',
      verifiedBy: 'usr-verifier-1',
      verifiedByName: 'ThS. Hoàng Thị Bích Ngọc'
    },
    notes: 'Anh trai là cựu sinh viên K26 CSU Kiến trúc giới thiệu. Đã nộp tạm ứng giữ chỗ chuyên ngành.',
    createdAt: '2026-10-05T14:10:00Z',
    updatedAt: '2026-10-14T09:00:00Z'
  },
  {
    id: 'TS-2026-1006',
    fullName: 'Hoàng Kim Chi',
    phone: '0977889900',
    idCardNumber: '048308006789',
    email: 'kimchi.hoang@gmail.com',
    highSchool: 'THPT Trần Phú',
    province: 'Đà Nẵng',
    graduationYear: 2026,
    programId: 'troy-ba',
    programName: 'Quản trị Kinh doanh Đại học TROY (Mỹ cấp bằng)',
    secondaryProgramId: 'psu-ba',
    secondaryProgramName: 'Quản trị Kinh doanh chuẩn PSU',
    examBlock: 'D01',
    estimatedScore: 23.5,
    source: 'website',
    status: 'unreachable',
    priority: 'medium',
    assignedTo: 'usr-counselor-1',
    assignedToName: 'Trần Thị Mai Lan',
    paymentStatus: 'unpaid',
    notes: 'Đăng ký tư vấn trực tuyến qua trang web. Đã gọi 2 cuộc nhưng máy bận, hẹn gọi lại chiều nay.',
    createdAt: '2026-10-14T11:20:00Z',
    updatedAt: '2026-10-14T11:20:00Z'
  },
  {
    id: 'TS-2026-1007',
    fullName: 'Ngô Thanh Sơn',
    phone: '0966554433',
    idCardNumber: '048208002345',
    email: 'thanhson.ngo@yahoo.com',
    highSchool: 'THPT Nguyễn Trãi',
    province: 'Đà Nẵng',
    graduationYear: 2026,
    programId: 'psu-ba',
    programName: 'Quản trị Kinh doanh chuẩn PSU',
    examBlock: 'A01',
    estimatedScore: 23.0,
    source: 'hotline',
    status: 'conditional_admit',
    priority: 'high',
    assignedTo: 'usr-counselor-1',
    assignedToName: 'Trần Thị Mai Lan',
    paymentStatus: 'deposit_paid',
    feePaidAmount: 50000,
    paymentTransactionId: 'MOMO_TS2026_048208',
    paymentDate: '2026-10-14T15:00:00Z',
    documents: {
      transcriptPhotos: [
        'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80'
      ],
      verificationStatus: 'verified',
      verifiedScoreMath: 8.0,
      verifiedScoreLiterature: 7.5,
      verifiedScoreEnglish: 8.0,
      verificationNotes: 'Đủ điều kiện trúng tuyển có điều kiện theo Phương thức 3 (Học bạ THPT).',
      verifiedAt: '2026-10-14T14:30:00Z',
      verifiedBy: 'usr-verifier-1',
      verifiedByName: 'ThS. Hoàng Thị Bích Ngọc'
    },
    notes: 'Phụ huynh gọi hotline hỏi về thủ tục nộp hồ sơ xét học bổng. Đã nhận Giấy báo trúng tuyển có điều kiện.',
    createdAt: '2026-10-12T10:00:00Z',
    updatedAt: '2026-10-14T15:00:00Z'
  }
];

export const INITIAL_CONSULTATION_LOGS: ConsultationHistory[] = [
  {
    id: 'log-1',
    leadId: 'TS-2026-1001',
    staffId: 'usr-counselor-2',
    staffName: 'Lê Hoàng Anh Tuấn',
    contactMethod: 'call',
    parentAttitude: 'very_interested',
    rating: 5,
    content: 'Tư vấn chi tiết chương trình CMU Software Engineering đạt chuẩn ABET, thông báo điều kiện hồ sơ học bổng 25 điểm trở lên.',
    outcome: 'Thí sinh rất hào hứng, xin gửi tài liệu PDF tuyển sinh qua Zalo để trao đổi với bố mẹ.',
    nextFollowUpDate: '2026-10-20',
    createdAt: '2026-10-12T14:20:00Z'
  },
  {
    id: 'log-2',
    leadId: 'TS-2026-1002',
    staffId: 'usr-counselor-1',
    staffName: 'Trần Thị Mai Lan',
    contactMethod: 'meeting',
    parentAttitude: 'very_interested',
    rating: 5,
    content: 'Đón tiếp phụ huynh và em Ngọc trực tiếp tại Tòa G - 120 Hoàng Minh Thảo. Giới thiệu lộ trình 4 năm nhận bằng Cử nhân Mỹ từ Đại học Troy.',
    outcome: 'Phụ huynh đã hoàn thành lệ phí xét tuyển 50.000 VNĐ qua VietQR và nộp hồ sơ bản cứng.',
    nextFollowUpDate: '2026-10-22',
    createdAt: '2026-10-13T10:00:00Z'
  },
  {
    id: 'log-3',
    leadId: 'TS-2026-1004',
    staffId: 'usr-counselor-1',
    staffName: 'Trần Thị Mai Lan',
    contactMethod: 'zalo',
    parentAttitude: 'considering',
    rating: 4,
    content: 'Tư vấn lộ trình đào tạo FinTech PSU, giải thích cơ hội việc làm liên kết với các ngân hàng MB, Vietinbank và các công ty công nghệ thanh toán.',
    outcome: 'Em My hẹn cuối tuần lên tham quan trường.',
    nextFollowUpDate: '2026-10-21',
    createdAt: '2026-10-11T15:30:00Z'
  },
  {
    id: 'log-4',
    leadId: 'TS-2026-1006',
    staffId: 'usr-counselor-1',
    staffName: 'Trần Thị Mai Lan',
    contactMethod: 'call',
    parentAttitude: 'neutral',
    rating: 3,
    content: 'Gọi điện lần 1 và lần 2 lúc 11h20 và 14h00, thí sinh đang trong giờ học trên lớp.',
    outcome: 'Hẹn gọi lại sau 17h00 hôm nay khi thí sinh tan học.',
    nextFollowUpDate: new Date().toISOString().split('T')[0], // Hôm nay!
    createdAt: '2026-10-14T11:20:00Z'
  }
];

export const INITIAL_IMPORT_BATCHES: ImportBatch[] = [
  {
    id: 'batch-20261012-01',
    userId: 'usr-manager-1',
    userName: 'TS. Đặng Thanh Bình',
    fileName: 'Thu_Thap_OpenDay_DaNang_Dot1.xlsx',
    totalRows: 120,
    successRows: 116,
    failedRows: 4,
    duplicateMode: 'merge_history',
    errorDetails: [
      { row: 14, phone: '098111', fullName: 'Lê Văn An', reason: 'Số điện thoại không đủ 10 chữ số (098111)' },
      { row: 45, phone: '0905223344', fullName: '', reason: 'Thiếu họ và tên thí sinh' },
      { row: 82, phone: '0913556677', fullName: 'Trần Văn Bình', reason: 'Mã ngành không khớp danh mục hệ thống' },
      { row: 105, phone: '0935889900', fullName: 'Ngô Thảo', reason: 'Số CCCD không đúng định dạng 12 số' }
    ],
    createdAt: '2026-10-12T09:30:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    userId: 'usr-admin-1',
    userName: 'ThS. Nguyễn Văn Hải',
    userRole: 'admin',
    action: 'CREATE',
    tableName: 'users',
    recordId: 'usr-verifier-1',
    newValues: { fullName: 'ThS. Hoàng Thị Bích Ngọc', role: 'verifier', status: 'active' },
    ipAddress: '192.168.1.10',
    timestamp: '2026-10-09T08:00:00Z'
  },
  {
    id: 'audit-002',
    userId: 'usr-manager-1',
    userName: 'TS. Đặng Thanh Bình',
    userRole: 'manager',
    action: 'IMPORT',
    tableName: 'candidates',
    recordId: 'batch-20261012-01',
    newValues: { fileName: 'Thu_Thap_OpenDay_DaNang_Dot1.xlsx', inserted: 116, duplicatesMerged: 12 },
    ipAddress: '192.168.1.15',
    timestamp: '2026-10-12T09:30:00Z'
  },
  {
    id: 'audit-003',
    userId: 'usr-verifier-1',
    userName: 'ThS. Hoàng Thị Bích Ngọc',
    userRole: 'verifier',
    action: 'VERIFY_DOCS',
    tableName: 'candidates',
    recordId: 'TS-2026-1005',
    oldValues: { verificationStatus: 'pending' },
    newValues: { verificationStatus: 'verified', verifiedScoreMath: 8.8, result: 'Trúng tuyển CSU' },
    ipAddress: '192.168.1.28',
    timestamp: '2026-10-14T08:45:00Z'
  },
  {
    id: 'audit-004',
    userId: 'usr-manager-1',
    userName: 'TS. Đặng Thanh Bình',
    userRole: 'manager',
    action: 'REASSIGN',
    tableName: 'candidates',
    recordId: 'TS-2026-1004',
    oldValues: { assignedTo: 'usr-counselor-2' },
    newValues: { assignedTo: 'usr-counselor-1', assignedToName: 'Trần Thị Mai Lan' },
    ipAddress: '192.168.1.15',
    timestamp: '2026-10-11T09:00:00Z'
  }
];

export const INITIAL_ZNS_SMS_LOGS: ZnsSmsLog[] = [
  {
    id: 'msg-001',
    candidateId: 'TS-2026-1002',
    candidateName: 'Trần Bảo Ngọc',
    phone: '0918765432',
    channel: 'zalo_zns',
    templateId: 'ZNS_CONFIRM_APP_SUBMITTED',
    templateName: 'Xác nhận nộp hồ sơ xét tuyển trực tuyến thành công',
    status: 'delivered',
    sentAt: '2026-10-13T10:16:00Z',
    payloadPreview: 'Chào bạn Trần Bảo Ngọc, Hội đồng Tuyển sinh VN-US Đại học Duy Tân xác nhận đã nhận hồ sơ TS-2026-1002 ngành Quản trị Kinh doanh Troy. Vui lòng theo dõi tiến độ xét tuyển tại tra-cuu.'
  },
  {
    id: 'msg-002',
    candidateId: 'TS-2026-1005',
    candidateName: 'Đỗ Hoàng Nam',
    phone: '0945998877',
    channel: 'sms_brandname',
    templateId: 'SMS_TUITION_CONFIRM',
    templateName: 'Thông báo xác nhận đã đóng học phí & hoàn tất nhập học',
    status: 'delivered',
    sentAt: '2026-10-14T09:02:00Z',
    payloadPreview: 'CHUC MUNG: Thi sinh Do Hoang Nam da hoan tat nop ho so va xac nhan nhap hoc nganh Kien truc CSU. Ma SV du kien se duoc gui qua Email. Hotline: 0236.3650403.'
  }
];

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'camp-1',
    title: 'Chiến dịch Tuyển sinh Quốc tế: Nắm Bắt Tương Lai Chuẩn Mỹ',
    channel: 'facebook',
    utmTag: 'CAMP_VNUS_DIGITAL',
    targetAudience: 'Học sinh lớp 12 & Phụ huynh tại Đà Nẵng, Quảng Nam, Thừa Thiên Huế, Quảng Ngãi',
    budget: 35000000,
    spent: 18500000,
    leadsGenerated: 142,
    enrolledCount: 28,
    costPerLead: 130280,
    status: 'active',
    startDate: '2026-09-15',
    endDate: '2026-11-30',
    notes: 'Quảng bá video giới thiệu Tòa G và 55 suất học bổng toàn phần CMU/PSU/CSU.'
  },
  {
    id: 'camp-2',
    title: 'Series Video TikTok: Một ngày làm sinh viên Troy & CMU',
    channel: 'tiktok',
    utmTag: 'TIKTOK_TOA_G_CAMP',
    targetAudience: 'Gen Z đam mê Công nghệ & Du lịch quốc tế',
    budget: 15000000,
    spent: 8200000,
    leadsGenerated: 89,
    enrolledCount: 15,
    costPerLead: 92134,
    status: 'active',
    startDate: '2026-10-01',
    endDate: '2026-11-15',
    notes: 'Viral clip thang máy trong suốt view đắt giá Tòa G đạt 450K view.'
  },
  {
    id: 'camp-3',
    title: 'Ngày hội Open Day & Trải Nghiệm Học Thử VN-US',
    channel: 'event',
    utmTag: 'OPENDAY_OCTOBER',
    targetAudience: 'Học sinh các trường THPT Chuyên Miền Trung',
    budget: 50000000,
    spent: 45000000,
    leadsGenerated: 215,
    enrolledCount: 62,
    costPerLead: 209302,
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
    contentSnippet: 'Với thiết kế kính tinh tế, view bầu trời xanh mát cùng hệ thống hơn 184 phòng học, Tòa G 120 Hoàng Minh Thảo đã sẵn sàng đón chào tân sinh viên...'
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
    publishUrl: 'https://troy.edu.vn/tin-tuc/hoc-bong-tuyen-sinh',
    contentSnippet: 'Chi tiết 3 điều kiện nhận học bổng Quỹ Troy toàn phần với điểm THPT từ 23-26đ hoặc IELTS 5.5...'
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
