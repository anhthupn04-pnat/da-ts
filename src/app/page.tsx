'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProgramCard from '@/components/ProgramCard';
import LeadRegistrationForm from '@/components/LeadRegistrationForm';
import { STUDY_PROGRAMS, UNIVERSITY_PARTNERS, ADMISSION_METHODS, SCHOLARSHIP_HIGHLIGHTS } from '@/data/programsData';
import { Sparkles, ArrowRight, ShieldCheck, Award, BookOpen, GraduationCap, Building2, CheckCircle2, ChevronRight, Phone, HelpCircle } from 'lucide-react';

export default function HomePage() {
  const [selectedPartner, setSelectedPartner] = useState<string>('ALL');

  const filteredPrograms = selectedPartner === 'ALL'
    ? STUDY_PROGRAMS
    : STUDY_PROGRAMS.filter(p => p.id.startsWith(selectedPartner.toLowerCase()));

  const faqs = [
    {
      q: 'Chương trình Troy cấp bằng gì và có được Bộ Giáo dục & Đào tạo công nhận không?',
      a: 'Sinh viên theo học chương trình Đại học Troy tại Đà Nẵng nhận 100% bằng Cử nhân chính quy do Đại học Troy (Mỹ) cấp, được Bộ GD&ĐT Việt Nam công nhận văn bằng và có giá trị sử dụng trên toàn thế giới.'
    },
    {
      q: 'Điều kiện nhận Học bổng toàn phần VN-US và Quỹ học bổng Troy 13 Tỷ là gì?',
      a: 'Thí sinh đạt tổng điểm 3 môn từ 25 điểm trở lên trong kỳ thi Tốt nghiệp THPT 2026 sẽ được xét nhận học bổng toàn phần các ngành CMU, PSU, CSU. Với Quỹ học bổng Troy 13 Tỷ, thí sinh có điểm THPT từ 23-26đ hoặc có chứng chỉ IELTS từ 5.5+ sẽ nhận các mức học bổng giá trị toàn khóa.'
    },
    {
      q: 'Kiểm định ABET và AACSB có ý nghĩa gì đối với sinh viên?',
      a: 'ABET (Hoa Kỳ) là chuẩn kiểm định kỹ thuật - công nghệ khắt khe nhất thế giới (các ngành CMU ĐH Duy Tân đạt chuẩn này). AACSB là kiểm định chất lượng đào tạo kinh doanh hàng đầu Hoa Kỳ (áp dụng cho các ngành PSU). Sinh viên tốt nghiệp từ chương trình có kiểm định quốc tế được các tập đoàn đa quốc gia săn đón và ưu tiên chuyển tiếp học bổng sau đại học.'
    },
    {
      q: 'Em học lực Khá có thể xét tuyển bằng học bạ được không?',
      a: 'Hoàn toàn được! Phương thức 3 cho phép xét kết quả học tập THPT năm Lớp 12 hoặc trung bình cả 3 năm THPT đạt từ 18 điểm trở lên cho tổ hợp 3 môn.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-amber-300 border border-amber-400/30 backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Cổng Thông Tin Tuyển Sinh & Tư Vấn Hướng Nghiệp K32 (2026)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Trung tâm Tư vấn & <br />
              <span className="text-gradient-gold">Hỗ trợ Sinh viên</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              Trường Đào tạo Quốc tế (VN-US) – Đại học Duy Tân. Nơi chuyển giao 100% giáo trình từ các đại học hàng đầu Hoa Kỳ: <strong>Carnegie Mellon, Penn State, CSU và Troy University</strong>.
            </p>

            {/* CTA action buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/xet-tuyen"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Nộp Hồ Sơ Xét Tuyển Online</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>

              <Link
                href="/tra-cuu"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-blue-600/60 hover:bg-blue-600/90 border border-blue-400/30 backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <span>Tra Cứu Tiến Độ & Giấy Báo QR</span>
              </Link>

              <a
                href="#registration-form"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-blue-300" />
                <span>Đăng Ký Tư Vấn 1-1</span>
              </a>

              <Link
                href="/admin"
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl font-semibold text-xs text-blue-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Cổng Quản Trị CRM</span>
              </Link>
            </div>

            {/* Key trust indicators */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-2xl font-extrabold text-amber-400">14 Ngành</span>
                <p className="text-xs text-slate-300 mt-0.5">Chuẩn đào tạo Hoa Kỳ tiên tiến</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-2xl font-extrabold text-amber-400">13 Tỷ VNĐ</span>
                <p className="text-xs text-slate-300 mt-0.5">Quỹ học bổng Đại học Troy & VN-US</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-2xl font-extrabold text-amber-400">ABET & AACSB</span>
                <p className="text-xs text-slate-300 mt-0.5">Kiểm định chất lượng quốc tế</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-2xl font-extrabold text-amber-400">Tòa G</span>
                <p className="text-xs text-slate-300 mt-0.5">184 phòng học, 1.300 máy tính</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* University Partners Section */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Đối tác Chiến Lược Quốc Tế
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Hợp Tác Toàn Diện Với Các Đại Học Hàng Đầu Hoa Kỳ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {UNIVERSITY_PARTNERS.map(partner => (
              <div
                key={partner.code}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-black text-blue-900 tracking-wider font-mono">
                      {partner.logoText}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                      {partner.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {partner.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {partner.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Programs Section (14 Majors) */}
      <section id="programs-section" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Danh Mục Đào Tạo K32
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
              14 Chương Trình Quốc Tế Xuất Sắc
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Chương trình đào tạo chuyển giao nguyên bản từ các trường Đại học Hoa Kỳ, nhận chứng nhận hoàn tất quốc tế và bằng cấp được công nhận toàn cầu.
            </p>

            {/* Filter Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setSelectedPartner('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedPartner === 'ALL'
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tất cả (14 ngành)
              </button>
              <button
                onClick={() => setSelectedPartner('TROY')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedPartner === 'TROY'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                ĐH Troy (Mỹ - Bằng Mỹ)
              </button>
              <button
                onClick={() => setSelectedPartner('CMU')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedPartner === 'CMU'
                    ? 'bg-rose-700 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Carnegie Mellon (CNTT & An Ninh Mạng)
              </button>
              <button
                onClick={() => setSelectedPartner('PSU')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedPartner === 'PSU'
                    ? 'bg-indigo-700 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Penn State (Kinh Tế & FinTech)
              </button>
              <button
                onClick={() => setSelectedPartner('CSU')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedPartner === 'CSU'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                CSU Cal Poly (Kiến Trúc & Xây Dựng)
              </button>
            </div>
          </div>

          {/* Grid of Programs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map(program => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
            >
              <span>Xem Bảng So Sánh & Chi Tiết Lộ Trình 14 Ngành</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Scholarship Section */}
      <section id="scholarships" className="py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Chính Sách Khuyến Học K32 (2026)
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1.5 tracking-tight">
              Quỹ Học Bổng Hơn 13 Tỷ Đồng
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Đồng hành cùng tài năng trẻ Việt Nam hiện thực hóa ước mơ học tập chuẩn quốc tế với các gói học bổng toàn phần và bán phần danh giá.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SCHOLARSHIP_HIGHLIGHTS.map((item, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 block tracking-tight">
                    {item.value}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-white/10">
                  <a
                    href="#registration-form"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200"
                  >
                    <span>Nộp hồ sơ xét học bổng</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Admission Methods Section */}
      <section id="admission-methods" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Phương Thức Tuyển Sinh K32
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
              05 Phương Thức Xét Tuyển Linh Hoạt
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Đại học Duy Tân tạo mọi điều kiện thuận lợi nhất để thí sinh phát huy thế mạnh cá nhân và chủ động cơ hội trúng tuyển sớm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADMISSION_METHODS.map(method => (
              <div
                key={method.id}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-blue-400 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-blue-700 font-mono">
                      {method.number}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
                      {method.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {method.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {method.criteria}
                  </p>
                </div>
              </div>
            ))}

            {/* Support box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">
                  Cần Hỗ Trợ Xét Hồ Sơ?
                </span>
                <h3 className="text-lg font-bold text-white">
                  Đội ngũ Chuyên viên Tư vấn Trực tuyến 24/7
                </h3>
                <p className="text-xs text-blue-100 mt-2 leading-relaxed">
                  Gọi hotline hoặc để lại thông tin để được kiểm tra điểm chuẩn dự kiến và hướng dẫn chuẩn bị hồ sơ đầy đủ nhất.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-3">
                <a
                  href="tel:0979407340"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl transition"
                >
                  Gọi 0979 407 340
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus G Showcase */}
      <section id="campus-g" className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Cơ Sở Vật Chất Hiện Đại Bậc Nhất Miền Trung
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Tòa G — Biểu Tượng Mới Của Không Gian Học Tập Quốc Tế
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tọa lạc tại <strong>120 Hoàng Minh Thảo, P. Hòa Khánh Nam, Q. Liên Chiểu, TP. Đà Nẵng</strong>, Tòa G được thiết kế chủ đạo bằng kính hiện đại, mang trọn bầu trời xanh vào từng phòng học.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-2xl font-bold text-blue-700 block">184+</span>
                  <span className="text-xs text-slate-600">Phòng học & Phòng Lab trang bị điều hòa 100%</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-2xl font-bold text-blue-700 block">1.300+</span>
                  <span className="text-xs text-slate-600">Máy tính phục vụ khối CNTT, An ninh mạng</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-2xl font-bold text-blue-700 block">3 Thư Viện</span>
                  <span className="text-xs text-slate-600">Diện tích 1.820m² với hơn 58.000 đầu sách</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-2xl font-bold text-blue-700 block">150+</span>
                  <span className="text-xs text-slate-600">Doanh nghiệp hợp tác thực tập & việc làm</span>
                </div>
              </div>
            </div>

            {/* Registration Form container on right */}
            <div>
              <LeadRegistrationForm />
            </div>

          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Giải Đáp Thắc Mắc
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Câu Hỏi Thường Gặp Về Tuyển Sinh K32
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-6.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
