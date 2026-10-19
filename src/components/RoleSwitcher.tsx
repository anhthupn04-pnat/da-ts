'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, Role } from '@/types';
import { getCurrentUser, switchRole } from '@/data/storage';
import { Shield, UserCheck, Megaphone, Users, ChevronDown, Check, FileCheck } from 'lucide-react';

interface RoleSwitcherProps {
  onRoleChanged?: (user: UserProfile) => void;
}

export default function RoleSwitcher({ onRoleChanged }: RoleSwitcherProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const rolesConfig: { role: Role; label: string; title: string; icon: React.ReactNode; color: string }[] = [
    {
      role: 'admin',
      label: 'Super Admin',
      title: 'ThS. Nguyễn Văn Hải (Ban Giám Đốc)',
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-800 border-purple-300'
    },
    {
      role: 'manager',
      label: 'Admissions Manager',
      title: 'TS. Đặng Thanh Bình (Trưởng Ban Tuyển Sinh)',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    {
      role: 'counselor',
      label: 'Admissions Officer',
      title: 'Trần Thị Mai Lan (Chuyên viên tư vấn trực tiếp)',
      icon: <UserCheck className="w-4 h-4" />,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    {
      role: 'verifier',
      label: 'Document Verification Officer',
      title: 'ThS. Hoàng Thị Bích Ngọc (Hậu kiểm học bạ & CCCD)',
      icon: <FileCheck className="w-4 h-4" />,
      color: 'bg-teal-100 text-teal-800 border-teal-300'
    },
    {
      role: 'marketer',
      label: 'Marketing & Data Collector',
      title: 'Phạm Minh Phương (Truyền thông số & Thu thập Lead)',
      icon: <Megaphone className="w-4 h-4" />,
      color: 'bg-amber-100 text-amber-800 border-amber-300'
    }
  ];

  const handleSelectRole = (role: Role) => {
    const user = switchRole(role);
    setCurrentUser(user);
    setIsOpen(false);
    if (onRoleChanged) onRoleChanged(user);
  };

  if (!currentUser) return null;

  const currentConfig = rolesConfig.find(r => r.role === currentUser.role) || rolesConfig[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition cursor-pointer text-xs"
        title="Chuyển đổi vai trò cán bộ để kiểm thử phân quyền RBAC & Data Scope"
      >
        <span className={`p-1 rounded-md ${currentConfig.color}`}>
          {currentConfig.icon}
        </span>
        <div className="text-left hidden sm:block">
          <span className="block font-bold text-slate-800 leading-tight">
            {currentUser.fullName}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            Vai trò: <strong className="text-blue-700">{currentConfig.label}</strong>
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-2 animate-fade-in">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Mô hình Phân quyền RBAC (5 Nhóm Quyền Cốt Lõi)
            </span>
            <p className="text-xs text-slate-600 mt-0.5">
              Chọn vai trò để kiểm thử phân định phạm vi dữ liệu (Row-Level Security) & giao diện tác nghiệp.
            </p>
          </div>

          <div className="space-y-1">
            {rolesConfig.map(r => {
              const isSelected = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => handleSelectRole(r.role)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition cursor-pointer ${
                    isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`p-1.5 rounded-lg border ${r.color}`}>
                      {r.icon}
                    </span>
                    <div>
                      <span className="block font-bold text-slate-900">{r.label}</span>
                      <span className="text-[11px] text-slate-500 leading-tight block">{r.title}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs px-2">
            <a
              href="/login"
              className="text-blue-700 hover:underline font-bold flex items-center gap-1"
            >
              <span>Cổng Đăng Nhập Cán Bộ</span>
            </a>
            <span className="text-[10px] text-slate-400">Hệ Thống CRM VN-US</span>
          </div>
        </div>
      )}
    </div>
  );
}
