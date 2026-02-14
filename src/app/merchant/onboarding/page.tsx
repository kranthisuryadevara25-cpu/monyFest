
'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, User, Banknote, CheckCircle, Loader2 } from "lucide-react";
import { Stepper, StepperItem, StepperLabel, StepperSeparator } from '@/components/ui/stepper';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { createMerchantProfileFromOnboarding } from '@/services/merchant-service';

const steps = [
    { label: "Business Details", icon: Store },
    { label: "Owner Information", icon: User },
    { label: "Bank Details", icon: Banknote },
    { label: "Done", icon: CheckCircle }
];

const initialFormState = {
    businessName: '',
    businessType: '',
    category: 'food' as const,
    businessAddress: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    email: '',
    phone: '',
    whatsapp: '',
    offeringType: 'both',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    accountHolder: '',
    accountNumber: '',
    ifscCode: '',
    agentCode: '', // Optional: agent who referred this merchant (earns recruitment bonus)
};

const businessTypes = ["Sole Proprietorship", "Partnership", "Private Limited", "LLP", "Other"];
const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function OnboardingPage() {
    const { toast } = useToast();
    const { user: authUser } = useAuth();
    const [activeStep, setActiveStep] = React.useState(0);
    const [formState, setFormState] = React.useState(initialFormState);
    const [submitting, setSubmitting] = React.useState(false);

    const handleInputChange = (field: keyof typeof formState, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = async () => {
        if (activeStep === 2) {
            if (!authUser?.uid) {
                toast({ variant: 'destructive', title: 'Not signed in', description: 'Please sign in to complete onboarding.' });
                return;
            }
            if (!formState.businessName?.trim()) {
                toast({ variant: 'destructive', title: 'Business name required', description: 'Please enter your business name.' });
                return;
            }
            setSubmitting(true);
            const result = await createMerchantProfileFromOnboarding({
                merchantId: authUser.uid,
                name: formState.businessName.trim(),
                category: formState.category,
                gstin: formState.gstin?.trim() || undefined,
                agentCode: formState.agentCode?.trim() || undefined,
            });
            setSubmitting(false);
            if (result.success) {
                toast({
                    title: "Application Submitted!",
                    description: "Your merchant profile has been created and submitted for verification.",
                });
                setActiveStep(3);
            } else {
                toast({
                    variant: 'destructive',
                    title: "Submission failed",
                    description: result.error ?? "Could not create merchant profile.",
                });
            }
            return;
        }
        setActiveStep(s => Math.min(3, s + 1));
    };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Merchant Onboarding" />
        <Card>
        <CardHeader>
          <CardTitle>Setup Wizard</CardTitle>
          <CardDescription>Complete the setup for your merchant account to start accepting payments and offering loyalty rewards.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="p-6">
                <Stepper activeStep={activeStep}>
                    {steps.map((step, index) => (
                        <StepperItem key={index} >
                            <div className="flex items-center gap-2">
                                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${activeStep >= index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <StepperLabel>{step.label}</StepperLabel>
                            </div>
                            {index < steps.length - 1 && <StepperSeparator />}
                        </StepperItem>
                    ))}
                </Stepper>
            </div>

            <div className="pt-8">
                {activeStep === 0 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <h3 className="text-lg font-medium text-center">Step 1: Business Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name</Label>
                                <Input id="businessName" placeholder="e.g. Coffee House" value={formState.businessName} onChange={e => handleInputChange('businessName', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="businessType">Nature of Business</Label>
                                <Select value={formState.businessType} onValueChange={v => handleInputChange('businessType', v)}>
                                    <SelectTrigger id="businessType"><SelectValue placeholder="Select business type" /></SelectTrigger>
                                    <SelectContent>
                                        {businessTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                             <div className="space-y-2">
                                <Label htmlFor="gstin">GSTIN</Label>
                                <Input id="gstin" placeholder="e.g. 27AAFCC1234A1Z5" value={formState.gstin} onChange={e => handleInputChange('gstin', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="businessAddress">Address</Label>
                            <Input id="businessAddress" placeholder="Street Address" value={formState.businessAddress} onChange={e => handleInputChange('businessAddress', e.target.value)} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" placeholder="e.g. Mumbai" value={formState.city} onChange={e => handleInputChange('city', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                 <Select value={formState.state} onValueChange={v => handleInputChange('state', v)}>
                                    <SelectTrigger id="state"><SelectValue placeholder="Select state" /></SelectTrigger>
                                    <SelectContent>
                                        {indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input id="pincode" placeholder="e.g. 400001" value={formState.pincode} onChange={e => handleInputChange('pincode', e.target.value)} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="email">Business Email</Label>
                                <Input id="email" type="email" placeholder="contact@coffeehouse.com" value={formState.email} onChange={e => handleInputChange('email', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone">Business Phone</Label>
                                <Input id="phone" type="tel" placeholder="e.g. 9876543210" value={formState.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp Link</Label>
                            <Input id="whatsapp" placeholder="https://wa.me/919876543210" value={formState.whatsapp} onChange={e => handleInputChange('whatsapp', e.target.value)} />
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
                            <Label htmlFor="agentCode">Referred by (Agent code)</Label>
                            <Input id="agentCode" placeholder="Optional — enter agent code if an agent referred you" value={formState.agentCode} onChange={e => handleInputChange('agentCode', e.target.value)} />
                            <p className="text-xs text-muted-foreground">If an agent referred you, enter their code so they receive the recruitment bonus.</p>
                        </div>
                    </div>
                )}
                 {activeStep === 1 && (
                    <div className="space-y-4 max-w-lg mx-auto">
                        <h3 className="text-lg font-medium text-center">Step 2: Owner Information</h3>
                        <div className="space-y-2">
                            <Label htmlFor="ownerName">Full Name</Label>
                            <Input id="ownerName" placeholder="e.g. Charlie Brown" value={formState.ownerName} onChange={e => handleInputChange('ownerName', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="ownerEmail">Email Address</Label>
                            <Input id="ownerEmail" type="email" placeholder="e.g. charlie@coffeehouse.com" value={formState.ownerEmail} onChange={e => handleInputChange('ownerEmail', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="ownerPhone">Phone Number</Label>
                            <Input id="ownerPhone" type="tel" placeholder="e.g. 9876543210" value={formState.ownerPhone} onChange={e => handleInputChange('ownerPhone', e.target.value)} />
                        </div>
                    </div>
                )}
                 {activeStep === 2 && (
                    <div className="space-y-4 max-w-lg mx-auto">
                        <h3 className="text-lg font-medium text-center">Step 3: Bank Details for Payouts</h3>
                        <div className="space-y-2">
                            <Label htmlFor="accountHolder">Account Holder Name</Label>
                            <Input id="accountHolder" placeholder="e.g. Charlie Brown" value={formState.accountHolder} onChange={e => handleInputChange('accountHolder', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number</Label>
                            <Input id="accountNumber" placeholder="e.g. 1234567890" value={formState.accountNumber} onChange={e => handleInputChange('accountNumber', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="ifscCode">IFSC Code</Label>
                            <Input id="ifscCode" placeholder="e.g. SBIN0001234" value={formState.ifscCode} onChange={e => handleInputChange('ifscCode', e.target.value)} />
                        </div>
                    </div>
                )}
                {activeStep === 3 && (
                    <div className="text-center space-y-4 py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                        <h3 className="text-xl font-semibold">Setup Complete!</h3>
                        <p className="text-muted-foreground">Your account is now under review. You will be notified once it's approved by the admin.</p>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-8 max-w-lg mx-auto">
                <Button variant="outline" onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0 || activeStep === 3 || submitting}>Back</Button>
                <Button onClick={handleNext} disabled={activeStep === 3 || submitting}>
                    {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : activeStep === 2 ? "Finish & Submit for Review" : "Next"}
                </Button>
            </div>

        </CardContent>
      </Card>
    </main>
  );
}
