
'use client';
/**
 * @file ReferralsPage
 * @description This page allows members to manage their referral network, view their referral code, and track commissions earned.
 *
 * @overview
 * The ReferralsPage is the central hub for the platform's multi-level marketing (MLM) feature. It provides users with the tools
 * to grow their network and visualizes the structure and earnings from their downline. It fetches and processes data for the current user,
 * all other users, and all transactions to build a complete picture of the referral system.
 *
 * @features
 * - **Referral Code Sharing**:
 *   - Displays the user's unique referral code.
 *   - Provides a "Copy" button to easily copy the code to the clipboard.
 *   - Includes a "Share" button for future social sharing functionality.
 * - **Total Commission Tracking**: Shows a card with the total commissions earned from all levels of the referral network.
 * - **Commission History**: A table lists all individual commission transactions earned by the user, with descriptions, amounts, and dates.
 * - **Network Visualization**:
 *   - A recursive function builds a tree structure of the user's downline (up to 3 levels).
 *   - The network is displayed in a table where indentation represents the referral level.
 *   - Each row shows the referred user's details, their level in the network, and the total commission they have generated for the current user.
 * - **Live Data Integration**: Fetches all necessary data from Firestore to provide an accurate, real-time view of the network.
 */
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Users, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { User, Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getTransactionsClient } from '@/services/transaction-service.client';
import { getUsersClient } from '@/services/user-service.client';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to build the network tree
const buildNetwork = (userId: string, allUsers: User[], level = 0): (User & { level: number, children: any[] })[] => {
  if (level >= 3) return []; // Stop at level 3
  const children = allUsers.filter(u => u.referredBy === userId);
  if (!children.length) return [];
  
  return children.map(child => ({
    ...child,
    level,
    children: buildNetwork(child.uid, allUsers, level + 1),
  }));
};

const ReferralRow = ({ user, level, allTransactions, currentUserId }: { user: User & { level: number }, level: number, allTransactions: Transaction[], currentUserId: string }) => {
  // Sum commissions for the current user that were sourced from this downline user's signup
  const commissions = allTransactions.filter(tx => tx.userId === currentUserId && tx.sourceId === user.uid && tx.type === 'commission').reduce((acc, tx) => acc + tx.amount, 0);

  return (
    <TableRow>
      <TableCell style={{ paddingLeft: `${level * 1.5}rem` }}>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline">Level {level + 1}</Badge>
      </TableCell>
      <TableCell className="text-right font-medium">
        ₹{(commissions / 100).toFixed(2)}
      </TableCell>
    </TableRow>
  );
};

const NetworkTable = ({ network, allTransactions, currentUserId }: { network: (User & { level: number, children: any[] })[], allTransactions: Transaction[], currentUserId: string }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead className="text-center">Level</TableHead>
          <TableHead className="text-right">Commissions Earned For You</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {network.length > 0 ? (
          network.flatMap(function renderUser(user): React.ReactNode[] {
            return [
              <ReferralRow key={user.uid} user={user} level={user.level} allTransactions={allTransactions} currentUserId={currentUserId}/>,
              ...(user.children || []).flatMap(renderUser)
            ];
          })
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center h-24">No referrals yet. Share your code to start building your network!</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};


export default function ReferralsPage() {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [allTransactions, setAllTransactions] = React.useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
        if (authUser) {
            setLoading(true);
            const [transactions, users] = await Promise.all([getTransactionsClient(), getUsersClient()]);
            setAllTransactions(transactions);
            setAllUsers(users);
            const userProfile = users.find(u => u.uid === authUser.uid);
            if (userProfile) {
                setCurrentUser(userProfile);
            }
            setLoading(false);
        }
    }
    fetchData();
  }, [authUser]);

  if (loading) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Referrals" />
            <Skeleton className="h-96 w-full" />
        </main>
    )
  }

  if (!currentUser) {
    return <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8"><Header pageTitle="Referrals" /><p>Loading user data...</p></main>;
  }

  const referralNetwork = buildNetwork(currentUser.uid, allUsers, 0);

  const allCommissions = allTransactions
    .filter(tx => tx.userId === currentUser.uid && tx.type === 'commission');

  const totalCommissions = allCommissions.reduce((acc, tx) => acc + tx.amount, 0);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUser.referralCode || '');
    toast({
      title: 'Copied!',
      description: 'Referral code copied to clipboard.',
    });
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Referrals" />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Referral Network</CardTitle>
            <CardDescription>Invite friends and earn commissions from their purchases, up to 3 levels deep.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-2">Share your unique referral code:</p>
                  <div className="flex items-center space-x-2">
                      <div className="flex-1 truncate rounded-md border bg-muted px-3 py-2 text-sm font-bold text-primary">
                          {currentUser.referralCode}
                      </div>
                      <Button variant="outline" size="icon" onClick={copyToClipboard}>
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy Referral Code</span>
                      </Button>
                      <Button size="icon">
                          <Share2 className="h-4 w-4" />
                          <span className="sr-only">Share</span>
                      </Button>
                  </div>
              </div>
              <Card className="bg-muted/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                          Total Referral Commissions
                      </CardTitle>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">₹{(totalCommissions / 100).toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">From all levels in your network</p>
                  </CardContent>
              </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission Income History</CardTitle>
            <CardDescription>A detailed log of all commissions you've earned.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCommissions.length > 0 ? (
                  allCommissions.map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.description}</TableCell>
                      <TableCell className="font-medium text-green-600">+₹{(tx.amount / 100).toFixed(2)}</TableCell>
                      <TableCell>{format(tx.createdAt, 'PPpp')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">No commissions earned yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Network Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkTable network={referralNetwork} allTransactions={allTransactions} currentUserId={currentUser.uid} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
