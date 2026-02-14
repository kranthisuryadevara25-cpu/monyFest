'use server';

/**
 * PhonePe Payment Gateway integration for in-store digital payments (UPI-focused).
 * Uses official Node SDK when available (npm i pg-sdk-node); otherwise see README for REST fallback.
 * Env: PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, PHONEPE_CLIENT_VERSION, PHONEPE_ENV (SANDBOX|PRODUCTION),
 *      PHONEPE_WEBHOOK_USERNAME, PHONEPE_WEBHOOK_PASSWORD (for webhook verification).
 */
import { doc, setDoc, getDoc, Timestamp, collection } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { recordPurchaseFromGateway } from './points-service';
import { createHash } from 'crypto';

const PAYMENT_ORDERS_COLLECTION = 'payment_orders';
const MIN_AMOUNT_PAISE = 100; // ₹1 minimum
const MERCHANT_ORDER_ID_PREFIX = 'ppg_';
const ORDER_EXPIRE_SECONDS = 3600;

export type PhonePeOrderMeta = {
  userId: string;
  merchantId: string;
  amountPaise: number;
  offerId?: string;
  quantity?: number;
  notes?: string;
};

export type CreatePaymentOrderResult = {
  success: boolean;
  redirectUrl?: string;
  intentUrl?: string;
  merchantOrderId?: string;
  orderId?: string;
  expireAt?: number;
  error?: string;
};

export type WebhookResult = {
  ok: boolean;
  statusCode: number;
  error?: string;
};

type PaymentOrderDoc = {
  merchantOrderId: string;
  userId: string;
  merchantId: string;
  amountPaise: number;
  offerId?: string;
  quantity?: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: ReturnType<typeof Timestamp.now>;
  updatedAt: ReturnType<typeof Timestamp.now>;
  gatewayOrderId?: string;
  errorCode?: string;
};

function getEnv(name: string): string | undefined {
  return process.env[name];
}

function getConfig() {
  const clientId = getEnv('PHONEPE_CLIENT_ID');
  const clientSecret = getEnv('PHONEPE_CLIENT_SECRET');
  const clientVersion = getEnv('PHONEPE_CLIENT_VERSION') || '1.0';
  const env = getEnv('PHONEPE_ENV') || 'SANDBOX';
  const webhookUsername = getEnv('PHONEPE_WEBHOOK_USERNAME');
  const webhookPassword = getEnv('PHONEPE_WEBHOOK_PASSWORD');
  return {
    clientId,
    clientSecret,
    clientVersion,
    env,
    webhookUsername,
    webhookPassword,
    isConfigured: !!(clientId && clientSecret),
  };
}

/**
 * Initialize client config (validates env). Call once at startup or before first use.
 */
export async function initClient(): Promise<{ configured: boolean; error?: string }> {
  const config = getConfig();
  if (!config.isConfigured) {
    return { configured: false, error: 'PHONEPE_CLIENT_ID or PHONEPE_CLIENT_SECRET missing' };
  }
  return { configured: true };
}

/**
 * Create a payment order: store pending order in Firestore, call PhonePe Pay API, return redirect/intent URL.
 * Use metaInfo.udf1–udf5 to pass userId, merchantId, offerId, quantity for webhook lookup (we store in Firestore instead and use merchantOrderId).
 */
