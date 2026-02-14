

export type UserRole = 'superAdmin' | 'agent' | 'merchant' | 'member';

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'deactivated';

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  merchantId?: string; // Link to the merchant profile if role is 'merchant'
  referralCode?: string;
  agentCode?: string; // For agents to share
  referredBy?: string;
  referralChain?: string[];
  walletBalance: number;
  pointsBalance?: number; // Added for loyalty points
  status: UserStatus;
  createdAt: Date;
  updatedAt?: Date;
  avatarUrl?: string;
  location?: string; // e.g., 'Mumbai', '400050'
}

export interface Merchant {
  merchantId: string;
  name:string;
  logo: string;
  commissionRate: number;
  linkedAgentId: string;
  createdAt: Date;
  category: 'food' | 'retail' | 'books' | 'services' | 'other';
  /** Optional industry for slab-based loyalty (e.g. "medical", "spa"). Used with category for loyalty slab lookup. */
  industry?: string;
  gstin?: string;
  boostBalance?: number;
  totalBoostEarned?: number;
}

export type OfferType = 'standard' | 'combo' | 'bonus';
export type DiscountType = 'fixed' | 'percentage';

export interface Offer {
  offerId: string;
  merchantIds: string[];
  merchantName: string; // This will be a comma-separated list for display
  merchantLogo: string; // Will use the first merchant's logo for now
  title: string;
  description: string;
  points?: number; // Cost in loyalty points to redeem, now optional
  /** Points earned by the buyer per unit when they purchase this offer (default 10). */
  loyalty_points?: number;
  expiryDate: Date;
  status: 'pending' | 'active' | 'rejected' | 'expired';
  
  // Advanced Offer Fields
  offerType: OfferType;
  includedItems?: string; // For combo packs
  bonusRuleDescription?: string; // For bonus offers

  // Discount Fields
  discountType: DiscountType; // 'fixed' or 'percentage'
  discountValue: number; // The amount/percentage of discount
  minimumOrderValue?: number; // Minimum purchase to avail offer
  maxDiscountValue?: number; // Capping for percentage discounts
}

export interface WelcomeCoupon {
  id: string;
  title: string;
  category: string;
  discountType: DiscountType;
  discountValue: number; // in paise for fixed, or percentage value
}

export interface UserCoupon {
  userCouponId: string;
  userId: string;
  title: string;
  category: string;
  discountType: DiscountType;
  discountValue: number; // in paise for fixed, or percentage value
  expiryDate: Date;
  status: 'active' | 'redeemed' | 'expired';
}

// A record of a financial event like a purchase
export interface Transaction {
  id: string;
  userId: string; // The user making the transaction (buyer) or receiving commission
  merchantId?: string;
  amount: number; // in paise for cash, or number of points for loyalty
  type: 'purchase' | 'payout' | 'refund' | 'commission' | 'credit' | 'debit' | 'points-earned' | 'points-redeemed';
  pointsEarned?: number;
  pointsRedeemed?: number;
  createdAt: Date;
  description?: string;
  sourceId?: string; // e.g. orderId for a commission
  /** For type 'commission': admin payout status. */
  payoutStatus?: 'pending' | 'completed' | 'rejected';
  /** For type 'commission': level in referral chain (1 = direct referrer). */
  commissionLevel?: 1 | 2 | 3;
  /** For type 'purchase': offer/product id and quantity. */
  offerId?: string;
  quantity?: number;
}

/** Stored commission rules (amounts in paise) and loyalty points. */
export interface CommissionSettings {
  level1: number;  // paise to pay Level 1 (direct referrer) per member signup
  level2: number;
  level3: number;
  merchantBonus: number; // paise for recruiting a new merchant
  /** @deprecated Use loyaltyPointsSharePct* below. Percentage to parent when only 2-way split. */
  parentPointsSharePct: number;
  /** Loyalty points split: Parent (L1 referrer) : Buyer (child) : Grandparent (L2 referrer). Must sum to 100. Example 70:20:10. */
  loyaltyPointsSharePctParent: number;
  loyaltyPointsSharePctBuyer: number;
  loyaltyPointsSharePctGrandparent: number;
}

