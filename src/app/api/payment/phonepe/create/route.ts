import { NextRequest, NextResponse } from 'next/server';
import { createPaymentOrder } from '@/services/phonepe-service';

/**
 * POST /api/payment/phonepe/create
 * Body: { amountPaise, userId, merchantId, redirectUrl?, callbackUrl?, offerId?, quantity?, notes? }
 * Returns: { success, redirectUrl?, intentUrl?, merchantOrderId?, orderId?, expireAt?, error? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const amountPaise = Number(body?.amountPaise);
    const userId = body?.userId;
    const merchantId = body?.merchantId;

    if (!userId || !merchantId || !Number.isFinite(amountPaise) || amountPaise < 100) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid amountPaise, userId, or merchantId' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const redirectUrl = body?.redirectUrl || `${baseUrl}/member/offline-payment?payment=phonepe`;
    const callbackUrl = body?.callbackUrl || redirectUrl;

    const result = await createPaymentOrder({
      amountPaise,
      userId,
      merchantId,
      redirectUrl,
      callbackUrl,
      notes: body?.notes,
      offerId: body?.offerId,
      quantity: body?.quantity != null ? Number(body.quantity) : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error ?? 'Failed to create payment' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: result.redirectUrl,
      intentUrl: result.intentUrl,
      merchantOrderId: result.merchantOrderId,
      orderId: result.orderId,
      expireAt: result.expireAt,
    });
  } catch (e) {
    console.error('PhonePe create error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 }
    );
  }
}
