import { NextResponse } from 'next/server';
import { STUDY_PROGRAMS } from '@/data/programsData';

export async function POST(request: Request) {
  try {
    const { taskType, programId, studentName, studentScore } = await request.json();

    const prog = STUDY_PROGRAMS.find(p => p.id === programId) || STUDY_PROGRAMS[0];

    // Check if Gemini API key exists in environment
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      // Future live external call if key is provided
    }

    // Default high-fidelity admissions generation
    let result = '';
    if (taskType === 'call_script') {
      result = `[KỊCH BẢN GỌI ĐIỆN TƯ VẤN ${prog.name.toUpperCase()}]\nChào ${studentName || 'bạn'}, Thầy/Cô liên hệ từ Trung tâm Tư vấn Trường Đào tạo Quốc tế (VN-US) – ĐH Duy Tân. Thầy/Cô thấy em có điểm ${studentScore || '24.0'} và đang quan tâm ngành ${prog.name}. Chương trình được kiểm định ${prog.accreditation} và có cơ hội nhận học bổng giá trị...`;
    } else {
      result = `[NỘI DUNG TƯ VẤN NGÀNH ${prog.code}]\n${prog.description}\nCơ hội việc làm: ${prog.careerProspects}`;
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Lỗi sinh nội dung AI' }, { status: 500 });
  }
}
