import { NextResponse } from 'next/server';
import { queryUsersFromDb, createUserInDb } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-middleware';

export async function GET(request: Request) {
  try {
    const authCheck = await requireAdminAuth(request);
    if (!authCheck.authorized) {
      return authCheck.response!;
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const role = searchParams.get('role') || 'ALL';
    const status = searchParams.get('status') || 'ALL';

    const result = await queryUsersFromDb({
      page,
      limit,
      search,
      role,
      status
    });

    return NextResponse.json(
      {
        success: true,
        users: result.users,
        pagination: result.pagination
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi cơ sở dữ liệu khi truy vấn danh sách người dùng' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const authCheck = await requireAdminAuth(request, body.requesterId);
    if (!authCheck.authorized) {
      return authCheck.response!;
    }

    const fullName = (body.full_name || body.fullName || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const username = (body.username || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    const role = (body.role || 'STAFF').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STAFF';
    const phone = (body.phone || '').trim();
    const department = (body.department || '').trim();

    // Validate dữ liệu đầu vào
    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Họ và tên người dùng phải có tối thiểu 2 ký tự.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Địa chỉ Email không đúng định dạng tiêu chuẩn.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu khởi tạo phải có độ dài tối thiểu 8 ký tự.' },
        { status: 400 }
      );
    }

    // Thực thi thêm bản ghi vào Database với Bcrypt Hash và DB Transaction
    const newUser = await createUserInDb({
      full_name: fullName,
      email,
      username: username || email.split('@')[0],
      password,
      role,
      phone,
      department
    });

    return NextResponse.json(
      {
        success: true,
        user: newUser,
        message: 'Tạo tài khoản người dùng mới thành công và đã lưu bền vững vào CSDL.'
      },
      { status: 201 }
    );
  } catch (error: any) {
    const isConflict = error?.message?.includes('đã tồn tại') || error?.message?.includes('đã được sử dụng');
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi cơ sở dữ liệu khi tạo tài khoản' },
      { status: isConflict ? 409 : 500 }
    );
  }
}
