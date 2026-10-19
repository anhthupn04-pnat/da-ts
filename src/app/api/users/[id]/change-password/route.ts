import { NextResponse } from 'next/server';
import { changeUserPasswordInDb, getUserByIdFromDb } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { requesterId, currentPassword, newPassword } = body;

    if (!requesterId) {
      return NextResponse.json(
        { success: false, error: '401 Unauthorized: Vui lòng cung cấp mã tài khoản xác thực.' },
        { status: 401 }
      );
    }

    const requester = await getUserByIdFromDb(requesterId);
    if (!requester || requester.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: '403 Forbidden: Phiên làm việc của bạn không hợp lệ hoặc đã bị khóa.' },
        { status: 403 }
      );
    }

    // Người dùng chỉ được đổi mật khẩu của chính mình, trừ phi là ADMIN
    const isSelf = requesterId === id;
    const isAdmin = requester.role === 'ADMIN';

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { success: false, error: '403 Forbidden: Bạn không có quyền đổi mật khẩu của tài khoản khác.' },
        { status: 403 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' },
        { status: 400 }
      );
    }

    if (!isAdmin && (!currentPassword || typeof currentPassword !== 'string')) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập mật khẩu hiện tại để xác thực.' },
        { status: 400 }
      );
    }

    const result = await changeUserPasswordInDb(id, currentPassword || '', newPassword.trim(), requesterId);

    return NextResponse.json(
      {
        success: true,
        message: result.message || 'Đổi mật khẩu thành công!'
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi hệ thống khi đổi mật khẩu người dùng' },
      { status: 400 }
    );
  }
}
