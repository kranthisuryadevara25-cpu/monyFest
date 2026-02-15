'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { useAuth } from '@/lib/auth';
import { getUserByIdClient } from '@/services/user-service.client';
import { listVoiceOrdersByMerchantClient } from '@/services/voice-order-service.client';
import { getTransactionsByMerchantIdClient } from '@/services/transaction-service.client';
import { subMinutes } from 'date-fns';

export default function RealtimeDashboardPage() {
  const { user: authUser } = useAuth();
  const [merchantId, setMerchantId] = React.useState<string | null>(null);
  const [voiceOrderCount, setVoiceOrderCount] = React.useState(0);
  const [recentTxCount, setRecentTxCount] = React.useState(0);
  const [recentRevenue, setRecentRevenue] = React.useState(0);
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
      const [orders, txs] = await Promise.all([
        listVoiceOrdersByMerchantClient(mid, 20),
        getTransactionsByMerchantIdClient(mid, 100),
      ]);
      if (cancelled) return;
      const fiveMinAgo = subMinutes(new Date(), 5);
      const recentTxs = txs.filter((t) => new Date(t.createdAt) >= fiveMinAgo && t.type === 'purchase');
      const recentOrders = orders.filter((o) => new Date(o.createdAt) >= fiveMinAgo);
      setVoiceOrderCount(recentOrders.length);
      setRecentTxCount(recentTxs.length);
      setRecentRevenue(recentTxs.reduce((acc, t) => acc + (t.amount || 0), 0) / 100);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [authUser]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Real-time Dashboard" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-red-500 animate-pulse" /> Live Business Monitoring
          </CardTitle>
          <CardDescription>Activity in the last 5 minutes. Data refreshes from your store.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voice Orders (5 min)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{loading ? '—' : voiceOrderCount}</div>
              <p className="text-xs text-muted-foreground">New voice orders received</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders (5 min)</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{loading ? '—' : recentTxCount}</div>
              <p className="text-xs text-muted-foreground">Purchase transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue (5 min)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{loading ? '—' : `₹${recentRevenue.toFixed(0)}`}</div>
              <p className="text-xs text-muted-foreground">From recent transactions</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </main>
  );
}
