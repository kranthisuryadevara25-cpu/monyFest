
'use client';
/**
 * @file CampaignsPage
 * @description This page displays a list of active multi-transaction campaigns that members can participate in to earn special rewards.
 *
 * @overview
 * The CampaignsPage is designed to engage users with long-term challenges. It fetches active campaigns and presents them in a card-based layout.
 * Each card provides details about the campaign, including its title, description, reward, and the user's current progress towards completing it.
 *
 * @features
 * - Fetches and displays all active campaigns from the `bundleOffers` service.
 * - For each campaign, it shows:
 *   - Title and detailed description.
 *   - The end date for the campaign.
 *   - The number of transactions required to complete the challenge.
 *   - A progress bar visualizing the user's current progress (currently uses dummy data).
 *   - The final reward for completing the campaign (e.g., cashback, points, or a coupon).
 * - If no active campaigns are available, it displays a message encouraging users to check back later.
 */

import * as React from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Calendar, CheckSquare, Gift } from 'lucide-react';
import type { BundleOffer } from '@/lib/types';
import { getBundleOffersClient } from '@/services/bundle-offer-service.client';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

const CampaignCard = ({ campaign }: { campaign: BundleOffer }) => {
    // Dummy progress for demonstration
    const progress = Math.floor(Math.random() * 80) + 10;
    const currentProgress = Math.floor(campaign.requiredTransactions * (progress / 100));

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>{campaign.title}</CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Ends: {format(campaign.endDate, 'PP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" />
                        <span>Requires: {campaign.requiredTransactions} transactions</span>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <h4 className="font-medium text-sm">Your Progress</h4>
                        <p className="text-sm text-muted-foreground">{currentProgress} of {campaign.requiredTransactions} transactions</p>
                    </div>
                    <Progress value={(currentProgress / campaign.requiredTransactions) * 100} />
                </div>
                
                 <div className="border-t pt-4">
                    <div className="flex items-center gap-2 font-semibold">
                        <Gift className="h-5 w-5 text-secondary" />
                        <span>Reward: <span className="capitalize">{typeof campaign.rewardValue === 'string' ? campaign.rewardValue : `${campaign.rewardValue} ${campaign.rewardType}`}</span></span>
                    </div>
                 </div>
                
            </CardContent>
        </Card>
    );
}


export default function CampaignsPage() {
    const [activeCampaigns, setActiveCampaigns] = React.useState<BundleOffer[]>([]);
    
    React.useEffect(() => {
        getBundleOffersClient('active').then(setActiveCampaigns);
    }, []);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Campaigns & Special Offers" />
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Join a Campaign</CardTitle>
                        <CardDescription>Complete challenges to earn special rewards like cashback, points, and exclusive coupons.</CardDescription>
                    </CardHeader>
                </Card>

                {activeCampaigns.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {activeCampaigns.map(campaign => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                    </div>
                ) : (
                     <Card>
                        <CardContent className="py-16 text-center">
                            <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Active Campaigns</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Check back soon for new challenges and rewards!
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}
