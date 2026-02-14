
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Banknote, CheckCircle, ShieldCheck } from "lucide-react";
import { Stepper, StepperItem, StepperLabel, StepperSeparator } from '@/components/ui/stepper';

const steps = [
    { label: "Personal Details", icon: User },
    { label: "KYC Verification", icon: ShieldCheck },
    { label: "Bank Details", icon: Banknote },
    { label: "Done", icon: CheckCircle }
]

export default function OnboardingPage() {
    const [activeStep, setActiveStep] = React.useState(0);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Agent Onboarding" />
        <Card>
        <CardHeader>
          <CardTitle>Welcome! Let's get you set up.</CardTitle>
          <CardDescription>Complete the setup for your agent account to start earning.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="p-6">
                <Stepper activeStep={activeStep}>
                    {steps.map((step, index) => (
                        <StepperItem key={index}>
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
                    <div className="space-y-4 max-w-lg mx-auto">
                        <h3 className="text-lg font-medium text-center">Step 1: Personal Details</h3>
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" placeholder="e.g. Laxman S." />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="e.g. laxman.agent@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="e.g. 9876543210" />
                        </div>
                    </div>
                )}
                 {activeStep === 1 && (
                    <div className="space-y-4 max-w-lg mx-auto text-center">
                        <h3 className="text-lg font-medium">Step 2: KYC Verification</h3>
                        <p className="text-sm text-muted-foreground">To comply with regulations, we need to verify your identity.</p>
                        <div className="space-y-2 text-left">
                            <Label htmlFor="pan">PAN Card Number</Label>
                            <Input id="pan" placeholder="e.g. ABCDE1234F" />
                        </div>
                         <div className="space-y-2 text-left">
                            <Label htmlFor="aadhar">Aadhar Card Number</Label>
                            <Input id="aadhar" type="text" placeholder="e.g. 1234 5678 9012" />
                        </div>
                        <Button variant="outline">Upload Documents</Button>
                    </div>
                )}
                 {activeStep === 2 && (
                    <div className="space-y-4 max-w-lg mx-auto">
                        <h3 className="text-lg font-medium text-center">Step 3: Bank Details for Payouts</h3>
                        <div className="space-y-2">
                            <Label htmlFor="accountHolder">Account Holder Name</Label>
                            <Input id="accountHolder" placeholder="e.g. Laxman S." />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number</Label>
                            <Input id="accountNumber" placeholder="e.g. 1234567890" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="ifscCode">IFSC Code</Label>
                            <Input id="ifscCode" placeholder="e.g. SBIN0001234" />
                        </div>
                    </div>
                )}
                {activeStep === 3 && (
                    <div className="text-center space-y-4 py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                        <h3 className="text-xl font-semibold">Application Submitted!</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">Your details have been submitted for verification. You will be notified once your account is approved by an administrator.</p>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-8 max-w-lg mx-auto">
                <Button variant="outline" onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0 || activeStep === 3}>Back</Button>
                <Button onClick={() => setActiveStep(s => Math.min(3, s+1))} disabled={activeStep === 3}>
                    {activeStep === 2 ? "Finish & Submit for Review" : "Next"}
                </Button>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
