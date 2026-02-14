
'use client';
/**
 * @file ShopPage
 * @description This page provides an e-commerce-like experience where members can browse and "purchase" products, which are represented by offers.
 *
 * @overview
 * The ShopPage simulates an online store. It fetches active offers and presents them as products in a grid layout.
 * Each product card displays an image, title, price, and an "Add to Cart" button. The data is fetched from live
 * services, but the "price" and "add to cart" functionality are currently for demonstration purposes.
 *
 * @features
 * - **Product Grid**: Displays available products (offers) in a responsive grid.
 * - **Fetches Live Data**:
 *   - Retrieves all active offers from the `offer-service`.
 *   - Fetches all merchants from the `merchant-service` to display merchant names.
 * - **Product Cards**: Each card includes:
 *   - A placeholder product image using `picsum.photos`.
 *   - The product title (from the offer title).
 *   - The name of the merchant providing the product.
 *   - A dummy price, calculated from the offer's point or discount value.
 * - **Search Bar**: A search input for future product filtering functionality.
 * - **Add to Cart**: A button that simulates adding an item to a shopping cart by showing a toast notification.
 * - **Loading State**: Displays a simple "Loading products..." message while data is being fetched.
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { getOffersClient } from '@/services/offer-service.client';
import { getMerchantsClient } from '@/services/merchant-service.client';
import type { Offer, Merchant } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShopPage() {
  const { toast } = useToast();
  const [products, setProducts] = React.useState<Offer[]>([]);
  const [merchants, setMerchants] = React.useState<Map<string, Merchant>>(new Map());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        const [fetchedOffers, fetchedMerchants] = await Promise.all([
            getOffersClient('active'),
            getMerchantsClient()
        ]);
        
        // Using offers as dummy products
        const productsFromOffers = fetchedOffers.map(offer => ({
            ...offer,
            price: (offer.points ? offer.points / 5 : offer.discountValue / 10).toFixed(2), // dummy price
        }));
        
        setProducts(productsFromOffers);
        setMerchants(new Map(fetchedMerchants.map(m => [m.merchantId, m])));
        setLoading(false);
      }
      fetchData();
  }, []);

  const handleAddToCart = (productName: string) => {
    toast({
        title: "Added to Cart",
        description: `${productName} has been added to your shopping cart.`,
    })
  }
  
  if (loading) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Shop" />
            <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full" />
                    ))}
                </div>
            </div>
        </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Shop" />
      <div className="space-y-6">
        <Card>
              <CardHeader>
                  <CardTitle>Shop</CardTitle>
                  <CardDescription>Browse and order products from our partner merchants.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="flex gap-2 max-w-sm">
                      <Input placeholder="Search for products..." />
                      <Button variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
                  </div>
              </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map(product => {
                const merchantName = merchants.get(product.merchantIds[0])?.name || product.merchantName;
                return (
                  <Card key={product.offerId} className="overflow-hidden group">
                      <div className="relative aspect-video overflow-hidden">
                          <Image src={`https://picsum.photos/seed/${product.offerId}/600/400`} alt={product.title} layout="fill" className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="product photo"/>
                      </div>
                      <div className="p-4 space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground">{merchantName}</p>
                            <h3 className="font-semibold text-lg truncate">{product.title}</h3>
                          </div>
                          <div className="flex justify-between items-center">
                              <p className="font-bold text-xl">₹{(product as any).price}</p>
                              <Button onClick={() => handleAddToCart(product.title)} size="sm">
                                  <ShoppingCart className="mr-2 h-4 w-4" />
                                  Add to Cart
                              </Button>
                          </div>
                      </div>
                  </Card>
              )})}
          </div>
      </div>
    </main>
  );
}
