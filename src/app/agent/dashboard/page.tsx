
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Building,
  Copy,
  Wallet,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Transaction, User, AgentDashboardData } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { getAgentDashboardData } from '@/services/data-service';
import { getUsersClient, getUserByIdClient } from '@/services/user-service.client';
import { getMerchantsClient } from '@/services/merchant-service.client';
import { getTransactionsClient } from '@/services/transaction-service.client';

export default function AgentDashboard() {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [data, setData] = React.useState<AgentDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (authUser) {
      const fetchData = async () => {
        setLoading(true);
        const [agent, allUsers, allMerchants, commissions] = await Promise.all([
          getUserByIdClient(authUser.uid),
          getUsersClient(),
          getMerchantsClient(),
          getTransactionsClient(authUser.uid, 5, ['commission']),
        ]);
        const agentData = await getAgentDashboardData(authUser.uid, {
          agent,
          allUsers,
          allMerchants,
          commissions,
        });
        setData(agentData);
        setLoading(false);
      };
      fetchData();
    }
  }, [authUser]);


  const copyToClipboard = () => {
    if (data?.agent?.agentCode) {
        navigator.clipboard.writeText(data.agent.agentCode);
        toast({
        title: 'Copied!',
        description: 'Agent code copied to clipboard.',
        });
    }
  }

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Agent Dashboard" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle><h2 className="text-sm font-medium">My Wallet</h2></CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-28 mb-1" />
                <Skeleton className="h-4 w-36" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle><h2 className="text-sm font-medium">My Agent Code</h2></CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 lg:col-span-2 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle><h2 className="text-sm font-medium">Recruited Members</h2></CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 <Skeleton className="h-7 w-12 mb-1" />
                 <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle><h2 className="text-sm font-medium">Recruited Merchants</h2></CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 <Skeleton className="h-7 w-12 mb-1" />
                 <Skeleton className="h-4 w-36" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  if (!data?.agent) {
    return (
       <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
         <Header pageTitle="Agent Dashboard" />
         <Card>
           <CardContent className="py-10 text-center">
             <p>Agent profile not found or not approved.</p>
           </CardContent>
         </Card>
       </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Agent Dashboard" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>
                <h2 className="text-sm font-medium">My Wallet</h2>
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{data.agent.walletBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total commissions earned
              </p>
              <Button size="sm" className="mt-4">
                Request Payout
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                <h2 className="text-sm font-medium">My Agent Code</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Share this code with merchants and members you recruit.</p>
                <div className="flex items-center space-x-2">
                    <div className="flex-1 truncate rounded-md border bg-muted px-3 py-2 text-sm font-bold text-muted-foreground">
                        {data.agent.agentCode}
                    </div>
                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy Agent Code</span>
                    </Button>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:col-span-2 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>
                  <h2 className="text-sm font-medium">Recruited Members</h2>
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{data.recruitedMembersCount}</div>
                <p className="text-xs text-muted-foreground">
                  New members onboarded
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>
                  <h2 className="text-sm font-medium">Recruited Merchants</h2>
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{data.recruitedMerchantsCount}</div>
                <p className="text-xs text-muted-foreground">
                  New businesses onboarded
                </p>
              </CardContent>
            </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-lg font-semibold">Recent Commissions</h2>
          </CardTitle>
          <CardDescription>
            A log of your recent commission earnings.
          </CardDescription>
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
              {data.recentCommissions.length > 0 ? data.recentCommissions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.description}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    +₹{(tx.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>{format(tx.createdAt, 'PP')}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">No recent commissions.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
