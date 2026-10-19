'use client';

import React, { useState, useEffect } from 'react';
import {
  getStaffList,
  getCurrentUser,
  getSafeCurrentUser,
  isUserAdmin,
  createStaffAccount,
  updateUserByAdmin,
  toggleStaffStatus,
  resetUserPassword,
  deleteStaffAccount
} from '@/data/storage';
import { UserProfile, Role } from '@/types';
import {
  Users,
  UserCheck,
  Shield,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  Key,
  Lock,
  Unlock,
  Trash2,
  Edit3,
  CheckCircle2,
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
  AlertTriangle
} from 'lucide-react';

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getSafeCurrentUser());
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STAFF'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Target user for action
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Form states for creation
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState('Tổ Tư Vấn Tuyển Sinh VN-US');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states for editing
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

  // Password reset result
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // Toast message
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadUsers = () => {
    const current = getCurrentUser() || getSafeCurrentUser();
    setCurrentUser(current);
    setUsers(getStaffList());
  };

  useEffect(() => {
    loadUsers();
    const handleChanged = () => loadUsers();
    window.addEventListener('staff-changed', handleChanged);
    return () => window.removeEventListener('staff-changed', handleChanged);
  }, []);

  const isAdmin = isUserAdmin(currentUser);

  // Sinh mật khẩu ngẫu nhiên an toàn
  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let pass = 'VNUS@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setShowNewPassword(true);
  };

  // Submit tạo tài khoản mới
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('error', 'Chỉ Quản trị viên (Admin) mới có quyền tạo tài khoản.');
      return;
    }

    if (!newFullName.trim() || !newEmail.trim() || !newPassword.trim()) {
      showToast('error', 'Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu.');
      return;
    }

    if (newPassword.trim().length < 8) {
      showToast('error', 'Mật khẩu khởi tạo phải có tối thiểu 8 ký tự.');
      return;
    }

    const res = createStaffAccount(currentUser, {
      fullName: newFullName.trim(),
      username: newUsername.trim() || newEmail.trim().split('@')[0],
      email: newEmail.trim(),
      password: newPassword.trim(),
      role: newRole,
      phone: newPhone.trim(),
      department: newDepartment.trim()
    });

    if (res.success) {
      showToast('success', res.message || 'Cấp tài khoản mới thành công!');
      setCreateModalOpen(false);
      // Reset form
      setNewFullName('');
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('STAFF');
      setNewPhone('');
      loadUsers();
    } else {
      showToast('error', res.message || 'Không thể tạo tài khoản.');
    }
  };

  // Mở modal chỉnh sửa
  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setEditFullName(user.fullName);
    setEditUsername(user.username || user.email.split('@')[0]);
    setEditEmail(user.email);
    setEditRole(user.role === 'ADMIN' || user.role === 'admin' ? 'ADMIN' : 'STAFF');
    setEditPhone(user.phone || '');
    setEditDepartment(user.department || '');
    setEditModalOpen(true);
  };

  // Submit chỉnh sửa tài khoản
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !isAdmin) return;

    const res = updateUserByAdmin(currentUser, selectedUser.id, {
      fullName: editFullName.trim(),
      username: editUsername.trim(),
      email: editEmail.trim(),
      role: editRole,
      phone: editPhone.trim(),
      department: editDepartment.trim()
    });

    if (res.success) {
      showToast('success', res.message || 'Cập nhật tài khoản thành công!');
      setEditModalOpen(false);
      loadUsers();
    } else {
      showToast('error', res.message || 'Cập nhật thất bại.');
    }
  };

  // Đổi trạng thái kích hoạt / khóa
  const handleToggleStatus = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      showToast('error', 'Bảo mật: Bạn không thể tự khóa tài khoản của chính mình!');
      return;
    }

    const res = toggleStaffStatus(currentUser, user.id);
    if (res.success) {
      showToast('success', res.message || 'Đã thay đổi trạng thái tài khoản!');
      loadUsers();
    } else {
      showToast('error', res.message || 'Thao tác thất bại.');
    }
  };

  // Mở modal xác nhận reset mật khẩu
  const openResetPasswordModal = (user: UserProfile) => {
    setSelectedUser(user);
    setGeneratedPassword(null);
    setResetModalOpen(true);
  };

  const handleExecuteResetPassword = () => {
    if (!selectedUser) return;
    const res = resetUserPassword(currentUser, selectedUser.id);
    if (res.success && res.newPassword) {
      setGeneratedPassword(res.newPassword);
      loadUsers();
      showToast('success', 'Đã đặt lại mật khẩu thành công!');
    } else {
      showToast('error', res.message || 'Đặt lại mật khẩu thất bại.');
    }
  };

  // Mở modal xác nhận xóa
  const openDeleteModal = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      showToast('error', 'Bảo mật: Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }
    setSelectedUser(user);
    setDeleteConfirmOpen(true);
  };

  const handleExecuteDelete = () => {
    if (!selectedUser) return;
    const res = deleteStaffAccount(currentUser, selectedUser.id);
    if (res.success) {
      showToast('success', res.message || 'Đã xóa tài khoản vĩnh viễn!');
      setDeleteConfirmOpen(false);
      loadUsers();
    } else {
      showToast('error', res.message || 'Không thể xóa tài khoản.');
    }
  };

  // Lọc danh sách người dùng
  const filteredUsers = users.filter(u => {
    // Tìm kiếm
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q));

    // Lọc role
    const isUserAdminRole = u.role === 'ADMIN' || u.role === 'admin';
    const matchRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'ADMIN' && isUserAdminRole) ||
      (roleFilter === 'STAFF' && !isUserAdminRole);

    // Lọc status
    const isUserActive = u.status === 'ACTIVE' || u.status === 'active' || !u.status;
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && isUserActive) ||
      (statusFilter === 'INACTIVE' && !isUserActive);

    return matchSearch && matchRole && matchStatus;
  });

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
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-800 bg-purple-100/70 px-2.5 py-0.5 rounded-full border border-purple-200">
              Quản Trị Người Dùng Nội Bộ (RBAC)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            Danh Sách & Phân Quyền Cán Bộ (Admin & Staff)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chỉ Quản trị viên tối cao mới có quyền cấp phát tài khoản, phân bổ vai trò và đặt lại mật khẩu cho chuyên viên.
          </p>
        </div>

        <button
          onClick={() => {
            handleGenerateRandomPassword();
            setCreateModalOpen(true);
          }}
          className="px-5 py-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-950 hover:to-slate-900 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cấp Tài Khoản Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, tên đăng nhập hoặc SĐT..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 font-semibold">Vai trò:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as any)}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị viên (ADMIN)</option>
              <option value="STAFF">Chuyên viên (STAFF)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 font-semibold">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động (Active)</option>
              <option value="INACTIVE">Đã khóa (Inactive)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Họ và Tên</th>
                <th className="p-4">Tên Đăng Nhập / Email</th>
                <th className="p-4">Vai Trò (Role)</th>
                <th className="p-4">Đơn Vị / Phòng Ban</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Ngày Khởi Tạo</th>
                <th className="p-4 text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Không tìm thấy tài khoản người dùng phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isUserAdminRole = user.role === 'ADMIN' || user.role === 'admin';
                  const isUserActive = user.status === 'ACTIVE' || user.status === 'active' || !user.status;
                  const isCurrentAccount = user.id === currentUser.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* Full Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.fullName}</span>
                              {isCurrentAccount && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-extrabold">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              <span>{user.phone || 'Chưa cập nhật'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Username / Email */}
                      <td className="p-4">
                        <div className="font-mono text-slate-900 font-bold">
                          {user.username || user.email.split('@')[0]}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        {isUserAdminRole ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-900 border border-purple-200">
                            <Shield className="w-3 h-3 text-purple-700" />
                            <span>ADMIN (Quản trị)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-900 border border-blue-200">
                            <UserCheck className="w-3 h-3 text-blue-700" />
                            <span>STAFF (Chuyên viên)</span>
                          </span>
                        )}
                      </td>

                      {/* Department */}
                      <td className="p-4">
                        <div className="text-slate-700 font-medium">
                          {user.department || 'Trung tâm Tuyển sinh VN-US'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        {isUserActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Hoạt động</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <Lock className="w-3 h-3" />
                            <span>Đã khóa</span>
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="p-4 text-center text-[11px] text-slate-500 font-mono">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'Mặc định'}
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Sửa thông tin */}
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-slate-500 hover:text-blue-900 rounded-xl hover:bg-blue-50 transition cursor-pointer"
                            title="Chỉnh sửa thông tin / Vai trò"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Reset mật khẩu */}
                          <button
                            onClick={() => openResetPasswordModal(user)}
                            className="p-2 text-slate-500 hover:text-amber-700 rounded-xl hover:bg-amber-50 transition cursor-pointer"
                            title="Đặt lại mật khẩu cho tài khoản"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {/* Khóa / Mở khóa (không cho tự khóa mình) */}
                          {!isCurrentAccount && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`p-2 rounded-xl transition cursor-pointer ${
                                  !isUserActive
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-amber-600 hover:bg-amber-50'
                                }`}
                                title={!isUserActive ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                              >
                                {!isUserActive ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </button>

                              {/* Xóa tài khoản */}
                              <button
                                onClick={() => openDeleteModal(user)}
                                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                                title="Xóa tài khoản vĩnh viễn"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: TẠO TÀI KHOẢN MỚI ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                  Cấp Quyền Nội Bộ
                </span>
                <h3 className="text-lg font-bold mt-0.5">Tạo Tài Khoản Cán Bộ Mới</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và Tên Cán Bộ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn An"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Công Vụ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => {
                      setNewEmail(e.target.value);
                      if (!newUsername) {
                        setNewUsername(e.target.value.split('@')[0]);
                      }
                    }}
                    placeholder="canbo@vnus.edu.vn"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên Đăng Nhập (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    placeholder="VD: canbo_ts"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 font-mono"
                  />
                </div>
              </div>

              {/* Password field with random generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Mật Khẩu Khởi Tạo (Tối thiểu 8 ký tự) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[11px] font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Tạo ngẫu nhiên</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu ban đầu..."
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 font-mono text-blue-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Vai Trò Phân Quyền <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="STAFF">Chuyên Viên (STAFF) - Xử lý hồ sơ</option>
                    <option value="ADMIN">Quản Trị Viên (ADMIN) - Toàn quyền</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="0905xxxxxx"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đơn Vị / Phòng Ban</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={e => setNewDepartment(e.target.value)}
                  placeholder="Bộ phận Tư vấn Tuyển sinh VN-US"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Cấp Tài Khoản</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CHỈNH SỬA TÀI KHOẢN ================= */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                  Cập Nhật Người Dùng
                </span>
                <h3 className="text-lg font-bold mt-0.5">{selectedUser.fullName}</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên Đăng Nhập</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vai Trò</label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
                  >
                    <option value="STAFF">Chuyên Viên (STAFF)</option>
                    <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phòng Ban</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={e => setEditDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: ĐẶT LẠI MẬT KHẨU ================= */}
      {resetModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Đặt Lại Mật Khẩu</h3>
                <p className="text-xs text-slate-500">Tài khoản: {selectedUser.fullName}</p>
              </div>
            </div>

            {!generatedPassword ? (
              <>
                <p className="text-slate-600 leading-relaxed">
                  Bạn có chắc chắn muốn đặt lại mật khẩu cho chuyên viên <strong>{selectedUser.fullName}</strong> ({selectedUser.email})? Hệ thống sẽ tạo một mật khẩu bảo mật ngẫu nhiên mới.
                </p>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleExecuteResetPassword}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm"
                  >
                    Xác Nhận Đặt Lại
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <p className="font-bold">Mật khẩu mới đã được khởi tạo thành công:</p>
                  <p className="mt-2 text-base font-mono font-black text-blue-900 p-2 bg-white rounded-xl border border-emerald-300 text-center select-all">
                    {generatedPassword}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Vui lòng bàn giao mật khẩu này cho cán bộ. Cán bộ có thể đổi lại mật khẩu cá nhân sau khi đăng nhập.
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setResetModalOpen(false)}
                    className="px-5 py-2 bg-blue-900 text-white font-bold rounded-xl"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 4: XÁC NHẬN XÓA TÀI KHOẢN ================= */}
      {deleteConfirmOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Xóa Tài Khoản</h3>
                <p className="text-xs text-slate-500">{selectedUser.fullName}</p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của cán bộ <strong>{selectedUser.fullName}</strong> ({selectedUser.email}) khỏi hệ thống? Mọi phân quyền sẽ bị thu hồi ngay lập tức và thao tác này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
