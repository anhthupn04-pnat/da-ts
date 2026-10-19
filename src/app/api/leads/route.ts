import { NextResponse } from 'next/server';
import {
  queryLeadsFromDb,
  createLeadInDb,
  updateLeadInDb,
  deleteLeadFromDb,
  batchAssignLeadsInDb
} from '@/lib/db';
import { requireManagerOrAdminAuth, requireAdmissionsAuth } from '@/lib/auth-middleware';

/**
 * GET /api/leads
 * Lấy danh sách thí sinh từ cơ sở dữ liệu SQLite & Supabase
 * Hỗ trợ bộ lọc role, userId (phân quyền cho chuyên viên), search, status, programId
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const programId = searchParams.get('programId') || undefined;

    const leads = await queryLeadsFromDb({
      role,
      userId,
      search,
      status,
      programId
    });

    return NextResponse.json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Lỗi truy vấn danh sách thí sinh: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * Lưu hồ sơ thí sinh đăng ký tư vấn hoặc nộp xét tuyển trực tuyến trực tiếp vào Database
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validation họ tên
    if (!body.fullName || body.fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Họ và tên thí sinh phải có ít nhất 2 ký tự.' },
        { status: 400 }
      );
    }

    // 2. Validation số điện thoại (10 số Việt Nam)
    const cleanPhone = (body.phone || '').replace(/[\s\-\.]/g, '');
    if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại không hợp lệ (cần đúng 10 chữ số di động Việt Nam).' },
        { status: 400 }
      );
    }

    // 3. Validation CCCD (12 số nếu có)
    const cleanCccd = (body.idCardNumber || '').replace(/[\s\-\.]/g, '');
    if (cleanCccd && cleanCccd.length !== 12) {
      return NextResponse.json(
        { success: false, error: 'Số Căn cước công dân (CCCD) phải đúng 12 chữ số.' },
        { status: 400 }
      );
    }

    // 4. Validation ngành đào tạo
    if (!body.programId) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn chuyên ngành đăng ký xét tuyển.' },
        { status: 400 }
      );
    }

    // 5. Lưu bền vững vào CSDL Database
    const lead = await createLeadInDb({
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
      estimatedScore: body.estimatedScore !== undefined ? Number(body.estimatedScore) : undefined,
      source: body.source || 'website',
      utmCampaign: body.utmCampaign || undefined,
      status: body.status || 'new',
      priority: body.priority || 'medium',
      assignedTo: body.assignedTo || undefined,
      assignedToName: body.assignedToName || undefined,
      departmentId: body.departmentId || undefined,
      paymentStatus: body.paymentStatus || 'unpaid',
      feePaidAmount: body.feePaidAmount !== undefined ? Number(body.feePaidAmount) : undefined,
      paymentTransactionId: body.paymentTransactionId || undefined,
      paymentDate: body.paymentDate || undefined,
      documents: body.documents || undefined,
      notes: body.notes || 'Đăng ký xét tuyển trực tuyến',
      allowUpdateIfExists: body.allowUpdateIfExists ?? true
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/leads
 * Cập nhật thông tin hồ sơ thí sinh hoặc phân công hàng loạt trong Database
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    // Phân công hàng loạt: Chỉ Quản lý (MANAGER) hoặc Quản trị viên (ADMIN) mới có quyền
    if (body.action === 'batch_assign') {
      const auth = await requireManagerOrAdminAuth(request, body.requesterId);
      if (!auth.authorized) {
        return auth.response!;
      }

      const { leadIds, staffId, staffName } = body;
      if (!Array.isArray(leadIds) || leadIds.length === 0 || !staffId) {
        return NextResponse.json(
          { success: false, error: 'Dữ liệu phân công không hợp lệ.' },
          { status: 400 }
        );
      }
      const count = await batchAssignLeadsInDb(leadIds, staffId, staffName || 'Chuyên viên');
      return NextResponse.json({ success: true, count });
    }

    // Cập nhật từng hồ sơ: Chuyên viên tuyển sinh, Quản lý hoặc Admin
    const auth = await requireAdmissionsAuth(request, body.requesterId);
    if (!auth.authorized) {
      return auth.response!;
    }

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã hồ sơ thí sinh cần cập nhật.' },
        { status: 400 }
      );
    }

    const updated = await updateLeadInDb(body.id, body.updates || body);
    return NextResponse.json({ success: true, lead: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Lỗi cập nhật hồ sơ: ${error.message}` },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/leads
 * Xóa vĩnh viễn hồ sơ thí sinh khỏi Database
 * Ràng buộc RBAC: Chỉ Quản lý (MANAGER) hoặc Quản trị viên (ADMIN) mới được xóa.
 * Chuyên viên tuyển sinh (STAFF_ADMISSIONS) và Marketing (STAFF_MARKETING) không có quyền xóa.
 */
export async function DELETE(request: Request) {
  try {
    const auth = await requireManagerOrAdminAuth(request);
    if (!auth.authorized) {
      return auth.response!;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp mã hồ sơ thí sinh cần xóa.' },
        { status: 400 }
      );
    }

    await deleteLeadFromDb(id);
    return NextResponse.json({ success: true, message: `Đã xóa hồ sơ ${id} thành công.` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Lỗi xóa hồ sơ: ${error.message}` },
      { status: 500 }
    );
  }
}
