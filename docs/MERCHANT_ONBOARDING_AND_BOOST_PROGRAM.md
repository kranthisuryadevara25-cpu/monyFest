# Merchant onboarding and Boost program

This document describes **how a merchant is onboarded** and **how the Boost program is designed** in the MonyFest application.

---

## 1. How a merchant is onboarded

### 1.1 Entry point

- A user signs up on the **login page** (`/login`) with **role = Merchant** (and optionally an **agent code** if an agent referred them).
- On successful sign-up, the user is redirected to **`/merchant/onboarding`**.

### 1.2 Onboarding wizard (steps)

The onboarding page is a **multi-step wizard** with four steps:

| Step | Label              | What is collected |
|------|--------------------|-------------------|
| **1** | Business Details   | Business name, nature of business (Sole Proprietorship, Partnership, etc.), **category** (food, retail, books, services, other), address, city, state, pincode, GSTIN, business email/phone, WhatsApp, offering type (offline / online / both), **Agent code** (optional – if an agent referred the merchant). |
| **2** | Owner Information  | Owner full name, email, phone. |
| **3** | Bank Details       | Account holder name, account number, IFSC (for payouts). |
| **4** | Done               | Confirmation that the application has been submitted for review. |

Only **Business name**, **category**, **GSTIN** (optional), and **agentCode** (optional) are sent to the backend when the user clicks **“Finish & Submit for Review”**. The rest of the form (address, owner, bank) is collected in the UI but **not yet persisted** to the database in the current implementation.

### 1.3 What happens on submit

When the user completes **Step 3** and clicks **“Finish & Submit for Review”**:

1. The app calls **`createMerchantProfileFromOnboarding`** in `merchant-service` with:
   - `merchantId` = signed-in user’s UID  
   - `name` = business name  
   - `category` = selected category  
   - `gstin` = optional  
   - `agentCode` = optional  

2. The service:
   - Resolves **agent by `agentCode`** (if provided) and sets **`linkedAgentId`** on the merchant.
   - Creates a **merchant document** in the `merchants` collection with:  
     `merchantId`, `name`, `logo` (default placeholder), `commissionRate: 5`, `linkedAgentId`, `createdAt`, `category`, `gstin`.  
     The Merchant type also supports **`boostBalance`**, **`totalBoostEarned`**, and **`industry`** (for slab-based loyalty).
   - If **`linkedAgentId`** is set and **Merchant Bonus** (from commission settings) is &gt; 0, it creates a **commission transaction** for that agent: “Merchant recruitment bonus: &lt;name&gt;”, `payoutStatus: 'pending'`.

3. The **user** document (created at sign-up) has **`status: 'pending'`** for non-member roles (see `user-service`: members are `approved`, agents/merchants are `pending`). So the merchant **user** is pending until an admin approves.

4. The UI shows **Step 4 (Done)**: “Your account is now under review. You will be notified once it’s approved by the admin.”

### 1.4 Approval

- **Admin** can approve (or reject) the **user** from **Admin → Merchants** (`/admin/merchants`). The merchant list shows user status; admins can use the dropdown to **Approve** (or Reject / Re-Approve).
- Once the **user** status is set to **`approved`**, the merchant can use the full merchant panel (dashboard, offers, orders, Boost earnings, etc.). The **merchant document** is already created at onboarding; approval is on the **user** account.

### 1.5 Summary flow

```
Sign up (role = Merchant) → Redirect to /merchant/onboarding
→ Step 1: Business details (name, category, address, agent code, …)
→ Step 2: Owner info
→ Step 3: Bank details
→ “Finish & Submit for Review” → createMerchantProfileFromOnboarding()
   → Merchant doc created in Firestore (merchants/{uid})
   → Optional: commission for recruiting agent (merchant bonus)
→ Step 4: “Under review”
→ Admin approves user (Admin → Merchants) → Merchant can access panel
```

---

## 2. How the Boost program is designed

### 2.1 Purpose

The **Merchant Boost** program is a **cashback-style incentive** for merchants: the platform gives them a percentage of (eligible) transaction value back as “Boost” balance, which they can withdraw once they meet a minimum threshold. It is intended to add **extra visibility and earnings** for merchants.

### 2.2 Data model

- **Merchant** (in `lib/types.ts` and Firestore `merchants`):
  - **`boostBalance`**: current Boost balance (e.g. in ₹ or platform currency).
  - **`totalBoostEarned`**: optional; total Boost ever earned (for display/analytics).

