import { NextRequest, NextResponse } from 'next/server';
import { getPaymentOrderStatus } from '@/services/phonepe-service';

/**
 * GET /api/payment/phonepe/status?merchantOrderId=ppg_xxx
 * Poll this after redirecting user to PhonePe to check if payment completed.
 */
export async function GET(request: NextRequest) {
  const merchantOrderId = request.nextUrl.searchParams.get('merchantOrderId');
  if (!merchantOrderId) {
    return NextResponse.json(
      { error: 'Missing merchantOrderId' },
      { status: 400 }
    );
  }

  const status = await getPaymentOrderStatus(merchantOrderId);
  return NextResponse.json(status);
}
