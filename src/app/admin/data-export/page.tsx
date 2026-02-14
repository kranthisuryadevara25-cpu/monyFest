

'use client';
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
  FileDown,
  Calendar as CalendarIcon,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import type { User } from '@/lib/types';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { getUsersClient } from '@/services/user-service.client';
import { Skeleton } from '@/components/ui/skeleton';

type Filter = {
  location: string;
  status: 'all' | User['status'];
  dateRange?: DateRange;
  category: 'all' | string;
};

const ExportTable = ({ users, role }: { users: User[]; role: string }) => {
  const [filters, setFilters] = React.useState<Filter>({
    location: '',
    status: 'all',
    category: 'all',
  });

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const locationMatch = filters.location
        ? user.email?.toLowerCase().includes(filters.location.toLowerCase()) // Using email as a proxy for location for now
        : true;
      const statusMatch =
        filters.status === 'all' ? true : user.status === filters.status;
      const dateMatch =
        filters.dateRange?.from && filters.dateRange.to
          ? user.createdAt >= filters.dateRange.from &&
            user.createdAt <= filters.dateRange.to
          : true;
      return locationMatch && statusMatch && dateMatch;
    });
  }, [users, filters]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export {role}</CardTitle>
        <CardDescription>
          Filter and export a list of all {role.toLowerCase()} on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg">
          <Input
            placeholder="Filter by location..."
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
            className="lg:col-span-1"
          />
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value as Filter['status'] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="deactivated">Deactivated</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'justify-start text-left font-normal',
                  !filters.dateRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                      {format(filters.dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(filters.dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={filters.dateRange}
                onSelect={(range) => setFilters({ ...filters, dateRange: range })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={() => setFilters({ location: '', status: 'all', category: 'all' })}>
            <Search className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </div>

        <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
                Found {filteredUsers.length} records.
            </p>
            <div className="flex gap-2">
                <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
                <Button>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export Excel
                </Button>
            </div>
        </div>

        <div className="overflow-auto max-h-96">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredUsers.slice(0, 10).map((user) => ( // show first 10 as preview
                    <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                        <Badge
                        variant={user.status === 'approved' ? 'secondary' 
                            : user.status === 'deactivated' || user.status === 'rejected' ? 'destructive'
                            : 'outline'}
                        className="capitalize"
                        >
                        {user.status}
                        </Badge>
                    </TableCell>
                    <TableCell>{format(user.createdAt, 'PP')}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DataExportPage() {
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    getUsersClient().then(users => {
      setAllUsers(users);
      setLoading(false);
    });
  }, []);

  const customers = allUsers.filter((u) => u.role === 'member');
  const agents = allUsers.filter((u) => u.role === 'agent');
  const merchants = allUsers.filter((u) => u.role === 'merchant');

  if (loading) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Data Export" />
            <div className="container mx-auto py-4">
              <Skeleton className="h-96 w-full" />
            </div>
        </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Data Export" />
      <div className="container mx-auto py-4">
        <Tabs defaultValue="customers">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="merchants">Merchants</TabsTrigger>
          </TabsList>
          <TabsContent value="customers">
            <ExportTable users={customers} role="Customers" />
          </TabsContent>
          <TabsContent value="agents">
            <ExportTable users={agents} role="Agents" />
          </TabsContent>
          <TabsContent value="merchants">
            <ExportTable users={merchants} role="Merchants" />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
