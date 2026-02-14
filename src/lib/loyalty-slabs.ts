import type { LoyaltySlab } from '@/lib/types';

/** Slabs must be ordered by minAmountPaise ascending. Returns points for the first matching slab, or 0. */
export function getSlabPoints(totalAmountPaise: number, slabs: LoyaltySlab[]): number {
  if (!slabs?.length) return 0;
  for (const slab of slabs) {
    const inRange =
      totalAmountPaise >= slab.minAmountPaise &&
      (slab.maxAmountPaise == null || totalAmountPaise <= slab.maxAmountPaise);
    if (inRange) return Math.max(0, Math.floor(slab.points));
  }
  return 0;
}

/** Resolves slab config key from merchant: industry if set, else category. Falls back to "default". */
export function getSlabCategoryKey(industry?: string | null, category?: string | null): string {
  const key = (industry ?? category ?? 'default').trim().toLowerCase();
  return key || 'default';
}