/** Merchant Boost program config (admin settings). Amounts in rupees. */
export interface BoostSettings {
  boostEnabled: boolean;
  boostPercentage: number;
  applyOn: 'gross' | 'final';
  minRedemptionThreshold: number; // rupees
  autoApproveThreshold: number;   // rupees; 0 = disabled
  updatedAt?: Date;
}

/** A Boost withdrawal request from a merchant. */
export interface BoostWithdrawal {
  id: string;
  merchantId: string;
  amount: number; // rupees
  status: 'pending' | 'completed' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  note?: string;
}

/** Single slab: order value in this range earns fixed points. */
export interface LoyaltySlab {
  minAmountPaise: number;
  /** Null = no upper limit (e.g. "above ₹300"). */
  maxAmountPaise: number | null;
  points: number;
}

/** Slab config per category/industry (e.g. medical, spa, food). Key = category or industry id. */
export interface LoyaltySlabConfig {
  categoryId: string;
  slabs: LoyaltySlab[];
  updatedAt?: Date;
}

// A record of a referral event, separate from the financial payout
export interface Referral {
    id: string;
    referrerId: string; // User who referred
    referredId: string; // User who was referred
    level: 1 | 2 | 3;
    commissionAmount: number; // in paise
    status: 'pending' | 'approved' | 'rejected'; // Status of the referral itself
    createdAt: Date;
    updatedAt: Date;
}


// A record of a commission payment to be processed by an admin
export interface Payout {
  id: string;
  payeeId: string; // The user receiving the money
  sourceUserId: string; // The user whose action generated the commission (e.g. new signup)
  amount: number; // in paise
  level: 1 | 2 | 3; // Which level of the chain this commission is for
  status: 'pending' | 'completed' | 'rejected';
  createdAt: Date;
}

export type AdType = 'image' | 'video' | 'scroll';

export interface Advertisement {
  id: string;
  title: string;
  type: AdType;
  content: string; // URL for image/video, text for scroll
  link: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  targetLocation?: string; // e.g., 'Mumbai', 'Warangal'
}

export type Territory = {
    id: string;
    name: string;
    pincodes: string[];
    assignedAgentId: string;
}


export interface BundleOffer {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  requiredTransactions: number;
  eligibleCategories?: string[]; // e.g. 'food', 'retail'
  rewardType: 'cashback' | 'points' | 'coupon';
  rewardValue: number | string; // amount for cashback/points or coupon name
  couponCode?: string; // a specific coupon to be issued
  usageLimit: 'perUser' | 'globalLimit';
  limitValue?: number; // the actual numeric limit
  status: 'active' | 'inactive' | 'archived';
}

// =================================================================
// Data Transfer Objects for optimized queries
// =================================================================

export type TransactionWithUserDetails = Transaction & {
    user?: { name: string; avatarUrl: string };
    merchant?: { name: string };
};

export interface DashboardData {
    totalRevenue: number;
    totalUsers: number;
    totalMerchants: number;
    recentTransactions: TransactionWithUserDetails[];
}

export interface AgentDashboardData {
    agent: User | null;
    recruitedMembersCount: number;
    recruitedMerchantsCount: number;
    recentCommissions: Transaction[];
}

export interface MerchantDashboardData {
    merchant: Merchant | null;
    agent: User | null;
    merchantOffers: Offer[];
    lastPayout?: Transaction;
    totalPayouts: number;
}

export interface MemberHomepageData {
  member: User | null;
  memberTransactions: Transaction[];
  availableOffers: Offer[];
  activeCampaigns: BundleOffer[];
  userCoupons: UserCoupon[];
}
