'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setCurrentUser, getAllStaff } from '@/data/storage';
import { UserProfile, Role } from '@/types';
import {
  GraduationCap,
  Shield,
  UserCheck,
  Megaphone,
  Users,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Building2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const staffList = getAllStaff();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('counselor');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const departments = [
    {
      role: 'counselor' as Role,
      staffEmail: 'lan.tuyensinh@dtu.edu.vn',
      title: 'Chuyên Viên Tư Vấn Tuyển Sinh',
      department: 'Bộ phận Tư vấn Tuyển sinh & Hotline',
      name: 'Trần Thị Mai Lan',
      icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800',
      description: 'Chăm sóc lead, gọi điện/Zalo tư vấn học phí & học bổng K32, tiếp nhận hồ sơ, nhập dữ liệu Excel.'
    },
    {
      role: 'marketer' as Role,
      staffEmail: 'phuong.mkt@dtu.edu.vn',
      title: 'Chuyên Viên Marketing Tuyển Sinh',
      department: 'Phòng Truyền thông & Tuyển sinh Số',
      name: 'Phạm Minh Phương',
      icon: <Megaphone className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 hover:bg-amber-100/70 border-amber-200',
      badge: 'bg-amber-100 text-amber-800',
      description: 'Quản trị chiến dịch đa kênh (TikTok, Facebook, Web), lập lịch bài đăng, sử dụng Trợ lý AI sáng tạo.'
    },
    {
      role: 'manager' as Role,
      staffEmail: 'manager.tuyensinh@dtu.edu.vn',
      title: 'Trưởng Ban Tuyển Sinh (Quản Lý)',
      department: 'Ban Lãnh đạo Tuyển sinh',
      name: 'TS. Đặng Thanh Bình',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 hover:bg-blue-100/70 border-blue-200',
      badge: 'bg-blue-100 text-blue-800',
      description: 'Giám sát toàn bộ tiến độ, phân công chuyên viên xử lý hồ sơ, duyệt nội dung và xem báo cáo tổng hợp.'
    },
    {
      role: 'admin' as Role,
      staffEmail: 'admin.tuyensinh@dtu.edu.vn',
      title: 'Quản Trị Viên Hệ Thống (Admin)',
      department: 'Ban Giám đốc & Quản trị Hệ thống',
      name: 'ThS. Nguyễn Văn Hải',
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 hover:bg-purple-100/70 border-purple-200',
      badge: 'bg-purple-100 text-purple-800',
      description: 'Toàn quyền cấu hình hệ thống, quản lý tài khoản nhân sự, kết nối Database Supabase/Local, sao lưu dữ liệu.'
    }
  ];

  const handleQuickLogin = (role: Role) => {
    setLoading(true);
    const staff = staffList.find(s => s.role === role) || staffList[0];
    setCurrentUser(staff);
    setTimeout(() => {
      router.push('/admin');
    }, 400);
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email cơ quan.');
      return;
    }

    setLoading(true);
    // Find matching staff or create a session
    const matched = staffList.find(s => s.email.toLowerCase() === email.trim().toLowerCase());

    if (matched) {
      setCurrentUser(matched);
      router.push('/admin');
    } else {
      // Default to chosen role with custom email
      const fallbackStaff: UserProfile = {
        id: 'usr-custom-' + Date.now(),
        email: email.trim(),
        fullName: email.split('@')[0],
        role: selectedRole,
        department: departments.find(d => d.role === selectedRole)?.department || 'Bộ phận Tuyển sinh',
        phone: '0979407340'
      };
      setCurrentUser(fallbackStaff);
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Top Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Cổng Thông Tin Công Khai</span>
        </Link>

        <span className="text-amber-400 font-bold tracking-wider uppercase text-[11px] bg-white/10 px-3 py-1 rounded-full border border-amber-400/20">
          Cổng Nội Bộ K32 (2026)
        </span>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full my-8">
        
        {/* Title Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/30">
            <GraduationCap className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cổng Đăng Nhập Cán Bộ & Chuyên Viên Tuyển Sinh
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Hệ thống CRM số hóa tuyển sinh & marketing K32 – Viện Đào tạo Quốc tế (VN-US) • Đại học Duy Tân.
            Được phân quyền riêng biệt cho từng bộ phận nghiệp vụ.
          </p>
        </div>

        {/* Section 1: 1-Click Role Login for Departments */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                Truy Cập Nhanh Theo Bộ Phận
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                Chọn vai trò bộ phận để đăng nhập vào đúng không gian làm việc
              </h3>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" /> 1-Click Login
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map(dept => (
              <div
                key={dept.role}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-md hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-xl bg-slate-100 group-hover:scale-105 transition-transform">
                      {dept.icon}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${dept.badge}`}>
                      {dept.title}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {dept.name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {dept.department}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {dept.staffEmail}
                  </span>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickLogin(dept.role)}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition group-hover:scale-105 cursor-pointer"
                  >
                    <span>Vào Làm Việc</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section 2: Custom Credentials Form */}
          <div className="pt-6 border-t border-white/10">
            <details className="group">
              <summary className="text-xs font-bold text-slate-300 hover:text-white cursor-pointer select-none flex items-center justify-between">
                <span>Hoặc đăng nhập thủ công bằng email & mật khẩu riêng</span>
                <span className="text-[11px] text-blue-300 group-open:rotate-180 transition-transform">▼</span>
              </summary>

              <form onSubmit={handleFormLogin} className="mt-4 space-y-4 pt-2">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Email Chuyên Viên:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        placeholder="lan.tuyensinh@dtu.edu.vn"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Mật Khẩu Cơ Quan:
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Chọn vai trò:</span>
                    <select
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value as Role)}
                      className="px-2 py-1 bg-slate-900/60 border border-white/20 rounded-lg text-white text-xs"
                    >
                      <option value="counselor" className="bg-slate-900">Chuyên viên Tư vấn</option>
                      <option value="marketer" className="bg-slate-900">Chuyên viên Marketing</option>
                      <option value="manager" className="bg-slate-900">Trưởng Ban Tuyển sinh</option>
                      <option value="admin" className="bg-slate-900">Quản trị viên (Admin)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Xác Nhận Đăng Nhập
                  </button>
                </div>
              </form>
            </details>
          </div>

        </div>

      </div>

      {/* Footer Notice */}
      <div className="max-w-5xl mx-auto w-full text-center text-slate-500 text-[11px] pt-4">
        © 2026 Trung tâm Tư vấn & Hỗ trợ Sinh viên – Trường Đào tạo Quốc tế (VN-US) • Đại học Duy Tân
      </div>

    </div>
  );
}
