'use client';

import React, { useState, useEffect } from 'react';
import LeadModal from '@/components/LeadModal';
import ExcelImportModal from '@/components/ExcelImportModal';
import { getLeads, addLead, deleteLead, updateLead } from '@/data/storage';
import { STUDY_PROGRAMS } from '@/data/programsData';
import { Lead, LeadStatus, LeadSource, LeadPriority } from '@/types';
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
  X
} from 'lucide-react';

export default function LeadsManagementPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [programFilter, setProgramFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(2026);

  // Add Lead Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    highSchool: '',
    province: 'Đà Nẵng',
    graduationYear: currentYear,
    programId: STUDY_PROGRAMS[0].id,
    source: 'website' as LeadSource,
    priority: 'medium' as LeadPriority,
    notes: ''
  });
  const [addError, setAddError] = useState<string | null>(null);

  const loadData = () => {
    setLeads(getLeads());
  };

  useEffect(() => {
    loadData();
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Filtered Leads
  const filtered = leads.filter(l => {
    const s = search.toLowerCase();
    const matchesSearch =
      l.fullName.toLowerCase().includes(s) ||
      l.phone.includes(s) ||
      l.email.toLowerCase().includes(s) ||
      (l.highSchool && l.highSchool.toLowerCase().includes(s)) ||
      (l.province && l.province.toLowerCase().includes(s));

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesProgram = programFilter === 'ALL' || l.programId === programFilter;
    const matchesSource = sourceFilter === 'ALL' || l.source === sourceFilter;
    const matchesYear = yearFilter === 'ALL' || (l.graduationYear && l.graduationYear.toString() === yearFilter);

    return matchesSearch && matchesStatus && matchesProgram && matchesSource && matchesYear;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ thí sinh: ${name}?`)) {
      deleteLead(id);
      loadData();
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const res = addLead({
      fullName: newLeadForm.fullName.trim(),
      phone: newLeadForm.phone.trim(),
      email: newLeadForm.email.trim(),
      highSchool: newLeadForm.highSchool.trim(),
      province: newLeadForm.province,
      graduationYear: Number(newLeadForm.graduationYear) || currentYear,
      programId: newLeadForm.programId,
      source: newLeadForm.source,
      status: 'new',
      priority: newLeadForm.priority,
      notes: newLeadForm.notes.trim()
    });

    if (!res.success) {
      setAddError(res.error || 'Có lỗi xảy ra khi tạo thí sinh.');
      return;
    }

    setAddModalOpen(false);
    setNewLeadForm({
      fullName: '',
      phone: '',
      email: '',
      highSchool: '',
      province: 'Đà Nẵng',
      graduationYear: currentYear,
      programId: STUDY_PROGRAMS[0].id,
      source: 'website',
      priority: 'medium',
      notes: ''
    });
    loadData();
  };

  // Export to CSV with UTF-8 BOM so Excel opens with perfect Vietnamese characters
  const exportToCSV = () => {
    const headers = [
      'Mã Lead',
      'Họ và Tên',
      'Số Điện Thoại',
      'Email',
      'Trường THPT',
      'Tỉnh Thành',
      'Năm Tốt Nghiệp',
      'Mã Ngành',
      'Tên Ngành Quan Tâm',
      'Nguồn Tiếp Cận',
      'Trạng Thái',
      'Mức Độ Ưu Tiên',
      'Chuyên Viên Phụ Trách',
      'Ngày Tiếp Nhận'
    ];

    const rows = filtered.map(l => [
      l.id,
      `"${l.fullName.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${(l.highSchool || '').replace(/"/g, '""')}"`,
      `"${l.province || ''}"`,
      l.graduationYear || currentYear,
      l.programId,
      `"${(l.programName || '').replace(/"/g, '""')}"`,
      l.source,
      l.status,
      l.priority,
      `"${l.assignedToName || ''}"`,
      l.createdAt
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_thi_sinh_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800">Mới tiếp nhận</span>;
      case 'contacted':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800">Đã liên hệ</span>;
      case 'consulting':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800">Đang tư vấn</span>;
      case 'registered':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">Đã nộp đăng ký</span>;
      case 'enrolled':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">Đã nhập học</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">Đã hủy / Không nhu cầu</span>;
    }
  };

  const getPriorityBadge = (priority: LeadPriority) => {
    switch (priority) {
      case 'high':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800">Ưu tiên cao</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">TB</span>;
      case 'low':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-500">Thấp</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Quản Lý Thí Sinh & Lead Tuyển Sinh (CRM)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi, phân công tư vấn và cập nhật hành trình hồ sơ thí sinh các khóa tuyển sinh
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setExcelModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Nhập dữ liệu danh sách thí sinh từ file Excel (.xlsx, .xls) hoặc CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Nhập từ Excel / CSV</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Xuất file CSV tương thích Excel hỗ trợ tiếng Việt đầy đủ"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel / CSV</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thí Sinh Mới</span>
          </button>
        </div>
      </div>

      {/* Success alert when imported from Excel */}
      {importSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{importSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm tên, SĐT, trường THPT..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          {/* Graduation Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden font-medium text-slate-700"
            >
              <option value="ALL">Tất cả năm tốt nghiệp</option>
              {Array.from(new Set(leads.map(l => l.graduationYear).filter((y): y is number => Boolean(y))))
                .sort((a, b) => b - a)
                .map(yr => (
                  <option key={yr} value={yr.toString()}>
                    Năm tốt nghiệp {yr}
                  </option>
                ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden font-medium text-slate-700"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="new">Mới tiếp nhận</option>
              <option value="contacted">Đã liên hệ</option>
              <option value="consulting">Đang tư vấn</option>
              <option value="registered">Đã nộp đăng ký</option>
              <option value="enrolled">Nhập học chính thức</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Program Filter */}
          <div>
            <select
              value={programFilter}
              onChange={e => setProgramFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden font-medium text-slate-700 truncate"
            >
              <option value="ALL">Tất cả ngành (14)</option>
              {STUDY_PROGRAMS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden font-medium text-slate-700"
            >
              <option value="ALL">Tất cả nguồn</option>
              <option value="website">Website TTTV</option>
              <option value="facebook">Facebook Ads / Page</option>
              <option value="tiktok">TikTok</option>
              <option value="event">Sự kiện THPT</option>
              <option value="referral">Cựu SV / Giới thiệu</option>
              <option value="hotline">Hotline</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Tìm thấy <strong>{filtered.length}</strong> thí sinh phù hợp
          </span>
          {(search || statusFilter !== 'ALL' || programFilter !== 'ALL' || sourceFilter !== 'ALL' || yearFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setProgramFilter('ALL');
                setSourceFilter('ALL');
                setYearFilter('ALL');
              }}
              className="text-blue-600 hover:text-blue-800 font-bold transition cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">Không tìm thấy thí sinh nào</p>
            <p className="mt-1">Thử điều chỉnh lại từ khóa tìm kiếm hoặc bấm nút "Thêm Thí Sinh Mới".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Họ và tên thí sinh</th>
                  <th className="px-4 py-3.5">Liên hệ</th>
                  <th className="px-4 py-3.5">Trường & Tỉnh</th>
                  <th className="px-4 py-3.5">Ngành quan tâm</th>
                  <th className="px-4 py-3.5">Nguồn</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5">Người phụ trách</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                    
                    {/* Full Name & Priority */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {lead.fullName}
                        </span>
                        {getPriorityBadge(lead.priority)}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        #{lead.id}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5 space-y-0.5">
                      <div className="font-mono font-bold text-slate-800">
                        {lead.phone}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {lead.email}
                      </div>
                    </td>

                    {/* School & Province */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800">
                        {lead.highSchool || 'Chưa cập nhật'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {lead.province || 'Đà Nẵng'} {lead.graduationYear ? `(TN ${lead.graduationYear})` : ''}
                      </div>
                    </td>

                    {/* Program */}
                    <td className="px-4 py-3.5 font-medium text-slate-800 max-w-[200px] truncate" title={lead.programName}>
                      {lead.programName || lead.programId}
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {lead.source}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {getStatusBadge(lead.status)}
                    </td>

                    {/* Assigned Counselor */}
                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      {lead.assignedToName ? (
                        <span className="text-slate-900 font-semibold">{lead.assignedToName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa giao</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition cursor-pointer"
                        title="Xem chi tiết & nhật ký tư vấn"
                      >
                        Tư Vấn
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id, lead.fullName)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Xóa thí sinh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add New Lead */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Thêm Hồ Sơ Thí Sinh Mới Vào Hệ Thống
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4 text-xs">
              {addError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={newLeadForm.fullName}
                    onChange={e => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    placeholder="09xx xxx xxx"
                    value={newLeadForm.phone}
                    onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@gmail.com"
                    value={newLeadForm.email}
                    onChange={e => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    value={newLeadForm.province}
                    onChange={e => setNewLeadForm({ ...newLeadForm, province: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trường THPT</label>
                  <input
                    type="text"
                    placeholder="THPT Phan Châu Trinh"
                    value={newLeadForm.highSchool}
                    onChange={e => setNewLeadForm({ ...newLeadForm, highSchool: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Năm tốt nghiệp</label>
                  <select
                    value={newLeadForm.graduationYear}
                    onChange={e => setNewLeadForm({ ...newLeadForm, graduationYear: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value={currentYear + 1}>Năm {currentYear + 1}</option>
                    <option value={currentYear}>Năm {currentYear}</option>
                    <option value={currentYear - 1}>Năm {currentYear - 1}</option>
                    <option value={currentYear - 2}>Năm {currentYear - 2}</option>
                    <option value={currentYear - 3}>Năm {currentYear - 3}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nguồn tiếp nhận</label>
                  <select
                    value={newLeadForm.source}
                    onChange={e => setNewLeadForm({ ...newLeadForm, source: e.target.value as LeadSource })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="website">Website</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="event">Sự kiện THPT</option>
                    <option value="referral">Giới thiệu</option>
                    <option value="hotline">Hotline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chương trình / Ngành quan tâm *</label>
                <select
                  value={newLeadForm.programId}
                  onChange={e => setNewLeadForm({ ...newLeadForm, programId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  {STUDY_PROGRAMS.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú ban đầu</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về điểm số, nhu cầu học bổng..."
                  value={newLeadForm.notes}
                  onChange={e => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Lưu Thí Sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Detail Modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onLeadUpdated={loadData}
        />
      )}

      {/* Excel / CSV Import Modal */}
      <ExcelImportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        onSuccess={(count) => {
          loadData();
          setImportSuccessMsg(`Đã nhập thành công ${count} hồ sơ thí sinh từ file Excel vào hệ thống!`);
          setTimeout(() => setImportSuccessMsg(null), 5000);
        }}
      />

    </div>
  );
}
