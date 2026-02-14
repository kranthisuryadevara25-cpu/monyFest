

'use client'

import * as React from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  User as UserIcon,
  CircleOff,
  FileDown,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Transaction, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getUsersClient } from '@/services/user-service.client';
import { getTransactionsClient } from '@/services/transaction-service.client';
import { updateTransactionPayoutStatus } from '@/services/transaction-service';

function exportToCsv(filename: string, rows: (string | number | Date | undefined)[][]) {
    const processRow = (row: (string | number | Date | undefined)[]) => {
        let finalVal = '';
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            let innerValue = cell === null || cell === undefined ? '' : String(cell);
            if (cell != null && cell instanceof Date) {
                innerValue = cell.toLocaleString();
            }
            let result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    let csvFile = '';
    for (let i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Temporary type until Payouts are fully implemented in DB
type PayoutLike = Transaction & {
    level?: 1 | 2 | 3;
    sourceUserId?: string;
}

type PayoutWithDetails = PayoutLike & {
    payee?: User;
    sourceUser?: User;
    status?: 'pending' | 'completed' | 'rejected';
}

const getCommissionLevel = (level: PayoutLike['level']) => {
    switch (level) {
        case 1: return <Badge variant="secondary">Level 1</Badge>;
        case 2: return <Badge variant="outline">Level 2</Badge>;
        case 3: return <Badge variant="outline" className="border-dashed">Level 3</Badge>;
        default: return <Badge variant="destructive">N/A</Badge>;
    }
}

export default function PayoutsPage() {
    const { toast } = useToast();
    const [payouts, setPayouts] = React.useState<PayoutWithDetails[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const users = await getUsersClient();
            const allTransactions = await getTransactionsClient();
            const payoutTransactions = allTransactions.filter(tx => tx.type === 'commission' || tx.type === 'payout');

            const payoutsWithDetails = payoutTransactions.map(p => {
                const payee = users.find(u => u.uid === p.userId);
                const sourceUser = users.find(u => u.uid === p.sourceId);
                const level = p.commissionLevel ?? (p.description?.includes('Level 1') ? 1 : p.description?.includes('Level 2') ? 2 : p.description?.includes('Level 3') ? 3 : undefined);
                const status = p.type === 'payout' ? 'completed' : (p.payoutStatus ?? 'pending');
                return {
                    ...p,
                    payee,
                    sourceUser,
                    level,
                    status,
                } as PayoutWithDetails;
            }).filter(p => p.payee);
            setPayouts(payoutsWithDetails);
            setLoading(false);
        }
        fetchData();
    }, []);

    const handlePayoutAction = async (payoutId: string, status: 'completed' | 'rejected') => {
        try {
            await updateTransactionPayoutStatus(payoutId, status);
            setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status } : p));
            toast({
                title: status === 'completed' ? 'Payout approved' : 'Payout rejected',
                description: `The payout has been marked as ${status}.`,
            });
        } catch (e: unknown) {
            toast({
                variant: 'destructive',
                title: 'Update failed',
                description: e instanceof Error ? e.message : 'Could not update payout status.',
            });
        }
    };

    const pendingPayouts = payouts.filter(p => p.status === 'pending');
    const processedPayouts = payouts.filter(p => p.status !== 'pending');

     const handleExport = (type: 'pending' | 'processed') => {
        const dataToExport = type === 'pending' ? pendingPayouts : processedPayouts;
        const filename = `${type}_payouts.csv`;

        const data = dataToExport.map(payout => [
            payout.id,
            payout.payee?.name || 'N/A',
            payout.level ? `Level ${payout.level}` : 'N/A',
            (payout.amount / 100).toFixed(2),
            payout.status ?? 'N/A',
            format(payout.createdAt, 'PPpp'),
        ]);

        exportToCsv(filename, [
            ['Payout ID', 'Payee', 'Commission Level', 'Amount (₹)', 'Status', 'Date'],
            ...data
        ]);

        toast({ title: 'Export Complete', description: `Data has been exported to ${filename}.` });
    };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Payouts Management" />
      <div className="container mx-auto py-4">
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
                <Clock className="mr-2 h-4 w-4" />
                Pending ({pendingPayouts.length})
            </TabsTrigger>
            <TabsTrigger value="processed">
                <CheckCircle className="mr-2 h-4 w-4" />
                Processed ({processedPayouts.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Pending Referral Payouts</CardTitle>
                        <CardDescription>
                        Review and approve or reject pending commission payouts from user signups.
                        </CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => handleExport('pending')}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payee</TableHead>
                      <TableHead>Commission Details</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayouts.length > 0 ? pendingPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                           <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={payout.payee?.avatarUrl} alt={payout.payee?.name} data-ai-hint="person portrait"/>
                                    <AvatarFallback>{payout.payee?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {payout.payee?.name}
                            </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             {payout.level ? getCommissionLevel(payout.level) : <Badge>Direct</Badge>}
                             {payout.sourceUser ? (
                                <>
                                 <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <UserIcon className="h-4 w-4" />
                                    <span>From {payout.sourceUser.name}'s signup</span>
                                 </div>
                                </>
                             ) : (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CircleOff className="h-4 w-4" />
                                    <span>{payout.description}</span>
                                </div>
                             )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">₹{(payout.amount / 100).toFixed(2)}</TableCell>
                        <TableCell>{format(payout.createdAt, 'PPpp')}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="mr-2" onClick={() => handlePayoutAction(payout.id, 'rejected')}>
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button size="sm" onClick={() => handlePayoutAction(payout.id, 'completed')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                                No pending payouts.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="processed">
             <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Processed Payouts</CardTitle>
                        <CardDescription>
                        History of all approved and rejected commission payouts.
                        </CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => handleExport('processed')}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payee</TableHead>
                      <TableHead>Commission Details</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                           <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={payout.payee?.avatarUrl} alt={payout.payee?.name} data-ai-hint="person portrait"/>
                                    <AvatarFallback>{payout.payee?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {payout.payee?.name}
                            </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             {payout.level ? getCommissionLevel(payout.level) : <Badge>Direct</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">₹{(payout.amount / 100).toFixed(2)}</TableCell>
                         <TableCell>
                          <Badge variant={payout.status === 'completed' ? 'secondary' : 'destructive'} className="capitalize">
                            {payout.status === 'completed' ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                            {payout.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(payout.createdAt, 'PPpp')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