export async function createPaymentOrder(params: {
  amountPaise: number;
  userId: string;
  merchantId: string;
  callbackUrl?: string;
  redirectUrl?: string;
  notes?: string;
  offerId?: string;
  quantity?: number;
}): Promise<CreatePaymentOrderResult> {
  const config = getConfig();
  if (!config.isConfigured) {
    return { success: false, error: 'PhonePe is not configured' };
  }
  if (params.amountPaise < MIN_AMOUNT_PAISE) {
    return { success: false, error: `Minimum amount is ${MIN_AMOUNT_PAISE} paise (₹1)` };
  }

  const merchantOrderId =
    MERCHANT_ORDER_ID_PREFIX +
    params.userId.slice(0, 8) +
    '_' +
    Date.now().toString(36) +
    '_' +
    Math.random().toString(36).slice(2, 8);
  const redirectUrl = params.redirectUrl || params.callbackUrl || '';
  const callbackUrl = params.callbackUrl || '';

  if (!isFirebaseConfigured) {
    return { success: false, error: 'Firebase is not configured' };
  }

  const orderDoc: PaymentOrderDoc = {
    merchantOrderId,
    userId: params.userId,
    merchantId: params.merchantId,
    amountPaise: params.amountPaise,
    offerId: params.offerId,
    quantity: params.quantity,
    status: 'PENDING',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const ordersRef = doc(db, PAYMENT_ORDERS_COLLECTION, merchantOrderId);
  await setDoc(ordersRef, orderDoc);

  try {
    const apiResult = await phonePeRestPay({
      merchantOrderId,
      amount: params.amountPaise,
      redirectUrl,
      callbackUrl,
      message: params.notes,
    });
    if (apiResult.redirectUrl) {
      return {
        success: true,
        redirectUrl: apiResult.redirectUrl,
        intentUrl: apiResult.redirectUrl,
        merchantOrderId,
        orderId: apiResult.orderId,
        expireAt: apiResult.expireAt,
      };
    }
    return { success: false, error: apiResult.error ?? 'Payment init failed' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'createPaymentOrder failed';
    console.error('PhonePe createPaymentOrder error:', e);
    return { success: false, error: msg };
  }
}

type RestPayResult = { redirectUrl?: string; orderId?: string; expireAt?: number; error?: string };

async function phonePeRestPay(params: {
  merchantOrderId: string;
  amount: number;
  redirectUrl: string;
  callbackUrl?: string;
  message?: string;
}): Promise<RestPayResult> {
  const env = getEnv('PHONEPE_ENV');
  const baseUrl =
    getEnv('PHONEPE_BASE_URL') ||
    (env === 'PRODUCTION' ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/hermes');
  const clientId = getEnv('PHONEPE_CLIENT_ID');
  const clientSecret = getEnv('PHONEPE_CLIENT_SECRET');
  if (!clientId || !clientSecret) return { error: 'PhonePe not configured (PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET)' };

  const payload = {
    merchantId: clientId,
    merchantTransactionId: params.merchantOrderId,
    amount: params.amount,
    redirectUrl: params.redirectUrl,
    redirectMode: 'REDIRECT',
    callbackUrl: params.callbackUrl || params.redirectUrl,
    merchantUserId: 'member',
    message: params.message || 'In-store payment',
  };

  const url = `${baseUrl}/v3/transaction/init`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    return { error: `PhonePe API ${res.status}: ${text}` };
  }

  const data = (await res.json()) as {
    success?: boolean;
    data?: { instrumentResponse?: { redirectInfo?: { url?: string }; intentUrl?: string }; orderId?: string; expireAt?: number };
    message?: string;
  };

  const redirectUrl =
    data?.data?.instrumentResponse?.redirectInfo?.url ??
    data?.data?.instrumentResponse?.intentUrl;
  return {
    redirectUrl,
    orderId: data?.data?.orderId as string | undefined,
    expireAt: data?.data?.expireAt,
    error: data?.success === false ? data?.message : undefined,
  };
}

/**
 * Verify webhook signature and parse payload. PhonePe sends Authorization header (SHA256 of body with credentials).
 */
function verifyWebhookSignature(
  rawBody: string,
  authorizationHeader: string | null,
  username: string,
  password: string
): boolean {
  if (!authorizationHeader) return false;
  const expected = createHash('sha256').update(rawBody).update(username).update(password).digest('hex');
  return authorizationHeader.toLowerCase() === expected.toLowerCase();
}

/**
 * Handle PhonePe S2S webhook: verify signature, confirm amount, idempotent recordPurchase and points.
 */
export async function handleWebhook(
  rawBody: string,
  authorizationHeader: string | null
): Promise<WebhookResult> {
  const config = getConfig();
  const username = config.webhookUsername ?? '';
  const password = config.webhookPassword ?? '';

  if (username && password && !verifyWebhookSignature(rawBody, authorizationHeader, username, password)) {
    return { ok: false, statusCode: 401, error: 'Invalid webhook signature' };
  }

  let payload: {
    type?: string;
    payload?: {
      originalMerchantOrderId?: string;
      merchantOrderId?: string;
      orderId?: string;
      state?: string;
      amount?: number;
      errorCode?: string;
    };
  };

  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return { ok: false, statusCode: 400, error: 'Invalid JSON' };
  }

  const type = payload?.type ?? (payload?.payload as { state?: string } | undefined)?.state;
  const data = (payload?.payload ?? payload) as
    | { originalMerchantOrderId?: string; merchantOrderId?: string; state?: string; amount?: number; orderId?: string; errorCode?: string }
    | undefined;
  const merchantOrderId = data?.originalMerchantOrderId ?? data?.merchantOrderId ?? (payload as unknown as { merchantOrderId?: string }).merchantOrderId;

  if (!merchantOrderId) {
    return { ok: false, statusCode: 400, error: 'Missing merchant order id' };
  }

  const isSuccess =
    type === 'CHECKOUT_ORDER_COMPLETED' ||
    type === 'PG_ORDER_COMPLETED' ||
    data?.state === 'COMPLETED';

  if (!isSuccess) {
    if (isFirebaseConfigured) {
      const ref = doc(db, PAYMENT_ORDERS_COLLECTION, merchantOrderId);
      const snap = await getDoc(ref);
      if (snap.exists())
        await setDoc(ref, {
          status: 'FAILED',
          updatedAt: Timestamp.now(),
          errorCode: data?.errorCode ?? type,
        });
    }
    return { ok: true, statusCode: 200 };
  }

  const amountFromGateway = Number(data?.amount ?? 0);
  if (!isFirebaseConfigured) {
    return { ok: false, statusCode: 500, error: 'Firebase not configured' };
  }

  const orderRef = doc(db, PAYMENT_ORDERS_COLLECTION, merchantOrderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) {
    return { ok: false, statusCode: 400, error: 'Order not found' };
  }

  const order = orderSnap.data() as PaymentOrderDoc;
  if (order.status === 'SUCCESS') {
    return { ok: true, statusCode: 200 };
  }

  if (amountFromGateway > 0 && amountFromGateway !== order.amountPaise) {
    return { ok: false, statusCode: 400, error: 'Amount mismatch' };
  }

  const amountPaise = amountFromGateway > 0 ? amountFromGateway : order.amountPaise;

  const recordResult = await recordPurchaseFromGateway({
    userId: order.userId,
    merchantId: order.merchantId,
    totalAmountPaise: amountPaise,
    offerId: order.offerId,
    quantity: order.quantity,
  });

  if (!recordResult.success) {
    console.error('recordPurchaseFromGateway failed:', recordResult.error);
    return { ok: false, statusCode: 500, error: recordResult.error ?? 'Failed to record purchase' };
  }

  await setDoc(orderRef, {
    status: 'SUCCESS',
    updatedAt: Timestamp.now(),
    gatewayOrderId: data?.orderId,
  });

  return { ok: true, statusCode: 200 };
}

/**
 * Get status of a payment order (for polling from client).
 */
export async function getPaymentOrderStatus(merchantOrderId: string): Promise<{
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  errorCode?: string;
  transactionId?: string;
}> {
  if (!isFirebaseConfigured) {
    return { status: 'PENDING' };
  }
  const ref = doc(db, PAYMENT_ORDERS_COLLECTION, merchantOrderId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { status: 'PENDING' };
  }
  const data = snap.data() as PaymentOrderDoc;
  return {
    status: data.status,
    errorCode: data.errorCode,
  };
}
