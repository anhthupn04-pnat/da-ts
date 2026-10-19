import { Lead, ConsultationHistory, MarketingCampaign, ContentItem, KPIStats, UserProfile, Role } from '@/types';
import { STUDY_PROGRAMS } from './programsData';
import { INITIAL_LEADS, INITIAL_CONSULTATION_LOGS, INITIAL_CAMPAIGNS, INITIAL_CONTENT_CALENDAR, INITIAL_STAFF } from './mockData';

// Storage keys for browser localStorage
const STORAGE_KEYS = {
  LEADS: 'tttv_leads_v1',
  LOGS: 'tttv_consultation_logs_v1',
  CAMPAIGNS: 'tttv_campaigns_v1',
  CONTENT: 'tttv_content_v1',
  CURRENT_USER: 'tttv_current_user_v1'
};

// In-memory fallback for server-side execution
let memoryLeads = [...INITIAL_LEADS];
let memoryLogs = [...INITIAL_CONSULTATION_LOGS];
let memoryCampaigns = [...INITIAL_CAMPAIGNS];
let memoryContent = [...INITIAL_CONTENT_CALENDAR];

const isBrowser = typeof window !== 'undefined';

export function getLeads(): Lead[] {
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (stored) return JSON.parse(stored);
      // Init
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

export function addLead(newLeadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; lead?: Lead; error?: string } {
  const leads = getLeads();

  // Clean phone and email
  const cleanPhone = newLeadData.phone.replace(/[\s\-\.]/g, '');
  const cleanEmail = newLeadData.email.trim().toLowerCase();

  // Check duplicate
  const duplicate = leads.find(l => {
    const p = l.phone.replace(/[\s\-\.]/g, '');
    const e = l.email.trim().toLowerCase();
    return p === cleanPhone || (cleanEmail && e === cleanEmail);
  });

  if (duplicate) {
    return {
      success: false,
      error: `Thí sinh với SĐT (${cleanPhone}) hoặc Email (${cleanEmail}) đã tồn tại trong hệ thống (Họ tên: ${duplicate.fullName}, Trạng thái: ${duplicate.status}).`
    };
  }

  // Lookup program name
  const prog = STUDY_PROGRAMS.find(p => p.id === newLeadData.programId);

  const lead: Lead = {
    ...newLeadData,
    id: 'lead-' + Date.now(),
    phone: cleanPhone,
    email: cleanEmail,
    programName: prog ? prog.name : newLeadData.programId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [lead, ...leads];
  saveLeads(updated);
  return { success: true, lead };
}

export interface BatchAddResult {
  total: number;
  inserted: number;
  duplicateCount: number;
  skipped: number;
  insertedLeads: Lead[];
  errors: string[];
}

export function batchAddLeads(newLeadsList: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[]): BatchAddResult {
  const currentLeads = getLeads();
  const existingPhones = new Set(currentLeads.map(l => l.phone.replace(/[\s\-\.]/g, '')));
  const existingEmails = new Set(currentLeads.map(l => l.email.trim().toLowerCase()).filter(Boolean));

  const validNewLeads: Lead[] = [];
  const errors: string[] = [];
  let duplicateCount = 0;
  let skipped = 0;

  newLeadsList.forEach((item, index) => {
    const cleanPhone = (item.phone || '').toString().replace(/[\s\-\.]/g, '');
    const cleanEmail = (item.email || '').toString().trim().toLowerCase();

    if (!item.fullName || item.fullName.toString().trim().length < 2) {
      errors.push(`Dòng ${index + 1}: Họ và tên không hợp lệ`);
      skipped++;
      return;
    }

    if (!cleanPhone || cleanPhone.length < 9) {
      errors.push(`Dòng ${index + 1} (${item.fullName}): SĐT không hợp lệ (${item.phone})`);
      skipped++;
      return;
    }

    if (existingPhones.has(cleanPhone) || (cleanEmail && existingEmails.has(cleanEmail))) {
      duplicateCount++;
      return;
    }

    // Match program
    let prog = STUDY_PROGRAMS.find(p => p.id === item.programId || p.code.toLowerCase() === (item.programId || '').toLowerCase());
    if (!prog && item.programName) {
      const pName = item.programName.toLowerCase();
      prog = STUDY_PROGRAMS.find(p => p.name.toLowerCase().includes(pName) || pName.includes(p.name.toLowerCase()) || p.code.toLowerCase().includes(pName));
    }
    if (!prog) {
      prog = STUDY_PROGRAMS[0];
    }

    const lead: Lead = {
      ...item,
      id: `lead-import-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: item.fullName.toString().trim(),
      phone: cleanPhone,
      email: cleanEmail,
      highSchool: (item.highSchool || 'Chưa cập nhật').toString().trim(),
      province: (item.province || 'Đà Nẵng').toString().trim(),
      graduationYear: Number(item.graduationYear) || 2026,
      programId: prog.id,
      programName: prog.name,
      source: item.source || 'other',
      status: item.status || 'new',
      priority: item.priority || 'medium',
      scoreThpt: item.scoreThpt ? Number(item.scoreThpt) : undefined,
      notes: (item.notes || 'Nhập từ file Excel/CSV').toString().trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    existingPhones.add(cleanPhone);
    if (cleanEmail) existingEmails.add(cleanEmail);
    validNewLeads.push(lead);
  });

  if (validNewLeads.length > 0) {
    const updated = [...validNewLeads, ...currentLeads];
    saveLeads(updated);
  }

  return {
    total: newLeadsList.length,
    inserted: validNewLeads.length,
    duplicateCount,
    skipped,
    insertedLeads: validNewLeads,
    errors
  };
}

export function updateLead(id: string, updates: Partial<Lead>): { success: boolean; lead?: Lead } {
  const leads = getLeads();
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return { success: false };

  const updatedLead: Lead = {
    ...leads[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  leads[idx] = updatedLead;
  saveLeads(leads);
  return { success: true, lead: updatedLead };
}

export function deleteLead(id: string): boolean {
  const leads = getLeads();
  const filtered = leads.filter(l => l.id !== id);
  if (filtered.length === leads.length) return false;
  saveLeads(filtered);
  return true;
}

export function getConsultationLogs(leadId?: string): ConsultationHistory[] {
  let logs = memoryLogs;
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (stored) {
        logs = JSON.parse(stored);
      } else {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_CONSULTATION_LOGS));
        logs = INITIAL_CONSULTATION_LOGS;
      }
    } catch {
      // ignore
    }
  }

  if (leadId) {
    return logs.filter(l => l.leadId === leadId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addConsultationLog(logData: Omit<ConsultationHistory, 'id' | 'createdAt'>): ConsultationHistory {
  const logs = getConsultationLogs();
  const newLog: ConsultationHistory = {
    ...logData,
    id: 'log-' + Date.now(),
    createdAt: new Date().toISOString()
  };
  const updated = [newLog, ...logs];
  memoryLogs = updated;
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return newLog;
}

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

export function addContentItem(item: Omit<ContentItem, 'id'>): ContentItem {
  const items = getContentCalendar();
  const newItem: ContentItem = {
    ...item,
    id: 'cnt-' + Date.now()
  };
  const updated = [newItem, ...items];
  memoryContent = updated;
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return newItem;
}

export function getKPIStats(): KPIStats {
  const leads = getLeads();
  const campaigns = getCampaigns();

  const total = leads.length;
  const consulting = leads.filter(l => l.status === 'consulting').length;
  const registered = leads.filter(l => l.status === 'registered').length;
  const enrolled = leads.filter(l => l.status === 'enrolled').length;

  const activeCamps = campaigns.filter(c => c.status === 'active').length;

  const convRate = total > 0 ? Math.round(((registered + enrolled) / total) * 100) : 0;

  return {
    totalLeads: total,
    newLeadsToday: leads.filter(l => l.status === 'new').length,
    consultingLeads: consulting,
    registeredLeads: registered,
    enrolledLeads: enrolled,
    conversionRate: convRate,
    activeCampaigns: activeCamps,
    pendingTasks: leads.filter(l => l.status === 'new' || l.status === 'contacted').length
  };
}

export function resetDemoData() {
  if (isBrowser) {
    localStorage.removeItem(STORAGE_KEYS.LEADS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEYS.CONTENT);
  }
  memoryLeads = [...INITIAL_LEADS];
  memoryLogs = [...INITIAL_CONSULTATION_LOGS];
  memoryCampaigns = [...INITIAL_CAMPAIGNS];
  memoryContent = [...INITIAL_CONTENT_CALENDAR];
}

export function getCurrentUser(): UserProfile {
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return INITIAL_STAFF[0]; // Admin by default
}

export function switchRole(role: Role): UserProfile {
  const staff = INITIAL_STAFF.find(s => s.role === role) || INITIAL_STAFF[0];
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(staff));
      window.dispatchEvent(new Event('auth-changed'));
    } catch {
      // ignore
    }
  }
  return staff;
}

export function getAllStaff(): UserProfile[] {
  return INITIAL_STAFF;
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

export function isUserAuthenticated(): boolean {
  if (isBrowser) {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    } catch {
      return false;
    }
  }
  return true;
}

