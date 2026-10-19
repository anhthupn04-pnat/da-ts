import { NextResponse } from 'next/server';
import { getStaffList, toggleStaffStatus, isUserAdmin, getSafeCurrentUser } from '@/data/storage';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { requesterId } = body;

    const staffList = getStaffList();
    const requester = requesterId ? staffList.find(s => s.id === requesterId) : getSafeCurrentUser();

    if (!requester || !isUserAdmin(requester)) {
      return NextResponse.json(
        { success: false, error: '403 Forbidden: Chỉ Quản trị viên (Admin) mới có quyền đổi trạng thái tài khoản.' },
        { status: 403 }
      );
    }

    const res = toggleStaffStatus(requester, id);

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: res.message }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi khi cập nhật trạng thái tài khoản' },
      { status: 500 }
    );
  }
}
