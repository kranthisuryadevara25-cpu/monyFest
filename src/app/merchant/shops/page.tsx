

'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type Shop = {
  id: string;
  name: string;
  address: string;
  pincode: string;
  status: 'Open' | 'Closed';
};

const mockShops: Shop[] = [
  { id: 'shop-01', name: 'Main Branch', address: '123, MG Road', pincode: '400001', status: 'Open' },
  { id: 'shop-02', name: 'Downtown Cafe', address: '45, FC Road', pincode: '411004', status: 'Open' },
  { id: 'shop-03', name: 'Express Kiosk', address: 'Koregaon Park', pincode: '411001', status: 'Closed' },
];

const ShopFormDialog = ({ onSave, shop, children }: { onSave: (shop: Shop) => void; shop?: Shop, children: React.ReactNode }) => {
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
        if (!name || !address || !pincode) {
            toast({
                variant: 'destructive',
                title: 'Missing fields',
                description: 'Please fill out all shop details.'
            });
            return;
        }

        const newShop: Shop = {
            id: shop?.id || `shop-${Date.now()}`,
            name,
            address,
            pincode,
            status: shop?.status || 'Open',
        };

        onSave(newShop);
        toast({
            title: shop ? 'Shop Updated' : 'Shop Added',
            description: `${name} has been saved.`
        });
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
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
                        <Input id="name" placeholder="e.g. Main Branch" className="col-span-3" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">Address</Label>
                        <Input id="address" placeholder="e.g. 123, MG Road" className="col-span-3" value={address} onChange={e => setAddress(e.target.value)}/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pincode" className="text-right">Pincode</Label>
                        <Input id="pincode" placeholder="e.g. 400001" className="col-span-3" value={pincode} onChange={e => setPincode(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSave}>Save Shop</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function ShopsPage() {
  const [shops, setShops] = React.useState(mockShops);
  const { toast } = useToast();

  const handleSaveShop = (shop: Shop) => {
    const isEditing = shops.some(s => s.id === shop.id);
    if (isEditing) {
        setShops(shops.map(s => s.id === shop.id ? shop : s));
    } else {
        setShops(prev => [...prev, shop]);
    }
  }

  const handleStatusChange = (id: string, status: Shop['status']) => {
    setShops(prev => prev.map(s => s.id === id ? {...s, status} : s));
    toast({
        title: 'Status Updated',
        description: `The shop has been marked as ${status.toLowerCase()}.`
    });
  }
  
  const handleDeleteShop = (id: string) => {
    setShops(prev => prev.filter(s => s.id !== id));
    toast({
        variant: 'destructive',
        title: 'Shop Deleted',
        description: 'The shop location has been removed.',
    });
  }


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="My Shops" />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Shops</CardTitle>
              <CardDescription>Manage your shop locations and business details. Found {shops.length} locations.</CardDescription>
            </div>
             <ShopFormDialog onSave={handleSaveShop}>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Shop Location
                </Button>
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
                {shops.map(shop => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell>{shop.address}</TableCell>
                    <TableCell>{shop.pincode}</TableCell>
                    <TableCell>
                      <Badge variant={shop.status === 'Open' ? 'secondary' : 'outline'}>{shop.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             <ShopFormDialog onSave={handleSaveShop} shop={shop}>
                                <button className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit Details</span>
                                </button>
                             </ShopFormDialog>
                            {shop.status === 'Open' ? (
                                <DropdownMenuItem onClick={() => handleStatusChange(shop.id, 'Closed')}>Set as Closed</DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => handleStatusChange(shop.id, 'Open')}>Set as Open</DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteShop(shop.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
