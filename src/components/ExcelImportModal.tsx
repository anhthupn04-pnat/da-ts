'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { batchAddLeadsWithTransaction, getCurrentUser } from '@/data/storage';
import { STUDY_PROGRAMS } from '@/data/programsData';
import { DeduplicationMode } from '@/types';
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Info,
  ArrowRight,
  ArrowLeft,
  Columns,
  Layers,
  Database
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface ValidationRow {
  index: number;
  fullName: string;
  phone: string;
  idCardNumber?: string;
  email?: string;
  highSchool?: string;
  province?: string;
  programIdentifier?: string;
  matchedProgramName?: string;
  estimatedScore?: number;
  examBlock?: string;
  source?: string;
  notes?: string;
  isValid: boolean;
  isDuplicate?: boolean;
  errorMessages: string[];
}

export default function ExcelImportModal({ isOpen, onClose, onSuccess }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawJsonData, setRawJsonData] = useState<any[]>([]);
  
  // Dynamic column mapping state
  const [columnMapping, setColumnMapping] = useState<{
    fullName: string;
    phone: string;
    idCardNumber: string;
    email: string;
    highSchool: string;
    province: string;
    program: string;
    estimatedScore: string;
    notes: string;
  }>({
    fullName: '',
    phone: '',
    idCardNumber: '',
    email: '',
    highSchool: '',
    province: '',
    program: '',
    estimatedScore: '',
    notes: ''
  });

  const [validationRows, setValidationRows] = useState<ValidationRow[]>([]);
  const [dedupMode, setDedupMode] = useState<DeduplicationMode>('merge_history');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Tải Template chuẩn mẫu
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'Họ và Tên': 'Nguyễn Hoàng Long',
        'Số Điện Thoại': '0987112233',
        'Số CCCD': '048208001122',
        'Email': 'hoanglong.dtu@gmail.com',
        'Trường THPT': 'THPT Chuyên Lê Quý Đôn',
        'Tỉnh Thành': 'Đà Nẵng',
        'Năm Tốt Nghiệp': 2026,
        'Ngành Quan Tâm': 'Kỹ nghệ Phần mềm chuẩn CMU (102)',
        'Khối Thi': 'A00',
        'Điểm Ước Tính': 26.5,
        'Nguồn Thu Thập': 'Tour THPT',
        'Ghi Chú': 'Thí sinh quan tâm học bổng toàn phần 100% CMU'
      },
      {
        'Họ và Tên': 'Trần Thị Thu Thảo',
        'Số Điện Thoại': '0905334455',
        'Số CCCD': '048308003344',
        'Email': 'thuthao.tran@gmail.com',
        'Trường THPT': 'THPT Phan Châu Trinh',
        'Tỉnh Thành': 'Đà Nẵng',
        'Năm Tốt Nghiệp': 2026,
        'Ngành Quan Tâm': 'Quản trị Kinh doanh Troy (Mỹ)',
        'Khối Thi': 'D01',
        'Điểm Ước Tính': 25.0,
        'Nguồn Thu Thập': 'Ngày hội Open Day',
        'Ghi Chú': 'Đã có IELTS 6.0, hỏi về Quỹ học bổng Troy 13 Tỷ'
      },
      {
        'Họ và Tên': 'Lê Minh Trí',
        'Số Điện Thoại': '0935556677',
        'Số CCCD': '046208005566',
        'Email': 'minhtri.le@gmail.com',
        'Trường THPT': 'THPT Quốc Học Huế',
        'Tỉnh Thành': 'Thừa Thiên Huế',
        'Năm Tốt Nghiệp': 2026,
        'Ngành Quan Tâm': 'Kiến trúc Công trình chuẩn CSU (107)',
        'Khối Thi': 'V00',
        'Điểm Ước Tính': 24.0,
        'Nguồn Thu Thập': 'Tư vấn trực tiếp',
        'Ghi Chú': 'Thi môn Vẽ Mỹ thuật ngành Kiến trúc CSU'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet['!cols'] = [
      { wch: 22 }, // Tên
      { wch: 15 }, // SĐT
      { wch: 16 }, // CCCD
      { wch: 25 }, // Email
      { wch: 25 }, // Trường
      { wch: 16 }, // Tỉnh
      { wch: 14 }, // Năm
      { wch: 30 }, // Ngành
      { wch: 10 }, // Khối
      { wch: 14 }, // Điểm
      { wch: 18 }, // Nguồn
      { wch: 35 }  // Ghi chú
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Thi_Sinh_Thu_Thap_K32');
    XLSX.writeFile(workbook, 'Mau_Thu_Thap_Thi_Sinh_Chuan_Bo_GDDT.xlsx');
  };

  // Đọc file Excel & tự động ánh xạ cột
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (jsonRows.length < 2) {
        alert('File không có dữ liệu hoặc chỉ có dòng tiêu đề.');
        return;
      }

      const headers: string[] = jsonRows[0].map((h: any) => (h || '').toString().trim());
      const dataRows = jsonRows.slice(1).filter(r => r && r.length > 0 && r.some((c: any) => c !== undefined && c !== ''));

      setRawHeaders(headers);
      setRawJsonData(dataRows);

      // Tự động nhận diện cột (Auto heuristic match)
      const autoMap = {
        fullName: headers.find(h => /họ.*tên|tên|họ|name/i.test(h)) || headers[0] || '',
        phone: headers.find(h => /sđt|điện thoại|phone|sdt|di động/i.test(h)) || headers[1] || '',
        idCardNumber: headers.find(h => /cccd|cmnd|định danh|căn cước/i.test(h)) || '',
        email: headers.find(h => /email|mail|thư/i.test(h)) || '',
        highSchool: headers.find(h => /trường|thpt|school/i.test(h)) || '',
        province: headers.find(h => /tỉnh|thành phố|thành|địa phương/i.test(h)) || '',
        program: headers.find(h => /ngành|chuyên ngành|mã ngành|program/i.test(h)) || '',
        estimatedScore: headers.find(h => /điểm|score|tổng điểm/i.test(h)) || '',
        notes: headers.find(h => /ghi chú|note|nguyện vọng/i.test(h)) || ''
      };

      setColumnMapping(autoMap);
      setCurrentStep(2); // Sang bước Khớp Cột Động
    } catch (err: any) {
      alert(`Không thể đọc file: ${err.message}`);
    }
  };

  // Bước 3: Xem trước & Quét lỗi (Validation Engine)
  const proceedToValidation = () => {
    if (!columnMapping.fullName || !columnMapping.phone) {
      alert('Vui lòng chọn ít nhất cột "Họ và Tên" và "Số Điện Thoại" để tiếp tục.');
      return;
    }

    const nameIdx = rawHeaders.indexOf(columnMapping.fullName);
    const phoneIdx = rawHeaders.indexOf(columnMapping.phone);
    const cccdIdx = columnMapping.idCardNumber ? rawHeaders.indexOf(columnMapping.idCardNumber) : -1;
    const emailIdx = columnMapping.email ? rawHeaders.indexOf(columnMapping.email) : -1;
    const schoolIdx = columnMapping.highSchool ? rawHeaders.indexOf(columnMapping.highSchool) : -1;
    const provIdx = columnMapping.province ? rawHeaders.indexOf(columnMapping.province) : -1;
    const progIdx = columnMapping.program ? rawHeaders.indexOf(columnMapping.program) : -1;
    const scoreIdx = columnMapping.estimatedScore ? rawHeaders.indexOf(columnMapping.estimatedScore) : -1;
    const notesIdx = columnMapping.notes ? rawHeaders.indexOf(columnMapping.notes) : -1;

    const validated: ValidationRow[] = rawJsonData.map((row, index) => {
      const errors: string[] = [];
      const fullName = (row[nameIdx] || '').toString().trim();
      const rawPhone = (row[phoneIdx] || '').toString().trim();
      const cleanPhone = rawPhone.replace(/[\s\-\.]/g, '');
      const rawCccd = cccdIdx !== -1 ? (row[cccdIdx] || '').toString().trim() : '';
      const cleanCccd = rawCccd.replace(/[\s\-\.]/g, '');
      const email = emailIdx !== -1 ? (row[emailIdx] || '').toString().trim() : '';
      const highSchool = schoolIdx !== -1 ? (row[schoolIdx] || '').toString().trim() : 'Chưa cập nhật';
      const province = provIdx !== -1 ? (row[provIdx] || '').toString().trim() : 'Đà Nẵng';
      const progInput = progIdx !== -1 ? (row[progIdx] || '').toString().trim() : '';
      const scoreInput = scoreIdx !== -1 ? Number(row[scoreIdx]) : undefined;
      const notes = notesIdx !== -1 ? (row[notesIdx] || '').toString().trim() : '';

      // Kiểm tra tên
      if (!fullName || fullName.length < 2) {
        errors.push('Họ và tên thí sinh thiếu hoặc quá ngắn');
      }

      // Kiểm tra SĐT
      if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
        errors.push(`SĐT không hợp lệ: ${rawPhone}`);
      }

      // Kiểm tra CCCD
      if (cleanCccd && cleanCccd.length !== 12) {
        errors.push(`Số CCCD phải đủ 12 chữ số: ${rawCccd}`);
      }

      // Khớp chương trình
      let matchedProgram = STUDY_PROGRAMS[0];
      if (progInput) {
        const found = STUDY_PROGRAMS.find(p => 
          p.code.toLowerCase().includes(progInput.toLowerCase()) || 
          p.name.toLowerCase().includes(progInput.toLowerCase()) || 
          progInput.toLowerCase().includes(p.name.toLowerCase())
        );
        if (found) matchedProgram = found;
      }

      return {
        index: index + 1,
        fullName,
        phone: cleanPhone || rawPhone,
        idCardNumber: cleanCccd,
        email,
        highSchool,
        province,
        programIdentifier: progInput || matchedProgram.name,
        matchedProgramName: matchedProgram.name,
        estimatedScore: isNaN(scoreInput as number) ? undefined : scoreInput,
        notes,
        isValid: errors.length === 0,
        errorMessages: errors
      };
    });

    setValidationRows(validated);
    setCurrentStep(3); // Sang bước Kiểm Tra & Xem Trước
  };

  // Bước 4: Thực thi Ghi DB theo Transaction với Deduplication Mode
  const handleExecuteImport = () => {
    setImporting(true);

    try {
      const candidatesToProcess = validationRows.map(row => ({
        fullName: row.fullName,
        phone: row.phone,
        idCardNumber: row.idCardNumber,
        email: row.email,
        highSchool: row.highSchool,
        province: row.province,
        programId: STUDY_PROGRAMS.find(p => p.name === row.matchedProgramName)?.id || STUDY_PROGRAMS[0].id,
        programName: row.matchedProgramName,
        estimatedScore: row.estimatedScore,
        notes: row.notes,
        source: 'high_school_tour'
      }));

      const result = batchAddLeadsWithTransaction(candidatesToProcess, {
        fileName: file?.name || 'import_file.xlsx',
        deduplicationMode: dedupMode,
        user: getCurrentUser()
      });

      setImportResult(result);
      setCurrentStep(4); // Hoàn thành & báo cáo kết quả
      onSuccess(result.inserted + result.updatedCount + result.duplicateMergedCount);
    } catch (err: any) {
      alert(`Giao dịch Import thất bại, đã rollback an toàn: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Xuất file Excel báo cáo kết quả chi tiết
  const handleDownloadErrorReport = () => {
    if (!importResult) return;

    const reportRows = [
      ...importResult.insertedLeads.map((l: any) => ({
        'Trạng Thái': 'Thành công (Thêm mới)',
        'Mã Hồ Sơ': l.id,
        'Họ và Tên': l.fullName,
        'Số Điện Thoại': l.phone,
        'Số CCCD': l.idCardNumber || '',
        'Ngành': l.programName,
        'Lý Do / Ghi Chú': 'Đã ghi nhận vào CSDL'
      })),
      ...importResult.errors.map((e: any) => ({
        'Trạng Thái': 'Thất bại (Lỗi)',
        'Mã Hồ Sơ': `Dòng ${e.row}`,
        'Họ và Tên': e.fullName || 'Chưa rõ',
        'Số Điện Thoại': e.phone || '',
        'Số CCCD': '',
        'Ngành': '',
        'Lý Do / Ghi Chú': e.reason
      }))
    ];

    const ws = XLSX.utils.json_to_sheet(reportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ket_Qua_Import_K32');
    XLSX.writeFile(wb, `Bao_Cao_Ket_Qua_Import_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const validCount = validationRows.filter(r => r.isValid).length;
  const invalidCount = validationRows.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Quy Trình Nhập Dữ Liệu Excel / CSV Chuyên Sâu
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-amber-300 font-bold">
                  Quy trình 5 Bước Đồng Bộ DB
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Thu thập tại trường THPT, Open Day • Quét trùng lặp & Database Transaction an toàn
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

        {/* Step Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className={`flex items-center gap-2 text-xs font-bold ${currentStep >= 1 ? 'text-blue-700' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
              <span>Tải File / Template</span>
            </div>
            <div className="h-0.5 w-10 bg-slate-300" />
            <div className={`flex items-center gap-2 text-xs font-bold ${currentStep >= 2 ? 'text-blue-700' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
              <span>Khớp Cột Động</span>
            </div>
            <div className="h-0.5 w-10 bg-slate-300" />
            <div className={`flex items-center gap-2 text-xs font-bold ${currentStep >= 3 ? 'text-blue-700' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
              <span>Kiểm Tra & Xử Lý Trùng</span>
            </div>
            <div className="h-0.5 w-10 bg-slate-300" />
            <div className={`flex items-center gap-2 text-xs font-bold ${currentStep >= 4 ? 'text-blue-700' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>4</span>
              <span>Kết Quả & Báo Cáo</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* ================= STEP 1: UPLOAD & TEMPLATE ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                    <Download className="w-4 h-4 text-amber-700" />
                    Bước 1: Tải File Excel Mẫu Chuẩn Bộ GD&ĐT
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 max-w-md">
                    File mẫu chứa các trường chuẩn: Họ tên, SĐT, CCCD, Tỉnh, Trường THPT, Ngành quan tâm, Điểm dự kiến.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Template Chuẩn (.xlsx)</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-10 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition flex flex-col items-center justify-center gap-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    Kéo thả hoặc chọn file Excel thu thập tại đây
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ định dạng .xlsx, .xls, .csv từ các trường THPT và ngày hội tuyển sinh
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md"
                >
                  Chọn File Từ Máy Tính
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* ================= STEP 2: DYNAMIC COLUMN MAPPING ================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Columns className="w-4 h-4 text-blue-600" />
                    Bước 2: Khớp Cột Động (Dynamic Column Mapping)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống tự động nhận diện cột từ file <strong>{file?.name}</strong>. Vui lòng kiểm tra và ánh xạ chính xác.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-lg">
                  {rawJsonData.length} dòng dữ liệu tìm thấy
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Họ tên */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Họ và Tên Thí Sinh <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={columnMapping.fullName}
                    onChange={e => setColumnMapping({ ...columnMapping, fullName: e.target.value })}
                    className="w-full text-xs font-medium p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">-- Chọn cột trong Excel --</option>
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* SĐT */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số Điện Thoại <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={columnMapping.phone}
                    onChange={e => setColumnMapping({ ...columnMapping, phone: e.target.value })}
                    className="w-full text-xs font-medium p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">-- Chọn cột trong Excel --</option>
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* CCCD */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số CCCD / Định Danh (12 số)
                  </label>
                  <select
                    value={columnMapping.idCardNumber}
                    onChange={e => setColumnMapping({ ...columnMapping, idCardNumber: e.target.value })}
                    className="w-full text-xs font-medium p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">-- Không có hoặc bỏ qua --</option>
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Trường THPT */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Trường THPT
                  </label>
                  <select
                    value={columnMapping.highSchool}
                    onChange={e => setColumnMapping({ ...columnMapping, highSchool: e.target.value })}
                    className="w-full text-xs font-medium p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">-- Không có hoặc bỏ qua --</option>
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Tỉnh thành */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tỉnh / Thành Phố
                  </label>
                  <select
                    value={columnMapping.province}
                    onChange={e => setColumnMapping({ ...columnMapping, province: e.target.value })}
                    className="w-full text-xs font-medium p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">-- Không có hoặc bỏ qua --</option>
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Ngành */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngành Học Quan Tâm
                  </label>
                  <select
                    value={columnMapping.program}
                    onChange={e => setColumnMapping({ ...columnMapping, program: e.target.value })}
                    className="w-full text-xs font-medium p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">-- Mặc định ngành đầu tiên --</option>
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Điểm */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Điểm Ước Tính / Điểm Xét Tuyển
                  </label>
                  <select
                    value={columnMapping.estimatedScore}
                    onChange={e => setColumnMapping({ ...columnMapping, estimatedScore: e.target.value })}
                    className="w-full text-xs font-medium p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">-- Không có hoặc bỏ qua --</option>
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Email */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <select
                    value={columnMapping.email}
                    onChange={e => setColumnMapping({ ...columnMapping, email: e.target.value })}
                    className="w-full text-xs font-medium p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">-- Không có hoặc bỏ qua --</option>
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Ghi chú */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ghi Chú / Nguyện Vọng
                  </label>
                  <select
                    value={columnMapping.notes}
                    onChange={e => setColumnMapping({ ...columnMapping, notes: e.target.value })}
                    className="w-full text-xs font-medium p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">-- Không có hoặc bỏ qua --</option>
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Chọn file khác</span>
                </button>

                <button
                  onClick={proceedToValidation}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Xem Trước & Quét Lỗi Dữ Liệu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PREVIEW & VALIDATION ENGINE & DEDUP MODE ================= */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Stats badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Hợp lệ: {validCount} dòng</span>
                  </div>
                  {invalidCount > 0 && (
                    <div className="px-3 py-1.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Lỗi định dạng: {invalidCount} dòng (Bôi đỏ)</span>
                    </div>
                  )}
                </div>

                {/* Deduplication Mode Selectors */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Cơ chế xử lý trùng (SĐT/CCCD):</span>
                  <select
                    value={dedupMode}
                    onChange={e => setDedupMode(e.target.value as DeduplicationMode)}
                    className="text-xs font-bold p-2 bg-white border border-blue-400 rounded-xl text-blue-900 shadow-2xs focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="merge_history">Chế độ 3: Giữ hồ sơ cũ & Bổ sung lịch sử tiếp xúc (Khuyên dùng)</option>
                    <option value="overwrite">Chế độ 2: Ghi đè cập nhật thông tin mới nhất</option>
                    <option value="skip">Chế độ 1: Bỏ qua dòng trùng lặp</option>
                  </select>
                </div>
              </div>

              {/* Validation Table with Highlights */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-center w-12">#</th>
                      <th className="p-2.5">Họ và Tên</th>
                      <th className="p-2.5">Số Điện Thoại</th>
                      <th className="p-2.5">Số CCCD</th>
                      <th className="p-2.5">Trường THPT</th>
                      <th className="p-2.5">Ngành Quan Tâm Khớp</th>
                      <th className="p-2.5">Trạng Thái Quét</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {validationRows.slice(0, 50).map(row => (
                      <tr
                        key={row.index}
                        className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50 text-rose-900'}
                      >
                        <td className="p-2.5 text-center font-mono text-slate-400 font-bold">{row.index}</td>
                        <td className="p-2.5 font-bold text-slate-900">{row.fullName || '<Trống>'}</td>
                        <td className="p-2.5 font-mono">{row.phone}</td>
                        <td className="p-2.5 font-mono">{row.idCardNumber || '-'}</td>
                        <td className="p-2.5">{row.highSchool} ({row.province})</td>
                        <td className="p-2.5 text-blue-700 font-semibold">{row.matchedProgramName}</td>
                        <td className="p-2.5">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700" title={row.errorMessages.join('; ')}>
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              {row.errorMessages[0]}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {validationRows.length > 50 && (
                <p className="text-[11px] text-slate-500 text-center">
                  Đang hiển thị 50 / {validationRows.length} dòng xem trước. Tất cả các dòng hợp lệ sẽ được xử lý trong transaction.
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Chỉnh lại khớp cột</span>
                </button>

                <button
                  onClick={handleExecuteImport}
                  disabled={importing || validCount === 0}
                  className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  {importing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang Ghi Transaction Vào Database...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>Thực Thi Lưu Database Theo Lô (Batch Transaction)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: RESULT & REPORT ================= */}
          {currentStep === 4 && importResult && (
            <div className="space-y-6 max-w-xl mx-auto py-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-slate-900">
                  Hoàn Tất Giao Dịch Nhập Dữ Liệu!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Mã giao dịch đợt import: <code className="font-mono text-blue-700">{importResult.batchId}</code>
                </p>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Tổng dòng</span>
                  <div className="text-xl font-extrabold text-slate-800 mt-0.5">{importResult.total}</div>
                </div>
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">Thêm mới</span>
                  <div className="text-xl font-extrabold text-emerald-800 mt-0.5">{importResult.inserted}</div>
                </div>
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
                  <span className="text-[11px] font-bold text-blue-700 uppercase">Gộp/Cập nhật</span>
                  <div className="text-xl font-extrabold text-blue-800 mt-0.5">{importResult.updatedCount + importResult.duplicateMergedCount}</div>
                </div>
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
                  <span className="text-[11px] font-bold text-rose-700 uppercase">Lỗi bỏ qua</span>
                  <div className="text-xl font-extrabold text-rose-800 mt-0.5">{importResult.failedCount}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <span className="font-bold block">Tải File Excel Báo Cáo Kết Quả Chi Tiết</span>
                  <span className="text-[11px] text-amber-700">Bao gồm danh sách dòng nhập thành công và các dòng lỗi kèm lý do cụ thể để chuyên viên sửa lại.</span>
                </div>
                <button
                  onClick={handleDownloadErrorReport}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Báo Cáo (.xlsx)</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md cursor-pointer"
                >
                  Đóng & Xem Danh Sách Thí Sinh
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
