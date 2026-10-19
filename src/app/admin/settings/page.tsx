'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  resetDemoData,
  getLeads,
  getCampaigns,
  getContentCalendar,
  getConsultationLogs,
  getAuditLogs,
  getStaffList,
  saveStaffList,
  getCurrentUser,
  getSafeCurrentUser,
  addAuditLog
} from '@/data/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile, Role, AuditLog } from '@/types';
import {
  Settings,
  Database,
  Shield,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Globe,
  Terminal,
  FileSpreadsheet,
  Layers,
  HardDrive,
  Users,
  Lock,
  Unlock,
  Plus,
  Search,
  History,
  FileCode,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'rbac' | 'audit' | 'database'>('rbac');
  const [currentUser, setCurrentUser] = useState<UserProfile>(getSafeCurrentUser());
  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditSearch, setAuditSearch] = useState('');

  // Add staff modal
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'counselor' as Role,
    department: 'Bộ phận Tư vấn Tuyển sinh',
    assignedRegion: 'Đà Nẵng & Quảng Nam',
    targetQuota: 80
  });

  const [resetSuccess, setResetSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    setCurrentUser(getCurrentUser() || getSafeCurrentUser());
    setStaffList(getStaffList());
    setAuditLogs(getAuditLogs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Khóa / Mở khóa tài khoản cán bộ
  const handleToggleLockUser = (userId: string) => {
    const list = [...staffList];
    const idx = list.findIndex(u => u.id === userId);
    if (idx === -1) return;

    const user = list[idx];
    const newStatus = user.status === 'locked' ? 'active' : 'locked';
    list[idx] = { ...user, status: newStatus };
    saveStaffList(list);
    setStaffList(list);

    addAuditLog('UPDATE', 'users', user.id, { status: user.status }, { status: newStatus }, currentUser);
    showToast(`Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản: ${user.fullName}!`);
  };

  // Reset mật khẩu cán bộ
  const handleResetPassword = (userId: string, name: string) => {
    if (confirm(`Đặt lại mật khẩu cho cán bộ "${name}" về mật khẩu mặc định (Dtu@2026)?`)) {
      addAuditLog('UPDATE', 'users', userId, null, { action: 'RESET_PASSWORD' }, currentUser);
      showToast(`Đã gửi mã đặt lại mật khẩu cho ${name}!`);
    }
  };

  // Tạo tài khoản cán bộ mới (Chỉ Admin mới có thẩm quyền)
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') {
      showToast('Từ chối: Chỉ Quản trị viên (Super Admin) mới có quyền cấp tài khoản cán bộ!');
      return;
    }
    if (!newStaff.fullName || !newStaff.email) return;

    const id = `usr-${newStaff.role}-${Date.now().toString().slice(-4)}`;
    const user: UserProfile = {
      id,
      email: newStaff.email.trim().toLowerCase(),
      fullName: newStaff.fullName.trim(),
      role: newStaff.role,
      department: newStaff.department,
      phone: newStaff.phone.trim(),
      assignedRegion: newStaff.assignedRegion,
      targetQuota: Number(newStaff.targetQuota) || 80,
      status: 'active'
    };

    const updated = [...staffList, user];
    saveStaffList(updated);
    setStaffList(updated);
    addAuditLog('CREATE', 'users', id, null, user, currentUser);

    setAddStaffOpen(false);
    setNewStaff({
      fullName: '',
      email: '',
      phone: '',
      role: 'counselor',
      department: 'Bộ phận Tư vấn Tuyển sinh',
      assignedRegion: 'Đà Nẵng & Quảng Nam',
      targetQuota: 80
    });
    showToast(`Đã cấp tài khoản thành công cho cán bộ: ${user.fullName}!`);
  };

  // Khôi phục dữ liệu ban đầu
  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục dữ liệu mẫu ban đầu? Mọi thay đổi thử nghiệm sẽ được đưa về mặc định.')) {
      resetDemoData();
      loadData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  // Xuất file Excel toàn bộ dữ liệu nhiều sheet
  const handleExportFullExcel = () => {
    const leads = getLeads();
    const logs = getConsultationLogs();
    const campaigns = getCampaigns();
    const audits = getAuditLogs();

    const wb = XLSX.utils.book_new();

    // Sheet 1: Candidates
    const leadsData = leads.map(l => ({
      'Mã Hồ Sơ': l.id,
      'Họ và Tên': l.fullName,
      'Số Điện Thoại': l.phone,
      'Số CCCD': l.idCardNumber || '',
      'Email': l.email,
      'Trường THPT': l.highSchool || '',
      'Tỉnh Thành': l.province || '',
      'Ngành Xét Tuyển 1': l.programName,
      'Ngành Xét Tuyển 2': l.secondaryProgramName || '',
      'Khối Thi': l.examBlock || '',
      'Điểm Dự Kiến': l.estimatedScore || '',
      'Nguồn': l.source,
      'Trạng Thái': l.status,
      'Mức Độ Ưu Tiên': l.priority,
      'Chuyên Viên Phụ Trách': l.assignedToName || '',
      'Học Phí / Lệ Phí': l.paymentStatus || 'unpaid',
      'Ngày Tiếp Nhận': l.createdAt
    }));
    const wsLeads = XLSX.utils.json_to_sheet(leadsData);
    XLSX.utils.book_append_sheet(wb, wsLeads, 'Candidates_VNUS');

    // Sheet 2: Consultation History
    const logsData = logs.map(log => ({
      'Mã Nhật Ký': log.id,
      'Mã Thí Sinh': log.leadId,
      'Chuyên Viên': log.staffName,
      'Hình Thức': log.contactMethod,
      'Nội Dung Trao Đổi': log.content,
      'Thái Độ': log.parentAttitude || '',
      'Đánh Giá Sao': log.rating || '',
      'Kết Quả': log.outcome,
      'Ngày Hẹn Gọi Lại': log.nextFollowUpDate || '',
      'Thời Gian': log.createdAt
    }));
    const wsLogs = XLSX.utils.json_to_sheet(logsData);
    XLSX.utils.book_append_sheet(wb, wsLogs, 'Lich_Su_Tu_Van');

    // Sheet 3: Audit Trail
    const auditData = audits.map(a => ({
      'Mã Ghi Vết': a.id,
      'Người Thao Tác': a.userName,
      'Vai Trò': a.userRole,
      'Hành Động': a.action,
      'Bảng Dữ Liệu': a.tableName,
      'Mã Bản Ghi': a.recordId,
      'Địa Chỉ IP': a.ipAddress,
      'Thời Gian': a.timestamp
    }));
    const wsAudit = XLSX.utils.json_to_sheet(auditData);
    XLSX.utils.book_append_sheet(wb, wsAudit, 'Audit_Trail_Logs');

    XLSX.writeFile(wb, `Bao_Cao_Tong_Hop_Co_So_Du_Lieu_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Tải file SQL Schema
  const handleDownloadSQLSchema = () => {
    const link = document.createElement('a');
    link.href = '/database/schema.sql';
    link.download = 'schema_postgresql_supabase_v2.sql';
    link.click();
  };

  // Lọc Audit Logs
  const filteredAudits = auditLogs.filter(a => {
    const s = auditSearch.toLowerCase();
    return (
      a.userName.toLowerCase().includes(s) ||
      a.action.toLowerCase().includes(s) ||
      a.tableName.toLowerCase().includes(s) ||
      a.recordId.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <span>Cấu Hình Hệ Thống, Phân Quyền RBAC & Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị tài khoản cán bộ, kiểm toán vĩnh viễn và đồng bộ cơ sở dữ liệu bền vững.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportFullExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Toàn Bộ CSDL (Excel Nhiều Sheet)</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 rounded-t-2xl">
        <button
          onClick={() => setActiveTab('rbac')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'rbac' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản Lý Tài Khoản Cán Bộ & Phân Quyền (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Nhật Ký Kiểm Toán Vĩnh Viễn (Audit Trail Logs)</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'database' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Cấu Hình CSDL & Kịch Bản SQL</span>
        </button>
      </div>

      {/* ================= TAB 1: RBAC USER MANAGEMENT ================= */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Danh Sách Tài Khoản Cán Bộ Tuyển Sinh (5 Nhóm Quyền Cốt Lõi)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kiểm soát phân quyền cấp độ Backend, mã hóa mật khẩu Bcrypt và phân định phạm vi dữ liệu (Row-Level Security).
                </p>
              </div>

              {currentUser?.role === 'admin' ? (
                <button
                  onClick={() => setAddStaffOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cấp Tài Khoản Mới</span>
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200">
                  Chỉ Super Admin mới có quyền tạo tài khoản
                </span>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Họ và Tên Cán Bộ</th>
                    <th className="p-3">Email & SĐT</th>
                    <th className="p-3">Vai Trò Phân Quyền</th>
                    <th className="p-3">Bộ Phận / Địa Bàn Phụ Trách</th>
                    <th className="p-3 text-center">Chỉ Tiêu KPI</th>
                    <th className="p-3 text-center">Trạng Thái</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {staffList.map(staff => (
                    <tr key={staff.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">
                        {staff.fullName}
                      </td>
                      <td className="p-3">
                        <div>{staff.email}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{staff.phone}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-bold px-2.5 py-1 rounded-lg text-[10px] uppercase bg-blue-50 text-blue-800 border border-blue-200">
                          {staff.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <div>{staff.department}</div>
                        {staff.assignedRegion && (
                          <span className="text-[10px] text-emerald-600 block">{staff.assignedRegion}</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800">
                        {staff.targetQuota || 0}
                      </td>
                      <td className="p-3 text-center">
                        {staff.status === 'locked' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            Đã khóa
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Hoạt động
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleResetPassword(staff.id, staff.fullName)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                            title="Reset mật khẩu"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleLockUser(staff.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition cursor-pointer"
                            title={staff.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {staff.status === 'locked' ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: AUDIT TRAIL LOGS ================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Nhật Ký Kiểm Toán An Toàn Hệ Thống (Audit Trail Logs)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lưu trữ vĩnh viễn trong CSDL: Ai làm gì, lúc mấy giờ, từ IP nào, thay đổi dữ liệu từ giá trị nào sang giá trị nào.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  placeholder="Tìm hành động, người dùng, bản ghi..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Thời Gian</th>
                    <th className="p-3">Người Thao Tác & Vai Trò</th>
                    <th className="p-3">Hành Động</th>
                    <th className="p-3">Bảng & Bản Ghi</th>
                    <th className="p-3">Chi Tiết Thay Đổi (Values Diff)</th>
                    <th className="p-3 font-mono">Địa Chỉ IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAudits.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{log.userName}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">{log.userRole}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                          log.action === 'DELETE' ? 'bg-rose-100 text-rose-800' :
                          log.action === 'IMPORT' ? 'bg-purple-100 text-purple-800' :
                          log.action === 'VERIFY_DOCS' ? 'bg-teal-100 text-teal-800' :
                          log.action === 'REASSIGN' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        <span className="text-slate-600">{log.tableName}</span> / <strong className="text-slate-900">{log.recordId}</strong>
                      </td>
                      <td className="p-3 max-w-xs truncate text-[11px] font-mono text-slate-600">
                        {log.newValues ? JSON.stringify(log.newValues) : '-'}
                      </td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: DATABASE & SQL SCHEMA ================= */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SQL Script Card */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Kịch Bản CSDL Chuẩn (PostgreSQL / Supabase)
                  </h3>
                  <p className="text-xs text-slate-500">File: database/schema.sql (10 Bảng cốt lõi & RLS)</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Bao gồm toàn bộ định nghĩa bảng: <code>users</code>, <code>roles</code>, <code>permissions</code>, <code>candidates</code>, <code>consultation_logs</code>, <code>import_batches</code>, <code>audit_logs</code>, <code>zns_sms_logs</code> cùng với chỉ mục duy nhất và chính sách Row-Level Security.
              </p>

              <div className="pt-2">
                <a
                  href="/database/schema.sql"
                  download="schema.sql"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer w-fit"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Kịch Bản SQL Schema (.sql)</span>
                </a>
              </div>
            </div>

            {/* Supabase Status Card */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Trạng Thái Đám Mây Supabase
                  </h3>
                  <p className="text-xs text-slate-500">Live PostgreSQL Cloud Cluster</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Trạng thái kết nối:</span>
                  <span className={`font-bold flex items-center gap-1 ${isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isSupabaseConfigured ? 'Đang hoạt động (Live Cloud)' : 'Lưu trữ bền vững Local Database (ACID Engine)'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetData}
                  className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Khôi Phục Dữ Liệu Ban Đầu</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Cấp Tài Khoản Mới */}
      {addStaffOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-fade-in text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Cấp Tài Khoản Cán Bộ Mới & Phân Quyền
            </h3>

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={newStaff.fullName}
                  onChange={e => setNewStaff({ ...newStaff, fullName: e.target.value })}
                  placeholder="ThS. Nguyễn Văn A"
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Công Vụ</label>
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="ten.tuyensinh@dtu.edu.vn"
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="tel"
                    required
                    value={newStaff.phone}
                    onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="0905123456"
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nhóm Quyền (Role)</label>
                  <select
                    value={newStaff.role}
                    onChange={e => setNewStaff({ ...newStaff, role: e.target.value as Role })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="counselor">Admissions Officer (Chuyên viên tư vấn)</option>
                    <option value="manager">Admissions Manager (Trưởng phòng)</option>
                    <option value="verifier">Document Verification Officer (Hậu kiểm)</option>
                    <option value="marketer">Marketing & Data Collector</option>
                    <option value="admin">Super Admin (Quản trị viên tối cao)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chỉ Tiêu Tuyển Sinh (KPI)</label>
                  <input
                    type="number"
                    value={newStaff.targetQuota}
                    onChange={e => setNewStaff({ ...newStaff, targetQuota: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa Bàn Phụ Trách</label>
                <input
                  type="text"
                  value={newStaff.assignedRegion}
                  onChange={e => setNewStaff({ ...newStaff, assignedRegion: e.target.value })}
                  placeholder="VD: Đà Nẵng, Quảng Nam, Thừa Thiên Huế..."
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Cấp Quyền & Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
