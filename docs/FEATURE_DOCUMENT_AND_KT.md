# LoyaltyLeap — Total Feature Document & KT (Knowledge Transfer)

## 1. Overview

**LoyaltyLeap** is a production-ready loyalty platform with role-based panels: **Admin**, **Agent**, **Merchant**, and **Member**. The app is built with **Next.js 15**, **Firebase** (Auth + Firestore), and **Tailwind/shadcn UI**.

- **Entry:** Root `/` redirects to `/admin/dashboard`. After login, users are sent to the dashboard for their role.
- **Roles:** `superAdmin` → Admin panel | `agent` → Agent panel | `merchant` → Merchant panel | `member` → Member panel.
- **Auth:** Firebase Auth (Google + Email/Password). Role and profile stored in Firestore via custom claims / user documents.

---

## 2. Panel Count & Summary

| # | Panel    | Route prefix | Layout              | Purpose |
|---|----------|--------------|---------------------|--------|
| 1 | **Admin**   | `/admin/*`   | Sidebar + ScrollArea | Super-admin: manage users, finances, offers, analytics, settings. |
| 2 | **Agent**   | `/agent/*`   | AgentSidebar + ScrollArea | Agents: onboarding, referrals, earnings, territory, performance. |
| 3 | **Merchant**| `/merchant/*`| MerchantSidebar + ScrollArea | Merchants: shops, orders, coupons, payouts, analytics, AI/voice. |
| 4 | **Member**  | `/member/*`  | MemberSidebar + MobileFooterNav + ScrollArea | End users: discover, shop, rewards, coupons, wallet, referrals. |

**Shared (no panel):**

- **Login:** `/login` — Sign in / Sign up (Google, email/password, role selection on sign-up).
- **Root:** `/` — Redirects to `/admin/dashboard`.

---

## 3. Admin Panel — Panels & Features

**Total admin screens: 20** (including Dashboard and Settings).

### 3.1 Management (6)

| Route | Label | About |
|-------|--------|--------|
| `/admin/dashboard` | Dashboard | KPIs (users, merchants, revenue), recent transactions table. |
| `/admin/customers` | Customers | List/manage members (customer list, filters). |
| `/admin/merchants` | Merchants | List/manage merchants (merchant list). |
| `/admin/agents` | Agents | List/manage agents (agent list). |
| `/admin/territories` | Territories | Manage territories and assigned agents (pincodes). |
| `/admin/ad-management` | Ad Management | Create/manage ads (image/video/scroll), targeting. |

### 3.2 Financial (4)

| Route | Label | About |
|-------|--------|--------|
| `/admin/payouts` | Payouts | Approve/reject payouts to agents/merchants. |
| `/admin/commission-management` | Commissions | Configure and view commission rules. |
| `/admin/merchant-boost` | Merchant Boost | Manage merchant boost balances and rules. |
| `/admin/orders` | Orders | List and manage platform orders. |

### 3.3 Offers & Loyalty (3)

| Route | Label | About |
|-------|--------|--------|
| `/admin/coupon-approvals` | Coupon Approvals | Approve/reject merchant-created coupons/offers. |
| `/admin/bundle-offers` | Bundle Offers | Create/manage bundle offers (e.g. “N transactions → reward”). |
| `/admin/welcome-coupons` | Welcome Coupons | Manage welcome coupons for new members. |

### 3.4 Analytics & Tools (4)

| Route | Label | About |
|-------|--------|--------|
| `/admin/analytics` | BI Dashboards | Business intelligence / analytics views. |
| `/admin/mlm-explanation` | MLM Explainer | Visual explainer of referral/MLM structure. |
| `/admin/loyalty-overview` | Loyalty Overview | High-level loyalty program metrics. |
| `/admin/data-export` | Data Export | Export platform data. |

### 3.5 Settings (1)

| Route | Label | About |
|-------|--------|--------|
| `/admin/settings` | Settings | Admin profile and app settings. |

---

## 4. Agent Panel — Panels & Features

**Total agent screens: 8.**

| Route | Label | About |
|-------|--------|--------|
| `/agent/dashboard` | Dashboard | Agent KPIs: recruited members/merchants, recent commissions. |
| `/agent/onboarding` | Onboarding | Agent onboarding flow and checklist. |
| `/agent/referrals` | Referrals | View and manage referred members/merchants. |
| `/agent/earnings` | Earnings | Commission and earnings history. |
| `/agent/territory` | Territory | Assigned territory (pincodes/regions). |
| `/agent/performance` | Performance | Performance metrics and trends. |
| `/agent/settings` | Settings | Agent profile and settings. |

---

## 5. Merchant Panel — Panels & Features

**Total merchant screens: 16.**

### 5.1 Main (6)

