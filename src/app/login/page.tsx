'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authenticateStaff, setCurrentUser } from '@/data/storage';
import { UserProfile } from '@/types';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  CheckSquare,
  Square
} from 'lucide-react';

const REMEMBER_KEY = 'da_ts_remembered_account';

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Đọc tài khoản đã ghi nhớ (nếu có)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setIdentifier(saved);
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Vui lòng nhập tên đăng nhập hoặc địa chỉ email công vụ.');
      return;
    }

    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu tài khoản.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() })
      });

      const res = await response.json();

      if (response.ok && res.success && res.user) {
        const loggedUser: UserProfile = {
          id: res.user.id,
          fullName: res.user.full_name,
          username: res.user.username,
          email: res.user.email,
          role: res.user.role,
          status: res.user.status,
          phone: res.user.phone || '',
          department: res.user.department || 'Tổ Tư Vấn Tuyển Sinh VN-US'
        };

        setCurrentUser(loggedUser);

        // Xử lý Remember Me
        try {
          if (rememberMe) {
            localStorage.setItem(REMEMBER_KEY, identifier.trim());
          } else {
            localStorage.removeItem(REMEMBER_KEY);
          }
        } catch {
          // ignore
        }

        setSuccess(true);
        setTimeout(() => {
          router.push('/admin');
        }, 500);
      } else {
        setError(res.error || res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
        setLoading(false);
      }
    } catch {
      // Fallback authenticateStaff nếu mạng offline
      const fallback = authenticateStaff(identifier, password);
      if (fallback.success && fallback.user) {
        setSuccess(true);
        setTimeout(() => router.push('/admin'), 500);
      } else {
        setError(fallback.message || 'Lỗi kết nối máy chủ xác thực.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header Navigation */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Cổng Thông Tin Tuyển Sinh Công Khai</span>
        </Link>

        <span className="text-amber-400 font-bold tracking-wider uppercase text-[11px] bg-white/10 px-3.5 py-1.5 rounded-full border border-amber-400/30 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Cổng Nội Bộ Cán Bộ Tuyển Sinh</span>
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full my-6">
        
        {/* Circular Logo and Brand Header */}
        <div className="text-center space-y-3 mb-6 flex flex-col items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-full overflow-hidden p-2 bg-white ring-4 ring-white/20 shadow-2xl shadow-blue-950/60 flex items-center justify-center shrink-0">
            <img
              src="/logo.png"
              alt="VN-US Duy Tan University"
              className="w-full h-full object-contain rounded-full aspect-square"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Đăng Nhập Cán Bộ Tuyển Sinh
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Hệ Thống Quản Trị Tuyển Sinh & Phân Quyền Nội Bộ (VN-US)
            </p>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Đăng nhập không thành công</p>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-bold">Xác thực thành công! Đang chuyển hướng vào bảng điều khiển...</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tên đăng nhập / Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="Nhập tên đăng nhập hoặc email công vụ..."
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent font-medium"
                  required
                  autoFocus
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Mật khẩu đăng nhập <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent font-medium"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                {rememberMe ? (
                  <CheckSquare className="w-4 h-4 text-blue-900" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Ghi nhớ đăng nhập trên thiết bị này</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-950 hover:to-slate-900 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Đang xử lý xác thực...</span>
              ) : (
                <>
                  <span>Đăng Nhập Hệ Thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security & Access Guidelines */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-slate-600">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <KeyRound className="w-4 h-4 text-blue-900" />
                <span>Quy định phân quyền & Tài khoản nội bộ:</span>
              </div>
              <ul className="text-[11px] space-y-1 list-disc list-inside text-slate-600 leading-relaxed">
                <li>
                  Chỉ cán bộ thuộc 2 vai trò <strong>Admin</strong> (Quản trị viên) và <strong>Staff</strong> (Chuyên viên) mới được cấp quyền truy cập.
                </li>
                <li>
                  Hệ thống <strong>không hỗ trợ tự đăng ký</strong> công khai từ bên ngoài.
                </li>
                <li>
                  Tài khoản chuyên viên do <strong>Quản trị viên (Admin) tạo và phân quyền</strong> từ Dashboard Quản Trị Người Dùng.
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>

      {/* Footer Credentials Info */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">
          Viện Đào tạo Quốc tế (VN-US) • Đại học Duy Tân
        </p>
        <p className="text-[11px] text-slate-500">
          Bảo mật cấp độ Database RBAC & Audit Trail • Tất cả phiên làm việc đều được mã hóa và giám sát.
        </p>
      </div>

    </div>
  );
}
