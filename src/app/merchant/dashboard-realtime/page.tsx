
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Users, ShoppingCart, TrendingUp } from "lucide-react";

export default function RealtimeDashboardPage() {
  const [activeUsers, setActiveUsers] = React.useState(573);
  const [liveOrders, setLiveOrders] = React.useState(21);

  React.useEffect(() => {
    const userInterval = setInterval(() => {
        setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 2000);
    const orderInterval = setInterval(() => {
        setLiveOrders(prev => prev + (Math.random() > 0.8 ? 1 : 0));
    }, 5000);

    return () => {
      clearInterval(userInterval);
      clearInterval(orderInterval);
    }
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Real-time Dashboard" />
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-6 w-6 text-red-500 animate-pulse" /> Live Business Monitoring</CardTitle>
          <CardDescription>Monitor your business activity as it happens.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Users Active Now
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{activeUsers}</div>
                    <p className="text-xs text-muted-foreground">
                    Viewing your offers and products
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Live Orders
                    </CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{liveOrders}</div>
                    <p className="text-xs text-muted-foreground">
                    In the last 5 minutes
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Sales Per Minute
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">₹1,280</div>
                    <p className="text-xs text-muted-foreground">
                    Based on recent transaction velocity
                    </p>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
    </main>
  );
}
