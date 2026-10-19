import { NextResponse } from 'next/server';
import { verifyUserCredentials } from '@/lib/db';
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp Tên đăng nhập/Email và Mật khẩu.' },
        { status: 400 }
      );
    }

    const result = await verifyUserCredentials(identifier, password);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.message || 'Tài khoản hoặc mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: result.user,
        message: 'Xác thực tài khoản thành công.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi hệ thống khi xác thực đăng nhập' },
      { status: 500 }
    );
  }
}
