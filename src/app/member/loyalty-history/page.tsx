
'use client';
/**
 * @file LoyaltyHistoryPage
 * @description This page displays a comprehensive history of a member's points and wallet transactions.
 *
 * @overview
 * The LoyaltyHistoryPage provides a detailed, unified log of all financial and loyalty-point-related activities for the logged-in member.
 * It fetches the member's profile, all their transactions, and a list of all merchants to provide context for each transaction.
 * Transactions are presented in a clear, tabular format.
 *
 * @features
 * - **Unified Transaction Log**: Displays both wallet (cash) and loyalty points transactions in a single table.
 * - **Fetches Live Data**: Connects to Firestore to get the current user's data and their entire transaction history.
 * - **Detailed Transaction Rows**: Each row in the table shows:
 *   - A description of the transaction.
 *   - The name of the merchant involved, if applicable.
 *   - The type of transaction (e.g., 'purchase', 'commission', 'points-earned'), visually distinguished by badges and icons.
 *   - The transaction amount, formatted for either currency or points.
 *   - The exact date and time the transaction occurred.
 * - **Visual Indicators**: Uses icons (arrows) and colors to quickly show whether a transaction was a credit or a debit.
 * - **Loading and Error States**: Includes handling for loading states and cases where the user's data cannot be found.
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, IndianRupee, Star, Building } from "lucide-react";
import type { Transaction, User, Merchant } from "@/lib/types";
import { useAuth } from '@/lib/auth';
import { getTransactionsClient } from '@/services/transaction-service.client';
import { getUserByIdClient } from '@/services/user-service.client';
import { getMerchantsClient } from '@/services/merchant-service.client';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';

const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
        case 'commission':
        case 'credit':
        case 'purchase':
             return <ArrowUp className="mr-1 h-3 w-3 text-success" />;
        case 'payout':
        case 'debit':
        case 'refund':
            return <ArrowDown className="mr-1 h-3 w-3 text-destructive" />;
        case 'points-earned':
            return <ArrowUp className="mr-1 h-3 w-3 text-secondary" />;
        case 'points-redeemed':
            return <ArrowDown className="mr-1 h-3 w-3 text-blue-500" />;
        default:
            return null;
    }
}

const getTransactionAmount = (tx: Transaction) => {
    const isPoints = tx.type.startsWith('points-');
    const isCredit = ['credit', 'commission', 'purchase', 'points-earned'].includes(tx.type);
    const prefix = isCredit ? '+' : '-';

    if (isPoints) {
        return (
            <div className={`font-mono flex items-center font-medium ${isCredit ? 'text-secondary-foreground' : 'text-blue-600'}`}>
                <Star className="mr-1 h-4 w-4 fill-secondary" />
                {prefix} {tx.amount.toLocaleString()}
            </div>
        );
    }
    return (
        <div className={`font-mono flex items-center font-medium ${isCredit ? 'text-success' : 'text-destructive'}`}>
            <IndianRupee className="mr-1 h-3 w-3" />
            {prefix} {(tx.amount / 100).toFixed(2)}
        </div>
    )
}

export default function LoyaltyHistoryPage() {
    const { user: authUser } = useAuth();
    const [member, setMember] = React.useState<User | null>(null);
    const [memberTransactions, setMemberTransactions] = React.useState<Transaction[]>([]);
    const [merchants, setMerchants] = React.useState<Merchant[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMemberData = async () => {
            if (authUser) {
                setLoading(true);
                const [appUser, allTransactions, allMerchants] = await Promise.all([
                    getUserByIdClient(authUser.uid),
                    getTransactionsClient(authUser.uid),
                    getMerchantsClient()
                ]);
                
                setMember(appUser);
                setMemberTransactions(allTransactions);
                setMerchants(allMerchants);
                setLoading(false);
            }
        }
       fetchMemberData();
    }, [authUser]);

    if (loading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Header pageTitle="History" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </main>
        );
    }
    
    if (!member) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Header pageTitle="History" />
                <Card>
                    <CardContent className="py-10 text-center">
                        <p>Could not load user data. Please try logging in again.</p>
                    </CardContent>
                </Card>
            </main>
        )
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="History" />
      <Card>
        <CardHeader>
          <CardTitle>Points & Wallet History</CardTitle>
          <CardDescription>A detailed log of all your points and wallet transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
              <TableHeader>
                  <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {memberTransactions.map((tx) => {
                      const isCredit = ['credit', 'commission', 'purchase', 'points-earned'].includes(tx.type);
                      const merchant = merchants.find(m => m.merchantId === tx.merchantId);
                      return (
                      <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.description}</TableCell>
                      <TableCell>
                          {merchant ? (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Building className="h-4 w-4" />
                                  {merchant.name}
                              </div>
                          ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                          <Badge
                          variant={isCredit ? 'default' : 'destructive'}
                          className="capitalize"
                          >
                          {getTransactionIcon(tx.type)}
                          {tx.type.replace('-', ' ')}
                          </Badge>
                      </TableCell>
                      <TableCell>
                          {getTransactionAmount(tx)}
                      </TableCell>
                      <TableCell>{format(new Date(tx.createdAt), 'PPpp')}</TableCell>
                      </TableRow>
                  )})}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
