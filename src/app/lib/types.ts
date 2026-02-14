


export type UserRole = 'superAdmin' | 'agent' | 'merchant' | 'member';

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'deactivated';

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
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
  gstin?: string;
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
  points?: number; // Cost in loyalty points, now optional
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


export interface UserCoupon {
  userCouponId: string;
  userId: string;
  title: string;
  category: string;
  value: number; // The discount value in paise
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
  targetLocation?: string; // e.g. 'Mumbai, Warangal'
}

export type Territory = {
    id: string;
    name: string;
    pincodes: string[];
    assignedAgentId: string;
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

export interface MemberHomepageData {
  member: User | null;
  memberTransactions: Transaction[];
  availableOffers: Offer[];
}
