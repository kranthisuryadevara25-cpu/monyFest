

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
import { Badge } from '@/components/ui/badge';
import {
  Tag,
  Users,
  Briefcase,
  PlusCircle,
  BadgePercent,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { MonyFestWordmark } from '@/components/MonyFestLogo';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { Offer, Transaction, User, Merchant, MerchantDashboardData } from '@/lib/types';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { getMerchantDashboardData } from '@/services/data-service';
import { getUserByIdClient, getUsersClient } from '@/services/user-service.client';
import { getMerchantsClient } from '@/services/merchant-service.client';
import { getOffersClient } from '@/services/offer-service.client';
import { getTransactionsClient } from '@/services/transaction-service.client';

export default function MerchantDashboard() {
  const { user: authUser } = useAuth();
  const [data, setData] = React.useState<MerchantDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (authUser) {
      const fetchData = async () => {
        setLoading(true);
        const [merchantUser, allUsers, allMerchants, allOffers, allTransactions] = await Promise.all([
          getUserByIdClient(authUser.uid),
          getUsersClient(),
          getMerchantsClient(),
          getOffersClient(),
          getTransactionsClient(),
        ]);
        const dashboardData = await getMerchantDashboardData(authUser.uid, {
          merchantUser,
          allUsers,
          allMerchants,
          allOffers,
          allTransactions,
        });
        setData(dashboardData);
        setLoading(false);
      };
      fetchData();
    }
  }, [authUser]);

  if (loading) {
    return (
       <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Dashboard" />
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {Array.from({length: 4}).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-7 w-16 mb-1" />
                        <Skeleton className="h-3 w-32" />
                    </CardContent>
                </Card>
            ))}
        </div>
      </main>
    )
  }

  if (!data?.merchant) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Dashboard" />
            <Card>
                <CardContent className="p-6">
                    <p>Merchant profile not found. Please complete your onboarding or contact support.</p>
                </CardContent>
            </Card>
        </main>
    );
  }
  
  const { merchant, agent, merchantOffers } = data;
  const minWithdrawalThreshold = 555; // This would come from config
  const boostBalance = merchant.boostBalance || 0;
  const progress = (boostBalance / minWithdrawalThreshold) * 100;
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle={`${merchant.name} Dashboard`} />
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>
              <h2 className="text-sm font-medium"><MonyFestWordmark className="text-sm" onLightBackground /> Boost Balance</h2>
            </CardTitle>
            <BadgePercent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{boostBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ₹{(minWithdrawalThreshold - boostBalance).toFixed(2)} more to unlock withdrawal
            </p>
             <Progress value={progress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>
              <h2 className="text-sm font-medium">Active Offers</h2>
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{merchantOffers.filter(o => o.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>
              <h2 className="text-sm font-medium">Total Redemptions</h2>
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,234</div>
            <p className="text-xs text-muted-foreground">
              +10% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>
              <h2 className="text-sm font-medium">Linked Agent</h2>
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{agent?.name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {agent?.email || ''}
            </p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  <h2 className="text-lg font-semibold">My Offers</h2>
                </CardTitle>
                <CardDescription>
                  A quick look at your most recent offers and their status.
                </CardDescription>
              </div>
               <Button asChild>
                <Link href="/merchant/coupons/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Offer
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchantOffers.slice(0, 5).map((offer: Offer) => (
                  <TableRow key={offer.offerId}>
                    <TableCell className="font-medium">{offer.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          offer.status === 'active'
                            ? 'secondary'
                            : offer.status === 'pending'
                            ? 'outline'
                            : 'destructive'
                        }
                        className="capitalize"
                      >
                        {offer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{offer.points}</TableCell>
                    <TableCell>
                      {format(new Date(offer.expiryDate), 'PP')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
