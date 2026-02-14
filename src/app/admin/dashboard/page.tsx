
'use client';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
  Users,
  Building,
  CircleDollarSign,
  Activity,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import type { User, Transaction, DashboardData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardData } from '@/services/data-service';
import { getUsersClient } from '@/services/user-service.client';
import { getMerchantsClient } from '@/services/merchant-service.client';
import { getTransactionsClient } from '@/services/transaction-service.client';

export default function Dashboard() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [merchants, transactions, users] = await Promise.all([
          getMerchantsClient(),
          getTransactionsClient(undefined, 5),
          getUsersClient(),
        ]);
        const dashboardData = await getDashboardData({ merchants, transactions, users });
        setData(dashboardData);
      } catch (error) {
        console.error('Could not fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderSkeletonCard = (key: number) => (
     <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
  )

  if (loading || !data) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Dashboard" />
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
               {Array.from({ length: 4 }).map((_, i) => renderSkeletonCard(i))}
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>A log of the most recent financial activities on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Merchant</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                     <TableBody>
                        {Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={`skel-tx-${i}`}>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
        </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{(data.totalRevenue / 100).toFixed(2)}</div>
            <p className="text-xs text-white/70">Based on all successful purchases</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
            <Users className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+{data.totalUsers}</div>
            <p className="text-xs text-white/70">All user roles included</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Merchants</CardTitle>
            <Building className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+{data.totalMerchants}</div>
            <p className="text-xs text-white/70">+1 since last hour</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+573</div>
            <p className="text-xs text-white/70">Users currently online</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="section-title text-white">Recent Transactions</CardTitle>
            <CardDescription className="text-white/70">
              A log of the most recent financial activities on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-white">
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/90">User</TableHead>
                  <TableHead className="text-white/90">Type</TableHead>
                  <TableHead className="text-white/90">Merchant</TableHead>
                  <TableHead className="text-white/90">Amount</TableHead>
                  <TableHead className="text-white/90">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentTransactions.map((tx) => {
                  return (
                    <TableRow key={tx.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-white">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={tx.user?.avatarUrl} alt={tx.user?.name} data-ai-hint="person portrait"/>
                                <AvatarFallback>{tx.user?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-white">{tx.user?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <Badge
                          variant={tx.type === 'purchase' ? 'secondary' : 'destructive'}
                          className="capitalize border-white/20"
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/90">{tx.merchant?.name || 'N/A'}</TableCell>
                      <TableCell className="font-medium text-white">₹{(tx.amount / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-white/80">{format(tx.createdAt, 'PPpp')}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
