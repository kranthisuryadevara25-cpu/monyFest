import { NextRequest, NextResponse } from 'next/server';
import { handleWebhook } from '@/services/phonepe-service';

/**
 * POST /api/payment/phonepe/webhook
 * PhonePe S2S callback. Pass raw body for signature verification.
 * Configure this URL in PhonePe Business Dashboard → Developer Settings → Webhooks.
 */
export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const authorization = request.headers.get('authorization') ?? request.headers.get('x-verify');

  const result = await handleWebhook(rawBody, authorization);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? 'Webhook processing failed' },
      { status: result.statusCode }
    );
  }

  return new NextResponse(null, { status: 200 });
}
