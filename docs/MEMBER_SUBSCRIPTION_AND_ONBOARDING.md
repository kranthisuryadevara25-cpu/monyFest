# Member subscription and onboarding – what happens when someone becomes a member

This document describes **what happens when a new person subscribes (signs up) and becomes a member** in MonyFest: account creation, coupons, points, referral chain, and commissions.

---

## 1. How someone becomes a member

A person becomes a **member** by signing up and choosing the **Member** role:

- **Login page** (`/login`): Sign-up form with role selector: *Member* | *Agent* | *Merchant (Apply to become a Merchant)*.
- **Email sign-up:** Name, email, password, role = *Member*, and optional **referral code** (e.g. from link `?ref=JOHNabc1`).
- **Google sign-in (first time):** If the user doesn’t exist, a user document is created with role **member** by default (no referral code in this flow unless you add it later).

After a successful sign-up as member, the app redirects to **`/member/homepage`**.

---

## 2. What happens in the system when a member is created

When `createUser(..., referralCode?)` runs for a **member** (from `signUpWithEmail` or from Google first-time sign-in), the following happens **in order**.

### 2.1 User document (`users/{uid}`)

A new user document is created in Firestore with:

| Field | Value for new member |
|--------|------------------------|
| `uid` | Firebase Auth UID |
| `name`, `email`, `avatarUrl` | From sign-up or Google profile |
| `role` | `'member'` |
| `status` | **`'approved'`** (members are approved immediately; agents/merchants can be `'pending'`) |
| `walletBalance` | **0** (paise) |
| **`pointsBalance`** | **50** (welcome loyalty points; only for role `'member'`) |
| `referralCode` | Auto-generated, e.g. `JOHN` + first 4 chars of UID (e.g. `JOHNabc1`) – used to refer others |
| `referredBy` | UID of referrer, if a valid **referral code** was provided at sign-up |
| `referralChain` | Array of up to 3 UIDs: [parent, grandparent, …] for commission/loyalty |
| `createdAt`, `updatedAt` | Set once |

So upon subscription, the member **immediately gets 50 loyalty points** and a **personal referral code** to share.

---

### 2.2 Welcome coupons (automatic allotment)

**Only for members.**

- The system reads the **admin-configured welcome coupons** from the `welcomeCoupons` collection (managed at **Admin → Welcome Coupons**).
- For **each** welcome coupon defined there, it creates a **user coupon** for this new member in the `userCoupons` collection.

So:

- **Who defines the coupons?** Admin in **Welcome Coupons** (title, category, discount type, discount value). No per-member limit there; every active welcome coupon is copied.
- **How many does the member get?** One **copy of each** welcome coupon. If admin created 3 welcome coupons, the member gets 3 user coupons.
- **Expiry:** Each of these user coupons gets an **expiry date = signup date + 30 days**.
- **Status:** All are created with status **`'active'`**.

The member sees these as **“Your Welcome Coupons”** on the member homepage and under **My Coupons** (`/member/my-coupons`). They can use them at checkout per your app flow (e.g. with merchants that accept those coupons).

**Summary:** Coupons are allotted by **copying the current set of welcome coupons** from `welcomeCoupons` into `userCoupons` for the new member, with a fixed 30-day expiry.

---

### 2.3 Referral chain and signup commissions (only if referred)

If the new member signed up **with a valid referral code**:

- **Referral link:** e.g. `https://yoursite.com/login?ref=JOHNabc1`. The code is stored and sent to `createUser(..., referralCode)`.
- **Resolving referrer:** The system looks up the user whose `referralCode` matches (e.g. `JOHNabc1`). That user is the **parent (L1)**. If that user has a `referredBy`, that’s the **grandparent (L2)**, and so on, up to 3 levels.
- **Stored on the new member:**  
  - `referredBy` = parent’s UID  
  - `referralChain` = [parent UID, grandparent UID, …] (up to 3).

**Commission (cash) for referrers (only for member signups):**

- Commission settings (Admin → Commission Management) define **level1**, **level2**, **level3** amounts (in **paise**; e.g. 5000 = ₹50).
- For each level present in `referralChain` (up to 3), the system creates a **commission** transaction for the referrer at that level:
  - **Level 1 (parent):** e.g. ₹50 (if level1 = 5000 paise)
  - **Level 2 (grandparent):** e.g. ₹30 (if level2 = 3000 paise)
  - **Level 3:** e.g. ₹20 (if level3 = 2000 paise)
- Description is like: *“Level 1 commission from &lt;New member name&gt; signup”*.
- **Payout status** is **pending** until you process payouts.

So upon subscription, if they used a referral code, **parent and optionally grandparent (and L3) get one-time signup commissions**; the new member does not “pay” this – it’s a reward to the referrers.

---

## 3. What the new member sees and can do

- **Homepage (`/member/homepage`):**  
  - Welcome, name  
  - **Wallet balance** (0 initially)  
  - **Loyalty points** (50)  
  - **Your Welcome Coupons** carousel (the user coupons created from welcome coupons)  
  - Links to Discover, My Coupons, Rewards, Referrals, etc.

- **My Coupons (`/member/my-coupons`):**  
  All their coupons (the welcome ones plus any they get later), with expiry and status.

- **Rewards (`/member/rewards`):**  
  Redeem **loyalty points** for offers (if any are configured).

- **Referrals (`/member/referrals`):**  
  Their **referral code** and link to share so others can sign up with `?ref=...` and the member can earn commissions when those referred users sign up as members.

- **Loyalty / points later:**  
  When they make **purchases**, points are awarded (by slab or per-offer) and split in the configured **Parent : Buyer : Grandparent** ratio (e.g. 70 : 20 : 10). That is separate from the one-time 50 welcome points and the one-time signup commissions.

---

## 4. Summary table (upon subscription as member)

| What | Detail |
|------|--------|
| **Account** | User doc in `users/{uid}` with role `member`, status `approved`. |
| **Loyalty points** | **50** points added to `pointsBalance` (welcome points). |
| **Wallet** | **0** (paise). |
| **Referral code** | Auto-generated; member can share to refer others. |
| **Referral link** | Optional: `?ref=CODE` at sign-up sets `referredBy` and `referralChain`. |
| **Welcome coupons** | **One copy of each** admin-defined welcome coupon → created as `userCoupons` with **30-day expiry**, status `active`. |
| **Referrer commissions** | If referred: Level 1/2/3 commission transactions created for parent (and grandparent, L3) in **paise**, payout **pending**. |
| **Redirect** | To **`/member/homepage`**. |

---

## 5. Admin configuration that affects new members

- **Welcome Coupons** (`/admin/welcome-coupons`): Define the list of coupons every new member gets (title, category, discount type, value). No limit on count; each is copied once per new member with 30-day expiry.
- **Commission Management** (`/admin/commission-management`): Set **level1**, **level2**, **level3** signup commission amounts (in paise) and the **loyalty points share %** (Parent / Buyer / Grandparent) used when the member later makes purchases.

This gives you a single place to control “what every new member gets” (welcome coupons + 50 points) and how referrers are rewarded (signup commissions and later loyalty split).
