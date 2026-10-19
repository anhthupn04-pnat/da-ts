'use client';

import React, { useState } from 'react';
import { STUDY_PROGRAMS } from '@/data/programsData';
import { addLead } from '@/data/storage';
import { CheckCircle2, AlertCircle, Send, Sparkles, Shield, User, Phone, Mail, MapPin, School, BookOpen, Calendar } from 'lucide-react';

export default function LeadRegistrationForm() {
  const [currentYear, setCurrentYear] = useState<number>(2026);

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    province: 'Đà Nẵng',
    highSchool: '',
    graduationYear: currentYear,
    programId: STUDY_PROGRAMS[0].id,
    source: 'website' as const,
    notes: '',
    agreedPolicy: true,
    // Honeypot for bot detection
    websiteUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; leadId?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Bot check (honeypot)
    if (formData.websiteUrl) {
      return;
    }

    // Validation
    const cleanPhone = formData.phone.trim().replace(/[\s\-\.]/g, '');
    if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập số điện thoại di động hợp lệ (10 số, ví dụ: 0981234567 hoặc 0888414141).'
      });
      return;
    }

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập đầy đủ họ và tên của bạn.'
      });
      return;
    }

    if (!formData.agreedPolicy) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng xác nhận đồng ý nhận tư vấn tuyển sinh.'
      });
      return;
    }

    setLoading(true);

    try {
      // Direct call to storage layer (ensures immediate availability across the app)
      const result = addLead({
        fullName: formData.fullName.trim(),
        phone: cleanPhone,
        email: formData.email.trim(),
        province: formData.province,
        highSchool: formData.highSchool.trim() || 'Chưa cập nhật',
        graduationYear: Number(formData.graduationYear) || currentYear,
        programId: formData.programId,
        source: 'website',
        status: 'new',
        priority: 'high',
        notes: formData.notes.trim() || 'Đăng ký tư vấn trực tuyến từ Cổng thông tin Tuyển sinh.'
      });

      if (!result.success) {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.'
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: 'Chúc mừng bạn! Yêu cầu tư vấn đã được gửi thành công đến Ban Tuyển sinh Viện Đào tạo Quốc tế (VN-US).',
          leadId: result.lead?.id
        });

        // Reset form
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          province: 'Đà Nẵng',
          highSchool: '',
          graduationYear: currentYear,
          programId: STUDY_PROGRAMS[0].id,
          source: 'website',
          notes: '',
          agreedPolicy: true,
          websiteUrl: ''
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Lỗi kết nối hệ thống. Vui lòng kiểm tra đường truyền hoặc gọi trực tiếp Hotline 0979 407 340.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="registration-form" className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-6 sm:px-8 py-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Đăng Ký Tư Vấn Tuyển Sinh Trực Tuyến
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Đăng Ký Tư Vấn & Xét Tuyển Học Bổng
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Nhận bộ tài liệu hướng dẫn nhập học, thông tin xét học bổng 13 Tỷ và được chuyên viên tư vấn 1-1 miễn phí.
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 sm:p-8">
        
        {/* Alerts */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm animate-fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-semibold">{statusMessage.text}</div>
              {statusMessage.leadId && (
                <div className="text-xs text-emerald-700">
                  Mã tiếp nhận hồ sơ: <span className="font-mono font-bold">{statusMessage.leadId}</span>. Chuyên viên sẽ liên hệ lại qua điện thoại / Zalo trong vòng 24 giờ.
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot hidden input */}
          <input
            type="text"
            name="websiteUrl"
            value={formData.websiteUrl}
            onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Họ và tên */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Họ và tên thí sinh <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Số điện thoại (có Zalo) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="09xx xxx xxx hoặc 08xx xxx xxx"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Địa chỉ Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="nhan-tai-lieu@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Tỉnh / Thành phố */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tỉnh / Thành phố <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={formData.province}
                  onChange={e => setFormData({ ...formData, province: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                >
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Quảng Nam">Quảng Nam</option>
                  <option value="Thừa Thiên Huế">Thừa Thiên Huế</option>
                  <option value="Quảng Ngãi">Quảng Ngãi</option>
                  <option value="Quảng Bình">Quảng Bình</option>
                  <option value="Quảng Trị">Quảng Trị</option>
                  <option value="Nghệ An">Nghệ An</option>
                  <option value="Hà Tĩnh">Hà Tĩnh</option>
                  <option value="Bình Định">Bình Định</option>
                  <option value="Khánh Hòa">Khánh Hòa</option>
                  <option value="Gia Lai">Gia Lai</option>
                  <option value="Đắk Lắk">Đắk Lắk</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Khác">Tỉnh thành khác</option>
                </select>
              </div>
            </div>

            {/* Trường THPT */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Trường THPT
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Ví dụ: THPT Phan Châu Trinh, Lê Quý Đôn..."
                  value={formData.highSchool}
                  onChange={e => setFormData({ ...formData, highSchool: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Năm tốt nghiệp THPT / Năm dự kiến xét tuyển */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Năm tốt nghiệp THPT / Xét tuyển <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={formData.graduationYear}
                  onChange={e => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium"
                >
                  <option value={currentYear + 1}>Năm {currentYear + 1} (Học sinh Lớp 11)</option>
                  <option value={currentYear}>Năm {currentYear} (Học sinh Lớp 12 / Năm nay)</option>
                  <option value={currentYear - 1}>Năm {currentYear - 1} (Đã tốt nghiệp THPT)</option>
                  <option value={currentYear - 2}>Năm {currentYear - 2} (Đã tốt nghiệp THPT)</option>
                  <option value={currentYear - 3}>Năm {currentYear - 3} trở về trước</option>
                </select>
              </div>
            </div>

            {/* Ngành học quan tâm */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Chương trình / Ngành học quan tâm <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={formData.programId}
                  onChange={e => setFormData({ ...formData, programId: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium"
                >
                  <optgroup label="Chương trình Du học Troy (Mỹ - Cấp bằng Đại học Troy)">
                    {STUDY_PROGRAMS.filter(p => p.id.startsWith('troy')).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.code}]
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Chương trình Tiên tiến CMU (Mỹ - Đạt kiểm định ABET)">
                    {STUDY_PROGRAMS.filter(p => p.id.startsWith('cmu')).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.code}]
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Chương trình Tiên tiến PSU (Mỹ - Chuẩn AACSB)">
                    {STUDY_PROGRAMS.filter(p => p.id.startsWith('psu')).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.code}]
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Chương trình Tiên tiến CSU (Mỹ - Cal Poly)">
                    {STUDY_PROGRAMS.filter(p => p.id.startsWith('csu')).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.code}]
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* Ghi chú hoặc câu hỏi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Câu hỏi hoặc nguyện vọng học bổng cần giải đáp
            </label>
            <textarea
              rows={2}
              placeholder="Ví dụ: Em muốn hỏi về điều kiện xét học bổng toàn phần CMU với điểm thi 26 điểm; chính sách ký túc xá hay thủ tục xét tuyển..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          {/* Chính sách quyền riêng tư */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="agreedPolicy"
              checked={formData.agreedPolicy}
              onChange={e => setFormData({ ...formData, agreedPolicy: e.target.checked })}
              className="mt-1 w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="agreedPolicy" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
              Tôi đồng ý nhận tài liệu tư vấn tuyển sinh và thông báo học bổng chính thức từ Trung tâm Tư vấn Tuyển sinh Trường Đào tạo Quốc tế (VN-US) – Đại học Duy Tân. Thông tin cá nhân được bảo mật tuyệt đối.
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 hover:from-blue-800 hover:to-slate-950 shadow-md shadow-blue-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Đang xử lý tiếp nhận hồ sơ...
              </span>
            ) : (
              <>
                <span>Gửi Đăng Ký Tư Vấn & Nhận Hướng Dẫn Tuyển Sinh</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Hệ thống bảo vệ dữ liệu thí sinh theo Nghị định 13/2023/NĐ-CP
          </span>
          <span className="hidden sm:inline">Phản hồi qua Zalo trong vòng 24h</span>
        </div>
      </div>
    </div>
  );
}
