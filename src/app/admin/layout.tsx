'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import UserProfileModal from '@/components/UserProfileModal';
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
  CalendarCheck,
  User,
  KeyRound,
  Edit3
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    setAuthChecking(false);

    const handleAuthChange = () => {
      const updated = getCurrentUser();
      if (!updated) {
        router.push('/login');
      } else {
        setCurrentUser(updated);
      }
    };

    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, [router]);

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

  // Kiểm tra phân quyền trang hiện tại (Route Guard)
  const currentNavRule = allNavigation.find(item => item.href === pathname);
  const isAuthorized = !currentNavRule || (currentUser && currentNavRule.roles.includes(currentUser.role));

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

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="p-3 bg-white rounded-2xl shadow-xl">
          <img src="/logo.png" alt="VN-US Logo" className="h-12 w-auto object-contain animate-pulse" />
        </div>
        <p className="text-xs text-slate-400 font-medium tracking-wide">Đang xác thực phiên làm việc nội bộ...</p>
      </div>
    );
  }

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
              <div className="p-1 bg-white rounded-xl shadow-xs flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="VN-US Duy Tan"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
                  Cổng CRM Tuyển Sinh
                </span>
                <span className="text-xs font-bold text-slate-200">
                  VN-US • ĐH Duy Tân
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
              
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="mt-2.5 w-full py-1.5 px-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border border-slate-600/50 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Hồ Sơ Cá Nhân & Đổi Mật Khẩu</span>
              </button>

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
            <span className="font-mono text-slate-400">VNUS-CRM</span>
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

          <div className="flex items-center gap-2.5">
            {currentUser && (
              <>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 transition cursor-pointer border border-slate-200"
                  title="Xem và chỉnh sửa thông tin cá nhân / Đổi mật khẩu"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.fullName.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                      <span>{currentUser.fullName}</span>
                      <Edit3 className="w-3 h-3 text-slate-400" />
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">{currentUser.role.toUpperCase()}</p>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-8">
          {!isAuthorized ? (
            <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Quyền Truy Cập Bị Giới Hạn</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tài khoản của bạn thuộc vai trò <strong>{currentUser?.role}</strong> và không có thẩm quyền truy cập phân hệ <strong>{currentNavRule?.name}</strong> theo chính sách bảo mật RBAC.
              </p>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-950 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay Lại Bảng Điều Khiển Của Bạn</span>
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>

      </div>

      {/* Self-Profile Management Modal */}
      {currentUser && (
        <UserProfileModal
          user={currentUser}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdated={updated => setCurrentUser(updated)}
        />
      )}

    </div>
  );
}
