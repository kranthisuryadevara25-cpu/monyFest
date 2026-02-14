
'use client';
/**
 * @file WalletPage
 * @description This page serves as the member's financial hub, displaying their cash balance and transaction history.
 *
 * @overview
 * The WalletPage provides a clear and concise overview of the member's wallet. It fetches and displays the user's
 * current withdrawable balance and a detailed log of all their cash-based transactions (excluding points).
 *
 * @features
 * - **Live Balance Display**: Fetches and shows the member's current wallet balance from their user profile in Firestore.
 * - **Transaction History**:
 *   - Retrieves all non-point-related transactions for the user from the `transactions` service.
 *   - Displays transactions in a table with details like description, merchant name, type, amount, and date.
 * - **Visual Indicators**: Uses badges and color-coding (green for credits, red for debits) to make the transaction list easy to scan.
 * - **Withdrawal Request**: Includes a "Request Withdrawal" button (currently non-functional) for future payout features.
 * - **Loading and Auth States**:
 *   - Shows a skeleton loader while fetching the user's financial data.
 *   - Displays an error message if the user's data cannot be loaded, prompting them to log in again.
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMerchantsClient } from '@/services/merchant-service.client';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import type { Transaction, User, Merchant } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { getUserByIdClient } from '@/services/user-service.client';
import { getTransactionsClient } from '@/services/transaction-service.client';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';

export default function WalletPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [member, setMember] = React.useState<User | null>(null);
  const [memberTransactions, setMemberTransactions] = React.useState<Transaction[]>([]);
  const [merchants, setMerchants] = React.useState<Map<string, Merchant>>(new Map());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMemberData = async () => {
        if (authLoading) {
            return; // Wait until auth state is resolved
        }
        if (authUser) {
            const [appUser, userTransactions, allMerchants] = await Promise.all([
              getUserByIdClient(authUser.uid),
              getTransactionsClient(authUser.uid),
              getMerchantsClient(),
            ]);

            setMember(appUser);
            if (userTransactions) {
              setMemberTransactions(
                userTransactions.filter(tx => !tx.type.startsWith('points-'))
              );
            }
            setMerchants(new Map(allMerchants.map(m => [m.merchantId, m])));
        }
        setLoading(false);
    };
    fetchMemberData();
  }, [authUser, authLoading]);

  if (loading) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Wallet" />
             <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                     <CardContent>
                        <Skeleton className="h-10 w-32" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent>
                       <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        </main>
    )
  }

  if (!member) {
    return (
         <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Wallet" />
            <Card>
                <CardContent className="p-8 text-center">
                    <p>Could not load user data. Please try logging in again.</p>
                </CardContent>
            </Card>
        </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Wallet" />
      <div className="grid gap-6">
          <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Wallet</CardTitle>
                    <CardDescription>Your current balance and transaction history.</CardDescription>
                  </div>
                  <div className="text-right">
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-3xl font-bold">₹{member.walletBalance.toFixed(2)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                  <Button>Request Withdrawal</Button>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
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
                              const isCredit = tx.type === 'credit' || tx.type === 'commission' || tx.type === 'purchase';
                              const merchant = merchants.get(tx.merchantId || '');
                              return (
                              <TableRow key={tx.id}>
                              <TableCell className="font-medium">{tx.description}</TableCell>
                              <TableCell>{merchant?.name || 'N/A'}</TableCell>
                              <TableCell>
                                  <Badge
                                  variant={isCredit ? 'secondary' : 'destructive'}
                                  className="capitalize"
                                  >
                                  {tx.type}
                                  </Badge>
                              </TableCell>
                              <TableCell className={`font-medium ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                  {isCredit ? '+' : '-'}₹{(tx.amount / 100).toFixed(2)}
                              </TableCell>
                              <TableCell>{format(new Date(tx.createdAt), 'PP')}</TableCell>
                              </TableRow>
                          )})}
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
      </div>
    </main>
  );
}
