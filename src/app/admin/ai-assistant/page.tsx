'use client';

import React, { useState } from 'react';
import { STUDY_PROGRAMS } from '@/data/programsData';
import {
  Bot,
  Sparkles,
  Copy,
  Check,
  Send,
  PhoneCall,
  MessageSquare,
  FileText,
  HelpCircle,
  BookOpen,
  RefreshCw,
  Share2
} from 'lucide-react';

type AITaskType = 'call_script' | 'zalo_message' | 'social_post' | 'faq_classify' | 'major_summary';

export default function AIAssistantPage() {
  const [taskType, setTaskType] = useState<AITaskType>('call_script');
  const [selectedProgram, setSelectedProgram] = useState(STUDY_PROGRAMS[0].id);
  const [studentName, setStudentName] = useState('Bạn Minh Anh');
  const [studentScore, setStudentScore] = useState('24.5');
  const [extraPrompt, setExtraPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const prog = STUDY_PROGRAMS.find(p => p.id === selectedProgram) || STUDY_PROGRAMS[0];

  const handleGenerate = () => {
    setIsGenerating(true);
    setCopied(false);

    setTimeout(() => {
      let output = '';

      if (taskType === 'call_script') {
        output = `📞 KỊCH BẢN CUỘC GỌI TƯ VẤN 1-1 (CHUYÊN NGÀNH: ${prog.name.toUpperCase()})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Người nhận: ${studentName} (Điểm ước tính: ${studentScore} điểm)
Chuyên viên phụ trách: Chuyên viên Tuyển sinh Viện VN-US, Đại học Duy Tân
Mục tiêu cuộc gọi: Khảo sát nguyện vọng, giới thiệu ưu thế kiểm định ${prog.accreditation} và hướng dẫn hồ sơ học bổng.

[GIAI ĐOẠN 1: MỞ ĐẦU THÂN THIỆN]
"Dạ alo, em chào ${studentName}! Em có phải là ${studentName} vừa đăng ký tìm hiểu chương trình ${prog.name} tại Cổng Tư vấn Tuyển sinh Trường Quốc tế - Đại học Duy Tân đúng không ạ?
Em là [Tên chuyên viên], chuyên viên tư vấn của Viện VN-US. Em nhận được thông tin ${studentName} đang quan tâm đến lộ trình học tập K32 nên gọi điện để hỗ trợ em nhanh nhất."

[GIAI ĐOẠN 2: TƯ VẤN ĐIỂM SÁNG CHƯƠNG TRÌNH & HỌC BỔNG]
"Thầy/Cô thấy điểm xét tuyển của em hiện tại tầm ${studentScore} điểm. Với mức điểm này, em hoàn toàn nằm trong ngưỡng xét tuyển ưu tiên và có cơ hội nhận các suất học bổng giá trị từ Quỹ học bổng Quốc tế:
1. Đối tác cấp bằng / chuyển giao: ${prog.partner}.
2. Chất lượng đào tạo: Chương trình ${prog.accreditation}.
3. Cơ hội việc làm: ${prog.careerProspects}.
4. Cơ sở vật chất: Em sẽ học tại Tòa G - 120 Hoàng Minh Thảo với hệ thống phòng Lab hiện đại bậc nhất Đà Nẵng."

[GIAI ĐOẠN 3: LỜI KÊU GỌI HÀNH ĐỘNG (CTA) & HẸN GẶP]
"Thầy/Cô sẽ kết bạn Zalo với em qua số điện thoại này để gửi Cẩm nang PDF nhập học K32 kèm bảng chi tiết môn học nhé!
Cuối tuần này, Viện có buổi trải nghiệm tham quan Tòa G và tư vấn hồ sơ trực tiếp, em có thể rủ bố mẹ cùng ghé 120 Hoàng Minh Thảo để thầy cô hướng dẫn làm thủ tục giữ chỉ tiêu sớm nha!"`;
      } else if (taskType === 'zalo_message') {
        output = `💬 MẪU TIN NHẮN ZALO CHÀO MỪNG & GỬI CẨM NANG K32
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chào ${studentName}! ✨
Thầy/Cô là chuyên viên tư vấn tuyển sinh Viện Đào tạo Quốc tế (VN-US) – Đại học Duy Tân.

Rất vui vì ${studentName} đã quan tâm đến chương trình ${prog.name} [Mã ngành: ${prog.code}].

📌 Tóm tắt thông tin quan trọng dành cho em:
• Đối tác Hoa Kỳ: ${prog.partner}
• Văn bằng: ${prog.degree}
• Kiểm định: ${prog.accreditation}
• Học phí năm học: ${prog.tuitionPerYear}
• Điểm chuẩn xét tuyển: Đang nhận hồ sơ học bạ từ 18 điểm hoặc điểm thi THPT từ 15 điểm.

🎁 Thầy/Cô gửi tặng em file Cẩm nang Tuyển sinh K32 (Tổng hợp thông tin học bổng 13 Tỷ và hướng dẫn nhập học). Em xem qua nếu có câu hỏi nào về học phí, ký túc xá hay thủ tục xét tuyển thì nhắn lại cho Thầy/Cô ngay tại đây nhé!

🏢 Địa chỉ văn phòng: Tòa G, 120 Hoàng Minh Thảo, Đà Nẵng
📞 Hotline hỗ trợ 24/7: 0979 407 340 | 0888 414141`;
      } else if (taskType === 'social_post') {
        output = `🚀 BÀI ĐĂNG TUYỂN SINH FACEBOOK / TIKTOK VIRAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIÊU ĐỀ GỢI Ý 1: "TẠI SAO BẰNG CỦA ${prog.partner.split(' - ')[0].toUpperCase()} LẠI ĐƯỢC CÁC TẬP ĐOÀN CÔNG NGHỆ & ĐA QUỐC GIA SĂN ĐÓN?"
TIÊU ĐỀ GỢI Ý 2: "HỌC TẠI ĐÀ NẴNG - NHẬN VĂN BẰNG CHUẨN HOA KỲ: BẬT MÍ LỘ TRÌNH K32 NGÀNH ${prog.name.toUpperCase()}!"

[NỘI DUNG BÀI ĐĂNG]
Bạn có biết? Không cần phải bay sang nửa vòng trái đất với chi phí đắt đỏ, ngay tại Đà Nẵng, tân sinh viên K32 đã có thể thụ hưởng trọn vẹn chương trình đào tạo chuẩn quốc tế tại Viện Đào tạo Quốc tế (VN-US) – Đại học Duy Tân! 🌟

✨ 3 ĐẶC QUYỀN DUY NHẤT DÀNH CHO BẠN:
1️⃣ ${prog.accreditation} - Chuẩn kiểm định danh giá được công nhận trên toàn cầu.
2️⃣ Cơ hội nghề nghiệp rộng mở: ${prog.careerProspects}.
3️⃣ Không gian học tập chuẩn 5 sao tại Tòa G biểu tượng mới với thang máy kính trong suốt và hơn 184 phòng học tiện nghi.

🔥 ĐẶC BIỆT: Cơ hội rinh học bổng toàn phần 100% học phí hoặc Quỹ học bổng Đại học Troy lên đến 13 Tỷ đồng!

👉 Đăng ký xét tuyển sớm ngay hôm nay để nhận quyền ưu tiên chọn phòng Lab và giữ chỉ tiêu!
🔗 Link đăng ký tư vấn 1-1 miễn phí: https://duytan.edu.vn
📍 Cơ sở đào tạo: 120 Hoàng Minh Thảo, Liên Chiểu, TP. Đà Nẵng
☎ Hotline: 0979 407 340 | 0888 414141

#DaiHocDuyTan #VNUS #TuyenSinh2026 #K32 #${prog.code.replace(/[^a-zA-Z0-9]/g, '')}`;
      } else if (taskType === 'major_summary') {
        output = `📑 BẢN TÓM TẮT THÔNG TIN NGÀNH HỌC DÀNH CHO TƯ VẤN VIÊN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Chuyên ngành: ${prog.name} (${prog.code})
• Đơn vị quản lý: ${prog.faculty}
• Đối tác chuyển giao: ${prog.partner}
• Tiêu chuẩn kiểm định: ${prog.accreditation}
• Thời gian đào tạo: ${prog.duration}
• Dự kiến học phí: ${prog.tuitionPerYear}

[NỘI DUNG CỐT LÕI CẦN NHỚ KHI TƯ VẤN]
${prog.description}

[CÁC VỊ TRÍ VIỆC LÀM ĐẦU RA]
${prog.careerProspects}

[TIÊU CHÍ XÉT TUYỂN]
${prog.admissionCriteria}

[LỜI KHUYÊN CHO TƯ VẤN VIÊN KHI TIẾP CẬN PHỤ HUYNH]
- Nhấn mạnh vào văn bằng quốc tế và kiểm định ABET/AACSB.
- Giải thích rõ cơ hội du học chuyển tiếp (2+2 hoặc 3+1) sang Mỹ đối với các bạn có nguyện vọng đi nước ngoài.
- Nêu rõ cam kết hỗ trợ việc làm với hơn 150 doanh nghiệp hợp tác tại Đà Nẵng và TP.HCM.`;
      } else {
        output = `❓ PHÂN LOẠI & GỢI Ý CÂU TRẢ LỜI CHO THẮC MẮC PHỔ BIẾN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nhóm câu hỏi: CHÍNH SÁCH HỌC BỔNG & HỌC PHÍ K32

Q1: "Học bổng 13 tỷ của Troy có cần thi tuyển riêng không?"
A: Không cần thi riêng! Xét trực tiếp dựa trên điểm thi tốt nghiệp THPT từ 23-26 điểm hoặc IELTS từ 5.5 trở lên.

Q2: "Ngành ${prog.name} có xét tuyển học bạ đợt này không?"
A: Có! Em nộp điểm học bạ lớp 12 hoặc trung bình cả 3 năm THPT từ 18 điểm trở lên là đủ điều kiện xét tuyển sớm.

Q3: "Tòa G có ký túc xá cho sinh viên ở xa không?"
A: Trường có khu ký túc xá khang trang ngay gần cơ sở 120 Hoàng Minh Thảo và 254 Nguyễn Văn Linh, hỗ trợ tân sinh viên các tỉnh miền Trung và toàn quốc an tâm học tập.`;
      }

      setGeneratedResult(output);
      setIsGenerating(false);
    }, 400);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Trợ Lý AI Tuyển Sinh & Sáng Tạo Nội Dung
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hỗ trợ chuyên viên tư vấn tạo nhanh kịch bản gọi điện, tin nhắn Zalo, bài viết mạng xã hội và tóm tắt ngành học từ dữ liệu chuẩn K32
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Admissions Engine Sẵn Sàng
          </span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">
              1. Chọn Nhiệm Vụ Cần AI Hỗ Trợ
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {[
                { type: 'call_script', label: 'Soạn Kịch Bản Gọi Điện Thoại 1-1', icon: PhoneCall },
                { type: 'zalo_message', label: 'Soạn Tin Nhắn Chào Mừng Zalo', icon: MessageSquare },
                { type: 'social_post', label: 'Viết Bài Đăng Tuyển Sinh Facebook / TikTok', icon: Share2 },
                { type: 'major_summary', label: 'Tóm Tắt Bảng Tra Cứu Ngành Nhanh', icon: BookOpen },
                { type: 'faq_classify', label: 'Giải Đáp Câu Hỏi Thường Gặp (FAQ)', icon: HelpCircle }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = taskType === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => setTaskType(item.type as AITaskType)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2 pt-2">
              2. Tham Số Thí Sinh & Ngành Học
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Chuyên ngành tư vấn:
              </label>
              <select
                value={selectedProgram}
                onChange={e => setSelectedProgram(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
              >
                {STUDY_PROGRAMS.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên thí sinh:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="Minh Anh"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Điểm xét tuyển ước tính:</label>
                <input
                  type="text"
                  value={studentScore}
                  onChange={e => setStudentScore(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="24.5"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang phân tích và tạo nội dung...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Tạo Nội Dung Ngay</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-full min-h-[500px]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Kết Quả Soạn Thảo Của AI
              </span>

              {generatedResult && (
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Đã Sao Chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Sao Chép Nội Dung</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
              {generatedResult ? (
                <textarea
                  value={generatedResult}
                  onChange={e => setGeneratedResult(e.target.value)}
                  className="w-full flex-1 p-4 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-800 focus:outline-hidden focus:bg-white resize-none"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Chưa có nội dung được tạo</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Chọn tác vụ ở cột bên trái và bấm nút <strong>"Tạo Nội Dung Ngay"</strong> để AI tạo kịch bản tư vấn hoặc bài viết phù hợp.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex items-center justify-between text-[11px] text-slate-500">
              <span>Được tối ưu theo đề án tuyển sinh K32 Viện VN-US ĐH Duy Tân</span>
              <span>Người dùng có thể chỉnh sửa trực tiếp văn bản trên</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
