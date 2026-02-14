'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getUsersClient } from '@/services/user-service.client';
import { MlmVisualizer } from './_components/mlm-visualizer';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/types';

export default function MlmExplanationPage() {
    const [allUsers, setAllUsers] = React.useState<User[]>([]);
    const [sampleUser, setSampleUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const users = await getUsersClient();
            const memberUser = users.find(u => u.role === 'member') || null;
            setAllUsers(users);
            setSampleUser(memberUser);
            setLoading(false);
        };
        fetchData();
    }, []);


    return (
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="MLM Explainer" />
            <Card>
                <CardHeader>
                    <CardTitle>Referral Hierarchy Guide</CardTitle>
                    <CardDescription>An interactive visual guide of the referral hierarchy for a sample user.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {loading ? (
                        <div className="space-y-8">
                            <div className="flex flex-col items-center gap-4">
                                <Skeleton className="h-8 w-64" />
                                <div className="flex items-center gap-4 p-4 border rounded-lg w-full max-w-md">
                                    <Skeleton className="h-16 w-16 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                        </div>
                    ) : !sampleUser ? (
                         <p>Could not find a sample member user to display.</p>
                    ) : (
                        <MlmVisualizer allUsers={allUsers} sampleUser={sampleUser} />
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
