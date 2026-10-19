'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { STUDY_PROGRAMS } from '@/data/programsData';
import { PROVINCES_AND_SCHOOLS, EXAM_BLOCKS } from '@/data/provincesAndSchools';
import { addLead, sendOmnichannelMessage } from '@/data/storage';
import {
  CheckCircle2,
  AlertCircle,
  Send,
  Sparkles,
  Shield,
  User,
  Phone,
  Mail,
  MapPin,
  School,
  BookOpen,
  QrCode,
  ArrowRight
} from 'lucide-react';

export default function LeadRegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    idCardNumber: '',
    email: '',
    province: 'Đà Nẵng',
    highSchool: 'THPT Chuyên Lê Quý Đôn',
    graduationYear: 2026,
    programId: STUDY_PROGRAMS[0].id,
    secondaryProgramId: STUDY_PROGRAMS[1].id,
    examBlock: 'A00',
    estimatedScore: 24.5,
    source: 'website' as const,
    notes: '',
    agreedPolicy: true,
    websiteUrl: '' // honeypot
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; leadId?: string } | null>(null);

  const selectedProvinceData = PROVINCES_AND_SCHOOLS.find(p => p.name === formData.province);
  const suggestedSchools = selectedProvinceData ? selectedProvinceData.schools : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Bot check (honeypot)
    if (formData.websiteUrl) return;

    // Validation
    const cleanPhone = formData.phone.trim().replace(/[\s\-\.]/g, '');
    if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập số điện thoại di động hợp lệ (10 số, ví dụ: 0981234567 hoặc 0888414141).'
      });
      return;
    }

    const cleanCccd = formData.idCardNumber.replace(/\s/g, '');
    if (cleanCccd && cleanCccd.length !== 12) {
      setStatusMessage({
        type: 'error',
        text: 'Số CCCD / Mã định danh phải đúng 12 chữ số nếu điền.'
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
      const result = addLead({
        fullName: formData.fullName.trim(),
        phone: cleanPhone,
        idCardNumber: cleanCccd || undefined,
        email: formData.email.trim(),
        province: formData.province,
        highSchool: formData.highSchool.trim() || 'Chưa cập nhật',
        graduationYear: 2026,
        programId: formData.programId,
        secondaryProgramId: formData.secondaryProgramId || undefined,
        examBlock: formData.examBlock,
        estimatedScore: Number(formData.estimatedScore) || 24.0,
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
          text: 'Chúc mừng bạn! Yêu cầu tư vấn đã được lưu vào CSDL tuyển sinh. Chuyên viên sẽ liên hệ trong 30 phút.',
          leadId: result.lead?.id
        });

        // Tự động kích hoạt mô phỏng Zalo ZNS
        sendOmnichannelMessage(
          result.lead!.id,
          'zalo_zns',
          'ZNS_WELCOME',
          'Chào mừng bạn đến với Cổng Tuyển sinh Quốc tế VN-US',
          `Chào ${result.lead!.fullName}, cảm ơn bạn đã đăng ký tư vấn ngành ${result.lead!.programName}. Mã hồ sơ của bạn là ${result.lead!.id}. Bạn có thể tra cứu tiến độ bất kỳ lúc nào tại tra-cuu.`
        );

        // Reset
        setFormData({
          fullName: '',
          phone: '',
          idCardNumber: '',
          email: '',
          province: 'Đà Nẵng',
          highSchool: 'THPT Chuyên Lê Quý Đôn',
          graduationYear: 2026,
          programId: STUDY_PROGRAMS[0].id,
          secondaryProgramId: STUDY_PROGRAMS[1].id,
          examBlock: 'A00',
          estimatedScore: 24.5,
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
              Đăng Ký Tư Vấn & Tuyển Sinh Quốc Tế
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Đăng Ký Tư Vấn & Xét Tuyển Học Bổng 13 Tỷ
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Nhận bộ tài liệu PDF hướng dẫn nhập học, thông tin học bổng toàn phần CMU/PSU/CSU/Troy và được chuyên viên tư vấn 1-1 miễn phí.
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 sm:p-8">
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl mb-6 text-xs sm:text-sm flex items-start gap-3 animate-fade-in ${
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
              <p className="font-semibold">{statusMessage.text}</p>
              {statusMessage.leadId && (
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-xs">Mã hồ sơ của bạn: <strong className="font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">{statusMessage.leadId}</strong></span>
                  <Link
                    href={`/tra-cuu`}
                    className="inline-flex items-center gap-1 font-bold text-xs text-blue-700 hover:underline"
                  >
                    <span>Tra cứu tiến độ & Giấy báo QR ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot hidden */}
          <input
            type="text"
            name="websiteUrl"
            value={formData.websiteUrl}
            onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Họ và tên */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Họ và Tên Học Sinh <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Hoàng Long"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Số Điện Thoại (Zalo) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0905123456"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium"
                />
              </div>
            </div>

            {/* Số CCCD */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Số CCCD / Định Danh (12 số)
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Ví dụ: 048208001234 (để tra cứu giấy báo)"
                  value={formData.idCardNumber}
                  onChange={e => setFormData({ ...formData, idCardNumber: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-mono"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hòm Thư Email Nhận Tài Liệu
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="hoanglong.dtu@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium"
                />
              </div>
            </div>

            {/* Tỉnh thành */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tỉnh / Thành Phố <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={formData.province}
                  onChange={e => {
                    const newProv = e.target.value;
                    const provObj = PROVINCES_AND_SCHOOLS.find(p => p.name === newProv);
                    setFormData({
                      ...formData,
                      province: newProv,
                      highSchool: provObj?.schools[0] || 'THPT Khác'
                    });
                  }}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium"
                >
                  {PROVINCES_AND_SCHOOLS.map(p => (
                    <option key={p.id} value={p.name}>{p.name} ({p.region})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Trường THPT */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Trường THPT Đang Học (Gợi ý tự động)
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  list="home-school-suggestions"
                  placeholder="Chọn hoặc nhập trường THPT..."
                  value={formData.highSchool}
                  onChange={e => setFormData({ ...formData, highSchool: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium"
                />
                <datalist id="home-school-suggestions">
                  {suggestedSchools.map(sch => (
                    <option key={sch} value={sch} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Nguyện vọng 1 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nguyện Vọng 1 (Quan Tâm Nhất) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={formData.programId}
                  onChange={e => setFormData({ ...formData, programId: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-bold text-blue-900"
                >
                  {STUDY_PROGRAMS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.partner})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nguyện vọng 2 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nguyện Vọng 2 (Dự Phòng)
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={formData.secondaryProgramId}
                  onChange={e => setFormData({ ...formData, secondaryProgramId: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium text-slate-700"
                >
                  <option value="">-- Không đăng ký NV2 --</option>
                  {STUDY_PROGRAMS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.partner})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Policy agreement */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreedPolicy}
                onChange={e => setFormData({ ...formData, agreedPolicy: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                Tôi đồng ý nhận tài liệu cẩm nang tuyển sinh, thông báo xét duyệt học bổng và cuộc gọi tư vấn 1-1 từ Ban Tuyển sinh VN-US Đại học Duy Tân.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer group"
            >
              {loading ? (
                <span>Đang Gửi Đăng Ký Lên Hệ Thống...</span>
              ) : (
                <>
                  <span>Gửi Đăng Ký Tư Vấn & Nhận Cẩm Nang Ngay</span>
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
