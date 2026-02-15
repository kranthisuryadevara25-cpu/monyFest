
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
import { updateUserStatus } from '@/services/user-service';

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

type AgentListProps = {
    initialAgents: User[];
    referralCounts: Record<string, number>;
}

export function AgentList({ initialAgents, referralCounts }: AgentListProps) {
  const { toast } = useToast();
  const [agents, setAgents] = React.useState<User[]>(initialAgents);
  const [loading, setLoading] = React.useState(false);


  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    setLoading(true);
    try {
      await updateUserStatus(userId, newStatus);
      setAgents((prev) =>
        prev.map((agent) => (agent.uid === userId ? { ...agent, status: newStatus } : agent))
      );
      toast({
        title: 'Status Updated',
        description: `Agent has been ${newStatus}.`,
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: e instanceof Error ? e.message : 'Could not update agent status.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = () => {
    const data = agents.map(agent => [
      agent.uid,
      agent.name,
      agent.email,
      agent.status,
      agent.walletBalance.toFixed(2),
      (referralCounts[agent.uid] || 0).toString(),
      format(agent.createdAt, 'PPpp'),
    ]);
    exportToCsv('agents.csv', [
      ['ID', 'Name', 'Email', 'Status', 'Wallet Balance', 'Network Size', 'Joined On'],
      ...data,
    ]);
    toast({ title: 'Export Complete', description: 'Agent data has been exported to agents.csv.' });
  };


  const renderSkeleton = () => (
    Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={`skel-agent-${i}`}>
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
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
    <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleExport} disabled={agents.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Export to CSV
        </Button>
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Agent</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Wallet Balance</TableHead>
          <TableHead>Network Size</TableHead>
          <TableHead>Joined On</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? renderSkeleton() : agents.map((agent) => (
            <TableRow key={agent.uid}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={agent.avatarUrl}
                      alt={agent.name}
                      data-ai-hint="person portrait"
                    />
                    <AvatarFallback>
                      {agent.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {agent.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                    variant={
                        agent.status === 'approved' ? 'secondary' 
                        : agent.status === 'pending' ? 'outline'
                        : 'destructive'
                    }
                    className="capitalize"
                >
                  <StatusIcon status={agent.status} />
                  {agent.status}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                ₹{agent.walletBalance.toFixed(2)}
              </TableCell>
              <TableCell>{referralCounts[agent.uid] || 0} users</TableCell>
              <TableCell>
                {format(agent.createdAt, 'PP')}
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
                      <DropdownMenuItem onSelect={() => toast({ title: 'Action Triggered', description: 'Viewing details for ' + agent.name })}>
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {agent.status === 'pending' && (
                        <>
                            <DropdownMenuItem onClick={() => handleStatusChange(agent.uid, 'approved')}>Approve</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(agent.uid, 'rejected')}>Reject</DropdownMenuItem>
                        </>
                    )}
                    {agent.status === 'approved' && (
                        <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(agent.uid, 'deactivated')}>Deactivate</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
        ))}
      </TableBody>
    </Table>
    </>
  );
}
