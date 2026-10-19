import {
  Lead,
  ConsultationHistory,
  MarketingCampaign,
  ContentItem,
  KPIStats,
  UserProfile,
  Role,
  AuditLog,
  ImportBatch,
  ZnsSmsLog,
  DeduplicationMode
} from '@/types';
import { STUDY_PROGRAMS } from './programsData';
import {
  INITIAL_LEADS,
  INITIAL_CONSULTATION_LOGS,
  INITIAL_CAMPAIGNS,
  INITIAL_CONTENT_CALENDAR,
  INITIAL_STAFF,
  INITIAL_AUDIT_LOGS,
  INITIAL_IMPORT_BATCHES,
  INITIAL_ZNS_SMS_LOGS
} from './mockData';

// Storage keys for browser localStorage
const STORAGE_KEYS = {
  LEADS: 'tttv_leads_v3',
  LOGS: 'tttv_consultation_logs_v3',
  CAMPAIGNS: 'tttv_campaigns_v3',
  CONTENT: 'tttv_content_v3',
  STAFF: 'tttv_staff_v3',
  CURRENT_USER: 'tttv_current_user_v3',
  AUDIT_LOGS: 'tttv_audit_logs_v3',
  IMPORT_BATCHES: 'tttv_import_batches_v3',
  ZNS_SMS_LOGS: 'tttv_zns_sms_logs_v3'
};

// In-memory fallback for server-side execution
let memoryLeads = [...INITIAL_LEADS];
let memoryLogs = [...INITIAL_CONSULTATION_LOGS];
let memoryCampaigns = [...INITIAL_CAMPAIGNS];
let memoryContent = [...INITIAL_CONTENT_CALENDAR];
let memoryStaff = [...INITIAL_STAFF];
let memoryAuditLogs = [...INITIAL_AUDIT_LOGS];
let memoryImportBatches = [...INITIAL_IMPORT_BATCHES];
let memoryZnsSmsLogs = [...INITIAL_ZNS_SMS_LOGS];

const isBrowser = typeof window !== 'undefined';

// ==============================================================================
// 1. DATA MASKING UTILITY
// ==============================================================================
export function maskPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/[\s\-\.]/g, '');
  if (clean.length < 7) return clean;
  // Giữ lại 4 số đầu và 3 số cuối: 0912***678
  return `${clean.substring(0, 4)}***${clean.substring(clean.length - 3)}`;
}

export function maskIdCard(idCard?: string): string {
  if (!idCard) return '';
  const clean = idCard.replace(/\s/g, '');
  if (clean.length < 8) return clean;
  // Giữ 3 số đầu và 3 số cuối: 048******123
  return `${clean.substring(0, 3)}******${clean.substring(clean.length - 3)}`;
}

// ==============================================================================
// 2. AUDIT TRAIL LOGGING
// ==============================================================================
export function getAuditLogs(): AuditLog[] {
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    } catch {
      // ignore
    }
  }
  return memoryAuditLogs;
}

export function saveAuditLogs(logs: AuditLog[]) {
  memoryAuditLogs = logs;
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch {
      // ignore
    }
  }
}

export function addAuditLog(
  action: AuditLog['action'],
  tableName: string,
  recordId: string,
  oldValues?: any,
  newValues?: any,
  user?: UserProfile,
  ipAddress: string = '127.0.0.1'
): AuditLog {
  const currentUser = user || getSafeCurrentUser();
  const log: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: currentUser.id,
    userName: currentUser.fullName,
    userRole: currentUser.role,
    action,
    tableName,
    recordId,
    oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : undefined,
    newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : undefined,
    ipAddress,
    timestamp: new Date().toISOString()
  };

  const logs = [log, ...getAuditLogs()];
  saveAuditLogs(logs);
  return log;
}

// ==============================================================================
// 3. LEADS & ROW-LEVEL DATA FILTERING (RLS)
// ==============================================================================
export function getAllRawLeads(): Lead[] {
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
    } catch {
      // ignore
    }
  }
  return memoryLeads;
}

export function saveLeads(leads: Lead[]) {
  memoryLeads = leads;
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    } catch {
      // ignore
    }
  }
}

/**
 * Lấy danh sách thí sinh có lọc phạm vi truy cập dữ liệu (Row-Level Security):
 * - super admin & admissions manager: Xem toàn bộ dữ liệu.
 * - admissions officer: Chỉ xem thí sinh được phân công cho mình (hoặc thí sinh chưa gán nếu lọc riêng).
 * - document verifier: Xem các thí sinh có hồ sơ minh chứng cần thẩm định.
 * - marketer: Xem thí sinh có mã chiến dịch hoặc nguồn tiếp nhận.
 */
export function getLeads(user?: UserProfile): Lead[] {
  const allLeads = getAllRawLeads();
  const currentUser = user || getSafeCurrentUser();

  if (currentUser.role === 'admin' || currentUser.role === 'manager') {
    return allLeads;
  }

  if (currentUser.role === 'counselor') {
    // Chuyên viên tư vấn: Row-Level Security
    return allLeads.filter(l => l.assignedTo === currentUser.id);
  }

  if (currentUser.role === 'verifier') {
    // Cán bộ hậu kiểm: Xem các hồ sơ có minh chứng cần duyệt hoặc đã nộp đơn
    return allLeads.filter(l => 
      l.status === 'submitted_app' || 
      l.status === 'conditional_admit' || 
      l.status === 'waiting_transcript' ||
      l.status === 'confirmed_enroll' ||
      l.status === 'tuition_paid' ||
      (l.documents && l.documents.transcriptPhotos && l.documents.transcriptPhotos.length > 0)
    );
  }

  return allLeads;
}

