import { NextResponse } from 'next/server';
import { batchAddLeadsWithTransaction, getSafeCurrentUser } from '@/data/storage';
import { requireMarketingAuth } from '@/lib/auth-middleware';

export async function POST(request: Request) {
  try {
    const authCheck = await requireMarketingAuth(request);
    if (!authCheck.authorized) {
      return authCheck.response!;
    }

    const body = await request.json();
    const { newLeadsList, deduplicationMode = 'merge_history', fileName = 'import_file.xlsx', user } = body;

    if (!Array.isArray(newLeadsList) || newLeadsList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Danh sách dữ liệu thí sinh trống hoặc không đúng định dạng mảng.' },
        { status: 400 }
      );
    }

    const currentUser = user || getSafeCurrentUser();

    const result = batchAddLeadsWithTransaction(newLeadsList, {
      fileName,
      deduplicationMode,
      user: currentUser
    });

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Lỗi Transaction Batch Import: ${error.message}` },
      { status: 500 }
    );
  }
}
