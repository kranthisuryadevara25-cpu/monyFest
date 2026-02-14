# PhonePe Payment Gateway Integration

In-store digital payments (UPI-focused) with payment links and webhook-triggered purchase recording and referral points.

## Overview

- **Create payment:** Member enters bill amount on Offline Payment → "Pay via UPI / PhonePe" → app calls `POST /api/payment/phonepe/create` → user is redirected to PhonePe checkout (or UPI intent).
- **Webhook:** PhonePe sends S2S callback to `POST /api/payment/phonepe/webhook`. Handler verifies signature, confirms amount, calls `recordPurchaseFromGateway()` (which creates purchase transaction and allocates loyalty points when offer/quantity are present), and marks the order SUCCESS.
- **Status polling:** After redirect back to the app, the page polls `GET /api/payment/phonepe/status?merchantOrderId=...` until SUCCESS or FAILED.

## Setup

### 1. Environment variables

In `.env.local` (see `.env.example`):

```bash
# Required for create payment + webhook
PHONEPE_CLIENT_ID=        # From PhonePe Business Dashboard
PHONEPE_CLIENT_SECRET=
PHONEPE_ENV=SANDBOX       # or PRODUCTION
PHONEPE_WEBHOOK_USERNAME= # Configured in Dashboard → Developer Settings → Webhooks
PHONEPE_WEBHOOK_PASSWORD=

# Optional
PHONEPE_CLIENT_VERSION=1.0
PHONEPE_BASE_URL=         # Override API base (default: preprod or prod hermes)
NEXT_PUBLIC_APP_URL=      # For redirect URLs (default: request origin)
```

### 2. Webhook URL

In PhonePe Business Dashboard → Developer Settings → Webhooks:

- **URL:** `https://your-domain.com/api/payment/phonepe/webhook`
- **Username / Password:** Set and use the same in `PHONEPE_WEBHOOK_USERNAME` and `PHONEPE_WEBHOOK_PASSWORD`.
- **Events:** Enable `checkout.order.completed`, `checkout.order.failed` (and refund events if needed).

### 3. Firestore

- Collection **`payment_orders`** is used for pending orders (created on create, updated on webhook). Rules allow read/write when `request.auth != null`. For webhook (no user auth), use **Firebase Admin SDK** in the webhook route so writes succeed, or adjust rules as needed for your server identity.

## API

| Endpoint | Method | Purpose |
|----------|--------|--------|
| `/api/payment/phonepe/create` | POST | Create order; body: `amountPaise`, `userId`, `merchantId`, `redirectUrl?`, `callbackUrl?`, `offerId?`, `quantity?`, `notes?`. Returns `redirectUrl`, `intentUrl`, `merchantOrderId`. |
| `/api/payment/phonepe/webhook` | POST | PhonePe S2S callback. Verifies signature, records purchase, updates order. |
| `/api/payment/phonepe/status` | GET | Query param `merchantOrderId`. Returns `{ status: 'PENDING' \| 'SUCCESS' \| 'FAILED', errorCode? }`. |

## Service

- **`src/services/phonepe-service.ts`**
  - `initClient()` – validate env.
  - `createPaymentOrder(params)` – store pending order in Firestore, call PhonePe init API, return redirect/intent URL.
  - `handleWebhook(rawBody, authorizationHeader)` – verify webhook, confirm amount, call `recordPurchaseFromGateway()`, update order (idempotent).
  - `getPaymentOrderStatus(merchantOrderId)` – for polling.

- **`recordPurchaseFromGateway()`** in `points-service.ts` – records purchase using gateway amount; if `offerId` and `quantity` are provided and the offer exists, allocates loyalty points; otherwise only creates the purchase transaction.

## UI

- **Offline Payment** (`/member/offline-payment`): On the confirmation step, "Pay via UPI / PhonePe" calls the create API, stores `merchantOrderId` in sessionStorage, and redirects to PhonePe. After return, the page polls status; on SUCCESS it shows the completed state.

## Security

- Webhook signature: validated using `PHONEPE_WEBHOOK_USERNAME` and `PHONEPE_WEBHOOK_PASSWORD` (SHA256 of body + credentials). Configure the same in the PhonePe Dashboard.
- Amount: webhook uses the amount from the callback payload; it is compared with the stored order and only then is `recordPurchaseFromGateway` called.
- Duplicates: order document is set to SUCCESS only once; repeated webhooks return 200 without re-recording.

## Optional: Official Node SDK

PhonePe provides an official Node SDK (distributed via their repo). If you install it and use it instead of the built-in REST client:

- Install from the URL provided in [PhonePe Node SDK docs](https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/installation).
- You can replace the `phonePeRestPay()` call in `phonepe-service.ts` with the SDK’s `StandardCheckoutClient.pay()` and use the SDK’s `validateCallback()` in the webhook handler if you prefer.

## Errors and timeouts

- **Failed payments:** Webhook receives `CHECKOUT_ORDER_FAILED`; order is marked FAILED; no purchase is recorded.
- **Timeouts:** Order expires after 1 hour; status remains PENDING until webhook or user retries.
- **Duplicate webhooks:** Idempotent: same `merchantOrderId` already SUCCESS → return 200, do not call `recordPurchaseFromGateway` again.
