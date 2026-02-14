

'use server';

import {
    getUsers,
    getUserById,
} from './user-service';
import { getMerchants } from './merchant-service';
import { getOffers } from './offer-service';
import { getTransactions } from './transaction-service';
import type { DashboardData, TransactionWithUserDetails, AgentDashboardData, MemberHomepageData, BundleOffer, UserCoupon, MerchantDashboardData, Merchant, User, Offer, Transaction } from '@/lib/types';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { getBundleOffers } from './bundle-offer-service';


/**
 * Fetches active coupons for a specific user.
 */
async function getUserCoupons(userId: string): Promise<UserCoupon[]> {
    if (!isFirebaseConfigured) return [];
    const couponsCol = collection(db, 'userCoupons');
    const q = query(couponsCol, where('userId', '==', userId), where('status', '==', 'active'));

    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                userCouponId: doc.id,
                expiryDate: data.expiryDate.toDate(),
            } as UserCoupon;
        });
    } catch (error) {
        console.error(`Error fetching coupons for user ${userId}:`, error);
        return [];
    }
}


/**
 * Fetches and aggregates all necessary data for the main admin dashboard.
 * Pass client-fetched merchants, transactions, users to avoid server-side permission errors.
 */
export async function getDashboardData(clientData?: {
    merchants: Merchant[];
    transactions: Transaction[];
    users: User[];
}): Promise<DashboardData> {
    if (!isFirebaseConfigured && !clientData) {
        return { totalUsers: 0, totalMerchants: 0, totalRevenue: 0, recentTransactions: [] };
    }
    let merchants: Merchant[];
    let transactions: Transaction[];
    let users: User[];
    if (clientData) {
        merchants = clientData.merchants;
        transactions = clientData.transactions;
        users = clientData.users;
    } else {
        const [m, t] = await Promise.all([getMerchants(), getTransactions(undefined, 5)]);
        merchants = m;
        transactions = t;
        const userIds = [...new Set(transactions.map(tx => tx.userId).filter(Boolean) as string[])];
        const userDocs = await Promise.all(userIds.map(uid => getUserById(uid)));
        users = userDocs.filter(u => u !== null) as User[];
    }

    const totalRevenue = transactions
        .filter(tx => tx.type === 'purchase')
        .reduce((acc, tx) => acc + tx.amount, 0);

    const userMap = new Map(users.map(u => [u.uid, u]));
    const merchantMap = new Map(merchants.map(m => [m.merchantId, m]));

    const recentTransactionsWithDetails: TransactionWithUserDetails[] = transactions.map(tx => ({
        ...tx,
        user: tx.userId ? { name: userMap.get(tx.userId)?.name || 'Unknown', avatarUrl: userMap.get(tx.userId)?.avatarUrl || '' } : undefined,
        merchant: tx.merchantId ? { name: merchantMap.get(tx.merchantId)?.name || 'N/A' } : undefined
    }));

    return {
        totalUsers: users.length,
        totalMerchants: merchants.length,
        totalRevenue,
        recentTransactions: recentTransactionsWithDetails,
    };
}


/**
 * Fetches and aggregates all necessary data for the agent dashboard.
 * Pass client-fetched data to avoid server-side permission errors.
 */
export async function getAgentDashboardData(
    agentId: string,
    clientData?: { agent: User | null; allUsers: User[]; allMerchants: Merchant[]; commissions: Transaction[] }
): Promise<AgentDashboardData> {
    if (!isFirebaseConfigured && !clientData) {
        return { agent: null, recruitedMembersCount: 0, recruitedMerchantsCount: 0, recentCommissions: [] };
    }
    let agentProfile: User | null;
    let allUsers: User[];
    let allMerchants: Merchant[];
    let commissions: Transaction[];
    if (clientData) {
        agentProfile = clientData.agent;
        allUsers = clientData.allUsers;
        allMerchants = clientData.allMerchants;
        commissions = clientData.commissions;
    } else {
        const [agent, users, merchants] = await Promise.all([
            getUserById(agentId),
            getUsers(),
            getMerchants(),
        ]);
        agentProfile = agent;
        allUsers = users;
        allMerchants = merchants;
        commissions = await getTransactions(agentId, 5, ['commission']);
    }

    if (!agentProfile || agentProfile.role !== 'agent') {
        return {
            agent: null,
            recruitedMembersCount: 0,
            recruitedMerchantsCount: 0,
            recentCommissions: commissions ?? [],
        };
    }

    const recruitedMembersCount = allUsers.filter(u => u.role === 'member' && u.referredBy === agentId).length;
    const recruitedMerchantsCount = allMerchants.filter(m => m.linkedAgentId === agentId).length;

    return {
        agent: agentProfile,
        recruitedMembersCount,
        recruitedMerchantsCount,
        recentCommissions: commissions,
    };
}

/**
 * Fetches and aggregates all necessary data for the merchant dashboard.
 * Pass client-fetched data to avoid server-side permission errors.
 */
