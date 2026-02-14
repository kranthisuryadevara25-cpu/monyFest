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
import { getUsersClient } from '@/services/user-service.client';
import { getMerchantsClient } from '@/services/merchant-service.client';
import { MerchantList } from './_components/merchant-list';
import type { User, Merchant } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function MerchantsPage() {
    const [merchantUsers, setMerchantUsers] = React.useState<User[]>([]);
    const [merchantProfilesMap, setMerchantProfilesMap] = React.useState<Map<string, Merchant>>(new Map());
    const [agentsMap, setAgentsMap] = React.useState<Map<string, User>>(new Map());
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [merchants, allMerchants, allAgents] = await Promise.all([
                getUsersClient('merchant'),
                getMerchantsClient(),
                getUsersClient('agent')
            ]);

            setMerchantUsers(merchants);
            setMerchantProfilesMap(new Map(allMerchants.map(m => [m.merchantId, m])));
            setAgentsMap(new Map(allAgents.map(a => [a.uid, a])));
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Header pageTitle="Merchant Management" />
                <div className="container mx-auto py-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Merchants</CardTitle>
                                    <CardDescription>
                                        Manage and verify merchant accounts on the platform. Loading...
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-2">
                                <Skeleton className="h-8 w-32 ml-auto mb-4" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Merchant Management" />
            <div className="container mx-auto py-4">
                <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Merchants</CardTitle>
                            <CardDescription>
                            Manage and verify merchant accounts on the platform. Found {merchantUsers.length} merchants.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <MerchantList 
                        initialMerchants={merchantUsers}
                        initialMerchantProfilesMap={merchantProfilesMap}
                        initialAgentsMap={agentsMap}
                    />
                </CardContent>
                </Card>
            </div>
        </main>
    );
}
