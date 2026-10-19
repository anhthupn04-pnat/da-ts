'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, PhoneCall, ShieldCheck, Menu, X, ArrowRight, Sparkles } from 'lucide-react';

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
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-700 transition-colors">
              Trang Chủ
            </Link>
            <Link href="/programs" className="hover:text-blue-700 transition-colors flex items-center gap-1.5">
              <span>14 Ngành Quốc Tế</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-md">QUỐC TẾ</span>
            </Link>
            <a href="#scholarships" className="hover:text-blue-700 transition-colors">
              Học Bổng 13 Tỷ
            </a>
            <a href="#admission-methods" className="hover:text-blue-700 transition-colors">
              5 Phương Thức
            </a>
            <a href="#campus-g" className="hover:text-blue-700 transition-colors">
              Tòa G Hiện Đại
            </a>
            <a href="#contact-info" className="hover:text-blue-700 transition-colors">
              Liên Hệ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 shadow-2xs"
              title="Đăng nhập dành cho cán bộ & chuyên viên các bộ phận tuyển sinh"
            >
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Đăng Nhập Chuyên Viên</span>
            </Link>

            <a
              href="#registration-form"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 rounded-xl shadow-md shadow-blue-600/25 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Đăng Ký Tư Vấn</span>
            </a>
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
        <div className="lg:hidden border-b border-slate-200 bg-white/95 px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-md"
          >
            Trang Chủ
          </Link>
          <Link
            href="/programs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-md"
          >
            14 Ngành Đào Tạo Quốc Tế (CMU, PSU, CSU, TROY)
          </Link>
          <a
            href="#scholarships"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-md"
          >
            Học Bổng Tuyển Sinh 13 Tỷ
          </a>
          <a
            href="#admission-methods"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-md"
          >
            5 Phương Thức Xét Tuyển
          </a>
          <a
            href="#campus-g"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-md"
          >
            Cơ Sở Vật Chất Tòa G
          </a>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-xl"
            >
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Đăng Nhập Cán Bộ & Chuyên Viên</span>
            </Link>
            <a
              href="#registration-form"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-lg shadow-sm"
            >
              <span>Đăng Ký Tư Vấn Trực Tuyến</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
