
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { MonyFestWordmark } from '@/components/MonyFestLogo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, CheckCircle, BadgePercent } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { Merchant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { getUserById } from '@/services/user-service';
import { Skeleton } from '@/components/ui/skeleton';
import { getMerchants } from '@/services/merchant-service';
import { Progress } from '@/components/ui/progress';
import { getBoostSettings, createBoostWithdrawalRequest, getBoostTransactionsForMerchant } from '@/services/boost-service';

export default function BoostEarningsPage() {
    const { toast } = useToast();
    const { user: authUser } = useAuth();
    const [merchant, setMerchant] = React.useState<Merchant | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [minThreshold, setMinThreshold] = React.useState(555);
    const [boostTransactions, setBoostTransactions] = React.useState<Array<{ id: string; amount: number; type: 'credit' | 'withdrawal'; sourceId?: string; createdAt: Date }>>([]);
    const [withdrawing, setWithdrawing] = React.useState(false);

    const loadData = React.useCallback(() => {
        if (!authUser) return;
        setLoading(true);
        Promise.all([
            getUserById(authUser.uid),
            getMerchants(),
            getBoostSettings(),
        ]).then(([user, allMerchants, boostSettings]) => {
            if (user && user.merchantId) {
                const currentMerchant = allMerchants.find(m => m.merchantId === user.merchantId);
                setMerchant(currentMerchant || null);
                setMinThreshold(boostSettings.minRedemptionThreshold);
                if (currentMerchant) {
                    getBoostTransactionsForMerchant(currentMerchant.merchantId).then(setBoostTransactions);
                }
            }
            setLoading(false);
        });
    }, [authUser]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const boostBalance = merchant?.boostBalance ?? 0;
    const isWithdrawalUnlocked = boostBalance >= minThreshold;
    const progress = minThreshold > 0 ? Math.min(100, (boostBalance / minThreshold) * 100) : 100;

    const handleRequestWithdrawal = async () => {
        if (!merchant || !isWithdrawalUnlocked) {
            toast({
                variant: 'destructive',
                title: 'Threshold Not Met',
                description: `You need at least ₹${minThreshold} to request a withdrawal.`,
            });
            return;
        }
        setWithdrawing(true);
        const result = await createBoostWithdrawalRequest(merchant.merchantId);
        setWithdrawing(false);
        if (result.success) {
            toast({
                title: 'Withdrawal Requested',
                description: `Your request to withdraw ₹${boostBalance.toFixed(2)} has been submitted.${result.withdrawalId ? ' It may be auto-approved or reviewed by admin.' : ''}`,
            });
            loadData();
        } else {
            toast({
                variant: 'destructive',
                title: 'Withdrawal Failed',
                description: result.error,
            });
        }
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
                        <CardTitle className="flex items-center gap-2"><BadgePercent /> <MonyFestWordmark className="text-base" onLightBackground /> Boost Balance</CardTitle>
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
                     <Button className="mt-4 w-full md:w-auto" onClick={handleRequestWithdrawal} disabled={!isWithdrawalUnlocked || withdrawing}>
                        {withdrawing ? 'Submitting...' : 'Withdraw Boost Earnings'}
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
                        <TableHead>Type</TableHead>
                        <TableHead>Source ID</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {boostTransactions.length > 0 ? boostTransactions.map(tx => (
                         <TableRow key={tx.id}>
                            <TableCell className={`font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                                {tx.amount >= 0 ? '+' : ''}₹{tx.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <Badge variant={tx.type === 'credit' ? 'secondary' : 'outline'} className="capitalize">
                                   {tx.type === 'credit' ? <CheckCircle className="mr-1 h-3 w-3" /> : null}
                                   {tx.type}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{tx.sourceId ?? '—'}</TableCell>
                            <TableCell>{format(tx.createdAt, 'PPpp')}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
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
