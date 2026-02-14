
'use client';
/**
 * @file MemberHomepage
 * @description The main landing page for logged-in members, serving as a central hub for platform activity.
 *
 * @overview
 * This page provides a personalized dashboard for members, aggregating various pieces of information to give them a complete
 * overview of their status and available activities. It is designed to be engaging and informative, encouraging users to explore the platform.
 * It fetches all its data from the `getMemberHomepageData` service.
 *
 * @features
 * - **Advertisements**: Displays targeted advertisements.
 *   - A main banner ad and smaller secondary ads.
 *   - A scrolling text marquee for urgent or special announcements.
 *   - Ads are targeted based on the member's location.
 * - **Welcome Coupons Carousel**: Shows a carousel of the member's available welcome coupons, encouraging immediate engagement.
 * - **Available Offers**: Showcases a few of the latest loyalty offers available for redemption, with a link to the main Rewards page.
 * - **Campaigns Section**: Highlights active campaigns, prompting users to participate in challenges for bigger rewards.
 * - **Recent Activity**: A table displaying the member's most recent transactions (both cash and points) to provide a quick financial overview.
 * - **Responsive Design**: Adapts its layout for a seamless experience on both desktop and mobile devices.
 * - **Loading Skeletons**: Shows a structured skeleton UI while data is being fetched to improve perceived performance.
 */

import * as React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Gift, ArrowRight, Target, Ticket } from 'lucide-react';
import { mockAdvertisements } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Transaction, User, Offer, MemberHomepageData, BundleOffer, UserCoupon } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';
import { getMemberHomepageData } from '@/services/data-service';
import { getBundleOffersClient } from '@/services/bundle-offer-service.client';
import { getOffersClient } from '@/services/offer-service.client';
import { getUserByIdClient } from '@/services/user-service.client';
import { getTransactionsClient } from '@/services/transaction-service.client';
import { getUserCouponsClient } from '@/services/user-coupon-service.client';
import { format } from 'date-fns';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const ScrollingText = ({ ads }: { ads: any[] }) => {
  if (ads.length === 0) return null;
  const scrollingAds = [...ads, ...ads]; // Duplicate ads for seamless loop
  return (
    <div className="relative flex overflow-hidden rounded-xl border border-white/10 bg-white/5 py-2.5 backdrop-blur-sm">
      <div className="animate-marquee whitespace-nowrap text-white/90">
        {scrollingAds.map((ad, index) => (
          <Link href={ad.link} key={`marquee1-${index}`} className="mx-4 text-sm font-medium hover:text-white transition-colors">
            {ad.content}
          </Link>
        ))}
      </div>
      <div className="absolute top-0 animate-marquee2 whitespace-nowrap text-white/90">
        {scrollingAds.map((ad, index) => (
          <Link href={ad.link} key={`marquee2-${index}`} className="mx-4 text-sm font-medium hover:text-white transition-colors">
            {ad.content}
          </Link>
        ))}
      </div>
    </div>
  );
};