- **Admin configuration** (Merchant Boost Settings, **Admin → Merchant Boost** `/admin/merchant-boost`):
  - **Program status**: global on/off (`boostEnabled`).
  - **Boost cashback %**: percentage of the bill amount given back to the merchant.
  - **Apply on**: **Gross** bill amount or **Final** amount (after coupon).
  - **Minimum redemption threshold (₹)**: merchant must reach this Boost balance to **request withdrawal** (e.g. ₹555).
  - **Auto-approve withdrawals below (₹)**: optional; set to 0 to disable auto-approval.

These settings are **persisted** in Firestore in the **`boostSettings/default`** document. The admin page loads them on mount and saves via **`updateBoostSettings`** in `boost-service.ts`. The same settings are used when crediting Boost and when validating withdrawal requests.

### 2.3 Merchant-facing Boost experience

- **Merchant dashboard** (`/merchant/dashboard`):  
  Shows **MonyFest Boost Balance** (from `merchant.boostBalance`), progress toward the minimum withdrawal threshold, and “₹X more to unlock withdrawal”.

- **Boost Earnings** (`/merchant/boost-earnings`):  
  - **Boost balance** and **withdrawal threshold** are loaded from **Boost settings** (admin) via `getBoostSettings()`.
  - **“Withdraw Boost Earnings”** button: enabled when balance ≥ threshold; on click it calls **`createBoostWithdrawalRequest(merchantId)`**, which debits the merchant’s Boost balance and creates a withdrawal record (pending or auto-approved per admin settings).
  - **Boost transaction history** is loaded from the **`boostTransactions`** collection (credits and withdrawals for this merchant).

### 2.4 Intended Boost flow (design)

1. **Admin** enables the program and sets **%**, **apply on** (gross/final), **min withdrawal threshold**, and optional **auto-approve** limit.
2. When a **member** makes a **purchase** that qualifies for Boost (e.g. offline payment or gateway payment at a merchant):
   - The app would compute Boost amount = (eligible amount) × (Boost %), where eligible amount is gross or final per setting.
   - The app would **credit** the merchant’s **`boostBalance`** (and optionally update **`totalBoostEarned`**), and record a Boost transaction for history.
3. **Merchant** sees balance and progress on **Dashboard** and **Boost Earnings**.
4. When **balance ≥ min threshold**, merchant can **request withdrawal**. The request would be sent to admin (or an automated payout flow). Withdrawals below the auto-approve threshold could be auto-approved.
5. After payout, the merchant’s **`boostBalance`** would be debited and a payout record created.

**Crediting** and **withdrawal** are implemented:

- **Crediting**: After every purchase recorded via **`recordPurchase`** or **`recordPurchaseFromGateway`** (in `points-service.ts`), **`creditBoostForPurchase(merchantId, amountPaise, …)`** is called. It reads Boost settings; if enabled, it computes Boost amount from the configured % and “apply on” (gross/final), updates the merchant’s **`boostBalance`** and **`totalBoostEarned`**, and writes a **`boostTransactions`** credit record.
- **Withdrawal**: Merchant clicks “Withdraw Boost Earnings” → **`createBoostWithdrawalRequest(merchantId)`** checks balance ≥ min threshold, creates a **`boostWithdrawals`** document (status **pending** or **completed** if within auto-approve threshold), debits **`boostBalance`** to zero, and adds a withdrawal entry in **`boostTransactions`**. Admin can list and **approve** or **reject** pending requests from **Admin → Boost Withdrawals** (`/admin/boost-withdrawals`). Rejection refunds the amount back to the merchant’s Boost balance.

### 2.5 Summary

| Aspect | Current state |
|--------|----------------|
| **Admin Boost settings** | Persisted in **`boostSettings/default`**; UI at `/admin/merchant-boost` loads and saves via **`getBoostSettings`** / **`updateBoostSettings`**. |
| **Merchant.boostBalance** | Updated when Boost is credited (on purchases) and debited on withdrawal request. |
| **Crediting Boost** | **Implemented**: **`creditBoostForPurchase`** in `boost-service.ts`; called from **`recordPurchase`** and **`recordPurchaseFromGateway`** in `points-service.ts`. |
| **Withdrawal** | **Implemented**: **`createBoostWithdrawalRequest`** debits balance and creates **`boostWithdrawals`** record; admin **Boost Withdrawals** page approves/rejects (reject refunds balance). |
| **Boost transaction history** | **`boostTransactions`** collection; Boost Earnings page shows credits and withdrawals via **`getBoostTransactionsForMerchant`**. |

**Merchant onboarding** is end-to-end. The **Boost program** is fully implemented: config persistence, crediting on transactions, withdrawal requests, and admin approval/rejection with refund on reject.
