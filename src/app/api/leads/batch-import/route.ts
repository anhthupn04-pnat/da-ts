import { NextResponse } from 'next/server';
import { batchAddLeadsWithTransaction, getCurrentUser } from '@/data/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { newLeadsList, deduplicationMode = 'merge_history', fileName = 'import_file.xlsx', user } = body;

    if (!Array.isArray(newLeadsList) || newLeadsList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Danh sách dữ liệu thí sinh trống hoặc không đúng định dạng mảng.' },
        { status: 400 }
      );
    }

    const currentUser = user || getCurrentUser();

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
