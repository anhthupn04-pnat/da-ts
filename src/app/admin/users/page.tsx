'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, getSafeCurrentUser } from '@/data/storage';
import { UserProfile } from '@/types';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Edit3,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  Calendar,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Save,
  AlertTriangle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface DbUserItem {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  phone?: string | null;
  department?: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getSafeCurrentUser());
  const [users, setUsers] = useState<DbUserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STAFF'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Target user for action
  const [selectedUser, setSelectedUser] = useState<DbUserItem | null>(null);

  // Form states for creation
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState('Tổ Tư Vấn Tuyển Sinh VN-US');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Form states for editing
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Form states for reset password
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetSuccessPassword, setResetSuccessPassword] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [submittingReset, setSubmittingReset] = useState(false);

  // Action status loading
  const [actionLoading, setActionLoading] = useState(false);

  // Toast message
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Debounce search query 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load current user from storage
  useEffect(() => {
    const user = getCurrentUser() || getSafeCurrentUser();
    setCurrentUser(user);
  }, []);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';

  // Fetch users list from Database API with Server-side Pagination & Filtering
  const fetchUsersFromDb = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        search: debouncedSearch,
        role: roleFilter,
        status: statusFilter,
        requesterId: currentUser?.id || ''
      });

      const res = await fetch(`/api/users?${queryParams.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setUsers(data.users || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        showToast('error', data.error || 'Không thể tải danh sách tài khoản từ CSDL.');
      }
    } catch {
      showToast('error', 'Lỗi kết nối máy chủ cơ sở dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, roleFilter, statusFilter, currentUser?.id]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsersFromDb();
    }
  }, [fetchUsersFromDb, isAdmin]);

  // Format date helper: DD/MM/YYYY HH:mm
  const formatDateTime = (isoStr?: string) => {
    if (!isoStr) return '--';
    try {
      const d = new Date(isoStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return isoStr;
    }
  };

  // Sinh mật khẩu ngẫu nhiên mạnh (10-12 ký tự: chữ hoa, chữ thường, số, ký tự đặc biệt)
  const generateStrongPassword = () => {
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const specials = '!@#$%^&*';
    const all = uppers + lowers + numbers + specials;

    let pass = '';
    pass += uppers[Math.floor(Math.random() * uppers.length)];
    pass += lowers[Math.floor(Math.random() * lowers.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    pass += specials[Math.floor(Math.random() * specials.length)];

    for (let i = 0; i < 7; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }
    // Trộn ngẫu nhiên
    return pass.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const handleCreateRandomPassword = () => {
    const pass = generateStrongPassword();
    setNewPassword(pass);
    setShowNewPassword(true);
  };

  const handleResetRandomPassword = () => {
    const pass = generateStrongPassword();
    setResetPasswordInput(pass);
    setShowResetPassword(true);
  };

  // 1. Submit tạo tài khoản mới lưu trực tiếp vào CSDL
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('error', 'Chỉ Quản trị viên (Admin) mới có quyền tạo tài khoản.');
      return;
    }

    if (!newFullName.trim() || !newEmail.trim() || !newPassword.trim()) {
      showToast('error', 'Vui lòng nhập đầy đủ Họ và tên, Email và Mật khẩu khởi tạo.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      showToast('error', 'Địa chỉ Email không đúng định dạng tiêu chuẩn.');
      return;
    }

    if (newPassword.trim().length < 8) {
      showToast('error', 'Mật khẩu khởi tạo phải có tối thiểu 8 ký tự.');
      return;
    }

    setSubmittingCreate(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: currentUser.id,
          full_name: newFullName.trim(),
          email: newEmail.trim().toLowerCase(),
          username: newUsername.trim() || newEmail.trim().split('@')[0],
          password: newPassword.trim(),
          role: newRole,
          phone: newPhone.trim(),
          department: newDepartment.trim()
        })
      });

      const res = await response.json();
      if (response.ok && res.success) {
        showToast('success', res.message || 'Tạo tài khoản và lưu CSDL thành công!');
        setCreateModalOpen(false);
        // Reset form
        setNewFullName('');
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('STAFF');
        setNewPhone('');
        fetchUsersFromDb();
      } else {
        showToast('error', res.error || 'Không thể tạo tài khoản người dùng.');
      }
    } catch {
      showToast('error', 'Lỗi kết nối máy chủ khi lưu tài khoản.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Mở modal chỉnh sửa
  const openEditModal = (user: DbUserItem) => {
    setSelectedUser(user);
    setEditFullName(user.full_name);
    setEditRole(user.role);
    setEditPhone(user.phone || '');
    setEditDepartment(user.department || '');
    setEditModalOpen(true);
  };

  // 2. Submit cập nhật thông tin người dùng vào CSDL
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!editFullName.trim()) {
      showToast('error', 'Họ và tên không được để trống.');
      return;
    }

    setSubmittingEdit(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: currentUser.id,
          full_name: editFullName.trim(),
          role: editRole,
          phone: editPhone.trim(),
          department: editDepartment.trim()
        })
      });

      const res = await response.json();
      if (response.ok && res.success) {
        showToast('success', res.message || 'Cập nhật tài khoản trong CSDL thành công!');
        setEditModalOpen(false);
        fetchUsersFromDb();
      } else {
        showToast('error', res.error || 'Không thể cập nhật tài khoản.');
      }
    } catch {
      showToast('error', 'Lỗi kết nối khi cập nhật tài khoản.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Mở modal đặt lại mật khẩu
  const openResetModal = (user: DbUserItem) => {
    setSelectedUser(user);
    setResetPasswordInput(generateStrongPassword());
    setShowResetPassword(true);
    setResetSuccessPassword(null);
    setCopiedPassword(false);
    setResetModalOpen(true);
  };

  // 3. Submit đặt lại mật khẩu và mã hóa lưu vào CSDL
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (resetPasswordInput.trim().length < 8) {
      showToast('error', 'Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    setSubmittingReset(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: currentUser.id,
          newPassword: resetPasswordInput.trim()
        })
      });

      const res = await response.json();
      if (response.ok && res.success) {
        setResetSuccessPassword(res.newPassword);
        showToast('success', 'Đã đặt lại mật khẩu và mã hóa lưu vào Database thành công!');
      } else {
        showToast('error', res.error || 'Không thể đặt lại mật khẩu.');
      }
    } catch {
      showToast('error', 'Lỗi kết nối khi đặt lại mật khẩu.');
    } finally {
      setSubmittingReset(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    showToast('success', 'Đã sao chép mật khẩu mới vào bộ nhớ tạm!');
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  // Mở modal xác nhận đổi trạng thái khóa/mở
  const openStatusConfirmModal = (user: DbUserItem) => {
    if (user.id === currentUser.id) {
      showToast('error', 'Bảo mật: Bạn không thể tự khóa tài khoản của chính mình!');
      return;
    }
    setSelectedUser(user);
    setStatusConfirmOpen(true);
  };

  // 4. Submit đổi trạng thái Khóa / Kích hoạt trong CSDL
  const handleStatusToggle = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const newStatus = selectedUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const response = await fetch(`/api/users/${selectedUser.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: currentUser.id,
          status: newStatus
        })
      });

      const res = await response.json();
      if (response.ok && res.success) {
        showToast('success', res.message || 'Đã cập nhật trạng thái trong CSDL thành công!');
        setStatusConfirmOpen(false);
        fetchUsersFromDb();
      } else {
        showToast('error', res.error || 'Không thể cập nhật trạng thái tài khoản.');
      }
    } catch {
      showToast('error', 'Lỗi kết nối máy chủ.');
    } finally {
      setActionLoading(false);
    }
  };

  // Mở modal xác nhận xóa
  const openDeleteConfirmModal = (user: DbUserItem) => {
    if (user.id === currentUser.id) {
      showToast('error', 'Bảo mật: Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }
    setSelectedUser(user);
    setDeleteConfirmOpen(true);
  };

  // 5. Submit xóa tài khoản khỏi CSDL
  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}?requesterId=${currentUser.id}`, {
        method: 'DELETE'
      });

      const res = await response.json();
      if (response.ok && res.success) {
        showToast('success', res.message || 'Đã xóa tài khoản khỏi cơ sở dữ liệu thành công!');
        setDeleteConfirmOpen(false);
        fetchUsersFromDb();
      } else {
        showToast('error', res.error || 'Không thể xóa tài khoản.');
      }
    } catch {
      showToast('error', 'Lỗi kết nối khi xóa tài khoản.');
    } finally {
      setActionLoading(false);
    }
  };

  // Chặn người dùng không có quyền Admin
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">403 Forbidden - Quyền Truy Cập Bị Từ Chối</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Phân hệ Quản trị Người dùng & Phân quyền nội bộ chỉ dành riêng cho tài khoản có vai trò <strong>Quản trị viên (ADMIN)</strong>. Tài khoản của bạn hiện là <strong>{(currentUser as any)?.role || 'STAFF'}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold text-white transition-all animate-bounce ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Shield className="w-3.5 h-3.5" />
              <span>Đồng Bộ Cơ Sở Dữ Liệu Bền Vững & Phân Quyền RBAC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Quản Trị Người Dùng & Phân Quyền Nội Bộ
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Mọi tác vụ thêm, sửa, đổi vai trò, khóa và xóa tài khoản đều được đồng bộ trực tiếp xuống Database với ràng buộc Unique, Hash mật khẩu Bcrypt và Database Transactions.
            </p>
          </div>

          <button
            onClick={() => {
              setNewFullName('');
              setNewUsername('');
              setNewEmail('');
              setNewPassword('');
              setNewRole('STAFF');
              setNewPhone('');
              setCreateModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Thêm Tài Khoản Mới</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, email, tên đăng nhập, SĐT..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns & Refresh */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold hidden sm:inline">Vai trò:</span>
            <select
              value={roleFilter}
              onChange={e => {
                setRoleFilter(e.target.value as any);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị viên (ADMIN)</option>
              <option value="STAFF">Chuyên viên (STAFF)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold hidden sm:inline">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as any);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động (ACTIVE)</option>
              <option value="INACTIVE">Bị khóa (INACTIVE)</option>
            </select>
          </div>

          {/* Records per page */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold hidden sm:inline">Hiển thị:</span>
            <select
              value={pagination.limit}
              onChange={e => {
                setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }));
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchUsersFromDb()}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition border border-slate-200"
            title="Làm mới danh sách từ CSDL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Họ và Tên</th>
                <th className="py-3.5 px-4">Tài Khoản / Email</th>
                <th className="py-3.5 px-4">Vai Trò</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Ngày Tạo</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              
              {/* Skeleton Loading State */}
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200"></div>
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 bg-slate-200 rounded"></div>
                          <div className="h-2.5 w-20 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="h-3 w-36 bg-slate-200 rounded"></div>
                        <div className="h-2.5 w-24 bg-slate-100 rounded"></div>
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-200 rounded-full"></div></td>
                    <td className="py-4 px-4"><div className="h-5 w-16 bg-slate-200 rounded-full"></div></td>
                    <td className="py-4 px-4"><div className="h-3 w-24 bg-slate-200 rounded"></div></td>
                    <td className="py-4 px-4 sm:px-6 text-right"><div className="h-8 w-24 bg-slate-200 rounded-xl ml-auto"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-1" />
                    <p className="font-semibold text-slate-600">Không tìm thấy tài khoản người dùng phù hợp.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc.</p>
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const isUserAdminRole = u.role === 'ADMIN';
                  const isUserActive = u.status === 'ACTIVE';
                  const isSelf = u.id === currentUser.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Full Name & Department */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isUserAdminRole
                                ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-200'
                                : 'bg-blue-100 text-blue-700 ring-2 ring-blue-200'
                            }`}
                          >
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                              <span>{u.full_name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  Bạn
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {u.department || 'Tổ Tư Vấn Tuyển Sinh'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email & Username */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{u.email}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            @{u.username || u.email.split('@')[0]}
                          </p>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {isUserAdminRole ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-xs">
                            <Shield className="w-3 h-3" />
                            Quản Trị Viên (ADMIN)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                            <UserCheck className="w-3 h-3" />
                            Chuyên Viên (STAFF)
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isUserActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Bị khóa
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDateTime(u.created_at)}</span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => openResetModal(u)}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Đặt lại mật khẩu"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Lock / Unlock Toggle Button */}
                          <button
                            onClick={() => openStatusConfirmModal(u)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg transition ${
                              isSelf
                                ? 'text-slate-300 cursor-not-allowed'
                                : isUserActive
                                ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={isSelf ? 'Không thể tự khóa chính mình' : isUserActive ? 'Khóa tài khoản này' : 'Mở khóa tài khoản này'}
                          >
                            {isUserActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteConfirmModal(u)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg transition ${
                              isSelf
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={isSelf ? 'Không thể tự xóa chính mình' : 'Xóa tài khoản khỏi Database'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Controls */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Hiển thị <strong>{users.length}</strong> / <strong>{pagination.total}</strong> tài khoản trong cơ sở dữ liệu (Trang {pagination.page} / {pagination.totalPages})
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (pagination.totalPages > 5 && pagination.page > 3) {
                pageNum = pagination.page - 3 + i;
                if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - (4 - i);
              }
              if (pageNum < 1) pageNum = 1;

              return (
                <button
                  key={pageNum}
                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                    pagination.page === pageNum
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 1. MODAL TẠO TÀI KHOẢN MỚI */}
      {/* ============================================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Thêm Tài Khoản Người Dùng</h3>
                  <p className="text-[11px] text-slate-400">Mã hóa mật khẩu Bcrypt và lưu trực tiếp vào CSDL</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              
              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và Tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>

              {/* Email & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Công Vụ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ten.cb@vnus.edu.vn"
                    value={newEmail}
                    onChange={e => {
                      setNewEmail(e.target.value);
                      if (!newUsername && e.target.value.includes('@')) {
                        setNewUsername(e.target.value.split('@')[0]);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên Đăng Nhập (Username)
                  </label>
                  <input
                    type="text"
                    placeholder="nguyenvanan"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Role Select */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vai Trò Trong Hệ Thống <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                      newRole === 'STAFF'
                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="STAFF"
                      checked={newRole === 'STAFF'}
                      onChange={() => setNewRole('STAFF')}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="text-xs">Chuyên Viên (STAFF)</p>
                      <p className="text-[10px] text-slate-400 font-normal">Xử lý hồ sơ, tư vấn</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                      newRole === 'ADMIN'
                        ? 'border-purple-500 bg-purple-50/50 text-purple-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={newRole === 'ADMIN'}
                      onChange={() => setNewRole('ADMIN')}
                      className="text-purple-600"
                    />
                    <div>
                      <p className="text-xs">Quản Trị Viên (ADMIN)</p>
                      <p className="text-[10px] text-slate-400 font-normal">Toàn quyền hệ thống</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Phone & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="tel"
                    placeholder="0905xxxxxx"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phòng Ban / Đơn Vị</label>
                  <input
                    type="text"
                    placeholder="Tổ Tư Vấn Tuyển Sinh"
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Initial Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Mật Khẩu Khởi Tạo <span className="text-rose-500">* (Tối thiểu 8 ký tự)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCreateRandomPassword}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Tạo Mật Khẩu Ngẫu Nhiên</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu an toàn..."
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50"
                >
                  {submittingCreate ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang Ghi Vào CSDL...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu Tài Khoản Vào DB</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 2. MODAL CHỈNH SỬA THÔNG TIN TÀI KHOẢN */}
      {/* ============================================================================== */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Chỉnh Sửa Thông Tin Tài Khoản</h3>
                  <p className="text-[11px] text-slate-400">Cập nhật trực tiếp xuống Database</p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              
              {/* Email (Readonly to preserve identity) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Định Danh (Không thay đổi)
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedUser.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và Tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vai Trò Trong Hệ Thống
                </label>
                {selectedUser.id === currentUser.id ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Bạn đang chỉnh sửa chính mình: Không thể tự hạ quyền Admin theo chính sách bảo mật RBAC.</span>
                  </div>
                ) : (
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-semibold"
                  >
                    <option value="STAFF">Chuyên Viên Tuyển Sinh (STAFF)</option>
                    <option value="ADMIN">Quản Trị Viên Hệ Thống (ADMIN)</option>
                  </select>
                )}
              </div>

              {/* Phone & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phòng Ban / Bộ Phận</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={e => setEditDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50"
                >
                  {submittingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang Cập Nhật DB...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu Thay Đổi Vào DB</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 3. MODAL ĐẶT LẠI MẬT KHẨU (RESET PASSWORD) */}
      {/* ============================================================================== */}
      {resetModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Đặt Lại Mật Khẩu</h3>
                  <p className="text-[11px] text-slate-400">Tài khoản: {selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSuccessPassword ? (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mật khẩu mới đã được cập nhật vào Database!</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Vui lòng sao chép và gửi mật khẩu này cho cán bộ tuyển sinh để đăng nhập:
                  </p>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-300 font-mono text-sm font-bold text-slate-900 mt-2">
                    <span>{resetSuccessPassword}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(resetSuccessPassword)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs flex items-center gap-1 transition"
                    >
                      {copiedPassword ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPassword ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalOpen(false);
                      setResetSuccessPassword(null);
                      fetchUsersFromDb();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold transition"
                  >
                    Đóng Hộp Thoại
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700">Mật Khẩu Mới (Tối thiểu 8 ký tự)</label>
                    <button
                      type="button"
                      onClick={handleResetRandomPassword}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Sinh Ngẫu Nhiên</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu mới..."
                      value={resetPasswordInput}
                      onChange={e => setResetPasswordInput(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReset}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50"
                  >
                    {submittingReset ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang Hash & Lưu...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Xác Nhận Đổi Mật Khẩu</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 4. MODAL XÁC NHẬN KHÓA / MỞ KHÓA TÀI KHOẢN */}
      {/* ============================================================================== */}
      {statusConfirmOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5 text-center">
            
            <div
              className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${
                selectedUser.status === 'ACTIVE' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {selectedUser.status === 'ACTIVE' ? <Lock className="w-7 h-7" /> : <Unlock className="w-7 h-7" />}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                {selectedUser.status === 'ACTIVE' ? 'Tạm Khóa Tài Khoản?' : 'Mở Khóa Tài Khoản?'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bạn có chắc chắn muốn {selectedUser.status === 'ACTIVE' ? 'tạm khóa' : 'kích hoạt lại'} quyền truy cập của cán bộ <strong>{selectedUser.full_name}</strong> ({selectedUser.email})?
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusConfirmOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleStatusToggle}
                disabled={actionLoading}
                className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-md transition flex items-center gap-2 ${
                  selectedUser.status === 'ACTIVE'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{selectedUser.status === 'ACTIVE' ? 'Khóa Ngay' : 'Kích Hoạt Lại'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 5. MODAL XÁC NHẬN XÓA TÀI KHOẢN (CONFIRM DIALOG) */}
      {/* ============================================================================== */}
      {deleteConfirmOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-200 relative space-y-5 text-center">
            
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-rose-950">Xác Nhận Xóa Tài Khoản</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hành động này sẽ xóa tài khoản của <strong>{selectedUser.full_name}</strong> ({selectedUser.email}) khỏi hệ thống và lưu vết toàn vẹn dữ liệu. Thao tác không thể hoàn tác!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 text-left space-y-1">
              <p className="font-semibold text-slate-700">• ID: {selectedUser.id}</p>
              <p>• Vai trò: {selectedUser.role === 'ADMIN' ? 'Quản Trị Viên' : 'Chuyên Viên Tuyển Sinh'}</p>
              <p>• Trạng thái hiện tại: {selectedUser.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đang bị khóa'}</p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md transition flex items-center gap-2"
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Xác Nhận Xóa Vĩnh Viễn</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
