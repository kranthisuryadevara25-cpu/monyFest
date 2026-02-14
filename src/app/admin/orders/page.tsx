'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Transaction, User, Merchant } from '@/lib/types';
import { getAdminOrdersPageData } from '@/services/data-service';
import { getUsersClient } from '@/services/user-service.client';
import { getMerchantsClient } from '@/services/merchant-service.client';
import { getTransactionsClient } from '@/services/transaction-service.client';
import { OrderList } from './_components/order-list';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<Transaction[]>([]);
  const [userMap, setUserMap] = React.useState<Map<string, User>>(new Map());
  const [merchantMap, setMerchantMap] = React.useState<Map<string, Merchant>>(new Map());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [transactions, users, merchants] = await Promise.all([
        getTransactionsClient(),
        getUsersClient(),
        getMerchantsClient(),
      ]);
      const { orders: o, userMap: u, merchantMap: m } = await getAdminOrdersPageData(transactions, users, merchants);
      setOrders(o);
      setUserMap(u);
      setMerchantMap(m);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Order Management" />
        <div className="container mx-auto py-4">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Order Management" />
      <div className="container mx-auto py-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>
                  Manage and track all customer orders. Found {orders.length} orders.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <OrderList
              initialOrders={orders}
              initialUserMap={userMap}
              initialMerchantMap={merchantMap}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
