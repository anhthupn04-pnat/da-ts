import { NextResponse } from 'next/server';
import { autoAssignRoundRobin, autoAssignByRegion, batchReassignLeads, getSafeCurrentUser } from '@/data/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, leadIds, targetStaffId, user } = body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Chưa có thí sinh nào được chọn để phân bổ.' },
        { status: 400 }
      );
    }

    const currentUser = user || getSafeCurrentUser();

    if (action === 'round_robin') {
      const res = autoAssignRoundRobin(leadIds, currentUser);
      return NextResponse.json({ success: true, count: res.assignedCount });
    }

    if (action === 'by_region') {
      const res = autoAssignByRegion(leadIds, currentUser);
      return NextResponse.json({ success: true, count: res.assignedCount });
    }

    if (action === 'reassign') {
      if (!targetStaffId) {
        return NextResponse.json(
          { success: false, error: 'Chưa chỉ định chuyên viên tiếp nhận.' },
          { status: 400 }
        );
      }
      const res = batchReassignLeads(leadIds, targetStaffId, currentUser);
      return NextResponse.json({ success: true, count: res.count });
    }

    return NextResponse.json(
      { success: false, error: 'Hành động không hợp lệ.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
