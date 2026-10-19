'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { STUDY_PROGRAMS } from '@/data/programsData';
import { PROVINCES_AND_SCHOOLS, EXAM_BLOCKS } from '@/data/provincesAndSchools';
import { addLead, sendOmnichannelMessage } from '@/data/storage';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  School,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Image as ImageIcon
} from 'lucide-react';

export default function OnlineAdmissionsPortal() {
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
    scoreMath: 8.5,
    scoreLiterature: 8.0,
    scoreEnglish: 8.0,
    notes: ''
  });

  // Uploaded documents state (Base64 or image previews)
  const [transcriptPhotos, setTranscriptPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80'
  ]);
  const [idCardFront, setIdCardFront] = useState<string>(
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedCandidate, setSubmittedCandidate] = useState<any | null>(null);

  // High schools auto suggestion
  const selectedProvinceData = PROVINCES_AND_SCHOOLS.find(p => p.name === formData.province);
  const suggestedSchools = selectedProvinceData ? selectedProvinceData.schools : [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'transcript' | 'idcard') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert file to base64 for instant preview & persistence
    Array.from(files).forEach(f => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (type === 'transcript') {
            setTranscriptPhotos(prev => [...prev, reader.result as string]);
          } else {
            setIdCardFront(reader.result as string);
          }
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation SĐT
    const cleanPhone = formData.phone.replace(/[\s\-\.]/g, '');
    if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
      setErrorMsg('Số điện thoại không hợp lệ (cần đúng 10 chữ số di động Việt Nam).');
      return;
    }

    // Validation CCCD
    const cleanCccd = formData.idCardNumber.replace(/\s/g, '');
    if (cleanCccd && cleanCccd.length !== 12) {
      setErrorMsg('Số Căn cước công dân (CCCD) phải đúng 12 chữ số.');
      return;
    }

    setLoading(true);

    try {
      const res = addLead({
        fullName: formData.fullName.trim(),
        phone: cleanPhone,
        idCardNumber: cleanCccd || undefined,
        email: formData.email.trim(),
        highSchool: formData.highSchool.trim(),
        province: formData.province,
        graduationYear: 2026,
        programId: formData.programId,
        secondaryProgramId: formData.secondaryProgramId || undefined,
        examBlock: formData.examBlock,
        estimatedScore: Number(formData.estimatedScore) || 24.0,
        source: 'website',
        status: 'submitted_app',
        priority: 'high',
        documents: {
          transcriptPhotos,
          idCardFront,
          verificationStatus: 'pending',
          verifiedScoreMath: Number(formData.scoreMath),
          verifiedScoreLiterature: Number(formData.scoreLiterature),
          verifiedScoreEnglish: Number(formData.scoreEnglish),
          verificationNotes: 'Thí sinh nộp trực tuyến qua E-Form Paperless Admissions.'
        },
        notes: formData.notes.trim() || 'Nộp hồ sơ xét tuyển trực tuyến qua E-Form'
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Có lỗi xảy ra khi nộp hồ sơ.');
        setLoading(false);
        return;
      }

      setSubmittedCandidate(res.lead);

      // Tự động kích hoạt mô phỏng Zalo ZNS / SMS
      sendOmnichannelMessage(
        res.lead!.id,
        'zalo_zns',
        'ZNS_APP_RECEIVED',
        'Xác nhận đã tiếp nhận hồ sơ xét tuyển trực tuyến VN-US',
        `Chào bạn ${res.lead!.fullName}, Hội đồng Tuyển sinh VN-US Đại học Duy Tân xác nhận đã tiếp nhận hồ sơ xét tuyển ${res.lead!.id} ngành ${res.lead!.programName}. Cán bộ hậu kiểm sẽ thẩm định minh chứng học bạ trong thời gian sớm nhất!`
      );
    } catch (err: any) {
      setErrorMsg(`Lỗi máy chủ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-800 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Cổng Nộp Hồ Sơ Số Hóa (Paperless Admissions)
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Đăng Ký & Nộp Hồ Sơ Xét Tuyển Trực Tuyến
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Trường Đào tạo Quốc tế (VN-US) – Đại học Duy Tân. Nộp hồ sơ xét tuyển học bổng trực tiếp tại nhà, tải ảnh minh chứng học bạ & CCCD mà không cần phải đến trường.
            </p>
          </div>

          {/* Form Container */}
          {!submittedCandidate ? (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl shadow-blue-900/5">
              
              {errorMsg && (
                <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                
                {/* Phần 1: Thông tin cá nhân */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>1. Thông Tin Cá Nhân Thí Sinh</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Họ và Tên Thí Sinh <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="VD: Nguyễn Hoàng Long"
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Số Điện Thoại (Zalo nhận tin) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="VD: 0905123456"
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Số Căn Cước Công Dân (12 số) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.idCardNumber}
                        onChange={e => setFormData({ ...formData, idCardNumber: e.target.value })}
                        placeholder="VD: 048208001234"
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Hòm Thư Email Nhận Giấy Báo
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="hoanglong.dtu@gmail.com"
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Phần 2: Nơi đang học THPT */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
                    <School className="w-4 h-4 text-blue-600" />
                    <span>2. Trường THPT Đang Học & Địa Bàn Tuyển Sinh</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Tỉnh / Thành Phố</label>
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
                        className="w-full p-3 bg-white border border-slate-300 rounded-xl font-medium"
                      >
                        {PROVINCES_AND_SCHOOLS.map(p => (
                          <option key={p.id} value={p.name}>{p.name} ({p.region})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Trường THPT (Tự động gợi ý chuẩn Bộ GD&ĐT)</label>
                      <input
                        list="public-school-list"
                        value={formData.highSchool}
                        onChange={e => setFormData({ ...formData, highSchool: e.target.value })}
                        placeholder="Chọn hoặc nhập tên trường..."
                        className="w-full p-3 bg-white border border-slate-300 rounded-xl font-medium"
                      />
                      <datalist id="public-school-list">
                        {suggestedSchools.map(sch => (
                          <option key={sch} value={sch} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Phần 3: Nguyện vọng xét tuyển */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>3. Nguyện Vọng Ngành Học & Điểm Xét Tuyển</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Nguyện Vọng 1 (Chính) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.programId}
                        onChange={e => setFormData({ ...formData, programId: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-blue-950"
                      >
                        {STUDY_PROGRAMS.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.partner})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Nguyện Vọng 2</label>
                      <select
                        value={formData.secondaryProgramId}
                        onChange={e => setFormData({ ...formData, secondaryProgramId: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      >
                        <option value="">-- Không đăng ký NV2 --</option>
                        {STUDY_PROGRAMS.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.partner})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Điểm học bạ 3 môn */}
                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
                    <span className="font-bold text-blue-900 block">
                      Điểm Trung Bình 3 Kỳ THPT (Lớp 11 & HK1 Lớp 12):
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Điểm Môn Toán</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={formData.scoreMath}
                          onChange={e => setFormData({ ...formData, scoreMath: Number(e.target.value) })}
                          className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-bold font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Điểm Môn Văn</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={formData.scoreLiterature}
                          onChange={e => setFormData({ ...formData, scoreLiterature: Number(e.target.value) })}
                          className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-bold font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Điểm Môn Ngoại Ngữ</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={formData.scoreEnglish}
                          onChange={e => setFormData({ ...formData, scoreEnglish: Number(e.target.value) })}
                          className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-bold font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phần 4: Tải lên minh chứng (Học bạ & CCCD) */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>4. Tải Lên Minh Chứng Số Hóa (Ảnh Chụp Học Bạ & CCCD)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Học bạ */}
                    <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-800 block text-xs">
                        Ảnh Chụp Học Bạ THPT ({transcriptPhotos.length} ảnh đã đính kèm)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Chụp rõ trang có điểm số HK1 Lớp 12 hoặc cả năm Lớp 11
                      </p>
                      <label className="inline-block px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-blue-700 rounded-xl shadow-2xs cursor-pointer transition">
                        <span>+ Chọn Thêm Ảnh Học Bạ</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={e => handleFileUpload(e, 'transcript')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* CCCD */}
                    <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-800 block text-xs">
                        Ảnh Căn Cước Công Dân (Mặt trước)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Chụp rõ số CCCD và họ tên của thí sinh
                      </p>
                      <label className="inline-block px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-emerald-700 rounded-xl shadow-2xs cursor-pointer transition">
                        <span>+ Tải Ảnh CCCD</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleFileUpload(e, 'idcard')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span>Đang Xử Lý Giao Dịch Nộp Hồ Sơ...</span>
                    ) : (
                      <>
                        <span>Nộp Hồ Sơ Xét Tuyển Trực Tuyến & Nhận Mã Hồ Sơ</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          ) : (
            /* Submission Success Screen */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6 max-w-2xl mx-auto animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                  Đã Nộp Hồ Sơ Thành Công Vào Cơ Sở Dữ Liệu
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  Chúc Mừng Thí Sinh: {submittedCandidate.fullName}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Hội đồng Tuyển sinh đã ghi nhận hồ sơ với mã định danh duy nhất:
                </p>
                <div className="mt-3 inline-block px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 font-mono text-lg font-black text-blue-900">
                  {submittedCandidate.id}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ngành đăng ký (NV1):</span>
                  <span className="font-bold text-slate-900">{submittedCandidate.programName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Số điện thoại liên hệ:</span>
                  <span className="font-mono font-bold">{submittedCandidate.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Trạng thái hồ sơ:</span>
                  <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    Đã nộp hồ sơ (Chờ hậu kiểm)
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/tra-cuu`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Đến Cổng Tra Cứu Tiến Độ & Giấy Báo</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedCandidate(null);
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
                      scoreMath: 8.5,
                      scoreLiterature: 8.0,
                      scoreEnglish: 8.0,
                      notes: ''
                    });
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Nộp Thêm Hồ Sơ Khác
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
