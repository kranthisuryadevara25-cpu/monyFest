
'use client';
/**
 * @file MyCouponsPage
 * @description This page displays all the coupons a member has acquired, separating them into active and used/expired tabs.
 *
 * @overview
 * MyCouponsPage is the central hub for a member to view and manage their coupons. It fetches all coupons associated
 * with the logged-in user and categorizes them. Active coupons can be redeemed by showing a QR code to a merchant.
 * The page handles client-side logic to determine if a coupon is expired.
 *
 * @features
 * - **Tabbed Interface**: Separates coupons into "Active" and "Used & Expired" tabs for clear organization.
 * - **Fetches Live Data**: Retrieves all coupons for the current user from the `userCoupons` service.
 * - **Client-Side Expiry Check**: Determines if an 'active' coupon is past its expiry date and categorizes it accordingly.
 * - **Coupon Card Display**: Each coupon is shown on a card with:
 *   - Title and category.
 *   - A clear status badge (Active, Redeemed, Expired).
 *   - The coupon's value (e.g., "₹100.00" or "20% Off").
 *   - The expiry date.
 * - **QR Code Redemption**: For active coupons, a button opens a dialog to display a (placeholder) QR code for in-store redemption.
 * - **Empty States**: Provides user-friendly messages and calls-to-action when there are no coupons in a given category.
 * - **Hydration Error Prevention**: Uses a `useEffect` hook to manage date-sensitive logic, preventing server-client rendering mismatches.
 */

import * as React from 'react';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, QrCode, XCircle, CheckCircle, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import type { UserCoupon } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

const CouponCard = ({ coupon }: { coupon: UserCoupon }) => {
  const [isExpired, setIsExpired] = React.useState(false);

  React.useEffect(() => {
    setIsExpired(new Date() > coupon.expiryDate);
  }, [coupon.expiryDate]);

  const status = isExpired ? 'expired' : coupon.status;
  
  const statusConfig = {
    active: { icon: CheckCircle, color: 'text-green-500', label: 'Active' },
    redeemed: { icon: CheckCircle, color: 'text-blue-500', label: 'Redeemed' },
    expired: { icon: XCircle, color: 'text-red-500', label: 'Expired' },
  };
  
  const CurrentStatusIcon = statusConfig[status].icon;

  const getCouponValue = (coupon: UserCoupon) => {
    if (coupon.discountType === 'fixed') {
        return `Value: ₹${(coupon.discountValue / 100).toFixed(2)}`;
    }
    return `Value: ${coupon.discountValue}% Off`;
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{coupon.title}</CardTitle>
          <Badge variant={status === 'expired' ? 'destructive' : 'secondary'} className="capitalize">
              <CurrentStatusIcon className="mr-1 h-3 w-3" />
              {statusConfig[status].label}
          </Badge>
        </div>
        <CardDescription>{coupon.category}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="border-t border-dashed pt-4">
            <p className="text-2xl font-bold text-center text-primary">
                {getCouponValue(coupon)}
            </p>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Expires: {format(coupon.expiryDate, 'PPP')}
        </p>
      </CardContent>
      <div className="p-4 pt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" disabled={status !== 'active'}>
              <QrCode className="mr-2 h-4 w-4" />
              Show QR Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redemption Code</DialogTitle>
              <DialogDescription>
                Present this QR code to the merchant to redeem your coupon.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center p-8">
              {/* In a real app, this would generate a QR code from the userCouponId */}
              <div className="bg-muted w-48 h-48 flex items-center justify-center">
                <p>QR Placeholder</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

export default function MyCouponsPage() {
  const { user: authUser } = useAuth();
  const [allCoupons, setAllCoupons] = React.useState<UserCoupon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeCoupons, setActiveCoupons] = React.useState<UserCoupon[]>([]);
  const [usedCoupons, setUsedCoupons] = React.useState<UserCoupon[]>([]);
  
  React.useEffect(() => {
    const fetchCoupons = async () => {
        if (!authUser) {
            setLoading(false);
            return;
        }
        if (!isFirebaseConfigured) {
            setAllCoupons([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const couponsCol = collection(db, 'userCoupons');
        const q = query(couponsCol, where('userId', '==', authUser.uid));
        
        try {
            const snapshot = await getDocs(q);
            const fetchedCoupons = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    userCouponId: doc.id,
                    expiryDate: (data.expiryDate as Timestamp).toDate(),
                } as UserCoupon;
            });
            setAllCoupons(fetchedCoupons);
        } catch (serverError: any) {
             if (serverError.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: couponsCol.path,
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
            }
            console.error("Error fetching coupons:", serverError.message);
        } finally {
            setLoading(false);
        }
    }
    fetchCoupons();
  }, [authUser]);

  React.useEffect(() => {
    // This logic is safe because it only runs on the client after mount.
    const now = new Date();
    setActiveCoupons(allCoupons.filter(c => c.status === 'active' && now < c.expiryDate));
    setUsedCoupons(allCoupons.filter(c => c.status !== 'active' || now >= c.expiryDate));
  }, [allCoupons]);


  if (loading) {
      return (
          <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
              <Header pageTitle="My Coupons" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
              </div>
          </main>
      )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="My Coupons" />
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active ({activeCoupons.length})</TabsTrigger>
          <TabsTrigger value="used">Used & Expired ({usedCoupons.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
            {activeCoupons.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeCoupons.map(coupon => (
                        <CouponCard key={coupon.userCouponId} coupon={coupon} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Active Coupons</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Redeem offers from the Rewards page to get coupons.
                        </p>
                        <Button className="mt-4" asChild>
                            <Link href="/member/rewards">Go to Rewards</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
        <TabsContent value="used">
             {usedCoupons.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {usedCoupons.map(coupon => (
                        <CouponCard key={coupon.userCouponId} coupon={coupon} />
                    ))}
                </div>
            ) : (
                 <Card>
                    <CardContent className="py-16 text-center">
                        <Info className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No History</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                           Your used and expired coupons will appear here.
                        </p>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

    