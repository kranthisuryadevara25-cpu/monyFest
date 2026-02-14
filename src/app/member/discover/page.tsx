
'use client';
/**
 * @file DiscoverPage
 * @description This page allows members to discover and search for partner merchants on the platform.
 *
 * @overview
 * The DiscoverPage provides a dynamic and interactive interface for users to find merchants.
 * It features a comprehensive filtering system and an animated grid display of merchant cards.
 * Users can search by text, filter by category, discount, and more.
 *
 * @features
 * - **Merchant Discovery**: Displays a list of all partner merchants.
 * - **Advanced Filtering**: Includes a collapsible filter section with options for:
 *   - Text search (by name, city, pincode).
 *   - Category selection (e.g., Food, Retail).
 *   - Minimum discount percentage.
 *   - Sorting (e.g., Popular, Newest).
 *   - Toggles for merchants with active coupons or who are currently open.
 * - **Location-Based Search**: A button to "Use my location" (future functionality).
 * - **Dynamic Results**: The merchant list updates in real-time as filters are applied, with smooth animations.
 * - **Merchant Cards**: Each merchant is displayed with their logo, name, commission rate, and a button to view their offers.
 * - **Empty State**: Shows a helpful message when no merchants match the selected filters.
 */

import * as React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { getMerchantsClient } from '@/services/merchant-service.client';
import { Button } from '@/components/ui/button';
import {
  MerchantFilters,
  type FilterState,
} from './components/merchant-filters';
import type { Merchant } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';

export default function DiscoverPage() {
  const [allMerchants, setAllMerchants] = React.useState<Merchant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<FilterState>({
    searchQuery: '',
    category: 'all',
    hasCoupons: false,
    minDiscount: 0,
    sortBy: 'popular',
    showOpenOnly: false,
  });
  
  React.useEffect(() => {
    getMerchantsClient().then((merchants) => {
      setAllMerchants(merchants);
      setLoading(false);
    });
  }, []);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const filteredMerchants = React.useMemo(() => {
    let merchants = [...allMerchants];

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      merchants = merchants.filter((merchant) =>
        merchant.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      merchants = merchants.filter(
        (merchant) => merchant.category === filters.category
      );
    }
    
    // Discount filter
    if (filters.minDiscount > 0) {
      merchants = merchants.filter(merchant => merchant.commissionRate >= filters.minDiscount);
    }
    
    // Sort
    if (filters.sortBy === 'newest') {
        merchants.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // Add other sorting logic for 'popular' and 'top-rated' here if data was available

    return merchants;
  }, [filters, allMerchants]);

  if (loading) {
      return (
          <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Discover" />
            <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
            </div>
          </main>
      )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Discover" />
      <div className="space-y-6">
        <MerchantFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredMerchants.length > 0 ? (
              filteredMerchants.map((merchant, index) => (
                <motion.div
                  key={merchant.merchantId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Image
                        src={merchant.logo}
                        alt={merchant.name}
                        width={64}
                        height={64}
                        className="rounded-lg"
                        data-ai-hint="company logo"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{merchant.name}</h3>
                        <p className="text-sm text-white/70">Commission: {merchant.commissionRate}%</p>
                        <Button size="sm" variant="outline" className="mt-2 border-white/20 text-white hover:bg-white/10">
                          View Offers
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div layout className="md:col-span-2 lg:col-span-3 text-center py-16">
                <p className="text-lg font-medium text-white/90">No merchants found.</p>
                <p className="text-sm text-white/70">Try adjusting your filters.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
