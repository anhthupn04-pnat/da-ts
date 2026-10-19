'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { batchAddLeads, getLeads } from '@/data/storage';
import { STUDY_PROGRAMS } from '@/data/programsData';
import { Lead, LeadSource, LeadPriority } from '@/types';
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
  Info
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface ParsedLeadRow {
  index: number;
  fullName: string;
  phone: string;
  email: string;
  highSchool: string;
  province: string;
  graduationYear: number;
  programIdentifier: string;
  matchedProgramName: string;
  scoreThpt?: number;
  source: LeadSource;
  notes: string;
  status: 'valid' | 'duplicate' | 'invalid';
  reason?: string;
}

export default function ExcelImportModal({ isOpen, onClose, onSuccess }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedLeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate and download standard sample Excel file
  const handleDownloadTemplate = () => {
    const currentYear = new Date().getFullYear();
    const sampleData = [
      {
        'Họ và Tên': 'Nguyễn Hoàng Long',
        'Số Điện Thoại': '0987112233',
        'Email': 'hoanglong.dtu@gmail.com',
        'Trường THPT': 'THPT Chuyên Lê Quý Đôn',
        'Tỉnh Thành': 'Đà Nẵng',
        'Năm Tốt Nghiệp': currentYear,
        'Mã Ngành Hoặc Tên Ngành': '102(CMU)',
        'Điểm Xét Tuyển THPT': 26.5,
        'Nguồn Tiếp Cận': 'website',
        'Ghi Chú': 'Thí sinh quan tâm học bổng toàn phần 100% CMU'
      },
      {
        'Họ và Tên': 'Trần Thị Thu Thảo',
        'Số Điện Thoại': '0905334455',
        'Email': 'thuthao.tran@gmail.com',
        'Trường THPT': 'THPT Phan Châu Trinh',
        'Tỉnh Thành': 'Đà Nẵng',
        'Năm Tốt Nghiệp': currentYear + 1,
        'Mã Ngành Hoặc Tên Ngành': '400(TROY)',
        'Điểm Xét Tuyển THPT': 25.0,
        'Nguồn Tiếp Cận': 'facebook',
        'Ghi Chú': 'Đã có IELTS 6.0, hỏi về Quỹ học bổng Troy 13 Tỷ'
      },
      {
        'Họ và Tên': 'Lê Minh Trí',
        'Số Điện Thoại': '0935556677',
        'Email': 'minhtri.le@gmail.com',
        'Trường THPT': 'THPT Quốc Học Huế',
        'Tỉnh Thành': 'Thừa Thiên Huế',
        'Năm Tốt Nghiệp': currentYear - 1,
        'Mã Ngành Hoặc Tên Ngành': '107(CSU)',
        'Điểm Xét Tuyển THPT': 24.0,
        'Nguồn Tiếp Cận': 'event',
        'Ghi Chú': 'Thi môn Vẽ Mỹ thuật ngành Kiến trúc công trình CSU'
      },
      {
        'Họ và Tên': 'Phạm Khánh Huyền',
        'Số Điện Thoại': '0912778899',
        'Email': 'khanhhuyen.pham@gmail.com',
        'Trường THPT': 'THPT Huỳnh Thúc Kháng',
        'Tỉnh Thành': 'Quảng Nam',
        'Năm Tốt Nghiệp': currentYear,
        'Mã Ngành Hoặc Tên Ngành': '435(PSU)',
        'Điểm Xét Tuyển THPT': 25.5,
        'Nguồn Tiếp Cận': 'tiktok',
        'Ghi Chú': 'Tìm hiểu ngành Công nghệ Tài chính (FinTech) chuẩn PSU'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    // Set auto column width
    worksheet['!cols'] = [
      { wch: 22 }, // Name
      { wch: 15 }, // Phone
      { wch: 25 }, // Email
      { wch: 25 }, // Highschool
      { wch: 15 }, // Province
      { wch: 14 }, // Grad Year
      { wch: 25 }, // Major
      { wch: 18 }, // Score
      { wch: 15 }, // Source
      { wch: 35 }  // Notes
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Thi_Sinh');
    XLSX.writeFile(workbook, 'Mau_Danh_Sach_Thi_Sinh_Tuyen_Sinh.xlsx');
  };

  // Process uploaded Excel / CSV file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setLoading(true);
    setErrorMessage(null);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

      if (rawJson.length === 0) {
        setErrorMessage('File Excel không có dữ liệu hoặc sheet đầu tiên bị trống.');
        setLoading(false);
        return;
      }

      // Existing DB leads to detect duplicates
      const currentLeads = getLeads();
      const dbPhones = new Set(currentLeads.map(l => l.phone.replace(/[\s\-\.]/g, '')));
      const dbEmails = new Set(currentLeads.map(l => l.email.trim().toLowerCase()).filter(Boolean));
      const seenFilePhones = new Set<string>();

      const rows: ParsedLeadRow[] = rawJson.map((raw, idx) => {
        // Find matching key case-insensitively
        const findVal = (...keys: string[]): string => {
          for (const k of keys) {
            for (const rowKey of Object.keys(raw)) {
              if (rowKey.toLowerCase().trim() === k.toLowerCase().trim()) {
                return String(raw[rowKey] ?? '').trim();
              }
            }
          }
          return '';
        };

        const fullName = findVal('Họ và Tên', 'Họ tên', 'Tên thí sinh', 'Full Name', 'Name', 'Họ và tên');
        const rawPhone = findVal('Số Điện Thoại', 'SĐT', 'Số ĐT', 'Điện thoại', 'Phone', 'Mobile');
        const phone = rawPhone.replace(/[\s\-\.]/g, '');
        const email = findVal('Email', 'Thư điện tử', 'Mail').toLowerCase();
        const highSchool = findVal('Trường THPT', 'Trường', 'THPT', 'School') || 'Chưa cập nhật';
        const province = findVal('Tỉnh Thành', 'Tỉnh/Thành', 'Tỉnh', 'Thành phố', 'Province') || 'Đà Nẵng';
        const gradYearRaw = findVal('Năm Tốt Nghiệp', 'Năm TN', 'Graduation Year');
        const graduationYear = Number(gradYearRaw) || new Date().getFullYear();
        const programRaw = findVal('Mã Ngành Hoặc Tên Ngành', 'Mã Ngành', 'Tên Ngành', 'Ngành', 'Chương trình', 'Program');
        const scoreRaw = findVal('Điểm Xét Tuyển THPT', 'Điểm THPT', 'Điểm', 'Score');
        const scoreThpt = scoreRaw ? parseFloat(scoreRaw) : undefined;
        const sourceRaw = findVal('Nguồn Tiếp Cận', 'Nguồn', 'Source').toLowerCase() as LeadSource;
        const source: LeadSource = ['website', 'facebook', 'tiktok', 'event', 'referral', 'hotline', 'other'].includes(sourceRaw)
          ? sourceRaw
          : 'other';
        const notes = findVal('Ghi Chú', 'Ghi chú', 'Notes') || 'Nhập từ file Excel';

        // Match Program
        let matchedProg = STUDY_PROGRAMS.find(p => p.id === programRaw || p.code.toLowerCase() === programRaw.toLowerCase());
        if (!matchedProg && programRaw) {
          const lower = programRaw.toLowerCase();
          matchedProg = STUDY_PROGRAMS.find(p => p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase()) || p.code.toLowerCase().includes(lower));
        }
        if (!matchedProg) {
          matchedProg = STUDY_PROGRAMS[0]; // fallback
        }

        // Determine Status
        let status: 'valid' | 'duplicate' | 'invalid' = 'valid';
        let reason = '';

        if (!fullName || fullName.length < 2) {
          status = 'invalid';
          reason = 'Họ tên trống hoặc quá ngắn';
        } else if (!phone || phone.length < 9) {
          status = 'invalid';
          reason = `SĐT không hợp lệ (${rawPhone || 'trống'})`;
        } else if (dbPhones.has(phone)) {
          status = 'duplicate';
          reason = `SĐT (${phone}) đã có trong cơ sở dữ liệu`;
        } else if (email && dbEmails.has(email)) {
          status = 'duplicate';
          reason = `Email (${email}) đã có trong cơ sở dữ liệu`;
        } else if (seenFilePhones.has(phone)) {
          status = 'duplicate';
          reason = `SĐT (${phone}) bị trùng lặp ngay trong file`;
        }

        seenFilePhones.add(phone);

        return {
          index: idx + 1,
          fullName,
          phone,
          email,
          highSchool,
          province,
          graduationYear,
          programIdentifier: matchedProg.id,
          matchedProgramName: matchedProg.name,
          scoreThpt,
          source,
          notes,
          status,
          reason
        };
      });

      setParsedRows(rows);
      setStep('preview');
      setLoading(false);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Không thể đọc file. Vui lòng kiểm tra file đúng định dạng Excel (.xlsx, .xls) hoặc CSV.');
      setLoading(false);
    }
  };

  const validRows = parsedRows.filter(r => r.status === 'valid');
  const duplicateRows = parsedRows.filter(r => r.status === 'duplicate');
  const invalidRows = parsedRows.filter(r => r.status === 'invalid');

  const handleConfirmImport = () => {
    if (validRows.length === 0) return;
    setImporting(true);

    const leadsToImport = validRows.map(r => ({
      fullName: r.fullName,
      phone: r.phone,
      email: r.email,
      highSchool: r.highSchool,
      province: r.province,
      graduationYear: r.graduationYear,
      programId: r.programIdentifier,
      programName: r.matchedProgramName,
      source: r.source,
      status: 'new' as const,
      priority: (r.scoreThpt && r.scoreThpt >= 25 ? 'high' : 'medium') as LeadPriority,
      scoreThpt: r.scoreThpt,
      notes: r.notes
    }));

    const result = batchAddLeads(leadsToImport);
    setImporting(false);
    onSuccess(result.inserted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Nhập Dữ Liệu Thí Sinh Từ File Excel / CSV
              </h2>
              <p className="text-xs text-slate-500">
                Tự động kiểm tra trùng lặp SĐT/Email và ánh xạ chương trình đào tạo quốc tế
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {step === 'upload' && (
            <div className="space-y-6">
              
              {/* Template Download Card */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">
                      Tải File Mẫu Excel Chuẩn Tuyển Sinh
                    </h4>
                    <p className="text-xs text-blue-800/90 mt-0.5">
                      File mẫu chứa sẵn cấu trúc cột và dữ liệu mẫu chuẩn (Họ tên, SĐT, Email, Trường THPT, Mã ngành, Điểm THPT).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải File Mẫu (.xlsx)</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-10 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200 text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-300 group-hover:scale-110 flex items-center justify-center transition-all shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>

                <h3 className="text-sm font-bold text-slate-800 mt-4">
                  Nhấp để chọn file Excel hoặc kéo thả file vào đây
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Hỗ trợ định dạng <strong>.xlsx, .xls, .csv</strong> (kích thước tối đa 15MB)
                </p>

                {loading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-blue-700">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang đọc và kiểm tra dữ liệu file...</span>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-5">
              
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block font-medium">Tổng số dòng:</span>
                  <span className="text-xl font-black text-slate-900">{parsedRows.length}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 block font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ để nhập:
                  </span>
                  <span className="text-xl font-black text-emerald-800">{validRows.length}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-amber-700 block font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Trùng SĐT/Email:
                  </span>
                  <span className="text-xl font-black text-amber-800">{duplicateRows.length}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="text-rose-700 block font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Lỗi / Thiếu tin:
                  </span>
                  <span className="text-xl font-black text-rose-800">{invalidRows.length}</span>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  Chỉ những dòng có trạng thái <strong>Hợp lệ ({validRows.length})</strong> sẽ được lưu vào cơ sở dữ liệu thật. Các dòng trùng lặp sẽ tự động bỏ qua để tránh rác dữ liệu.
                </span>
                <button
                  onClick={() => setStep('upload')}
                  className="text-blue-700 hover:underline font-bold shrink-0 ml-4 cursor-pointer"
                >
                  Chọn file khác
                </button>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-12 text-center">STT</th>
                        <th className="p-3">Họ và Tên</th>
                        <th className="p-3">Số Điện Thoại</th>
                        <th className="p-3">Trường THPT</th>
                        <th className="p-3">Ngành Khớp</th>
                        <th className="p-3">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((row) => (
                        <tr key={row.index} className={row.status === 'valid' ? 'hover:bg-slate-50' : 'bg-slate-50/50'}>
                          <td className="p-3 text-center text-slate-400 font-mono">{row.index}</td>
                          <td className="p-3 font-bold text-slate-800">{row.fullName || '—'}</td>
                          <td className="p-3 font-mono text-slate-600">{row.phone || '—'}</td>
                          <td className="p-3 text-slate-600">{row.highSchool}</td>
                          <td className="p-3 text-blue-700 font-medium">{row.matchedProgramName}</td>
                          <td className="p-3">
                            {row.status === 'valid' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                              </span>
                            )}
                            {row.status === 'duplicate' && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800"
                                title={row.reason}
                              >
                                <AlertTriangle className="w-3 h-3" /> Trùng lặp
                              </span>
                            )}
                            {row.status === 'invalid' && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800"
                                title={row.reason}
                              >
                                <AlertCircle className="w-3 h-3" /> Lỗi
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            Đóng
          </button>

          {step === 'preview' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Tải Lại File
              </button>

              <button
                type="button"
                disabled={validRows.length === 0 || importing}
                onClick={handleConfirmImport}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-emerald-700/20 transition flex items-center gap-2 cursor-pointer"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang lưu vào hệ thống...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận Nhập ({validRows.length} Hồ Sơ)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
