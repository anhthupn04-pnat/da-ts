'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  resetDemoData,
  getLeads,
  getCampaigns,
  getContentCalendar,
  getConsultationLogs,
  saveLeads
} from '@/data/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  Settings,
  Database,
  Shield,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Globe,
  Terminal,
  FileSpreadsheet,
  Layers,
  HardDrive
} from 'lucide-react';

export default function SettingsPage() {
  const [resetSuccess, setResetSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [leadsCount, setLeadsCount] = useState(0);
  const [logsCount, setLogsCount] = useState(0);
  const [campaignsCount, setCampaignsCount] = useState(0);

  const refreshCounts = () => {
    setLeadsCount(getLeads().length);
    setLogsCount(getConsultationLogs().length);
    setCampaignsCount(getCampaigns().length);
  };

  useEffect(() => {
    refreshCounts();
  }, []);

  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục dữ liệu mẫu ban đầu? Tất cả dữ liệu thử nghiệm sẽ được đưa về mặc định.')) {
      resetDemoData();
      refreshCounts();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  // Export full multi-sheet Excel file
  const handleExportFullExcel = () => {
    const leads = getLeads();
    const logs = getConsultationLogs();
    const campaigns = getCampaigns();

    const wb = XLSX.utils.book_new();

    // Sheet 1: Leads
    const leadsData = leads.map(l => ({
      'Mã Hồ Sơ': l.id,
      'Họ và Tên': l.fullName,
      'Số Điện Thoại': l.phone,
      'Email': l.email,
      'Trường THPT': l.highSchool || '',
      'Tỉnh Thành': l.province || '',
      'Năm Tốt Nghiệp': l.graduationYear || new Date().getFullYear(),
      'Mã Ngành': l.programId,
      'Tên Ngành': l.programName || '',
      'Nguồn Tiếp Cận': l.source,
      'Trạng Thái': l.status,
      'Mức Độ Ưu Tiên': l.priority,
      'Điểm Xét Tuyển': l.scoreThpt || '',
      'Chuyên Viên Phụ Trách': l.assignedToName || '',
      'Ghi Chú': l.notes || '',
      'Ngày Tiếp Nhận': l.createdAt
    }));
    const wsLeads = XLSX.utils.json_to_sheet(leadsData);
    XLSX.utils.book_append_sheet(wb, wsLeads, 'Danh_Sach_Leads');

    // Sheet 2: Consultation History
    const logsData = logs.map(log => ({
      'Mã Nhật Ký': log.id,
      'Mã Lead': log.leadId,
      'Chuyên Viên Tư Vấn': log.staffName,
      'Hình Thức': log.contactMethod,
      'Nội Dung Trao Đổi': log.content,
      'Kết Quả': log.outcome,
      'Lịch Chăm Sóc Tiếp Theo': log.nextFollowUpDate || '',
      'Thời Gian': log.createdAt
    }));
    const wsLogs = XLSX.utils.json_to_sheet(logsData);
    XLSX.utils.book_append_sheet(wb, wsLogs, 'Lich_Su_Tu_Van');

    // Sheet 3: Marketing Campaigns
    const campaignsData = campaigns.map(c => ({
      'Mã Chiến Dịch': c.id,
      'Tên Chiến Dịch': c.title,
      'Kênh': c.channel,
      'Đối Tượng': c.targetAudience,
      'Ngân Sách (VNĐ)': c.budget,
      'Đã Chi (VNĐ)': c.spent,
      'Leads Thu Được': c.leadsGenerated,
      'Trạng Thái': c.status,
      'Bắt Đầu': c.startDate,
      'Kết Thúc': c.endDate
    }));
    const wsCampaigns = XLSX.utils.json_to_sheet(campaignsData);
    XLSX.utils.book_append_sheet(wb, wsCampaigns, 'Chien_Dich_Marketing');

    XLSX.writeFile(wb, `Bao_Cao_Tong_The_Du_Lieu_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportBackupJSON = () => {
    const backup = {
      version: '1.2.0',
      institution: 'Trường Đào tạo Quốc tế (VN-US) - ĐH Duy Tân',
      exportedAt: new Date().toISOString(),
      leads: getLeads(),
      consultationLogs: getConsultationLogs(),
      campaigns: getCampaigns(),
      contentCalendar: getContentCalendar()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_database_tttv_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleRestoreBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.leads)) {
          saveLeads(parsed.leads);
          refreshCounts();
          setImportSuccess(`Đã khôi phục thành công ${parsed.leads.length} hồ sơ thí sinh từ file backup!`);
          setTimeout(() => setImportSuccess(null), 4000);
        } else {
          alert('File backup JSON không đúng cấu trúc (thiếu trường leads).');
        }
      } catch (err) {
        alert('Không thể đọc file backup JSON. Vui lòng kiểm tra lại.');
      }
    };
    reader.readAsText(uploadedFile);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Cấu Hình Hệ Thống & Kết Nối Cơ Sở Dữ Liệu
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quản lý kết nối dữ liệu thực tế, đồng bộ Supabase Cloud PostgreSQL và nhập/xuất dữ liệu tuyển sinh
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Đã khôi phục toàn bộ dữ liệu mẫu ban đầu thành công! Mọi thay đổi thử nghiệm đã được làm mới.</span>
        </div>
      )}

      {importSuccess && (
        <div className="p-4 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <span>{importSuccess}</span>
        </div>
      )}

      {/* Real-time Data Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Hồ Sơ Thí Sinh Trong DB</span>
            <span className="text-2xl font-black text-slate-900">{leadsCount} hồ sơ</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Nhật Ký Tư Vấn Lưu Vết</span>
            <span className="text-2xl font-black text-slate-900">{logsCount} cuộc trao đổi</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Chiến Dịch Truyền Thông</span>
            <span className="text-2xl font-black text-slate-900">{campaignsCount} chiến dịch</span>
          </div>
        </div>
      </div>

      {/* Cloud & Local Storage Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Trạng Thái Kết Nối Dữ Liệu Thực Tế
              </h3>
              <p className="text-xs text-slate-500">
                Dual-Provider Engine: Hoạt động bền bỉ ở mọi môi trường triển khai
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${
            isSupabaseConfigured
              ? 'bg-purple-50 text-purple-800 border-purple-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'}`} />
            {isSupabaseConfigured ? 'Supabase Live Connected' : 'Persistent Storage: Sẵn Sàng Vercel'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-600" />
              1. Persistent Realtime Browser Database
            </span>
            <p className="text-slate-600 leading-relaxed">
              Mọi dữ liệu thí sinh nhập từ Excel, đăng ký từ form công khai, ghi nhận nhật ký tư vấn đều được lưu thật 100% vào bộ nhớ lưu trữ trình duyệt, tồn tại vĩnh viễn giữa các phiên làm việc mà không bao giờ mất.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block flex items-center gap-1.5">
              <Key className="w-4 h-4 text-purple-600" />
              2. Supabase Cloud PostgreSQL Database
            </span>
            <p className="text-slate-600 leading-relaxed">
              Toàn bộ schema DDL, RLS policies và file seed đã được chuẩn hóa tại thư mục <code className="text-blue-700 font-bold">/supabase/</code>. Khi nhập biến môi trường vào Vercel, dữ liệu tự động đồng bộ lên máy chủ đám mây.
            </p>
          </div>
        </div>
      </div>

      {/* Data Export & Backup Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Xuất Báo Cáo & Quản Trị Cơ Sở Dữ Liệu
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <button
            onClick={handleExportFullExcel}
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            title="Xuất file Excel gồm 3 sheet: Danh sách Lead, Lịch sử tư vấn, Chiến dịch marketing"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Xuất Toàn Bộ Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportBackupJSON}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Sao Lưu File JSON</span>
          </button>

          <label className="p-3.5 rounded-xl bg-blue-50 border border-blue-300 hover:bg-blue-100 text-blue-900 font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
            <Upload className="w-4 h-4 text-blue-700" />
            <span>Khôi Phục Từ JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreBackupJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetData}
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Làm Mới Dữ Liệu Gốc</span>
          </button>
        </div>
      </div>

      {/* Cloud Migration Guide */}
      <div className="bg-slate-900 text-slate-200 p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
          <Terminal className="w-5 h-5" />
          <span>Thông Tin Cấu Hình Khi Đưa Lên Vercel Production</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Ứng dụng được thiết kế tương thích hoàn hảo với Vercel và Supabase. Để kết nối cơ sở dữ liệu PostgreSQL trực tuyến, cấu hình 2 biến môi trường tại <strong>Vercel Settings → Environment Variables</strong>:
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-blue-300 space-y-1 overflow-x-auto">
          <div><span className="text-slate-500"># URL dự án Supabase</span></div>
          <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
          <div className="pt-2"><span className="text-slate-500"># Anon API Key</span></div>
          <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
        </div>
      </div>

    </div>
  );
}
