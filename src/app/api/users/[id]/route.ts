import { NextResponse } from 'next/server';
import { updateUserInDb, deleteUserFromDb, getUserByIdFromDb } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-middleware';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const isSelf = Boolean(body.requesterId && body.requesterId === id);
    let currentUser;

    if (isSelf) {
      currentUser = await getUserByIdFromDb(body.requesterId);
      if (!currentUser || currentUser.status !== 'ACTIVE') {
        return NextResponse.json(
          { success: false, error: '403 Forbidden: Tài khoản không hợp lệ hoặc đã bị khóa.' },
          { status: 403 }
        );
      }
    } else {
      const authCheck = await requireAdminAuth(request, body.requesterId);
      if (!authCheck.authorized) {
        return authCheck.response!;
      }
      currentUser = authCheck.user!;
    }

    // Chặn Admin tự hạ quyền của chính mình
    if (id === currentUser.id && currentUser.role === 'ADMIN' && body.role && body.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bảo mật: Bạn không thể tự hạ quyền Quản trị viên (ADMIN) của chính mình.' },
        { status: 403 }
      );
    }

    const fullName = body.full_name !== undefined ? body.full_name : body.fullName;
    if (fullName !== undefined && (!fullName || fullName.trim().length < 2)) {
      return NextResponse.json(
        { success: false, error: 'Họ và tên người dùng phải có tối thiểu 2 ký tự.' },
        { status: 400 }
      );
    }

    // Nếu là self-update của nhân sự thường, không cho phép đổi vai trò hệ thống
    const targetRole = currentUser.role === 'ADMIN' ? body.role : undefined;

    const updatedUser = await updateUserInDb(id, {
      full_name: fullName,
      role: targetRole,
      phone: body.phone,
      department: body.department
    });

    return NextResponse.json(
      {
        success: true,
        user: updatedUser,
        message: 'Cập nhật thông tin tài khoản người dùng trong CSDL thành công!'
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi khi cập nhật tài khoản trong Database' },
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
    const authCheck = await requireAdminAuth(request);
    if (!authCheck.authorized) {
      return authCheck.response!;
    }

    const currentAdmin = authCheck.user!;

    // Chặn Admin tự xóa chính tài khoản của mình
    if (id === currentAdmin.id) {
      return NextResponse.json(
        { success: false, error: 'Bảo mật: Bạn không thể tự xóa tài khoản đang đăng nhập của chính mình!' },
        { status: 403 }
      );
    }

    const targetUser = await getUserByIdFromDb(id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản cần xóa không tồn tại trong CSDL.' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    await deleteUserFromDb(id, { hardDelete });

    return NextResponse.json(
      {
        success: true,
        message: hardDelete
          ? 'Đã xóa dứt điểm bản ghi người dùng khỏi Database.'
          : 'Đã xóa tài khoản và lưu dấu vết toàn vẹn dữ liệu thành công.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi khi xóa người dùng khỏi Database' },
      { status: 500 }
    );
  }
}
