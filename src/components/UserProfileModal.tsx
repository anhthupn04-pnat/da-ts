'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types';
import { updateUserProfile } from '@/data/storage';
import {
  X,
  User,
  Phone,
  Mail,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Building2,
  Sparkles
} from 'lucide-react';

interface UserProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedUser: UserProfile) => void;
}

export default function UserProfileModal({ user, isOpen, onClose, onUpdated }: UserProfileModalProps) {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setError('Họ và tên không được để trống.');
      return;
    }

    if (!phone.trim()) {
      setError('Số điện thoại liên lạc không được để trống.');
      return;
    }

    // Nếu người dùng muốn đổi mật khẩu
    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        setError('Vui lòng nhập mật khẩu hiện tại để xác thực đổi mật khẩu.');
        return;
      }

      const activePass = user.password || (user.email === 'anhthuphan0102@gmail.com' ? '0102024' : '');
      if (currentPassword.trim() !== activePass) {
        setError('Mật khẩu hiện tại không chính xác!');
        return;
      }

      if (newPassword.length < 6) {
        setError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Mật khẩu mới và xác nhận mật khẩu không trùng khớp.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = updateUserProfile(user.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        password: newPassword ? newPassword.trim() : undefined
      });

      if (res.success && res.user) {
        setSuccessMsg(res.message || 'Cập nhật thông tin cá nhân thành công!');
        onUpdated(res.user);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.message || 'Có lỗi xảy ra khi cập nhật.');
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên tối cao (Super Admin)';
      case 'manager':
        return 'Trưởng Ban Tuyển Sinh (Admissions Manager)';
      case 'counselor':
        return 'Chuyên Viên Tư Vấn Tuyển Sinh (Counselor)';
      case 'verifier':
        return 'Cán Bộ Hậu Kiểm & Xét Tuyển (Verifier)';
      case 'marketer':
        return 'Chuyên Viên Marketing & Truyền Thông (Marketer)';
      default:
        return role;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-black text-amber-300 shadow-inner">
              {fullName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {user.role.toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-300">Hồ sơ cá nhân</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight mt-1">{fullName || user.email}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Readonly info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Vai trò hệ thống (RBAC):</span>
              <span className="font-bold text-slate-900">{getRoleTitle(user.role)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Đơn vị công tác:</span>
              <span className="font-semibold text-slate-800 text-right">{user.department}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Khu vực phụ trách:</span>
              <span className="font-semibold text-slate-800">{user.assignedRegion || 'Toàn quốc'}</span>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-900" />
              <span>Chỉnh sửa thông tin liên hệ</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Họ và Tên hiển thị <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent font-medium"
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số điện thoại liên lạc / Hotline cá nhân <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent font-medium"
                  placeholder="0905xxxxxx"
                  required
                />
              </div>
            </div>
          </div>

          {/* Change password section */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-600" />
              <span>Đổi Mật Khẩu Đăng Nhập (Tùy chọn)</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Để bảo mật tài khoản cá nhân, vui lòng nhập mật khẩu hiện tại nếu muốn thiết lập mật khẩu mới.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
