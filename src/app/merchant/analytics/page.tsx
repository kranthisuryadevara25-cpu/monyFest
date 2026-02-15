'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2, Users, Receipt, Star } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/lib/auth';
import { getUserByIdClient } from '@/services/user-service.client';
import { getTransactionsByMerchantIdClient } from '@/services/transaction-service.client';
import type { Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subMonths, startOfMonth, isWithinInterval } from 'date-fns';

const chartConfig = {
  redemptions: {
    label: "Redemptions",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function useMerchantAnalytics() {
  const { user: authUser } = useAuth();
  const [merchantId, setMerchantId] = React.useState<string | null>(null);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const user = await getUserByIdClient(authUser.uid);
      const mid = user?.merchantId ?? authUser.uid;
      if (cancelled) return;
      setMerchantId(mid);
      const txs = await getTransactionsByMerchantIdClient(mid, 500);
      if (cancelled) return;
      setTransactions(txs);
    })().finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authUser]);

  const purchaseTxs = transactions.filter((t) => t.type === 'purchase');
  const redemptionTxs = transactions.filter((t) => t.type === 'points-redeemed' || t.type === 'purchase');
  const totalRevenuePaise = purchaseTxs.reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalRevenue = totalRevenuePaise / 100;
  const totalOrders = purchaseTxs.length;
  const offersRedeemed = redemptionTxs.length;
  const uniqueUserIds = React.useMemo(() => new Set(transactions.map((t) => t.userId)).size, [transactions]);

  const last6Months = React.useMemo(() => {
    const now = new Date();
    const months: { month: string; redemptions: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = startOfMonth(subMonths(now, i));
      const end = startOfMonth(subMonths(now, i - 1));
      const count = redemptionTxs.filter((t) =>
        isWithinInterval(new Date(t.createdAt), { start, end })
      ).length;
      months.push({ month: format(start, 'MMMM'), redemptions: count });
    }
    return months;
  }, [redemptionTxs]);

  return {
    loading,
    merchantId,
    totalRevenue,
    uniqueCustomers: uniqueUserIds,
    totalOrders,
    offersRedeemed,
    chartData: last6Months,
  };
}

export default function AnalyticsPage() {
  const { loading, totalRevenue, uniqueCustomers, totalOrders, offersRedeemed, chartData } = useMerchantAnalytics();

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Business Analytics" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-20" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="pt-6"><Skeleton className="h-[200px] w-full" /></CardContent></Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Business Analytics" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">From your transaction history</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">Users with transactions at your store</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Purchase transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Redeemed</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offersRedeemed}</div>
            <p className="text-xs text-muted-foreground">Coupon / points redemptions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Offer Redemptions Over Time</CardTitle>
          <CardDescription>A look at how many customers are redeeming your loyalty offers each month.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(v) => v.slice(0, 3)} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="redemptions" fill="var(--color-redemptions)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </main>
  );
}
