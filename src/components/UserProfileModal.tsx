'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Lock,
  Award,
  UserCheck,
  Megaphone
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

  useEffect(() => {
    if (isOpen) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Họ và tên hiển thị phải có tối thiểu 2 ký tự.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 9) {
      setError('Số điện thoại liên lạc phải có tối thiểu 9 số.');
      return;
    }

    const isChangingPassword = Boolean(newPassword || currentPassword || confirmPassword);

    if (isChangingPassword) {
      if (!currentPassword) {
        setError('Vui lòng nhập mật khẩu hiện tại để xác thực đổi mật khẩu.');
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

      if (newPassword.trim() === currentPassword.trim()) {
        setError('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Nếu có đổi mật khẩu, gửi request đến API đổi mật khẩu và lưu vào CSDL
      if (isChangingPassword) {
        const passRes = await fetch(`/api/users/${user.id}/change-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requesterId: user.id,
            currentPassword: currentPassword.trim(),
            newPassword: newPassword.trim()
          })
        });

        const passData = await passRes.json();
        if (!passRes.ok || !passData.success) {
          setError(passData.error || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.');
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Cập nhật họ tên và số điện thoại vào Database CSDL
      const profileRes = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: user.id,
          full_name: fullName.trim(),
          phone: phone.trim()
        })
      });

      const profileData = await profileRes.json();
      if (!profileRes.ok || !profileData.success) {
        setError(profileData.error || 'Cập nhật thông tin tài khoản thất bại.');
        setIsSubmitting(false);
        return;
      }

      // 3. Cập nhật state cục bộ và localStorage
      const updatedUser: UserProfile = {
        ...user,
        fullName: fullName.trim(),
        phone: phone.trim(),
        updated_at: new Date().toISOString()
      };

      updateUserProfile(user.id, {
        fullName: fullName.trim(),
        phone: phone.trim()
      });

      onUpdated(updatedUser);

      setSuccessMsg(
        isChangingPassword
          ? 'Đã cập nhật thông tin và đổi mật khẩu thành công vào CSDL!'
          : 'Cập nhật thông tin cá nhân vào CSDL thành công!'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onClose();
      }, 1300);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ cá nhân.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleTitle = (role: string) => {
    const r = (role || '').toUpperCase();
    switch (r) {
      case 'ADMIN':
        return 'Quản trị viên hệ thống (Super Admin)';
      case 'MANAGER':
        return 'Trưởng Ban / Quản Lý Tuyển Sinh (Manager)';
      case 'STAFF_ADMISSIONS':
      case 'COUNSELOR':
      case 'VERIFIER':
      case 'STAFF':
        return 'Chuyên Viên Tư Vấn Tuyển Sinh (Admissions Staff)';
      case 'STAFF_MARKETING':
      case 'MARKETER':
        return 'Chuyên Viên Marketing & Truyền Thông (Marketing Staff)';
      default:
        return role;
    }
  };

  const getRoleBadge = (role: string) => {
    const r = (role || '').toUpperCase();
    switch (r) {
      case 'ADMIN':
        return { label: 'ADMIN', color: 'bg-purple-500/30 text-purple-200 border-purple-400/30' };
      case 'MANAGER':
        return { label: 'MANAGER', color: 'bg-indigo-500/30 text-indigo-200 border-indigo-400/30' };
      case 'STAFF_ADMISSIONS':
        return { label: 'TUYỂN SINH', color: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/30' };
      case 'STAFF_MARKETING':
        return { label: 'MARKETING', color: 'bg-amber-500/30 text-amber-200 border-amber-400/30' };
      default:
        return { label: role.toUpperCase(), color: 'bg-blue-500/30 text-blue-200 border-blue-400/30' };
    }
  };

  const badge = getRoleBadge(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-black text-amber-300 shadow-inner">
              {fullName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-[11px] text-slate-300">Hồ sơ cá nhân & Bảo mật</span>
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
              <span className="font-semibold text-slate-800 text-right">{user.department || 'Đại học Duy Tân - VN-US'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tên đăng nhập / Email:</span>
              <span className="font-semibold text-slate-800 font-mono">{user.email}</span>
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
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Để bảo mật tài khoản cá nhân, vui lòng nhập mật khẩu hiện tại để xác thực khi thiết lập mật khẩu mới.
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
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
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
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang lưu vào CSDL...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
