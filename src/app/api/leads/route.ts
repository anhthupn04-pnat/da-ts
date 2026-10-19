import { NextResponse } from 'next/server';
import { getLeads, addLead, getCurrentUser } from '@/data/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');

    let user = getCurrentUser();
    if (role && userId) {
      user = { ...user, role: role as any, id: userId };
    }

    const leads = getLeads(user);
    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
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

    const cleanCccd = (body.idCardNumber || '').replace(/[\s\-\.]/g, '');
    if (cleanCccd && cleanCccd.length !== 12) {
      return NextResponse.json(
        { success: false, error: 'Số Căn cước công dân (CCCD) phải đúng 12 chữ số.' },
        { status: 400 }
      );
    }

    if (!body.programId) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn chuyên ngành đăng ký xét tuyển.' },
        { status: 400 }
      );
    }

    const result = addLead({
      fullName: body.fullName.trim(),
      phone: cleanPhone,
      idCardNumber: cleanCccd || undefined,
      email: (body.email || '').trim().toLowerCase(),
      province: body.province || 'Đà Nẵng',
      highSchool: body.highSchool || 'Chưa cập nhật',
      graduationYear: Number(body.graduationYear) || 2026,
      programId: body.programId,
      secondaryProgramId: body.secondaryProgramId || undefined,
      examBlock: body.examBlock || 'A00',
      estimatedScore: body.estimatedScore ? Number(body.estimatedScore) : undefined,
      source: body.source || 'website',
      status: body.status || 'new',
      priority: body.priority || 'medium',
      documents: body.documents || undefined,
      notes: body.notes || 'Đăng ký xét tuyển trực tuyến'
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true, lead: result.lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Lỗi máy chủ khi xử lý tiếp nhận thông tin: ${error.message}` },
      { status: 500 }
    );
  }
}
