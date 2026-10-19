'use client';

import React, { useState } from 'react';
import {
  Lead,
  ConsultationHistory,
  LeadStatus,
  ContactMethod,
  LeadPriority,
  ParentAttitude
} from '@/types';
import {
  updateLead,
  addConsultationLog,
  getConsultationLogs,
  getCurrentUser,
  maskPhone,
  maskIdCard,
  addAuditLog,
  sendOmnichannelMessage,
  simulatePaymentAutoClear,
  getStaffList
} from '@/data/storage';
import { STUDY_PROGRAMS } from '@/data/programsData';
import {
  X,
  Phone,
  Mail,
  MapPin,
  School,
  BookOpen,
  Calendar,
  CheckCircle2,
  User,
  MessageSquare,
  Send,
  Award,
  History,
  Eye,
  EyeOff,
  QrCode,
  CreditCard,
  FileCheck,
  Star,
  ExternalLink,
  ShieldCheck,
  Check,
  Sparkles
} from 'lucide-react';

interface LeadModalProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export default function LeadModal({ lead, onClose, onLeadUpdated }: LeadModalProps) {
  if (!lead) return null;

  const currentUser = getCurrentUser();
  const staffList = getStaffList();
  const [currentLead, setCurrentLead] = useState<Lead>(lead);
  const [logs, setLogs] = useState<ConsultationHistory[]>(getConsultationLogs(lead.id));
  
  // Data masking state
  const [phoneUnmasked, setPhoneUnmasked] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'documents' | 'admission_letter'>('timeline');

  // Consultation form state
  const [newLog, setNewLog] = useState({
    contactMethod: 'call' as ContactMethod,
    parentAttitude: 'considering' as ParentAttitude,
    rating: 4,
    content: '',
    outcome: '',
    nextFollowUpDate: ''
  });
  const [savingLog, setSavingLog] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Omnichannel message modal
  const [msgChannel, setMsgChannel] = useState<'zalo_zns' | 'sms_brandname'>('zalo_zns');

