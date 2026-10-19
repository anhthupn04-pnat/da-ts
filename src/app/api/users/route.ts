import { NextResponse } from 'next/server';
import { getStaffList, createStaffAccount, isUserAdmin, getSafeCurrentUser } from '@/data/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requesterId');

    const staffList = getStaffList();
    const requester = requesterId ? staffList.find(s => s.id === requesterId) : getSafeCurrentUser();

    if (!isUserAdmin(requester)) {
      return NextResponse.json(
        { success: false, error: '403 Forbidden: Yêu cầu quyền Quản trị viên (Admin) để truy cập danh sách người dùng.' },
        { status: 403 }
      );
    }

    // Trả về danh sách người dùng an toàn (ẩn mật khẩu)
    const sanitized = staffList.map(({ password, password_hash, ...rest }) => ({
      ...rest,
      hasPassword: !!(password || password_hash)
    }));

    return NextResponse.json({ success: true, users: sanitized }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requesterId, fullName, username, email, password, role = 'STAFF', phone, department } = body;

    const staffList = getStaffList();
    const requester = requesterId ? staffList.find(s => s.id === requesterId) : getSafeCurrentUser();

    if (!requester || !isUserAdmin(requester)) {
      return NextResponse.json(
        { success: false, error: '403 Forbidden: Chỉ Quản trị viên (Admin) mới có quyền tạo tài khoản người dùng.' },
        { status: 403 }
      );
    }

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ: Họ tên, Email và Mật khẩu khởi tạo.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải có độ dài tối thiểu 8 ký tự.' },
        { status: 400 }
      );
    }

    const res = createStaffAccount(requester, {
      fullName,
      username,
      email,
      password,
      role: role === 'ADMIN' || role === 'admin' ? 'ADMIN' : 'STAFF',
      phone,
      department
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: res.staff, message: res.message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi máy chủ khi tạo tài khoản' },
      { status: 500 }
    );
  }
}
