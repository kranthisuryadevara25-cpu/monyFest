
import type { User, Merchant, Offer, Transaction, AdType, Advertisement, Territory, BundleOffer, UserCoupon } from './types';
import { add } from 'date-fns';

// This file contains mock data for prototyping purposes.
// In a real application, this data would be fetched from a database.

export const mockUsers: User[] = [
  {
    uid: 'super-admin-01',
    name: 'Admin',
    email: 'admin@loyaltyleap.com',
    role: 'superAdmin',
    status: 'approved',
    walletBalance: 0,
    pointsBalance: 0,
    createdAt: new Date('2023-01-01'),
    avatarUrl: 'https://picsum.photos/seed/admin/100/100',
    referralCode: 'ADMINPRO',
  },
  {
    uid: 'agent-smith-01',
    name: 'Agent Smith',
    email: 'agent.smith@example.com',
    role: 'agent',
    status: 'approved',
    walletBalance: 1250.50,
    createdAt: new Date('2023-02-15'),
    avatarUrl: 'https://picsum.photos/seed/smith/100/100',
    referralCode: 'SMITHY',
    agentCode: 'AGENT-S1',
    referralChain: ['super-admin-01'],
  },
  {
    uid: 'laxman-agent-02',
    name: 'Laxman S.',
    email: 'laxman.s@example.com',
    role: 'agent',
    status: 'pending',
    walletBalance: 50.00,
    createdAt: new Date('2023-03-10'),
    avatarUrl: 'https://picsum.photos/seed/laxman/100/100',
    referralCode: 'LAXMANGO',
    agentCode: 'AGENT-L2',
    referralChain: ['super-admin-01'],
  },
  {
    uid: 'merchant-user-01',
    name: 'Charlie Brown',
    email: 'charlie@coffeehouse.com',
    role: 'merchant',
    merchantId: 'merchant-01',
    status: 'approved',
    walletBalance: 5400.00,
    createdAt: new Date('2023-04-20'),
    avatarUrl: 'https://picsum.photos/seed/charlie/100/100',
    referredBy: 'laxman-agent-02',
    referralChain: ['super-admin-01', 'laxman-agent-02'],
  },
  {
    uid: 'member-user-ramu',
    name: 'Ramu K.',
    email: 'ramu.k@example.com',
    role: 'member',
    status: 'approved',
    walletBalance: 150.00,
    pointsBalance: 1300,
    createdAt: new Date('2023-05-01'),
    avatarUrl: 'https://picsum.photos/seed/ramu/100/100',
    referredBy: 'laxman-agent-02',
    referralChain: ['super-admin-01', 'laxman-agent-02'],
    referralCode: 'RAMUK123',
    location: 'Mumbai'
  },
   {
    uid: 'member-user-bharath',
    name: 'Bharath G.',
    email: 'bharath.g@example.com',
    role: 'member',
    status: 'approved',
    walletBalance: 200.00,
    pointsBalance: 500,
    createdAt: new Date('2023-05-05'),
    avatarUrl: 'https://picsum.photos/seed/bharath/100/100',
    referredBy: 'member-user-ramu',
    referralChain: ['super-admin-01', 'laxman-agent-02', 'member-user-ramu'],
    referralCode: 'BHARATH456',
    location: 'Warangal'
  },
  {
    uid: 'member-user-shathrugna',
    name: 'Shathrugna M.',
    email: 'shathrugna.m@example.com',
    role: 'member',
    status: 'approved',
    walletBalance: 50,
    pointsBalance: 100,
    createdAt: new Date('2023-11-20'),
    avatarUrl: 'https://picsum.photos/seed/shathrugna/100/100',
    referredBy: 'member-user-bharath',
    referralChain: ['super-admin-01', 'laxman-agent-02', 'member-user-ramu', 'member-user-bharath'],
    referralCode: 'SHATH789',
    location: 'Mumbai'
  },
  {
    uid: 'agent-penelope',
    name: 'Agent Penelope',
    email: 'penelope@example.com',
    role: 'agent',
    status: 'deactivated',
    walletBalance: 0,
    createdAt: new Date('2023-01-20'),
    avatarUrl: 'https://picsum.photos/seed/penelope/100/100',
    referralCode: 'PENELOPE1',
    agentCode: 'AGENT-P3'
  },
];