  // Trạng thái 10 bước chuẩn hóa
  const PIPELINE_STATUSES: { code: LeadStatus; label: string; color: string }[] = [
    { code: 'new', label: '1. Mới tiếp nhận', color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { code: 'unreachable', label: '2. Chưa liên hệ được', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { code: 'consulted_1', label: '3. Đã tư vấn lần 1', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { code: 'hot_lead', label: '4. Quan tâm cao (Nóng)', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { code: 'waiting_transcript', label: '5. Chờ học bạ', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { code: 'submitted_app', label: '6. Đã nộp hồ sơ xét tuyển', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    { code: 'conditional_admit', label: '7. Trúng tuyển có điều kiện', color: 'bg-teal-100 text-teal-800 border-teal-300' },
    { code: 'confirmed_enroll', label: '8. Đã xác nhận nhập học', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    { code: 'tuition_paid', label: '9. Đã đóng học phí', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { code: 'cancelled', label: '10. Từ chối / Hủy', color: 'bg-rose-100 text-rose-800 border-rose-300' }
  ];

  const handleStatusChange = (status: LeadStatus) => {
    const res = updateLead(lead.id, { status });
    if (res.success && res.lead) {
      setCurrentLead(res.lead);
      onLeadUpdated();
      showToast(`Đã chuyển trạng thái sang: ${PIPELINE_STATUSES.find(s => s.code === status)?.label}!`);
    }
  };

  const handlePriorityChange = (priority: LeadPriority) => {
    const res = updateLead(lead.id, { priority });
    if (res.success && res.lead) {
      setCurrentLead(res.lead);
      onLeadUpdated();
      showToast('Đã cập nhật mức độ ưu tiên!');
    }
  };

  const handleAssignChange = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    const res = updateLead(lead.id, {
      assignedTo: staffId,
      assignedToName: staff ? staff.fullName : undefined
    });
    if (res.success && res.lead) {
      setCurrentLead(res.lead);
      onLeadUpdated();
      showToast(`Đã phân bổ cho chuyên viên ${staff?.fullName}!`);
    }
  };

  const handleUnmaskPhone = () => {
    setPhoneUnmasked(true);
    addAuditLog('UNMASK_PHONE', 'candidates', lead.id, null, { action: 'Xem số điện thoại đầy đủ để gọi tư vấn' }, currentUser);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.content.trim()) return;

    setSavingLog(true);

    const log = addConsultationLog({
      leadId: lead.id,
      staffId: currentUser.id,
      staffName: currentUser.fullName,
      contactMethod: newLog.contactMethod,
      parentAttitude: newLog.parentAttitude,
      rating: newLog.rating,
      content: newLog.content.trim(),
      outcome: newLog.outcome.trim() || 'Đã ghi nhận nội dung trao đổi.',
      nextFollowUpDate: newLog.nextFollowUpDate || undefined
    });

    // Tự động nâng trạng thái nếu đang ở 'new' hoặc 'unreachable'
    if (currentLead.status === 'new' || currentLead.status === 'unreachable') {
      const res = updateLead(lead.id, { status: 'consulted_1' });
      if (res.success && res.lead) {
        setCurrentLead(res.lead);
      }
    }

    setLogs([log, ...logs]);
    setNewLog({
      contactMethod: 'call',
      parentAttitude: 'considering',
      rating: 4,
      content: '',
      outcome: '',
      nextFollowUpDate: ''
    });
    setSavingLog(false);
    onLeadUpdated();
    showToast('Đã lưu nhật ký tư vấn & đặt lịch nhắc chăm sóc!');
  };

  // Mô phỏng gửi tin nhắn ZNS/SMS
  const handleSendOmnichannel = () => {
    const templateName = msgChannel === 'zalo_zns'
      ? 'ZNS_FOLLOW_UP_GUIDE: Hướng dẫn nộp học bạ và cẩm nang tân sinh viên K32'
      : 'SMS_APPOINTMENT_REMIND: Nhắc lịch hẹn tham quan trải nghiệm Tòa G 120 Hoàng Minh Thảo';

    sendOmnichannelMessage(
      currentLead.id,
      msgChannel,
      msgChannel === 'zalo_zns' ? 'ZNS_01' : 'SMS_01',
      templateName,
      `Chào bạn ${currentLead.fullName}, chuyên viên ${currentUser.fullName} đã gửi tài liệu tuyển sinh cho bạn.`
    );

    showToast(`Đã gửi tự động qua ${msgChannel === 'zalo_zns' ? 'Zalo ZNS' : 'SMS Brandname'} thành công!`);
  };

  // Mô phỏng gạch nợ học phí tức thì (Instant VietQR payment)
  const handleSimulatePayment = (amount: number) => {
    const res = simulatePaymentAutoClear(currentLead.id, amount, 'vietqr');
    if (res.success && res.lead) {
      setCurrentLead(res.lead);
      onLeadUpdated();
      showToast(`Đã gạch nợ tự động ${amount.toLocaleString('vi-VN')} VNĐ qua VietQR!`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              {currentLead.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {currentLead.fullName}
                </h3>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {currentLead.id}
                </span>
                {currentLead.paymentStatus === 'tuition_paid' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Đã Hoàn Tất Học Phí
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                NV1: <strong>{currentLead.programName || currentLead.programId}</strong>
                {currentLead.secondaryProgramName && (
                  <span className="text-slate-300 ml-2">• NV2: {currentLead.secondaryProgramName}</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inner Toast */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-inner animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Trạng thái:</span>
            <select
              value={currentLead.status}
              onChange={e => handleStatusChange(e.target.value as LeadStatus)}
              className="font-bold text-xs p-1.5 rounded-xl border border-blue-400 bg-white text-blue-900 shadow-2xs"
            >
              {PIPELINE_STATUSES.map(s => (
                <option key={s.code} value={s.code}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Officer assign */}
          {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Chuyên viên phụ trách:</span>
              <select
                value={currentLead.assignedTo || ''}
                onChange={e => handleAssignChange(e.target.value)}
                className="font-medium text-xs p-1.5 rounded-xl border border-slate-300 bg-white text-slate-800"
              >
                <option value="">-- Chưa phân công --</option>
                {staffList.filter(s => s.role === 'counselor').map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.assignedRegion || 'Toàn ban'})</option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Omnichannel & VietQR */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendOmnichannel}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Gửi tin nhắn mẫu tự động qua Zalo ZNS / SMS"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi ZNS / SMS</span>
            </button>

            {currentLead.paymentStatus !== 'tuition_paid' && (
              <button
                onClick={() => handleSimulatePayment(5000000)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Mô phỏng quét mã VietQR và tự động gạch nợ học phí"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Gạch Nợ Học Phí (VietQR)</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'timeline' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Nhật Ký Tư Vấn & Timeline ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ Sơ Chi Tiết & Bảo Mật</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Minh Chứng Học Bạ & CCCD</span>
            {currentLead.documents?.verificationStatus && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-teal-100 text-teal-800 font-mono">
                {currentLead.documents.verificationStatus}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('admission_letter')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'admission_letter' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Giấy Báo Trúng Tuyển Điện Tử (QR)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* ================= TAB 1: TIMELINE & NHẬT KÝ ================= */}
          {activeTab === 'timeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form thêm nhật ký mới */}
              <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Ghi Lại Nội Dung Tư Vấn Mới
                </h4>

                <form onSubmit={handleAddLog} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Hình thức</label>
                      <select
                        value={newLog.contactMethod}
                        onChange={e => setNewLog({ ...newLog, contactMethod: e.target.value as ContactMethod })}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl font-medium"
                      >
                        <option value="call">Điện thoại Hotline</option>
                        <option value="zalo">Nhắn tin Zalo</option>
                        <option value="meeting">Tư vấn trực tiếp</option>
                        <option value="facebook">Facebook Messenger</option>
                        <option value="email">Gửi Email</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Thái độ học sinh/PH</label>
                      <select
                        value={newLog.parentAttitude}
                        onChange={e => setNewLog({ ...newLog, parentAttitude: e.target.value as ParentAttitude })}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl font-medium"
                      >
                        <option value="very_interested">Rất hào hứng (Nóng)</option>
                        <option value="considering">Đang cân nhắc</option>
                        <option value="hesitant_tuition">Lo ngại mức học phí</option>
                        <option value="neutral">Bình thường</option>
                        <option value="negative">Từ chối / Khó tiếp cận</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Đánh giá độ tiềm năng: {newLog.rating} / 5 Sao
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewLog({ ...newLog, rating: star })}
                          className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${star <= newLog.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nội dung cuộc trao đổi <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={newLog.content}
                      onChange={e => setNewLog({ ...newLog, content: e.target.value })}
                      placeholder="Ghi chi tiết câu hỏi của thí sinh, mức điểm thi, nguyện vọng học bổng..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Kết quả & Hướng xử lý</label>
                    <input
                      type="text"
                      value={newLog.outcome}
                      onChange={e => setNewLog({ ...newLog, outcome: e.target.value })}
                      placeholder="VD: Hẹn gửi tài liệu qua Zalo; đã gửi link nộp học bạ..."
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-blue-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Hẹn ngày chăm sóc lại (Follow-up Reminder)
                    </label>
                    <input
                      type="date"
                      value={newLog.nextFollowUpDate}
                      onChange={e => setNewLog({ ...newLog, nextFollowUpDate: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-blue-300 rounded-xl font-bold text-blue-900"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Hệ thống sẽ tự động nhắc việc trên Dashboard chuyên viên vào đầu giờ sáng ngày này.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={savingLog}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu Nhật Ký & Cập Nhật Tiến Độ</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Lịch sử tương tác Timeline */}
              <div className="lg:col-span-7">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Dòng Thời Gian Chăm Sóc ({logs.length} lượt tương tác)
                </h4>

                {logs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Chưa có nhật ký tư vấn nào cho thí sinh này.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log, idx) => (
                      <div key={log.id} className="relative pl-6 pb-4 border-l-2 border-blue-300 last:border-transparent last:pb-0">
                        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{log.staffName}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 uppercase">
                                {log.contactMethod}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {new Date(log.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed font-normal">{log.content}</p>

                          {log.outcome && (
                            <div className="mt-2 text-xs bg-slate-50 p-2 rounded-xl text-slate-600">
                              <strong className="text-slate-800">Kết quả:</strong> {log.outcome}
                            </div>
                          )}

                          {log.nextFollowUpDate && (
                            <div className="mt-2 text-[11px] text-amber-700 font-bold flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-600" />
                              <span>Hẹn gọi lại: {new Date(log.nextFollowUpDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= TAB 2: CHI TIẾT & BẢO MẬT ================= */}
          {activeTab === 'details' && (
            <div className="space-y-6 max-w-3xl">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Cơ Chế Bảo Vệ Dữ Liệu Nhạy Cảm (Data Masking)
                </span>
                <p className="text-xs text-slate-600">
                  Số điện thoại và CCCD được mã hóa che dấu trên giao diện tổng quan. Chuyên viên bấm nút dưới đây để giải mã khi đang trực tiếp tương tác, hệ thống sẽ tự động ghi vết vào Audit Trail.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* SĐT */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <span className="text-slate-500 font-medium block mb-1">Số Điện Thoại</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {phoneUnmasked ? currentLead.phone : maskPhone(currentLead.phone)}
                    </span>
                    {!phoneUnmasked ? (
                      <button
                        onClick={handleUnmaskPhone}
                        className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Hiện Số & Gọi</span>
                      </button>
                    ) : (
                      <a
                        href={`tel:${currentLead.phone}`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Gọi Ngay</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* CCCD */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <span className="text-slate-500 font-medium block mb-1">Số CCCD / Định Danh</span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {currentLead.idCardNumber || 'Chưa cung cấp'}
                  </span>
                </div>

                {/* Email */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <span className="text-slate-500 font-medium block mb-1">Hòm Thư Email</span>
                  <span className="text-xs font-semibold text-slate-900">{currentLead.email || 'Chưa có'}</span>
                </div>

                {/* Trường THPT */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <span className="text-slate-500 font-medium block mb-1">Trường THPT & Địa Bàn</span>
                  <span className="text-xs font-semibold text-slate-900">
                    {currentLead.highSchool} ({currentLead.province || 'Đà Nẵng'})
                  </span>
                </div>

                {/* Điểm xét tuyển & Khối */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <span className="text-slate-500 font-medium block mb-1">Khối Thi & Điểm Ước Tính</span>
                  <span className="text-xs font-semibold text-blue-700 font-mono">
                    Khối {currentLead.examBlock || 'A00'} • {currentLead.estimatedScore ? `${currentLead.estimatedScore} Điểm` : 'Chưa có điểm'}
                  </span>
                </div>

                {/* Nguồn tiếp cận */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <span className="text-slate-500 font-medium block mb-1">Nguồn Tiếp Cận & Chiến Dịch</span>
                  <span className="text-xs font-semibold text-slate-900 uppercase">
                    {currentLead.source} {currentLead.utmCampaign ? `(${currentLead.utmCampaign})` : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: HỒ SƠ MINH CHỨNG SỐ HÓA ================= */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Minh Chứng Học Bạ THPT & Căn Cước Công Dân
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ảnh chụp/scan bản gốc phục vụ hậu kiểm đối chiếu điểm số trong 30 giây
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-teal-100 text-teal-800">
                  Trạng thái: {currentLead.documents?.verificationStatus || 'Chưa nộp minh chứng'}
                </span>
              </div>

              {currentLead.documents?.transcriptPhotos && currentLead.documents.transcriptPhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {currentLead.documents.transcriptPhotos.map((url, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 block">Ảnh Học Bạ Trang #{idx + 1}</span>
                      <div className="aspect-3/4 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 relative group">
                        <img src={url} alt="Hoc ba" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Xem Ảnh Gốc</span>
                        </a>
                      </div>
                    </div>
                  ))}

                  {currentLead.documents.idCardFront && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 block">CCCD Mặt Trước</span>
                      <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                        <img src={currentLead.documents.idCardFront} alt="CCCD" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Thí sinh chưa tải lên ảnh chụp học bạ hoặc CCCD.</p>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: GIẤY BÁO TRÚNG TUYỂN ĐIỆN TỬ ================= */}
          {activeTab === 'admission_letter' && (
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 max-w-2xl mx-auto shadow-sm text-slate-800 space-y-4 font-serif">
              <div className="text-center border-b border-slate-300 pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-900 block font-sans">
                  BỘ GIÁO DỤC VÀ ĐÀO TẠO • ĐẠI HỌC DUY TÂN
                </span>
                <span className="text-[11px] font-bold text-slate-600 block font-sans">
                  HỘI ĐỒNG TUYỂN SINH TRƯỜNG ĐÀO TẠO QUỐC TẾ (VN-US)
                </span>
                <h3 className="text-lg font-bold text-blue-900 mt-2 uppercase">
                  GIẤY BÁO TRÚNG TUYỂN ĐIỆN TỬ CÓ ĐIỀU KIỆN
                </h3>
                <span className="text-xs text-slate-500 font-sans">Khóa K32 - Năm học 2026</span>
              </div>

              <div className="space-y-2 text-xs leading-relaxed font-sans">
                <p>Hội đồng Tuyển sinh trân trọng thông báo đến thí sinh:</p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-2 gap-2 font-medium">
                  <div>Họ và tên: <strong className="text-slate-900">{currentLead.fullName}</strong></div>
                  <div>Mã hồ sơ: <strong className="font-mono text-blue-700">{currentLead.id}</strong></div>
                  <div>Số CCCD: <strong className="font-mono">{currentLead.idCardNumber || 'Chưa cập nhật'}</strong></div>
                  <div>Trường THPT: <strong>{currentLead.highSchool}</strong></div>
                  <div className="col-span-2">
                    Ngành trúng tuyển: <strong className="text-blue-900">{currentLead.programName}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-300 font-sans">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-300 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Mã QR Xác Thực Số</span>
                    <span className="text-xs font-mono font-bold text-blue-700">DTU-VNUS-{currentLead.id}</span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="italic block text-[11px]">Đà Nẵng, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm 2026</span>
                  <span className="font-bold text-blue-900 block mt-1">CHỦ TỊCH HỘI ĐỒNG TUYỂN SINH</span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-4 flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Đã ký số điện tử
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
