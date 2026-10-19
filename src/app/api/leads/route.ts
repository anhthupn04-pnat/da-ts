import { NextResponse } from 'next/server';
import { getLeads, addLead } from '@/data/storage';

export async function GET() {
  const leads = getLeads();
  return NextResponse.json({ success: true, count: leads.length, leads });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Server-side validation
    if (!body.fullName || body.fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Họ và tên thí sinh phải có ít nhất 2 ký tự.' },
        { status: 400 }
      );
    }

    const cleanPhone = (body.phone || '').replace(/[\s\-\.]/g, '');
    if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại không hợp lệ (cần đúng 10 chữ số di động Việt Nam).' },
        { status: 400 }
      );
    }

    if (!body.programId) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn chuyên ngành đăng ký tư vấn.' },
        { status: 400 }
      );
    }

    const result = addLead({
      fullName: body.fullName.trim(),
      phone: cleanPhone,
      email: (body.email || '').trim().toLowerCase(),
      province: body.province || 'Đà Nẵng',
      highSchool: body.highSchool || 'Chưa cập nhật',
      graduationYear: Number(body.graduationYear) || new Date().getFullYear(),
      programId: body.programId,
      source: body.source || 'website',
      status: 'new',
      priority: body.priority || 'medium',
      notes: body.notes || 'Đăng ký tư vấn trực tuyến'
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true, lead: result.lead }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi xử lý tiếp nhận thông tin.' },
      { status: 500 }
    );
  }
}
