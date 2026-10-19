'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllRawLeads, simulatePaymentAutoClear } from '@/data/storage';
import { Lead } from '@/types';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  QrCode,
  ArrowRight,
  Printer,
  ShieldCheck,
  Calendar,
  Building2,
  GraduationCap,
  Sparkles,
  Phone,
  Clock,
  ArrowLeft,
  X
} from 'lucide-react';

export default function PublicLookupPortal() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [candidate, setCandidate] = useState<Lead | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<'app_fee' | 'tuition_deposit'>('app_fee');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const clean = query.replace(/[\s\-\.]/g, '').toLowerCase();

    const all = getAllRawLeads();
    const found = all.find(l => {
      const p = l.phone.replace(/[\s\-\.]/g, '');
      const c = (l.idCardNumber || '').replace(/[\s\-\.]/g, '');
      const id = l.id.toLowerCase();
      return p === clean || c === clean || id === clean;
    });

    setCandidate(found || null);
  };

  const handleSimulatePayment = () => {
    if (!candidate) return;
    const amount = selectedFee === 'app_fee' ? 50000 : 5000000;
    const res = simulatePaymentAutoClear(candidate.id, amount, 'vietqr');
    if (res.success && res.lead) {
      setCandidate(res.lead);
      setPaymentSuccessMsg(`Thanh toán thành công ${amount.toLocaleString('vi-VN')} VNĐ qua VietQR! Hệ thống đã tự động gạch nợ.`);
      setPaymentModalOpen(false);
      setTimeout(() => setPaymentSuccessMsg(null), 5000);
    }
  };

  // Pipeline steps for student tracking
  const steps = [
    { title: 'Tiếp nhận hồ sơ', desc: 'Đã lưu trên cổng tuyển sinh', active: true },
    { title: 'Tư vấn hướng nghiệp', desc: 'Chuyên viên trao đổi lộ trình & học bổng', active: candidate?.status !== 'new' && candidate?.status !== 'unreachable' },
    { title: 'Hậu kiểm minh chứng', desc: 'Thẩm định điểm học bạ THPT & CCCD', active: candidate?.status === 'submitted_app' || candidate?.status === 'conditional_admit' || candidate?.status === 'confirmed_enroll' || candidate?.status === 'tuition_paid' },
    { title: 'Trúng tuyển có điều kiện', desc: 'Cấp Giấy báo trúng tuyển điện tử kèm QR', active: candidate?.status === 'conditional_admit' || candidate?.status === 'confirmed_enroll' || candidate?.status === 'tuition_paid' },
    { title: 'Xác nhận nhập học', desc: 'Hoàn tất thủ tục hồ sơ nhập học chính thức', active: candidate?.status === 'confirmed_enroll' || candidate?.status === 'tuition_paid' || candidate?.paymentStatus === 'tuition_paid' }
  ];

  const feeAmount = 50000;
  const qrTransferContent = candidate ? `TS_${candidate.idCardNumber || candidate.phone}` : 'TS_VNUS';
  // Chuẩn VietQR API link động
  const vietQrImageUrl = `https://img.vietqr.io/image/970415-110000123456-compact2.png?amount=${feeAmount}&addInfo=${encodeURIComponent(qrTransferContent)}&accountName=TRUONG%20DAI%20HOC%20DUY%20TAN%20VNUS`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Cổng Tra Cứu Trực Tuyến Chính Thức
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tra Cứu Hồ Sơ & Kết Quả Xét Tuyển
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Trường Đào tạo Quốc tế (VN-US) - Đại học Duy Tân. Nhập số Căn cước công dân (CCCD), Số điện thoại hoặc Mã hồ sơ để kiểm tra tiến độ, nhận Giấy báo trúng tuyển và hoàn tất thủ tục.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-blue-900/5">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Nhập Số CCCD (12 số) hoặc Số điện thoại thí sinh (VD: 0981234567, 048208001234)..."
                  className="w-full pl-12 pr-4 py-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Tra Cứu Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Gợi ý thử nghiệm: <code className="text-blue-700 font-bold">0981234567</code> hoặc <code className="text-blue-700 font-bold">048308005678</code></span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Xác thực dữ liệu tức thì
              </span>
            </div>
          </div>

          {/* Toast Payment Success */}
          {paymentSuccessMsg && (
            <div className="p-4 bg-emerald-600 text-white rounded-2xl text-xs sm:text-sm font-bold text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>{paymentSuccessMsg}</span>
            </div>
          )}

          {/* Result Section */}
          {searched && (
            <div>
              {candidate ? (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Candidate Overview Card */}
                  <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <GraduationCap className="w-48 h-48" />
                    </div>

                    <div className="relative z-10 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-amber-400/30">
                          Mã hồ sơ: {candidate.id}
                        </span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                          Trạng thái: {candidate.status}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                          {candidate.fullName}
                        </h2>
                        <p className="text-xs sm:text-sm text-blue-200 mt-1">
                          Trường: <strong>{candidate.highSchool}</strong> ({candidate.province || 'Đà Nẵng'})
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                        <div className="p-3 bg-white/5 rounded-2xl">
                          <span className="text-slate-400 block text-[11px]">Ngành Đăng Ký Xét Tuyển (NV1)</span>
                          <span className="font-bold text-amber-300 text-sm">{candidate.programName}</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl">
                          <span className="text-slate-400 block text-[11px]">Tình Trạng Lệ Phí Xét Tuyển</span>
                          <span className="font-bold text-emerald-400 text-sm">
                            {candidate.paymentStatus === 'tuition_paid' || candidate.status === 'confirmed_enroll' ? 'Đã hoàn tất thủ tục nhập học' : candidate.paymentStatus === 'deposit_paid' ? 'Đã nộp lệ phí xét tuyển' : 'Chưa nộp lệ phí'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons on Card */}
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setPaymentModalOpen(true)}
                          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 text-slate-950" />
                          <span>Nộp Lệ Phí Xét Tuyển Hồ Sơ (VietQR)</span>
                        </button>

                        <button
                          onClick={() => window.print()}
                          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center gap-2 cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-blue-300" />
                          <span>In Phiếu Tra Cứu</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md space-y-6">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Tiến Độ Xét Tuyển Thí Sinh (Admissions Pipeline)
                    </h3>

                    <div className="space-y-4">
                      {steps.map((st, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                            st.active ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {st.active ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          <div className="pt-1">
                            <h4 className={`text-xs sm:text-sm font-bold ${st.active ? 'text-slate-900' : 'text-slate-400'}`}>
                              {st.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">{st.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Official Electronic Admission Certificate */}
                  {(candidate.status === 'conditional_admit' || candidate.status === 'confirmed_enroll' || candidate.status === 'tuition_paid') && (
                    <div className="bg-white p-8 rounded-3xl border-2 border-blue-900/40 shadow-xl space-y-6 text-slate-800 font-serif">
                      <div className="text-center border-b border-slate-200 pb-5">
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-900 block font-sans">
                          BỘ GIÁO DỤC VÀ ĐÀO TẠO • TRƯỜNG ĐẠI HỌC DUY TÂN
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 block font-sans mt-0.5">
                          TRƯỜNG ĐÀO TẠO QUỐC TẾ (VN-US) – CHƯƠNG TRÌNH ĐÀO TẠO HOA KỲ
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-950 mt-4 uppercase">
                          GIẤY BÁO TRÚNG TUYỂN ĐIỆN TỬ CÓ ĐIỀU KIỆN
                        </h2>
                        <span className="text-xs text-slate-500 font-sans block mt-1">Chương trình Tuyển sinh Đại học Quốc tế VN-US</span>
                      </div>

                      <div className="space-y-3 text-xs leading-relaxed font-sans">
                        <p>Hội đồng Tuyển sinh trân trọng chúc mừng thí sinh:</p>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 font-medium">
                          <div>Họ và tên: <strong className="text-slate-900 text-sm">{candidate.fullName}</strong></div>
                          <div>Mã định danh hồ sơ: <strong className="font-mono text-blue-700">{candidate.id}</strong></div>
                          <div>Số CCCD: <strong className="font-mono">{candidate.idCardNumber || 'Đang cập nhật'}</strong></div>
                          <div>Trường THPT: <strong>{candidate.highSchool}</strong> ({candidate.province})</div>
                          <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                            Ngành trúng tuyển: <strong className="text-blue-900 text-sm">{candidate.programName}</strong>
                          </div>
                        </div>

                        <p className="text-slate-600 italic">
                          Thí sinh đủ điều kiện trúng tuyển chính thức khi hoàn tất tốt nghiệp THPT năm 2026 và nộp bản chính Giấy chứng nhận kết quả thi / Học bạ về trường theo đúng thời hạn quy định.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 font-sans">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-300 flex items-center justify-center shadow-xs">
                            <QrCode className="w-16 h-16 text-slate-900" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Mã QR Xác Thực Trực Tuyến</span>
                            <span className="text-xs font-mono font-bold text-blue-700">DTU-VNUS-{candidate.id}</span>
                            <span className="text-[11px] text-emerald-600 block flex items-center gap-1 mt-0.5">
                              <ShieldCheck className="w-3.5 h-3.5" /> Có giá trị xác thực toàn cầu
                            </span>
                          </div>
                        </div>

                        <div className="text-center sm:text-right text-xs">
                          <span className="italic block text-[11px]">Đà Nẵng, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm 2026</span>
                          <span className="font-bold text-blue-900 block mt-1 uppercase">CHỦ TỊCH HỘI ĐỒNG TUYỂN SINH</span>
                          <div className="mt-4 flex items-center justify-center sm:justify-end gap-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Đã ký số điện tử bảo mật</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-md space-y-3">
                  <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Không tìm thấy hồ sơ với thông tin tra cứu: "{query}"
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Vui lòng kiểm tra lại số điện thoại hoặc số CCCD đã đăng ký. Nếu bạn vừa nộp hồ sơ, vui lòng chờ trong giây lát hoặc liên hệ Hotline: <strong>0236.3650403</strong> để được trợ giúp.
                  </p>
                  <Link
                    href="/xet-tuyen"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs mt-2"
                  >
                    <span>Nộp Đơn Xét Tuyển Trực Tuyến Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ================= MODAL: CỔNG THANH TOÁN VIETQR ĐỘNG TÍCH HỢP ================= */}
      {paymentModalOpen && candidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fade-in text-xs">
            
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Cổng Thanh Toán Điện Tử VietQR (Napas247)</h3>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Fee Information - Pure application fee, zero tuition fee */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 block">Dịch Vụ Xét Tuyển</span>
                  <span className="text-sm font-extrabold text-blue-900 block mt-0.5">Lệ Phí Xét Tuyển Hồ Sơ Trực Tuyến</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-blue-700">50.000 VNĐ</span>
                </div>
              </div>

              {/* VietQR Dynamic Code Display */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Quét Mã VietQR Bằng Bất Kỳ Ứng Dụng Ngân Hàng Hoặc Ví Điện Tử
                </span>

                <div className="w-56 h-56 mx-auto bg-white p-2 rounded-2xl border border-slate-300 shadow-md flex items-center justify-center">
                  <img
                    src={vietQrImageUrl}
                    alt="VietQR Napas247"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-1 text-left bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
                  <div>Tài khoản thụ hưởng: <strong>110000123456</strong> (VietinBank)</div>
                  <div>Tên người nhận: <strong>TRUONG DAI HOC DUY TAN - VNUS</strong></div>
                  <div>Số tiền: <strong className="text-blue-700">50.000 VNĐ</strong></div>
                  <div>Nội dung chuyển khoản: <strong className="text-rose-600">{qrTransferContent}</strong></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Hệ thống đối soát tự động: Khi nhận chuyển khoản hợp lệ, hồ sơ sẽ được cập nhật trạng thái "Đã nộp lệ phí xét tuyển".</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium"
                >
                  Đóng
                </button>

                {/* Simulate Payment Confirmation */}
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận Đã Chuyển Khoản & Gạch Nợ Tự Động</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
