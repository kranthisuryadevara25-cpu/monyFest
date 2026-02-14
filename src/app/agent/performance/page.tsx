
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Users, Building, Target } from "lucide-react";
import { mockUsers, mockMerchants } from '@/lib/placeholder-data';
import { Progress } from '@/components/ui/progress';
import { getTransactions } from '@/services/transaction-service';

export default function PerformancePage() {
    const [totalCommissions, setTotalCommissions] = React.useState(0);
    const agent = mockUsers.find(u => u.uid === 'laxman-agent-02');

    React.useEffect(() => {
        if (agent) {
            getTransactions().then(allTransactions => {
                const commissions = allTransactions
                    .filter(tx => tx.userId === agent.uid && tx.type === 'commission')
                    .reduce((acc, tx) => acc + tx.amount, 0);
                setTotalCommissions(commissions);
            });
        }
    }, [agent]);

    if (!agent) {
        return <div>Agent not found or not approved.</div>;
    }
    const recruitedMerchants = mockMerchants.filter(m => m.linkedAgentId === agent.uid);
    const recruitedMembers = mockUsers.filter(u => u.referredBy === agent.uid);
    

    const monthlyGoals = {
        members: {
            current: recruitedMembers.length,
            target: 10
        },
        merchants: {
            current: recruitedMerchants.length,
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
                    <div className="text-2xl font-bold">{recruitedMerchants.length}</div>
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
                    <div className="text-2xl font-bold">{mockUsers.filter(u => u.referralChain?.includes(agent.uid)).length}</div>
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
