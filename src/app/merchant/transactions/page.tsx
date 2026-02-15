
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getTransactions } from '@/services/transaction-service';
import type { Transaction, User } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { getUserById } from '@/services/user-service';
import { getUsersClient } from '@/services/user-service.client';

export default function TransactionsPage() {
  const { user: authUser } = useAuth();
  const [merchantTransactions, setMerchantTransactions] = React.useState<Transaction[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    if (!authUser) return;
    const run = async () => {
      const merchantUser = await getUserById(authUser.uid);
      const merchantId = merchantUser?.merchantId ?? authUser.uid;
      const [allTransactions, allUsers] = await Promise.all([
        getTransactions(),
        getUsersClient(),
      ]);
      setMerchantTransactions(allTransactions.filter((tx) => tx.merchantId === merchantId));
      setUsers(allUsers);
    };
    run();
  }, [authUser]);


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Financial Transactions" />
        <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Review your financial transaction history. Found {merchantTransactions.length} records.</CardDescription>
              </div>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
            </div>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchantTransactions.map(tx => {
                 const customer = users.find(u => u.uid === tx.userId);
                 const isCredit = tx.type === 'purchase';
                 return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                    <TableCell>
                      <Badge variant={isCredit ? 'secondary' : 'destructive'} className="capitalize">
                        {isCredit ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">₹{(tx.amount / 100).toFixed(2)}</TableCell>
                    <TableCell>{customer?.name || 'N/A'}</TableCell>
                    <TableCell>{format(tx.createdAt, 'PPpp')}</TableCell>
                  </TableRow>
                 )
              })}
            </TableBody>
           </Table>
        </CardContent>
      </Card>
    </main>
  );
}
