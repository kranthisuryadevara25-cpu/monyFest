
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Bell, Check, Users, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const notifications = [
    { id: 1, type: 'system', title: 'Your payout of ₹5,400 has been processed.', time: '2 hours ago', read: false, icon: Check },
    { id: 2, type: 'customer', title: 'New 5-star review from Ramu K.', time: '5 hours ago', read: false, icon: Star },
    { id: 3, type: 'system', title: 'Your offer "Free Pastry" was approved by the admin.', time: '1 day ago', read: true, icon: Check },
    { id: 4, type: 'customer', title: 'You have a new customer: Shathrugna M.', time: '2 days ago', read: true, icon: Users },
]

export default function NotificationsPage() {
    const [notifs, setNotifs] = React.useState(notifications);

    const unreadCount = notifs.filter(n => !n.read).length;

    const markAsRead = (id: number) => {
        setNotifs(notifs.map(n => n.id === id ? {...n, read: true} : n));
    }
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Notifications" />
       <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
            <div>
                <CardTitle>System & Customer Notifications</CardTitle>
                <CardDescription>You have {unreadCount} unread notifications.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setNotifs(notifs.map(n => ({...n, read: true})))}>Mark all as read</Button>
           </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
            {notifs.map(notif => (
                <div key={notif.id} className={cn("flex items-start gap-4 p-4 rounded-lg border", !notif.read && "bg-muted/50")}>
                    <div className="bg-background p-2 rounded-full border">
                        <notif.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.time}</p>
                    </div>
                    {!notif.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)}>Mark as read</Button>
                    )}
                </div>
            ))}
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
