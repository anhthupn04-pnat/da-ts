'use client';

import React, { useState } from 'react';
import { resetDemoData, getLeads, getCampaigns, getContentCalendar, getConsultationLogs } from '@/data/storage';
import {
  Settings,
  Database,
  Shield,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Globe,
  Terminal,
  FileCode
} from 'lucide-react';

export default function SettingsPage() {
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục dữ liệu mẫu ban đầu? Tất cả dữ liệu thử nghiệm sẽ được đưa về mặc định.')) {
      resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleExportBackup = () => {
    const backup = {
      version: '1.0.0',
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
    link.download = `backup_tttv_database_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Cấu Hình Hệ Thống & Cơ Sở Dữ Liệu
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quản lý trạng thái lưu trữ, kết nối Supabase Cloud và bảo vệ dữ liệu tuyển sinh
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Đã khôi phục toàn bộ dữ liệu mẫu chuẩn K32 thành công! Hãy quay lại Dashboard hoặc trang Quản lý Lead để kiểm tra.</span>
        </div>
      )}

      {/* Cloud & Local Storage Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Trạng Thái Lớp Dữ Liệu (Dual-Mode Data Engine)
              </h3>
              <p className="text-xs text-slate-500">
                Hệ thống tự động kích hoạt chế độ phù hợp với môi trường triển khai
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Vercel Ready: Hoạt Động Ngay
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-600" />
              Chế độ 1: Vercel Standalone Test Mode (Mặc định)
            </span>
            <p className="text-slate-600 leading-relaxed">
              Mọi tester hoặc người dùng truy cập link Vercel có thể tương tác đầy đủ: gửi form đăng ký, quản lý lead, ghi nhật ký tư vấn, đổi vai trò và tạo kịch bản AI mà <strong>không cần cấu hình tài khoản Supabase</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block flex items-center gap-1.5">
              <Key className="w-4 h-4 text-purple-600" />
              Chế độ 2: Supabase Cloud PostgreSQL (Sẵn sàng)
            </span>
            <p className="text-slate-600 leading-relaxed">
              Toàn bộ schema DDL, RLS policies và file seed đã được đóng gói tại thư mục <code className="text-blue-700 font-bold">/supabase/</code>. Khi nhập biến môi trường vào Vercel, dữ liệu sẽ tự động lưu vào PostgreSQL.
            </p>
          </div>
        </div>
      </div>

      {/* Data Operations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Thao Tác Quản Trị Dữ Liệu Thử Nghiệm
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Sao Lưu Toàn Bộ Dữ Liệu (Backup JSON)</span>
          </button>

          <button
            onClick={handleResetData}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Khôi Phục Dữ Liệu Mẫu Chuẩn K32 Ban Đầu</span>
          </button>
        </div>
      </div>

      {/* Supabase Migration Guide */}
      <div className="bg-slate-900 text-slate-200 p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
          <Terminal className="w-5 h-5" />
          <span>Hướng Dẫn Cấu Hình Biến Môi Trường Khi Deploy Vercel Production</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Khi triển khai lên Vercel, bạn có thể thiết lập các biến môi trường sau trong phần <strong>Project Settings → Environment Variables</strong>:
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-blue-300 space-y-1 overflow-x-auto">
          <div><span className="text-slate-500"># URL kết nối cơ sở dữ liệu Supabase</span></div>
          <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
          <div className="pt-2"><span className="text-slate-500"># Anon public API key của Supabase</span></div>
          <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
          <div className="pt-2"><span className="text-slate-500"># Khóa bí mật gọi mô hình AI sinh kịch bản (Tùy chọn)</span></div>
          <div>GEMINI_API_KEY=AIzaSy...</div>
        </div>

        <p className="text-[11px] text-slate-400">
          *Lưu ý: Nếu không cấu hình các biến trên, ứng dụng vẫn hoạt động 100% trơn tru ở chế độ Standalone để hội đồng và người dùng có thể test thử các tính năng trực tiếp.
        </p>
      </div>

    </div>
  );
}
