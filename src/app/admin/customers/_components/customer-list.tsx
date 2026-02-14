
'use client';

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
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  FileDown,
} from 'lucide-react';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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

const StatusIcon = ({ status }: { status: User['status'] }) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
    case 'pending':
      return <Clock className="mr-2 h-4 w-4 text-yellow-500" />;
    case 'rejected':
      return <XCircle className="mr-2 h-4 w-4 text-red-500" />;
    case 'deactivated':
      return <Ban className="mr-2 h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
};

type CustomerListProps = {
    initialCustomers: User[];
    userMap: Map<string, User>;
}

export function CustomerList({ initialCustomers, userMap: initialUserMap }: CustomerListProps) {
  const { toast } = useToast();
  const [customers, setCustomers] = React.useState<User[]>(initialCustomers);
  const userMap = React.useMemo(() => new Map(Object.entries(initialUserMap)), [initialUserMap]);
  const [loading, setLoading] = React.useState(false);


  const handleStatusChange = (userId: string, newStatus: User['status']) => {
    // In a real app, this would be an API call to update the database.
    setCustomers((prev) =>
      prev.map((c) => (c.uid === userId ? { ...c, status: newStatus } : c))
    );
    toast({
        title: 'Status Updated',
        description: `Customer status has been changed to ${newStatus}.`,
    });
  };

  const handleExport = () => {
    const data = customers.map(customer => {
        const referrer = customer.referredBy ? userMap.get(customer.referredBy) : undefined;
        return [
            customer.uid,
            customer.name,
            customer.email,
            customer.status,
            customer.walletBalance.toFixed(2),
            referrer ? referrer.name : 'N/A',
            format(customer.createdAt, 'PPpp')
        ]
    });

    exportToCsv('customers.csv', [
        ['ID', 'Name', 'Email', 'Status', 'Wallet Balance', 'Referred By', 'Joined On'],
        ...data
    ]);

     toast({
        title: 'Export Complete',
        description: 'Customer data has been exported to customers.csv.',
    });
  }

  const renderSkeleton = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skel-customer-${i}`}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
    <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleExport} disabled={customers.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Export to CSV
        </Button>
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Wallet Balance</TableHead>
          <TableHead>Referred By</TableHead>
          <TableHead>Joined On</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? renderSkeleton() : customers.map((customer) => {
          const referrer = customer.referredBy ? userMap.get(customer.referredBy) : undefined;
          return (
            <TableRow key={customer.uid}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={customer.avatarUrl}
                      alt={customer.name}
                      data-ai-hint="person portrait"
                    />
                    <AvatarFallback>
                      {customer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {customer.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    customer.status === 'approved'
                      ? 'secondary'
                      : customer.status === 'deactivated'
                      ? 'destructive'
                      : 'outline'
                  }
                  className="capitalize"
                >
                  <StatusIcon status={customer.status} />
                  {customer.status}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                ₹{customer.walletBalance.toFixed(2)}
              </TableCell>
              <TableCell>
                {referrer ? referrer.name : 'N/A'}
              </TableCell>
              <TableCell>
                {format(customer.createdAt, 'PP')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => toast({ title: 'Action Triggered', description: 'Viewing details for ' + customer.name })}>View Details</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => toast({ title: 'Action Triggered', description: 'Viewing transactions for ' + customer.name })}>View Transactions</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {customer.status !== 'deactivated' && (
                        <DropdownMenuItem
                        className="text-red-600"
                        onClick={() =>
                            handleStatusChange(customer.uid, 'deactivated')
                        }
                        >
                        Deactivate Account
                        </DropdownMenuItem>
                    )}
                      {customer.status === 'deactivated' && (
                        <DropdownMenuItem
                        onClick={() =>
                            handleStatusChange(customer.uid, 'approved')
                        }
                        >
                        Re-activate Account
                        </DropdownMenuItem>
                    )}
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
