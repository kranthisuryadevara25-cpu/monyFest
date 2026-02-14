
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, CheckCircle, Wallet, BadgePercent, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { Transaction, User, Merchant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getTransactions } from '@/services/transaction-service';
import { useAuth } from '@/lib/auth';
import { getUserById } from '@/services/user-service';
import { Skeleton } from '@/components/ui/skeleton';
import { getMerchants } from '@/services/merchant-service';
import { Progress } from '@/components/ui/progress';

type BoostTransaction = {
    id: string;
    amount: number;
    orderId: string;
    customerId: string;
    timestamp: Date;
    status: 'credited' | 'withdrawn';
};

const mockBoostTransactions: BoostTransaction[] = [
    { id: 'btx-01', amount: 2.00, orderId: 'ORD12345', customerId: 'member-user-ramu', timestamp: new Date(), status: 'credited' },
    { id: 'btx-02', amount: 3.50, orderId: 'ORD12346', customerId: 'member-user-bharath', timestamp: new Date('2024-05-27T10:00:00Z'), status: 'credited' },
    { id: 'btx-03', amount: 1.75, orderId: 'ORD12347', customerId: 'member-user-shathrugna', timestamp: new Date('2024-05-26T14:30:00Z'), status: 'credited' },
];


export default function BoostEarningsPage() {
    const { toast } = useToast();
    const { user: authUser } = useAuth();
    const [merchant, setMerchant] = React.useState<Merchant | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (authUser) {
            setLoading(true);
            Promise.all([
                getUserById(authUser.uid),
                getMerchants()
            ]).then(([user, allMerchants]) => {
                if (user && user.merchantId) {
                    const currentMerchant = allMerchants.find(m => m.merchantId === user.merchantId);
                    setMerchant(currentMerchant || null);
                }
                setLoading(false);
            });
        }
    }, [authUser]);

    const minThreshold = 555;
    const boostBalance = merchant?.boostBalance || 0;
    const isWithdrawalUnlocked = boostBalance >= minThreshold;
    const progress = (boostBalance / minThreshold) * 100;

    const handleRequestWithdrawal = () => {
        if (!isWithdrawalUnlocked) {
            toast({
                variant: 'destructive',
                title: 'Threshold Not Met',
                description: `You need at least ₹${minThreshold} to request a withdrawal.`,
            });
            return;
        }

        toast({
            title: 'Withdrawal Requested',
            description: `Your request to withdraw ₹${boostBalance.toFixed(2)} has been sent for approval.`,
        });
    };
    
    if (loading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Header pageTitle="Boost Earnings" />
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

    if (!merchant) {
         return (
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Header pageTitle="Boost Earnings" />
                <Card><CardContent className="p-6">Merchant profile not found.</CardContent></Card>
            </main>
        );
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Boost Earnings" />
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2"><BadgePercent /> LoyaltyLeap Boost Balance</CardTitle>
                        <CardDescription>Your extra earnings from the Merchant Boost Program.</CardDescription>
                    </div>
                    <div className="text-left md:text-right">
                         <p className="text-4xl font-bold">₹{boostBalance.toFixed(2)}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        You need ₹{(minThreshold - boostBalance).toFixed(2)} more to unlock withdrawal.
                    </p>
                    <Progress value={progress} />
                     <Button className="mt-4 w-full md:w-auto" onClick={handleRequestWithdrawal} disabled={!isWithdrawalUnlocked}>
                        Withdraw Boost Earnings
                     </Button>
                </div>
            </CardContent>
        </Card>
       <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Boost Transaction History</CardTitle>
                    <CardDescription>A log of all cashback amounts you've earned from the Boost Program.</CardDescription>
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
                        <TableHead>Amount</TableHead>
                        <TableHead>Original Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Credited</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockBoostTransactions.length > 0 ? mockBoostTransactions.map(tx => (
                         <TableRow key={tx.id}>
                            <TableCell className="font-medium text-green-600">+ ₹{tx.amount.toFixed(2)}</TableCell>
                            <TableCell className="font-mono text-xs">{tx.orderId}</TableCell>
                            <TableCell>{tx.customerId}</TableCell>
                            <TableCell>
                                <Badge variant={'secondary'} className="capitalize">
                                   <CheckCircle className="mr-1 h-3 w-3" />
                                   {tx.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(tx.timestamp, 'PPpp')}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                                No boost transactions found.
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
