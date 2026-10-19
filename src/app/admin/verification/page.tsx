'use client';

import React, { useState, useEffect } from 'react';
import { Lead, UserProfile } from '@/types';
import { getLeads, getCurrentUser, getSafeCurrentUser, verifyCandidateDocuments } from '@/data/storage';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ShieldAlert,
  Send,
  User,
  School,
  Award,
  Sparkles,
  Search
} from 'lucide-react';

export default function DocumentVerificationPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getSafeCurrentUser());
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Form thẩm định điểm
  const [verificationForm, setVerificationForm] = useState({
    status: 'verified' as 'verified' | 'rejected' | 'need_supplement',
    scoreMath: 8.5,
    scoreLiterature: 8.0,
    scoreEnglish: 8.5,
    notes: 'Điểm học bạ 3 kỳ THPT khớp chính xác với minh chứng bản gốc. Hồ sơ đầy đủ điều kiện trúng tuyển.'
  });
  const [processing, setProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadData = () => {
    const user = getCurrentUser() || getSafeCurrentUser();
    setCurrentUser(user);
    const all = getLeads(user);
    // Lọc các hồ sơ có minh chứng cần duyệt hoặc đã nộp hồ sơ
    const docsQueue = all.filter(l => 
      l.status === 'submitted_app' || 
      l.status === 'conditional_admit' ||
      l.status === 'waiting_transcript' ||
      (l.documents && l.documents.transcriptPhotos && l.documents.transcriptPhotos.length > 0)
    );
    setLeads(docsQueue);
    if (!selectedLead && docsQueue.length > 0) {
      selectCandidate(docsQueue[0]);
    } else if (selectedLead) {
      const refreshed = docsQueue.find(l => l.id === selectedLead.id);
      if (refreshed) selectCandidate(refreshed);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectCandidate = (lead: Lead) => {
    setSelectedLead(lead);
    setActivePhotoIdx(0);
    setZoomLevel(1);
    setRotation(0);
    setVerificationForm({
      status: lead.documents?.verificationStatus === 'verified' ? 'verified' : 'verified',
      scoreMath: lead.documents?.verifiedScoreMath || 8.5,
      scoreLiterature: lead.documents?.verifiedScoreLiterature || 8.0,
      scoreEnglish: lead.documents?.verifiedScoreEnglish || 8.5,
      notes: lead.documents?.verificationNotes || 'Điểm học bạ THPT khớp chính xác với ảnh chụp minh chứng.'
    });
  };

  const handleVerifySubmit = (status: 'verified' | 'need_supplement' | 'rejected') => {
    if (!selectedLead) return;
    setProcessing(true);

    const res = verifyCandidateDocuments(selectedLead.id, {
      status,
      verifiedScoreMath: Number(verificationForm.scoreMath),
      verifiedScoreLiterature: Number(verificationForm.scoreLiterature),
      verifiedScoreEnglish: Number(verificationForm.scoreEnglish),
      notes: verificationForm.notes
    }, currentUser);

    setProcessing(false);

    if (res.success) {
      setSuccessToast(`Đã thẩm định hồ sơ ${selectedLead.id} thành công! Hệ thống đã gửi tin nhắn thông báo cho thí sinh.`);
      setTimeout(() => setSuccessToast(null), 4000);
      loadData();
    } else {
      alert(res.error);
    }
  };

  // Danh sách ảnh minh chứng (học bạ + CCCD)
  const allDocPhotos = [
    ...(selectedLead?.documents?.transcriptPhotos || [
      'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80'
    ]),
    ...(selectedLead?.documents?.idCardFront ? [selectedLead.documents.idCardFront] : ['https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80']),
    ...(selectedLead?.documents?.idCardBack ? [selectedLead.documents.idCardBack] : [])
  ];

  const currentPhotoUrl = allDocPhotos[activePhotoIdx] || allDocPhotos[0];

  return (
    <div className="space-y-4">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-teal-600" />
            <span>Màn Hình Hậu Kiểm & Thẩm Định Minh Chứng Xét Tuyển (Split-Screen)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Giao diện đối chiếu hai màn hình: Một bên xem ảnh scan Học bạ/CCCD, một bên duyệt điểm trong 30 giây.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-100 text-teal-800 border border-teal-300">
            Hàng đợi thẩm định: {leads.length} hồ sơ
          </span>
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Side: Applicants Queue List */}
        <div className="lg:col-span-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2 max-h-[82vh] overflow-y-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
            Danh Sách Chờ Hậu Kiểm
          </span>

          {leads.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Hiện không có hồ sơ nào cần hậu kiểm.
            </div>
          ) : (
            leads.map(lead => {
              const isSelected = selectedLead?.id === lead.id;
              const isVerified = lead.documents?.verificationStatus === 'verified';
              return (
                <div
                  key={lead.id}
                  onClick={() => selectCandidate(lead)}
                  className={`p-3 rounded-xl border text-xs transition cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-teal-50/80 border-teal-500 shadow-xs'
                      : 'hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{lead.fullName}</span>
                    <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                      {lead.id}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 truncate">{lead.programName}</p>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-slate-500">{lead.highSchool}</span>
                    {isVerified ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã duyệt
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                        Chờ duyệt
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Center: Document Photo Viewer with Zoom & Rotate */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-lg text-white max-h-[82vh]">
          {/* Viewer Toolbar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-400">
                Minh Chứng #{activePhotoIdx + 1} / {allDocPhotos.length}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activePhotoIdx === 0 ? 'Học bạ mặt 1' : activePhotoIdx === 1 ? 'Học bạ mặt 2' : 'CCCD'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.2))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono px-1.5">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 ml-1"
                title="Xoay ảnh 90 độ"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Photo Display Viewport */}
          <div className="flex-1 overflow-hidden flex items-center justify-center p-2 relative my-2 bg-slate-950/70 rounded-xl">
            {currentPhotoUrl ? (
              <img
                src={currentPhotoUrl}
                alt="Minh chung hoc ba"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-in-out'
                }}
                className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-xl cursor-grab active:cursor-grabbing"
              />
            ) : (
              <div className="text-slate-500 text-xs">Không có ảnh minh chứng</div>
            )}
          </div>

          {/* Pagination thumbnails */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <button
              onClick={() => setActivePhotoIdx(prev => Math.max(0, prev - 1))}
              disabled={activePhotoIdx === 0}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Ảnh Trước</span>
            </button>

            <div className="flex items-center gap-1.5">
              {allDocPhotos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActivePhotoIdx(idx); setRotation(0); setZoomLevel(1); }}
                  className={`w-6 h-6 rounded-md text-[10px] font-bold font-mono transition cursor-pointer ${
                    activePhotoIdx === idx ? 'bg-teal-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActivePhotoIdx(prev => Math.min(allDocPhotos.length - 1, prev + 1))}
              disabled={activePhotoIdx === allDocPhotos.length - 1}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Ảnh Tiếp</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Score Verification & Assessment Form */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          {selectedLead ? (
            <>
              {/* Candidate Info Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">{selectedLead.fullName}</span>
                  <span className="font-mono text-xs font-bold text-teal-700">{selectedLead.id}</span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  <span>CCCD: <strong className="font-mono">{selectedLead.idCardNumber || 'Chưa cập nhật'}</strong></span>
                  <span className="mx-2">•</span>
                  <span>SĐT: <strong className="font-mono">{selectedLead.phone}</strong></span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  Trường THPT: <strong>{selectedLead.highSchool}</strong> ({selectedLead.province})
                </div>
                <div className="text-blue-900 font-bold pt-1 border-t border-slate-200">
                  Ngành xét tuyển: {selectedLead.programName}
                </div>
              </div>

              {/* Bảng điểm đối chiếu */}
              <div className="space-y-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-200">
                <span className="font-bold text-teal-900 block flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Đối Chiếu Bảng Điểm Học Bạ (Duyệt trong 30 giây)
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Môn Toán</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={verificationForm.scoreMath}
                      onChange={e => setVerificationForm({ ...verificationForm, scoreMath: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-teal-300 rounded-xl font-bold font-mono text-center text-teal-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Ngữ Văn</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={verificationForm.scoreLiterature}
                      onChange={e => setVerificationForm({ ...verificationForm, scoreLiterature: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-teal-300 rounded-xl font-bold font-mono text-center text-teal-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Tiếng Anh</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={verificationForm.scoreEnglish}
                      onChange={e => setVerificationForm({ ...verificationForm, scoreEnglish: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-teal-300 rounded-xl font-bold font-mono text-center text-teal-900"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-teal-200 flex items-center justify-between font-bold text-teal-950">
                  <span>Tổng Điểm Xét Tuyển 3 Môn:</span>
                  <span className="text-sm font-mono text-blue-700">
                    {(Number(verificationForm.scoreMath) + Number(verificationForm.scoreLiterature) + Number(verificationForm.scoreEnglish)).toFixed(1)} Điểm
                  </span>
                </div>
              </div>

              {/* Ghi chú thẩm định */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Ghi Chú Kết Luận Thẩm Định</label>
                <textarea
                  rows={3}
                  value={verificationForm.notes}
                  onChange={e => setVerificationForm({ ...verificationForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  placeholder="Ghi chú kết quả thẩm định, lý do yêu cầu bổ sung..."
                />
              </div>

              {/* Action Buttons: 3 Thao Tác Quyết Định */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleVerifySubmit('verified')}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Duyệt Hợp Lệ & Trúng Tuyển Có Điều Kiện</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleVerifySubmit('need_supplement')}
                    className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Yêu Cầu Bổ Sung Hồ Sơ</span>
                  </button>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleVerifySubmit('rejected')}
                    className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Từ Chối Hồ Sơ</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400">
              Chọn một thí sinh từ danh sách bên trái để đối chiếu minh chứng.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