export const mockMerchants: Merchant[] = [
    {
        merchantId: 'merchant-01',
        name: 'Coffee House',
        logo: 'https://picsum.photos/seed/coffeehouse/100/100',
        commissionRate: 5,
        linkedAgentId: 'laxman-agent-02',
        createdAt: new Date('2023-04-20'),
        category: 'food',
        gstin: '27AAFCC1234A1Z5'
    },
    {
        merchantId: 'merchant-02',
        name: 'Bookworm Corner',
        logo: 'https://picsum.photos/seed/bookworm/100/100',
        commissionRate: 8,
        linkedAgentId: 'agent-smith-01',
        createdAt: new Date('2023-03-15'),
        category: 'books'
    },
    {
        merchantId: 'merchant-03',
        name: 'Quick Eats',
        logo: 'https://picsum.photos/seed/quickeats/100/100',
        commissionRate: 6,
        linkedAgentId: 'laxman-agent-02',
        createdAt: new Date('2023-06-01'),
        category: 'food'
    }
]

export const mockOffers: Offer[] = [
    {
        offerId: 'offer-01',
        merchantIds: ['merchant-01'],
        merchantName: 'Coffee House',
        merchantLogo: 'https://picsum.photos/seed/coffeehouse/100/100',
        title: 'Free Pastry with any Large Coffee',
        description: 'Enjoy a delicious free pastry of your choice when you buy any large-sized coffee. Perfect for a morning treat or an afternoon pick-me-up. Cannot be combined with other offers.',
        points: 50,
        expiryDate: new Date('2024-12-31'),
        status: 'active',
        offerType: 'standard',
        discountType: 'fixed',
        discountValue: 100, // Represents a value, not tied to points
        minimumOrderValue: 250,
    },
    {
        offerId: 'offer-02',
        merchantIds: ['merchant-02'],
        merchantName: 'Bookworm Corner',
        merchantLogo: 'https://picsum.photos/seed/bookworm/100/100',
        title: '100 Points for any Novel',
        description: 'Get a 100 points discount on the purchase of any novel from our vast collection. Explore new worlds and expand your library.',
        points: 100,
        expiryDate: new Date('2024-10-31'),
        status: 'pending',
        offerType: 'standard',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscountValue: 150
    },
    {
        offerId: 'offer-03',
        merchantIds: ['merchant-03'],
        merchantName: 'Quick Eats',
        merchantLogo: 'https://picsum.photos/seed/quickeats/100/100',
        title: 'Burger Combo',
        description: 'A classic burger, fries, and a drink. The perfect meal.',
        points: 80,
        expiryDate: new Date('2024-09-30'),
        status: 'rejected',
        offerType: 'combo',
        includedItems: '1 Burger\n1 Fries\n1 Soft Drink',
        discountType: 'fixed',
        discountValue: 200,
    },
    {
        offerId: 'offer-04',
        merchantIds: ['merchant-01', 'merchant-03'],
        merchantName: 'Coffee House, Quick Eats',
        merchantLogo: 'https://picsum.photos/seed/coffeehouse/100/100',
        title: 'Snack Time Special',
        description: 'Get a discount at two of our most popular eateries.',
        points: 120,
        expiryDate: new Date('2024-08-31'),
        status: 'active',
        offerType: 'bonus',
        bonusRuleDescription: 'Redeem 3 offers in a week to unlock this bonus.',
        discountType: 'percentage',
        discountValue: 25,
    }
];

export const mockTransactions: Transaction[] = [
    {
        id: 'tx-01',
        userId: 'member-user-ramu',
        merchantId: 'merchant-01',
        amount: 35000,
        type: 'purchase',
        createdAt: new Date('2024-05-20T10:00:00Z'),
        description: 'Large Latte & Croissant'
    },
    {
        id: 'tx-02',
        userId: 'laxman-agent-02',
        amount: 5000,
        type: 'commission',
        createdAt: new Date('2024-05-19T11:00:00Z'),
        description: 'Level 1 commission from Ramu K. signup',
        sourceId: 'member-user-ramu'
    },
    {
        id: 'tx-03',
        userId: 'merchant-user-01',
        amount: 540000,
        type: 'payout',
        createdAt: new Date('2024-05-18T09:00:00Z'),
        description: 'Weekly Payout'
    },
     {
        id: 'tx-04',
        userId: 'member-user-bharath',
        merchantId: 'merchant-02',
        amount: 120000,
        type: 'purchase',
        createdAt: new Date('2024-05-21T14:00:00Z'),
        description: 'Two novels'
    },
     {
        id: 'tx-05',
        userId: 'member-user-ramu',
        amount: 5000,
        type: 'commission',
        createdAt: new Date('2024-05-21T14:01:00Z'),
        description: 'Level 2 commission from Bharath G. signup',
        sourceId: 'member-user-bharath'
    },
     {
        id: 'tx-06',
        userId: 'member-user-ramu',
        amount: 50,
        type: 'points-redeemed',
        merchantId: 'merchant-01',
        createdAt: new Date('2024-05-22T10:05:00Z'),
        description: 'Free Pastry with any Large Coffee'
    }
]

