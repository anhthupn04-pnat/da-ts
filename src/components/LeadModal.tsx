'use client';

import React, { useState } from 'react';
import { Lead, ConsultationHistory, LeadStatus, ContactMethod, LeadPriority } from '@/types';
import { updateLead, addConsultationLog, getConsultationLogs, getCurrentUser } from '@/data/storage';
import { INITIAL_STAFF } from '@/data/mockData';
import { X, Phone, Mail, MapPin, School, BookOpen, Clock, Calendar, CheckCircle2, User, MessageSquare, Send, Award, History } from 'lucide-react';

interface LeadModalProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export default function LeadModal({ lead, onClose, onLeadUpdated }: LeadModalProps) {
  if (!lead) return null;

  const currentUser = getCurrentUser();
  const [currentLead, setCurrentLead] = useState<Lead>(lead);
  const [logs, setLogs] = useState<ConsultationHistory[]>(getConsultationLogs(lead.id));

  // Consultation form state
  const [newLog, setNewLog] = useState({
    contactMethod: 'call' as ContactMethod,
    content: '',
    outcome: '',
    nextFollowUpDate: ''
  });
  const [savingLog, setSavingLog] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleStatusChange = (status: LeadStatus) => {
    const res = updateLead(lead.id, { status });
    if (res.success && res.lead) {
      setCurrentLead(res.lead);
      onLeadUpdated();
      showToast('Đã cập nhật trạng thái thí sinh thành công!');
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
    const staff = INITIAL_STAFF.find(s => s.id === staffId);
    const res = updateLead(lead.id, {
      assignedTo: staffId,
      assignedToName: staff ? staff.fullName : undefined
    });
    if (res.success && res.lead) {
      setCurrentLead(res.lead);
      onLeadUpdated();
      showToast(`Đã phân công cho chuyên viên ${staff?.fullName}!`);
    }
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
      content: newLog.content.trim(),
      outcome: newLog.outcome.trim() || 'Đã ghi nhận nội dung trao đổi.',
      nextFollowUpDate: newLog.nextFollowUpDate || undefined
    });

    // Auto advance status to 'consulting' if it was 'new' or 'contacted'
    if (currentLead.status === 'new' || currentLead.status === 'contacted') {
      const res = updateLead(lead.id, { status: 'consulting' });
      if (res.success && res.lead) {
        setCurrentLead(res.lead);
      }
    }