| Route | Label | About |
|-------|--------|--------|
| `/merchant/dashboard` | Dashboard | Merchant KPIs, offers, last payout, total payouts. |
| `/merchant/shops` | Shops | Manage shop/location details. |
| `/merchant/orders` | Orders | Order list and management. |
| `/merchant/transactions` | Transactions | Transaction history (purchases, payouts). |
| `/merchant/coupons` | Coupons | Create and manage coupons/offers (includes `/coupons/new`). |
| `/merchant/onboarding` | Onboarding | Merchant onboarding steps. |

### 5.2 Earnings (2)

| Route | Label | About |
|-------|--------|--------|
| `/merchant/payouts` | Payouts | Payout history and status. |
| `/merchant/boost-earnings` | Boost Earnings | Boost program and earnings. |

### 5.3 Analytics (3)

| Route | Label | About |
|-------|--------|--------|
| `/merchant/analytics` | Analytics | Merchant analytics. |
| `/merchant/dashboard-realtime` | Real-time | Real-time dashboard. |
| `/merchant/loyalty-analytics` | Loyalty | Loyalty-specific analytics. |

### 5.4 AI Tools (2)

| Route | Label | About |
|-------|--------|--------|
| `/merchant/voice-orders` | Voice Orders | Voice-based order handling. |
| `/merchant/ai-recommendations` | AI Insights | AI-driven recommendations/insights. |

### 5.5 Other (2)

| Route | Label | About |
|-------|--------|--------|
| `/merchant/notifications` | Notifications | In-app notifications. |
| `/merchant/settings` | Settings | Merchant profile and settings. |

---

## 6. Member Panel — Panels & Features

**Total member screens: 14** (including Extra placeholder).

### 6.1 Main (4)

| Route | Label | About |
|-------|--------|--------|
| `/member/homepage` | Home | Member home: transactions, offers, campaigns, coupons. |
| `/member/discover` | Discover | Discover merchants (filters, categories). |
| `/member/shop` | Shop | Shopping / offers view. |
| `/member/rewards` | Rewards | Rewards and redemption. |

### 6.2 Engagement (3)

| Route | Label | About |
|-------|--------|--------|
| `/member/referrals` | Referrals | Refer friends; referral status. |
| `/member/campaigns` | Campaigns | Active campaigns (e.g. bundle offers). |
| `/member/voice` | Voice Orders | Voice-based ordering. |

### 6.3 Tools & History (4)

| Route | Label | About |
|-------|--------|--------|
| `/member/my-coupons` | My Coupons | List of user’s coupons. |
| `/member/offline-payment` | Redeem Coupon | QR/offline coupon redemption. |
| `/member/loyalty-history` | History | Loyalty transaction history. |
| `/member/wallet` | Wallet | Wallet balance and history. |

### 6.4 Profile & Other (2)

| Route | Label | About |
|-------|--------|--------|
| `/member/profile` | Profile | Member profile and settings. |
| `/member/extra` | (Extra) | Placeholder “Coming Soon” for future feature. |

**Member mobile:** Bottom nav (Home, Discover, Rewards, My Coupons, Profile) on small screens; sidebar hidden on mobile.

---

## 7. Total Screen Count (by panel)

| Panel    | Screen count |
|----------|----------------|
| Admin    | 20 |
| Agent    | 8  |
| Merchant | 16 |
| Member   | 14 |
| Shared   | 1 (Login) |
| **Total (unique routes)** | **59** (excluding nested e.g. `/merchant/coupons/new`) |

---

## 8. Core Structure for KT

### 8.1 App & routing

- **Framework:** Next.js 15 (App Router).
- **Root layout:** `src/app/layout.tsx` — fonts, `AuthProvider`, `Toaster`, `FirebaseErrorListener`, `ClientHydrationBoundary`.
- **Role layouts:**  
  - `src/app/admin/layout.tsx` — AppSidebar.  
  - `src/app/agent/layout.tsx` — AgentSidebar.  
  - `src/app/merchant/layout.tsx` — MerchantSidebar.  
  - `src/app/member/layout.tsx` — MemberSidebar + MobileFooterNav (mobile).
- **Entry:** `src/app/page.tsx` → `redirect('/admin/dashboard')`.  
- **Login:** `src/app/login/page.tsx` — Google + email/password; post-login redirect by `appUser.role` to admin/agent/merchant/member dashboard or homepage.

### 8.2 Key directories

| Path | Purpose |
|------|--------|
| `src/app/admin/*`, `agent/*`, `merchant/*`, `member/*` | Role-specific routes and pages. |
| `src/app/login` | Login/sign-up. |
| `src/components/layout/` | Sidebars (sidebar, agent-sidebar, member-sidebar, merchant-sidebar), header, mobile-footer-nav. |
| `src/components/ui/` | Shared UI (shadcn): buttons, cards, tables, dialogs, etc. |
| `src/lib/` | auth, firebase, types, utils, placeholder-data. |
| `src/services/` | Data/API layer: user, merchant, offer, transaction, bundle-offer, welcome-coupon, user-coupon, data-service. |
| `src/ai/` | Genkit AI (e.g. offer moderation). |
| `src/hooks/` | useToast, use-mobile. |

