'use client';

import Link from 'next/link';
import { Zap, ArrowRight, Sparkles, Store, Users, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#for-business', label: 'For Merchants' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#about', label: 'About' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0614] text-white overflow-x-hidden">
      {/* Ambient gradient orbs / shades (tawai-style) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[90%] h-[90%] rounded-full bg-violet-600/25 blur-[140px]" />
        <div className="absolute top-[10%] -right-[25%] w-[75%] h-[75%] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[5%] w-[65%] h-[65%] rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="absolute top-[50%] left-[50%] w-[50%] h-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[90px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-headline text-xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">Loyalty</span>
              <span className="text-white">Leap</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              className={cn(
                'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500',
                'text-white font-semibold border-0 hover:opacity-90 hover:shadow-lg hover:shadow-violet-500/25 transition-all'
              )}
              asChild
            >
              <Link href="/login">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-4 pt-20 pb-28 sm:px-6 sm:pt-28 sm:pb-36 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/90 backdrop-blur-sm mb-8">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Loyalty & rewards, reimagined</span>
          </div>

          <h1 className="font-headline text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block text-white">Earn More.</span>
            <span
              className={cn(
                'mt-2 block bg-clip-text text-transparent',
                'bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 landing-gradient-text'
              )}
              style={{ backgroundSize: '200% 200%' }}
            >
              Engage Smarter.
            </span>
            <span
              className={cn(
                'mt-2 block bg-clip-text text-transparent',
                'bg-gradient-to-r from-fuchsia-400 via-rose-400 to-amber-400 landing-gradient-text'
              )}
              style={{ backgroundSize: '200% 200%', animationDelay: '1s' }}
            >
              Loyalty That Leaps.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70 sm:text-xl">
            One platform for members, merchants, and agents. Earn points, run campaigns, and grow with a modern loyalty ecosystem built for scale.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className={cn(
                'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-white font-semibold',
                'hover:opacity-90 hover:shadow-xl hover:shadow-violet-500/30 transition-all h-12 px-8'
              )}
              asChild
            >
              <Link href="/login">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50 px-8"
              asChild
            >
              <Link href="#features">See how it works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 border-t border-white/5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl font-bold text-white sm:text-4xl">
              Everything you need to grow loyalty
            </h2>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              For members, merchants, and agents — one seamless platform.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sparkles,
                title: 'Earn rewards',
                description: 'Members earn points and redeem coupons across a network of merchants.',
                gradient: 'from-violet-500/20 to-fuchsia-500/20',
              },
              {
                icon: Store,
                title: 'For businesses',
                description: 'Merchants run offers, track analytics, and boost customer retention.',
                gradient: 'from-fuchsia-500/20 to-cyan-500/20',
              },
              {
                icon: Users,
                title: 'Referrals & agents',
                description: 'Agents grow their network and earn commissions. Everyone wins.',
                gradient: 'from-cyan-500/20 to-violet-500/20',
              },
              {
                icon: TrendingUp,
                title: 'Real insights',
                description: 'Dashboards, payouts, and loyalty analytics in one place.',
                gradient: 'from-rose-500/20 to-violet-500/20',
              },
            ].map((item) => (
              <div
                key={item.title}
                className={cn(
                  'group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm',
                  'hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300'
                )}
              >
                <div className={cn('mb-4 inline-flex rounded-xl bg-gradient-to-br p-3', item.gradient)}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-headline text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 border-t border-white/5 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-headline text-2xl font-bold text-white sm:text-3xl">How it works</h2>
          <p className="mt-2 text-white/70">Sign up, choose your role, and start in minutes.</p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3 text-left">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <span className="text-2xl font-headline font-bold text-violet-400">1</span>
              <h3 className="mt-2 font-headline font-semibold text-white">Create an account</h3>
              <p className="mt-1 text-sm text-white/70">Sign up as a member, merchant, or agent.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <span className="text-2xl font-headline font-bold text-fuchsia-400">2</span>
              <h3 className="mt-2 font-headline font-semibold text-white">Get started</h3>
              <p className="mt-1 text-sm text-white/70">Onboard and connect your business or profile.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <span className="text-2xl font-headline font-bold text-cyan-400">3</span>
              <h3 className="mt-2 font-headline font-semibold text-white">Earn & grow</h3>
              <p className="mt-1 text-sm text-white/70">Run campaigns, refer others, and track rewards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* For business CTA strip */}
      <section id="for-business" className="relative z-10 border-t border-white/5 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 p-8 sm:p-12 backdrop-blur-sm">
            <Shield className="mx-auto h-12 w-12 text-cyan-400" />
            <h2 className="font-headline mt-4 text-2xl font-bold text-white sm:text-3xl">
              Ready to leap?
            </h2>
            <p className="mt-2 text-white/70">
              Join as a merchant, agent, or member. One account, one platform.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                className={cn(
                  'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-white font-semibold',
                  'hover:opacity-90 hover:shadow-xl hover:shadow-violet-500/30'
                )}
                asChild
              >
                <Link href="/login">
                  Create your account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative z-10 border-t border-white/5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-headline text-2xl font-bold text-white sm:text-3xl">About LoyaltyLeap</h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            A production-ready loyalty platform that brings together members, merchants, and agents. 
            We help businesses reward customers, grow referrals, and run campaigns — all in one modern ecosystem.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-400" />
            <span className="font-headline font-semibold text-white">LoyaltyLeap</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-6xl px-4 text-center text-xs text-white/40">
          © {new Date().getFullYear()} LoyaltyLeap. A production-ready loyalty platform.
        </p>
      </footer>
    </div>
  );
}
