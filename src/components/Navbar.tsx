'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Menu, X, ArrowRight, Sparkles, Search, FileText } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider font-bold text-blue-700">
                Trường Đào tạo Quốc tế (VN-US) • ĐH Duy Tân
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                Trung tâm Tư vấn & Hỗ trợ Sinh viên
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-700 transition-colors">
              Trang Chủ
            </Link>
            <Link href="/programs" className="hover:text-blue-700 transition-colors flex items-center gap-1.5">
              <span>14 Ngành Quốc Tế</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">K32</span>
            </Link>
            <Link href="/xet-tuyen" className="hover:text-blue-700 transition-colors flex items-center gap-1">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Nộp Hồ Sơ Online</span>
            </Link>
            <Link href="/tra-cuu" className="hover:text-blue-700 transition-colors flex items-center gap-1">
              <Search className="w-4 h-4 text-amber-600" />
              <span>Tra Cứu & Giấy Báo QR</span>
            </Link>
            <a href="/#scholarships" className="hover:text-blue-700 transition-colors">
              Học Bổng 13 Tỷ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 shadow-2xs"
              title="Đăng nhập dành cho cán bộ & chuyên viên các bộ phận tuyển sinh"
            >
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Cổng CRM</span>
            </Link>

            <Link
              href="/xet-tuyen"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-md shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Nộp Hồ Sơ K32</span>
            </Link>
          </div>

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg text-xs font-semibold">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-slate-800 hover:bg-slate-50 rounded-md"
          >
            Trang Chủ
          </Link>
          <Link
            href="/programs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-slate-800 hover:bg-slate-50 rounded-md"
          >
            14 Ngành Quốc Tế K32 (CMU, PSU, CSU, TROY)
          </Link>
          <Link
            href="/xet-tuyen"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-blue-700 bg-blue-50 font-bold rounded-md"
          >
            Nộp Hồ Sơ Xét Tuyển Trực Tuyến (Paperless)
          </Link>
          <Link
            href="/tra-cuu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-amber-700 bg-amber-50 font-bold rounded-md"
          >
            Tra Cứu Hồ Sơ & Kết Quả (VietQR & Giấy Báo)
          </Link>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-xl"
            >
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Đăng Nhập Cán Bộ CRM</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