    setLogs([log, ...logs]);
    setNewLog({
      contactMethod: 'call',
      content: '',
      outcome: '',
      nextFollowUpDate: ''
    });
    setSavingLog(false);
    onLeadUpdated();
    showToast('Đã thêm nhật ký tư vấn mới!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fade-in">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/60 border border-blue-400/40 flex items-center justify-center text-white font-bold text-lg">
              {currentLead.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {currentLead.fullName}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                  #{currentLead.id}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Ngành quan tâm: <strong>{currentLead.programName || currentLead.programId}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast notification inside modal */}
        {toastMessage && (
          <div className="bg-emerald-500 text-white px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick status & assignment controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Trạng thái tuyển sinh
              </label>
              <select
                value={currentLead.status}
                onChange={e => handleStatusChange(e.target.value as LeadStatus)}
                className="w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="new">Mới tiếp nhận</option>
                <option value="contacted">Đã liên hệ</option>
                <option value="consulting">Đang tư vấn chuyên sâu</option>
                <option value="registered">Đã nộp hồ sơ đăng ký</option>
                <option value="enrolled">Nhập học chính thức</option>
                <option value="cancelled">Không còn nhu cầu</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Mức độ ưu tiên
              </label>
              <select
                value={currentLead.priority}
                onChange={e => handlePriorityChange(e.target.value as LeadPriority)}
                className="w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="high">Cao (Cần chăm sóc ngay)</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Chuyên viên phụ trách
              </label>
              <select
                value={currentLead.assignedTo || ''}
                onChange={e => handleAssignChange(e.target.value)}
                className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="">Chưa phân công</option>
                {INITIAL_STAFF.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Profile Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
              <span className="font-bold text-slate-900 block border-b border-slate-100 pb-2">
                Thông tin liên hệ & trường học
              </span>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-900">{currentLead.phone}</span>
                <a
                  href={`tel:${currentLead.phone}`}
                  className="ml-auto text-[11px] font-bold text-blue-600 hover:underline"
                >
                  Gọi điện
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{currentLead.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <School className="w-4 h-4 text-purple-600 shrink-0" />
                <span>{currentLead.highSchool || 'Chưa cập nhật'} {currentLead.graduationYear ? `(TN: ${currentLead.graduationYear})` : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Tỉnh / TP: {currentLead.province || 'Đà Nẵng'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
              <span className="font-bold text-slate-900 block border-b border-slate-100 pb-2">
                Chi tiết nguyện vọng & nguồn tiếp nhận
              </span>
              <div className="flex items-center gap-2 text-slate-600">
                <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Ngành: <strong>{currentLead.programName || currentLead.programId}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Điểm xét tuyển ước tính: <strong>{currentLead.scoreThpt ? `${currentLead.scoreThpt} điểm` : 'Chưa nhập'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Nguồn tiếp cận: <span className="uppercase font-semibold text-slate-800">{currentLead.source}</span></span>
              </div>
              <div className="text-slate-500 pt-1 border-t border-slate-100">
                <em>Ghi chú ban đầu: {currentLead.notes || 'Không có ghi chú.'}</em>
              </div>
            </div>
          </div>

          {/* Form: Add Consultation Log */}
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/70 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-700" />
              Ghi nhận nhật ký tư vấn mới
            </h4>

            <form onSubmit={handleAddLog} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phương thức tương tác
                  </label>
                  <select
                    value={newLog.contactMethod}
                    onChange={e => setNewLog({ ...newLog, contactMethod: e.target.value as ContactMethod })}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                  >
                    <option value="call">Cuộc gọi điện thoại (Hotline / Di động)</option>
                    <option value="zalo">Nhắn tin Zalo</option>
                    <option value="meeting">Tư vấn trực tiếp tại Tòa G / Văn phòng</option>
                    <option value="facebook">Tin nhắn Facebook Fanpage</option>
                    <option value="email">Email giải đáp thắc mắc</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lên lịch chăm sóc tiếp theo (Follow-up)
                  </label>
                  <input
                    type="date"
                    value={newLog.nextFollowUpDate}
                    onChange={e => setNewLog({ ...newLog, nextFollowUpDate: e.target.value })}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung cuộc gọi / tư vấn
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ví dụ: Đã gọi tư vấn về học bổng Troy 13 Tỷ, giải thích lộ trình 4 năm lấy bằng Mỹ, học sinh hẹn gửi học bạ qua Zalo..."
                  value={newLog.content}
                  onChange={e => setNewLog({ ...newLog, content: e.target.value })}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Kết quả / Bước kế tiếp (Ví dụ: Chờ học bạ gửi Zalo)"
                  value={newLog.outcome}
                  onChange={e => setNewLog({ ...newLog, outcome: e.target.value })}
                  className="w-2/3 p-2 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <button
                  type="submit"
                  disabled={savingLog}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Lưu Nhật Ký</span>
                </button>
              </div>
            </form>
          </div>

          {/* Consultation History Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-600" />
              Lịch sử các lần tư vấn ({logs.length})
            </h4>

            {logs.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center border border-dashed border-slate-200">
                Chưa có nhật ký tư vấn nào cho thí sinh này. Hãy nhập ghi chú ở biểu mẫu phía trên.
              </div>
            ) : (
              <div className="space-y-2.5">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200/90 text-xs space-y-1.5 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        {log.staffName} • <span className="uppercase text-[10px] text-blue-700 font-semibold px-1.5 py-0.5 bg-blue-50 rounded-sm">{log.contactMethod}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                      {log.content}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-emerald-700 font-medium">
                        <strong>Kết quả:</strong> {log.outcome}
                      </span>
                      {log.nextFollowUpDate && (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Hẹn chăm sóc lại: {log.nextFollowUpDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>

      </div>
    </div>
  );
}