export const mockAdvertisements: Advertisement[] = [
    {
        id: 'ad-01',
        title: 'Summer Sale!',
        type: 'image',
        content: 'https://picsum.photos/seed/summer-sale/800/400',
        link: '/member/shop',
        status: 'active',
        createdAt: new Date('2024-05-20'),
        targetLocation: 'Mumbai'
    },
     {
        id: 'ad-02',
        title: 'New Branch Opening',
        type: 'image',
        content: 'https://picsum.photos/seed/new-branch/600/400',
        link: '/member/discover',
        status: 'active',
        createdAt: new Date('2024-05-18'),
    },
     {
        id: 'ad-03',
        title: 'Special Offer: 20% off all books!',
        type: 'scroll',
        content: 'FLASH SALE: Get 20% off all books at Bookworm Corner for the next 24 hours!',
        link: '/member/rewards',
        status: 'active',
        createdAt: new Date('2024-05-21'),
    },
     {
        id: 'ad-04',
        title: 'Diwali Dhamaka',
        type: 'image',
        content: 'https://picsum.photos/seed/diwali/600/400',
        link: '/member/campaigns',
        status: 'inactive',
        createdAt: new Date('2024-04-10'),
    }
]

export const mockTerritories: Territory[] = [
    { id: 'ter-01', name: 'South Mumbai', pincodes: ['400001', '400005', '400021'], assignedAgentId: 'agent-smith-01'},
    { id: 'ter-02', name: 'Pune Central', pincodes: ['411001', '411002', '411004', '411005'], assignedAgentId: 'laxman-agent-02'},
];

export const initialCampaigns: BundleOffer[] = [
  {
    id: 'camp-01',
    title: 'Breakfast Bonanza',
    description: 'Make 3 purchases at any partner cafe before 11 AM in one week to get ₹100 cashback.',
    startDate: new Date('2024-05-01'),
    endDate: new Date('2024-06-30'),
    requiredTransactions: 3,
    eligibleCategories: ['food'],
    rewardType: 'cashback',
    rewardValue: 100,
    usageLimit: 'perUser',
    limitValue: 1,
    status: 'active',
  },
  {
    id: 'camp-02',
    title: 'Book Lover\'s Reward',
    description: 'Buy 5 books in a month and get a coupon for 50% off your next book purchase.',
    startDate: new Date('2024-05-01'),
    endDate: new Date('2024-05-31'),
    requiredTransactions: 5,
    eligibleCategories: ['books'],
    rewardType: 'coupon',
    rewardValue: 'BOOKWORM50',
    usageLimit: 'globalLimit',
    limitValue: 100,
    status: 'active',
  },
   {
    id: 'camp-03',
    title: 'Early Bird Special',
    description: 'Expired campaign example.',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-04-30'),
    requiredTransactions: 5,
    rewardType: 'points',
    rewardValue: 500,
    usageLimit: 'perUser',
    status: 'archived',
  },
];

export const mockUserCoupons: UserCoupon[] = [
  {
    userCouponId: 'uc-01',
    userId: 'member-user-ramu',
    title: '₹100 off Groceries',
    category: 'SuperMart',
    discountType: 'fixed',
    discountValue: 10000,
    expiryDate: add(new Date(), { days: 15 }),
    status: 'active',
  },
  {
    userCouponId: 'uc-02',
    userId: 'member-user-ramu',
    title: 'Free Coffee',
    category: 'Coffee House',
    discountType: 'fixed',
    discountValue: 25000,
    expiryDate: add(new Date(), { days: 20 }),
    status: 'active',
  },
  {
    userCouponId: 'uc-03',
    userId: 'member-user-ramu',
    title: '20% off Books',
    category: 'Bookworm Corner',
    discountType: 'percentage',
    discountValue: 20,
    expiryDate: add(new Date(), { days: 5 }),
    status: 'redeemed',
  },
   {
    userCouponId: 'uc-04',
    userId: 'member-user-ramu',
    title: 'Expired Movie Ticket',
    category: 'Cineplex',
    discountType: 'fixed',
    discountValue: 15000,
    expiryDate: add(new Date(), { days: -5 }),
    status: 'active', // Status is active, but date is expired
  },
];
