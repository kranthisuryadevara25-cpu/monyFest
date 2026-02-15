
'use client';
/**
 * @file ProfilePage
 * @description This page allows members to view and manage their personal profile information and saved addresses.
 *
 * @overview
 * The ProfilePage serves as the user's account management hub. It's divided into two main sections:
 * personal information and address management. Users can update their name, phone number, and profile picture.
 * They can also add, edit, and delete multiple addresses (e.g., for home, work).
 * The page fetches the logged-in user's data and provides a form-based interface for updates.
 *
 * @features
 * - **Profile Information**:
 *   - Displays the user's avatar, name, and email.
 *   - Allows changing the profile photo (future functionality).
 *   - Provides input fields to update name and phone number. The email field is disabled.
 *   - A "Save Changes" button to persist updates (currently logs to console).
 * - **Address Management**:
 *   - Lists all of the user's saved addresses.
 *   - Each address card shows the type (Home, Work), full address, and an icon.
 *   - Provides options to "Edit" or "Delete" each address via a dropdown menu.
 * - **Add/Edit Address Dialog**:
 *   - A dialog form allows users to add a new address or edit an existing one.
 *   - Fields include address type, line 1, city, state, and pincode.
 * - **State Management**: Uses React state to manage form inputs and the list of addresses.
 * - **Loading and Auth Handling**: Displays loading skeletons while fetching data and shows a message if the user is not logged in.
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, PlusCircle, MoreVertical, Edit, Trash2, Home, Briefcase, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';
import type { User as AppUser } from '@/lib/types';
import { getUserByIdClient } from '@/services/user-service.client';
import { updateUser } from '@/services/user-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';

type Address = {
    id: string;
    type: 'Home' | 'Work' | 'Other';
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
};

const initialAddresses: Address[] = [
    { id: 'addr-1', type: 'Home', line1: '123, Rose Villa', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
    { id: 'addr-2', type: 'Work', line1: 'WeWork, Zenia Building', city: 'Pune', state: 'Maharashtra', pincode: '411006' },
];


const AddressForm = ({ onSave, address, onOpenChange }: { onSave: (address: Address) => void; address?: Address, onOpenChange: (open: boolean) => void }) => {
    const [type, setType] = React.useState(address?.type || 'Home');
    const [line1, setLine1] = React.useState(address?.line1 || '');
    const [city, setCity] = React.useState(address?.city || '');
    const [state, setState] = React.useState(address?.state || '');
    const [pincode, setPincode] = React.useState(address?.pincode || '');
    
    const handleSubmit = () => {
        const newAddress: Address = {
            id: address?.id || `addr-${Date.now()}`,
            type: type as Address['type'],
            line1,
            city,
            state,
            pincode,
        };
        onSave(newAddress);
        onOpenChange(false);
    };

    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select value={type} onValueChange={(val) => setType(val as Address['type'])}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select address type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="line1" className="text-right">Address</Label>
                <Input id="line1" value={line1} onChange={e => setLine1(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">City</Label>
                <Input id="city" value={city} onChange={e => setCity(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="state" className="text-right">State</Label>
                <Input id="state" value={state} onChange={e => setState(e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="pincode" className="text-right">Pincode</Label>
                <Input id="pincode" value={pincode} onChange={e => setPincode(e.target.value)} className="col-span-3" />
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>Save Address</Button>
            </DialogFooter>
        </div>
    )
}

const getAddressIcon = (type: Address['type']) => {
    switch(type) {
        case 'Home': return <Home className="h-5 w-5 text-primary" />;
        case 'Work': return <Briefcase className="h-5 w-5 text-primary" />;
        case 'Other': return <MapPin className="h-5 w-5 text-primary" />;
    }
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useAuth();
  const [member, setMember] = React.useState<AppUser | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');

  const [addresses, setAddresses] = React.useState<Address[]>(initialAddresses);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<Address | undefined>(undefined);

  React.useEffect(() => {
    if (authUser) {
      const fetchUser = async () => {
        const appUser = await getUserByIdClient(authUser.uid);
        if (appUser) {
            setMember(appUser);
            setName(appUser.name || authUser.displayName || '');
            setEmail(appUser.email || authUser.email || '');
            setPhone(appUser.phone || authUser.phoneNumber || '');
        } else {
            // Handle case where user is not in our DB
            // Potentially create a new user record here
            toast({
                variant: 'destructive',
                title: 'User not found',
                description: 'Could not find your user profile in our database.'
            })
        }
      }
      fetchUser();
    }
  }, [authUser, toast]);


  const handleSaveChanges = async () => {
    if (!member) return;
    setIsSaving(true);
    try {
      await updateUser(member.uid, { name: name.trim() || undefined, phone: phone.trim() || undefined });
      setMember((prev) => prev ? { ...prev, name: name.trim() || prev.name, phone: phone.trim() || prev.phone } : null);
      toast({ title: 'Profile Updated', description: 'Your changes have been saved successfully.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update failed', description: e instanceof Error ? e.message : 'Could not save profile.' });
    } finally {
      setIsSaving(false);
    }
  }

  const handleSaveAddress = (address: Address) => {
    const existingIndex = addresses.findIndex(a => a.id === address.id);
    if (existingIndex > -1) {
        setAddresses(addresses.map(a => a.id === address.id ? address : a));
    } else {
        setAddresses([...addresses, address]);
    }
  }

  const handleDeleteAddress = (addressId: string) => {
    setAddresses(addresses.filter(a => a.id !== addressId));
  }

  if (authLoading || (authUser && !member)) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Profile" />
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    )
  }

  if (!member) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Profile" />
        <div className="text-center py-10">Please log in to view your profile.</div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="My Profile" />
      <div className="grid gap-6">
          <Card>
          <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal information and settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                  <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person portrait"/>
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Photo</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
              </div>
          </CardContent>
          <CardFooter>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
              </Button>
          </CardFooter>
          </Card>

          <Card>
              <CardHeader>
                  <div className="flex items-center justify-between">
                      <div>
                          <CardTitle>My Addresses</CardTitle>
                          <CardDescription>Manage your shipping and billing addresses.</CardDescription>
                      </div>
                      <Dialog open={isAddressDialogOpen} onOpenChange={(open) => {
                          setIsAddressDialogOpen(open);
                          if (!open) setEditingAddress(undefined);
                      }}>
                          <DialogTrigger asChild>
                              <Button variant="outline">
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add New Address
                              </Button>
                          </DialogTrigger>
                          <DialogContent>
                              <DialogHeader>
                                  <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                                  <DialogDescription>
                                      Fill in the details below.
                                  </DialogDescription>
                              </DialogHeader>
                              <AddressForm onSave={handleSaveAddress} address={editingAddress} onOpenChange={setIsAddressDialogOpen} />
                          </DialogContent>
                      </Dialog>
                  </div>
              </CardHeader>
              <CardContent className="space-y-4">
                  {addresses.length > 0 ? (
                      addresses.map(address => (
                          <div key={address.id} className="flex items-start justify-between rounded-lg border p-4">
                              <div className="flex items-start gap-4">
                                  <div className="p-2 bg-muted rounded-full">
                                      {getAddressIcon(address.type)}
                                  </div>
                                  <div>
                                      <p className="font-semibold">{address.type}</p>
                                      <p className="text-sm text-muted-foreground">{address.line1}, {address.city}, {address.state} - {address.pincode}</p>
                                  </div>
                              </div>
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                          <MoreVertical className="h-4 w-4" />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                      <DropdownMenuItem onSelect={() => { setEditingAddress(address); setIsAddressDialogOpen(true); }}>
                                          <Edit className="mr-2 h-4 w-4" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600" onSelect={() => handleDeleteAddress(address.id)}>
                                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-8 text-muted-foreground">
                          <p>No addresses saved. Add one to get started.</p>
                      </div>
                  )}
              </CardContent>
          </Card>
      </div>
    </main>
  );
}
