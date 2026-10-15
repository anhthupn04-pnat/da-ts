-- ==============================================================================
-- TRUNG TÂM TƯ VẤN & HỖ TRỢ SINH VIÊN - ĐẠI HỌC DUY TÂN (VN-US)
-- Migration: 20261014_init_schema.sql
-- Database: PostgreSQL / Supabase
-- ==============================================================================

-- 1. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'counselor', 'marketer')),
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Study Programs Table
CREATE TABLE IF NOT EXISTS public.study_programs (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  faculty TEXT NOT NULL,
  partner TEXT NOT NULL,
  degree TEXT NOT NULL,
  accreditation TEXT NOT NULL,
  duration TEXT NOT NULL,
  tuition_per_year TEXT NOT NULL,
  description TEXT NOT NULL,
  career_prospects TEXT NOT NULL,
  admission_criteria TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  high_school TEXT,
  province TEXT,
  graduation_year INTEGER DEFAULT 2026,
  program_id TEXT REFERENCES public.study_programs(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('website', 'facebook', 'tiktok', 'event', 'referral', 'hotline', 'other')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'consulting', 'registered', 'enrolled', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  score_thpt NUMERIC(4,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Consultation History Table
CREATE TABLE IF NOT EXISTS public.consultation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  staff_name TEXT NOT NULL,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('call', 'zalo', 'facebook', 'meeting', 'email')),
  content TEXT NOT NULL,
  outcome TEXT NOT NULL,
  next_follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Marketing Campaigns Table
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('facebook', 'tiktok', 'google', 'event', 'pr')),
  target_audience TEXT,
  budget NUMERIC(12,2) DEFAULT 0,
  spent NUMERIC(12,2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'paused')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Content Items Table
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'tiktok', 'website', 'press')),
  program_id TEXT REFERENCES public.study_programs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('idea', 'draft', 'pending_review', 'approved', 'published')),
  author TEXT NOT NULL,
  scheduled_at DATE NOT NULL,
  publish_url TEXT,
  content_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Indexes for Search Performance
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_program ON public.leads(program_id);
CREATE INDEX IF NOT EXISTS idx_consultation_lead_id ON public.consultation_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.marketing_campaigns(status);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
-- Public can read active study programs
CREATE POLICY "Public can view active programs" ON public.study_programs
  FOR SELECT USING (is_active = true);

-- Public can submit consultation lead (INSERT only)
CREATE POLICY "Public can insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Authenticated internal staff can view and manage leads
CREATE POLICY "Internal staff can view leads" ON public.leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Internal staff can update leads" ON public.leads
  FOR UPDATE TO authenticated USING (true);

-- Allow web admin (anon key) to read and manage leads
CREATE POLICY "Anon can view leads" ON public.leads
  FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can update leads" ON public.leads
  FOR UPDATE TO anon USING (true);

CREATE POLICY "Anon can delete leads" ON public.leads
  FOR DELETE TO anon USING (true);

-- Authenticated staff can view and add consultation logs
CREATE POLICY "Internal staff can view consultation history" ON public.consultation_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Internal staff can insert consultation history" ON public.consultation_history
  FOR INSERT TO authenticated WITH CHECK (true);

-- Marketing and Admin can manage campaigns
CREATE POLICY "Internal staff can view campaigns" ON public.marketing_campaigns
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Internal staff can manage campaigns" ON public.marketing_campaigns
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Internal staff can view content items" ON public.content_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Internal staff can manage content items" ON public.content_items
  FOR ALL TO authenticated USING (true);
