'use client';

import * as React from 'react';
import {
  SlidersHorizontal,
  MapPin,
  Search,
  ChevronDown,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Collapsible as ShadcnCollapsible } from '@/components/ui/collapsible';

export type FilterState = {
  searchQuery: string;
  category: string;
  hasCoupons: boolean;
  minDiscount: number;
  sortBy: string;
  showOpenOnly: boolean;
};

type MerchantFiltersProps = {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  className?: string;
};

export function MerchantFilters({
  filters,
  onFilterChange,
  className,
}: MerchantFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleResetFilters = () => {
    onFilterChange({
      searchQuery: '',
      category: 'all',
      hasCoupons: false,
      minDiscount: 0,
      sortBy: 'popular',
      showOpenOnly: false,
    });
  };

  const activeFilterCount =
    (filters.searchQuery ? 1 : 0) +
    (filters.category !== 'all' ? 1 : 0) +
    (filters.hasCoupons ? 1 : 0) +
    (filters.minDiscount > 0 ? 1 : 0) +
    (filters.sortBy !== 'popular' ? 1 : 0) +
    (filters.showOpenOnly ? 1 : 0);

  return (
    <ShadcnCollapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl section-title text-white">Discover Merchants</CardTitle>
              <CardDescription className="text-white/70">Find the perfect deals from our partners.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleResetFilters}>
                Reset
                {activeFilterCount > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  <ChevronDown
                    className={`ml-2 h-4 w-4 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Search by name, city, pincode..."
                className="pl-10 border-white/20 bg-white/5 text-white placeholder:text-white/50"
                value={filters.searchQuery}
                onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
              <MapPin className="mr-2 h-4 w-4" /> Use my location
            </Button>
          </div>
        </CardContent>
        <CollapsibleContent>
          <div className="border-t border-white/10">
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="category-select" className="text-white/90">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => onFilterChange({ category: value })}
                >
                  <SelectTrigger id="category-select">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="books">Books & Hobbies</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Filter */}
              <div className="space-y-2">
                <Label htmlFor="discount-slider" className="text-white/90">
                  Discount ({filters.minDiscount}% or more)
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="discount-slider"
                    min={0}
                    max={50}
                    step={5}
                    value={[filters.minDiscount]}
                    onValueChange={([value]) =>
                      onFilterChange({ minDiscount: value })
                    }
                  />
                  <span className="text-sm font-medium w-12 text-right text-white/90">
                    {filters.minDiscount}%
                  </span>
                </div>
              </div>

              {/* Sorting Filter */}
              <div className="space-y-2">
                <Label htmlFor="sort-select" className="text-white/90">Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => onFilterChange({ sortBy: value })}
                >
                  <SelectTrigger id="sort-select">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="top-rated">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                {/* Active Coupons Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-coupons-switch"
                    checked={filters.hasCoupons}
                    onCheckedChange={(checked) =>
                      onFilterChange({ hasCoupons: checked })
                    }
                  />
                  <Label htmlFor="has-coupons-switch" className="text-white/90">Active Coupons</Label>
                </div>

                {/* Open Now Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="open-now-switch"
                    checked={filters.showOpenOnly}
                    onCheckedChange={(checked) =>
                      onFilterChange({ showOpenOnly: checked })
                    }
                  />
                  <Label htmlFor="open-now-switch" className="text-white/90">Open Now</Label>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </ShadcnCollapsible>
  );
}
