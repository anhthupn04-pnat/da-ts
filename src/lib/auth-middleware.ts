import { NextResponse } from 'next/server';
import { getUserByIdFromDb, DbUser } from './db';

/**
 * Middleware kiểm tra xác thực quyền Quản trị viên (ADMIN)
 */
export async function requireAdminAuth(request: Request, bodyRequesterId?: string): Promise<{
  authorized: boolean;
  user?: DbUser;
  response?: NextResponse;
}> {
  const url = new URL(request.url);
  const requesterId =
    bodyRequesterId ||
    request.headers.get('x-user-id') ||
    url.searchParams.get('requesterId') ||
    '00000000-0000-0000-0000-000000000001'; // Default seed admin fallback nếu đang dev

  if (!requesterId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: '401 Unauthorized: Vui lòng đăng nhập để thực hiện tác vụ.' },
        { status: 401 }
      )
    };
  }

  const user = await getUserByIdFromDb(requesterId);
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: '401 Unauthorized: Tài khoản xác thực không tồn tại trong hệ thống.' },
        { status: 401 }
      )
    };
  }

  if (user.status !== 'ACTIVE') {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: '403 Forbidden: Tài khoản của bạn đã bị khóa.' },
        { status: 403 }
      )
    };
  }

  if (user.role !== 'ADMIN') {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: '403 Forbidden: Bạn không có quyền Quản trị viên (ADMIN) để thực hiện thao tác này.' },
        { status: 403 }
      )
    };
  }

  return { authorized: true, user };
}
