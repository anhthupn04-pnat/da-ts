'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import RoleSwitcher from '@/components/RoleSwitcher';
import { getCurrentUser, logoutUser } from '@/data/storage';
import { UserProfile } from '@/types';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Megaphone,
  Bot,
  BarChart3,
  Settings,
  ArrowLeft,
  GraduationCap,
  Menu,
  X,
  Shield,
  LogOut,
  FileCheck,
  Search,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const loadUser = () => {
    setCurrentUser(getCurrentUser());
  };

  useEffect(() => {
    loadUser();

    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  // Định nghĩa đầy đủ menu phân quyền cho 5 vai trò
  const allNavigation = [
    {
      name: 'Bảng Điều Khiển & Nhắc Việc',
      href: '/admin',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'counselor', 'marketer', 'verifier']
    },
    {
      name: 'Quản Lý Thí Sinh & Đường Ống',
      href: '/admin/leads',
      icon: Users,
      roles: ['admin', 'manager', 'counselor']
    },
    {
      name: 'Hậu Kiểm & Thẩm Định Điểm',
      href: '/admin/verification',
      icon: FileCheck,
      roles: ['admin', 'manager', 'verifier']
    },
    {
      name: 'Chương Trình & Chỉ Tiêu',
      href: '/admin/programs',
      icon: BookOpen,
      roles: ['admin', 'manager', 'counselor']
    },
    {
      name: 'Marketing & Lịch Nội Dung',
      href: '/admin/marketing',
      icon: Megaphone,
      roles: ['admin', 'manager', 'marketer']
    },
    {
      name: 'Trợ Lý AI Tuyển Sinh',
      href: '/admin/ai-assistant',
      icon: Bot,
      roles: ['admin', 'manager', 'marketer', 'counselor']
    },
    {
      name: 'Báo Cáo Phễu & Hiệu Suất KPI',
      href: '/admin/reports',
      icon: BarChart3,
      roles: ['admin', 'manager', 'counselor', 'marketer', 'verifier']
    },
    {
      name: 'Cấu Hình RBAC & Audit Logs',
      href: '/admin/settings',
      icon: Settings,
      roles: ['admin', 'manager']
    }
  ];

  // Lọc navigation theo role người dùng hiện tại
  const userRole = currentUser?.role || 'admin';
  const navigation = allNavigation.filter(item => item.roles.includes(userRole));

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/60 text-purple-300 border border-purple-700/50">Super Admin</span>;
      case 'manager':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">Admissions Manager</span>;
      case 'counselor':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">Admissions Officer</span>;
      case 'verifier':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-900/60 text-teal-300 border border-teal-700/50">Verification Officer</span>;
      case 'marketer':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700/50">Marketing Officer</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="h-20 px-6 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Admissions CRM & Portal
                </span>
                <span className="text-sm font-extrabold text-white">
                  VN-US Duy Tân
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Department Card */}
          {currentUser && (
            <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Cán Bộ Tác Nghiệp
                </span>
                {getRoleBadge(currentUser.role)}
              </div>
              <h4 className="text-xs font-bold text-white truncate">
                {currentUser.fullName}
              </h4>
              <p className="text-[11px] text-blue-300 truncate mt-0.5">
                {currentUser.department}
              </p>
              {currentUser.role === 'counselor' && (
                <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-emerald-400 font-medium">
                  <span>Phạm vi: {currentUser.assignedRegion || 'Được phân công'}</span>
                  <span>Chỉ tiêu: {currentUser.targetQuota || 80}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navigation.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/tra-cuu"
            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-950/30 rounded-xl transition"
          >
            <Search className="w-4 h-4" />
            <span>Cổng Tra Cứu Trực Tuyến</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Trang Chủ Tuyển Sinh</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đổi Tài Khoản / Đăng Xuất</span>
          </button>

          <div className="px-3.5 py-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" />
              RBAC & Database v2.0
            </span>
            <span className="font-mono text-slate-400">VNUS-K32</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                Hệ Thống Website & Quản Trị Tuyển Sinh Số Hóa Toàn Diện
              </h2>
              {currentUser && (
                <div className="flex items-center gap-2 text-[11px] text-slate-500 hidden sm:flex">
                  <span>{currentUser.department}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-blue-600 font-medium">Bảo mật cấp độ Database & Audit Trail</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RoleSwitcher />
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}
