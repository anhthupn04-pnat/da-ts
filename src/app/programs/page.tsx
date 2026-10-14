'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProgramCard from '@/components/ProgramCard';
import { STUDY_PROGRAMS, UNIVERSITY_PARTNERS } from '@/data/programsData';
import { Search, Filter, BookOpen, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('ALL');

  const filtered = STUDY_PROGRAMS.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.careerProspects.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPartner =
      selectedPartner === 'ALL' || p.id.startsWith(selectedPartner.toLowerCase());

    return matchesSearch && matchesPartner;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Viện Đào tạo Quốc tế (VN-US) • Đại học Duy Tân
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            14 Chương Trình Đào Tạo Chuẩn Quốc Tế
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Hợp tác chuyển giao cùng Carnegie Mellon University, Penn State University, California State University và Troy University (Mỹ).
          </p>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên ngành, mã ngành, kỹ năng..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Đối tác:
              </span>
              {['ALL', 'TROY', 'CMU', 'PSU', 'CSU'].map(code => (
                <button
                  key={code}
                  onClick={() => setSelectedPartner(code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedPartner === code
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {code === 'ALL' ? 'Tất cả (14)' : code}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Program Results Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold text-slate-500">
            Hiển thị <strong>{filtered.length}</strong> chuyên ngành đào tạo
          </span>
          <Link
            href="/#registration-form"
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
          >
            <span>Đăng ký xét tuyển trực tuyến</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy chuyên ngành phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1">Vui lòng thử tìm kiếm bằng từ khóa khác hoặc bấm chọn "Tất cả".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(program => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