export default function MemberHomepage() {
  const { user: authUser } = useAuth();
  const [data, setData] = React.useState<MemberHomepageData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMemberData = async () => {
        if (!authUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const [activeCampaigns, activeOffers, appUser, userTransactions, coupons] = await Promise.all([
            getBundleOffersClient('active'),
            getOffersClient('active', 2),
            getUserByIdClient(authUser.uid),
            getTransactionsClient(authUser.uid, 3),
            getUserCouponsClient(authUser.uid),
        ]);
        const homepageData = await getMemberHomepageData(authUser.uid, {
            activeCampaigns,
            activeOffers,
            appUser,
            userTransactions,
            coupons,
        });
        setData(homepageData);
        setLoading(false);
    };
    fetchMemberData();
  }, [authUser]);

  if (loading || !data) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Home" />
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="md:col-span-2 aspect-[2/1] md:aspect-[3/1]" />
            <Skeleton className="aspect-video" />
            <Skeleton className="aspect-video" />
          </div>
          <Card>
              <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                      <Skeleton className="h-40" />
                      <Skeleton className="h-40" />
                  </div>
              </CardContent>
          </Card>
        </div>
      </main>
    )
  }
  
  const memberLocation = data.member?.location?.toLowerCase();
  const allAds = mockAdvertisements.filter(ad => ad.status === 'active');
  
  const targetedAds = allAds.filter(ad => {
    if (!ad.targetLocation) return true;
    const locations = ad.targetLocation.toLowerCase().split(',').map(l => l.trim());
    return locations.includes(memberLocation || '');
  });
  
  const imageAds = targetedAds.filter(ad => ad.type === 'image');
  const scrollAds = targetedAds.filter(ad => ad.type === 'scroll');

  const mainAd = imageAds[0];
  const secondaryAds = imageAds.slice(1, 3);
  
  const getCouponValueText = (coupon: UserCoupon) => {
    if (coupon.discountType === 'fixed') {
      return `₹${coupon.discountValue / 100}`;
    }
    return `${coupon.discountValue}%`;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Home" />
      <div className="grid gap-6">
        
        {/* Ads Grid */}
        {imageAds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mainAd && (
                <div className="md:col-span-2">
                  <Link href={mainAd.link}>
                    <Card className="overflow-hidden group border-white/10 bg-white/5 backdrop-blur-sm">
                      <div className="relative w-full aspect-[2/1] md:aspect-[3/1]">
                        <Image
                          src={mainAd.content}
                          alt={mainAd.title}
                          fill
                          className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                          data-ai-hint="advertisement banner"
                        />
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                            <CardTitle>{mainAd.title}</CardTitle>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </div>
              )}
              {secondaryAds.map(ad => (
                <Link href={ad.link} key={ad.id}>
                    <Card className="overflow-hidden group border-white/10 bg-white/5 backdrop-blur-sm">
                      <div className="relative w-full aspect-video">
                        <Image
                          src={ad.content}
                          alt={ad.title}
                          fill
                          className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                          data-ai-hint="advertisement banner"
                        />
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-2 left-2 text-white">
                            <h3 className="text-md font-semibold">{ad.title}</h3>
                        </div>
                      </div>
                    </Card>
                  </Link>
              ))}
          </div>
        )}

        {/* Scrolling Text Ads */}
        <ScrollingText ads={scrollAds} />

         {/* My Coupons Carousel */}
         {data.userCoupons && data.userCoupons.length > 0 && (
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="section-title text-lg font-semibold text-white">Your Welcome Coupons</CardTitle>
                  <CardDescription className="text-white/70">
                    Your exclusive coupons are ready to use!
                  </CardDescription>
                </div>
                <Button variant="link" className="pr-0" asChild>
                  <Link href="/member/my-coupons">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {data.userCoupons.map((coupon) => (
                    <CarouselItem key={coupon.userCouponId} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <Card className="border-white/10 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-sm">
                          <CardContent className="flex flex-col items-center justify-center p-6 text-white">
                            <Ticket className="h-10 w-10 mb-2 transform -rotate-12" />
                            <p className="text-lg font-bold">{getCouponValueText(coupon)}</p>
                            <p className="font-semibold text-center">{coupon.title}</p>
                            <p className="text-xs opacity-80">{coupon.category}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>
        )}


        {/* Available Offers Section */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="section-title text-white">Available Offers</CardTitle>
                <CardDescription className="text-white/70">
                  Hot deals from our partner merchants.
                </CardDescription>
              </div>
              <Button variant="link" className="pr-0" asChild>
                <Link href="/member/rewards">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.availableOffers.map((offer) => (
                <div
                  key={offer.offerId}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm text-white"
                >
                  <div className="p-4 flex items-start gap-4">
                    <Image
                      src={offer.merchantLogo}
                      alt={`${offer.merchantName} logo`}
                      width={40}
                      height={40}
                      className="rounded-lg"
                      data-ai-hint="company logo"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{offer.title}</h3>
                    <p className="text-xs text-white/70">
                      {offer.merchantName}
                    </p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <p className="text-xs text-white/70 line-clamp-2">
                      {offer.description}
                    </p>
                    <Button size="sm" className="mt-3 w-full btn-tawai">
                      <Gift className="mr-2 h-4 w-4" />
                      Redeem for {offer.points} pts
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

         {/* Campaigns Section */}
        {data.activeCampaigns && data.activeCampaigns.length > 0 && (
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="section-title text-white">Campaigns &amp; Special Offers</CardTitle>
                        <CardDescription className="text-white/70">
                        Complete challenges to earn big rewards.
                        </CardDescription>
                    </div>
                    <Button variant="link" className="pr-0" asChild>
                        <Link href="/member/campaigns">
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.activeCampaigns.slice(0, 2).map((campaign) => (
                  <div
                    key={campaign.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm text-white"
                  >
                    <div className="flex items-start gap-4">
                       <div className="p-2 rounded-full bg-violet-500/20">
                          <Target className="h-6 w-6 text-violet-300" />
                        </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{campaign.title}</h3>
                        <p className="text-xs text-white/70">
                          Ends: {format(campaign.endDate, 'PP')}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3">
                      <p className="text-xs text-white/70 line-clamp-2">
                        {campaign.description}
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 w-full text-white border-white/20 hover:bg-white/10" asChild>
                        <Link href="/member/campaigns">View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Recent Transactions Section */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="section-title text-white">Recent Activity</CardTitle>
            <CardDescription className="text-white/70">
              Your recent rewards and transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-white">
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/90">Description</TableHead>
                  <TableHead className="text-white/90">Type</TableHead>
                  <TableHead className="text-right text-white/90">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.memberTransactions.map((tx) => (
                  <TableRow key={tx.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{tx.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.type === 'credit' || tx.type === 'commission' || tx.type === 'purchase' ? 'secondary' : 'destructive'}
                        className="capitalize"
                      >
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-right text-white">
                      ₹{(tx.amount / 100).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
