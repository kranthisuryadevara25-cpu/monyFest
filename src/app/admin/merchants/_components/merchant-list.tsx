
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
import type { User, Merchant } from '@/lib/types';
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

type MerchantListProps = {
    initialMerchants: User[];
    initialMerchantProfilesMap: Map<string, Merchant>;
    initialAgentsMap: Map<string, User>;
}

export function MerchantList({ initialMerchants, initialMerchantProfilesMap, initialAgentsMap }: MerchantListProps) {
    const { toast } = useToast();
    const [merchants, setMerchants] = React.useState<User[]>(initialMerchants);
    const merchantProfilesMap = React.useMemo(() => new Map(Object.entries(initialMerchantProfilesMap)), [initialMerchantProfilesMap]);
    const agentsMap = React.useMemo(() => new Map(Object.entries(initialAgentsMap)), [initialAgentsMap]);
    const [loading, setLoading] = React.useState(false);

    const handleStatusChange = (userId: string, newStatus: User['status']) => {
        setMerchants(prev =>
        prev.map(m => (m.uid === userId ? { ...m, status: newStatus } : m))
        );
        // In a real app, you would also update the user's status in the database.
        toast({
            title: 'Status Updated',
            description: `Merchant status has been changed to ${newStatus}.`,
        });
    };

    const handleExport = () => {
        const data = merchants.map(merchantUser => {
            const merchantProfile = merchantUser.merchantId ? merchantProfilesMap.get(merchantUser.merchantId) : undefined;
            const agent = merchantProfile ? agentsMap.get(merchantProfile.linkedAgentId) : undefined;
            return [
                merchantUser.uid,
                merchantUser.name,
                merchantUser.email,
                merchantUser.status,
                `${merchantProfile?.commissionRate || 0}%`,
                (merchantProfile?.boostBalance || 0).toFixed(2),
                agent?.name || 'N/A',
                format(merchantUser.createdAt, 'PPpp'),
            ];
        });
        exportToCsv('merchants.csv', [
            ['ID', 'Name', 'Email', 'Status', 'Commission Rate', 'Boost Balance (₹)', 'Linked Agent', 'Joined On'],
            ...data,
        ]);
        toast({ title: 'Export Complete', description: 'Merchant data has been exported to merchants.csv.' });
    };

    const renderSkeleton = () => (
      Array.from({ length: 2 }).map((_, i) => (
        <TableRow key={`skel-merchant-${i}`}>
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
          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
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
        <Button variant="outline" onClick={handleExport} disabled={merchants.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Export to CSV
        </Button>
    </div>
    <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Merchant</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Comm. Rate</TableHead>
            <TableHead>Boost Balance</TableHead>
            <TableHead>Linked Agent</TableHead>
            <TableHead>Joined On</TableHead>
            <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {loading ? renderSkeleton() : merchants.map(merchantUser => {
            const merchantProfile = merchantUser.merchantId ? merchantProfilesMap.get(merchantUser.merchantId) : undefined;
            const agent = merchantProfile ? agentsMap.get(merchantProfile.linkedAgentId) : undefined;
            
            return (
                <TableRow key={merchantUser.uid}>
                <TableCell>
                    <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage
                        src={merchantUser.avatarUrl}
                        alt={merchantUser.name}
                        data-ai-hint="person portrait"
                        />
                        <AvatarFallback>
                        {merchantUser.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{merchantUser.name}</div>
                        <div className="text-xs text-muted-foreground">{merchantUser.email}</div>
                    </div>
                    </div>
                </TableCell>
                <TableCell>
                    <Badge
                    variant={
                        merchantUser.status === 'approved' ? 'secondary' 
                        : merchantUser.status === 'pending' ? 'outline'
                        : 'destructive'
                    }
                    className="capitalize"
                    >
                        <StatusIcon status={merchantUser.status} />
                    {merchantUser.status}
                    </Badge>
                </TableCell>
                <TableCell>{merchantProfile?.commissionRate}%</TableCell>
                <TableCell>₹{(merchantProfile?.boostBalance || 0).toFixed(2)}</TableCell>
                <TableCell>{agent?.name || 'N/A'}</TableCell>
                <TableCell>{format(merchantUser.createdAt, 'PP')}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => toast({ title: 'Action Triggered', description: 'Viewing details for ' + merchantUser.name })}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => toast({ title: 'Action Triggered', description: 'Viewing offers for ' + merchantUser.name })}>View Offers</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {merchantUser.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(merchantUser.uid, 'approved')}>Approve</DropdownMenuItem>
                        )}
                            {merchantUser.status === 'approved' && (
                            <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(merchantUser.uid, 'deactivated')}>Deactivate</DropdownMenuItem>
                        )}
                        {merchantUser.status === 'deactivated' || merchantUser.status === 'rejected' ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(merchantUser.uid, 'approved')}>Re-Approve</DropdownMenuItem>
                        ) : null}
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
