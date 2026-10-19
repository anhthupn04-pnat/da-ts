'use client';

import React, { useState, useEffect } from 'react';
import LeadModal from '@/components/LeadModal';
import ExcelImportModal from '@/components/ExcelImportModal';
import {
  getLeads,
  addLead,
  deleteLead,
  getCurrentUser,
  getSafeCurrentUser,
  maskPhone,
  autoAssignRoundRobin,
  autoAssignByRegion,
  batchReassignLeads,
  getTodayFollowUpReminders,
  getStaffList
} from '@/data/storage';
import { STUDY_PROGRAMS } from '@/data/programsData';
import { PROVINCES_AND_SCHOOLS, EXAM_BLOCKS } from '@/data/provincesAndSchools';
import { Lead, LeadStatus, LeadSource, LeadPriority, UserProfile } from '@/types';
import * as XLSX from 'xlsx';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  Mail,
  School,
  MapPin,
  Calendar,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  Kanban,
  Table as TableIcon,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  BellRing,
  UserCheck
} from 'lucide-react';

export default function LeadsManagementPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getSafeCurrentUser());
  const [leads, setLeads] = useState<Lead[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [programFilter, setProgramFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  
  // Selection for batch actions
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [targetStaffId, setTargetStaffId] = useState<string>('');

  // Add Lead Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    fullName: '',
    phone: '',
    idCardNumber: '',
    email: '',
    province: 'Đà Nẵng',
    highSchool: 'THPT Chuyên Lê Quý Đôn',
    programId: STUDY_PROGRAMS[0].id,
    secondaryProgramId: STUDY_PROGRAMS[1].id,
    examBlock: 'A00',
    estimatedScore: 25.0,
    source: 'high_school_tour' as LeadSource,
    priority: 'medium' as LeadPriority,
    notes: ''
  });
  const [addError, setAddError] = useState<string | null>(null);

  // Reminders
  const [todayReminders, setTodayReminders] = useState<any[]>([]);

  const loadData = async () => {
    const user = getCurrentUser() || getSafeCurrentUser();
    setCurrentUser(user);
    // 1. Tải nhanh từ bộ nhớ cục bộ
    setLeads(getLeads(user));
    setTodayReminders(getTodayFollowUpReminders(user));

    // 2. Tải trực tiếp từ CSDL trung tâm qua API /api/leads
    try {
      const res = await fetch(`/api/leads?role=${encodeURIComponent(user.role)}&userId=${encodeURIComponent(user.id)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
      }
    } catch {
      // nếu gặp lỗi mạng thì giữ dữ liệu cache cục bộ
    }
  };

  useEffect(() => {
    loadData();

    const handleAuth = () => {
      loadData();
    };
    window.addEventListener('auth-changed', handleAuth);
    return () => window.removeEventListener('auth-changed', handleAuth);
  }, []);

  // Lọc danh sách thí sinh
  const filtered = leads.filter(l => {
    const s = search.toLowerCase();
    const matchesSearch =
      l.fullName.toLowerCase().includes(s) ||
      l.phone.includes(s) ||
      (l.idCardNumber && l.idCardNumber.includes(s)) ||
      (l.email && l.email.toLowerCase().includes(s)) ||
      (l.highSchool && l.highSchool.toLowerCase().includes(s)) ||
      (l.province && l.province.toLowerCase().includes(s));

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesProgram = programFilter === 'ALL' || l.programId === programFilter;
    const matchesSource = sourceFilter === 'ALL' || l.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesProgram && matchesSource;
  });

  // Xóa thí sinh (Ràng buộc: chỉ Admin & Manager)
  const handleDelete = async (id: string, name: string) => {
    if (currentUser.role === 'counselor') {
      alert('Chuyên viên tư vấn không có quyền xóa thí sinh theo chính sách bảo mật!');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ thí sinh: ${name}?`)) {
      try {
        const res = await fetch(`/api/leads?id=${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          deleteLead(id, currentUser);
          await loadData();
        } else {
          alert(data.error || 'Lỗi khi xóa hồ sơ khỏi CSDL.');
        }
      } catch (err: any) {
        const res = deleteLead(id, currentUser);
        if (res.success) {
          loadData();
        } else {
          alert(res.error);
        }
      }
    }
  };

  // Tạo mới hồ sơ một chạm
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    // Kiểm tra SĐT 10 số
    const cleanPhone = newLeadForm.phone.replace(/[\s\-\.]/g, '');
    if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
      setAddError('Số điện thoại không hợp lệ (cần đúng 10 chữ số di động Việt Nam).');
      return;
    }

    // Kiểm tra CCCD nếu có
    const cleanCccd = newLeadForm.idCardNumber.replace(/\s/g, '');
    if (cleanCccd && cleanCccd.length !== 12) {
      setAddError('Số CCCD / Mã định danh phải đúng 12 chữ số.');
      return;
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newLeadForm.fullName.trim(),
          phone: cleanPhone,
          idCardNumber: cleanCccd || undefined,
          email: newLeadForm.email.trim(),
          highSchool: newLeadForm.highSchool.trim(),
          province: newLeadForm.province,
          graduationYear: 2026,
          programId: newLeadForm.programId,
          secondaryProgramId: newLeadForm.secondaryProgramId || undefined,
          examBlock: newLeadForm.examBlock,
          estimatedScore: Number(newLeadForm.estimatedScore) || undefined,
          source: newLeadForm.source,
          status: 'new',
          priority: newLeadForm.priority,
          notes: newLeadForm.notes.trim()
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        setAddError(resData.error || 'Có lỗi xảy ra khi tạo thí sinh.');
        return;
      }

      setAddModalOpen(false);
      await loadData();
      alert(`Đã lưu thành công vào CSDL với mã hồ sơ: ${resData.lead?.id}!`);
    } catch (err: any) {
      setAddError(`Lỗi kết nối máy chủ CSDL: ${err.message}`);
    }
  };

  // Xoay vòng Round-Robin
  const handleRoundRobin = () => {
    const unassignedIds = filtered.filter(l => !l.assignedTo).map(l => l.id);
    const targetIds = selectedLeadIds.length > 0 ? selectedLeadIds : unassignedIds;

    if (targetIds.length === 0) {
      alert('Không có thí sinh nào được chọn hoặc chưa phân công.');
      return;
    }

    if (confirm(`Phân chia xoay vòng Round-Robin cho ${targetIds.length} thí sinh giữa các chuyên viên tư vấn đang hoạt động?`)) {
      const res = autoAssignRoundRobin(targetIds, currentUser);
      if (res.success) {
        alert(`Đã phân bổ tự động thành công cho ${res.assignedCount} thí sinh!`);
        setSelectedLeadIds([]);
        loadData();
      }
    }
  };

  // Phân chia theo khu vực
  const handleAssignByRegion = () => {
    const targetIds = selectedLeadIds.length > 0 ? selectedLeadIds : filtered.map(l => l.id);
    if (confirm(`Tự động phân bổ ${targetIds.length} thí sinh theo địa bàn phụ trách (Đà Nẵng, Quảng Nam, Huế, Tây Nguyên...)?`)) {
      const res = autoAssignByRegion(targetIds, currentUser);
      if (res.success) {
        alert(`Đã hoàn tất phân bổ theo khu vực địa lý cho ${res.assignedCount} thí sinh!`);
        setSelectedLeadIds([]);
        loadData();
      }
    }
  };

  // Chuyển giao hàng loạt (Batch Reassign)
  const handleBatchReassign = () => {
    if (!targetStaffId) {
      alert('Vui lòng chọn chuyên viên tiếp nhận.');
      return;
    }

    const res = batchReassignLeads(selectedLeadIds, targetStaffId, currentUser);
    if (res.success) {
      alert(`Đã chuyển giao ${res.count} hồ sơ thành công!`);
      setReassignModalOpen(false);
      setSelectedLeadIds([]);
      loadData();
    }
  };

  // Xuất file Excel
  const exportToExcel = () => {
    if (currentUser.role === 'counselor') {
      alert('Chuyên viên tư vấn không được quyền xuất toàn bộ cơ sở dữ liệu trừ khi được Trưởng phòng phê duyệt!');
      return;
    }

    const dataToExport = filtered.map(l => ({
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
      'Chuyên Viên Phụ Trách': l.assignedToName || 'Chưa gán',
      'Học Phí / Lệ Phí': l.paymentStatus || 'unpaid',
      'Ngày Tiếp Nhận': l.createdAt
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Thi_Sinh_VNUS');
    XLSX.writeFile(wb, `DS_Thi_Sinh_VNUS_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // 10 Trạng thái đường ống
  const PIPELINE_COLUMNS: { code: LeadStatus; title: string; color: string }[] = [
    { code: 'new', title: 'Mới tiếp nhận', color: 'border-t-slate-400 bg-slate-50' },
    { code: 'unreachable', title: 'Chưa liên hệ', color: 'border-t-amber-400 bg-amber-50/40' },
    { code: 'consulted_1', title: 'Đã tư vấn lần 1', color: 'border-t-blue-500 bg-blue-50/40' },
    { code: 'hot_lead', title: 'Quan tâm cao (Nóng)', color: 'border-t-orange-500 bg-orange-50/40' },
    { code: 'waiting_transcript', title: 'Chờ học bạ', color: 'border-t-purple-500 bg-purple-50/40' },
    { code: 'submitted_app', title: 'Đã nộp hồ sơ', color: 'border-t-indigo-600 bg-indigo-50/40' },
    { code: 'conditional_admit', title: 'Trúng tuyển ĐK', color: 'border-t-teal-500 bg-teal-50/40' },
    { code: 'confirmed_enroll', title: 'Xác nhận nhập học', color: 'border-t-cyan-600 bg-cyan-50/40' },
    { code: 'tuition_paid', title: 'Đã đóng học phí', color: 'border-t-emerald-600 bg-emerald-50/40' },
    { code: 'cancelled', title: 'Từ chối / Hủy', color: 'border-t-rose-400 bg-rose-50/30' }
  ];

  // Danh mục trường gợi ý theo tỉnh được chọn trong form
  const selectedProvinceData = PROVINCES_AND_SCHOOLS.find(p => p.name === newLeadForm.province);
  const suggestedSchools = selectedProvinceData ? selectedProvinceData.schools : [];

  return (
    <div className="space-y-6">
      
      {/* Top Banner: RBAC Row-Level Security Notice */}
      {currentUser.role === 'counselor' ? (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <strong>Phạm vi dữ liệu chuyên viên (Data Scope):</strong> Bạn đang xem danh sách các thí sinh được phân công phụ trách trực tiếp (<code className="font-mono text-blue-800">WHERE assigned_to = {currentUser.fullName}</code>).
            </div>
          </div>
          <span className="font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
            {leads.length} Thí sinh phụ trách
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-amber-400">Quyền Hạn Toàn Cơ Sở ({currentUser.role === 'admin' ? 'Super Admin' : 'Admissions Manager'}):</strong> Bạn có toàn quyền xem, điều phối Round-Robin, phân bổ theo khu vực địa lý và duyệt hồ sơ đặc biệt.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRoundRobin}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Phân chia xoay vòng Round-Robin cho các thí sinh chưa có người phụ trách"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Phân Bổ Round-Robin</span>
            </button>

            <button
              onClick={handleAssignByRegion}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Phân chia theo khu vực địa lý"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Phân Bổ Theo Tỉnh</span>
            </button>
          </div>
        </div>
      )}

      {/* Widget Reminder Banner: Lịch gọi lại hôm nay */}
      {todayReminders.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between text-xs animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="font-extrabold text-sm block">Nhắc Việc Đầu Giờ Sáng: Bạn có {todayReminders.length} thí sinh cần gọi lại hôm nay!</span>
              <span className="text-[11px] text-amber-700">Hãy liên hệ sớm để tăng tỷ lệ chốt hồ sơ và kịp thời giải đáp thắc mắc về học bổng.</span>
            </div>
          </div>
          <button
            onClick={() => {
              const reminderIds = todayReminders.map(r => r.lead.id);
              setSearch(reminderIds[0] || '');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition cursor-pointer"
          >
            Xem Thí Sinh Cần Gọi
          </button>
        </div>
      )}

      {/* Header Actions & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Quản Lý Thí Sinh & Đường Ống Tuyển Sinh</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng cộng: <strong>{filtered.length}</strong> hồ sơ phù hợp bộ lọc
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Switch View Mode */}
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Dạng Bảng</span>
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'pipeline' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Đường Ống (10 Bước)</span>
            </button>
          </div>

          {/* Import Excel */}
          <button
            onClick={() => setExcelModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Nhập Excel (5 Bước)</span>
          </button>

          {/* Export Excel (Admin/Manager) */}
          {currentUser.role !== 'counselor' && (
            <button
              onClick={exportToExcel}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
          )}

          {/* Add Single Lead */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thí Sinh Mới</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SĐT, CCCD, trường THPT..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="ALL">Tất cả 10 trạng thái</option>
              {PIPELINE_COLUMNS.map(s => (
                <option key={s.code} value={s.code}>{s.title}</option>
              ))}
            </select>
          </div>

          {/* Program filter */}
          <div>
            <select
              value={programFilter}
              onChange={e => setProgramFilter(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="ALL">Tất cả chương trình đào tạo</option>
              {STUDY_PROGRAMS.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.partner})</option>
              ))}
            </select>
          </div>

          {/* Source filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="ALL">Tất cả nguồn tiếp cận</option>
              <option value="high_school_tour">Tour Tuyển Sinh Tại Trường THPT</option>
              <option value="website">Website Đăng Ký Trực Tuyến</option>
              <option value="event">Ngày Hội Open Day & Triển Lãm</option>
              <option value="facebook">Facebook Ads & Fanpage</option>
              <option value="tiktok">TikTok Video Review</option>
              <option value="hotline">Tổng Đài Hotline & Zalo</option>
              <option value="referral">Người Thân / Cựu SV Giới Thiệu</option>
            </select>
          </div>
        </div>

        {/* Selected batch actions */}
        {selectedLeadIds.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-blue-50/60 p-2.5 rounded-xl">
            <span className="font-bold text-blue-900">
              Đã chọn: {selectedLeadIds.length} thí sinh
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReassignModalOpen(true)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
              >
                Chuyển Giao Hàng Loạt
              </button>
              <button
                onClick={() => setSelectedLeadIds([])}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-800 font-medium"
              >
                Hủy chọn
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= VIEW 1: TABLE VIEW ================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.length === filtered.length && filtered.length > 0}
                      onChange={e => {
                        if (e.target.checked) setSelectedLeadIds(filtered.map(l => l.id));
                        else setSelectedLeadIds([]);
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="p-3">Mã & Thí Sinh</th>
                  <th className="p-3">Số Điện Thoại (Masked)</th>
                  <th className="p-3">Trường THPT & Tỉnh</th>
                  <th className="p-3">Ngành Xét Tuyển & Khối</th>
                  <th className="p-3">Trạng Thái Hồ Sơ</th>
                  <th className="p-3">Chuyên Viên Phụ Trách</th>
                  <th className="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Không tìm thấy hồ sơ thí sinh nào phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filtered.map(lead => {
                    const isSelected = selectedLeadIds.includes(lead.id);
                    return (
                      <tr key={lead.id} className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-blue-50/50' : ''}`}>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => {
                              if (e.target.checked) setSelectedLeadIds([...selectedLeadIds, lead.id]);
                              else setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead.id));
                            }}
                            className="rounded"
                          />
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{lead.fullName}</span>
                            {lead.paymentStatus === 'tuition_paid' && (
                              <span title="Đã đóng học phí">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                            {lead.id}
                          </span>
                        </td>

                        {/* Masked Phone for security */}
                        <td className="p-3 font-mono">
                          <span className="text-slate-800 font-semibold">{maskPhone(lead.phone)}</span>
                          {lead.idCardNumber && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              CCCD: {lead.idCardNumber.substring(0, 4)}****{lead.idCardNumber.substring(8)}
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="font-medium text-slate-800">{lead.highSchool}</div>
                          <div className="text-[10px] text-slate-500">{lead.province || 'Đà Nẵng'} (TN {lead.graduationYear || 2026})</div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-blue-900">{lead.programName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Khối {lead.examBlock || 'A00'} • {lead.estimatedScore ? `${lead.estimatedScore}đ` : 'Ước tính'}
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="inline-block px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {lead.status}
                          </span>
                        </td>

                        <td className="p-3">
                          {lead.assignedToName ? (
                            <span className="font-semibold text-slate-700">{lead.assignedToName}</span>
                          ) : (
                            <span className="text-[11px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded">
                              Chưa gán
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                              title="Xem chi tiết & Dòng thời gian tư vấn"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Chi tiết</span>
                            </button>

                            {currentUser.role !== 'counselor' && (
                              <button
                                onClick={() => handleDelete(lead.id, lead.fullName)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                title="Xóa thí sinh"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
      )}

      {/* ================= VIEW 2: PIPELINE KANBAN VIEW (10 BƯỚC) ================= */}
      {viewMode === 'pipeline' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[2800px]">
            {PIPELINE_COLUMNS.map(col => {
              const colLeads = filtered.filter(l => l.status === col.code);
              return (
                <div
                  key={col.code}
                  className={`w-72 rounded-2xl border-t-4 border border-slate-200 p-3 flex flex-col max-h-[75vh] ${col.color}`}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                    <h3 className="font-bold text-xs text-slate-800">{col.title}</h3>
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Cards list */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                    {colLeads.map(l => (
                      <div
                        key={l.id}
                        onClick={() => setSelectedLead(l)}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 truncate">{l.fullName}</span>
                          <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded">
                            {l.id}
                          </span>
                        </div>

                        <p className="text-[11px] text-blue-900 font-semibold truncate">{l.programName}</p>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span>{l.highSchool}</span>
                          <span className="font-bold text-slate-700">{maskPhone(l.phone)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM THÍ SINH MỚI THỦ CÔNG ================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Thêm Hồ Sơ Thí Sinh Mới (Một Chạm)</h3>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4 text-xs">
              {addError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và Tên <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.fullName}
                    onChange={e => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại (10 số) <span className="text-rose-500">*</span></label>
                  <input
                    type="tel"
                    required
                    value={newLeadForm.phone}
                    onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="0905123456"
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số CCCD / Định Danh (12 số)</label>
                  <input
                    type="text"
                    value={newLeadForm.idCardNumber}
                    onChange={e => setNewLeadForm({ ...newLeadForm, idCardNumber: e.target.value })}
                    placeholder="048208001234"
                    className="w-full p-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={e => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    placeholder="thi.sinh@gmail.com"
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Tỉnh & Gợi ý trường THPT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tỉnh / Thành Phố</label>
                  <select
                    value={newLeadForm.province}
                    onChange={e => {
                      const newProv = e.target.value;
                      const provObj = PROVINCES_AND_SCHOOLS.find(p => p.name === newProv);
                      setNewLeadForm({
                        ...newLeadForm,
                        province: newProv,
                        highSchool: provObj?.schools[0] || 'THPT Khác'
                      });
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    {PROVINCES_AND_SCHOOLS.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.region})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trường THPT (Tự động gợi ý)</label>
                  <input
                    list="school-suggestions"
                    value={newLeadForm.highSchool}
                    onChange={e => setNewLeadForm({ ...newLeadForm, highSchool: e.target.value })}
                    placeholder="Chọn hoặc gõ tên trường"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                  <datalist id="school-suggestions">
                    {suggestedSchools.map(sch => (
                      <option key={sch} value={sch} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Nguyện vọng ngành */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nguyện Vọng 1 (Chính)</label>
                  <select
                    value={newLeadForm.programId}
                    onChange={e => setNewLeadForm({ ...newLeadForm, programId: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                  >
                    {STUDY_PROGRAMS.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.partner})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nguyện Vọng 2</label>
                  <select
                    value={newLeadForm.secondaryProgramId}
                    onChange={e => setNewLeadForm({ ...newLeadForm, secondaryProgramId: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="">-- Không có NV2 --</option>
                    {STUDY_PROGRAMS.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.partner})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Khối thi & Điểm */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối Thi</label>
                  <select
                    value={newLeadForm.examBlock}
                    onChange={e => setNewLeadForm({ ...newLeadForm, examBlock: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    {EXAM_BLOCKS.map(b => (
                      <option key={b.code} value={b.code}>{b.code} ({b.subjects})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Điểm Ước Tính</label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="30"
                    value={newLeadForm.estimatedScore}
                    onChange={e => setNewLeadForm({ ...newLeadForm, estimatedScore: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nguồn Thu Thập</label>
                  <select
                    value={newLeadForm.source}
                    onChange={e => setNewLeadForm({ ...newLeadForm, source: e.target.value as LeadSource })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="high_school_tour">Tour THPT</option>
                    <option value="event">Open Day</option>
                    <option value="website">Website Form</option>
                    <option value="hotline">Hotline</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú Ban Đầu</label>
                <textarea
                  rows={2}
                  value={newLeadForm.notes}
                  onChange={e => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Ghi chú về học bổng, nguyện vọng xét tuyển..."
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  Lưu Vào Database & Trả Mã Hồ Sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHUYỂN GIAO HÀNG LOẠT ================= */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fade-in text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Chuyển Giao Hàng Loạt ({selectedLeadIds.length} thí sinh)
            </h3>
            <p className="text-slate-500">
              Chọn chuyên viên tư vấn tiếp nhận phụ trách toàn bộ các hồ sơ đã chọn:
            </p>

            <div>
              <select
                value={targetStaffId}
                onChange={e => setTargetStaffId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-white text-slate-800"
              >
                <option value="">-- Chọn chuyên viên tiếp nhận --</option>
                {getStaffList().filter(s => s.role === 'counselor').map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.assignedRegion || 'Toàn ban'})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReassignModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleBatchReassign}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
              >
                Xác Nhận Chuyển Giao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onLeadUpdated={loadData}
        />
      )}

      {/* Excel 5-Step Import Modal */}
      <ExcelImportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        onSuccess={(count) => {
          loadData();
          alert(`Đã hoàn tất đồng bộ ${count} thí sinh vào Cơ sở dữ liệu!`);
        }}
      />

    </div>
  );
}
