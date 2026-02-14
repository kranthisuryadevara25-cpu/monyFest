
'use client'

import * as React from 'react';
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
  MoreHorizontal,
  FileDown,
} from 'lucide-react';
import type { Transaction, User, Merchant } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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

    let csvFile = rows.map(processRow).join('');

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

type OrderListProps = {
    initialOrders: Transaction[];
    initialUserMap: Map<string, User> | Record<string, User>;
    initialMerchantMap: Map<string, Merchant> | Record<string, Merchant>;
}

export function OrderList({ initialOrders, initialUserMap, initialMerchantMap }: OrderListProps) {
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Transaction[]>(initialOrders);
  const userMap = React.useMemo(
    () => (initialUserMap instanceof Map ? initialUserMap : new Map(Object.entries(initialUserMap))),
    [initialUserMap]
  );
  const merchantMap = React.useMemo(
    () => (initialMerchantMap instanceof Map ? initialMerchantMap : new Map(Object.entries(initialMerchantMap))),
    [initialMerchantMap]
  );
  

  const handleExport = () => {
    const data = orders.map(order => {
        const customer = userMap.get(order.userId);
        const merchant = order.merchantId ? merchantMap.get(order.merchantId) : undefined;
        return [
            order.id,
            customer?.name || 'N/A',
            merchant?.name || 'N/A',
            (order.amount / 100).toFixed(2),
            'Completed',
            format(order.createdAt, 'PPpp'),
        ];
    });
    exportToCsv('orders.csv', [
        ['Order ID', 'Customer', 'Merchant', 'Amount (₹)', 'Status', 'Date'],
        ...data,
    ]);
     toast({ title: 'Export Complete', description: 'Order data has been exported to orders.csv.' });
  }

  return (
    <>
        <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Export to CSV
            </Button>
        </div>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Merchant</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {orders.map((order) => {
                const customer = userMap.get(order.userId);
                const merchant = order.merchantId ? merchantMap.get(order.merchantId) : undefined;

                return (
                <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                    <TableCell>{customer?.name || 'N/A'}</TableCell>
                    <TableCell>{merchant?.name || 'N/A'}</TableCell>
                    <TableCell className="font-medium">
                    ₹{(order.amount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                    <Badge variant="secondary" className="capitalize">
                        {/* In a real app, order would have its own status */}
                        Completed
                    </Badge>
                    </TableCell>
                    <TableCell>{format(order.createdAt, 'PP')}</TableCell>
                    <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => toast({ title: 'Action Triggered', description: 'Viewing details for order ' + order.id })}>View Order Details</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => toast({ title: 'Action Triggered', description: 'Issuing refund for order ' + order.id })}>Issue Refund</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                );
            })}
        </TableBody>
        </Table>
    </>
  );
}
