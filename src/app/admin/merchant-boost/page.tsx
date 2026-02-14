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
import {
  Percent,
  Save,
  BadgePercent,
  IndianRupee,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getBoostSettings, updateBoostSettings } from '@/services/boost-service';
import type { BoostSettings } from '@/lib/types';

const defaultSettings: BoostSettings = {
  boostEnabled: true,
  boostPercentage: 2,
  applyOn: 'gross',
  minRedemptionThreshold: 555,
  autoApproveThreshold: 0,
};

export default function MerchantBoostSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState<BoostSettings>(defaultSettings);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getBoostSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  const handleInputChange = (
    key: keyof BoostSettings,
    value: string | number | boolean
  ) => {
    if (key === 'updatedAt') return;
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateBoostSettings(settings);
      toast({
        title: 'Success!',
        description: 'Merchant Boost settings have been updated successfully.',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to save settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Merchant Boost Settings" />
      <div className="container mx-auto py-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Merchant Boost Cashback Program</CardTitle>
                <CardDescription>
                  Configure the cashback incentive program for merchants.
                </CardDescription>
              </div>
              <BadgePercent className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h4 className="font-medium">Program Status</h4>
                <p className="text-sm text-muted-foreground">
                  Enable or disable the entire Merchant Boost program globally.
                </p>
              </div>
              <Switch
                checked={settings.boostEnabled}
                onCheckedChange={(checked) =>
                  handleInputChange('boostEnabled', checked)
                }
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="boostPercentage">Boost Cashback %</Label>
                <div className="relative">
                  <Input
                    id="boostPercentage"
                    type="number"
                    value={settings.boostPercentage}
                    onChange={(e) =>
                      handleInputChange('boostPercentage', Number(e.target.value))
                    }
                    className="pl-8"
                  />
                  <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Percentage of bill amount given back to the merchant.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Apply On</Label>
                <RadioGroup
                  value={settings.applyOn}
                  onValueChange={(value) => handleInputChange('applyOn', value)}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gross" id="gross" />
                    <Label htmlFor="gross">Gross bill amount</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="final" id="final" />
                    <Label htmlFor="final">Final amount (after coupon)</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Choose which amount to base the calculation on.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minThreshold">
                  Minimum Redemption Threshold (₹)
                </Label>
                <div className="relative">
                  <Input
                    id="minThreshold"
                    type="number"
                    value={settings.minRedemptionThreshold}
                    onChange={(e) =>
                      handleInputChange(
                        'minRedemptionThreshold',
                        Number(e.target.value)
                      )
                    }
                    className="pl-8"
                  />
                  <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Merchant must reach this balance to request withdrawal.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="autoApprove">
                  Auto-approve withdrawals below (₹)
                </Label>
                 <div className="relative">
                  <Input
                    id="autoApprove"
                    type="number"
                    value={settings.autoApproveThreshold}
                    onChange={(e) =>
                      handleInputChange(
                        'autoApproveThreshold',
                        Number(e.target.value)
                      )
                    }
                     className="pl-8"
                  />
                  <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Set to 0 to disable auto-approval.
                </p>
              </div>
            </div>

            <Button
              onClick={handleSaveChanges}
              disabled={isSaving || isLoading}
              className="w-full md:w-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving Settings...' : 'Save Merchant Boost Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
