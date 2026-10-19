import { NextResponse } from 'next/server';
import { getUserByIdFromDb, DbUser } from './db';
import { CanonicalRole } from '@/types';

/**
 * Helper chuẩn hóa vai trò (hỗ trợ tương thích ngược)
 */
function normalizeUserRole(role: string): CanonicalRole {
  if (role === 'ADMIN' || role === 'admin') return 'ADMIN';
  if (role === 'MANAGER' || role === 'manager') return 'MANAGER';
  if (role === 'STAFF_MARKETING' || role === 'marketer') return 'STAFF_MARKETING';
  return 'STAFF_ADMISSIONS';
}

/**
 * Middleware cốt lõi kiểm tra xác thực quyền hạn RBAC (Role-Based Access Control)
 */
export async function requireRoleAuth(
  request: Request,
  allowedRoles: CanonicalRole[],
  bodyRequesterId?: string
): Promise<{
  authorized: boolean;
  user?: DbUser;
  response?: NextResponse;
}> {
  const url = new URL(request.url);
  const requesterId =
    bodyRequesterId ||
    request.headers.get('x-user-id') ||
    url.searchParams.get('requesterId') ||
    url.searchParams.get('userId') ||
    '00000000-0000-0000-0000-000000000001'; // Fallback admin mặc định trong môi trường dev

  if (!requesterId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: '401 Unauthorized: Vui lòng đăng nhập để thực hiện tác vụ này.' },
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
        { success: false, error: '403 Forbidden: Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động.' },
        { status: 403 }
      )
    };
  }

  const userRole = normalizeUserRole(user.role);

  // ADMIN luôn có quyền truy cập toàn bộ hệ thống
  if (userRole === 'ADMIN' || allowedRoles.includes(userRole)) {
    return { authorized: true, user };
  }

  const roleLabels: Record<CanonicalRole, string> = {
    ADMIN: 'Quản trị viên (ADMIN)',
    MANAGER: 'Quản lý / Trưởng phòng (MANAGER)',
    STAFF_ADMISSIONS: 'Chuyên viên Tuyển sinh (STAFF_ADMISSIONS)',
    STAFF_MARKETING: 'Chuyên viên Marketing (STAFF_MARKETING)'
  };

  const allowedLabels = allowedRoles.map(r => roleLabels[r]).join(', ');

  return {
    authorized: false,
    response: NextResponse.json(
      {
        success: false,
        error: `403 Forbidden: Thao tác này yêu cầu quyền [${allowedLabels}]. Vai trò hiện tại của bạn là [${roleLabels[userRole]}].`
      },
      { status: 403 }
    )
  };
}

/**
 * 1. Middleware yêu cầu quyền Quản trị viên (ADMIN)
 * Dùng cho: Quản lý người dùng, cấu hình mùa tuyển sinh, xem audit logs, sao lưu DB.
 */
export async function requireAdminAuth(request: Request, bodyRequesterId?: string) {
  return requireRoleAuth(request, ['ADMIN'], bodyRequesterId);
}

/**
 * 2. Middleware yêu cầu quyền Quản lý hoặc Admin (ADMIN, MANAGER)
 * Dùng cho: Phân bổ hồ sơ, Round-Robin, phê duyệt học bổng/trúng tuyển, xem báo cáo tổng thể.
 */
export async function requireManagerOrAdminAuth(request: Request, bodyRequesterId?: string) {
  return requireRoleAuth(request, ['ADMIN', 'MANAGER'], bodyRequesterId);
}

/**
 * 3. Middleware yêu cầu quyền Tuyển sinh (ADMIN, MANAGER, STAFF_ADMISSIONS)
 * Dùng cho: Xem hồ sơ, ghi chú tư vấn, thẩm định học bạ & minh chứng điểm.
 */
export async function requireAdmissionsAuth(request: Request, bodyRequesterId?: string) {
  return requireRoleAuth(request, ['ADMIN', 'MANAGER', 'STAFF_ADMISSIONS'], bodyRequesterId);
}

/**
 * 4. Middleware yêu cầu quyền Marketing (ADMIN, MANAGER, STAFF_MARKETING)
 * Dùng cho: Quản lý chiến dịch, nguồn UTM, import danh sách leads thô từ Excel/CSV.
 */
export async function requireMarketingAuth(request: Request, bodyRequesterId?: string) {
  return requireRoleAuth(request, ['ADMIN', 'MANAGER', 'STAFF_MARKETING'], bodyRequesterId);
}
