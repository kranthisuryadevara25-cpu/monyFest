
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Users, Building, Target } from "lucide-react";
import { Progress } from '@/components/ui/progress';
import { getTransactions } from '@/services/transaction-service';
import { getMerchants } from '@/services/merchant-service';
import { getUsersClient } from '@/services/user-service.client';
import { useAuth } from '@/lib/auth';
import { getUserById } from '@/services/user-service';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function PerformancePage() {
    const { user: authUser } = useAuth();
    const [agent, setAgent] = React.useState<User | null>(null);
    const [totalCommissions, setTotalCommissions] = React.useState(0);
    const [recruitedMembers, setRecruitedMembers] = React.useState<User[]>([]);
    const [recruitedMerchantsCount, setRecruitedMerchantsCount] = React.useState(0);
    const [networkSize, setNetworkSize] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!authUser) {
            setLoading(false);
            return;
        }
        const run = async () => {
            const user = await getUserById(authUser.uid);
            if (!user || user.role !== 'agent') {
                setLoading(false);
                return;
            }
            setAgent(user);
            const [allTransactions, allMerchants, allUsers] = await Promise.all([
                getTransactions(),
                getMerchants(),
                getUsersClient(),
            ]);
            const commissions = allTransactions
                .filter((tx) => tx.userId === user.uid && tx.type === 'commission')
                .reduce((acc, tx) => acc + tx.amount, 0);
            setTotalCommissions(commissions);
            setRecruitedMembers(allUsers.filter((u) => u.referredBy === user.uid));
            setRecruitedMerchantsCount(allMerchants.filter((m) => m.linkedAgentId === user.uid).length);
            setNetworkSize(allUsers.filter((u) => u.referralChain?.includes(user.uid)).length);
            setLoading(false);
        };
        run();
    }, [authUser]);

    if (loading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Header pageTitle="My Performance" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-20" /></CardContent></Card>
                    ))}
                </div>
            </main>
        );
    }
    if (!agent) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Header pageTitle="My Performance" />
                <Card><CardContent className="p-6">Agent not found or not approved.</CardContent></Card>
            </main>
        );
    }
    const recruitedMerchants = recruitedMerchantsCount;
    

    const monthlyGoals = {
        members: {
            current: recruitedMembers.length,
            target: 10
        },
        merchants: {
            current: recruitedMerchants,
            target: 2
        }
    }

    const memberProgress = (monthlyGoals.members.current / monthlyGoals.members.target) * 100;
    const merchantProgress = (monthlyGoals.merchants.current / monthlyGoals.merchants.target) * 100;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="My Performance" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recruited Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{recruitedMembers.length}</div>
                    <p className="text-xs text-muted-foreground">Total members in your direct network</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recruited Merchants</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{recruitedMerchants}</div>
                    <p className="text-xs text-muted-foreground">Total merchants onboarded</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{(totalCommissions / 100).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Lifetime earnings from all sources</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Network Size</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{networkSize}</div>
                    <p className="text-xs text-muted-foreground">Total members in your downline</p>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target /> Monthly Goals</CardTitle>
                <CardDescription>Track your progress towards this month's recruitment goals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="flex justify-between mb-1">
                        <h4 className="font-medium">New Member Goal</h4>
                        <p className="text-sm text-muted-foreground">{monthlyGoals.members.current} of {monthlyGoals.members.target} members</p>
                    </div>
                    <Progress value={memberProgress} />
                </div>
                 <div>
                    <div className="flex justify-between mb-1">
                        <h4 className="font-medium">New Merchant Goal</h4>
                        <p className="text-sm text-muted-foreground">{monthlyGoals.merchants.current} of {monthlyGoals.merchants.target} merchants</p>
                    </div>
                    <Progress value={merchantProgress} />
                </div>
            </CardContent>
        </Card>
    </main>
  );
}
