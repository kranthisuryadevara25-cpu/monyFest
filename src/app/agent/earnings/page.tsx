
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { getTransactions } from '@/services/transaction-service';
import type { Transaction, User } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { getUserById } from '@/services/user-service';

export default function EarningsPage() {
  const { user: authUser } = useAuth();
  const [agent, setAgent] = React.useState<User | null>(null);
  const [agentTransactions, setAgentTransactions] = React.useState<Transaction[]>([]);
  
  React.useEffect(() => {
    if (authUser) {
      Promise.all([
        getUserById(authUser.uid),
        getTransactions()
      ]).then(([user, allTransactions]) => {
        if (user && user.role === 'agent') {
            setAgent(user);
            setAgentTransactions(allTransactions.filter(tx => tx.userId === user.uid && !tx.type.startsWith('points-')));
        }
      });
    }
  }, [authUser]);


  if (!agent) {
    return <div>Agent not found or not approved.</div>;
  }

  const totalEarnings = agentTransactions.filter(tx => tx.type === 'commission').reduce((acc, tx) => acc + tx.amount, 0);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="My Earnings" />
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Wallet Balance</span>
                <Wallet className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Your total withdrawable earnings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-4xl font-bold">₹{agent.walletBalance.toFixed(2)}</p>
             <p className="text-sm text-muted-foreground">Total lifetime earnings: ₹{totalEarnings.toFixed(2)}</p>
             <Button className="w-full">Request Payout</Button>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>A complete log of your commissions and payouts.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {agentTransactions.map(tx => (
                            <TableRow key={tx.id}>
                                <TableCell className="font-medium">{tx.description}</TableCell>
                                <TableCell>
                                    <Badge variant={tx.type === 'commission' ? 'secondary' : 'destructive'} className="capitalize">{tx.type}</Badge>
                                </TableCell>
                                <TableCell className={`font-medium ${tx.type === 'commission' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'commission' ? '+' : '-'}{(tx.amount).toFixed(2)}
                                </TableCell>
                                <TableCell>{format(tx.createdAt, 'PPpp')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
