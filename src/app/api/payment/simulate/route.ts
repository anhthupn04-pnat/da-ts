import { NextResponse } from 'next/server';
import { simulatePaymentAutoClear } from '@/data/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, amount, method = 'vietqr' } = body;

    if (!candidateId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã hồ sơ thí sinh hoặc số tiền thanh toán.' },
        { status: 400 }
      );
    }

    const result = simulatePaymentAutoClear(candidateId, Number(amount), method);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Gạch nợ tự động thành công!',
      lead: result.lead
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
