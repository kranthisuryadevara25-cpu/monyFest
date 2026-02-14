
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Zap, LogIn } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset, FIREBASE_NOT_CONFIGURED_MSG } from '@/lib/auth';
import { isFirebaseConfigured } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole } from '@/lib/types';
import { getUserById } from '@/services/user-service';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { AppThemeBackground } from '@/components/landing/app-theme-background';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

function ForgotPasswordDialog() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await sendPasswordReset(email);
            toast({
                title: 'Password Reset Email Sent',
                description: 'Please check your inbox for instructions to reset your password.',
            });
            setIsOpen(false);
        } catch (error: any) {
            const isFirebaseSetup = error?.message === FIREBASE_NOT_CONFIGURED_MSG;
            toast({
                variant: isFirebaseSetup ? 'default' : 'destructive',
                title: isFirebaseSetup ? 'Setup required' : 'Error',
                description: isFirebaseSetup ? 'Add your Firebase keys to .env.local (see .env.example) to enable sign-in.' : (error.message || 'Failed to send password reset email.'),
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="link" size="sm" className="w-auto px-0 font-normal">Forgot Password?</Button>
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-[#0a0614] text-white">
                <form onSubmit={handlePasswordReset}>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email-reset" className="sr-only">Email</Label>
                            <Input
                                id="email-reset"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                             {isLoading && <LogIn className="mr-2 h-4 w-4 animate-spin" />}
                            Send Reset Link
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function SignInForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmail(email, password);
            if (userCredential) {
                const appUser = await getUserById(userCredential.uid);
                toast({
                    title: 'Login Successful',
                    description: `Welcome back!`,
                });
                if (appUser?.role === 'superAdmin') {
                    router.push('/admin/dashboard');
                } else if (appUser?.role === 'agent') {
                    router.push('/agent/dashboard');
                } else if (appUser?.role === 'merchant') {
                    router.push('/merchant/dashboard');
                }
                else {
                    router.push('/member/homepage'); 
                }
            }
        } catch (error: any) {
            const isFirebaseSetup = error?.message === FIREBASE_NOT_CONFIGURED_MSG;
            let description = 'An error occurred during sign-in. Please try again.';
            if (isFirebaseSetup) {
                description = 'Add your Firebase keys to .env.local (see .env.example) to enable sign-in.';
            } else if (error?.code === 'auth/invalid-credential') {
                description = 'Invalid email or password. Please try again.';
            }
            toast({
                variant: isFirebaseSetup ? 'default' : 'destructive',
                title: isFirebaseSetup ? 'Setup required' : 'Login Failed',
                description,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleEmailLogin}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email-signin">Email</Label>
                    <Input id="email-signin" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password-signin">Password</Label>
                        <ForgotPasswordDialog />
                    </div>
                    <Input id="password-signin" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <LogIn className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                </Button>
            </CardFooter>
        </form>
    )
}

function SignUpForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [role, setRole] = React.useState<UserRole>('member');
    const [referralCode, setReferralCode] = React.useState('');

    React.useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            setReferralCode(refCode);
        }
    }, [searchParams]);

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await signUpWithEmail(name, email, password, role, referralCode);
            if (user) {
                toast({
                    title: 'Account Created',
                    description: 'Welcome to LoyaltyLeap!',
                });
                // Route based on role
                if (role === 'agent') {
                    router.push('/agent/onboarding');
                } else if (role === 'merchant') {
                    router.push('/merchant/onboarding');
                } else {
                    router.push('/member/homepage');
                }
            }
        } catch (error: any) {
            const isFirebaseSetup = error?.message === FIREBASE_NOT_CONFIGURED_MSG;
            toast({
                variant: isFirebaseSetup ? 'default' : 'destructive',
                title: isFirebaseSetup ? 'Setup required' : 'Sign Up Failed',
                description: isFirebaseSetup ? 'Add your Firebase keys to .env.local (see .env.example) to enable sign-up.' : (error.message || 'An error occurred during sign-up. Please try again.'),
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleEmailSignUp}>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="name-signup">Full Name</Label>
                    <Input id="name-signup" type="text" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input id="email-signup" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input id="password-signup" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="role-signup">I am a...</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                        <SelectTrigger id="role-signup">
                            <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="merchant">Merchant (Apply to become a Merchant)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                    <Input id="referral-code" type="text" placeholder="Enter referral code" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <LogIn className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
            </CardFooter>
        </form>
    )
}


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${user.displayName}!`,
        });
        // In a real app, you might check the user's role from your DB and route accordingly.
        // For now, we default to the member homepage.
        router.push('/member/homepage');
      }
    } catch (error: any) {
      const isFirebaseSetup = error?.message === FIREBASE_NOT_CONFIGURED_MSG;
      toast({
        variant: isFirebaseSetup ? 'default' : 'destructive',
        title: isFirebaseSetup ? 'Setup required' : 'Login Failed',
        description: isFirebaseSetup ? 'Add your Firebase keys to .env.local (see .env.example) to enable sign-in.' : 'An error occurred during sign-in. Please try again.',
      });
      if (!isFirebaseSetup) console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-theme flex min-h-screen items-center justify-center relative p-4">
      <AppThemeBackground />
      <Tabs defaultValue="signin" className="w-full max-w-sm relative z-10">
        {!isFirebaseConfigured && (
          <Alert className="mb-4 border-white/20 bg-white/10 text-white [&>svg]:text-cyan-400">
            <Info className="h-4 w-4" />
            <AlertTitle>Sign-in is disabled</AlertTitle>
            <AlertDescription>
              Copy <code className="rounded bg-white/10 px-1 text-xs">.env.example</code> to <code className="rounded bg-white/10 px-1 text-xs">.env.local</code> and add your Firebase keys to enable sign-in.
            </AlertDescription>
          </Alert>
        )}
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-violet-400" />
            <h1 className="text-3xl font-headline font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">LoyaltyLeap</h1>
          </div>
          <CardTitle className="text-white">Welcome</CardTitle>
          <CardDescription className="text-white/70">Sign in or create an account to continue.</CardDescription>
        </CardHeader>
        <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/10">
          <TabsTrigger value="signin" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/80">Sign In</TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/80">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <SignInForm />
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <SignUpForm />
          </Card>
        </TabsContent>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0a0614] px-2 text-white/60">Or continue with</span>
          </div>
        </div>
        <Button onClick={handleGoogleLogin} disabled={isLoading} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 hover:border-white/30">
          {isLoading ? (
            <LogIn className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2c-23.1-21.9-58.6-35.8-96.7-35.8-82.8 0-150.2 67.2-150.2 149.9s67.4 149.9 150.2 149.9c94.2 0 135.3-63.5 140.8-98.2h-140.8v-100h241.8c2.5 14.7 3.8 30 3.8 46.2z"></path></svg>
          )}
          Google
        </Button>
      </Tabs>
    </div>
  );
}

    
