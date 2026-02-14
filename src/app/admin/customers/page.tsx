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
import { getAdminCustomersPageData } from '@/services/data-service';
import { getUsersClient } from '@/services/user-service.client';
import { CustomerList } from './_components/customer-list';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/types';

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<User[]>([]);
  const [userMap, setUserMap] = React.useState<Map<string, User>>(new Map());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const allUsers = await getUsersClient();
      const { customers: c, userMap: m } = await getAdminCustomersPageData(allUsers);
      setCustomers(c);
      setUserMap(m);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Customer Management" />
        <div className="container mx-auto py-4">
          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
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
      <Header pageTitle="Customer Management" />
      <div className="container mx-auto py-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customers</CardTitle>
                <CardDescription>
                  Manage and view analytics for all platform members. Found {customers.length} members.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CustomerList initialCustomers={customers} userMap={userMap} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
