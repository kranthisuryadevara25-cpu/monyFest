
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, CircleDollarSign } from 'lucide-react';

export function MlmVisualizer({ allUsers, sampleUser }: { allUsers: User[], sampleUser: User }) {
    
    const level1 = allUsers.filter(u => u.referredBy === sampleUser.uid);
    const level2 = allUsers.filter(u => level1.map(l => l.uid).includes(u.referredBy!));
    const level3 = allUsers.filter(u => level2.map(l => l.uid).includes(u.referredBy!));

    return (
        <>
            <div className="flex flex-col items-center gap-4">
                <h3 className="text-xl font-semibold text-center">Visualizing for user: {sampleUser.name}</h3>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={sampleUser.avatarUrl} alt={sampleUser.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{sampleUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="font-bold text-lg">{sampleUser.name}</p>
                        <p className="text-sm text-muted-foreground">{sampleUser.email}</p>
                        <p className="flex items-center gap-2"><CircleDollarSign className="h-4 w-4" /> ₹{sampleUser.walletBalance.toFixed(2)} wallet balance</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {/* Level 1 */}
                <div className="space-y-4">
                    <div className="flex justify-center items-center gap-2">
                        <GitBranch className="h-6 w-6 text-primary" />
                        <h4 className="text-lg font-semibold">Level 1 Referrals</h4>
                    </div>
                    <p className="text-muted-foreground text-sm">Directly referred by {sampleUser.name}. Commission: ₹50</p>
                    <div className="space-y-3">
                    {level1.length > 0 ? level1.map(u => (
                        <Card key={u.uid} className="p-3 text-left">
                            <div className="flex items-center gap-3">
                                 <Avatar className="h-10 w-10">
                                    <AvatarImage src={u.avatarUrl} alt={u.name} data-ai-hint="person portrait" />
                                    <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{u.name}</p>
                                    <Badge variant="outline">{u.role}</Badge>
                                </div>
                            </div>
                        </Card>
                    )) : <p className="text-muted-foreground py-8">No Level 1 Referrals</p>}
                    </div>
                </div>

                {/* Level 2 */}
                <div className="space-y-4">
                     <div className="flex justify-center items-center gap-2">
                        <GitBranch className="h-6 w-6 text-secondary-foreground" />
                        <h4 className="text-lg font-semibold">Level 2 Referrals</h4>
                    </div>
                    <p className="text-muted-foreground text-sm">Referred by Level 1. Commission: ₹30</p>
                     <div className="space-y-3">
                    {level2.length > 0 ? level2.map(u => (
                        <Card key={u.uid} className="p-3 text-left">
                           <div className="flex items-center gap-3">
                                 <Avatar className="h-10 w-10">
                                    <AvatarImage src={u.avatarUrl} alt={u.name} data-ai-hint="person portrait" />
                                    <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{u.name}</p>
                                    <Badge variant="outline">{u.role}</Badge>
                                </div>
                            </div>
                        </Card>
                    )) : <p className="text-muted-foreground py-8">No Level 2 Referrals</p>}
                    </div>
                </div>

                {/* Level 3 */}
                <div className="space-y-4">
                     <div className="flex justify-center items-center gap-2">
                        <GitBranch className="h-6 w-6 text-muted-foreground" />
                        <h4 className="text-lg font-semibold">Level 3 Referrals</h4>
                    </div>
                    <p className="text-muted-foreground text-sm">Referred by Level 2. Commission: ₹20</p>
                     <div className="space-y-3">
                    {level3.length > 0 ? level3.map(u => (
                        <Card key={u.uid} className="p-3 text-left">
                           <div className="flex items-center gap-3">
                                 <Avatar className="h-10 w-10">
                                    <AvatarImage src={u.avatarUrl} alt={u.name} data-ai-hint="person portrait" />
                                    <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{u.name}</p>
                                    <Badge variant="outline">{u.role}</Badge>
                                </div>
                            </div>
                        </Card>
                    )) : <p className="text-muted-foreground py-8">No Level 3 Referrals</p>}
                    </div>
                </div>
            </div>
        </>
    )
}
