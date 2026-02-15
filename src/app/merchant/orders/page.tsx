
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getTransactionsClient } from '@/services/transaction-service.client';
import { getUsersClient } from '@/services/user-service.client';
import type { Transaction, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { getUserById } from '@/services/user-service';

function exportToCsv(filename: string, rows: (string | number | Date)[][]) {
    const processRow = (row: (string | number | Date)[]) => {
        let finalVal = '';
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            let innerValue = cell === null || cell === undefined ? '' : String(cell);
            if (cell instanceof Date) {
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


export default function OrdersPage() {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [orders, setOrders] = React.useState<Transaction[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [merchantId, setMerchantId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!authUser) return;
      const merchantUser = await getUserById(authUser.uid);
      const id = merchantUser?.merchantId ?? authUser.uid;
      setMerchantId(id);
      const [allTransactions, allUsers] = await Promise.all([
        getTransactionsClient(),
        getUsersClient('member'),
      ]);
      const merchantOrders = allTransactions.filter((tx) => tx.merchantId === id && tx.type === 'purchase');
      setOrders(merchantOrders);
      setUsers(allUsers);
    };
    fetchData();
  }, [authUser]);

  const handleExport = () => {
    const dataToExport = orders.map(order => {
        const customer = users.find(u => u.uid === order.userId);
        return [
            order.id,
            customer?.name || 'N/A',
            (order.amount / 100).toFixed(2),
            'Completed',
            format(order.createdAt, 'PPpp'),
        ];
    });

    exportToCsv('merchant_orders.csv', [
        ['Order ID', 'Customer', 'Amount (₹)', 'Status', 'Date'],
        ...dataToExport,
    ]);

    toast({
        title: 'Export Complete',
        description: 'Order data has been exported.',
    });
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Customer Orders" />
       <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Process Orders</CardTitle>
                <CardDescription>View and process incoming customer orders. Found {orders.length} orders.</CardDescription>
              </div>
              <Button variant="outline" onClick={handleExport} disabled={orders.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => {
                const customer = users.find(u => u.uid === order.userId);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                    <TableCell>{customer?.name || 'N/A'}</TableCell>
                    <TableCell className="font-medium">₹{(order.amount / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Completed</Badge>
                    </TableCell>
                    <TableCell>{format(order.createdAt, 'PPpp')}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Print Receipt</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
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
