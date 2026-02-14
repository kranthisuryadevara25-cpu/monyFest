# How Purchase Transactions Are Recorded & Transaction Authenticity

## 1. How purchase transactions are recorded

### Where it happens

- **Service:** `src/services/points-service.ts` → **`recordPurchase(params)`**
- **Storage:** Firestore collection **`transactions`**, via `src/services/transaction-service.ts` → **`createTransaction()`**

### What gets stored

When `recordPurchase()` is called with:

- `userId` – buyer (member)
- `offerId` – product/offer bought
- `merchantId` – (optional) merchant
- `quantity` – number of units
- `totalAmountPaise` – transaction value in paise (₹1 = 100 paise)

the app creates a **transaction document** with:

| Field        | Source                    |
|-------------|----------------------------|
| `userId`    | Caller                     |
| `amount`    | `totalAmountPaise` (caller)|
| `type`      | `'purchase'`               |
| `merchantId`| Caller                     |
| `offerId`   | Caller                     |
| `quantity`  | Caller                     |
| `description` | e.g. "Purchase: &lt;offer title&gt; x&lt;qty&gt;" |
| `createdAt` | Server timestamp           |

After that, loyalty points are allocated (buyer + referrer) using the same purchase.

### Who can create a purchase today

- **No UI creates a purchase yet.**  
  - **Offline payment** (`/member/offline-payment`): user enters bill amount and “confirms”, but the code only simulates success (e.g. `setTimeout`). It does **not** call `recordPurchase()` or write to Firestore.  
  - **Member shop**: no checkout; “Add to cart” is only a toast.  
- So in the **current codebase**, a purchase is recorded **only** when some code (e.g. a server action, API route, or backend job) explicitly calls:

  ```ts
  await recordPurchase({
    userId,
    offerId,
    merchantId,
    quantity,
    totalAmountPaise,
  });
  ```

- The **value** (`totalAmountPaise`) is whatever the **caller** passes. The system does not check it against prices, payment proof, or merchant confirmation.

---

## 2. Is the transaction value “authentic” or justified?

**Short answer: not by the app today.** The amount is taken on trust from whoever calls `recordPurchase()`.

- There is **no** check that `totalAmountPaise` matches:
  - offer/catalog price × quantity, or  
  - any “agreed” amount from a prior step.
- There is **no** integration with:
  - a payment gateway (e.g. Razorpay) whose callback would send a verified amount.
- There is **no** merchant attestation:
  - e.g. merchant app or backend saying “I confirm this customer paid this amount.”

So today:

- **Recording:** Purchase transactions are recorded only when `recordPurchase()` is invoked with the right params.
- **Authenticity of the value:** The app does **not** justify or verify the amount; it trusts the caller. If the caller is a client (e.g. member app), a malicious user could in principle pass a different amount unless you add one of the safeguards below.

---

## 3. Ways to justify / verify the transaction value

To make the stored amount “authentic” (hard to fake and aligned with reality), you need at least one of these:

### Option A – Merchant attests the amount (good for in-store / offline)

- Flow: customer pays at the store → merchant (or their device) confirms the sale.
- Implementation idea:
  - Merchant app or a backend endpoint (e.g. “Confirm sale”) accepts: `userId`, `offerId`, `quantity`, `totalAmountPaise`, and optionally a one-time token/session from the customer.
  - That endpoint runs **only** when the request is authenticated as that **merchant** (or their system). It then calls `recordPurchase(...)` with those values.
- Justification: the amount is set by the merchant (trusted party), not by the customer.

### Option B – Payment gateway callback (good for online paid flow)

- Flow: customer pays online → gateway (e.g. Razorpay) sends a webhook to your backend with payment status and amount.
- Implementation idea:
  - Webhook handler verifies the signature, reads **amount** and **order id** from the gateway payload.
  - Your backend maps order id → `userId`, `offerId`, `quantity`, and uses the **gateway’s amount** (in paise) when calling `recordPurchase(...)`.
- Justification: the amount comes from the payment provider, not from the client.

### Option C – Server recomputes from catalog (sanity check)

- You don’t prove “money actually moved”, but you can ensure the stored amount is consistent with your catalog.
- In `recordPurchase()` (or in a wrapper that only the server uses):
  - Load the offer (e.g. via `getOfferById(offerId)`).
  - If the offer has a defined price, compute expected amount (e.g. `price × quantity`) and optionally:
    - **Reject** if `totalAmountPaise` differs from expected, or  
    - **Overwrite** `totalAmountPaise` with the computed value before calling `createTransaction()`.
- Justification: the recorded value matches your product/offer definition; it does not by itself prove that the customer paid.

### Option D – Hybrid (e.g. offline + merchant confirm)

- Customer goes through offline-payment UI (merchant code, bill amount, coupon).
- When they tap “Confirm & Pay”, instead of only simulating:
  - Create a **pending** transaction or a “payment request” (e.g. in Firestore) with amount, merchant, user, and (if you have them) offer/quantity.
  - Merchant app (or backend) sees this request and, after receiving cash, **confirms** it with the same amount.
  - Only then does your backend call `recordPurchase(...)` with that confirmed amount (Option A).

---

## 4. Summary table

| Question | Current state |
|----------|----------------|
| How are purchase transactions recorded? | Only when some code calls `recordPurchase()` → `createTransaction()` with type `'purchase'`. Stored in Firestore `transactions`. |
| Does any member UI record purchases? | No. Offline payment is simulated; shop has no checkout. |
| Who provides the transaction value? | The caller of `recordPurchase()` (e.g. client or server). |
| Does the app verify the amount? | No. No check against offer price, payment gateway, or merchant. |
| How can we justify authenticity? | Add merchant attestation (A), payment gateway webhook (B), server-side recomputation from catalog (C), or a hybrid (D). |

If you tell me which flow you want first (e.g. “offline with merchant confirm” or “online with Razorpay”), I can outline concrete API shapes and where to call `recordPurchase()` so the value is justified.
