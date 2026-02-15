
'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Archive } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import type { Offer, Merchant, User } from '@/lib/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { getOffers, updateOfferStatus } from '@/services/offer-service';
import { getMerchants } from '@/services/merchant-service';
import { useAuth } from '@/lib/auth';
import { getUserById } from '@/services/user-service';

export default function CouponsPage() {
    const { toast } = useToast();
    const { user: authUser } = useAuth();
    const [offers, setOffers] = React.useState<Offer[]>([]);
    const [merchant, setMerchant] = React.useState<Merchant | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            if (!authUser) return;

            const userProfile = await getUserById(authUser.uid);
            if (!userProfile || !userProfile.merchantId) return;

            const allMerchants = await getMerchants();
            const currentMerchant = allMerchants.find(m => m.merchantId === userProfile.merchantId);
            
            if (currentMerchant) {
                setMerchant(currentMerchant);
                const allOffers = await getOffers();
                const merchantOffers = allOffers.filter(o => o.merchantIds.includes(currentMerchant.merchantId));
                setOffers(merchantOffers);
            }
        };

        fetchData();
    }, [authUser]);

    const handleArchive = async (offerId: string) => {
        try {
            await updateOfferStatus(offerId, 'expired');
            setOffers((prev) => prev.filter((o) => o.offerId !== offerId));
            toast({
                title: 'Offer Archived',
                description: 'The offer has been expired and removed from active list.',
            });
        } catch (e) {
            toast({
                variant: 'destructive',
                title: 'Archive failed',
                description: e instanceof Error ? e.message : 'Could not archive offer.',
            });
        }
    }
  
  if (!merchant) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Manage Offers & Coupons" />
            <Card>
                <CardHeader>
                    <CardTitle>Loading...</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Loading merchant data...</p>
                </CardContent>
            </Card>
        </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Manage Offers & Coupons" />
        <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Offers</CardTitle>
                <CardDescription>Create and manage loyalty offers for your customers. Found {offers.length} offers.</CardDescription>
              </div>
              <Button asChild>
                <Link href="/merchant/coupons/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Offer
                </Link>
              </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Points Cost</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {offers.map(offer => (
                        <TableRow key={offer.offerId}>
                            <TableCell className="font-medium">{offer.title}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    offer.status === 'active' ? 'secondary'
                                    : offer.status === 'pending' ? 'outline'
                                    : 'destructive'
                                } className="capitalize">
                                    {offer.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{offer.points}</TableCell>
                            <TableCell>{format(offer.expiryDate, 'PP')}</TableCell>
                             <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleArchive(offer.offerId)}>
                                            <Archive className="mr-2 h-4 w-4" />
                                            Archive
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </main>
  );
}
