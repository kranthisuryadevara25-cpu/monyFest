# Commission and Loyalty Points – Outline

This document gives a high-level outline of **commission** (cash rewards to referrers) and **loyalty points** (earn, split, redeem) in MonyFest.

---

## 1. Commission (cash)

Commission is **cash in paise** paid to referrers for certain actions. It is configured and paid out separately from loyalty points.

### 1.1 When commission is created

| Trigger | Who gets commission | Amount source |
|--------|----------------------|----------------|
| **New member signup** (with referral code) | Up to 3 levels: L1 (parent), L2 (grandparent), L3 | `level1`, `level2`, `level3` (paise) from Commission Settings |
| **New merchant onboarded** (by agent) | Agent who recruited the merchant | `merchantBonus` (paise) from Commission Settings |

- **Member signup:** When a user signs up as **member** with a valid referral code, the system creates one **commission** transaction per level (1, 2, 3) for each referrer in the chain, with `payoutStatus: 'pending'`.
- **Merchant bonus:** Handled in merchant onboarding flow; amount from `merchantBonus`.

### 1.2 Commission settings (Admin)

- **Location:** Admin → **Commission Management** (`/admin/commission-management`).
- **Stored in:** Firestore `commissionSettings/default`.

| Setting | Meaning | Default (example) |
|--------|---------|--------------------|
| **Level 1** | Amount (paise) to L1 referrer per member signup | 5000 (₹50) |
| **Level 2** | Amount (paise) to L2 referrer per member signup | 3000 (₹30) |
| **Level 3** | Amount (paise) to L3 referrer per member signup | 2000 (₹20) |
| **Merchant bonus** | Amount (paise) for recruiting a new merchant | 10000 (₹100) |

All amounts are in **paise** (e.g. 5000 = ₹50).

### 1.3 Commission lifecycle

1. **Create:** Transaction with `type: 'commission'`, `amount` (paise), `commissionLevel: 1|2|3`, `payoutStatus: 'pending'`, `sourceId` = new member UID (or relevant source).
2. **List / approve:** Admin sees pending commissions (e.g. on **Payouts** or commission views) and can mark payouts as completed/rejected.
3. **Payout:** `updateTransactionPayoutStatus(transactionId, 'completed' | 'rejected')` updates the commission transaction; actual money transfer is outside the app (bank/UPI etc.).

### 1.4 Where it appears

- **Member/Agent:** Referrals page, commission history (transactions with `type === 'commission'`).
- **Admin:** Commission Management (configure amounts), Payouts (process pending commissions).

---

## 2. Loyalty points

Loyalty points are **non-cash** rewards: users **earn** them (on signup and on purchase) and **redeem** them for rewards (e.g. offers). Balance is stored on the user as `pointsBalance`.

### 2.1 Earning points

| Event | Who gets points | How much |
|-------|------------------|----------|
| **New member signup** | The new member only | **50 points** (fixed welcome points; added to `pointsBalance`). |
| **Purchase (with offer)** | Buyer + Parent (L1) + Grandparent (L2) | **Split by %** (see below). Total points come from **slab** or **per-offer** logic. |
| **Purchase (gateway, no offer)** | No points | Only purchase transaction is recorded; 0 points. |

- **Referral chain:** For purchases, the buyer’s `referredBy` → parent; parent’s `referredBy` → grandparent. Only these two levels get a share of points (no L3 for points).
- **Self-referral:** If buyer has no referrer, 100% of points go to the buyer. If there is a parent but no grandparent, the grandparent share is given to the buyer.

### 2.2 How total points per purchase are decided

For a purchase that has an **offer** and is recorded via `recordPurchase` (or `recordPurchaseFromGateway` with offerId + quantity):

1. **Slab-based (if configured):**  
   - Merchant’s **industry** or **category** is used to pick a **loyalty slab config** (Admin → **Loyalty Slabs**, per category/industry).  
   - If a slab config exists for that category, **total points = points for the slab** that contains the order value (e.g. ₹100–199 → 10 pts, ₹200–299 → 25 pts, above ₹300 → 30 pts).
