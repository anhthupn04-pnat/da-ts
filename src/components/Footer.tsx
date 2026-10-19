import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe, GraduationCap, ShieldCheck, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact-info" className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Introduction */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-xl shadow-xs inline-flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="VN-US Duy Tan University"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">
                  Trung tâm Tư vấn & Hỗ trợ Sinh viên
                </h3>
                <p className="text-xs text-blue-400 font-medium">Trường Đào tạo Quốc tế (VN-US) • ĐH Duy Tân</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Nơi quy tụ các chương trình đại học tiên tiến và du học chuyển tiếp hàng đầu tại miền Trung với sự hợp tác chiến lược cùng các đại học danh tiếng Hoa Kỳ: CMU, Penn State, CSU và Troy University.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 rounded-md border border-emerald-800/50">
                <ShieldCheck className="w-3.5 h-3.5" />
                Kiểm định quốc tế ABET & AACSB
              </span>
            </div>
          </div>

          {/* Col 2: Addresses & Working Hours */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              Địa Chỉ & Thời Gian Làm Việc
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Cơ sở Tòa G (Không gian học tập chuẩn quốc tế):</strong>
                  120 Hoàng Minh Thảo, P. Hòa Khánh Nam, Q. Liên Chiểu, TP. Đà Nẵng
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Văn phòng Tiếp nhận Hồ sơ & Tuyển sinh:</strong>
                  254 Nguyễn Văn Linh, P. Thạc Gián, Q. Thanh Khê, TP. Đà Nẵng
                </div>
              </li>
              <li className="flex items-center gap-2.5 pt-1 text-slate-400">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Thứ 2 - Thứ 7: 07:30 – 17:30 (Trực hotline 24/7)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Hotlines & Direct Contacts */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              Hotline Tư Vấn Trực Tuyến
            </h4>
            <div className="space-y-2.5">
              <a
                href="tel:0979407340"
                className="flex items-center gap-3 p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Hotline Tuyển sinh & Học bổng:</span>
                  <span className="text-sm font-bold text-amber-400">0979 407 340</span>
                </div>
              </a>

              <a
                href="tel:0888414141"
                className="flex items-center gap-3 p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Tư vấn Chương trình CMU / Troy:</span>
                  <span className="text-sm font-bold text-blue-400">0888 41 41 41</span>
                </div>
              </a>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>tuyensinh@dtu.edu.vn</span>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Portals & Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              Cổng Liên Kết Nhanh
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/programs" className="text-slate-300 hover:text-amber-400 transition-colors">
                  • 14 Ngành Đào tạo Quốc tế (CMU, PSU, CSU, TROY)
                </Link>
              </li>
              <li>
                <a href="#scholarships" className="text-slate-300 hover:text-amber-400 transition-colors">
                  • Chính sách Học bổng Quỹ Troy 13 Tỷ
                </a>
              </li>
              <li>
                <a href="#admission-methods" className="text-slate-300 hover:text-amber-400 transition-colors">
                  • 5 Phương thức xét tuyển đại học
                </a>
              </li>
              <li>
                <a href="https://troy.edu.vn" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-1">
                  • Website Đại học Troy Việt Nam <Globe className="w-3 h-3 inline" />
                </a>
              </li>
              <li>
                <a href="https://duytan.edu.vn" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-1">
                  • Cổng thông tin ĐH Duy Tân <Globe className="w-3 h-3 inline" />
                </a>
              </li>
              <li className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/40 text-blue-300 hover:text-white rounded-lg border border-blue-700/50 text-xs font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Cổng Đăng Nhập Cán Bộ CRM
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Trung tâm Tư vấn & Hỗ trợ Sinh viên - Trường Đào tạo Quốc tế (VN-US), Đại học Duy Tân.</p>
          <p className="text-slate-500 text-center sm:text-right">
            Hệ thống quản lý tuyển sinh số hóa • Đạt tiêu chuẩn bảo mật dữ liệu sinh viên
          </p>
        </div>
      </div>
    </footer>
  );
}
