import { NextResponse } from 'next/server';
import { getStaffList, updateUserByAdmin, deleteStaffAccount, isUserAdmin, getSafeCurrentUser } from '@/data/storage';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { requesterId, fullName, username, email, role, phone, department, status } = body;

    const staffList = getStaffList();
    const requester = requesterId ? staffList.find(s => s.id === requesterId) : getSafeCurrentUser();

    if (!requester || !isUserAdmin(requester)) {
      return NextResponse.json(
        { success: false, error: '403 Forbidden: Chỉ Quản trị viên (Admin) mới có quyền chỉnh sửa tài khoản.' },
        { status: 403 }
      );
    }

    const res = updateUserByAdmin(requester, id, {
      fullName,
      username,
      email,
      role,
      phone,
      department,
      status
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: res.staff, message: res.message }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi khi cập nhật tài khoản' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requesterId');

    const staffList = getStaffList();
    const requester = requesterId ? staffList.find(s => s.id === requesterId) : getSafeCurrentUser();

    if (!requester || !isUserAdmin(requester)) {
      return NextResponse.json(
        { success: false, error: '403 Forbidden: Chỉ Quản trị viên (Admin) mới có quyền xóa tài khoản.' },
        { status: 403 }
      );
    }

    const res = deleteStaffAccount(requester, id);

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: res.message }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi khi xóa tài khoản' },
      { status: 500 }
    );
  }
}
