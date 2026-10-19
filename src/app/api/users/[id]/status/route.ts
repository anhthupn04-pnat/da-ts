import { NextResponse } from 'next/server';
import { toggleUserStatusInDb, getUserByIdFromDb } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-middleware';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const authCheck = await requireAdminAuth(request, body.requesterId);
    if (!authCheck.authorized) {
      return authCheck.response!;
    }

    const currentAdmin = authCheck.user!;

    // Chặn Admin tự khóa chính mình
    if (id === currentAdmin.id) {
      return NextResponse.json(
        { success: false, error: 'Bảo mật: Bạn không thể tự khóa tài khoản của chính mình!' },
        { status: 403 }
      );
    }

    const targetUser = await getUserByIdFromDb(id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản người dùng không tồn tại trong CSDL.' },
        { status: 404 }
      );
    }

    const res = await toggleUserStatusInDb(id, body.status);

    return NextResponse.json(
      {
        success: true,
        status: res.status,
        message: res.message
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi khi cập nhật trạng thái trong Database' },
      { status: 500 }
    );
  }
}
