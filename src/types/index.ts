export type Role = 'admin' | 'manager' | 'counselor' | 'marketer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  department: string;
  phone: string;
  avatarUrl?: string;
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
  tuitionPerYear: string;
  description: string;
  careerProspects: string;
  admissionCriteria: string;
  isActive?: boolean;
}

export type LeadStatus = 'new' | 'contacted' | 'consulting' | 'registered' | 'enrolled' | 'cancelled';
export type LeadSource = 'website' | 'facebook' | 'tiktok' | 'event' | 'referral' | 'hotline' | 'other';
export type LeadPriority = 'high' | 'medium' | 'low';

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  highSchool?: string;
  province?: string;
  graduationYear?: number;
  programId: string;
  programName?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo?: string;
  assignedToName?: string;
  scoreThpt?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactMethod = 'call' | 'zalo' | 'facebook' | 'meeting' | 'email';

export interface ConsultationHistory {
  id: string;
  leadId: string;
  staffId: string;
  staffName: string;
  contactMethod: ContactMethod;
  content: string;
  outcome: string;
  nextFollowUpDate?: string;
  createdAt: string;
}

export type CampaignStatus = 'planning' | 'active' | 'completed' | 'paused';
export type CampaignChannel = 'facebook' | 'tiktok' | 'google' | 'event' | 'pr';

export interface MarketingCampaign {
  id: string;
  title: string;
  channel: CampaignChannel;
  targetAudience: string;
  budget: number;
  spent: number;
  leadsGenerated: number;
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
  conversionRate: number;
  activeCampaigns: number;
  pendingTasks: number;
}
