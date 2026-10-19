'use client';

import React, { useState } from 'react';
import { STUDY_PROGRAMS } from '@/data/programsData';
import { StudyProgram } from '@/types';
import {
  BookOpen,
  Search,
  Award,
  Clock,
  DollarSign,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Briefcase
} from 'lucide-react';

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<StudyProgram[]>(STUDY_PROGRAMS);
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('ALL');

  const filtered = programs.filter(p => {
    const s = search.toLowerCase();
    const match =
      p.name.toLowerCase().includes(s) ||
      p.code.toLowerCase().includes(s) ||
      p.partner.toLowerCase().includes(s);

    const partnerMatch = selectedPartner === 'ALL' || p.id.startsWith(selectedPartner.toLowerCase());
    return match && partnerMatch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Quản Lý Chương Trình Đào Tạo Quốc Tế (K32)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu bóc tách chính thức từ Cẩm nang Tư vấn Nhập học K32 – Viện Đào tạo Quốc tế (VN-US)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
            Tổng: 14 Ngành chuẩn Hoa Kỳ
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên ngành, mã ngành..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'TROY', 'CMU', 'PSU', 'CSU'].map(k => (
            <button
              key={k}
              onClick={() => setSelectedPartner(k)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedPartner === k
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {k === 'ALL' ? 'Tất cả (14)' : k}
            </button>
          ))}
        </div>
      </div>

      {/* Programs Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {p.code}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {p.accreditation}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {p.name}
              </h3>
              <p className="text-xs text-blue-800 font-semibold mt-1">
                {p.partner}
              </p>

              <p className="text-xs text-slate-600 mt-2.5 line-clamp-2">
                {p.description}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span><strong>Văn bằng:</strong> {p.degree}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate"><strong>Nghề nghiệp:</strong> {p.careerProspects}</span>
                </div>
                {p.tuitionNote && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed mt-2">
                    <strong className="text-amber-950 font-bold">Lưu ý tư vấn học phí & học bổng:</strong> {p.tuitionNote}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Học phí K32:</span>
                <span className="inline-block mt-0.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-bold border border-blue-200">
                  {p.tuitionPerYear}
                </span>
              </div>
              <span className="font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">Thời gian: {p.duration}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
