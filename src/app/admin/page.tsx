'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import ConversionFunnel from '@/components/ConversionFunnel';
import LeadSourceChart from '@/components/LeadSourceChart';
import LeadModal from '@/components/LeadModal';
import { getLeads, getKPIStats, getCampaigns, getCurrentUser } from '@/data/storage';
import { Lead, KPIStats, MarketingCampaign, UserProfile } from '@/types';
import {
  Users,
  UserCheck,
  FileCheck,
  Award,
  TrendingUp,
  Megaphone,
  Clock,
  ArrowRight,
  Phone,
  Calendar,
  Sparkles,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<KPIStats | null>(null);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const refreshData = () => {
    setCurrentUser(getCurrentUser());
    setLeads(getLeads());
    setStats(getKPIStats());
    setCampaigns(getCampaigns());
  };

  useEffect(() => {
    refreshData();
  }, []);

  if (!stats) return null;

  // Uncontacted new leads that need attention
  const urgentLeads = leads.filter(l => l.status === 'new').slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-950/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Chiến dịch Tuyển sinh Quốc tế VN-US
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Xin chào, {currentUser?.fullName || 'Chuyên viên Tuyển sinh'}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 max-w-2xl">
              Hôm nay hệ thống có <strong>{stats.newLeadsToday} thí sinh mới</strong> cần kết nối tư vấn và <strong>{stats.consultingLeads} hồ sơ</strong> đang trong giai đoạn tư vấn chuyên sâu.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/leads"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Xử Lý Danh Sách Lead</span>
            </Link>

            <Link
              href="/admin/ai-assistant"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Trợ Lý AI Tuyển Sinh</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Tổng Thí Sinh Tiềm Năng"
          value={stats.totalLeads}
          subtitle="Tất cả các nguồn đăng ký"
          icon={<Users className="w-5 h-5 text-blue-600" />}
          trend={{ value: '+18% so với tuần trước', isPositive: true }}
          accentColor="blue"
        />

        <StatCard
          title="Đang Tư Vấn Chuyên Sâu"
          value={stats.consultingLeads}
          subtitle="Trao đổi lộ trình & học bổng"
          icon={<UserCheck className="w-5 h-5 text-indigo-600" />}
          trend={{ value: 'Tỷ lệ phản hồi 92%', isPositive: true }}
          accentColor="purple"
        />

        <StatCard
          title="Đã Nộp Hồ Sơ Đăng Ký"
          value={stats.registeredLeads}
          subtitle="Hồ sơ hợp lệ đợt 1"
          icon={<FileCheck className="w-5 h-5 text-amber-600" />}
          trend={{ value: '+12 hồ sơ mới', isPositive: true }}
          accentColor="amber"
        />

        <StatCard
          title="Nhập Học Thành Công"
          value={stats.enrolledLeads}
          subtitle={`Tỷ lệ chuyển đổi: ${stats.conversionRate}%`}
          icon={<Award className="w-5 h-5 text-emerald-600" />}
          trend={{ value: `Chốt ${stats.conversionRate}%`, isPositive: true }}
          accentColor="emerald"
        />
      </div>

      {/* Conversion Funnel & Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnel leads={leads} />
        <LeadSourceChart leads={leads} />
      </div>

      {/* Urgent Leads Attention Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900">
                Thí Sinh Mới Cần Liên Hệ Trong Ngày ({urgentLeads.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Các yêu cầu tư vấn trực tuyến mới gửi từ trang chủ cần chuyên viên gọi lại ngay
            </p>
          </div>

          <Link
            href="/admin/leads"
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 self-start sm:self-center"
          >
            <span>Xem toàn bộ {leads.length} thí sinh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {urgentLeads.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Tuyệt vời! Không có hồ sơ tồn đọng chưa liên hệ. Tất cả thí sinh đều đã được phân công chăm sóc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Họ và tên</th>
                  <th className="px-4 py-3">Số điện thoại</th>
                  <th className="px-4 py-3">Ngành quan tâm</th>
                  <th className="px-4 py-3">Nguồn</th>
                  <th className="px-4 py-3">Thời gian gửi</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {urgentLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      {lead.fullName}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {lead.highSchool} ({lead.province})
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">
                      {lead.phone}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {lead.programName || lead.programId}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer"
                      >
                        Tư Vấn Ngay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Marketing Campaigns Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Chiến Dịch Marketing Tuyển Sinh Đang Triển Khai
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi ngân sách và lượng thí sinh chuyển đổi từ các kênh truyền thông
            </p>
          </div>
          <Link
            href="/admin/marketing"
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Quản lý chiến dịch & Lịch bài</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.slice(0, 3).map(camp => (
            <div
              key={camp.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    {camp.channel}
                  </span>
                  <span className="font-bold text-emerald-700">
                    {camp.status === 'active' ? 'Đang chạy' : camp.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                  {camp.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {camp.targetAudience}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">Thu về:</span>
                <span className="text-blue-700">{camp.leadsGenerated} leads</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Detail & Consultation Modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onLeadUpdated={refreshData}
        />
      )}

    </div>
  );
}
