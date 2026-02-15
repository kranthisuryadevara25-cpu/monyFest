'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { Shop } from '@/lib/types';
import { listShopsByMerchant, createShop, updateShop, deleteShop } from '@/services/shop-service';
import { useAuth } from '@/lib/auth';
import { getUserById } from '@/services/user-service';
import { Skeleton } from '@/components/ui/skeleton';

const ShopFormDialog = ({
  merchantId,
  onSave,
  shop,
  children,
}: {
  merchantId: string;
  onSave: (shop: Shop) => void;
  shop?: Shop;
  children: React.ReactNode;
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [pincode, setPincode] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (shop) {
        setName(shop.name);
        setAddress(shop.address);
        setPincode(shop.pincode);
      } else {
        setName('');
        setAddress('');
        setPincode('');
      }
    }
  }, [isOpen, shop]);

  const handleSave = () => {
    if (!name?.trim() || !address?.trim() || !pincode?.trim()) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill out all shop details.' });
      return;
    }
    const payload: Shop = {
      id: shop?.id ?? '',
      merchantId,
      name: name.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      status: shop?.status ?? 'Open',
    };
    onSave(payload);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{shop ? 'Edit Shop' : 'Add New Shop'}</DialogTitle>
          <DialogDescription>
            {shop ? 'Update the details for this business location.' : 'Fill in the details for your new business location.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" placeholder="e.g. Main Branch" className="col-span-3" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">Address</Label>
            <Input id="address" placeholder="e.g. 123, MG Road" className="col-span-3" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pincode" className="text-right">Pincode</Label>
            <Input id="pincode" placeholder="e.g. 400001" className="col-span-3" value={pincode} onChange={(e) => setPincode(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>Save Shop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function ShopsPage() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [merchantId, setMerchantId] = React.useState<string | null>(null);
  const [shops, setShops] = React.useState<Shop[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadShops = React.useCallback(async () => {
    if (!authUser) return;
    const user = await getUserById(authUser.uid);
    const mid = user?.merchantId ?? authUser.uid;
    setMerchantId(mid);
    const list = await listShopsByMerchant(mid);
    setShops(list);
  }, [authUser]);

  React.useEffect(() => {
    loadShops().finally(() => setLoading(false));
  }, [loadShops]);

  const handleSaveShop = async (shop: Shop) => {
    if (!merchantId) return;
    try {
      if (shop.id && shops.some((s) => s.id === shop.id)) {
        await updateShop(shop.id, { name: shop.name, address: shop.address, pincode: shop.pincode, status: shop.status });
        setShops((prev) => prev.map((s) => (s.id === shop.id ? shop : s)));
        toast({ title: 'Shop Updated', description: `${shop.name} has been saved.` });
      } else {
        const id = await createShop({ merchantId, name: shop.name, address: shop.address, pincode: shop.pincode, status: shop.status });
        setShops((prev) => [...prev, { ...shop, id }]);
        toast({ title: 'Shop Added', description: `${shop.name} has been added.` });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: e instanceof Error ? e.message : 'Failed to save shop.' });
    }
  };

  const handleStatusChange = async (id: string, status: Shop['status']) => {
    try {
      await updateShop(id, { status });
      setShops((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      toast({ title: 'Status Updated', description: `The shop has been marked as ${status.toLowerCase()}.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: e instanceof Error ? e.message : 'Failed to update status.' });
    }
  };

  const handleDeleteShop = async (id: string) => {
    try {
      await deleteShop(id);
      setShops((prev) => prev.filter((s) => s.id !== id));
      toast({ variant: 'destructive', title: 'Shop Deleted', description: 'The shop location has been removed.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: e instanceof Error ? e.message : 'Failed to delete shop.' });
    }
  };

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="My Shops" />
        <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
      </main>
    );
  }
  if (!merchantId) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="My Shops" />
        <Card><CardContent className="p-6">Merchant profile not found. Complete onboarding first.</CardContent></Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="My Shops" />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Shops</CardTitle>
              <CardDescription>Manage your shop locations. Found {shops.length} locations.</CardDescription>
            </div>
            <ShopFormDialog merchantId={merchantId} onSave={handleSaveShop}>
              <Button><PlusCircle className="mr-2 h-4 w-4" />Add Shop Location</Button>
            </ShopFormDialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Pincode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No shops yet. Add a location to get started.</TableCell></TableRow>
              ) : (
                shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell>{shop.address}</TableCell>
                    <TableCell>{shop.pincode}</TableCell>
                    <TableCell><Badge variant={shop.status === 'Open' ? 'secondary' : 'outline'}>{shop.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <ShopFormDialog merchantId={merchantId} onSave={handleSaveShop} shop={shop}>
                            <button className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground w-full">
                              <Edit className="mr-2 h-4 w-4" /><span>Edit Details</span>
                            </button>
                          </ShopFormDialog>
                          {shop.status === 'Open' ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(shop.id, 'Closed')}>Set as Closed</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(shop.id, 'Open')}>Set as Open</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteShop(shop.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
