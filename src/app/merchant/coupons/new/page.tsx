
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Save, ArrowLeft, Loader2, ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { moderateOfferAction } from './actions';
import type { ModerateOfferOutput } from '@/ai/flows/moderate-merchant-offers';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


export default function NewOfferPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [date, setDate] = React.useState<Date>();
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [points, setPoints] = React.useState('');
    const [moderationResult, setModerationResult] = React.useState<ModerateOfferOutput | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isSaving, setIsSaving] = React.useState(false);


    const handleModerate = () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        startTransition(async () => {
            const result = await moderateOfferAction(formData);
            if (result.success && result.data) {
                setModerationResult(result.data);
            } else {
                console.error("Moderation failed:", result.errors);
                toast({
                    variant: 'destructive',
                    title: 'Moderation Failed',
                    description: (Array.isArray((result.errors as Record<string, unknown>)?._server) && (result.errors as Record<string, unknown[]>)._server[0] != null)
                    ? String((result.errors as Record<string, unknown[]>)._server[0])
                    : 'An unknown error occurred.'
                })
            }
        });
    }

    const handleSave = async () => {
        if (!title || !description || !points || !date) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all the details for the offer.'
            });
            return;
        }

        setIsSaving(true);
        // In a real app, this would save to the database
        console.log({ title, description, points, expiryDate: date });
        await new Promise(res => setTimeout(res, 1000));
        setIsSaving(false);
        toast({
            title: 'Offer Submitted!',
            description: 'Your new offer has been submitted for admin approval.'
        });
        // In a real app, we would add the new offer to a global state or refetch.
        // For now, we just redirect.
        router.push('/merchant/coupons');
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
              <Link href="/merchant/coupons">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <Header pageTitle="Create New Offer" />
        </div>
        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                    <CardTitle>Offer Details</CardTitle>
                    <CardDescription>Fill in the details for your new loyalty offer.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Offer Title</Label>
                            <Input id="title" placeholder="e.g. Free Pastry with any Large Coffee" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Offer Description</Label>
                            <Textarea id="description" placeholder="Describe the offer for your customers" className="min-h-32" value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="points">Points Required</Label>
                                <Input id="points" type="number" placeholder="e.g. 50" value={points} onChange={e => setPoints(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        id="expiry"
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>AI Content Moderation</CardTitle>
                        <CardDescription>Check if your offer meets platform guidelines before submitting.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={handleModerate} disabled={isPending || !title || !description} className="w-full">
                            {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            )}
                            Check with AI
                        </Button>
                         {moderationResult && (
                             moderationResult.isAppropriate ? (
                                <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/20">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-800 dark:text-green-400">Looks Good!</AlertTitle>
                                <AlertDescription className="text-green-700 dark:text-green-500">
                                    This offer seems appropriate.
                                </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertTitle>Potential Issue</AlertTitle>
                                <AlertDescription>
                                    <strong>Reason:</strong> {moderationResult.reason}
                                </AlertDescription>
                                </Alert>
                            )
                        )}
                    </CardContent>
                </Card>
                 <Button size="lg" className="w-full" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save & Submit for Approval
                 </Button>
            </div>
        </div>
    </main>
  );
}
