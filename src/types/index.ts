export type Role = 'ADMIN' | 'STAFF' | 'admin' | 'manager' | 'counselor' | 'marketer' | 'verifier';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  fullName: string;
  role: Role;
  department?: string;
  phone?: string;
  password?: string;
  password_hash?: string;
  avatarUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'active' | 'locked';
  assignedRegion?: string;
  targetQuota?: number; // KPI chỉ tiêu tuyển sinh
  created_at?: string;
  updated_at?: string;
}

export interface SystemUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password?: string;
  passwordHash?: string;
  role: 'ADMIN' | 'STAFF';
  department?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  permCode: string;
  module: string;
  description: string;
}

export interface StudyProgram {
  id: string;
  code: string;
  name: string;
  faculty: string;
  partner: string;
  degree: string;
  accreditation: string;
  duration: string;
  tuitionPerYear?: string;
  targetQuota?: number; // Chỉ tiêu tuyển sinh
  description: string;
  careerProspects: string;
  admissionCriteria: string;
  isActive?: boolean;
}

// 10 Trạng thái chuẩn hóa theo quy trình số hóa đường ống tuyển sinh (Admissions Pipeline)
export type LeadStatus =
  | 'new'                   // 1. Mới tiếp nhận
  | 'unreachable'           // 2. Chưa liên hệ được
  | 'consulted_1'           // 3. Đã tư vấn lần 1
  | 'hot_lead'              // 4. Quan tâm cao (Nóng)
  | 'waiting_transcript'    // 5. Chờ học bạ
  | 'submitted_app'         // 6. Đã nộp hồ sơ xét tuyển
  | 'conditional_admit'     // 7. Trúng tuyển có điều kiện
  | 'confirmed_enroll'      // 8. Đã xác nhận nhập học
  | 'tuition_paid'          // 9. Đã đóng học phí
  | 'cancelled';            // 10. Từ chối / Hủy

export type LeadSource =
  | 'website'
  | 'facebook'
  | 'tiktok'
  | 'event'
  | 'high_school_tour'
  | 'referral'
  | 'hotline'
  | 'other';

export type LeadPriority = 'high' | 'medium' | 'low';

export interface CandidateDocuments {
  transcriptPhotos?: string[]; // Ảnh học bạ THPT
  idCardFront?: string;        // Ảnh CCCD mặt trước
  idCardBack?: string;         // Ảnh CCCD mặt sau
  priorityCert?: string;       // Chứng nhận ưu tiên / IELTS
  verificationStatus?: 'pending' | 'verified' | 'rejected' | 'need_supplement';
  verifiedScoreMath?: number;
  verifiedScoreLiterature?: number;
  verifiedScoreEnglish?: number;
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verifiedByName?: string;
}

export interface Lead {
  id: string;                      // Mã hồ sơ duy nhất (e.g., TS-2026-1001)
  fullName: string;
  phone: string;                   // Số điện thoại (10 chữ số)
  idCardNumber?: string;           // Số CCCD / Định danh (12 chữ số)
  email: string;
  highSchool?: string;
  province?: string;
  graduationYear?: number;
  
  // Nguyện vọng & Ngành xét tuyển
  programId: string;               // Nguyện vọng 1 (Primary)
  programName?: string;
  secondaryProgramId?: string;     // Nguyện vọng 2
  secondaryProgramName?: string;
  examBlock?: string;              // Khối thi (A00, A01, D01, D07, V00...)
  estimatedScore?: number;         // Điểm ước tính / điểm xét tuyển THPT
  
  source: LeadSource;
  utmCampaign?: string;            // Mã chiến dịch marketing
  status: LeadStatus;
  priority: LeadPriority;
  
  // Phân quyền & Điều phối
  assignedTo?: string;             // User ID chuyên viên phụ trách
  assignedToName?: string;
  departmentId?: string;
  
  // Tài chính & Hồ sơ minh chứng
  paymentStatus?: 'unpaid' | 'deposit_paid' | 'tuition_paid';
  feePaidAmount?: number;
  paymentTransactionId?: string;
  paymentDate?: string;
  documents?: CandidateDocuments;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactMethod = 'call' | 'zalo' | 'facebook' | 'meeting' | 'email';
export type ParentAttitude = 'very_interested' | 'considering' | 'hesitant_tuition' | 'neutral' | 'negative';

export interface ConsultationHistory {
  id: string;
  leadId: string;
  staffId: string;
  staffName: string;
  contactMethod: ContactMethod;
  content: string;
  parentAttitude?: ParentAttitude;
  rating?: number; // 1-5 sao đánh giá mức độ tiềm năng
  outcome: string;
  nextFollowUpDate?: string; // Ngày hẹn gọi lại
  createdAt: string;
}

export type DeduplicationMode = 'skip' | 'overwrite' | 'merge_history';

export interface ImportBatch {
  id: string;
  userId: string;
  userName: string;
  fileName: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  duplicateMode: DeduplicationMode;
  errorLogUrl?: string;
  errorDetails?: { row: number; phone?: string; fullName?: string; reason: string }[];
  createdAt: string;
}

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'IMPORT'
  | 'REASSIGN'
  | 'VERIFY_DOCS'
  | 'STATUS_CHANGE'
  | 'PAYMENT_UPDATE'
  | 'UNMASK_PHONE';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: AuditAction;
  tableName: string;
  recordId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  timestamp: string;
}

export interface ZnsSmsLog {
  id: string;
  candidateId: string;
  candidateName: string;
  phone: string;
  channel: 'zalo_zns' | 'sms_brandname' | 'email';
  templateId: string;
  templateName: string;
  status: 'sent' | 'delivered' | 'failed';
  sentAt: string;
  payloadPreview: string;
}

export type CampaignStatus = 'planning' | 'active' | 'completed' | 'paused';
export type CampaignChannel = 'facebook' | 'tiktok' | 'google' | 'event' | 'pr' | 'high_school';

export interface MarketingCampaign {
  id: string;
  title: string;
  channel: CampaignChannel;
  utmTag?: string;
  targetAudience: string;
  budget: number;
  spent: number;
  leadsGenerated: number;
  enrolledCount?: number;
  costPerLead?: number;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  notes?: string;
}

export type ContentStatus = 'idea' | 'draft' | 'pending_review' | 'approved' | 'published';
export type ContentPlatform = 'facebook' | 'tiktok' | 'website' | 'press';

export interface ContentItem {
  id: string;
  title: string;
  campaignId?: string;
  campaignTitle?: string;
  platform: ContentPlatform;
  programId?: string;
  programName?: string;
  status: ContentStatus;
  author: string;
  scheduledAt: string;
  publishUrl?: string;
  contentSnippet?: string;
}

export interface KPIStats {
  totalLeads: number;
  newLeadsToday: number;
  consultingLeads: number;
  registeredLeads: number;
  enrolledLeads: number;
  tuitionPaidLeads: number;
  conversionRate: number;
  activeCampaigns: number;
  pendingVerifications: number;
  todayRemindersCount: number;
}
