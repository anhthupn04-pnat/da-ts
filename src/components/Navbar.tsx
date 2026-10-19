'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X, ArrowRight, Sparkles, Search, FileText } from 'lucide-react';
import { ADMISSION_CONFIG } from '@/data/admissionConfig';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 sm:gap-3.5 group">
            <div className="bg-white p-1 rounded-xl shadow-xs group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="VN-US Duy Tan University International School"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-900 flex items-center gap-1.5">
                <span className="text-rose-600">VN-US</span>
                <span className="text-slate-300">•</span>
                <span>Đại học Duy Tân</span>
              </span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                Trung tâm Tư vấn & Hỗ trợ Sinh viên
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-700">
            <Link href="/" className="hover:text-blue-900 transition-colors">
              Trang Chủ
            </Link>
            <Link href="/programs" className="hover:text-blue-900 transition-colors flex items-center gap-1.5">
              <span>14 Ngành Quốc Tế</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-900 rounded-md">Hoa Kỳ</span>
            </Link>
            <Link href="/xet-tuyen" className="hover:text-blue-900 transition-colors flex items-center gap-1">
              <FileText className="w-4 h-4 text-blue-800" />
              <span>Nộp Hồ Sơ Online</span>
            </Link>
            <Link href="/tra-cuu" className="hover:text-blue-900 transition-colors flex items-center gap-1">
              <Search className="w-4 h-4 text-amber-600" />
              <span>Tra Cứu Hồ Sơ & QR</span>
            </Link>
            <a href="/#scholarships" className="hover:text-blue-900 transition-colors">
              Học Bổng 13 Tỷ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Đăng nhập nội bộ dành riêng cho Cán bộ & Chuyên viên */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-200/80 shadow-2xs hover:border-blue-300"
              title="Cổng đăng nhập nghiệp vụ dành riêng cho Chuyên viên và Quản trị viên"
            >
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Đăng Nhập Cán Bộ</span>
            </Link>

            <Link
              href="/xet-tuyen"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl shadow-md shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Nộp Hồ Sơ Online</span>
            </Link>
          </div>

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg text-xs font-semibold">
          <div className="pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {ADMISSION_CONFIG.institutionFull}
            </span>
          </div>
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
            14 Ngành Quốc Tế (CMU, PSU, CSU, TROY)
          </Link>
          <Link
            href="/xet-tuyen"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-blue-800 bg-blue-50 font-bold rounded-md"
          >
            Nộp Hồ Sơ Xét Tuyển Trực Tuyến (Paperless)
          </Link>
          <Link
            href="/tra-cuu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-amber-800 bg-amber-50 font-bold rounded-md"
          >
            Tra Cứu Hồ Sơ & Giấy Báo QR
          </Link>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-xl"
            >
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Đăng Nhập Cán Bộ (CRM)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
