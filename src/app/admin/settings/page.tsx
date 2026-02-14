
'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useAuth } from '@/lib/auth';
import type { User as AppUser } from '@/lib/types';
import { getUserById } from '@/services/user-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useAuth();
  const [adminUser, setAdminUser] = React.useState<AppUser | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');

  React.useEffect(() => {
    if (authUser) {
      const fetchUser = async () => {
        const appUser = await getUserById(authUser.uid);
        if (appUser && appUser.role === 'superAdmin') {
            setAdminUser(appUser);
            setName(appUser.name || authUser.displayName || '');
            setEmail(appUser.email || authUser.email || '');
        } else {
            // Handle case where user is not an admin
        }
      }
      fetchUser();
    }
  }, [authUser]);


  const handleSaveChanges = async () => {
    if (!adminUser) return;
    setIsSaving(true);
    // In a real app, this would call a service to update the user in the database
    console.log('Saving admin profile:', { uid: adminUser.uid, name, email });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
    });
  }

  if (authLoading || (authUser && !adminUser)) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Settings" />
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
        </main>
    )
  }

  if (!adminUser) {
    return (
         <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Settings" />
            <div className="text-center py-10">Please log in to view settings.</div>
         </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Admin Settings" />
        <div className="container mx-auto py-4">
        <Card>
        <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
                <AvatarImage src={adminUser.avatarUrl} alt={adminUser.name} data-ai-hint="person portrait"/>
                <AvatarFallback>{adminUser.name.charAt(0)}</AvatarFallback>
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
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
        </CardFooter>
        </Card>
        </div>
    </main>
  );
}
