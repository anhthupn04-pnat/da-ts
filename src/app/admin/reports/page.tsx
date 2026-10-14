'use client';

import React, { useState, useEffect } from 'react';
import { getLeads, getKPIStats } from '@/data/storage';
import { STUDY_PROGRAMS } from '@/data/programsData';
import { INITIAL_STAFF } from '@/data/mockData';
import { Lead, KPIStats } from '@/types';
import {
  BarChart3,
  Download,
  Users,
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  Calendar
} from 'lucide-react';

export default function ReportsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<KPIStats | null>(null);

  useEffect(() => {
    setLeads(getLeads());
    setStats(getKPIStats());
  }, []);

  if (!stats) return null;

  // Group by program
  const programStats = STUDY_PROGRAMS.map(p => {
    const count = leads.filter(l => l.programId === p.id).length;
    const enrolled = leads.filter(l => l.programId === p.id && l.status === 'enrolled').length;
    return {
      code: p.code,
      name: p.name,
      count,
      enrolled
    };
  }).sort((a, b) => b.count - a.count);

  // Group by staff workload
  const staffStats = INITIAL_STAFF.map(staff => {
    const assignedLeads = leads.filter(l => l.assignedTo === staff.id);
    const converted = assignedLeads.filter(l => l.status === 'enrolled' || l.status === 'registered').length;
    const rate = assignedLeads.length > 0 ? Math.round((converted / assignedLeads.length) * 100) : 0;
    return {
      name: staff.fullName,
      role: staff.role,
      assigned: assignedLeads.length,
      converted,
      rate
    };
  });

  const exportFullReportCSV = () => {
    const headers = ['Mã Ngành', 'Tên Ngành Đào Tạo', 'Tổng Thí Sinh Quan Tâm', 'Nhập Học Thực Tế'];
    const rows = programStats.map(p => [p.code, `"${p.name}"`, p.count, p.enrolled]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao_cao_nganh_tuyen_sinh_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Báo Cáo Phân Tích & Hiệu Quả Tuyển Sinh (K32)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thống kê chuyển đổi, khối lượng công việc chuyên viên và độ quan tâm của thí sinh theo ngành học
          </p>
        </div>

        <button
          onClick={exportFullReportCSV}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-2xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Xuất Báo Cáo Phân Tích (CSV)</span>
        </button>
      </div>

      {/* Overview Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tỷ Lệ Chốt Hồ Sơ Tuyển Sinh (Conversion Rate)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-700">{stats.conversionRate}%</span>
            <span className="text-xs text-slate-400">trên tổng số tiếp nhận</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Công thức: (Đã nộp đăng ký + Nhập học) / Tổng số lead tiếp nhận
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Hồ Sơ Đã Nhập Học K32 Chính Thức
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{stats.enrolledLeads}</span>
            <span className="text-xs text-emerald-700 font-semibold">Tân sinh viên</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Đã hoàn thành thủ tục nhập học và nhận giấy báo trúng tuyển
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Khối Lượng Cần Chăm Sóc Ngay
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{stats.pendingTasks}</span>
            <span className="text-xs text-amber-700 font-semibold">Cần tương tác</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Hồ sơ mới tiếp nhận và hồ sơ đang trong lộ trình tư vấn hẹn gặp
          </p>
        </div>
      </div>

      {/* Program Demand Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            Bảng Thống Kê Độ Quan Tâm Của Thí Sinh Theo Ngành Học
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu tổng hợp từ các biểu mẫu đăng ký tư vấn trực tuyến và hotline
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Mã ngành</th>
                <th className="px-6 py-3.5">Tên chương trình đào tạo</th>
                <th className="px-4 py-3.5 text-center">Số thí sinh quan tâm</th>
                <th className="px-4 py-3.5 text-center">Nhập học thực tế</th>
                <th className="px-6 py-3.5 text-right">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programStats.map(item => (
                <tr key={item.code} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-3.5 font-mono font-bold text-blue-700">
                    {item.code}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                    {item.count}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-emerald-600">
                    {item.enrolled}
                  </td>
                  <td className="px-6 py-3.5 text-right text-slate-500 font-mono">
                    {stats.totalLeads > 0 ? Math.round((item.count / stats.totalLeads) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Counselor Workload and Performance */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Hiệu Quả & Năng Suất Chuyên Viên Tư Vấn Tuyển Sinh
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Theo dõi số lượng hồ sơ được giao và tỷ lệ tư vấn thành công
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {staffStats.map((staff, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block text-sm">
                {staff.name}
              </span>
              <span className="text-[11px] font-semibold text-blue-700 uppercase block">
                Vai trò: {staff.role}
              </span>
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-500">Hồ sơ phụ trách:</span>
                <span className="font-bold text-slate-900">{staff.assigned}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Chuyển đổi thành công:</span>
                <span className="font-bold text-emerald-600">{staff.converted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tỷ lệ chốt:</span>
                <span className="font-bold text-indigo-700 font-mono">{staff.rate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
