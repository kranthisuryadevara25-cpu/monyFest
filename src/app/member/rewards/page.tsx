
'use client';
/**
 * @file RewardsPage
 * @description This page displays all available loyalty offers that a member can redeem using their points.
 *
 * @overview
 * The RewardsPage is the central marketplace for loyalty redemptions. It fetches all active offers from the database
 * and displays them in a grid. It also shows the member's current points balance, allowing them to see what they can afford.
 * Members can redeem an offer, which will then create a new coupon in their "My Coupons" section.
 *
 * @features
 * - **Displays Points Balance**: Clearly shows the member's current loyalty points balance at the top of the page.
 * - **Fetches Live Offers**: Retrieves all 'active' offers from the `offers` service.
 * - **Offer Grid**: Presents each offer in a card with:
 *   - The merchant's logo and name.
 *   - The offer title and description.
 *   - The cost in loyalty points.
 * - **Redemption Flow**:
 *   - A "Redeem" button is available on each offer card.
 *   - The button is disabled if the member does not have enough points.
 *   - Clicking "Redeem" opens a confirmation dialog to prevent accidental redemptions.
 * - **Coupon Creation**: Upon successful redemption, the system:
 *   - Calls the `createUserCoupon` service to create a new, active coupon for the member.
 *   - Simulates the deduction of points from the user's balance on the client-side for immediate feedback.
 *   - Shows a success toast notification, directing the user to the "My Coupons" page.
 * - **Error Handling**: Provides user-friendly toast notifications for failed redemptions (e.g., insufficient points).
 * - **Loading State**: Displays skeleton loaders while fetching initial data.
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Gift, Star } from "lucide-react";
import { Header } from "@/components/layout/header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Offer, User, UserCoupon } from '@/lib/types';
import { add } from "date-fns";
import { useAuth } from '@/lib/auth';
import { getUserByIdClient } from '@/services/user-service.client';
import { getOffersClient } from '@/services/offer-service.client';
import { createUserCoupon } from '@/services/user-coupon-service';
import { redeemPoints } from '@/services/points-service';
import { Skeleton } from '@/components/ui/skeleton';
import { FirestorePermissionError } from '@/lib/errors';
import { errorEmitter } from '@/lib/error-emitter';


export default function RewardsPage() {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [member, setMember] = React.useState<User | null>(null);
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
        if (!authUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const [userProfile, activeOffers] = await Promise.all([
            getUserByIdClient(authUser.uid),
            getOffersClient('active')
        ]);
        setMember(userProfile);
        setOffers(activeOffers);
        setLoading(false);
    }
    fetchData();
  }, [authUser]);


  const handleRedeem = async (offer: Offer) => {
    if (!member || !offer.points || (member.pointsBalance || 0) < offer.points) {
      toast({
        variant: 'destructive',
        title: 'Redemption Failed',
        description: 'You do not have enough points for this offer.',
      });
      return;
    }

    const pointsToDeduct = offer.points ?? 0;
    try {
      const redeem = await redeemPoints({
        userId: member.uid,
        points: pointsToDeduct,
        description: `Redeemed: ${offer.title}`,
      });
      if (!redeem.success) {
        toast({
          variant: 'destructive',
          title: 'Redemption Failed',
          description: redeem.error ?? 'Could not deduct points.',
        });
        return;
      }

      const couponData: Omit<UserCoupon, 'userCouponId'> = {
        userId: member.uid,
        title: offer.title,
        category: offer.merchantName,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        expiryDate: add(new Date(), { days: 30 }),
        status: 'active',
      };
      await createUserCoupon(couponData);

      setMember(prev => prev ? { ...prev, pointsBalance: (prev.pointsBalance || 0) - pointsToDeduct } : null);
      toast({
        title: 'Redemption Successful!',
        description: `You have redeemed "${offer.title}". It's now available in "My Coupons".`,
      });
    } catch (error: unknown) {
      if (!(error instanceof FirestorePermissionError)) {
        toast({
          variant: 'destructive',
          title: 'Redemption Failed',
          description: error instanceof Error ? error.message : 'Could not redeem the offer.',
        });
      }
    }
  };
  
  if (loading) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Rewards" />
             <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({length: 3}).map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </div>
        </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Rewards" />
      <div className="space-y-6">
          <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                      <CardTitle>Rewards & Offers</CardTitle>
                      <CardDescription>All available loyalty rewards and special offers from our merchants.</CardDescription>
                  </div>
                  <div className="text-right">
                      <p className="text-sm text-muted-foreground">My Points Balance</p>
                      <div className="text-2xl font-bold flex items-center justify-end gap-2 text-secondary-foreground font-mono">
                          <Star className="h-6 w-6 fill-secondary" />
                          <span>{(member?.pointsBalance || 0).toLocaleString()}</span>
                      </div>
                  </div>
                </div>
              </CardHeader>
          </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map(offer => (
              <div key={offer.offerId} className="rounded-lg border bg-card text-card-foreground shadow-lg flex flex-col">
                  <div className="p-4 flex items-start gap-4">
                      <Image
                          src={offer.merchantLogo}
                          alt={`${offer.merchantName} logo`}
                          width={48}
                          height={48}
                          className="rounded-lg"
                          data-ai-hint="company logo"
                      />
                      <div className="flex-1">
                          <h3 className="font-semibold">{offer.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{offer.merchantName}</p>
                      </div>
                  </div>
                  <div className="p-4 pt-0 flex-grow flex flex-col">
                      <p className="text-sm text-muted-foreground line-clamp-2 h-10 flex-grow">{offer.description}</p>
                      <div className="flex justify-between items-center mt-4">
                          <div className="font-bold flex items-center gap-1 text-secondary-foreground font-mono">
                              <Star className="h-5 w-5 fill-secondary" />
                              {offer.points} PTS
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="default" size="sm" disabled={(member?.pointsBalance || 0) < (offer.points || 0)}>
                                  <Gift className="mr-2 h-4 w-4" />
                                  Redeem
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to redeem "{offer.title}" for {offer.points} points? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRedeem(offer)}>Confirm & Redeem</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </div>
                  </div>
              </div>
          ))}
        </div>
      </div>
    </main>
  );
}

    