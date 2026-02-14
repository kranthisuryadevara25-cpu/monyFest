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
  getLoyaltySlabConfig,
  setLoyaltySlabConfig,
  listLoyaltySlabCategoryIds,
} from '@/services/loyalty-slab-service';
import type { LoyaltySlab } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Layers, Loader2, Plus, Trash2 } from 'lucide-react';

const PRESET_CATEGORIES = [
  'default',
  'food',
  'retail',
  'books',
  'services',
  'other',
  'medical',
  'spa',
];

export default function LoyaltySlabsPage() {
  const { toast } = useToast();
  const [categoryIds, setCategoryIds] = React.useState<string[]>(PRESET_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('default');
  const [slabs, setSlabs] = React.useState<LoyaltySlab[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');

  const loadConfig = React.useCallback(async (category: string) => {
    const config = await getLoyaltySlabConfig(category);
    setSlabs(config?.slabs ?? []);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    listLoyaltySlabCategoryIds().then((ids) => {
      if (cancelled) return;
      const combined = Array.from(new Set([...PRESET_CATEGORIES, ...ids]));
      setCategoryIds(combined);
    });
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    setIsLoading(true);
    loadConfig(selectedCategory).finally(() => setIsLoading(false));
  }, [selectedCategory, loadConfig]);

  const addSlab = () => {
    const maxPrev = slabs.length
      ? Math.max(...slabs.map((s) => (s.maxAmountPaise ?? s.minAmountPaise)))
      : 0;
    setSlabs((prev) => [
      ...prev,
      {
        minAmountPaise: maxPrev,
        maxAmountPaise: null,
        points: 0,
      },
    ]);
  };

  const removeSlab = (index: number) => {
    setSlabs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSlab = (index: number, field: 'minAmountPaise' | 'maxAmountPaise' | 'points', value: number | null) => {
    setSlabs((prev) =>
      prev.map((s, i) =>
        i !== index ? s : { ...s, [field]: value }
      )
    );
  };

  const handleSave = async () => {
    const sorted = [...slabs]
      .map((s) => ({
        minAmountPaise: s.minAmountPaise,
        maxAmountPaise: s.maxAmountPaise,
        points: s.points,
      }))
      .sort((a, b) => a.minAmountPaise - b.minAmountPaise);
    setIsSaving(true);
    try {
      await setLoyaltySlabConfig(selectedCategory, sorted);
      toast({ title: 'Saved', description: `Slabs for "${selectedCategory}" saved.` });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Failed to save',
        description: e instanceof Error ? e.message : 'Could not save slabs.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addNewCategory = () => {
    const name = newCategoryName.trim().toLowerCase();
    if (!name) return;
    if (categoryIds.includes(name)) {
      setSelectedCategory(name);
    } else {
      setCategoryIds((prev) => [...prev, name].sort());
      setSelectedCategory(name);
      setSlabs([]);
      setNewCategoryName('');
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Loyalty Slabs" />
      <div className="container mx-auto py-4 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-6 w-6" />
                  Slab-based loyalty points
                </CardTitle>
                <CardDescription>
                  Set points by order value (₹) per category or industry. E.g. ₹0–99 → 0 pts, ₹100–199 → 10 pts, ₹200–299 → 25 pts, above ₹300 → 30 pts. If no slab is defined for a category, per-offer loyalty points are used instead.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2 items-center">
              <Label>Category / industry</Label>
              <select
                className="border rounded-md px-3 py-2 bg-background"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Input
                  placeholder="New category (e.g. medical, spa)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-48"
                />
                <Button type="button" variant="outline" size="sm" onClick={addNewCategory}>
                  Add
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Merchants use <strong>industry</strong> (if set) or <strong>category</strong> for slab lookup. Use &quot;default&quot; for fallback when no slab exists for the merchant&apos;s category/industry.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Slabs (min ₹, max ₹ or leave empty for &quot;above&quot;, points)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSlab}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add slab
                    </Button>
                  </div>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2">Min (₹)</th>
                          <th className="text-left p-2">Max (₹) or above</th>
                          <th className="text-left p-2">Points</th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        {slabs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-muted-foreground">
                              No slabs. Add one or use per-offer points for this category.
                            </td>
                          </tr>
                        )}
                        {slabs.map((slab, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">
                              <Input
                                type="number"
                                min={0}
                                step={1}
                                value={(slab.minAmountPaise / 100).toFixed(0)}
                                onChange={(e) =>
                                  updateSlab(
                                    index,
                                    'minAmountPaise',
                                    Math.round(parseFloat(e.target.value || '0') * 100)
                                  )
                                }
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                min={0}
                                step={1}
                                placeholder="Above"
                                value={
                                  slab.maxAmountPaise != null
                                    ? (slab.maxAmountPaise / 100).toFixed(0)
                                    : ''
                                }
                                onChange={(e) => {
                                  const v = e.target.value.trim();
                                  updateSlab(
                                    index,
                                    'maxAmountPaise',
                                    v === '' ? null : Math.round(parseFloat(v) * 100)
                                  );
                                }}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                min={0}
                                value={slab.points}
                                onChange={(e) =>
                                  updateSlab(index, 'points', Math.floor(parseFloat(e.target.value || '0') || 0))
                                }
                              />
                            </td>
                            <td className="p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSlab(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save slabs for &quot;{selectedCategory}&quot;
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
