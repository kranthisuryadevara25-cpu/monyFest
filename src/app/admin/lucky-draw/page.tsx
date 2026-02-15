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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, IndianRupee, Gift, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  getLuckyDrawConfig,
  updateLuckyDrawConfig,
  getEntriesForDraw,
  runDrawForDate,
  getLuckyDrawWinners,
} from '@/services/lucky-draw-service';
import type { LuckyDrawConfig } from '@/lib/types';
import Link from 'next/link';

const defaultConfig: LuckyDrawConfig = {
  enabled: true,
  minPurchaseRupees: 555,
  rewardType: 'cashback',
  rewardDescription: '100% Cashback',
};

function getDrawDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AdminLuckyDrawPage() {
  const { toast } = useToast();
  const [config, setConfig] = React.useState<LuckyDrawConfig>(defaultConfig);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [entries, setEntries] = React.useState<{ id: string; userId: string; amountRupees: number; drawDate: string }[]>([]);
  const [drawDate, setDrawDate] = React.useState(getDrawDate());
  const [runningDraw, setRunningDraw] = React.useState(false);
  const [recentWinners, setRecentWinners] = React.useState<Awaited<ReturnType<typeof getLuckyDrawWinners>>>([]);

  const load = React.useCallback(async () => {
    const [c, e, w] = await Promise.all([
      getLuckyDrawConfig(),
      getEntriesForDraw(drawDate),
      getLuckyDrawWinners(10),
    ]);
    setConfig(c);
    setEntries(e);
    setRecentWinners(w);
    setIsLoading(false);
  }, [drawDate]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleChange = (key: keyof LuckyDrawConfig, value: string | number | boolean) => {
    if (key === 'updatedAt') return;
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateLuckyDrawConfig(config);
      toast({ title: 'Saved', description: 'Lucky Draw settings updated.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: e instanceof Error ? e.message : 'Save failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunDraw = async () => {
    setRunningDraw(true);
    try {
      const result = await runDrawForDate(drawDate);
      if (result.success) {
        toast({ title: 'Draw complete', description: `Winner selected for ${drawDate}.` });
        load();
      } else {
        toast({ variant: 'destructive', title: 'Draw failed', description: result.error });
      }
    } finally {
      setRunningDraw(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Lucky Draw" />
      <div className="container mx-auto py-4 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Daily draw: minimum purchase qualifies for one entry. Admin runs the draw and a random winner is selected.
          </p>
          <Button variant="outline" asChild>
            <Link href="/member/winner-board">View Winner Board</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Lucky Draw Settings</CardTitle>
            <CardDescription>Eligibility (min purchase) and reward type (100% CB / prize money / vouchers).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h4 className="font-medium">Enable Lucky Draw</h4>
                <p className="text-sm text-muted-foreground">Allow entries and daily draw.</p>
              </div>
              <Switch checked={config.enabled} onCheckedChange={(v) => handleChange('enabled', v)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minPurchase">Minimum purchase (₹) for one entry</Label>
              <div className="relative">
                <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="minPurchase"
                  type="number"
                  min={0}
                  value={config.minPurchaseRupees}
                  onChange={(e) => handleChange('minPurchaseRupees', Number(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reward type</Label>
              <RadioGroup
                value={config.rewardType}
                onValueChange={(v) => handleChange('rewardType', v as LuckyDrawConfig['rewardType'])}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cashback" id="cb" />
                  <Label htmlFor="cb">100% Cashback</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prize_money" id="pm" />
                  <Label htmlFor="pm">Prize money</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vouchers" id="v" />
                  <Label htmlFor="v">Vouchers</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rewardDesc">Reward description (e.g. &quot;100% Cashback&quot; or &quot;₹5000 Prize&quot;)</Label>
              <Input
                id="rewardDesc"
                value={config.rewardDescription}
                onChange={(e) => handleChange('rewardDescription', e.target.value)}
                placeholder="100% Cashback"
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save settings'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Run daily draw</CardTitle>
            <CardDescription>Select date and run the draw. One random winner from that day&apos;s entries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-2">
                <Label>Draw date</Label>
                <Input
                  type="date"
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                />
              </div>
              <Button onClick={load} variant="outline" className="mt-6">Refresh entries</Button>
              <Button onClick={handleRunDraw} disabled={runningDraw || entries.length === 0} className="mt-6">
                {runningDraw ? 'Running...' : `Run draw for ${drawDate}`}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Entries for {drawDate}: <strong>{entries.length}</strong>
            </p>
            {entries.length > 0 && (
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 max-h-40 overflow-y-auto">
                {entries.slice(0, 20).map((e) => (
                  <li key={e.id}>User {e.userId.slice(0, 8)}… — ₹{e.amountRupees.toFixed(0)}</li>
                ))}
                {entries.length > 20 && <li>… and {entries.length - 20} more</li>}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent winners</CardTitle>
            <CardDescription>Latest lucky draw winners. Full list on Winner Board.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentWinners.length === 0 ? (
              <p className="text-sm text-muted-foreground">No winners yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentWinners.map((w) => (
                  <li key={w.id} className="flex justify-between">
                    <span>{w.drawDate}</span>
                    <span>{w.userName ?? w.userId}</span>
                    <span className="text-amber-600">{w.rewardDescription}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
