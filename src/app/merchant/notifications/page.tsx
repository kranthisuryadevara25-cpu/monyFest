'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Users, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth';
import { getUserById } from '@/services/user-service';
import { listNotificationsForMerchant, markNotificationRead, markAllNotificationsReadForMerchant } from '@/services/notification-service';
import type { MerchantNotification } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const iconByType = { system: Check, customer: Users, offer: Star };

export default function NotificationsPage() {
  const { user: authUser } = useAuth();
  const [merchantId, setMerchantId] = React.useState<string | null>(null);
  const [notifs, setNotifs] = React.useState<MerchantNotification[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!authUser) return;
    const user = await getUserById(authUser.uid);
    const mid = user?.merchantId ?? authUser.uid;
    setMerchantId(mid);
    const list = await listNotificationsForMerchant(mid);
    setNotifs(list);
  }, [authUser]);

  React.useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (_) {}
  };

  const markAllRead = async () => {
    if (!merchantId) return;
    try {
      await markAllNotificationsReadForMerchant(merchantId);
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (_) {}
  };

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Notifications" />
        <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Notifications" />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System & Customer Notifications</CardTitle>
              <CardDescription>You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}.</CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllRead}>Mark all as read</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No notifications yet.</p>
              </div>
            ) : (
              notifs.map((notif) => {
                const Icon = iconByType[notif.type] ?? Bell;
                return (
                  <div
                    key={notif.id}
                    className={cn('flex items-start gap-4 p-4 rounded-lg border', !notif.read && 'bg-muted/50')}
                  >
                    <div className="bg-background p-2 rounded-full border">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(notif.createdAt, { addSuffix: true })}</p>
                    </div>
                    {!notif.read && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)}>Mark as read</Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
