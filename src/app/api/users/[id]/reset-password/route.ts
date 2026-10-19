import { NextResponse } from 'next/server';
import { getStaffList, resetUserPassword, isUserAdmin, getSafeCurrentUser } from '@/data/storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { requesterId, newPassword } = body;

    const staffList = getStaffList();
    const requester = requesterId ? staffList.find(s => s.id === requesterId) : getSafeCurrentUser();

    if (!requester || !isUserAdmin(requester)) {
      return NextResponse.json(
        { success: false, error: '403 Forbidden: Chỉ Quản trị viên (Admin) mới có quyền đặt lại mật khẩu.' },
        { status: 403 }
      );
    }

    const res = resetUserPassword(requester, id, newPassword);

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.message }, { status: 400 });
    }

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
      { success: false, error: error?.message || 'Lỗi khi đặt lại mật khẩu' },
      { status: 500 }
    );
  }
}
