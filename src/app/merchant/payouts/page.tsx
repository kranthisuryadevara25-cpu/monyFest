
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, CheckCircle, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { Transaction, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getTransactions } from '@/services/transaction-service';
import { useAuth } from '@/lib/auth';
import { getUserById } from '@/services/user-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function PayoutsPage() {
    const { toast } = useToast();
    const { user: authUser } = useAuth();
    const [merchantUser, setMerchantUser] = React.useState<User | null>(null);
    const [payouts, setPayouts] = React.useState<Transaction[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (authUser) {
            setLoading(true);
            Promise.all([
                getUserById(authUser.uid),
                getTransactions()
            ]).then(([user, allTransactions]) => {
                setMerchantUser(user);
                if (user) {
                    setPayouts(allTransactions.filter(tx => tx.userId === authUser.uid && tx.type === 'payout'));
                }
                setLoading(false);
            });
        }
    }, [authUser]);

    const totalAvailableForPayout = merchantUser?.walletBalance || 0;

    const handleRequestPayout = () => {
        if (!merchantUser || totalAvailableForPayout <= 0) {
            toast({
                variant: 'destructive',
                title: 'Payout Request Failed',
                description: 'No balance available for payout.',
            });
            return;
        }

        // In a real app, this would trigger a backend process.
        // Here, we just simulate it.
        toast({
            title: 'Payout Requested',
            description: `Your request to withdraw ₹${totalAvailableForPayout.toFixed(2)} is being processed.`,
        });

        // We can optionally clear the balance for simulation purposes
        // setMerchantUser(prev => prev ? {...prev, walletBalance: 0} : undefined);
    };
    
    if (loading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Header pageTitle="Payouts" />
                 <Card>
                    <CardHeader>
                         <Skeleton className="h-8 w-48" />
                         <Skeleton className="h-4 w-64" />
                    </CardHeader>
                </Card>
                 <Card>
                    <CardHeader>
                         <Skeleton className="h-8 w-40" />
                         <Skeleton className="h-4 w-56" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </main>
        )
    };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Payouts" />
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Wallet /> Available for Payout</CardTitle>
                        <CardDescription>Your current earnings ready for withdrawal.</CardDescription>
                    </div>
                    <div className="text-left md:text-right">
                         <p className="text-4xl font-bold">₹{totalAvailableForPayout.toFixed(2)}</p>
                         <Button className="mt-2 w-full md:w-auto" onClick={handleRequestPayout} disabled={totalAvailableForPayout <= 0}>
                            Request Payout
                         </Button>
                    </div>
                </div>
            </CardHeader>
        </Card>
       <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>Review your history of payouts from platform earnings.</CardDescription>
                </div>
                <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Statement
                </Button>
            </div>
        </CardHeader>
        <CardContent>
           <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Payout ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Processed</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payouts.length > 0 ? payouts.map(payout => (
                         <TableRow key={payout.id}>
                            <TableCell className="font-mono text-xs">{payout.id}</TableCell>
                            <TableCell className="font-medium">₹{(payout.amount / 100).toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={'secondary'} className="capitalize">
                                   <CheckCircle className="mr-1 h-3 w-3" />
                                   Completed
                                </Badge>
                            </TableCell>
                            <TableCell>{format(payout.createdAt, 'PP')}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                                No payouts found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
           </Table>
        </CardContent>
      </Card>
    </main>
  );
}
