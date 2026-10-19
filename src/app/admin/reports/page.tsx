'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  getLeads,
  getKPIStats,
  getStaffList,
  getConsultationLogs,
  getCampaigns
} from '@/data/storage';
import { STUDY_PROGRAMS } from '@/data/programsData';
import { Lead, KPIStats, UserProfile, MarketingCampaign } from '@/types';
import {
  BarChart3,
  Download,
  Users,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  Calendar,
  School,
  MapPin,
  Megaphone,
  PhoneCall,
  Target,
  DollarSign
} from 'lucide-react';

export default function ReportsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<KPIStats | null>(null);
  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);

  useEffect(() => {
    setLeads(getLeads());
    setStats(getKPIStats());
    setStaffList(getStaffList());
    setCampaigns(getCampaigns());
  }, []);

  if (!stats) return null;

  // 1. Phân tích hiệu suất chuyên viên (Officer Performance)
  const logs = getConsultationLogs();
  const counselors = staffList.filter(s => s.role === 'counselor');
  const officerPerformance = counselors.map(c => {
    const assignedLeads = leads.filter(l => l.assignedTo === c.id);
    const officerLogs = logs.filter(lg => lg.staffId === c.id);
    const converted = assignedLeads.filter(l => l.status === 'tuition_paid' || l.status === 'confirmed_enroll').length;
    const rate = assignedLeads.length > 0 ? Number(((converted / assignedLeads.length) * 100).toFixed(1)) : 0;
    const target = c.targetQuota || 80;
    const progress = Math.min(100, Math.round((converted / target) * 100));

    return {
      id: c.id,
      name: c.fullName,
      region: c.assignedRegion || 'Đà Nẵng & Miền Trung',
      callCount: officerLogs.length,
      assignedCount: assignedLeads.length,
      convertedCount: converted,
      conversionRate: rate,
      targetQuota: target,
      progress
    };
  });

  // 2. Thống kê theo chương trình đào tạo & chỉ tiêu
  const programStats = STUDY_PROGRAMS.map(p => {
    const count = leads.filter(l => l.programId === p.id).length;
    const enrolled = leads.filter(l => l.programId === p.id && (l.status === 'tuition_paid' || l.status === 'confirmed_enroll')).length;
    const quota = p.targetQuota || 100;
    const percentQuota = Math.round((enrolled / quota) * 100);

    return {
      code: p.code,
      name: p.name,
      partner: p.partner,
      quota,
      interested: count,
      enrolled,
      percentQuota
    };
  }).sort((a, b) => b.interested - a.interested);

  // 3. Báo cáo cơ cấu trường THPT đông nhất (Top High Schools)
  const schoolCounts: { [school: string]: { count: number; province: string } } = {};
  leads.forEach(l => {
    const s = l.highSchool || 'Chưa cập nhật';
    if (!schoolCounts[s]) {
      schoolCounts[s] = { count: 0, province: l.province || 'Đà Nẵng' };
    }
    schoolCounts[s].count++;
  });

  const topSchools = Object.keys(schoolCounts)
    .map(name => ({
      name,
      count: schoolCounts[name].count,
      province: schoolCounts[name].province
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 4. Báo cáo cơ cấu địa bàn / tỉnh thành
  const provinceCounts: { [prov: string]: number } = {};
  leads.forEach(l => {
    const prov = l.province || 'Đà Nẵng';
    provinceCounts[prov] = (provinceCounts[prov] || 0) + 1;
  });

  const topProvinces = Object.keys(provinceCounts)
    .map(name => ({ name, count: provinceCounts[name] }))
    .sort((a, b) => b.count - a.count);

  // Xuất file Excel báo cáo phân tích tổng thể
  const exportFullReportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Hiệu suất chuyên viên
    const wsOfficers = XLSX.utils.json_to_sheet(officerPerformance.map(o => ({
      'Chuyên Viên': o.name,
      'Địa Bàn Phụ Trách': o.region,
      'Số Cuộc Gọi / Tương Tác': o.callCount,
      'Số Lead Được Giao': o.assignedCount,
      'Số Hồ Sơ Nhập Học': o.convertedCount,
      'Tỷ Lệ Chốt (%)': `${o.conversionRate}%`,
      'Chỉ Tiêu KPI': o.targetQuota,
      'Tiến Độ Đạt Được (%)': `${o.progress}%`
    })));
    XLSX.utils.book_append_sheet(wb, wsOfficers, 'Hieu_Suat_Chuyen_Vien');

    // Sheet 2: Cơ cấu ngành & Chỉ tiêu
    const wsPrograms = XLSX.utils.json_to_sheet(programStats.map(p => ({
      'Mã Ngành': p.code,
      'Tên Ngành Đào Tạo': p.name,
      'Đại Học Đối Tác Mỹ': p.partner,
      'Chỉ Tiêu (Quota)': p.quota,
      'Số Lượng Quan Tâm': p.interested,
      'Đã Trúng Tuyển / Nhập Học': p.enrolled,
      'Tỷ Lệ Đạt Chỉ Tiêu': `${p.percentQuota}%`
    })));
    XLSX.utils.book_append_sheet(wb, wsPrograms, 'Chi_Tieu_Nganh');

    // Sheet 3: Top trường THPT
    const wsSchools = XLSX.utils.json_to_sheet(topSchools.map(s => ({
      'Tên Trường THPT': s.name,
      'Tỉnh Thành': s.province,
      'Số Thí Sinh Đăng Ký': s.count
    })));
    XLSX.utils.book_append_sheet(wb, wsSchools, 'Top_Truong_THPT');

    XLSX.writeFile(wb, `Bao_Cao_Tuyen_Sinh_Toan_Dien_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Báo Cáo Phân Tích & Đo Lường Hiệu Quả Tuyển Sinh Số</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp dữ liệu thực từ CSDL: Đo lường KPI chuyên viên, tỷ lệ chuyển đổi, chi phí marketing và cơ cấu trường THPT.
          </p>
        </div>

        <button
          onClick={exportFullReportExcel}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Tải Báo Cáo Phân Tích Toàn Diện (.xlsx)</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Tổng Thí Sinh Tiềm Năng
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalLeads}</span>
            <span className="text-xs text-emerald-600 font-bold">+18% tuần này</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Đổ về từ 8 kênh tiếp cận số hóa</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            Tỷ Lệ Chốt Hồ Sơ Tuyển Sinh
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-700">{stats.conversionRate}%</span>
            <span className="text-xs text-slate-400">trên tổng lead</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Công thức: (Đã đóng phí + Nhập học) / Tổng lead</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Đã Hoàn Tất Học Phí & Nhập Học
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{stats.tuitionPaidLeads + stats.enrolledLeads}</span>
            <span className="text-xs text-emerald-700 font-bold">Tân sinh viên nhập học</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Đã gạch nợ tự động trên hệ thống</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
            Cuộc Gọi & Tương Tác Đã Thực Hiện
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{logs.length}</span>
            <span className="text-xs text-amber-700 font-bold">Lượt chăm sóc</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Ghi vết chi tiết trong Timeline thí sinh</p>
        </div>
      </div>

      {/* ================= 1. BÁO CÁO HIỆU SUẤT CHUYÊN VIÊN (OFFICER PERFORMANCE) ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Đo Lường Hiệu Suất & KPI Từng Chuyên Viên Tuyển Sinh</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đo lường số lượng tương tác, số lead được phân công, tỷ lệ chốt và tiến độ đạt chỉ tiêu
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Chuyên Viên Tư Vấn</th>
                <th className="p-3.5">Địa Bàn Phụ Trách</th>
                <th className="p-3.5 text-center">Số Cuộc Gọi Đã Thực Hiện</th>
                <th className="p-3.5 text-center">Lead Được Giao</th>
                <th className="p-3.5 text-center">Hồ Sơ Nhập Học Chốt Thành Công</th>
                <th className="p-3.5 text-center">Tỷ Lệ Chốt (%)</th>
                <th className="p-3.5">Tiến Độ Chỉ Tiêu KPI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {officerPerformance.map(o => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">
                    {o.name}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {o.region}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-bold text-amber-700 font-mono">
                    {o.callCount} cuộc gọi
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-700">
                    {o.assignedCount} lead
                  </td>
                  <td className="p-3.5 text-center font-black text-emerald-700 font-mono">
                    {o.convertedCount} thí sinh
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-extrabold text-[11px]">
                      {o.conversionRate}%
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="space-y-1 w-48">
                      <div className="flex items-center justify-between text-[10px]">
                        <span>Chỉ tiêu: {o.targetQuota}</span>
                        <strong className="text-emerald-700">{o.progress}%</strong>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${o.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 2. BÁO CÁO CƠ CẤU TRƯỜNG THPT & VÙNG MIỀN ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top High Schools */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-600" />
                <span>Top Trường THPT Có Lượng Thí Sinh Đăng Ký Đông Nhất</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Căn cứ để ưu tiên phân bổ chuyên viên tổ chức Tour tư vấn hướng nghiệp trực tiếp
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {topSchools.map((sch, idx) => (
              <div key={sch.name} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 transition">
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? 'bg-amber-400 text-slate-950 font-black' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">{sch.name}</span>
                    <span className="text-[10px] text-slate-500">{sch.province}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-indigo-900 font-mono">{sch.count}</span>
                  <span className="text-[10px] text-slate-400 block">thí sinh</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Provinces */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                <span>Cơ Cấu Địa Bàn Tuyển Sinh</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Phân bổ thí sinh theo các tỉnh thành trọng điểm
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {topProvinces.slice(0, 6).map(prov => (
              <div key={prov.name} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-800">{prov.name}</span>
                  <span className="font-mono text-slate-900 font-bold">{prov.count} hồ sơ ({Math.round(prov.count / (leads.length || 1) * 100)}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${Math.round(prov.count / (leads.length || 1) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ================= 3. BÁO CÁO TIẾN ĐỘ CHỈ TIÊU THEO NGÀNH ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-base font-extrabold text-slate-900">
            Bảng Thống Kê Tiến Độ Đạt Chỉ Tiêu Theo Ngành Học
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            So sánh giữa số lượng quan tâm và số lượng đã nhập học thực tế với chỉ tiêu ban hành
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mã & Ngành Đào Tạo</th>
                <th className="p-3.5">Đại Học Đối Tác Mỹ</th>
                <th className="p-3.5 text-center">Chỉ Tiêu Quota</th>
                <th className="p-3.5 text-center">Quan Tâm</th>
                <th className="p-3.5 text-center">Đã Nhập Học</th>
                <th className="p-3.5">Tiến Độ Chỉ Tiêu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {programStats.map(p => (
                <tr key={p.code} className="hover:bg-slate-50">
                  <td className="p-3.5">
                    <span className="font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded text-[10px] mr-2">
                      {p.code}
                    </span>
                    <strong className="text-slate-900">{p.name}</strong>
                  </td>
                  <td className="p-3.5 text-slate-600">{p.partner}</td>
                  <td className="p-3.5 text-center font-bold text-slate-800">{p.quota}</td>
                  <td className="p-3.5 text-center font-bold text-blue-700 font-mono">{p.interested}</td>
                  <td className="p-3.5 text-center font-bold text-emerald-700 font-mono">{p.enrolled}</td>
                  <td className="p-3.5">
                    <div className="space-y-1 w-44">
                      <div className="flex items-center justify-between text-[10px]">
                        <span>Tỷ lệ lấp đầy:</span>
                        <strong className="text-blue-900 font-mono">{p.percentQuota}%</strong>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${Math.min(100, p.percentQuota)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
