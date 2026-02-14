
'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Copy, BadgeCheck } from "lucide-react";
import { useAuth } from '@/lib/auth';
import type { User as AppUser } from '@/lib/types';
import { getUserById, ensureAgentCode, updateUser } from '@/services/user-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgentSettingsPage() {
  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useAuth();
  const [agent, setAgent] = React.useState<AppUser | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');

  React.useEffect(() => {
    if (authUser) {
      const fetchUser = async () => {
        let appUser = await getUserById(authUser.uid);
        if (appUser && appUser.role === 'agent') {
            if (!appUser.agentCode?.trim()) {
              const code = await ensureAgentCode(authUser.uid);
              if (code) appUser = { ...appUser, agentCode: code };
            }
            setAgent(appUser);
            setName(appUser.name || authUser.displayName || '');
            setEmail(appUser.email || authUser.email || '');
            setPhone(appUser.phone || authUser.phoneNumber || '');
        } else {
            toast({
                variant: 'destructive',
                title: 'User not found',
                description: 'Could not find your agent profile.'
            })
        }
      }
      fetchUser();
    }
  }, [authUser, toast]);


  const handleSaveChanges = async () => {
    if (!agent) return;
    setIsSaving(true);
    try {
      await updateUser(agent.uid, { name: name.trim() || undefined, phone: phone.trim() || undefined });
      setAgent(prev => prev ? { ...prev, name: name.trim() || prev.name, phone: phone.trim() || prev.phone } : null);
      toast({ title: 'Profile Updated', description: 'Your changes have been saved successfully.' });
    } catch (e: unknown) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: e instanceof Error ? e.message : 'Could not save profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyAgentCode = () => {
    if (!agent?.agentCode) return;
    navigator.clipboard.writeText(agent.agentCode);
    toast({ title: 'Copied', description: 'Agent code copied to clipboard.' });
  };

  if (authLoading || (authUser && !agent)) {
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

  if (!agent) {
    return (
         <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header pageTitle="Settings" />
            <div className="text-center py-10">Please log in to view your settings.</div>
         </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Agent Settings" />
        <Card>
        <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
                <AvatarImage src={agent.avatarUrl} alt={agent.name} data-ai-hint="person portrait"/>
                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Photo</Button>
            </div>

            {agent.agentCode && (
                <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                        <BadgeCheck className="h-4 w-4" /> Your agent code (share with merchants for referral bonus)
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input id="agentCode" value={agent.agentCode} readOnly className="font-mono" />
                        <Button type="button" variant="outline" size="icon" onClick={copyAgentCode} title="Copy code">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
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
    </main>
  );
}
