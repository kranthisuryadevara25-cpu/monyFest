
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Building } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { getUsersClient, getUserByIdClient } from '@/services/user-service.client';
import type { User } from '@/lib/types';


export default function ReferralsPage() {
  const { user: authUser } = useAuth();
  const [agent, setAgent] = React.useState<User | null>(null);
  const [recruitedMerchants, setRecruitedMerchants] = React.useState<User[]>([]);
  const [recruitedMembers, setRecruitedMembers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
        if (!authUser) return;

        setLoading(true);
        const currentAgent = await getUserByIdClient(authUser.uid);
        
        if (currentAgent && currentAgent.role === 'agent') {
            setAgent(currentAgent);
            const allUsers = await getUsersClient();
            setRecruitedMembers(allUsers.filter(u => u.role === 'member' && u.referredBy === currentAgent.uid));
            setRecruitedMerchants(allUsers.filter(u => u.role === 'merchant' && u.referredBy === currentAgent.uid));
        }
        setLoading(false);
    }
    fetchData();
  }, [authUser]);


  if (loading) {
    return <div>Loading agent data...</div>;
  }

  if (!agent) {
    return <div>Agent not found or not approved.</div>;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="My Referrals" />
        <Tabs defaultValue="members">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members"><Users className="mr-2 h-4 w-4" />Referred Members ({recruitedMembers.length})</TabsTrigger>
            <TabsTrigger value="merchants"><Building className="mr-2 h-4 w-4" />Referred Merchants ({recruitedMerchants.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="members">
            <Card>
                <CardHeader>
                    <CardTitle>My Referred Members</CardTitle>
                    <CardDescription>A list of all members you have directly referred to the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined On</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recruitedMembers.length > 0 ? recruitedMembers.map(member => (
                                <TableRow key={member.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person portrait"/>
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{member.name}</div>
                                                <div className="text-xs text-muted-foreground">{member.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={member.status === 'approved' ? 'secondary' : 'outline'} className="capitalize">{member.status}</Badge>
                                    </TableCell>
                                    <TableCell>{format(member.createdAt, 'PP')}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">You haven't referred any members yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="merchants">
            <Card>
                <CardHeader>
                    <CardTitle>My Referred Merchants</CardTitle>
                    <CardDescription>A list of all merchants you have directly onboarded to the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Merchant Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined On</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recruitedMerchants.length > 0 ? recruitedMerchants.map(merchant => (
                                <TableRow key={merchant.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={merchant.avatarUrl} alt={merchant.name} data-ai-hint="person portrait" />
                                                <AvatarFallback>{merchant.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{merchant.name}</div>
                                                <div className="text-xs text-muted-foreground">{merchant.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={merchant.status === 'approved' ? 'secondary' : 'outline'} className="capitalize">{merchant.status}</Badge>
                                    </TableCell>
                                    <TableCell>{format(merchant.createdAt, 'PP')}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">You haven't referred any merchants yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </main>
  );
}
