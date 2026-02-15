

'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Bell, CreditCard, Loader2, MapPin, Camera, Upload, Clock, CalendarDays, IndianRupee } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth';
import type { User, Merchant } from '@/lib/types';
import { getUserById, updateUser } from '@/services/user-service';
import { getMerchants, updateMerchant } from '@/services/merchant-service';
import { Skeleton } from '@/components/ui/skeleton';

const businessTypes = ["Sole Proprietorship", "Partnership", "Private Limited", "LLP", "Other"];
const workingDaysOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


export default function SettingsPage() {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [merchantUser, setMerchantUser] = React.useState<User | null>(null);
  const [merchant, setMerchant] = React.useState<Merchant | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const [formState, setFormState] = React.useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    description: '',
    address: '123, Mocha Lane, Coffee District',
    latitude: '19.0760',
    longitude: '72.8777',
    emailNotifications: true,
    pushNotifications: false,
    accountHolder: 'Charlie Brown',
    accountNumber: '**** **** **** 1234',
    ifscCode: 'SBIN0001234',
    businessType: 'Sole Proprietorship',
    category: 'food',
    gstin: '',
    offeringType: 'both',
    operatingTimings: '9 AM - 10 PM',
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    minOrderValue: '150',
  });

   React.useEffect(() => {
    if (authUser) {
      const fetchData = async () => {
        setLoading(true);
        const [user, merchants] = await Promise.all([
            getUserById(authUser.uid),
            getMerchants()
        ]);

        if (user && user.merchantId) {
            const currentMerchant = merchants.find(m => m.merchantId === user.merchantId);
            setMerchantUser(user);
            setMerchant(currentMerchant || null);
            if (currentMerchant) {
                setFormState(prev => ({
                    ...prev,
                    businessName: currentMerchant.name,
                    ownerName: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    gstin: currentMerchant.gstin || '',
                    category: currentMerchant.category,
                }));
            }
        }
        setLoading(false);
      }
      fetchData();
    }
  }, [authUser]);

  const handleInputChange = (field: keyof typeof formState, value: string | boolean) => {
    setFormState(prev => ({...prev, [field]: value }));
  }
  
  const handleWorkingDaysChange = (day: string, checked: boolean) => {
    setFormState(prev => {
        const newWorkingDays = checked ? [...prev.workingDays, day] : prev.workingDays.filter(d => d !== day);
        return {...prev, workingDays: newWorkingDays };
    })
  }

  const handleSave = async (section: string) => {
    if (!merchantUser || !merchant) return;
    setIsSaving(true);
    try {
      await Promise.all([
        updateMerchant(merchant.merchantId, {
          name: formState.businessName.trim() || merchant.name,
          category: formState.category as Merchant['category'],
          gstin: formState.gstin?.trim() || undefined,
        }),
        updateUser(merchantUser.uid, {
          name: formState.ownerName.trim() || undefined,
          phone: formState.phone?.trim() || undefined,
        }),
      ]);
      setMerchant((m) => (m ? { ...m, name: formState.businessName.trim() || m.name, category: formState.category as Merchant['category'], gstin: formState.gstin || m.gstin } : null));
      setMerchantUser((u) => (u ? { ...u, name: formState.ownerName.trim() || u.name, phone: formState.phone || u.phone } : null));
      toast({
        title: 'Settings Saved',
        description: `Your ${section} settings have been updated.`,
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: e instanceof Error ? e.message : 'Could not save settings.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
      return (
           <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Header pageTitle="Settings" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-96 w-full" />
            </main>
      )
  }

  if (!merchantUser || !merchant) {
       return (
           <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Header pageTitle="Settings" />
                <Card><CardContent className="p-6">Merchant profile not found.</CardContent></Card>
            </main>
       )
  };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Settings" />
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile"><Settings className="mr-2 h-4 w-4"/> Profile & Branding</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4"/> Notifications</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="mr-2 h-4 w-4"/> Billing & Payouts</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Business Profile</CardTitle>
                        <CardDescription>Manage your public business information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                            <AvatarImage src={merchant.logo} alt={merchant.name} />
                            <AvatarFallback>{merchant.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Button variant="outline">Change Logo</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input id="businessName" value={formState.businessName} onChange={e => handleInputChange('businessName', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="ownerName">Owner Name</Label>
                            <Input id="ownerName" value={formState.ownerName} onChange={e => handleInputChange('ownerName', e.target.value)}/>
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="email">Contact Email</Label>
                            <Input id="email" type="email" value={formState.email} onChange={e => handleInputChange('email', e.target.value)}/>
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="phone">Contact Phone</Label>
                            <Input id="phone" type="tel" value={formState.phone} onChange={e => handleInputChange('phone', e.target.value)}/>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                            <Input id="whatsappNumber" type="tel" placeholder="e.g. 919876543210" value={formState.whatsappNumber} onChange={e => handleInputChange('whatsappNumber', e.target.value)} />
                            <p className="text-xs text-muted-foreground">Include country code. This will be used for click-to-chat.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="businessType">Nature of Business</Label>
                                <Select value={formState.businessType} onValueChange={v => handleInputChange('businessType', v)}>
                                    <SelectTrigger id="businessType"><SelectValue placeholder="Select business type" /></SelectTrigger>
                                    <SelectContent>
                                        {businessTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Business Category</Label>
                                <Select value={formState.category} onValueChange={v => handleInputChange('category', v)}>
                                    <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="food">Food & Beverage</SelectItem>
                                        <SelectItem value="retail">Retail</SelectItem>
                                        <SelectItem value="books">Books & Hobbies</SelectItem>
                                        <SelectItem value="services">Services</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gstin">GSTIN</Label>
                            <Input id="gstin" placeholder="e.g. 27AAFCC1234A1Z5" value={formState.gstin} onChange={e => handleInputChange('gstin', e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Offering Type</Label>
                            <RadioGroup value={formState.offeringType} onValueChange={v => handleInputChange('offeringType', v)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="offline" id="offline" />
                                    <Label htmlFor="offline">Offline</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="online" id="online" />
                                    <Label htmlFor="online">Online</Label>
                                </div>
                                    <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="both" id="both" />
                                    <Label htmlFor="both">Both</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Business Description</Label>
                            <Textarea id="description" placeholder="Tell customers about your business" value={formState.description} onChange={e => handleInputChange('description', e.target.value)}/>
                        </div>
                        <Button onClick={() => handleSave('profile')} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                            Save Profile
                        </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MapPin /> Location & Map</CardTitle>
                            <CardDescription>Set your business location for customers to find you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Full Address</Label>
                                <Input id="address" value={formState.address} onChange={e => handleInputChange('address', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input id="latitude" value={formState.latitude} onChange={e => handleInputChange('latitude', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input id="longitude" value={formState.longitude} onChange={e => handleInputChange('longitude', e.target.value)} />
                                </div>
                            </div>
                             <div className="aspect-video w-full bg-muted rounded-md flex items-center justify-center">
                                <p className="text-muted-foreground">Map Placeholder</p>
                            </div>
                             <Button onClick={() => handleSave('location')} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                                Save Location
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Camera /> Shop Photo</CardTitle>
                            <CardDescription>Upload a main photo for your business storefront.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="aspect-video w-full relative">
                                <Image src="https://picsum.photos/seed/shop-image/600/400" alt="Shop photo" layout="fill" className="rounded-md object-cover" data-ai-hint="cafe storefront" />
                            </div>
                            <Button variant="outline" className="w-full">
                                <Upload className="mr-2 h-4 w-4"/>
                                Upload New Photo
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Operating Conditions</CardTitle>
                            <CardDescription>Set your hours and order policies.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-2">
                                <Label htmlFor="timings"><Clock className="inline h-4 w-4 mr-2"/>Operating Timings</Label>
                                <Input id="timings" placeholder="e.g. 9:00 AM - 10:00 PM" value={formState.operatingTimings} onChange={e => handleInputChange('operatingTimings', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label><CalendarDays className="inline h-4 w-4 mr-2"/>Working Days</Label>
                                <div className="grid grid-cols-3 gap-2 pt-2">
                                    {workingDaysOptions.map(day => (
                                        <div key={day} className="flex items-center gap-2">
                                            <Checkbox id={`day-${day}`} checked={formState.workingDays.includes(day)} onCheckedChange={(checked) => handleWorkingDaysChange(day, !!checked)} />
                                            <Label htmlFor={`day-${day}`} className="font-normal">{day}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="min-order"><IndianRupee className="inline h-4 w-4 mr-2"/>Minimum Online Order Value</Label>
                                <Input id="min-order" type="number" placeholder="e.g. 150" value={formState.minOrderValue} onChange={e => handleInputChange('minOrderValue', e.target.value)} />
                            </div>
                             <Button onClick={() => handleSave('conditions')} disabled={isSaving} className="w-full">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                                Save Conditions
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
        <TabsContent value="notifications">
           <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive emails for new orders, reviews, and system updates.</p>
                    </div>
                    <Switch checked={formState.emailNotifications} onCheckedChange={checked => handleInputChange('emailNotifications', checked)} />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <h4 className="font-medium">Push Notifications</h4>
                        <p className="text-sm text-muted-foreground">Get push notifications on your mobile device.</p>
                    </div>
                    <Switch checked={formState.pushNotifications} onCheckedChange={checked => handleInputChange('pushNotifications', checked)} />
                </div>
                <Button onClick={() => handleSave('notification')} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                    Save Preferences
                </Button>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="billing">
           <Card>
            <CardHeader>
              <CardTitle>Billing & Payouts</CardTitle>
              <CardDescription>Manage your bank account details for receiving payouts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input id="accountHolder" value={formState.accountHolder} onChange={e => handleInputChange('accountHolder', e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input id="accountNumber" value={formState.accountNumber} onChange={e => handleInputChange('accountNumber', e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input id="ifscCode" value={formState.ifscCode} onChange={e => handleInputChange('ifscCode', e.target.value)} />
                </div>
              <Button onClick={() => handleSave('billing')} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                Save Billing Details
                </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
