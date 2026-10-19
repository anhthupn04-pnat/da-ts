import { NextResponse } from 'next/server';
import { resetUserPasswordInDb, getUserByIdFromDb } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-middleware';

export async function POST(
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

    const targetUser = await getUserByIdFromDb(id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tài khoản để đặt lại mật khẩu.' },
        { status: 404 }
      );
    }

    if (body.newPassword && body.newPassword.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu mới phải có tối thiểu 8 ký tự.' },
        { status: 400 }
      );
    }

    const res = await resetUserPasswordInDb(id, body.newPassword);

    return NextResponse.json(
      {
        success: true,
        newPassword: res.newPassword,
        message: res.message
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi khi đặt lại mật khẩu trong Database' },
      { status: 500 }
    );
  }
}