### 8.3 Core types (`src/lib/types.ts`)

- **User:** uid, name, email, role, referralCode, agentCode, referredBy, referralChain, walletBalance, pointsBalance, status, etc.
- **Merchant:** merchantId, name, logo, commissionRate, linkedAgentId, category, boostBalance, etc.
- **Offer / UserCoupon / WelcomeCoupon / BundleOffer:** offer types, discount, expiry, status.
- **Transaction:** userId, merchantId, amount, type (purchase, payout, commission, points-earned, etc.).
- **Referral, Payout:** referral chain and payout status.
- **Advertisement, Territory:** ads and agent territories (pincodes).
- **Dashboard DTOs:** DashboardData, AgentDashboardData, MerchantDashboardData, MemberHomepageData.

### 8.4 Services (data layer)

| Service | Responsibility |
|---------|----------------|
| `user-service` | User CRUD, get by ID, list users. |
| `merchant-service` | Merchant CRUD and queries. |
| `data-service` | Dashboard aggregates (e.g. getDashboardData). |
| `transaction-service` | Transactions. |
| `offer-service` | Merchant offers. |
| `bundle-offer-service` | Bundle offers. |
| `welcome-coupon-service` | Welcome coupons. |
| `user-coupon-service` | User-held coupons. |

### 8.5 Auth & security

- **Auth:** `src/lib/auth.tsx` — Firebase Auth (Google, email/password, password reset), `AuthProvider`, `useAuth`, sign out.
- **Firebase:** `src/lib/firebase.ts` — initializeApp; exports auth, db (Firestore). Uses env for config; fallback for local preview if env missing.
- **Role-based access:** Login redirect and any route guards use `getUserById(uid)` and `user.role` to send users to the correct panel.

### 8.6 UI & design

- **Design:** Primary #673AB7, background #F5F5F5, accent #00BCD4 (see `docs/blueprint.md`).
- **Fonts:** PT Sans (body), Space Grotesk (headlines) — in root layout.
- **Components:** Radix-based UI in `src/components/ui/`; layout in `src/components/layout/`.

### 8.7 AI / Genkit

- **Location:** `src/ai/` — Genkit setup and flows (e.g. `moderate-merchant-offers` for content moderation).
- **Usage:** SuperAdmin can use AI to moderate merchant offers (per blueprint).

---

## 9. Quick reference — All routes by panel

**Admin:**  
dashboard, customers, merchants, agents, territories, ad-management, payouts, commission-management, merchant-boost, orders, coupon-approvals, bundle-offers, welcome-coupons, analytics, mlm-explanation, loyalty-overview, data-export, settings.

**Agent:**  
dashboard, onboarding, referrals, earnings, territory, performance, settings.

**Merchant:**  
dashboard, shops, orders, transactions, coupons (+ coupons/new), onboarding, payouts, boost-earnings, analytics, dashboard-realtime, loyalty-analytics, voice-orders, ai-recommendations, notifications, settings.

**Member:**  
homepage, discover, shop, rewards, referrals, campaigns, voice, my-coupons, offline-payment, loyalty-history, wallet, profile, extra.

**Shared:**  
/, /login.

---

## Referral / Purchase loyalty points

When a member **purchases** an offer (product), loyalty points are allocated to the buyer and optionally to their **referrer** (parent, one level only):

- **Source:** `src/services/points-service.ts`
- **Record a purchase and allocate points:** Call `recordPurchase({ userId, offerId, merchantId?, quantity, totalAmountPaise })`. This creates a `purchase` transaction and allocates points (buyer + referrer share) using Firestore transactions. Referrer share % is configured under **Admin → Commission Management** (“Parent referral points %”, default 20%).
- **Get member points:** `getUserPoints(userId)` returns the user’s current `pointsBalance`. Member UI (e.g. rewards, wallet) can use this or the User object’s `pointsBalance`.
- **Where to wire:** Any flow that completes a purchase with a known **offerId** and **quantity** should call `recordPurchase` (e.g. future checkout with line items, or offline payment once it tracks per-offer line items). The **Offline Payment** flow (`/member/offline-payment`) currently does not pass offer/quantity; when that is added, call `recordPurchase` after payment success.
- **Admin:** Per-offer “Loyalty points earned (per unit)” is in **Admin → Coupon Approvals** (create/edit offer). Global referrer % is in **Admin → Commission Management**.

---

This document is the single source for panel count, what each panel is about, and core structure for KT. For style and product intent, see `docs/blueprint.md`.
