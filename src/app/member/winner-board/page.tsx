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
import { Trophy, Gift } from 'lucide-react';
import { getLuckyDrawWinners } from '@/services/lucky-draw-service';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function WinnerBoardPage() {
  const [winners, setWinners] = React.useState<Awaited<ReturnType<typeof getLuckyDrawWinners>>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getLuckyDrawWinners(100).then((list) => {
      setWinners(list);
      setLoading(false);
    });
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Lucky Draw Winner Board" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Lucky Draw Winners
          </CardTitle>
          <CardDescription>
            Daily draw winners: 100% Cashback, Prize Money, or Vouchers. Minimum purchase qualifies for one entry per day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Draw date</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Declared</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                      No winners yet. Check back after the first draw!
                    </TableCell>
                  </TableRow>
                ) : (
                  winners.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{w.drawDate}</TableCell>
                      <TableCell>{w.userName ?? 'Winner'}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          <Gift className="h-4 w-4 text-amber-500" />
                          {w.rewardDescription}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(w.createdAt, 'PPp')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
