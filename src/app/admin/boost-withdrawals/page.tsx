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
import { CheckCircle, XCircle, Clock, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { listBoostWithdrawals, updateBoostWithdrawalStatus } from '@/services/boost-service';
import { getMerchantById } from '@/services/merchant-service';
import type { BoostWithdrawal, Merchant } from '@/lib/types';

export default function BoostWithdrawalsPage() {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = React.useState<BoostWithdrawal[]>([]);
  const [merchants, setMerchants] = React.useState<Record<string, Merchant | null>>({});
  const [loading, setLoading] = React.useState(true);
  const [actingId, setActingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const list = await listBoostWithdrawals(200);
    setWithdrawals(list);
    const ids = [...new Set(list.map((w) => w.merchantId))];
    const map: Record<string, Merchant | null> = {};
    await Promise.all(ids.map(async (id) => { map[id] = await getMerchantById(id); }));
    setMerchants(map);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (w: BoostWithdrawal) => {
    setActingId(w.id);
    const result = await updateBoostWithdrawalStatus(w.id, 'completed');
    setActingId(null);
    if (result.success) {
      toast({ title: 'Approved', description: `Withdrawal ₹${w.amount.toFixed(2)} marked completed.` });
      load();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };

  const handleReject = async (w: BoostWithdrawal) => {
    setActingId(w.id);
    const result = await updateBoostWithdrawalStatus(w.id, 'rejected', { note: 'Rejected by admin' });
    setActingId(null);
    if (result.success) {
      toast({ title: 'Rejected', description: `Withdrawal ₹${w.amount.toFixed(2)} rejected; balance refunded to merchant.` });
      load();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };

  const pending = withdrawals.filter((w) => w.status === 'pending');
  const completed = withdrawals.filter((w) => w.status === 'completed' || w.status === 'rejected');

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Boost Withdrawals" />
      <div className="container mx-auto py-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Merchant Boost Withdrawal Requests
            </CardTitle>
            <CardDescription>
              Approve or reject Boost balance withdrawal requests. Rejected requests refund the amount to the merchant&apos;s Boost balance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <>
                <h4 className="font-medium mb-2">Pending ({pending.length})</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No pending Boost withdrawals.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pending.map((w) => (
                        <TableRow key={w.id}>
                          <TableCell>
                            {merchants[w.merchantId]?.name ?? w.merchantId}
                          </TableCell>
                          <TableCell className="font-medium">₹{w.amount.toFixed(2)}</TableCell>
                          <TableCell>{format(w.createdAt, 'PPp')}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(w)}
                              disabled={actingId !== null}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              {actingId === w.id ? '...' : 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(w)}
                              disabled={actingId !== null}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <h4 className="font-medium mt-8 mb-2">History ({completed.length})</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reviewed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completed.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                          No completed or rejected withdrawals yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      completed.slice(0, 50).map((w) => (
                        <TableRow key={w.id}>
                          <TableCell>{merchants[w.merchantId]?.name ?? w.merchantId}</TableCell>
                          <TableCell className="font-medium">₹{w.amount.toFixed(2)}</TableCell>
                          <TableCell>{format(w.createdAt, 'PPp')}</TableCell>
                          <TableCell>
                            <Badge variant={w.status === 'completed' ? 'default' : 'destructive'}>
                              {w.status === 'completed' ? 'Completed' : 'Rejected'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {w.reviewedAt ? format(w.reviewedAt, 'PPp') : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