2. **Per-offer (fallback):**  
   - If no slab applies, **total points = offer.loyalty_points × quantity** (default 10 per unit if not set).

So: **either slab points (by order value + category) or per-offer points**, not both.

### 2.3 Split of points (Parent : Buyer : Grandparent)

- **Configured in:** Commission Management → **Loyalty points share %** (Parent / Buyer / Grandparent). Example: **70 : 20 : 10**.
- **Stored as:** `loyaltyPointsSharePctParent`, `loyaltyPointsSharePctBuyer`, `loyaltyPointsSharePctGrandparent`. Percentages are normalised to sum to 100 if needed.
- **Application:**  
  - Parent (L1) gets `totalPoints × (Parent% / 100)` (rounded down).  
  - Buyer gets `totalPoints × (Buyer% / 100)`.  
  - Grandparent (L2) gets `totalPoints × (Grandparent% / 100)`.  
  - If no parent, buyer gets 100%. If parent but no grandparent, grandparent’s share goes to buyer.

This is **referral-based reward only**, not MLM: no unlimited levels, only buyer + L1 + L2.

### 2.4 Where points are stored and recorded

- **Balance:** `users/{uid}.pointsBalance` (number).
- **Audit:** For each allocation, transactions with `type: 'points-earned'` are created (one per user who received points), with a reference to the purchase transaction.  
  For redemption, `type: 'points-redeemed'` with `pointsRedeemed` and optional `sourceId` (e.g. offer/reward id).

### 2.5 Redeeming points

- **API:** `redeemPoints({ userId, points, description, sourceId? })`.  
  - Deducts `points` from `users/{userId}.pointsBalance`.  
  - Creates a transaction `type: 'points-redeemed'`.  
  - Fails if balance is insufficient.
- **Usage:** Member **Rewards** page: user selects an offer that has a `points` cost; app calls `redeemPoints` then (per your flow) can issue a coupon or other reward. Offers used for redemption can have `points` (cost in points) and optional `loyalty_points` (earned per purchase).

### 2.6 Loyalty slab configuration (Admin)

- **Location:** Admin → **Loyalty Slabs** (`/admin/loyalty-slabs`).
- **Stored in:** Firestore `loyaltySlabConfigs/{categoryId}`. Each document has a `slabs` array: `minAmountPaise`, `maxAmountPaise` (null = “above”), `points`.
- **Per category/industry:** Different slab sets can be defined (e.g. “medical”, “spa”, “food”, “default”). The merchant’s `industry` or `category` is used to pick the config; if none, “default” can be used.
- **Effect:** When a purchase is recorded and a slab config is found for the merchant’s category, the **total points** for that purchase come from the matching slab only; per-offer `loyalty_points` are not used for that purchase.

---

## 3. Summary table

| Concept | Commission (cash) | Loyalty points |
|--------|--------------------|----------------|
| **What** | Money (paise) to referrers | Points balance: earn and redeem |
| **When earned** | Member signup (L1/L2/L3), merchant recruitment | Signup (50 for member), purchase (split) |
| **Who gets it** | Referrers (and agent for merchant bonus) | Buyer + Parent + Grandparent (by %) |
| **Config** | Commission Management: level1/2/3, merchantBonus | Commission Management: points %; Loyalty Slabs: slab rules |
| **Storage** | `transactions` (type commission) | `users.pointsBalance`; `transactions` (points-earned / points-redeemed) |
| **Payout / use** | Admin marks commission paid; real payout external | Redeem on Rewards page; deduct balance |

---

## 4. Configuration quick reference

- **Commission amounts & loyalty %:** Admin → **Commission Management**.  
  - Commission: Level 1/2/3 (₹), Merchant bonus (₹).  
  - Loyalty: Parent % / Buyer % / Grandparent % (e.g. 70 / 20 / 10).
- **Slab-based points:** Admin → **Loyalty Slabs**.  
  - Choose category/industry, add rows: Min (₹), Max (₹) or “above”, Points. Save per category.
- **Offers:** Merchant/Admin create offers; `loyalty_points` = points per unit when slab is not used; `points` = cost to redeem (Rewards page).

This outline should be enough to reason about commission and loyalty flows end-to-end in the system.
