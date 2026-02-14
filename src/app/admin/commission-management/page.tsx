
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
import { Percent, Save, Building, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCommissionSettings, updateCommissionSettings } from '@/services/commission-service';

const defaultRates = { level1: 50, level2: 30, level3: 20 };
const defaultMerchantBonus = 100;
const defaultLoyaltySplit = { parent: 70, buyer: 20, grandparent: 10 };

export default function CommissionManagementPage() {
  const { toast } = useToast();
  const [mlmRates, setMlmRates] = React.useState(defaultRates);
  const [merchantBonus, setMerchantBonus] = React.useState(defaultMerchantBonus);
  const [loyaltySplit, setLoyaltySplit] = React.useState(defaultLoyaltySplit);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    getCommissionSettings().then((settings) => {
      if (cancelled) return;
      setMlmRates({
        level1: Math.round(settings.level1 / 100),
        level2: Math.round(settings.level2 / 100),
        level3: Math.round(settings.level3 / 100),
      });
      setMerchantBonus(Math.round(settings.merchantBonus / 100));
      setLoyaltySplit({
        parent: settings.loyaltyPointsSharePctParent ?? defaultLoyaltySplit.parent,
        buyer: settings.loyaltyPointsSharePctBuyer ?? defaultLoyaltySplit.buyer,
        grandparent: settings.loyaltyPointsSharePctGrandparent ?? defaultLoyaltySplit.grandparent,
      });
    }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleMlmRateChange = (level: keyof typeof mlmRates, value: string) => {
    const numericValue = Number(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setMlmRates((prevRates) => ({
        ...prevRates,
        [level]: numericValue,
      }));
    }
  };

  const handleMerchantBonusChange = (value: string) => {
    const numericValue = Number(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setMerchantBonus(numericValue);
    }
  };

  const handleLoyaltySplitChange = (key: keyof typeof loyaltySplit, value: string) => {
    const n = Number(value);
    if (!isNaN(n) && n >= 0 && n <= 100) {
      setLoyaltySplit((prev) => ({ ...prev, [key]: n }));
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateCommissionSettings({
        level1: Math.round(mlmRates.level1 * 100),
        level2: Math.round(mlmRates.level2 * 100),
        level3: Math.round(mlmRates.level3 * 100),
        merchantBonus: Math.round(merchantBonus * 100),
        parentPointsSharePct: loyaltySplit.parent,
        loyaltyPointsSharePctParent: loyaltySplit.parent,
        loyaltyPointsSharePctBuyer: loyaltySplit.buyer,
        loyaltyPointsSharePctGrandparent: loyaltySplit.grandparent,
      });
      toast({
        title: 'Success!',
        description: 'Commission settings have been saved.',
      });
    } catch (e: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to save',
        description: e instanceof Error ? e.message : 'Could not update commission settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Commission Management" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Commission Management" />
      <div className="container mx-auto py-4 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>MLM Referral Commissions</CardTitle>
                <CardDescription>
                  Configure the referral commission rates for each level when a new member signs up.
                </CardDescription>
              </div>
              <Percent className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="level1">Level 1 Commission (Direct Referrer)</Label>
                <Input
                  id="level1"
                  type="number"
                  value={mlmRates.level1}
                  onChange={(e) => handleMlmRateChange('level1', e.target.value)}
                  placeholder="e.g., 50"
                />
                 <p className="text-xs text-muted-foreground">Amount (in ₹) the direct referrer earns.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level2">Level 2 Commission (Indirect Referrer)</Label>
                <Input
                  id="level2"
                  type="number"
                  value={mlmRates.level2}
                  onChange={(e) => handleMlmRateChange('level2', e.target.value)}
                  placeholder="e.g., 30"
                />
                <p className="text-xs text-muted-foreground">Amount (in ₹) the level 2 upline earns.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level3">Level 3 Commission</Label>
                <Input
                  id="level3"
                  type="number"
                  value={mlmRates.level3}
                  onChange={(e) => handleMlmRateChange('level3', e.target.value)}
                  placeholder="e.g., 20"
                />
                 <p className="text-xs text-muted-foreground">Amount (in ₹) the level 3 upline earns.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col gap-8">
            <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                <div>
                    <CardTitle>Merchant Recruitment Bonus</CardTitle>
                    <CardDescription>
                    Set a flat-rate commission for any user who recruits a new merchant.
                    </CardDescription>
                </div>
                <Building className="h-8 w-8 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="merchantBonus">Recruitment Commission Amount</Label>
                    <Input
                    id="merchantBonus"
                    type="number"
                    value={merchantBonus}
                    onChange={(e) => handleMerchantBonusChange(e.target.value)}
                    placeholder="e.g., 100"
                    />
                    <p className="text-xs text-muted-foreground">
                        The flat amount (in ₹) earned for onboarding a new merchant.
                    </p>
                </div>
            </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loyalty Points Split (Parent : Buyer : Grandparent)</CardTitle>
                <CardDescription>
                  When a referred member earns purchase points, they are shared between the buyer (child), their referrer (parent), and the parent&apos;s referrer (grandparent). Example: 70:20:10. Must sum to 100.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loyaltyParent">Parent (L1) %</Label>
                    <Input
                      id="loyaltyParent"
                      type="number"
                      min={0}
                      max={100}
                      value={loyaltySplit.parent}
                      onChange={(e) => handleLoyaltySplitChange('parent', e.target.value)}
                      placeholder="70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loyaltyBuyer">Buyer (child) %</Label>
                    <Input
                      id="loyaltyBuyer"
                      type="number"
                      min={0}
                      max={100}
                      value={loyaltySplit.buyer}
                      onChange={(e) => handleLoyaltySplitChange('buyer', e.target.value)}
                      placeholder="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loyaltyGrandparent">Grandparent (L2) %</Label>
                    <Input
                      id="loyaltyGrandparent"
                      type="number"
                      min={0}
                      max={100}
                      value={loyaltySplit.grandparent}
                      onChange={(e) => handleLoyaltySplitChange('grandparent', e.target.value)}
                      placeholder="10"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sum: {loyaltySplit.parent + loyaltySplit.buyer + loyaltySplit.grandparent}%. Recommendation: 70:20:10.
                </p>
              </CardContent>
            </Card>

            <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving All Settings...' : 'Save All Commission Settings'}
            </Button>
        </div>

      </div>
    </main>
  );
}