export async function getMerchantDashboardData(
    userId: string,
    clientData?: { merchantUser: User | null; allUsers: User[]; allMerchants: Merchant[]; allOffers: Offer[]; allTransactions: Transaction[] }
): Promise<MerchantDashboardData> {
    if (!isFirebaseConfigured && !clientData) {
        return { merchant: null, agent: null, merchantOffers: [], totalPayouts: 0 };
    }
    let merchantUser: User | null;
    let allUsers: User[];
    let allMerchants: Merchant[];
    let allOffers: Offer[];
    let allTransactions: Transaction[];
    if (clientData) {
        merchantUser = clientData.merchantUser;
        allUsers = clientData.allUsers;
        allMerchants = clientData.allMerchants;
        allOffers = clientData.allOffers;
        allTransactions = clientData.allTransactions;
    } else {
        const [user, users, merchants, offers, transactions] = await Promise.all([
            getUserById(userId),
            getUsers(),
            getMerchants(),
            getOffers(),
            getTransactions(),
        ]);
        merchantUser = user;
        allUsers = users;
        allMerchants = merchants;
        allOffers = offers;
        allTransactions = transactions;
    }

    if (!merchantUser || !merchantUser.merchantId) {
        return { merchant: null, agent: null, merchantOffers: [], totalPayouts: 0 };
    }

    const merchant = allMerchants.find(m => m.merchantId === merchantUser!.merchantId) || null;
    let agent: User | null = null;
    let merchantOffers: Offer[] = [];

    if (merchant) {
        agent = allUsers.find(u => u.uid === merchant.linkedAgentId) || null;
        merchantOffers = allOffers.filter(o => o.merchantIds.includes(merchant.merchantId));
    }

    const payouts = allTransactions.filter(tx => tx.type === 'payout' && tx.userId === userId);
    const lastPayout = payouts.length > 0 ? payouts[0] : undefined;
    const totalPayouts = payouts.reduce((acc, tx) => acc + tx.amount, 0);

    return {
        merchant,
        agent,
        merchantOffers,
        lastPayout,
        totalPayouts
    };
}


/**
 * Fetches and aggregates all necessary data for the member homepage.
 * Pass clientData from client-fetched services to avoid server-side permission errors.
 */
export async function getMemberHomepageData(
    memberId?: string,
    clientData?: {
        activeCampaigns: BundleOffer[];
        activeOffers: Offer[];
        appUser: User | null;
        userTransactions: Transaction[];
        coupons: UserCoupon[];
    }
): Promise<MemberHomepageData> {
    if (clientData) {
        return {
            member: clientData.appUser,
            memberTransactions: clientData.userTransactions,
            availableOffers: clientData.activeOffers,
            activeCampaigns: clientData.activeCampaigns,
            userCoupons: clientData.coupons,
        };
    }
    if (!isFirebaseConfigured) {
        return { member: null, memberTransactions: [], availableOffers: [], activeCampaigns: [], userCoupons: [] };
    }
    const activeCampaigns = await getBundleOffers('active');
    const activeOffers = await getOffers('active', 2);
    if (!memberId) {
        return {
            member: null,
            memberTransactions: [],
            availableOffers: activeOffers,
            activeCampaigns,
            userCoupons: [],
        };
    }
    const [appUser, userTransactions, coupons] = await Promise.all([
        getUserById(memberId),
        getTransactions(memberId, 3),
        getUserCoupons(memberId),
    ]);
    return {
        member: appUser,
        memberTransactions: userTransactions,
        availableOffers: activeOffers,
        activeCampaigns,
        userCoupons: coupons,
    };
}

/** Pass client-fetched agents and allUsers to avoid server-side permission errors. */
export async function getAdminAgentsPageData(agents?: User[], allUsers?: User[]) {
    const agentList = agents ?? (isFirebaseConfigured ? await getUsers('agent') : []);
    const users = allUsers ?? (isFirebaseConfigured ? await getUsers() : []);
    const referralCounts: Record<string, number> = {};
    users.forEach(user => {
        if (user.referredBy) {
            referralCounts[user.referredBy] = (referralCounts[user.referredBy] || 0) + 1;
        }
    });
    return { agents: agentList, referralCounts };
}

/** Pass client-fetched allUsers to avoid server-side permission errors. */
export async function getAdminCustomersPageData(allUsers?: User[]) {
    const users = allUsers ?? (isFirebaseConfigured ? await getUsers() : []);
    const customers = users.filter(u => u.role === 'member');
    const userMap = new Map(users.map(u => [u.uid, u]));
    return { customers, userMap };
}

/** Pass client-fetched data to avoid server-side permission errors. */
export async function getAdminMerchantsPageData(
    merchantUsers?: User[],
    allMerchants?: Merchant[],
    allAgents?: User[]
) {
    const merchants = merchantUsers ?? (isFirebaseConfigured ? await getUsers('merchant') : []);
    const merchantProfiles = allMerchants ?? (isFirebaseConfigured ? await getMerchants() : []);
    const agents = allAgents ?? (isFirebaseConfigured ? await getUsers('agent') : []);
    const merchantProfilesMap = new Map(merchantProfiles.map(m => [m.merchantId, m]));
    const agentsMap = new Map(agents.map(a => [a.uid, a]));
    return { merchants, merchantProfilesMap, agentsMap };
}

/** Pass client-fetched data to avoid server-side permission errors. */
export async function getAdminOrdersPageData(
    transactions?: Transaction[],
    users?: User[],
    merchants?: Merchant[]
) {
    const txList = transactions ?? (isFirebaseConfigured ? await getTransactions() : []);
    const userList = users ?? (isFirebaseConfigured ? await getUsers() : []);
    const merchantList = merchants ?? (isFirebaseConfigured ? await getMerchants() : []);
    const orders = txList.filter(tx => tx.type === 'purchase');
    const userMap = new Map(userList.map(u => [u.uid, u]));
    const merchantMap = new Map(merchantList.map(m => [m.merchantId, m]));
    return { orders, userMap, merchantMap };
}