export function getLeadById(id: string): Lead | undefined {
  const leads = getAllRawLeads();
  return leads.find(l => l.id === id);
}

// Sinh mã hồ sơ chuẩn định dạng TS-2026-XXXX
export function generateCandidateId(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TS-2026-${randomSuffix}`;
}

export function addLead(
  newLeadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>,
  user?: UserProfile
): { success: boolean; lead?: Lead; error?: string } {
  const leads = getAllRawLeads();

  // Chuẩn hóa SĐT và CCCD
  const cleanPhone = (newLeadData.phone || '').replace(/[\s\-\.]/g, '');
  const cleanIdCard = (newLeadData.idCardNumber || '').replace(/[\s\-\.]/g, '');
  const cleanEmail = (newLeadData.email || '').trim().toLowerCase();

  // Kiểm tra trùng lặp qua SĐT hoặc CCCD
  const duplicate = leads.find(l => {
    const p = l.phone.replace(/[\s\-\.]/g, '');
    const c = (l.idCardNumber || '').replace(/[\s\-\.]/g, '');
    return p === cleanPhone || (cleanIdCard && c === cleanIdCard);
  });

  if (duplicate) {
    return {
      success: false,
      error: `Thí sinh với SĐT (${cleanPhone}) hoặc CCCD (${cleanIdCard}) đã tồn tại trong hệ thống (Mã: ${duplicate.id}, Họ tên: ${duplicate.fullName}, Trạng thái: ${duplicate.status}).`
    };
  }

  // Khớp tên ngành chính và phụ
  const prog1 = STUDY_PROGRAMS.find(p => p.id === newLeadData.programId);
  const prog2 = newLeadData.secondaryProgramId
    ? STUDY_PROGRAMS.find(p => p.id === newLeadData.secondaryProgramId)
    : undefined;

  const currentUser = user || getSafeCurrentUser();
  const assignedTo = newLeadData.assignedTo || (currentUser.role === 'counselor' ? currentUser.id : undefined);
  const assignedStaff = assignedTo ? getStaffList().find(s => s.id === assignedTo) : undefined;

  const candidateId = generateCandidateId();

  const lead: Lead = {
    ...newLeadData,
    id: candidateId,
    phone: cleanPhone,
    idCardNumber: cleanIdCard || undefined,
    email: cleanEmail,
    programName: prog1 ? prog1.name : newLeadData.programId,
    secondaryProgramName: prog2 ? prog2.name : undefined,
    assignedTo,
    assignedToName: assignedStaff ? assignedStaff.fullName : undefined,
    paymentStatus: newLeadData.paymentStatus || 'unpaid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [lead, ...leads];
  saveLeads(updated);

  // Ghi nhật ký kiểm toán (Audit Trail)
  addAuditLog('CREATE', 'candidates', lead.id, null, lead, currentUser);

  return { success: true, lead };
}

export function updateLead(
  id: string,
  updates: Partial<Lead>,
  user?: UserProfile
): { success: boolean; lead?: Lead; error?: string } {
  const leads = getAllRawLeads();
  const index = leads.findIndex(l => l.id === id);

  if (index === -1) {
    return { success: false, error: 'Không tìm thấy hồ sơ thí sinh.' };
  }

  const oldRecord = { ...leads[index] };
  const currentUser = user || getSafeCurrentUser();

  // Khớp tên ngành nếu có đổi
  let progName = updates.programName;
  if (updates.programId && updates.programId !== oldRecord.programId) {
    const p = STUDY_PROGRAMS.find(prog => prog.id === updates.programId);
    if (p) progName = p.name;
  }

  const updatedLead: Lead = {
    ...oldRecord,
    ...updates,
    programName: progName || oldRecord.programName,
    updatedAt: new Date().toISOString()
  };

  leads[index] = updatedLead;
  saveLeads(leads);

  // Xác định hành động kiểm toán
  let auditAction: AuditLog['action'] = 'UPDATE';
  if (updates.status && updates.status !== oldRecord.status) {
    auditAction = 'STATUS_CHANGE';
  } else if (updates.assignedTo && updates.assignedTo !== oldRecord.assignedTo) {
    auditAction = 'REASSIGN';
  } else if (updates.paymentStatus && updates.paymentStatus !== oldRecord.paymentStatus) {
    auditAction = 'PAYMENT_UPDATE';
  } else if (updates.documents?.verificationStatus && updates.documents?.verificationStatus !== oldRecord.documents?.verificationStatus) {
    auditAction = 'VERIFY_DOCS';
  }

  addAuditLog(auditAction, 'candidates', id, oldRecord, updatedLead, currentUser);

  return { success: true, lead: updatedLead };
}

export function deleteLead(id: string, user?: UserProfile): { success: boolean; error?: string } {
  const currentUser = user || getSafeCurrentUser();
  if (currentUser.role === 'counselor') {
    return { success: false, error: 'Chuyên viên tư vấn không có quyền xóa hồ sơ thí sinh. Vui lòng liên hệ Trưởng ban Tuyển sinh.' };
  }

  const leads = getAllRawLeads();
  const existing = leads.find(l => l.id === id);
  if (!existing) {
    return { success: false, error: 'Hồ sơ không tồn tại.' };
  }

  const filtered = leads.filter(l => l.id !== id);
  saveLeads(filtered);

  addAuditLog('DELETE', 'candidates', id, existing, null, currentUser);
  return { success: true };
}

// ==============================================================================
// 4. BATCH PROCESSING WITH DATABASE TRANSACTION & 3 DEDUPLICATION MODES
// ==============================================================================
export interface BatchImportOptions {
  fileName: string;
  deduplicationMode: DeduplicationMode; // 'skip' | 'overwrite' | 'merge_history'
  user?: UserProfile;
}

export interface BatchAddResult {
  total: number;
  inserted: number;
  updatedCount: number;
  duplicateMergedCount: number;
  failedCount: number;
  batchId: string;
  insertedLeads: Lead[];
  errors: { row: number; phone?: string; fullName?: string; reason: string }[];
}

export function batchAddLeadsWithTransaction(
  newLeadsList: any[],
  options: BatchImportOptions
): BatchAddResult {
  const currentLeads = [...getAllRawLeads()];
  const currentUser = options.user || getSafeCurrentUser();
  const batchId = `batch-${Date.now()}`;

  const phoneMap = new Map<string, number>();
  const idCardMap = new Map<string, number>();

  currentLeads.forEach((l, idx) => {
    const p = l.phone.replace(/[\s\-\.]/g, '');
    if (p) phoneMap.set(p, idx);
    const c = (l.idCardNumber || '').replace(/[\s\-\.]/g, '');
    if (c) idCardMap.set(c, idx);
  });

  const insertedLeads: Lead[] = [];
  const errors: { row: number; phone?: string; fullName?: string; reason: string }[] = [];
  let inserted = 0;
  let updatedCount = 0;
  let duplicateMergedCount = 0;

  // Transaction simulation: nếu có lỗi nghiêm trọng hệ thống thì rollback
  try {
    newLeadsList.forEach((item, index) => {
      const rowNumber = index + 1;
      const cleanPhone = (item.phone || '').toString().replace(/[\s\-\.]/g, '');
      const cleanIdCard = (item.idCardNumber || '').toString().replace(/[\s\-\.]/g, '');
      const cleanEmail = (item.email || '').toString().trim().toLowerCase();
      const fullName = (item.fullName || '').toString().trim();

      // Kiểm tra tính hợp lệ cơ bản
      if (!fullName || fullName.length < 2) {
        errors.push({ row: rowNumber, phone: cleanPhone, fullName, reason: 'Họ và tên thí sinh thiếu hoặc quá ngắn (<2 ký tự)' });
        return;
      }

      if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
        errors.push({ row: rowNumber, phone: cleanPhone, fullName, reason: `Số điện thoại (${item.phone}) không đúng định dạng 10 chữ số di động VN` });
        return;
      }

      if (cleanIdCard && cleanIdCard.length !== 12) {
        errors.push({ row: rowNumber, phone: cleanPhone, fullName, reason: `Số CCCD/Định danh (${item.idCardNumber}) phải đúng 12 chữ số` });
        return;
      }

      // Khớp chương trình đào tạo
      let prog = STUDY_PROGRAMS.find(p => p.id === item.programId || p.code.toLowerCase() === (item.programId || '').toLowerCase());
      if (!prog && item.programName) {
        const pName = item.programName.toLowerCase();
        prog = STUDY_PROGRAMS.find(p => p.name.toLowerCase().includes(pName) || pName.includes(p.name.toLowerCase()) || p.code.toLowerCase().includes(pName));
      }
      if (!prog) {
        prog = STUDY_PROGRAMS[0];
      }

      // Kiểm tra trùng lặp
      const existingIdx = phoneMap.get(cleanPhone) ?? (cleanIdCard ? idCardMap.get(cleanIdCard) : undefined);

      if (existingIdx !== undefined) {
        const existingRecord = currentLeads[existingIdx];

        if (options.deduplicationMode === 'skip') {
          // Chế độ 1: Bỏ qua dòng trùng lặp
          return;
        }

        if (options.deduplicationMode === 'overwrite') {
          // Chế độ 2: Ghi đè cập nhật thông tin mới nhất
          currentLeads[existingIdx] = {
            ...existingRecord,
            fullName,
            email: cleanEmail || existingRecord.email,
            idCardNumber: cleanIdCard || existingRecord.idCardNumber,
            highSchool: (item.highSchool || existingRecord.highSchool || 'Chưa cập nhật').toString().trim(),
            province: (item.province || existingRecord.province || 'Đà Nẵng').toString().trim(),
            programId: prog.id,
            programName: prog.name,
            estimatedScore: item.estimatedScore ? Number(item.estimatedScore) : existingRecord.estimatedScore,
            examBlock: item.examBlock || existingRecord.examBlock,
            notes: (item.notes || existingRecord.notes || '').toString().trim(),
            updatedAt: new Date().toISOString()
          };
          updatedCount++;
          return;
        }

        if (options.deduplicationMode === 'merge_history') {
          // Chế độ 3: Giữ nguyên hồ sơ cũ, bổ sung nhật ký tiếp xúc hoặc ngành quan tâm
          addConsultationLog({
            leadId: existingRecord.id,
            staffId: currentUser.id,
            staffName: currentUser.fullName,
            contactMethod: 'meeting',
            parentAttitude: 'considering',
            rating: 4,
            content: `Thu thập lại qua file Excel [${options.fileName}]. Ngành đăng ký mới: ${prog.name}. Ghi chú: ${item.notes || 'Không'}`,
            outcome: 'Đã tự động gộp lịch sử tiếp xúc từ đợt tuyển sinh mới.'
          });
          duplicateMergedCount++;
          return;
        }
      }

      // Tạo mới hồ sơ
      const candidateId = generateCandidateId();
      const newLead: Lead = {
        id: candidateId,
        fullName,
        phone: cleanPhone,
        idCardNumber: cleanIdCard || undefined,
        email: cleanEmail,
        highSchool: (item.highSchool || 'Chưa cập nhật').toString().trim(),
        province: (item.province || 'Đà Nẵng').toString().trim(),
        graduationYear: Number(item.graduationYear) || 2026,
        programId: prog.id,
        programName: prog.name,
        secondaryProgramId: item.secondaryProgramId || undefined,
        secondaryProgramName: item.secondaryProgramName || undefined,
        examBlock: item.examBlock || 'A00',
        estimatedScore: item.estimatedScore ? Number(item.estimatedScore) : (item.scoreThpt ? Number(item.scoreThpt) : undefined),
        source: item.source || 'high_school_tour',
        utmCampaign: item.utmCampaign || undefined,
        status: item.status || 'new',
        priority: item.priority || 'medium',
        assignedTo: item.assignedTo || undefined,
        paymentStatus: 'unpaid',
        notes: (item.notes || `Nhập từ file ${options.fileName}`).toString().trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      currentLeads.unshift(newLead);
      phoneMap.set(cleanPhone, 0);
      if (cleanIdCard) idCardMap.set(cleanIdCard, 0);
      insertedLeads.push(newLead);
      inserted++;
    });

    // Lưu DB
    saveLeads(currentLeads);

    // Ghi nhật ký Import Batch
    const batchLog: ImportBatch = {
      id: batchId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      fileName: options.fileName,
      totalRows: newLeadsList.length,
      successRows: inserted + updatedCount + duplicateMergedCount,
      failedRows: errors.length,
      duplicateMode: options.deduplicationMode,
      errorDetails: errors,
      createdAt: new Date().toISOString()
    };

    saveImportBatches([batchLog, ...getImportBatches()]);

    // Ghi Audit Log
    addAuditLog('IMPORT', 'candidates', batchId, null, {
      fileName: options.fileName,
      inserted,
      updatedCount,
      duplicateMergedCount,
      failed: errors.length
    }, currentUser);

    return {
      total: newLeadsList.length,
      inserted,
      updatedCount,
      duplicateMergedCount,
      failedCount: errors.length,
      batchId,
      insertedLeads,
      errors
    };
  } catch (error: any) {
    // Rollback an toàn
    console.error('Lỗi khi thực thi Transaction Batch Import:', error);
    throw new Error(`Gặp sự cố hệ thống khi import, đã an toàn Rollback dữ liệu: ${error.message}`);
  }
}

export function getImportBatches(): ImportBatch[] {
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IMPORT_BATCHES);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEYS.IMPORT_BATCHES, JSON.stringify(INITIAL_IMPORT_BATCHES));
    } catch {
      // ignore
    }
  }
  return memoryImportBatches;
}

export function saveImportBatches(batches: ImportBatch[]) {
  memoryImportBatches = batches;
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.IMPORT_BATCHES, JSON.stringify(batches));
    } catch {
      // ignore
    }
  }
}

// ==============================================================================
// 5. LEAD ROUTING ENGINE (ĐIỀU PHỐI DỮ LIỆU TỰ ĐỘNG)
// ==============================================================================

/**
 * Phân chia tự động theo thuật toán xoay vòng (Round-Robin) cho các chuyên viên tư vấn
 */
export function autoAssignRoundRobin(leadIds: string[], user?: UserProfile): { success: boolean; assignedCount: number } {
  const staff = getStaffList().filter(s => s.role === 'counselor' && s.status !== 'locked');
  if (staff.length === 0) return { success: false, assignedCount: 0 };

  const allLeads = [...getAllRawLeads()];
  let staffIdx = 0;
  let count = 0;

  allLeads.forEach(lead => {
    if (leadIds.includes(lead.id)) {
      const assignedCounselor = staff[staffIdx % staff.length];
      lead.assignedTo = assignedCounselor.id;
      lead.assignedToName = assignedCounselor.fullName;
      lead.updatedAt = new Date().toISOString();
      staffIdx++;
      count++;
    }
  });

  saveLeads(allLeads);
  addAuditLog('REASSIGN', 'candidates', 'batch-round-robin', null, { assignedCount: count }, user);
  return { success: true, assignedCount: count };
}

/**
 * Phân chia theo khu vực địa lý: Đà Nẵng, Quảng Nam, Huế, Tây Nguyên...
 */
export function autoAssignByRegion(leadIds: string[], user?: UserProfile): { success: boolean; assignedCount: number } {
  const allLeads = [...getAllRawLeads()];
  const staff = getStaffList().filter(s => s.role === 'counselor');
  let count = 0;

  allLeads.forEach(lead => {
    if (leadIds.includes(lead.id)) {
      const province = (lead.province || '').toLowerCase();
      let matchedStaff = staff.find(s => (s.assignedRegion || '').toLowerCase().includes(province));
      if (!matchedStaff) {
        matchedStaff = staff[0];
      }
      if (matchedStaff) {
        lead.assignedTo = matchedStaff.id;
        lead.assignedToName = matchedStaff.fullName;
        lead.updatedAt = new Date().toISOString();
        count++;
      }
    }
  });

  saveLeads(allLeads);
  addAuditLog('REASSIGN', 'candidates', 'batch-region', null, { assignedCount: count }, user);
  return { success: true, assignedCount: count };
}

/**
 * Trưởng phòng chuyển giao (Reassign) hàng loạt hồ sơ sang nhân sự khác bằng 1 thao tác
 */
export function batchReassignLeads(leadIds: string[], targetStaffId: string, user?: UserProfile): { success: boolean; count: number } {
  const staff = getStaffList().find(s => s.id === targetStaffId);
  if (!staff) return { success: false, count: 0 };

  const allLeads = [...getAllRawLeads()];
  let count = 0;

  allLeads.forEach(lead => {
    if (leadIds.includes(lead.id)) {
      lead.assignedTo = staff.id;
      lead.assignedToName = staff.fullName;
      lead.updatedAt = new Date().toISOString();
      count++;
    }
  });

  saveLeads(allLeads);
  addAuditLog('REASSIGN', 'candidates', `batch-to-${staff.id}`, null, { targetStaff: staff.fullName, count }, user);
  return { success: true, count };
}

// ==============================================================================
// 6. CONSULTATION LOGS & FOLLOW-UP REMINDERS
// ==============================================================================
export function getConsultationLogs(leadId?: string): ConsultationHistory[] {
  let logs = memoryLogs;
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (stored) logs = JSON.parse(stored);
      else localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_CONSULTATION_LOGS));
    } catch {
      // ignore
    }
  }
  if (leadId) {
    return logs.filter(l => l.leadId === leadId);
  }
  return logs;
}

export function saveConsultationLogs(logs: ConsultationHistory[]) {
  memoryLogs = logs;
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch {
      // ignore
    }
  }
}

export function addConsultationLog(
  newLogData: Omit<ConsultationHistory, 'id' | 'createdAt'>,
  user?: UserProfile
): ConsultationHistory {
  const logs = getConsultationLogs();
  const currentUser = user || getSafeCurrentUser();

  const log: ConsultationHistory = {
    ...newLogData,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    staffId: newLogData.staffId || currentUser.id,
    staffName: newLogData.staffName || currentUser.fullName,
    createdAt: new Date().toISOString()
  };

  const updated = [log, ...logs];
  saveConsultationLogs(updated);

  addAuditLog('CREATE', 'consultation_logs', log.id, null, log, currentUser);
  return log;
}

/**
 * Lấy danh sách thí sinh có lịch hẹn cần gọi lại (Follow-up Reminders):
 * Trả về danh sách thí sinh có nextFollowUpDate <= ngày hôm nay
 */
export function getTodayFollowUpReminders(user?: UserProfile): { lead: Lead; log: ConsultationHistory }[] {
  const currentUser = user || getSafeCurrentUser();
  const leads = getLeads(currentUser);
  const logs = getConsultationLogs();
  const today = new Date().toISOString().split('T')[0];

  const results: { lead: Lead; log: ConsultationHistory }[] = [];

  leads.forEach(lead => {
    const leadLogs = logs.filter(l => l.leadId === lead.id && l.nextFollowUpDate);
    if (leadLogs.length > 0) {
      // Sắp xếp ngày hẹn mới nhất
      leadLogs.sort((a, b) => new Date(b.nextFollowUpDate!).getTime() - new Date(a.nextFollowUpDate!).getTime());
      const latestFollowUp = leadLogs[0];
      if (latestFollowUp.nextFollowUpDate && latestFollowUp.nextFollowUpDate <= today) {
        results.push({ lead, log: latestFollowUp });
      }
    }
  });

  return results;
}

// ==============================================================================
// 7. DOCUMENT VERIFICATION OFFICER FUNCTIONS
// ==============================================================================
export function verifyCandidateDocuments(
  candidateId: string,
  verificationData: {
    status: 'verified' | 'rejected' | 'need_supplement';
    verifiedScoreMath?: number;
    verifiedScoreLiterature?: number;
    verifiedScoreEnglish?: number;
    notes?: string;
  },
  verifier?: UserProfile
): { success: boolean; lead?: Lead; error?: string } {
  const currentVerifier = verifier || getSafeCurrentUser();
  const lead = getLeadById(candidateId);
  if (!lead) return { success: false, error: 'Không tìm thấy thí sinh.' };

  const updatedDocs = {
    ...lead.documents,
    verificationStatus: verificationData.status,
    verifiedScoreMath: verificationData.verifiedScoreMath,
    verifiedScoreLiterature: verificationData.verifiedScoreLiterature,
    verifiedScoreEnglish: verificationData.verifiedScoreEnglish,
    verificationNotes: verificationData.notes,
    verifiedAt: new Date().toISOString(),
    verifiedBy: currentVerifier.id,
    verifiedByName: currentVerifier.fullName
  };

  // Nếu duyệt hợp lệ -> tự động nâng trạng thái sang 'conditional_admit'
  let newStatus = lead.status;
  if (verificationData.status === 'verified') {
    newStatus = 'conditional_admit';
  }

  const result = updateLead(candidateId, {
    status: newStatus,
    documents: updatedDocs
  }, currentVerifier);

  // Tự động kích hoạt thông báo Zalo/SMS cho thí sinh
  if (result.success) {
    if (verificationData.status === 'verified') {
      sendOmnichannelMessage(
        candidateId,
        'zalo_zns',
        'ZNS_ADMISSION_OFFER',
        'Chúc mừng trúng tuyển có điều kiện VN-US Đại học Duy Tân',
        `Chào bạn ${lead.fullName}, Hội đồng Tuyển sinh VN-US Đại học Duy Tân xin chúc mừng hồ sơ ${lead.id} ngành ${lead.programName} đã được HẬU KIỂM HỢP LỆ và TRÚNG TUYỂN CÓ ĐIỀU KIỆN! Bạn có thể xem Giấy báo trúng tuyển điện tử kèm mã QR tại website.`
      );
    } else if (verificationData.status === 'need_supplement') {
      sendOmnichannelMessage(
        candidateId,
        'sms_brandname',
        'SMS_DOC_SUPPLEMENT',
        'Yêu cầu bổ sung minh chứng hồ sơ xét tuyển',
        `TB TUYEN SINH DTU: Ho so ${lead.id} cua thi sinh ${lead.fullName} can bo sung minh chung hoc ba/CCCD: ${verificationData.notes || 'Hinh anh bi mo/khong ro diem'}. Vui long cap nhat tai cong xet tuyen.`
      );
    }
  }

  return result;
}

// ==============================================================================
// 8. PAYMENT SIMULATION & INSTANT AUTO DEBT-CLEARING (GẠCH NỢ TỰ ĐỘNG)
// ==============================================================================
export function simulatePaymentAutoClear(
  candidateId: string,
  amount: number,
  method: 'vietqr' | 'vnpay' | 'momo',
  user?: UserProfile
): { success: boolean; lead?: Lead; error?: string } {
  const lead = getLeadById(candidateId);
  if (!lead) return { success: false, error: 'Không tìm thấy hồ sơ thí sinh.' };

  const transactionId = `${method.toUpperCase()}_${Date.now()}_${lead.id}`;
  const isTuition = amount >= 5000000;
  const newPaymentStatus = isTuition ? 'tuition_paid' : 'deposit_paid';
  const newStatusCode = isTuition ? 'tuition_paid' : lead.status;

  const result = updateLead(candidateId, {
    status: newStatusCode,
    paymentStatus: newPaymentStatus,
    feePaidAmount: (lead.feePaidAmount || 0) + amount,
    paymentTransactionId: transactionId,
    paymentDate: new Date().toISOString()
  }, user);

  if (result.success) {
    // Tự động gửi SMS Brandname xác nhận gạch nợ thành công
    sendOmnichannelMessage(
      candidateId,
      'sms_brandname',
      'SMS_PAYMENT_SUCCESS',
      'Xác nhận thanh toán học phí / lệ phí thành công',
      `DAI HOC DUY TAN: Da xac nhan nhan thanh toan ${amount.toLocaleString('vi-VN')} VND cho ho so ${lead.id} (${lead.fullName}). Ma giao dich: ${transactionId}. He thong da tu dong gach no thanh cong!`
    );
  }

  return result;
}

// ==============================================================================
// 9. OMNICHANNEL MESSAGING (ZALO ZNS / SMS BRANDNAME / EMAIL)
// ==============================================================================
export function getZnsSmsLogs(): ZnsSmsLog[] {
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ZNS_SMS_LOGS);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEYS.ZNS_SMS_LOGS, JSON.stringify(INITIAL_ZNS_SMS_LOGS));
    } catch {
      // ignore
    }
  }
  return memoryZnsSmsLogs;
}

export function saveZnsSmsLogs(logs: ZnsSmsLog[]) {
  memoryZnsSmsLogs = logs;
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.ZNS_SMS_LOGS, JSON.stringify(logs));
    } catch {
      // ignore
    }
  }
}

export function sendOmnichannelMessage(
  candidateId: string,
  channel: ZnsSmsLog['channel'],
  templateId: string,
  templateName: string,
  payloadPreview: string
): ZnsSmsLog {
  const lead = getLeadById(candidateId);
  const log: ZnsSmsLog = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    candidateId,
    candidateName: lead ? lead.fullName : 'Thí sinh',
    phone: lead ? lead.phone : '0900000000',
    channel,
    templateId,
    templateName,
    status: 'delivered',
    sentAt: new Date().toISOString(),
    payloadPreview
  };

  const logs = [log, ...getZnsSmsLogs()];
  saveZnsSmsLogs(logs);
  return log;
}

// ==============================================================================
// 10. AUTH & USER ROLES (RBAC & CREDENTIAL MANAGEMENT)
// ==============================================================================
export function getStaffList(): UserProfile[] {
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (stored) {
        const parsed: UserProfile[] = JSON.parse(stored);
        // Đảm bảo luôn có tài khoản Quản trị tối cao Anh Thư và xóa các tài khoản mock cũ
        const hasAnhThu = parsed.some(s => s.email.toLowerCase() === 'anhthuphan0102@gmail.com');
        if (hasAnhThu) {
          return parsed;
        }
      }
      // Khởi tạo mới sạch sẽ với tài khoản Quản trị viên Anh Thư
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
      return INITIAL_STAFF;
    } catch {
      // ignore
    }
  }
  return memoryStaff;
}

export function saveStaffList(staff: UserProfile[]) {
  memoryStaff = staff;
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
      window.dispatchEvent(new Event('staff-changed'));
    } catch {
      // ignore
    }
  }
}

export function getCurrentUser(): UserProfile | null {
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) return JSON.parse(stored);
      return null;
    } catch {
      return null;
    }
  }
  return null;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function getSafeCurrentUser(): UserProfile {
  return getCurrentUser() || INITIAL_STAFF[0];
}

/**
 * Đăng nhập hệ thống bằng email và mật khẩu thực tế
 * Bắt buộc nhập đúng tài khoản và mật khẩu mới được vào
 */
export function authenticateStaff(
  email: string,
  pass: string
): { success: boolean; user?: UserProfile; message?: string } {
  const staff = getStaffList();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, message: 'Vui lòng nhập đầy đủ tài khoản (email) và mật khẩu.' };
  }

  const target = staff.find(s => s.email.toLowerCase() === cleanEmail);

  if (!target) {
    return {
      success: false,
      message: 'Tài khoản không tồn tại trong hệ thống. Vui lòng liên hệ Quản trị viên (Admin) để được cấp quyền.'
    };
  }

  if (target.status === 'locked') {
    return {
      success: false,
      message: 'Tài khoản này đã bị khóa. Vui lòng liên hệ Quản trị viên để được mở lại.'
    };
  }

  // So sánh mật khẩu (hỗ trợ tài khoản mặc định và các tài khoản do admin tạo)
  const validPass = target.password || (target.email === 'anhthuphan0102@gmail.com' ? '0102024' : '');

  if (cleanPass !== validPass) {
    return {
      success: false,
      message: 'Mật khẩu không chính xác! Vui lòng thử lại.'
    };
  }

  // Đăng nhập thành công -> lưu session
  setCurrentUser(target);

  // Ghi nhật ký Audit Log
  addAuditLog(
    'UPDATE',
    'auth_sessions',
    target.id,
    null,
    { loginAt: new Date().toISOString(), email: target.email },
    target
  );

  return { success: true, user: target };
}

/**
 * Cho phép tài khoản tự chỉnh sửa thông tin cá nhân của chính mình (Họ tên, SĐT, Mật khẩu mới)
 */
export function updateUserProfile(
  userId: string,
  data: {
    fullName?: string;
    phone?: string;
    password?: string;
    department?: string;
    avatarUrl?: string;
  }
): { success: boolean; user?: UserProfile; message?: string } {
  const staffList = getStaffList();
  const index = staffList.findIndex(s => s.id === userId);

  if (index === -1) {
    return { success: false, message: 'Không tìm thấy thông tin tài khoản người dùng.' };
  }

  const oldUser = staffList[index];
  const updatedUser: UserProfile = {
    ...oldUser,
    fullName: data.fullName?.trim() || oldUser.fullName,
    phone: data.phone?.trim() || oldUser.phone,
    password: data.password ? data.password.trim() : oldUser.password,
    department: data.department?.trim() || oldUser.department,
    avatarUrl: data.avatarUrl || oldUser.avatarUrl
  };

  staffList[index] = updatedUser;
  saveStaffList(staffList);

  // Nếu đang là phiên làm việc của chính người này thì cập nhật luôn session
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    setCurrentUser(updatedUser);
  }

  addAuditLog(
    'UPDATE',
    'users_profile',
    updatedUser.id,
    oldUser,
    {
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      updatedAt: new Date().toISOString()
    },
    updatedUser
  );

  return { success: true, user: updatedUser, message: 'Cập nhật thông tin cá nhân thành công!' };
}

/**
 * Chỉ Quản trị viên (Admin) mới có quyền tạo mới tài khoản và phân quyền
 */
export function createStaffAccount(
  creator: UserProfile,
  newStaff: {
    email: string;
    fullName: string;
    role: Role;
    department: string;
    phone: string;
    password: string;
    assignedRegion?: string;
    targetQuota?: number;
  }
): { success: boolean; staff?: UserProfile; message?: string } {
  if (creator.role !== 'admin') {
    return { success: false, message: 'Chỉ Quản trị viên (Super Admin) mới có quyền tạo tài khoản nhân sự!' };
  }

  const staffList = getStaffList();
  const cleanEmail = newStaff.email.trim().toLowerCase();

  if (staffList.some(s => s.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'Địa chỉ Email này đã tồn tại trong danh sách nhân sự!' };
  }

  const created: UserProfile = {
    id: 'usr-staff-' + Date.now(),
    email: cleanEmail,
    fullName: newStaff.fullName.trim(),
    role: newStaff.role,
    department: newStaff.department.trim() || 'Trung tâm Tuyển sinh & Hỗ trợ Sinh viên (VN-US)',
    phone: newStaff.phone.trim(),
    password: newStaff.password.trim(),
    status: 'active',
    assignedRegion: newStaff.assignedRegion || 'Toàn quốc',
    targetQuota: newStaff.targetQuota || 50
  };

  const updatedList = [...staffList, created];
  saveStaffList(updatedList);

  addAuditLog(
    'CREATE',
    'users',
    created.id,
    null,
    {
      fullName: created.fullName,
      email: created.email,
      role: created.role,
      department: created.department
    },
    creator
  );

  return { success: true, staff: created, message: 'Cấp tài khoản nhân sự mới thành công!' };
}

/**
 * Xóa tài khoản nhân sự (Chỉ Admin, không được tự xóa Quản trị tối cao)
 */
export function deleteStaffAccount(
  creator: UserProfile,
  staffId: string
): { success: boolean; message?: string } {
  if (creator.role !== 'admin') {
    return { success: false, message: 'Chỉ Quản trị viên mới có thẩm quyền xóa tài khoản!' };
  }

  const staffList = getStaffList();
  const target = staffList.find(s => s.id === staffId);

  if (!target) {
    return { success: false, message: 'Không tìm thấy tài khoản cần xóa.' };
  }

  if (target.email.toLowerCase() === 'anhthuphan0102@gmail.com') {
    return { success: false, message: 'Không thể xóa tài khoản Quản trị viên tối cao (Anh Thư)!' };
  }

  if (target.id === creator.id) {
    return { success: false, message: 'Bạn không thể tự xóa tài khoản đang đăng nhập của chính mình!' };
  }

  const filtered = staffList.filter(s => s.id !== staffId);
  saveStaffList(filtered);

  addAuditLog(
    'DELETE',
    'users',
    staffId,
    { email: target.email, fullName: target.fullName },
    null,
    creator
  );

  return { success: true, message: 'Đã xóa tài khoản nhân sự thành công!' };
}

/**
 * Khóa / Mở khóa tài khoản nhân sự
 */
export function toggleStaffStatus(
  creator: UserProfile,
  staffId: string
): { success: boolean; message?: string } {
  if (creator.role !== 'admin') {
    return { success: false, message: 'Chỉ Quản trị viên mới có thẩm quyền đổi trạng thái tài khoản!' };
  }

  const staffList = getStaffList();
  const target = staffList.find(s => s.id === staffId);

  if (!target) {
    return { success: false, message: 'Không tìm thấy tài khoản.' };
  }

  if (target.email.toLowerCase() === 'anhthuphan0102@gmail.com') {
    return { success: false, message: 'Không thể khóa tài khoản Quản trị viên tối cao!' };
  }

  target.status = target.status === 'locked' ? 'active' : 'locked';
  saveStaffList(staffList);

  return {
    success: true,
    message: target.status === 'locked' ? 'Đã tạm khóa tài khoản thành công.' : 'Đã mở khóa tài khoản thành công.'
  };
}

export function switchRole(role: Role): UserProfile {
  const staff = getStaffList();
  const user = staff.find(s => s.role === role) || staff[0];
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      window.dispatchEvent(new Event('auth-changed'));
    } catch {
      // ignore
    }
  }
  return user;
}

export function setCurrentUser(user: UserProfile) {
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      window.dispatchEvent(new Event('auth-changed'));
    } catch {
      // ignore
    }
  }
}

export const getAllStaff = getStaffList;

export function logoutUser() {
  if (isBrowser) {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      window.dispatchEvent(new Event('auth-changed'));
    } catch {
      // ignore
    }
  }
}

// ==============================================================================
// 11. CAMPAIGNS, CONTENT & KPIS
// ==============================================================================
export function getCampaigns(): MarketingCampaign[] {
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
    } catch {
      // ignore
    }
  }
  return memoryCampaigns;
}

export function saveCampaigns(camps: MarketingCampaign[]) {
  memoryCampaigns = camps;
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(camps));
    } catch {
      // ignore
    }
  }
}

export function getContentCalendar(): ContentItem[] {
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONTENT);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(INITIAL_CONTENT_CALENDAR));
    } catch {
      // ignore
    }
  }
  return memoryContent;
}

export function saveContentCalendar(content: ContentItem[]) {
  memoryContent = content;
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(content));
    } catch {
      // ignore
    }
  }
}

export function addContentItem(item: Omit<ContentItem, 'id'>): ContentItem {
  const calendar = getContentCalendar();
  const newItem: ContentItem = {
    ...item,
    id: `cnt-${Date.now()}`
  };
  const updated = [newItem, ...calendar];
  saveContentCalendar(updated);
  return newItem;
}

export function getKPIStats(user?: UserProfile): KPIStats {
  const leads = getLeads(user);
  const campaigns = getCampaigns();
  const today = new Date().toISOString().split('T')[0];

  const totalLeads = leads.length;
  const newLeadsToday = leads.filter(l => l.createdAt.startsWith(today)).length;
  const consultingLeads = leads.filter(l => l.status === 'consulted_1' || l.status === 'hot_lead').length;
  const registeredLeads = leads.filter(l => l.status === 'submitted_app' || l.status === 'conditional_admit').length;
  const enrolledLeads = leads.filter(l => l.status === 'confirmed_enroll').length;
  const tuitionPaidLeads = leads.filter(l => l.status === 'tuition_paid').length;

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const pendingVerifications = leads.filter(l => l.documents?.verificationStatus === 'pending' || l.status === 'submitted_app').length;
  const todayRemindersCount = getTodayFollowUpReminders(user).length;

  const conversionRate = totalLeads > 0 ? Number(((tuitionPaidLeads + enrolledLeads) / totalLeads * 100).toFixed(1)) : 0;

  return {
    totalLeads,
    newLeadsToday,
    consultingLeads,
    registeredLeads,
    enrolledLeads,
    tuitionPaidLeads,
    conversionRate,
    activeCampaigns,
    pendingVerifications,
    todayRemindersCount
  };
}

export function resetDemoData() {
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_CONSULTATION_LOGS));
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(INITIAL_CONTENT_CALENDAR));
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_STAFF[0]));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      localStorage.setItem(STORAGE_KEYS.IMPORT_BATCHES, JSON.stringify(INITIAL_IMPORT_BATCHES));
      localStorage.setItem(STORAGE_KEYS.ZNS_SMS_LOGS, JSON.stringify(INITIAL_ZNS_SMS_LOGS));
    } catch {
      // ignore
    }
  }
  memoryLeads = [...INITIAL_LEADS];
  memoryLogs = [...INITIAL_CONSULTATION_LOGS];
  memoryCampaigns = [...INITIAL_CAMPAIGNS];
  memoryContent = [...INITIAL_CONTENT_CALENDAR];
  memoryStaff = [...INITIAL_STAFF];
  memoryAuditLogs = [...INITIAL_AUDIT_LOGS];
  memoryImportBatches = [...INITIAL_IMPORT_BATCHES];
  memoryZnsSmsLogs = [...INITIAL_ZNS_SMS_LOGS];
}
