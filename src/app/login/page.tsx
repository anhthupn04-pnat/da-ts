'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authenticateStaff } from '@/data/storage';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  UserCheck
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email công vụ của bạn.');
      return;
    }

    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu tài khoản.');
      return;
    }

    setLoading(true);

    try {
      const res = authenticateStaff(email, password);

      if (res.success && res.user) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin');
        }, 600);
      } else {
        setError(res.message || 'Email hoặc mật khẩu không chính xác.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi xác thực.');
      setLoading(false);
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
        
        {/* Logo and Brand Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-2xl shadow-blue-950/50 border border-slate-200">
            <img
              src="/logo.png"
              alt="VN-US Duy Tan University"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Đăng Nhập Cán Bộ Tuyển Sinh
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Hệ Thống Quản Trị Tuyển Sinh & Chăm Sóc Thí Sinh (VN-US)
            </p>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Đăng nhập không thành công</p>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-bold">Xác thực thành công! Đang chuyển hướng vào bảng điều khiển...</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tài khoản Email công vụ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="anhthuphan0102@gmail.com"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent font-medium"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
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
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-950 hover:to-slate-900 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Đang xác thực thông tin...</span>
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
                <span>Quy định phân quyền & Tạo tài khoản:</span>
              </div>
              <ul className="text-[11px] space-y-1 list-disc list-inside text-slate-600 leading-relaxed">
                <li>
                  Tài khoản Quản trị tối cao: <strong>anhthuphan0102@gmail.com</strong>
                </li>
                <li>
                  Hệ thống <strong>không cho phép tự đăng ký</strong> công khai.
                </li>
                <li>
                  Các tài khoản Chuyên viên/Cán bộ khác do <strong>Admin tự tạo và gán vai trò</strong> trong Dashboard.
                </li>
                <li>
                  Cán bộ sau khi được cấp tài khoản có thể <strong>tự chỉnh sửa thông tin & đổi mật khẩu</strong> tại mục Hồ sơ cá nhân.
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
