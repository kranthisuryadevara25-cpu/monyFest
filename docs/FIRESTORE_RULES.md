# Firestore Security Rules — Full Reference

This document describes the Firestore collections used by LoyaltyLeap and how the rules in `firestore.rules` support **Admin**, **Agent**, **Merchant**, and **Member** panels.

## Why permission errors happen

- Requests from **Server Actions** run on the server with **no Firebase user** (`request.auth == null`), so Firestore denies them unless rules allow unauthenticated access (not recommended).
- The app uses **client-side** fetches where possible (e.g. `getOffersClient`, `getMerchantsClient`, `getUsersClient`) so the browser sends the logged-in user’s token and rules can allow access with `request.auth != null`.

## Collections and who uses them

| Collection       | Admin | Agent | Merchant | Member | Operations |
|------------------|-------|-------|----------|--------|------------|
| **users**        | list, edit | referrals, list | profile | profile, referrals | read, create (own), update, delete |
| **merchants**    | manage | territory | own profile | discover, shop | read, write |
| **offers**       | manage | — | own offers | shop | read, write |
| **transactions** | orders, revenue | commissions | payouts | history | read, write |
| **userCoupons**  | data | — | — | my-coupons, offline-payment | read, write (create on signup) |
| **welcomeCoupons** | manage | — | — | — | read, write |
| **bundleOffers** | campaigns | — | — | homepage campaigns | read, write |
| **commissionSettings** | commission management | — | — | — | read, write (admin; server reads on signup) |
| **payment_orders**     | — | — | — | — | read, write (PhonePe create/status from app; webhook updates may need Admin SDK) |

## Rules in `firestore.rules`

- **users**  
  - Read: any authenticated user (admin list, agent referrals, profile).  
  - Create: only for own document (`request.auth.uid == userId`) so signup creates the correct user doc.  
  - Update/delete: any authenticated user (profile edits, admin edits).

- **merchants**  
  - Read, write: any authenticated user (admin manage, member discover/shop, merchant/agent usage).

- **offers**  
  - Read, write: any authenticated user (admin/merchant manage, member shop).

- **transactions**  
  - Read, write: any authenticated user (admin orders, agent commissions, merchant payouts, member history).

- **userCoupons**  
  - Read, write: any authenticated user (member my-coupons/offline-payment, creation for new members).

- **welcomeCoupons**  
  - Read, write: any authenticated user (admin config; used when creating welcome coupons for new members).

- **bundleOffers**  
  - Read, write: any authenticated user (admin campaigns, member homepage).

- **commissionSettings**  
  - Read, write: any authenticated user (admin commission management; server reads when creating commission transactions on member signup).

- **payment_orders**  
  - Read, write: any authenticated user. Used by PhonePe flow: create order (API route), status poll (API route). Webhook runs with no user; use Firebase Admin SDK in the webhook handler so writes succeed.

- **Default**  
  - Any other path: `allow read, write: if false;` so unknown collections are denied.

Role-based restrictions (e.g. only admin can write `welcomeCoupons`) are not enforced in these rules; the app controls which panels and actions each role can use. To enforce role in rules you would set Firebase Auth custom claims (e.g. `request.auth.token.role == 'superAdmin'`) and add conditions per collection.

## What to do in Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com) → your project → **Firestore Database** → **Rules**.
2. Replace the rules with the contents of the project’s **`firestore.rules`** file (it already includes all collections above).
3. Click **Publish**.

## Deploying from this repo

1. Ensure `firebase.json` includes:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

2. Deploy rules and/or indexes:

```bash
firebase deploy --only firestore:rules    # rules only
firebase deploy --only firestore:indexes  # indexes only
firebase deploy --only firestore          # both
```

**Warning:** Deploying rules replaces the **entire** rules file in the project. If you use other collections or rules elsewhere, merge them into `firestore.rules` before deploying.

### Composite indexes

Queries that filter and sort (e.g. `transactions` by `userId` + `orderBy('createdAt', 'desc')`) require a composite index. The repo includes `firestore.indexes.json` with the needed indexes. Deploy them with `firebase deploy --only firestore:indexes`, or create the index from the link Firebase shows in the error message. Indexes can take a few minutes to build.

## Server-side writes (e.g. welcome coupons)

Some flows (e.g. creating user docs and welcome coupons on signup) run in **Server Actions**, which do not send a user token. With the current rules they will get permission denied when writing from the server. Options:

- **Client after signup:** After the user signs up, call the same logic from the client (e.g. create user doc and welcome coupons) so the request is authenticated.
- **Firebase Admin SDK:** Run user creation and welcome-coupon creation in a backend (e.g. Cloud Functions) using the Admin SDK, which is not restricted by Firestore rules.
- **Custom token / service account:** Use a secure server-side path that writes with elevated privileges only for those specific operations.

The rules in `firestore.rules` are written so that all **client-side** access (with `request.auth != null`) works for Admin, Agent, Merchant, and Member panels.
